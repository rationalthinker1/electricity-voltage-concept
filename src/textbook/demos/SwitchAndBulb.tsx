/**
 * Demo D2.4 — Switch, wire, bulb
 *
 * Top-down circuit: battery (left) → wire up + across → switch in the
 * middle → wire across + down → bulb (right) → wire back to battery.
 *
 * Reader toggles the switch closed. An amber wave starts at the battery
 * and propagates around the loop in ~5 frames, reaching the bulb almost
 * instantly. The bulb begins glowing the moment the field arrives.
 *
 * Two annotations:
 *   "field propagates at ~⅔ c — reaches bulb in ~5 ns"
 *   "an electron at the switch would take ~10 hours to reach the bulb"
 *
 * Both numbers are pinned: signal speed from libretexts-conduction;
 * drift transit estimated from v_d ≈ 0.03 mm/s for a typical Cu wire.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';
import { drawCircuit, renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

interface PathSeg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Manual offscreen-canvas cache for the static schematic.
 *
 * Per MDN's canvas optimisation guide, the cheapest way to drop per-frame
 * cost on a mostly-static drawing is to bake it once into an offscreen
 * HTMLCanvasElement, then drawImage that onto the visible canvas each tick.
 * Recompute only when the cache key changes (resize, DPR change, or — for
 * this demo — switch-state / bulb-glow transitions).
 */
interface StaticCacheEntry {
  key: string;
  canvas: HTMLCanvasElement;
}

export function SwitchAndBulbDemo({ figure }: Props) {
  const [closed, setClosed] = useState(false);
  const [_, setTick] = useState(0);
  const closedRef = useRef(closed);
  useEffect(() => {
    closedRef.current = closed;
  }, [closed]);

  const closedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (closed) closedAtRef.current = performance.now();
    else closedAtRef.current = null;
  }, [closed]);

  const cacheRef = useRef<StaticCacheEntry | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;

    function draw(now: number) {
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Layout — battery at left, switch in middle-top, bulb at right.
      const margin = 60;
      const top = h * 0.3;
      const bot = h * 0.78;
      const batX = margin;
      const bulbX = w - margin;
      const switchX = (batX + bulbX) / 2;
      const bulbY = (top + bot) / 2;

      const isClosed = closedRef.current;
      const sinceClose = closedAtRef.current != null ? (now - closedAtRef.current) / 1000 : 0;
      // Visual: wave fills the loop in ~0.4 s of wallclock. In reality, ~5 ns.
      const fillFrac = isClosed ? Math.min(1, sinceClose / 0.4) : 0;
      const bulbOn = isClosed && fillFrac >= 1;

      // Cache key for the static schematic: changes only when w/h/dpr or one
      // of the discrete display states (switch closed, bulb glowing) flips.
      const cacheKey = `${w}x${h}@${dpr}|c${isClosed ? 1 : 0}|g${bulbOn ? 1 : 0}`;
      if (cacheRef.current?.key !== cacheKey) {
        const staticElements: CircuitElement[] = [
          // Dim base loop (one polyline closing back to the start).
          {
            kind: 'wire',
            points: [
              { x: batX, y: top },
              { x: bulbX, y: top },
              { x: bulbX, y: bot },
              { x: batX, y: bot },
            ],
            color: 'rgba(160,158,149,.25)',
            lineWidth: 4,
          },
          // Battery on the left (vertical), tall enough to touch top + bot rails.
          {
            kind: 'battery',
            at: { x: batX, y: bulbY },
            color: 'rgba(255,255,255,.18)',
            label: 'battery',
            labelOffset: { x: 0, y: (bot - top) / 2 + 18 },
            leadLength: (bot - top) / 2,
            negativeColor: '#ecebe5',
            negativePlateLength: 16,
            plateGap: (bot - top) / 2,
            positiveColor: '#ecebe5',
            positivePlateLength: 28,
          },
          // Switch on the top rail.
          {
            kind: 'switch',
            at: { x: switchX, y: top },
            color: isClosed ? '#ff6b2a' : '#ecebe5',
            label: 'switch',
            state: isClosed ? 'closed' : 'open-up',
            terminalGap: 32,
          },
          // Bulb on the right side, glowing when the wave reaches it.
          {
            kind: 'bulb',
            at: { x: bulbX, y: bulbY },
            radius: 16,
            brightness: bulbOn ? 1 : 0,
            label: 'bulb',
            labelOffset: { x: 0, y: 32 },
          },
        ];
        cacheRef.current = {
          key: cacheKey,
          canvas: renderCircuitToCanvas({ elements: staticElements }, w, h, dpr),
        };
      }
      // One drawImage replaces ~12 strokes/fills per frame.
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // Loop path, ordered so we can split it into a "dim base" plus an "energised prefix".
      const loop: PathSeg[] = [
        { x1: batX, y1: top, x2: switchX, y2: top }, // battery top → switch
        { x1: switchX, y1: top, x2: bulbX, y2: top }, // switch → bulb
        { x1: bulbX, y1: top, x2: bulbX, y2: bot }, // down past bulb
        { x1: bulbX, y1: bot, x2: batX, y2: bot }, // return along bottom
      ];
      const segLens = loop.map((s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
      const totalLen = segLens.reduce((a, b) => a + b, 0);
      const fillLen = fillFrac * totalLen;

      // Energised polyline = the prefix of the loop covered by fillLen.
      const energised: { x: number; y: number }[] = [];
      if (fillLen > 0) {
        energised.push({ x: loop[0]!.x1, y: loop[0]!.y1 });
        let remaining = fillLen;
        for (let i = 0; i < loop.length && remaining > 0; i++) {
          const s = loop[i]!;
          const L = segLens[i]!;
          const take = Math.min(remaining, L);
          energised.push({
            x: s.x1 + (s.x2 - s.x1) * (take / L),
            y: s.y1 + (s.y2 - s.y1) * (take / L),
          });
          remaining -= take;
        }
      }

      // Energised overlay drawn on top of the cached backdrop.
      if (energised.length > 1) {
        ctx.save();
        ctx.shadowColor = 'rgba(255,107,42,.6)';
        ctx.shadowBlur = 8;
        drawCircuit(ctx, {
          elements: [{ kind: 'wire', points: energised, color: '#ff6b2a', lineWidth: 4 }],
        });
        ctx.restore();
      }

      // Polarity glyphs hugging the battery's two leads.
      ctx.fillStyle = getCanvasColors().pink;
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', batX - 18, top);
      ctx.fillStyle = getCanvasColors().blue;
      ctx.fillText('−', batX - 12, bot);

      // Annotations
      ctx.fillStyle = isClosed ? '#ff6b2a' : 'rgba(160,158,149,.55)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        isClosed
          ? 'field propagates at ~⅔ c · reaches bulb in ~5 ns'
          : 'switch open — no field, no current',
        w / 2,
        h - 32,
      );
      ctx.fillStyle = 'rgba(91,174,248,.7)';
      ctx.fillText(
        'an electron starting at the switch would take ~10 hours to reach the bulb',
        w / 2,
        h - 14,
      );

      setTick((t) => (t + 1) % 1000);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
        <MiniReadout label="electron travel time" value={closed ? '~10' : '—'} unit="hours" />
      </DemoControls>
    </Demo>
  );
}
