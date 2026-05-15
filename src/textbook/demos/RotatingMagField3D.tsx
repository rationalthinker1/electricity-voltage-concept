/**
 * Demo 20.x — Rotating magnetic field inside a 3-phase stator (3D)
 *
 * Three stator coil pairs A, B, C are arranged 120° apart around the bore of
 * a ring-shaped stator (axis along +y, lying flat in the x-z plane). Each
 * pair carries a sinusoidal current
 *
 *     I_x(t) = I_0 cos(ω t + φ_x),   φ_A = 0, φ_B = −120°, φ_C = −240°
 *
 * Each coil pair contributes a B-field along its own axial unit vector n̂_x
 * (the radial direction from the coil's centre toward the bore axis).
 * The total B-field at the centre is the sum
 *
 *     B(t) = B_0 Σ cos(ω t + φ_x) n̂_x
 *
 * which evaluates (using the three-phase identity) to a vector of constant
 * magnitude (3/2) B_0 rotating about the +y axis at angular speed ω. That
 * rotating field is what drags an induction or synchronous rotor around the
 * bore. A small indicator arrow in the centre tracks the field direction
 * (representing a synchronous rotor turning with the field at p = 1).
 *
 * The reader can:
 *   - drag to orbit the camera
 *   - set electrical frequency f (1–60 Hz) and current amplitude I_0 (0–10 A)
 *   - toggle individual phase contributions (color-coded vectors at centre)
 *
 * Live readouts: ω_sync, mechanical RPM (60 f / p; p = 1), |B_total|, and
 * the instantaneous field angle in the x-z plane.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit,
  project,
  type OrbitCamera,
  type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

// Geometry. Stator ring lies in the x-z plane; its axis is +y (vertical).
const STATOR_R = 1.25;          // radius of stator bore (where the coil faces sit)
const STATOR_THICK = 0.22;      // half-height of the stator ring along y
const COIL_HALF_W = 0.22;       // half-width of each coil bump along its tangent
const FIELD_ARROW_SCALE = 1.05; // visual scale of the resultant arrow at centre

// The three coil angular positions (around the y-axis, measured from +x).
const COIL_ANGLES = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
// Their phase shifts in the standard ABC sequence: 0, -120°, -240°.
const COIL_PHASES = [0, -2 * Math.PI / 3, -4 * Math.PI / 3];
const COIL_LABELS = ['A', 'B', 'C'];
// Color per phase — resolved per-frame from the canvas theme so the
// coil tints follow light/dark mode.
function coilColors() {
  const c = getCanvasColors();
  return [c.accent, c.teal, c.pink] as const;
}

// Choose B_0 so that with I_0 = 10 A the resultant magnitude (3/2)·B_0·(I_0/I_ref)
// lands at a clean "1.0" of the visual arrow at full slider. Purely visual.
const I_REF = 10;

export function RotatingMagField3DDemo({ figure }: Props) {
  const [freq, setFreq] = useState(8);          // electrical Hz (visual rate)
  const [I0, setI0] = useState(6);              // current amplitude, A
  const [showContribs, setShowContribs] = useState(true);
  const [, setTick] = useState(0);

  const stateRef = useRef({
    freq, I0, showContribs,
    t: 0, theta: 0, bx: 0, bz: 0, bMag: 0,
  });
  useEffect(() => {
    stateRef.current.freq = freq;
    stateRef.current.I0 = I0;
    stateRef.current.showContribs = showContribs;
  }, [freq, I0, showContribs]);

  const camRef = useRef<OrbitCamera>({
    yaw: 0.55, pitch: 0.45, distance: 6.2, fov: Math.PI / 4,
  });

  const [readouts, setReadouts] = useState({
    omega: 0, rpm: 0, bMag: 0, angleDeg: 0,
  });
  const readoutsTimer = useRef(0);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    const dispose = attachOrbit(canvas, camRef.current);
    let raf = 0;
    let lastReal = performance.now();

    // Pre-compute per-coil radial unit vectors n̂_x (pointing inward from the
    // coil face toward the bore axis). At angle α, the coil sits at (R cos α,
    // 0, R sin α); the inward radial is (-cos α, 0, -sin α). But the field
    // from a coil at the bore actually points along the coil's axis (radial).
    // For positive current we define +B along the inward radial.
    const coilInfo = COIL_ANGLES.map((alpha, i) => {
      const cosA = Math.cos(alpha);
      const sinA = Math.sin(alpha);
      // Position of coil's outer face centre.
      const pos: Vec3 = { x: STATOR_R * cosA, y: 0, z: STATOR_R * sinA };
      // Inward radial unit (toward origin in x-z plane).
      const inward: Vec3 = { x: -cosA, y: 0, z: -sinA };
      // Tangent unit (for drawing the coil-bump width).
      const tangent: Vec3 = { x: -sinA, y: 0, z: cosA };
      return { pos, inward, tangent, phase: COIL_PHASES[i]!, color: coilColors()[i]!, label: COIL_LABELS[i]! };
    });

    function drawArrow3D(
      from: Vec3, to: Vec3, color: string, lineWidth: number,
      cam: OrbitCamera, cw: number, ch: number, headScale = 1,
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
      const dx = p1.x - p0.x, dy = p1.y - p0.y;
      const len = Math.hypot(dx, dy);
      if (len < 1e-3) return;
      const ux = dx / len, uy = dy / len;
      const headLen = Math.min(10 * headScale, len * 0.5);
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

      // ω from electrical frequency. The visual rotation rate uses a slowdown
      // factor so the field is watchable even at 60 Hz.
      const omegaTrue = 2 * Math.PI * st.freq;          // physical rad/s
      const visualOmega = omegaTrue * 0.05;             // slow down 20× for visibility
      st.theta = (st.theta + dt * visualOmega) % (2 * Math.PI);

      // Compute the three phase currents and their B-contributions at the
      // centre. Currents are normalised by I_REF so the resultant arrow
      // length stays bounded.
      const currents = coilInfo.map(ci => st.I0 * Math.cos(st.theta + ci.phase) / I_REF);
      const contribs = coilInfo.map((ci, i) => ({
        vec: { x: ci.inward.x * currents[i]!, y: 0, z: ci.inward.z * currents[i]! } as Vec3,
        sign: currents[i]!,
        color: ci.color,
      }));

      // Sum.
      let bx = 0, bz = 0;
      for (const c of contribs) { bx += c.vec.x; bz += c.vec.z; }
      const bMag = Math.hypot(bx, bz);
      st.bx = bx; st.bz = bz; st.bMag = bMag;

      const angleDeg = (Math.atan2(bz, bx) * 180 / Math.PI + 360) % 360;
      const rpm = 60 * st.freq;                          // p = 1 ⇒ mech = elec

      readoutsTimer.current = (readoutsTimer.current + 1) % 4;
      if (readoutsTimer.current === 0) {
        setReadouts({ omega: omegaTrue, rpm, bMag, angleDeg });
      }

      // ───── background ─────
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Optional faint reference floor circle in the x-z plane.
      const floorPts: { x: number; y: number; depth: number }[] = [];
      const FLOOR_R = STATOR_R + 0.45;
      for (let k = 0; k <= 64; k++) {
        const a = (k / 64) * Math.PI * 2;
        floorPts.push(project(
          { x: FLOOR_R * Math.cos(a), y: -STATOR_THICK - 0.05, z: FLOOR_R * Math.sin(a) },
          cam, w, h,
        ));
      }
      if (floorPts.every(p => p.depth > 0)) {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(floorPts[0]!.x, floorPts[0]!.y);
        for (let k = 1; k < floorPts.length; k++) ctx.lineTo(floorPts[k]!.x, floorPts[k]!.y);
        ctx.stroke();
      }

      // ───── 1. Stator ring (back half first, then bore-axis line, then
      //         front half — gives a sense of depth around the bumps). ─────
      // We sort the three coil bumps front-to-back to paint them in painter
      // order along with the connecting ring arcs.
      type DrawItem = { type: 'arc' | 'coil'; depth: number; render: () => void };
      const drawList: DrawItem[] = [];

      // Stator ring rendered as 6 arcs (3 between coil bumps, drawn at both
      // top and bottom edges of the ring's thickness).
      const RING_SEGMENTS = 96;
      // Bottom and top rims as polylines.
      for (const yEdge of [-STATOR_THICK, STATOR_THICK]) {
        const ringPts: { x: number; y: number; depth: number }[] = [];
        for (let k = 0; k <= RING_SEGMENTS; k++) {
          const a = (k / RING_SEGMENTS) * Math.PI * 2;
          ringPts.push(project(
            { x: STATOR_R * Math.cos(a), y: yEdge, z: STATOR_R * Math.sin(a) },
            cam, w, h,
          ));
        }
        const avgDepth = ringPts.reduce((s, p) => s + p.depth, 0) / ringPts.length;
        drawList.push({
          type: 'arc',
          depth: avgDepth + (yEdge > 0 ? -0.02 : 0.02),
          render: () => {
            if (!ringPts.every(p => p.depth > 0)) return;
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.strokeStyle = colors.textDim;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(ringPts[0]!.x, ringPts[0]!.y);
            for (let k = 1; k < ringPts.length; k++) ctx.lineTo(ringPts[k]!.x, ringPts[k]!.y);
            ctx.stroke();
            ctx.restore();
          },
        });
      }

      // Coil bumps: each rendered as a small rounded rectangle in 3D facing
      // inward (toward the bore axis), plus a label.
      for (let i = 0; i < coilInfo.length; i++) {
        const ci = coilInfo[i]!;
        const I_i = currents[i]!;
        const intensity = Math.min(1, Math.abs(I_i));
        const isPos = I_i >= 0;
        // Four corners of the coil "face" (a rect in the y-tangent plane at the bore radius).
        const corners: Vec3[] = [
          { x: ci.pos.x + ci.tangent.x * -COIL_HALF_W, y: -STATOR_THICK * 1.1, z: ci.pos.z + ci.tangent.z * -COIL_HALF_W },
          { x: ci.pos.x + ci.tangent.x *  COIL_HALF_W, y: -STATOR_THICK * 1.1, z: ci.pos.z + ci.tangent.z *  COIL_HALF_W },
          { x: ci.pos.x + ci.tangent.x *  COIL_HALF_W, y:  STATOR_THICK * 1.1, z: ci.pos.z + ci.tangent.z *  COIL_HALF_W },
          { x: ci.pos.x + ci.tangent.x * -COIL_HALF_W, y:  STATOR_THICK * 1.1, z: ci.pos.z + ci.tangent.z * -COIL_HALF_W },
        ];
        const screen = corners.map(c => project(c, cam, w, h));
        const avgDepth = screen.reduce((s, p) => s + p.depth, 0) / screen.length;
        drawList.push({
          type: 'coil',
          depth: avgDepth,
          render: () => {
            if (!screen.every(p => p.depth > 0)) return;
            // Fill: tinted by phase color, alpha tracks |I|.
            const tint = ci.color;
            // Convert tint hex to rgb for the rgba fill.
            const r = parseInt(tint.slice(1, 3), 16);
            const g = parseInt(tint.slice(3, 5), 16);
            const b = parseInt(tint.slice(5, 7), 16);
            const fillAlpha = 0.15 + 0.55 * intensity;
            ctx.fillStyle = `rgba(${r},${g},${b},${fillAlpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(screen[0]!.x, screen[0]!.y);
            for (let k = 1; k < 4; k++) ctx.lineTo(screen[k]!.x, screen[k]!.y);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`;
            ctx.lineWidth = 1.6;
            ctx.stroke();

            // Polarity glyph: + / − on the face at the centre.
            const cx = (screen[0]!.x + screen[2]!.x) / 2;
            const cy = (screen[0]!.y + screen[2]!.y) / 2;
            ctx.fillStyle = colors.text;
            ctx.font = 'bold 14px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isPos ? '+' : '−', cx, cy);

            // Label A/B/C just outside the coil face.
            const labelP = project(
              { x: ci.pos.x * 1.22, y: STATOR_THICK * 2.1, z: ci.pos.z * 1.22 },
              cam, w, h,
            );
            if (labelP.depth > 0) {
              ctx.fillStyle = ci.color;
              ctx.font = 'bold 13px "JetBrains Mono", monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(ci.label, labelP.x, labelP.y);
            }
          },
        });
      }

      drawList.sort((a, b) => b.depth - a.depth);
      for (const item of drawList) item.render();

      // ───── Axis line through the bore (vertical y axis), dashed. ─────
      const axisTop = project({ x: 0, y: STATOR_THICK + 0.8, z: 0 }, cam, w, h);
      const axisBot = project({ x: 0, y: -STATOR_THICK - 0.8, z: 0 }, cam, w, h);
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

      // ───── 2. Individual phase contributions at the centre (toggle) ─────
      if (st.showContribs) {
        for (let i = 0; i < contribs.length; i++) {
          const c = contribs[i]!;
          const vMag = Math.hypot(c.vec.x, c.vec.z);
          if (vMag < 1e-3) continue;
          const to: Vec3 = {
            x: c.vec.x * FIELD_ARROW_SCALE * 0.9,
            y: 0,
            z: c.vec.z * FIELD_ARROW_SCALE * 0.9,
          };
          // Convert hex color to translucent rgba.
          const r = parseInt(c.color.slice(1, 3), 16);
          const g = parseInt(c.color.slice(3, 5), 16);
          const b = parseInt(c.color.slice(5, 7), 16);
          drawArrow3D(
            { x: 0, y: 0, z: 0 }, to,
            `rgba(${r},${g},${b},0.65)`, 1.5,
            cam, w, h, 0.85,
          );
        }
      }

      // ───── 3. Total B-field arrow (large, glowing) at the centre ─────
      const totalTo: Vec3 = {
        x: bx * FIELD_ARROW_SCALE,
        y: 0,
        z: bz * FIELD_ARROW_SCALE,
      };
      // Project as a 2-point polyline so we can use drawGlowPath for the halo.
      const p0 = project({ x: 0, y: 0, z: 0 }, cam, w, h);
      const p1 = project(totalTo, cam, w, h);
      if (p0.depth > 0 && p1.depth > 0 && bMag > 1e-3) {
        drawGlowPath(ctx, [{ x: p0.x, y: p0.y }, { x: p1.x, y: p1.y }], {
          color: 'rgba(255,107,42,0.98)',
          lineWidth: 3,
          glowColor: 'rgba(255,107,42,0.42)',
          glowWidth: 12,
        });
        // Arrow head in screen space.
        const dx = p1.x - p0.x, dy = p1.y - p0.y;
        const len = Math.hypot(dx, dy);
        if (len > 1) {
          const ux = dx / len, uy = dy / len;
          const headLen = Math.min(16, len * 0.45);
          const headW = headLen * 0.6;
          const baseX = p1.x - ux * headLen;
          const baseY = p1.y - uy * headLen;
          ctx.save();
          ctx.globalAlpha = 0.98;
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(baseX - uy * headW, baseY + ux * headW);
          ctx.lineTo(baseX + uy * headW, baseY - ux * headW);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // "B" label at the tip.
        const tipLabel = project(
          { x: totalTo.x * 1.18, y: 0.18, z: totalTo.z * 1.18 },
          cam, w, h,
        );
        if (tipLabel.depth > 0) {
          ctx.fillStyle = colors.accent;
          ctx.font = 'italic bold 14px "STIX Two Text", serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('B', tipLabel.x, tipLabel.y);
        }
      }

      // ───── 4. Rotor indicator (small grey arrow at centre, rotates
      //         with the field at synchronous speed). ─────
      const rotorLen = 0.45;
      const rotorTo: Vec3 = {
        x: rotorLen * Math.cos(st.theta),
        y: 0,
        z: rotorLen * Math.sin(st.theta),
      };
      drawArrow3D(
        { x: 0, y: 0, z: 0 }, rotorTo,
        'rgba(236,235,229,0.55)', 2, cam, w, h, 0.7,
      );
      // Tiny disc at the rotor's base.
      const baseP = project({ x: 0, y: 0, z: 0 }, cam, w, h);
      if (baseP.depth > 0) {
        ctx.fillStyle = colors.text;
        ctx.beginPath();
        ctx.arc(baseP.x, baseP.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ───── HUD labels ─────
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`I_A = ${(st.I0 * Math.cos(st.theta + COIL_PHASES[0]!)).toFixed(2)} A`, 12, 12);
      ctx.fillStyle = coilColors()[0]!;
      ctx.fillText(`A`, 2, 12);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`I_B = ${(st.I0 * Math.cos(st.theta + COIL_PHASES[1]!)).toFixed(2)} A`, 12, 26);
      ctx.fillStyle = coilColors()[1]!;
      ctx.fillText(`B`, 2, 26);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`I_C = ${(st.I0 * Math.cos(st.theta + COIL_PHASES[2]!)).toFixed(2)} A`, 12, 40);
      ctx.fillStyle = coilColors()[2]!;
      ctx.fillText(`C`, 2, 40);

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors.textDim;
      ctx.fillText('drag to orbit · animation slowed 20× for visibility', 12, h - 18);

      setTick(t => (t + 1) % 1000);
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
      figure={figure ?? 'Fig. 20.x'}
      title="The rotating field inside a 3-phase stator"
      question="Three coils, three sinusoids 120° apart in time — how does that add up to a magnet on a turntable?"
      caption={<>
        Three stator coil pairs A, B, C sit 120° apart around the bore. Feed them sinusoidal
        currents 120° apart in phase and each coil's contribution to the field at the centre
        — a vector pointing along that coil's radial axis, magnitude proportional to its
        instantaneous current — sums to a single vector of <em>constant</em> magnitude
        (3/2)B<sub>0</sub> rotating about the bore axis at the electrical angular speed ω.
        That is the rotating magnetic field Tesla patented in 1888. A passive rotor at the
        centre feels a torque that drags it along; with p = 1 pole-pair the rotor's
        synchronous speed in RPM is 60·f. Drag to orbit; toggle "phase contributions" to
        see the three component vectors that build the resultant.
      </>}
      deeperLab={{ slug: 'biot-savart', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={420} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f"
          value={freq} min={1} max={60} step={1}
          format={v => v.toFixed(0) + ' Hz'}
          onChange={setFreq}
        />
        <MiniSlider
          label="I₀"
          value={I0} min={0} max={10} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI0}
        />
        <MiniToggle
          label="phase contributions"
          checked={showContribs} onChange={setShowContribs}
        />
        <MiniReadout label="ω_sync" value={<Num value={readouts.omega} />} unit="rad/s" />
        <MiniReadout label="RPM (p=1)" value={<Num value={readouts.rpm} />} />
        <MiniReadout label="|B| (norm.)" value={<Num value={readouts.bMag} />} />
        <MiniReadout label="∠B" value={readouts.angleDeg.toFixed(0)} unit="°" />
      </DemoControls>
    </Demo>
  );
}
