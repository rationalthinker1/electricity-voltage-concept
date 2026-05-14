/**
 * Demo D7.5 — Radiation pressure
 *
 * EM waves carry momentum p = U/c (energy U → momentum U/c). When the wave
 * is fully absorbed, this becomes a pressure P = I/c on the absorbing
 * surface (or 2I/c for a perfect reflector).
 *
 * Visual: a stream of wave-packets travelling from the left and being
 * absorbed by a small target on the right. The target inches rightward at
 * a (massively exaggerated) speed so the radiation pressure is visible.
 * Readouts: real I (in W/m²) and real P = I/c (in Pa).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

interface Packet {
  x: number;
  amp: number;
}

export function RadiationPressureDemo({ figure }: Props) {
  // Intensity in W/m². Default ≈ solar constant.
  const [I, setI] = useState(1361);

  const P = I / PHYS.c;          // pressure for full absorption, Pa
  const P_refl = 2 * I / PHYS.c; // perfect reflector, for the readout

  const stateRef = useRef({ I });
  useEffect(() => { stateRef.current = { I }; }, [I]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    const packets: Packet[] = [];
    let targetX = W * 0.62;        // target position (visual only)
    let spawnAcc = 0;

    function draw() {
      const { I } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const cy = H / 2;
      const xL = 30;

      // Spawn rate scales mildly with intensity (sub-linear so it stays readable)
      const rate = 0.06 + Math.log10(I + 10) * 0.08;
      spawnAcc += rate;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        packets.push({ x: xL, amp: 0.5 + Math.random() * 0.6 });
      }

      // Wave-packets fly right
      const speed = 2.8;
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]!;
        p.x += speed;
        if (p.x > targetX - 4) {
          // Absorbed — remove and nudge target right
          packets.splice(i, 1);
          // Visual push proportional to wave-packet amplitude (≈ energy)
          targetX += 0.06 * p.amp * (1 + Math.log10(I + 1) * 0.15);
          continue;
        }
        drawPacket(ctx, p.x, cy, p.amp);
      }

      // Target
      const targetTop = cy - 56;
      const targetBot = cy + 56;
      const targetW = 18;
      ctx.fillStyle = 'rgba(160,158,149,0.18)';
      ctx.fillRect(targetX, targetTop, targetW, targetBot - targetTop);
      ctx.strokeStyle = 'rgba(160,158,149,0.85)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(targetX, targetTop, targetW, targetBot - targetTop);
      // Force arrow on the target — small, but consistently rightward
      const armLen = 22 + Math.log10(I + 10) * 6;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.fillStyle = getCanvasColors().accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetX + targetW + 2, cy);
      ctx.lineTo(targetX + targetW + armLen, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(targetX + targetW + armLen, cy);
      ctx.lineTo(targetX + targetW + armLen - 8, cy - 5);
      ctx.lineTo(targetX + targetW + armLen - 8, cy + 5);
      ctx.closePath(); ctx.fill();

      // Drift target back if it has wandered far (kept on-screen)
      if (targetX > W - 80) targetX = W * 0.62;

      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.textAlign = 'left';
      ctx.fillText('absorbing target · feels P = I/c', targetX - 80, targetTop - 8);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('EM wave packets →', xL, 22);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 7.5'}
      title="Radiation pressure"
      question="If light has momentum, what does it push on?"
      caption={<>
        A stream of wave-packets travelling rightward into an absorbing target. Each packet
        carries momentum <strong>p = U/c</strong>; the target absorbs them and the total push per
        unit area is <strong>P = I/c</strong>. At Earth's solar constant <em>I ≈ 1361 W/m²</em> this
        is about <strong>4.5 µPa</strong> — real, measured by the Crookes-radiometer descendants,
        and large enough to drive a solar sail given a few months and a few hundred square metres.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="intensity I"
          value={I} min={1} max={1e6} step={1}
          format={v => v >= 1000 ? (v / 1000).toFixed(1) + ' kW/m²' : v.toFixed(0) + ' W/m²'}
          onChange={setI}
        />
        <MiniReadout label="absorber pressure P = I/c" value={<Num value={P} />} unit="Pa" />
        <MiniReadout label="reflector pressure 2I/c" value={<Num value={P_refl} />} unit="Pa" />
      </DemoControls>
    </Demo>
  );
}

function drawPacket(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, amp: number,
) {
  const W = 22;
  ctx.strokeStyle = `rgba(255,107,42,${0.4 + amp * 0.5})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = -W; i <= W; i++) {
    const env = Math.exp(-(i * i) / 80);
    const y = cy - Math.sin(i * 0.7) * env * 14 * amp;
    if (i === -W) ctx.moveTo(cx + i, y); else ctx.lineTo(cx + i, y);
  }
  ctx.stroke();
}
