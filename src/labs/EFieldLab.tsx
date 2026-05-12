/**
 * Lab 1.2 — Field of a Point Charge
 *
 *   E = k Q / (ε_r r²)
 *
 * Single source charge + draggable test probe. The probe arrow shows
 * direction and a log-scaled magnitude of E at its location.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'e-field';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

const PX_PER_M = 1000; // 1 px = 1 mm

export default function EFieldLab() {
  const [qNC, setQNC] = useState(+10);     // source charge, nC
  const [qTestNC, setQTestNC] = useState(1.0); // test charge, nC
  const [er, setEr] = useState(1.0);

  // Normalized [0..1] canvas-coords for source and probe.
  const [src, setSrc] = useState({ x: 0.50, y: 0.50 });
  const [probe, setProbe] = useState({ x: 0.72, y: 0.42 });

  // Canvas size in CSS pixels — needed so computed values can convert pixel
  // distance to meters for the readouts.
  const [sizePx, setSizePx] = useState({ W: 800, H: 500 });

  const stateRef = useRef({ qNC, qTestNC, er, src, probe, sizePx });
  useEffect(() => {
    stateRef.current = { qNC, qTestNC, er, src, probe, sizePx };
  }, [qNC, qTestNC, er, src, probe, sizePx]);

  // Computed physics for the readouts.
  const computed = useMemo(() => {
    const dxPx = (probe.x - src.x) * sizePx.W;
    const dyPx = (probe.y - src.y) * sizePx.H;
    const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-4);
    const q = qNC * 1e-9;
    const Emag = (PHYS.k * q) / (er * r_m * r_m); // signed
    const V = (PHYS.k * q) / (er * r_m);
    const F = (qTestNC * 1e-9) * Emag;
    return { r_m, Emag, V, F, q };
  }, [qNC, qTestNC, er, src, probe, sizePx]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    setSizePx({ W: w, H: h });
    let raf = 0;
    let dragging: 'src' | 'probe' | null = null;
    let phase = 0;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function nearest(mx: number, my: number): 'src' | 'probe' | null {
      const { src, probe } = stateRef.current;
      const d1 = Math.hypot(mx - src.x * w, my - src.y * h);
      const d2 = Math.hypot(mx - probe.x * w, my - probe.y * h);
      let best: 'src' | 'probe' | null = null, bestD = 24;
      if (d1 < bestD) { bestD = d1; best = 'src'; }
      if (d2 < bestD) { best = 'probe'; }
      return best;
    }
    function clamp01(p: number) { return Math.max(0.04, Math.min(0.96, p)); }
    function clampY(p: number) { return Math.max(0.08, Math.min(0.92, p)); }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
      if (dragging) canvas.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging) {
        const p = { x: clamp01(mx / w), y: clampY(my / h) };
        if (dragging === 'src') setSrc(p); else setProbe(p);
      } else {
        canvas.style.cursor = nearest(mx, my) ? 'grab' : 'default';
      }
    }
    function onMouseUp() { dragging = null; canvas.style.cursor = 'default'; }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!dragging) return;
      const [mx, my] = getMouse(e);
      const p = { x: clamp01(mx / w), y: clampY(my / h) };
      if (dragging === 'src') setSrc(p); else setProbe(p);
    }
    function onTouchEnd() { dragging = null; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function draw() {
      const { qNC, er, src, probe } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const sx = src.x * w, sy = src.y * h;
      const q = qNC * 1e-9;
      const sgn = q >= 0 ? +1 : -1;

      // Equipotential heatmap
      const cellSize = 8;
      for (let py = 0; py < h; py += cellSize) {
        for (let px = 0; px < w; px += cellSize) {
          const dx = px - sx, dy = py - sy;
          const r_m = Math.max(Math.hypot(dx, dy) / PX_PER_M, 0.001);
          const v = (PHYS.k * q) / (er * r_m);
          const t = Math.tanh(v / 200);
          if (Math.abs(t) < 0.02) continue;
          ctx.fillStyle = t > 0
            ? `rgba(255,59,110,${Math.abs(t) * 0.10})`
            : `rgba(91,174,248,${Math.abs(t) * 0.10})`;
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      }

      // Concentric distance rings (mm labels)
      const rings = [25, 50, 100, 200];
      for (const mm of rings) {
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = 'rgba(108,197,194,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, mm, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(108,197,194,0.45)';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(mm + ' mm', sx + mm + 4, sy);
      }

      // Radial field lines streaming from source
      phase += 0.6;
      const lines = 18;
      for (let i = 0; i < lines; i++) {
        const a = (i / lines) * Math.PI * 2;
        const path: Array<[number, number]> = [];
        for (let s = 4; s < 600; s += 6) {
          const x = sx + Math.cos(a) * s * sgn;
          const y = sy + Math.sin(a) * s * sgn;
          if (x < 0 || x > w || y < 0 || y > h) break;
          path.push([x, y]);
        }
        if (sgn < 0) path.reverse();
        if (path.length > 2) {
          ctx.strokeStyle = 'rgba(255,107,42,0.16)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (const [x, y] of path) ctx.lineTo(x, y);
          ctx.stroke();
          const tIdx = Math.floor((phase + i * 13) % path.length);
          const t = path[tIdx];
          if (t) {
            ctx.beginPath();
            ctx.arc(t[0], t[1], 1.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,107,42,0.95)';
            ctx.shadowColor = 'rgba(255,107,42,.6)';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Probe arrow showing E direction and (log-scaled) magnitude.
      const px = probe.x * w, py = probe.y * h;
      const dxPx = px - sx, dyPx = py - sy;
      const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-4);
      const Emag = (PHYS.k * q) / (er * r_m * r_m);
      const absE = Math.abs(Emag);
      if (absE > 0) {
        // Direction: outward from + source, inward toward - source
        const d = Math.hypot(dxPx, dyPx) || 1;
        const ux = (dxPx / d) * Math.sign(Emag);
        const uy = (dyPx / d) * Math.sign(Emag);
        const len = 22 + Math.min(140, Math.log10(absE + 1) * 22);
        drawArrow(ctx, px, py, px + ux * len, py + uy * len, '#ff6b2a');
      }

      // Source charge
      drawCharge(ctx, sx, sy, '#ff3b6e', qNC >= 0 ? '+' : '−', 'Q', Math.abs(qNC));
      // Probe
      drawProbe(ctx, px, py, 'P');

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const dirLabel =
    computed.q > 0 ? 'radially outward' :
    computed.q < 0 ? 'radially inward' :
    '—';
  const dirColor =
    computed.q > 0 ? 'var(--pink)' :
    computed.q < 0 ? 'var(--blue)' :
    'var(--text-muted)';

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={500} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)" dot>Source charge Q</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>Probe (test charge)</LegendItem>
          <LegendItem swatchColor="var(--accent)">E field lines</LegendItem>
          <LegendItem swatchColor="var(--teal)" style={{ opacity: 0.7 }}>Equipotential rings</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag source or probe</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="Q" label="Source charge"
            value={qNC} min={-50} max={50} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−50 nC" metaRight="+50 nC"
            onChange={setQNC}
          />
          <Slider
            sym="q<sub>t</sub>" label="Test charge"
            value={qTestNC} min={0.1} max={5} step={0.1}
            format={v => v.toFixed(1) + ' nC'}
            metaLeft="0.1 nC" metaRight="5 nC"
            onChange={setQTestNC}
          />
          <Slider
            sym="ε<sub>r</sub>" label="Rel. permittivity"
            value={er} min={1} max={80} step={0.1}
            format={v => v.toFixed(1)}
            metaLeft="1 (vacuum)" metaRight="80 (water)"
            onChange={setEr}
          />
        </>
      }
      outputs={
        <>
          <Readout
            sym="|E|" label="Field at probe"
            valueHTML={pretty(Math.abs(computed.Emag))}
            unit="V/m"
            highlight
          />
          <Readout
            sym="Ê" label="Direction"
            value={<span style={{ color: dirColor }}>{dirLabel}</span>}
          />
          <Readout
            sym="F" label="Force on test charge"
            valueHTML={pretty(Math.abs(computed.F))}
            unit="N"
          />
          <Readout
            sym="V" label="Potential at probe"
            valueHTML={pretty(computed.V)}
            unit="V"
          />
          <Readout
            sym="r" label="Distance from source"
            value={computed.r_m.toFixed(3)}
            unit="m"
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>From force to field</h3>
      <p>
        Coulomb's law tells you what happens when two charges meet. That works fine for two charges. But what about ten? Or 10<sup>23</sup>?
        Worse: how does charge 1 even "know" where charge 2 is in order to push on it? Faraday's answer was to invent a new object: the <strong>field</strong><Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p>
        Instead of saying "Q₁ pulls Q₂ from afar," say: Q₁ sets up a field <strong>E</strong> at every point in space, and Q₂
        feels only the field <em>at its own location</em>. Action becomes local. Calculation gets cheap. In dynamic situations — jiggling charges,
        radiating antennas — the field turns out to have an independent existence: it stores energy, carries momentum, propagates at the
        speed of light<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>The math</h3>
      <p>
        Define <strong>E</strong> as force per unit test charge:
      </p>
      <MathBlock>E = F / q<sub>test</sub></MathBlock>
      <p>
        Plug in Coulomb's law for the force from a point charge <strong>Q</strong> at distance <strong>r</strong>, take the limit of vanishing test
        charge (so the probe doesn't perturb the very field it's measuring), and you get
      </p>
      <MathBlock>E = k Q / r²</MathBlock>
      <p>
        The units are <strong>newtons per coulomb</strong>, which are equivalent to <strong>volts per meter</strong> in SI<Cite id="hyperphysics-emag" in={SOURCES} />.
        The duality between "field strength" and "potential per length" is built into the unit definitions.
      </p>
      <p>
        <strong>E</strong> is a vector. For a positive source charge it points radially outward at every point in space; for a negative source
        it points radially inward. A positive test charge feels a force along <strong>E</strong>; a negative test charge feels a force
        anti-parallel to it<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Why a field at all?</h3>
      <p>
        Coulomb wrote down a static law: charges sitting still. But what happens when Q₁ suddenly moves? Does Q₂ feel the change
        instantaneously? In the relativistic picture, the answer is no — and the field formalism makes this automatic. <strong>E</strong> at a
        point right now depends on the configuration of charges in that point's <em>past light cone</em>: if a source jiggles, the news
        of the jiggle ripples outward through the field at speed c<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <Pullout>
        A field assigns a force-per-unit-charge to every point in empty space. The "empty" is wrong; the space is full
        of <em>possibilities</em> — a force that would appear the moment any test charge arrived.
      </Pullout>
      <p>
        The static <strong>E = kQ/r²</strong> you see in the lab is the steady-state limit of this much richer story. It's exact when nothing
        is moving, and a very good approximation when things move slowly enough that retardation effects don't matter.
      </p>

      <h3>Superposition</h3>
      <p>
        Coulomb's law is linear in <strong>Q</strong>, which means the field formalism inherits a fantastic property: the total field from
        many charges is the vector sum of the individual fields. Each charge contributes independently and the contributions add<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <MathBlock>E<sub>total</sub>(r) = Σ<sub>i</sub> k Q<sub>i</sub> (r − r<sub>i</sub>) / |r − r<sub>i</sub>|³</MathBlock>
      <p>
        The whole of classical electrostatics is the practical exercise of evaluating this sum — or its integral form for continuous
        distributions — for various charge configurations.
      </p>

      <h4>Field lines are a visualization</h4>
      <p>
        The streaming orange lines in the visualization are a representation, not a physical entity. Faraday drew them this way because the
        geometry was clear: density of lines indicates field strength; direction of lines indicates field direction. They begin on
        positive charges and end on negative charges (or run off to infinity), and they never cross — two distinct directions for <strong>E</strong>
        at one point would be meaningless<Cite id="feynman-II-2" in={SOURCES} />. The real field is a continuous vector at every point.
      </p>

      <h4>The role of ε<sub>r</sub></h4>
      <p>
        Embedded in a polarizable medium, the source charge's field is partially screened by the medium's induced dipoles. The result is
        <strong> E = kQ/(ε<sub>r</sub> r²)</strong> — same shape, scaled down<Cite id="griffiths-2017" in={SOURCES} />. Slide the permittivity
        up and watch the field collapse.
      </p>

      <h4>About the constants</h4>
      <p>
        The Coulomb constant <strong>k = 1/(4π ε₀) ≈ 8.99×10⁹ N·m²/C²</strong> and the elementary charge <strong>e = 1.602176634×10⁻¹⁹ C</strong>
        used in this lab come from the current SI definitions and CODATA recommended values<Cite id="codata-2018" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Single-Charge Field Map"
      labId="efield-1.2 / E = kQ/r²"
      labContent={labContent}
      prose={prose}
    />
  );
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number, color: string,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 9 * Math.cos(ang - 0.4), y2 - 9 * Math.sin(ang - 0.4));
  ctx.lineTo(x2 - 9 * Math.cos(ang + 0.4), y2 - 9 * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
}

function drawCharge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string,
  sign: string, label: string, magnitude: number,
) {
  const radius = 12 + Math.min(12, magnitude * 0.4);
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0a0b';
  ctx.font = `bold ${radius}px JetBrains Mono`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, cx, cy);
  ctx.fillStyle = color;
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(label + ' = ' + magnitude.toFixed(1) + ' nC', cx, cy + radius + 14);
}

function drawProbe(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, label: string,
) {
  ctx.strokeStyle = '#ff6b2a';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(10,10,11,.92)';
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}
