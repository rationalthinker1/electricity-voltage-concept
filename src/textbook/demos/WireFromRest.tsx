/**
 * Demo D9.1 — A current-carrying wire seen from the lab frame
 *
 * Top-down view. A long horizontal wire shown as a strip down the middle.
 * Two interleaved rows of charges along the wire:
 *   • positive lattice ions (pink, "+") at rest in the lab frame
 *   • conduction electrons (blue, "−") drifting rightward with velocity v_d
 * Above the wire: a single positive test charge at rest in this frame.
 *
 * In this frame the ion density equals the electron density, so the wire is
 * electrically neutral — total E from the wire is zero. The test charge is
 * also at rest (v = 0), so the magnetic Lorentz force F = q v × B = 0.
 * Result: the test charge feels no force at all.
 *
 * Toggles let the reader hide ions / electrons / test charge separately so
 * they can convince themselves the neutrality is symmetric. The drift
 * velocity slider is visually exaggerated (real v_d is mm/s) so the motion
 * is visible. The readout shows the *real* expected magnetic force as zero
 * because v_test = 0.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

export function WireFromRestDemo({ figure }: Props) {
  const [vd, setVd] = useState(0.6); // visual drift, 0..1 (unitless)
  const [q, setQ] = useState(1.0); // test charge in nC (just for label)
  const [showIons, setShowIons] = useState(true);
  const [showElectrons, setShowElectrons] = useState(true);
  const [showTest, setShowTest] = useState(true);

  const stateRef = useRef({ vd, showIons, showElectrons, showTest });
  useEffect(() => {
    stateRef.current = { vd, showIons, showElectrons, showTest };
  }, [vd, showIons, showElectrons, showTest]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let last = performance.now();
    let phase = 0;

    const N = 22; // number of ion/electron pairs along the wire

    function draw() {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      phase += dt * s.vd * 60; // visual drift in px/s

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // ─── Geometry
      const wireY = h * 0.65;
      const wireH = 70;
      const wireTop = wireY - wireH / 2;
      const wireBot = wireY + wireH / 2;
      const margin = 30;
      const wireXL = margin;
      const wireXR = w - margin;
      const wireLen = wireXR - wireXL;

      // ─── Wire body
      const grd = ctx.createLinearGradient(0, wireTop, 0, wireBot);
      grd.addColorStop(0, withAlpha(colors.accent, 0.06));
      grd.addColorStop(0.5, withAlpha(colors.accent, 0.16));
      grd.addColorStop(1, withAlpha(colors.accent, 0.06));
      ctx.fillStyle = grd;
      ctx.fillRect(wireXL, wireTop, wireLen, wireH);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(wireXL, wireTop, wireLen, wireH);

      // ─── Ions (pink, stationary)
      if (s.showIons) {
        for (let i = 0; i < N; i++) {
          const x = wireXL + (i + 0.5) * (wireLen / N);
          const y = wireY - 14;
          ctx.fillStyle = colors.pink;
          drawHalo(ctx, {
            x: x,
            y: y,
            radius: 12,
            color: colors.pink,
            alpha: 0.55,
            extent: 1,
          });
          ctx.fillStyle = colors.pink;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          drawLabel(ctx, {
            x: x,
            y: y,
            text: '+',
            color: colors.bg,
            size: 8,
            align: 'center',
            baseline: 'middle',
            weight: 'bold',
          });
        }
      }

      // ─── Electrons (blue, drifting right)
      if (s.showElectrons) {
        for (let i = 0; i < N; i++) {
          const base = (i + 0.5) * (wireLen / N);
          // drift visually: add phase, wrap around within wire length
          const offset = (((base + phase) % wireLen) + wireLen) % wireLen;
          const x = wireXL + offset;
          const y = wireY + 14;
          drawHalo(ctx, {
            x: x,
            y: y,
            radius: 12,
            color: colors.blue,
            alpha: 0.55,
            extent: 1,
          });
          ctx.fillStyle = colors.blue;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          drawLabel(ctx, {
            x: x,
            y: y,
            text: '−',
            color: colors.bg,
            size: 9,
            align: 'center',
            baseline: 'middle',
            weight: 'bold',
          });
        }
      }

      // ─── Current direction label
      drawLabel(ctx, {
        x: wireXR,
        y: wireBot + 18,
        text: 'I →   (electrons drift, ions fixed)',
        color: colors.accent,
        align: 'right',
      });

      // ─── Test charge — at rest above the wire
      if (s.showTest) {
        const tx = w * 0.5;
        const ty = h * 0.22;
        // halo
        drawHalo(ctx, {
          x: tx,
          y: ty,
          radius: 22,
          color: colors.accent,
          alpha: 0.55,
          extent: 1,
        });
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(tx, ty, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = colors.bg;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', tx, ty);

        // "v = 0" label
        drawLabel(ctx, {
          x: tx,
          y: ty - 26,
          text: 'test charge   v = 0',
          color: colors.text,
        });

        // "F = 0" marker (no arrow)
        drawLabel(ctx, {
          x: tx,
          y: ty + 36,
          text: 'F = q v × B = 0',
          color: colors.teal,
          size: 11,
        });
      }

      // ─── Frame label
      drawLabel(ctx, {
        x: 14,
        y: 18,
        text: 'LAB FRAME · wire neutral, test charge at rest',
        color: withAlpha(colors.textDim, 0.75),
      });

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 9.1'}
      title="The wire from the lab frame"
      question="A wire carries current. A test charge sits next to it, motionless. Does it feel a force?"
      caption={
        <>
          In the lab frame, equal densities of positive ions and drifting electrons make the wire
          <em> electrically neutral</em> — no net E field outside the wire. The test charge is at
          rest, so the magnetic Lorentz force <em>F = q v × B</em> also vanishes.{' '}
          <strong>Zero force.</strong> So far, there's nothing to explain.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniToggle label="ions +" checked={showIons} onChange={setShowIons} />
        <MiniToggle label="electrons −" checked={showElectrons} onChange={setShowElectrons} />
        <MiniToggle label="test charge" checked={showTest} onChange={setShowTest} />
        <MiniSlider
          label="v_d (visual)"
          value={vd}
          min={0.05}
          max={1.4}
          step={0.01}
          format={(v) => v.toFixed(2) + '×'}
          onChange={setVd}
        />
        <MiniSlider
          label="q test"
          value={q}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' nC'}
          onChange={setQ}
        />
        <MiniReadout label="net linear λ" value={<Num value={0} />} unit="C/m" />
        <MiniReadout label="F on test q" value={<Num value={0} />} unit="N" />
      </DemoControls>
    </Demo>
  );
}
