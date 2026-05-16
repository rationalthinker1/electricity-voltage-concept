/**
 * Demo D7.5b — Rotating coil in 3D, showing the cos(θ) projection geometry
 *
 * Companion to the 2D RotatingCoilDemo. A rectangular wire loop spins
 * around the vertical (y) axis inside a uniform horizontal B-field
 * pointing in +x. The reader can drag to orbit the camera.
 *
 * Renders, in painter order:
 *   1. Background grid of small B-field arrows (the uniform field).
 *   2. Translucent flux disc filling the loop's face; opacity tracks |cos θ|
 *      and tint flips between amber (positive Φ) and blue (negative Φ).
 *   3. The four edges of the rotating rectangular loop.
 *   4. The coil's normal vector n̂ as a teal arrow from origin.
 *
 * Beneath the 3D scene (bottom 25% of the canvas) a 2D rolling plot shows
 * Φ_B(t) = B·A·cos(ωt) and ε(t) = −dΦ/dt = B·A·ω·sin(ωt) on a shared
 * time axis, scrolling right→left. Seeing the two curves shifted by π/2
 * makes the time-derivative relationship visible directly.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { attachOrbit, project, type OrbitCamera, type Vec3 } from '@/lib/projection3d';

interface Props {
  figure?: string;
}

// Loop geometry in local (un-rotated) coordinates. The loop lies in the
// y–z plane initially (normal along +x); after rotating by θ around y,
// the normal sweeps through the x–z plane.
const LOOP_W = 1.0; // half-width along z (so full width = 2)
const LOOP_H = 0.5; // half-height along y (so full height = 1)
const LOOP_AREA = 2 * LOOP_W * (2 * LOOP_H); // = 2 (normalised units)

export function RotatingCoilFlux3DDemo({ figure }: Props) {
  const [omega, setOmega] = useState(1.2); // rad/s (visual)
  const [B, setB] = useState(1.0); // normalised
  const [showDisc, setShowDisc] = useState(true);
  const [showNormal, setShowNormal] = useState(true);
  const [, setTick] = useState(0);

  const stateRef = useRef({ omega, B, showDisc, showNormal, t: 0, theta: 0 });
  useEffect(() => {
    stateRef.current.omega = omega;
    stateRef.current.B = B;
    stateRef.current.showDisc = showDisc;
    stateRef.current.showNormal = showNormal;
  }, [omega, B, showDisc, showNormal]);

  const camRef = useRef<OrbitCamera>({
    yaw: 0.6,
    pitch: 0.25,
    distance: 6,
    fov: Math.PI / 4,
  });

  // Live readouts (rendered outside the canvas).
  const [readouts, setReadouts] = useState({ phi: 0, emf: 0 });
  const readoutsTimer = useRef(0);

  const phiMax = useMemo(() => B * LOOP_AREA, [B]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    const dispose = attachOrbit(canvas, camRef.current);
    let raf = 0;
    let lastReal = performance.now();
    // Rolling scope buffer.
    const SCOPE_SECONDS = 6;
    const scope: { t: number; phi: number; emf: number }[] = [];

    function rotY(p: Vec3, theta: number): Vec3 {
      const c = Math.cos(theta),
        s = Math.sin(theta);
      return { x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c };
    }

    function drawArrow3D(
      from: Vec3,
      to: Vec3,
      color: string,
      lineWidth: number,
      cam: OrbitCamera,
      cw: number,
      ch: number,
    ) {
      const p0 = project(from, cam, cw, ch);
      const p1 = project(to, cam, cw, ch);
      if (p0.depth <= 0 || p1.depth <= 0) return;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      // Arrow head in 2D screen space.
      const dx = p1.x - p0.x,
        dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy);
      if (len < 1e-3) return;
      const ux = dx / len,
        uy = dy / len;
      const headLen = Math.min(8, len * 0.5);
      const headW = headLen * 0.55;
      const baseX = p1.x - ux * headLen;
      const baseY = p1.y - uy * headLen;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(baseX - uy * headW, baseY + ux * headW);
      ctx.lineTo(baseX + uy * headW, baseY - ux * headW);
      ctx.closePath();
      ctx.fill();
    }

    function draw() {
      const cam = camRef.current;
      const st = stateRef.current;
      const now = performance.now();
      let dt = (now - lastReal) / 1000;
      lastReal = now;
      if (dt > 0.1) dt = 0.1;
      st.t += dt;
      st.theta += dt * st.omega;
      const theta = st.theta;

      const phi = st.B * LOOP_AREA * Math.cos(theta);
      const emf = st.B * LOOP_AREA * st.omega * Math.sin(theta);

      scope.push({ t: st.t, phi, emf });
      const tCut = st.t - SCOPE_SECONDS;
      while (scope.length > 0 && scope[0]!.t < tCut) scope.shift();

      // Throttle React state updates for the live readouts (every 4 frames).
      readoutsTimer.current = (readoutsTimer.current + 1) % 4;
      if (readoutsTimer.current === 0) setReadouts({ phi, emf });

      // ───── background ─────
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const sceneH = h * 0.72; // top region for the 3D scene
      const plotY0 = sceneH;
      const plotH = h - plotY0;

      // Scene clipping region (so projection that runs past it doesn't
      // overdraw the plot strip below).
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, sceneH);
      ctx.clip();

      // ───── 1. B-field arrow grid (background) ─────
      // 3×3×3 grid of arrows pointing in +x.
      const gridArrows: { from: Vec3; to: Vec3; depthAvg: number }[] = [];
      const gridStep = 0.9;
      const gridHalf = 1;
      const arrowLen = 0.32 * Math.max(0.2, st.B);
      for (let ix = -gridHalf; ix <= gridHalf; ix++) {
        for (let iy = -gridHalf; iy <= gridHalf; iy++) {
          for (let iz = -gridHalf; iz <= gridHalf; iz++) {
            // Skip arrows that would clutter the loop interior.
            if (Math.abs(ix) <= 0 && Math.abs(iy) <= 0 && Math.abs(iz) <= 0) continue;
            const from: Vec3 = {
              x: ix * gridStep - arrowLen / 2,
              y: iy * gridStep,
              z: iz * gridStep,
            };
            const to: Vec3 = {
              x: ix * gridStep + arrowLen / 2,
              y: iy * gridStep,
              z: iz * gridStep,
            };
            const pa = project(from, cam, w, sceneH);
            const pb = project(to, cam, w, sceneH);
            gridArrows.push({ from, to, depthAvg: (pa.depth + pb.depth) / 2 });
          }
        }
      }
      gridArrows.sort((a, b) => b.depthAvg - a.depthAvg);
      for (const ga of gridArrows) {
        // Fade with depth so far arrows recede.
        const fade = Math.max(0.12, Math.min(0.55, 1 - (ga.depthAvg - 3) * 0.12));
        const alpha = 0.18 + 0.4 * fade * Math.min(1, st.B);
        drawArrow3D(ga.from, ga.to, `rgba(108,197,194,${alpha.toFixed(3)})`, 1, cam, w, sceneH);
      }

      // ───── 2. Translucent flux disc (the loop's face) ─────
      // Four corners of the loop in local coords (y–z plane), normal = +x.
      const localCorners: Vec3[] = [
        { x: 0, y: -LOOP_H, z: -LOOP_W },
        { x: 0, y: -LOOP_H, z: LOOP_W },
        { x: 0, y: LOOP_H, z: LOOP_W },
        { x: 0, y: LOOP_H, z: -LOOP_W },
      ];
      const cornersWorld = localCorners.map((c) => rotY(c, theta));
      const cornersScreen = cornersWorld.map((c) => project(c, cam, w, sceneH));

      if (st.showDisc && cornersScreen.every((p) => p.depth > 0)) {
        const cosT = Math.cos(theta);
        // Disc alpha tracks |cos θ|: brightest at flux peak, fades to ~0 at θ = π/2.
        const intensity = Math.abs(cosT);
        const alpha = 0.05 + 0.32 * intensity * Math.min(1, st.B);
        // Tint flips: amber when Φ > 0, blue when Φ < 0.
        const color =
          cosT >= 0
            ? `rgba(255,107,42,${alpha.toFixed(3)})`
            : `rgba(91,174,248,${alpha.toFixed(3)})`;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cornersScreen[0]!.x, cornersScreen[0]!.y);
        for (let i = 1; i < 4; i++) {
          ctx.lineTo(cornersScreen[i]!.x, cornersScreen[i]!.y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // ───── 3. The loop's four edges ─────
      const loopEdgeOpacity = 0.85;
      const edgePts: { x: number; y: number }[] = [
        ...cornersScreen.map((p) => ({ x: p.x, y: p.y })),
        { x: cornersScreen[0]!.x, y: cornersScreen[0]!.y },
      ];
      drawGlowPath(ctx, edgePts, {
        color: `rgba(255,107,42,${loopEdgeOpacity})`,
        lineWidth: 2,
        glowColor: 'rgba(255,107,42,0.28)',
        glowWidth: 7,
      });

      // Axis of rotation (vertical dashed line through origin).
      const axisTop = project({ x: 0, y: 1.3, z: 0 }, cam, w, sceneH);
      const axisBot = project({ x: 0, y: -1.3, z: 0 }, cam, w, sceneH);
      if (axisTop.depth > 0 && axisBot.depth > 0) {
        ctx.save();
        ctx.strokeStyle = colors.borderStrong;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(axisTop.x, axisTop.y);
        ctx.lineTo(axisBot.x, axisBot.y);
        ctx.stroke();
        ctx.restore();
      }

      // ───── 4. Normal vector n̂ ─────
      if (st.showNormal) {
        const nHat: Vec3 = { x: Math.cos(theta), y: 0, z: Math.sin(theta) };
        const nFrom: Vec3 = { x: 0, y: 0, z: 0 };
        const nTo: Vec3 = { x: nHat.x * 1.05, y: 0, z: nHat.z * 1.05 };
        drawArrow3D(nFrom, nTo, 'rgba(236,235,229,0.92)', 2, cam, w, sceneH);
        // n̂ label near the arrow tip.
        const labelP = project({ x: nHat.x * 1.18, y: 0.05, z: nHat.z * 1.18 }, cam, w, sceneH);
        if (labelP.depth > 0) {
          ctx.fillStyle = colors.text;
          ctx.font = 'italic 12px "STIX Two Text", serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('n̂', labelP.x, labelP.y);
        }
      }

      // B-field label, top-left.
      ctx.fillStyle = colors.teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`B → ${st.B.toFixed(2)}  (along +x)`, 12, 12);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`θ = ${(((theta % (2 * Math.PI)) * 180) / Math.PI).toFixed(0)}°`, 12, 28);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors.textDim;
      ctx.fillText('drag to orbit', 12, sceneH - 18);

      ctx.restore();
      ctx.restore(); // end scene clip

      // ───── Time-series plot (bottom strip) ─────
      // Divider line.
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, plotY0);
      ctx.lineTo(w, plotY0);
      ctx.stroke();

      const plotLeft = 30;
      const plotRight = w - 12;
      const plotW = plotRight - plotLeft;
      const plotCy = plotY0 + plotH / 2;
      const plotHalfH = (plotH * 0.78) / 2;

      // Vertical scale: normalise both traces by their maximum so they fit.
      // Φ_max = B·A; ε_max = B·A·ω. Plot Φ/Φ_max and ε/ε_max independently.
      const phiMaxLocal = Math.max(st.B * LOOP_AREA, 0.01);
      const emfMaxLocal = Math.max(st.B * LOOP_AREA * st.omega, 0.01);

      // Zero line.
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotCy);
      ctx.lineTo(plotRight, plotCy);
      ctx.stroke();

      // Build trace points.
      const phiPts: { x: number; y: number }[] = [];
      const emfPts: { x: number; y: number }[] = [];
      for (const s of scope) {
        const u = (s.t - tCut) / SCOPE_SECONDS;
        const x = plotLeft + u * plotW;
        phiPts.push({ x, y: plotCy - (s.phi / phiMaxLocal) * plotHalfH });
        emfPts.push({ x, y: plotCy - (s.emf / emfMaxLocal) * plotHalfH });
      }

      if (phiPts.length > 2) {
        drawGlowPath(ctx, phiPts, {
          color: 'rgba(255,107,42,0.92)',
          lineWidth: 1.6,
          glowColor: 'rgba(255,107,42,0.32)',
          glowWidth: 5,
        });
      }
      if (emfPts.length > 2) {
        drawGlowPath(ctx, emfPts, {
          color: 'rgba(108,197,194,0.92)',
          lineWidth: 1.6,
          glowColor: 'rgba(108,197,194,0.30)',
          glowWidth: 5,
        });
      }

      // Plot legend.
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = colors.accent;
      ctx.fillText('Φ_B(t) = B·A·cos(ωt)', plotLeft + 4, plotY0 + 6);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = colors.teal;
      ctx.fillText('ε(t) = −dΦ/dt = B·A·ω·sin(ωt)', plotLeft + 4, plotY0 + 20);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'right';
      ctx.fillText('time →', plotRight - 4, plotY0 + plotH - 14);

      // Force re-renders so MiniReadouts stay alive even if React optimises us out.
      setTick((t) => (t + 1) % 1000);
      raf = requestAnimationFrame(draw);
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 7.5b'}
      title="The cos(θ) geometry in 3D"
      question="Why does a constant rotation in a constant field produce a sinusoid?"
      caption={
        <>
          Same physics as the 2D animation above, but with the camera free to orbit. Drag the scene
          to look down the field axis: when the loop's normal n̂ points along B (θ = 0) the disc
          lights up amber and every field arrow that pierces the loop counts in full; rotate the
          loop 90° and n̂ is perpendicular to B, the disc fades to nothing, the flux through it goes
          to zero. The rolling plot below makes the cos(θ) projection and its derivative visible on
          a shared time axis: Φ_B leads, ε = −dΦ/dt lags by a quarter cycle. That phase shift is the
          whole reason AC waveforms come out sinusoidal.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={420} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omega}
          min={0.1}
          max={5}
          step={0.05}
          format={(v) => v.toFixed(2) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniSlider
          label="B"
          value={B}
          min={0.1}
          max={2}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setB}
        />
        <MiniToggle label="flux disc" checked={showDisc} onChange={setShowDisc} />
        <MiniToggle label="normal n̂" checked={showNormal} onChange={setShowNormal} />
        <MiniReadout label="Φ_B" value={<Num value={readouts.phi} />} />
        <MiniReadout label="ε = −dΦ/dt" value={<Num value={readouts.emf} />} />
        <MiniReadout label="Φ_max = B·A" value={<Num value={phiMax} />} />
      </DemoControls>
    </Demo>
  );
}
