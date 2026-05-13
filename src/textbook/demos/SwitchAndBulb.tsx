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
import { drawBattery, drawSwitch as drawSchematicSwitch } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

interface PathSeg { x1: number; y1: number; x2: number; y2: number }

export function SwitchAndBulbDemo({ figure }: Props) {
  const [closed, setClosed] = useState(false);
  const [_, setTick] = useState(0);
  const closedRef = useRef(closed);
  useEffect(() => { closedRef.current = closed; }, [closed]);

  const closedAtRef = useRef<number | null>(null);
  useEffect(() => {
    if (closed) closedAtRef.current = performance.now();
    else closedAtRef.current = null;
  }, [closed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw(now: number) {
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Layout — battery at left, switch in middle-top, bulb at right.
      const margin = 60;
      const top = h * 0.30;
      const bot = h * 0.78;
      const batX = margin;
      const bulbX = w - margin;
      const switchX = (batX + bulbX) / 2;

      // Path is a rectangle: battery+ → up → right to switch → right to bulb → down → left → battery−.
      // Segments, ordered as the wave travels (battery+ → out → bulb → return).
      const segs: PathSeg[] = [
        { x1: batX, y1: top, x2: switchX, y2: top },     // battery top → switch (left half of top)
        { x1: switchX, y1: top, x2: bulbX, y2: top },    // switch → bulb top (right half of top)
        { x1: bulbX, y1: top, x2: bulbX, y2: bot },      // down through bulb
        { x1: bulbX, y1: bot, x2: batX, y2: bot },       // back along bottom
      ];
      const segLens = segs.map(s => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
      const totalLen = segLens.reduce((a, b) => a + b, 0);

      // Wire colour — amber when energised, dim when not.
      const isClosed = closedRef.current;
      const sinceClose = closedAtRef.current != null ? (now - closedAtRef.current) / 1000 : 0;
      // Visual: wave fills the loop in ~0.4 s of wallclock. In reality, ~5 ns.
      const fillFrac = isClosed ? Math.min(1, sinceClose / 0.4) : 0;
      const fillLen = fillFrac * totalLen;

      // Draw base wire (dim) for everything
      ctx.strokeStyle = 'rgba(160,158,149,.25)';
      ctx.lineWidth = 4;
      for (const s of segs) {
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
      }

      // Overlay the energised portion in amber
      if (fillLen > 0) {
        ctx.strokeStyle = '#ff6b2a';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(255,107,42,.6)';
        ctx.shadowBlur = 8;
        let remaining = fillLen;
        for (let i = 0; i < segs.length && remaining > 0; i++) {
          const s = segs[i];
          const L = segLens[i];
          const take = Math.min(remaining, L);
          const tx = s.x1 + (s.x2 - s.x1) * (take / L);
          const ty = s.y1 + (s.y2 - s.y1) * (take / L);
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(tx, ty); ctx.stroke();
          remaining -= take;
        }
        ctx.shadowBlur = 0;
      }

      // Battery
      drawBattery(ctx, { x: batX, y: (top + bot) / 2 }, {
        color: 'rgba(255,255,255,.18)',
        label: 'battery',
        labelOffset: { x: 0, y: (bot - top) / 2 + 18 },
        leadLength: (bot - top) / 2,
        negativeColor: '#ecebe5',
        negativePlateLength: 16,
        plateGap: (bot - top) / 2,
        positiveColor: '#ecebe5',
        positivePlateLength: 28,
      });
      ctx.fillStyle = '#ff3b6e';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', batX - 18, top);
      ctx.fillStyle = '#5baef8';
      ctx.fillText('−', batX - 12, bot);

      // Switch — a hinge (open) or a closed bridge
      drawSchematicSwitch(ctx, { x: switchX, y: top }, {
        color: isClosed ? '#ff6b2a' : '#ecebe5',
        label: 'switch',
        state: isClosed ? 'closed' : 'open-up',
        terminalGap: 32,
      });

      // Bulb
      const bulbY = (top + bot) / 2;
      const bulbGlow = isClosed && fillFrac >= 1 ? 1 : 0;
      drawBulb(ctx, bulbX, bulbY, bulbGlow);

      // Annotations
      ctx.fillStyle = isClosed ? '#ff6b2a' : 'rgba(160,158,149,.55)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        isClosed
          ? 'field propagates at ~⅔ c · reaches bulb in ~5 ns'
          : 'switch open — no field, no current',
        w / 2, h - 32,
      );
      ctx.fillStyle = 'rgba(91,174,248,.7)';
      ctx.fillText(
        'an electron starting at the switch would take ~10 hours to reach the bulb',
        w / 2, h - 14,
      );

      setTick(t => (t + 1) % 1000);
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
      caption={<>
        Click the switch closed. The amber wave is the electromagnetic field propagating around the loop at roughly two-thirds the speed of light — it reaches the bulb in nanoseconds. The electrons in the filament were already there; they begin drifting in place the moment the field arrives. Nothing had to travel from the switch to the bulb.
      </>}
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle label={closed ? 'switch CLOSED' : 'switch OPEN'} checked={closed} onChange={setClosed} />
        <MiniReadout label="signal travel time" value={closed ? '~5' : '—'} unit="ns" />
        <MiniReadout label="electron travel time" value={closed ? '~10' : '—'} unit="hours" />
      </DemoControls>
    </Demo>
  );
}

function drawBulb(ctx: CanvasRenderingContext2D, x: number, y: number, glow: number) {
  // Glow halo when on
  if (glow > 0) {
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 60);
    grd.addColorStop(0, `rgba(255,200,80,${0.45 * glow})`);
    grd.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI * 2); ctx.fill();
  }
  // Bulb circle
  ctx.strokeStyle = glow > 0 ? '#ffcc55' : 'rgba(160,158,149,.55)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.stroke();
  // Filament (a little zigzag)
  ctx.strokeStyle = glow > 0 ? '#ff8c1e' : 'rgba(160,158,149,.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 4);
  ctx.lineTo(x - 4, y - 4);
  ctx.lineTo(x, y + 4);
  ctx.lineTo(x + 4, y - 4);
  ctx.lineTo(x + 8, y + 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(160,158,149,.7)';
  ctx.font = '10px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.fillText('bulb', x, y + 32);
}
