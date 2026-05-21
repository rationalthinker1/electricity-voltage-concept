/**
 * Demo D2.4 — Switch, wire, bulb
 *
 * Top-down circuit: battery (left) → wire up + across → switch in the
 * middle → wire across + down → bulb (right) → wire back to battery.
 *
 * Reader toggles the switch closed. An amber wave starts at the battery
 * and propagates around the loop in ~5 frames, reaching the bulb almost
 * instantly. The bulb begins glowing the moment the field arrives.
 */
import { useEffect, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

interface PathSeg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface SimState {
  closed: boolean;
}

interface SimContext {
  closedAtSimTime: number | null;
}

const FILL_DURATION = 0.4; // seconds for the energised wave to traverse the loop

export function SwitchAndBulbDemo({ figure }: Props) {
  const [closed, setClosed] = useState(false);
  // bulbOn is React state so it can drive a useCircuitCache dep. It flips on
  // 400 ms after the switch closes (matching the energised-wave traversal in
  // the per-frame overlay) and snaps off the moment the switch opens.
  const [bulbOn, setBulbOn] = useState(false);

  useEffect(() => {
    if (!closed) {
      setBulbOn(false);
      return;
    }
    const id = window.setTimeout(() => setBulbOn(true), FILL_DURATION * 1000);
    return () => window.clearTimeout(id);
  }, [closed]);

  const stateRef = useSimState({ closed });

  const getStatic = useCircuitCache(
    (sw, sh, _dpr) => {
      const colors = getCanvasColors();
      const margin = 60;
      const top = sh * 0.3;
      const bot = sh * 0.78;
      const batX = margin;
      const bulbX = sw - margin;
      const switchX = (batX + bulbX) / 2;
      const bulbY = (top + bot) / 2;
      const elements: CircuitElement[] = [
        {
          kind: 'wire',
          points: [
            { x: batX, y: top },
            { x: bulbX, y: top },
            { x: bulbX, y: bot },
            { x: batX, y: bot },
          ],
          color: withAlpha(colors.textDim, 0.25),
          lineWidth: 4,
        },
        {
          kind: 'battery',
          at: { x: batX, y: bulbY },
          color: withAlpha(colors.text, 0.18),
          label: 'battery',
          labelOffset: { x: 0, y: (bot - top) / 2 + 18 },
          leadLength: (bot - top) / 2,
          negativeColor: colors.text,
          negativePlateLength: 16,
          plateGap: (bot - top) / 2,
          positiveColor: colors.text,
          positivePlateLength: 28,
        },
        {
          kind: 'switch',
          at: { x: switchX, y: top },
          color: closed ? colors.accent : colors.text,
          label: 'switch',
          state: closed ? 'closed' : 'open-up',
          terminalGap: 32,
        },
        {
          kind: 'bulb',
          at: { x: bulbX, y: bulbY },
          radius: 16,
          brightness: bulbOn ? 1 : 0,
          label: 'bulb',
          labelOffset: { x: 0, y: 32 },
        },
      ];
      return { elements };
    },
    [closed, bulbOn],
  );

  const setup = useSimLoop<SimState, SimContext>(
    stateRef,
    ({ ctx, w, h, colors, dpr }, _state, _dt, simTime, ctx_) => {
      const s = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout
      const margin = 60;
      const top = h * 0.3;
      const bot = h * 0.78;
      const batX = margin;
      const bulbX = w - margin;
      const switchX = (batX + bulbX) / 2;

      // Track when switch was closed (in simTime) — drives the energised
      // wave's per-frame `fillFrac`. Independent of the React-state bulbOn
      // flip; the two stay within a frame of each other in practice.
      if (s.closed && ctx_.closedAtSimTime === null) {
        ctx_.closedAtSimTime = simTime;
      }
      if (!s.closed) {
        ctx_.closedAtSimTime = null;
      }
      const sinceClose = ctx_.closedAtSimTime != null ? simTime - ctx_.closedAtSimTime : 0;
      const fillFrac = s.closed ? Math.min(1, sinceClose / FILL_DURATION) : 0;

      const off = getStatic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Energised overlay
      const loop: PathSeg[] = [
        { x1: batX, y1: top, x2: switchX, y2: top },
        { x1: switchX, y1: top, x2: bulbX, y2: top },
        { x1: bulbX, y1: top, x2: bulbX, y2: bot },
        { x1: bulbX, y1: bot, x2: batX, y2: bot },
      ];
      const segLens = loop.map((s_) => Math.hypot(s_.x2 - s_.x1, s_.y2 - s_.y1));
      const totalLen = segLens.reduce((a, b) => a + b, 0);
      const fillLen = fillFrac * totalLen;

      const energised: { x: number; y: number }[] = [];
      if (fillLen > 0) {
        energised.push({ x: loop[0]!.x1, y: loop[0]!.y1 });
        let remaining = fillLen;
        for (let i = 0; i < loop.length && remaining > 0; i++) {
          const seg = loop[i]!;
          const L = segLens[i]!;
          const take = Math.min(remaining, L);
          energised.push({
            x: seg.x1 + (seg.x2 - seg.x1) * (take / L),
            y: seg.y1 + (seg.y2 - seg.y1) * (take / L),
          });
          remaining -= take;
        }
      }

      if (energised.length > 1) {
        ctx.save();
        ctx.shadowColor = withAlpha(colors.accent, 0.6);
        ctx.shadowBlur = 8;
        drawCircuit(ctx, {
          elements: [{ kind: 'wire', points: energised, color: colors.accent, lineWidth: 4 }],
        });
        ctx.restore();
      }

      // Polarity glyphs
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: '+', x: batX - 18, y: top, color: colors.pink, weight: 'bold', size: 11, font: '11px "JetBrains Mono"', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '−', x: batX - 12, y: bot, color: colors.blue, weight: 'bold', size: 11, font: '11px "JetBrains Mono"', align: 'right', baseline: 'middle' });

      // Annotations
      ctx.fillStyle = s.closed ? colors.accent : withAlpha(colors.textDim, 0.55);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      drawLabel(ctx, { text: s.closed
                  ? 'field propagates at ~⅔ c · reaches bulb in ~5 ns'
                  : 'switch open — no field, no current', x: w / 2, y: h - 32, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      ctx.fillStyle = withAlpha(colors.blue, 0.7);
      drawLabel(ctx, { text: 'an electron starting at the switch would take ~13 hours to reach the bulb', x: w / 2, y: h - 14, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
    },
    [],
    () => ({ context: { closedAtSimTime: null } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 2.4'}
      title="What actually lights the bulb"
      question="You flip the switch. Why does the bulb come on instantly?"
      caption={
        <>
          Click the switch closed. The amber wave is the electromagnetic field propagating around
          the loop at roughly two-thirds the speed of light — it reaches the bulb in nanoseconds.
          The electrons in the filament were already there; they begin drifting in place the moment
          the field arrives. Nothing had to travel from the switch to the bulb.
        </>
      }
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={closed ? 'switch CLOSED' : 'switch OPEN'}
          checked={closed}
          onChange={setClosed}
        />
        <MiniReadout label="signal travel time" value={closed ? '~5' : '—'} unit="ns" />
        <MiniReadout label="electron travel time" value={closed ? '~13' : '—'} unit="hours" />
      </DemoControls>
    </Demo>
  );
}
