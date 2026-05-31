/**
 * Demo D1.1 — Coulomb's law superposition simulator
 *
 * A compact, state-driven sandbox for point charges. The first pair still
 * anchors the introductory Coulomb calculation, but the simulator supports
 * multiple charges and computes the live net force on a selected target.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { LayeredCanvas, type LayeredCanvasInfo } from '@/components/LayeredCanvas';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow, drawCharge } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { sciTeX } from '@/lib/physics';

interface Props {
  figure: string;
}

interface Vector2D {
  x: number;
  y: number;
}

interface Charge {
  id: string;
  q: number;
  x: number;
  y: number;
  isDraggable: boolean;
  color: string;
}

interface CanvasDims {
  w: number;
  h: number;
}

interface ForceContribution {
  source: Charge;
  target: Charge;
  rMeters: number;
  magnitude: number;
  vector: Vector2D;
}

const CHARGE_BOUNDS = {
  minX: 0.08,
  maxX: 0.92,
  minY: 0.16,
  maxY: 0.84,
};
const MIN_CHARGE_DISTANCE_PX = 38;
const METERS_PER_CANVAS_WIDTH = 0.3;
const K_COULOMB = 8.99e9;
const POSITIVE_COLOR = '#f4a6a6';
const NEGATIVE_COLOR = '#60a5fa';

const INITIAL_CHARGES: Charge[] = [
  { id: '1', q: 5e-9, x: 0.35, y: 0.5, isDraggable: true, color: POSITIVE_COLOR },
  { id: '2', q: -5e-9, x: 0.65, y: 0.5, isDraggable: true, color: NEGATIVE_COLOR },
];

function clampPoint(p: Vector2D): Vector2D {
  return {
    x: Math.max(CHARGE_BOUNDS.minX, Math.min(CHARGE_BOUNDS.maxX, p.x)),
    y: Math.max(CHARGE_BOUNDS.minY, Math.min(CHARGE_BOUNDS.maxY, p.y)),
  };
}

function chargeLabel(charge: Charge) {
  return `q_{${charge.id}}`;
}

function distancePx(a: Charge, b: Charge, dims: CanvasDims) {
  return Math.hypot((a.x - b.x) * dims.w, (a.y - b.y) * dims.h);
}

function metersPerPixel(dims: CanvasDims) {
  return METERS_PER_CANVAS_WIDTH / Math.max(1, dims.w);
}

function euclideanDistance(a: Charge, b: Charge, dims: CanvasDims) {
  const minMeters = MIN_CHARGE_DISTANCE_PX * metersPerPixel(dims);
  return Math.max(minMeters, distancePx(a, b, dims) * metersPerPixel(dims));
}

function coulombMagnitude(q1: number, q2: number, rMeters: number) {
  return (K_COULOMB * Math.abs(q1 * q2)) / (rMeters * rMeters);
}

function forceContributionOnTarget(
  target: Charge,
  source: Charge,
  dims: CanvasDims,
): ForceContribution {
  const dxPx = (target.x - source.x) * dims.w;
  const dyPx = (target.y - source.y) * dims.h;
  const distPx = Math.max(MIN_CHARGE_DISTANCE_PX, Math.hypot(dxPx, dyPx));
  const rMeters = euclideanDistance(target, source, dims);
  const magnitude = coulombMagnitude(target.q, source.q, rMeters);
  const signedMagnitude = target.q * source.q >= 0 ? magnitude : -magnitude;
  const ux = dxPx / distPx;
  const uy = dyPx / distPx;

  return {
    source,
    target,
    rMeters,
    magnitude,
    vector: {
      x: signedMagnitude * ux,
      y: signedMagnitude * uy,
    },
  };
}

function useElectrostatics(charges: Charge[], targetId: string, dims: CanvasDims) {
  return useMemo(() => {
    const target = charges.find((charge) => charge.id === targetId) ?? charges[0];
    if (!target) {
      return {
        target: undefined,
        contributions: [] as ForceContribution[],
        net: { x: 0, y: 0, magnitude: 0, angle: 0 },
      };
    }

    const contributions = charges
      .filter((charge) => charge.id !== target.id)
      .map((source) => forceContributionOnTarget(target, source, dims));
    const netX = contributions.reduce((sum, force) => sum + force.vector.x, 0);
    const netY = contributions.reduce((sum, force) => sum + force.vector.y, 0);

    return {
      target,
      contributions,
      net: {
        x: netX,
        y: netY,
        magnitude: Math.hypot(netX, netY),
        angle: Math.atan2(netY, netX),
      },
    };
  }, [charges, dims, targetId]);
}

function maxPixelStepToBounds(p: Vector2D, ux: number, uy: number, dims: CanvasDims) {
  let limit = Infinity;
  if (ux > 0) limit = Math.min(limit, ((CHARGE_BOUNDS.maxX - p.x) * dims.w) / ux);
  if (ux < 0) limit = Math.min(limit, ((CHARGE_BOUNDS.minX - p.x) * dims.w) / ux);
  if (uy > 0) limit = Math.min(limit, ((CHARGE_BOUNDS.maxY - p.y) * dims.h) / uy);
  if (uy < 0) limit = Math.min(limit, ((CHARGE_BOUNDS.minY - p.y) * dims.h) / uy);
  return Math.max(0, Number.isFinite(limit) ? limit : 0);
}

function formatForceLabel(forceN: number) {
  const abs = Math.abs(forceN);
  if (abs >= 1) return `${abs.toFixed(1)} N`;
  if (abs >= 1e-3) return `${(abs * 1e3).toFixed(1)} mN`;
  if (abs >= 1e-6) return `${(abs * 1e6).toFixed(1)} uN`;
  if (abs >= 1e-9) return `${(abs * 1e9).toFixed(1)} nN`;
  return `${sciTeX(abs, 1)} N`;
}

function signedChargeTex(q: number) {
  return q >= 0 ? sciTeX(q) : `-${sciTeX(Math.abs(q))}`;
}

function forceSumTex(target: Charge | undefined, contributions: ForceContribution[]) {
  if (!target || contributions.length === 0) return '\\vec{F}_{\\text{net}} = 0';
  const terms = contributions
    .map((force) => `\\vec{F}_{${force.source.id}${target.id}}`)
    .join(' + ');
  return `\\vec{F}_{\\text{net on }${target.id}} = ${terms}`;
}

function substitutionTex(contributions: ForceContribution[], netMagnitude: number) {
  if (contributions.length === 0) return '\\text{No other charges yet.}';
  const lines = contributions.slice(0, 4).map((force) => {
    const source = force.source;
    const target = force.target;
    return (
      `F_{${source.id}${target.id}} = ` +
      `(8.99\\times10^{9})\\dfrac{|(${signedChargeTex(source.q)})(${signedChargeTex(target.q)})|}` +
      `{(${force.rMeters.toFixed(3)})^{2}} = ${sciTeX(force.magnitude)}\\ \\text{N}`
    );
  });
  lines.push(`|\\vec{F}_{\\text{net}}| = ${sciTeX(netMagnitude)}\\ \\text{N}`);
  return `\\begin{aligned}${lines.join('\\\\')}\\end{aligned}`;
}

export function TwoChargesDemo({ figure }: Props) {
  const [charges, setCharges] = useState<Charge[]>(INITIAL_CHARGES);
  const [targetId, setTargetId] = useState('1');
  const [magNC, setMagNC] = useState(5);
  const [dims, setDims] = useState({ w: 880, h: 260 });
  const [playing, setPlaying] = useState(false);
  const drawRef = useRef<null | (() => void)>(null);
  const nextIdRef = useRef(3);

  const electrostatics = useElectrostatics(charges, targetId, dims);

  const stateRef = useRef({ charges, magNC, playing, targetId, electrostatics });
  useEffect(() => {
    stateRef.current = { charges, magNC, playing, targetId, electrostatics };
    drawRef.current?.();
  }, [charges, electrostatics, magNC, playing, targetId]);

  useEffect(() => {
    if (!playing) return;

    let raf = 0;
    const startedAt = performance.now();
    const motionMs = 2200;
    const pauseMs = 450;
    const cycleMs = motionMs + pauseMs;
    const startCharges = stateRef.current.charges.map((charge) => ({ ...charge }));
    const paths = startCharges.map((charge) => {
      const forces = startCharges
        .filter((source) => source.id !== charge.id)
        .map((source) => forceContributionOnTarget(charge, source, dims));
      const netX = forces.reduce((sum, force) => sum + force.vector.x, 0);
      const netY = forces.reduce((sum, force) => sum + force.vector.y, 0);
      const netMagnitude = Math.hypot(netX, netY);

      if (netMagnitude < 1e-30) return { start: charge, end: charge };

      const ux = netX / netMagnitude;
      const uy = netY / netMagnitude;
      const maxTravel = maxPixelStepToBounds(charge, ux, uy, dims);
      const travelPx = Math.min(96, Math.max(34, maxTravel * 0.72));
      return {
        start: charge,
        end: {
          ...charge,
          ...clampPoint({
            x: charge.x + (ux * travelPx) / dims.w,
            y: charge.y + (uy * travelPx) / dims.h,
          }),
        },
      };
    });

    function frame(now: number) {
      const cycleT = (now - startedAt) % cycleMs;
      const rawT = Math.min(1, cycleT / motionMs);
      const t = 1 - Math.pow(1 - rawT, 3);
      const nextCharges = paths.map(({ start, end }) => ({
        ...start,
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      }));

      stateRef.current.charges = nextCharges;
      setCharges(nextCharges);
      drawRef.current?.();

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [dims, playing]);

  function updateMagnitudes(nextMagNC: number) {
    setMagNC(nextMagNC);
    setCharges((prev) =>
      prev.map((charge) => ({
        ...charge,
        q: Math.sign(charge.q || 1) * nextMagNC * 1e-9,
      })),
    );
  }

  function addCharge(sign: 1 | -1) {
    setPlaying(false);
    setCharges((prev) => {
      if (prev.length >= 6) return prev;

      const slots: Vector2D[] = [
        { x: 0.5, y: 0.24 },
        { x: 0.5, y: 0.76 },
        { x: 0.24, y: 0.28 },
        { x: 0.76, y: 0.72 },
        { x: 0.24, y: 0.72 },
        { x: 0.76, y: 0.28 },
      ];
      const point =
        slots.find((slot) =>
          prev.every((charge) => Math.hypot(charge.x - slot.x, charge.y - slot.y) > 0.13),
        ) ?? { x: 0.5, y: 0.5 };
      const id = String(nextIdRef.current++);

      return [
        ...prev,
        {
          id,
          q: sign * magNC * 1e-9,
          isDraggable: true,
          color: sign > 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
          ...point,
        },
      ];
    });
  }

  function flipCharge(id: string) {
    setPlaying(false);
    setCharges((prev) =>
      prev.map((charge) =>
        charge.id === id
          ? {
              ...charge,
              q: -charge.q,
              color: charge.q > 0 ? NEGATIVE_COLOR : POSITIVE_COLOR,
            }
          : charge,
      ),
    );
  }

  function resetCharges() {
    setPlaying(false);
    nextIdRef.current = 3;
    setTargetId('1');
    setCharges(INITIAL_CHARGES.map((charge) => ({ ...charge, q: Math.sign(charge.q) * magNC * 1e-9 })));
  }

  const setup = useCallback(
    (info: LayeredCanvasInfo<'field'>) => {
      const { contexts, w, h, canvas } = info;
      const ctx = contexts.field;
      setDims({ w, h });

      let dragging: string | null = null;

      function getPoint(e: MouseEvent | TouchEvent): [number, number] {
        const rect = canvas.getBoundingClientRect();
        const touch = 'touches' in e ? e.touches[0] : e;
        if (!touch) return [0, 0];
        return [touch.clientX - rect.left, touch.clientY - rect.top];
      }

      function setChargePosition(id: string, mx: number, my: number) {
        setPlaying(false);
        const clampedNext = clampPoint({ x: mx / w, y: my / h });
        const otherCharges = stateRef.current.charges.filter((charge) => charge.id !== id);
        const tooClose = otherCharges.some(
          (charge) =>
            Math.hypot(clampedNext.x * w - charge.x * w, clampedNext.y * h - charge.y * h) <
            MIN_CHARGE_DISTANCE_PX,
        );
        if (tooClose) return;

        const nextCharges = stateRef.current.charges.map((charge) =>
          charge.id === id ? { ...charge, ...clampedNext } : charge,
        );
        stateRef.current.charges = nextCharges;
        setCharges(nextCharges);
        draw();
      }

      function hitCharge(mx: number, my: number): string | null {
        const charges = [...stateRef.current.charges].reverse();
        for (const charge of charges) {
          if (!charge.isDraggable) continue;
          if (Math.hypot(mx - charge.x * w, my - charge.y * h) < 28) return charge.id;
        }
        return null;
      }

      function drawGrid(colors: ReturnType<typeof getCanvasColors>) {
        ctx.strokeStyle = withAlpha(colors.text, 0.08);
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = step; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = step; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      function draw() {
        const s = stateRef.current;
        const colors = getCanvasColors();
        const target = s.electrostatics.target;
        const contributions = s.electrostatics.contributions;
        const net = s.electrostatics.net;

        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);
        drawGrid(colors);

        if (target) {
          const tx = target.x * w;
          const ty = target.y * h;

          for (const force of contributions) {
            const arrowScale = Math.min(76, 18 + Math.log10(force.magnitude * 1e7 + 1) * 15);
            const ux = force.vector.x / Math.max(1e-30, force.magnitude);
            const uy = force.vector.y / Math.max(1e-30, force.magnitude);
            drawArrow(
              ctx,
              { x: tx + ux * 18, y: ty + uy * 18 },
              { x: tx + ux * arrowScale, y: ty + uy * arrowScale },
              {
                color: withAlpha(colors.teal, 0.72),
                lineWidth: 1.5,
              },
            );
          }

          if (net.magnitude > 1e-30) {
            const ux = net.x / net.magnitude;
            const uy = net.y / net.magnitude;
            const arrowScale = Math.min(96, 24 + Math.log10(net.magnitude * 1e7 + 1) * 18);
            drawArrow(
              ctx,
              { x: tx + ux * 22, y: ty + uy * 22 },
              { x: tx + ux * arrowScale, y: ty + uy * arrowScale },
              {
                color: withAlpha(colors.accent, 0.98),
                lineWidth: 3,
              },
            );
            drawLabel(ctx, {
              x: tx + ux * (arrowScale + 12),
              y: ty + uy * (arrowScale + 12),
              text: formatForceLabel(net.magnitude),
              color: colors.accent,
              align: 'center',
            });
          }
        }

        s.charges.forEach((charge) => {
          const isTarget = charge.id === s.targetId;
          drawCharge(
            ctx,
            { x: charge.x * w, y: charge.y * h },
            {
              color: charge.q > 0 ? colors.pink : colors.blue,
              label: chargeLabel(charge),
              radius: isTarget ? 23 : 17,
              sign: charge.q > 0 ? '+' : '−',
              textColor: colors.bg,
            },
          );

          if (isTarget) {
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(charge.x * w, charge.y * h, 28, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        drawLabel(ctx, {
          x: 12,
          y: h - 14,
          text: s.playing ? 'looping force trend from this layout' : 'drag charges; click one to target',
          color: withAlpha(colors.textDim, 0.85),
        });
      }

      drawRef.current = draw;

      function onMouseDown(e: MouseEvent) {
        const [mx, my] = getPoint(e);
        dragging = hitCharge(mx, my);
        if (dragging) {
          setTargetId(dragging);
          canvas.style.cursor = 'grabbing';
        }
      }

      function onMouseMove(e: MouseEvent) {
        const [mx, my] = getPoint(e);
        if (dragging) {
          setChargePosition(dragging, mx, my);
          return;
        }
        canvas.style.cursor = hitCharge(mx, my) ? 'grab' : 'default';
      }

      function onMouseUp() {
        dragging = null;
        canvas.style.cursor = 'default';
      }

      function onTouchStart(e: TouchEvent) {
        e.preventDefault();
        const [mx, my] = getPoint(e);
        dragging = hitCharge(mx, my);
        if (dragging) setTargetId(dragging);
      }

      function onTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (!dragging) return;
        const [mx, my] = getPoint(e);
        setChargePosition(dragging, mx, my);
      }

      function onTouchEnd() {
        dragging = null;
      }

      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd);

      draw();

      return () => {
        if (drawRef.current === draw) drawRef.current = null;
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
      };
    },
    [],
  );

  const superpositionTex = forceSumTex(electrostatics.target, electrostatics.contributions);
  const liveSubstitutionTex = substitutionTex(
    electrostatics.contributions,
    electrostatics.net.magnitude,
  );

  return (
    <Demo
      figure={figure}
      title="Coulomb's law superposition simulator"
      question="What happens when one charge feels several Coulomb forces at once?"
      caption="Drag charges around the grid. Click a charge to make it the target; teal arrows show each pairwise force on that target, and the thick amber arrow is their vector sum. The animation loops a one-way force trend from your current layout."
      deeperLab={{ slug: 'coulomb', label: 'See full lab' }}
    >
      <LayeredCanvas height={300} layers={['field']} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={playing ? 'Pause' : 'Play'}
          checked={playing}
          onChange={setPlaying}
        />
        <MiniToggle label="Add +" checked onChange={() => addCharge(1)} />
        <MiniToggle label="Add −" checked={false} onChange={() => addCharge(-1)} />
        <MiniToggle label="Reset" checked={false} onChange={resetCharges} />
        {charges.map((charge) => (
          <MiniToggle
            key={charge.id}
            label={`Target ${charge.id}`}
            checked={targetId === charge.id}
            onChange={() => setTargetId(charge.id)}
          />
        ))}
        <MiniSlider
          label="|q|"
          value={magNC}
          min={0.1}
          max={20}
          step={0.1}
          format={(v) => v.toFixed(1) + ' nC'}
          onChange={updateMagnitudes}
        />
        <MiniReadout label="Active charges" value={charges.length} />
        <MiniReadout
          label={`Net |F| on q${electrostatics.target?.id ?? '—'}`}
          value={<Num value={electrostatics.net.magnitude} />}
          unit="N"
        />
        {electrostatics.target && (
          <MiniToggle
            label={`Flip q${electrostatics.target.id}`}
            checked={electrostatics.target.q > 0}
            onChange={() => flipCharge(electrostatics.target!.id)}
          />
        )}
      </DemoControls>
      <EquationStrip
        leftLabel="Superposition"
        left={<M tex={superpositionTex} />}
        rightLabel="Live substitution"
        right={<M tex={liveSubstitutionTex} />}
      />
    </Demo>
  );
}
