/**
 * Demo D14.8 — Thin-lens focusing and image formation
 *
 * A thin convex (or concave) lens of focal length f. Three parallel rays
 * come in from the left and refract once at the lens plane. For a convex
 * lens they converge to the focal point at distance f to the right; for a
 * concave lens they diverge as if from a virtual focal point at distance
 * f to the left.
 *
 * A second mode places an object at distance d_o and traces the chief
 * rays (parallel-through-focus, through-centre, through-focus-then-
 * parallel) to locate the image at d_i obeying 1/f = 1/d_o + 1/d_i. The
 * magnification m = -d_i/d_o is displayed.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function LensFocusingDemo({ figure }: Props) {
  // focal length in cm; sign of f is set by lens type
  const [fAbs, setFAbs] = useState(8);          // |f| in cm
  const [convex, setConvex] = useState(true);
  const [dObj, setDObj] = useState(20);         // object distance in cm

  const stateRef = useRef({ fAbs, convex, dObj });
  useEffect(() => { stateRef.current = { fAbs, convex, dObj }; }, [fAbs, convex, dObj]);

  // For thin-lens equation: signed focal length. Convex: +f. Concave: -f.
  const f = convex ? fAbs : -fAbs;
  // 1/d_i = 1/f - 1/d_o
  const invDi = 1 / f - 1 / dObj;
  const dImg = 1 / invDi;
  const mag = -dImg / dObj;

  const setup = useCallback((info: CanvasInfo) => {
    const colors = getCanvasColors();
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { fAbs, convex, dObj } = stateRef.current;
      const f = convex ? fAbs : -fAbs;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Geometry: lens at x = lensX (centre); pixel scale: pxPerCm
      const lensX = W * 0.5;
      const axisY = H * 0.55;
      // Choose px/cm so a 40 cm scene fits with margins
      const pxPerCm = Math.min((W - 60) / 40, (H - 60) / 14);

      // Optical axis
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, axisY); ctx.lineTo(W - 20, axisY); ctx.stroke();

      // Lens shape — a vertical line with tick marks at top/bottom; convex looks like ()
      const lensHalfH = 60;
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (convex) {
        // Biconvex outline drawn as two arcs (lens body)
        ctx.moveTo(lensX, axisY - lensHalfH);
        ctx.quadraticCurveTo(lensX + 8, axisY, lensX, axisY + lensHalfH);
        ctx.moveTo(lensX, axisY - lensHalfH);
        ctx.quadraticCurveTo(lensX - 8, axisY, lensX, axisY + lensHalfH);
      } else {
        // Biconcave outline — pinch inwards
        ctx.moveTo(lensX - 8, axisY - lensHalfH);
        ctx.quadraticCurveTo(lensX, axisY, lensX - 8, axisY + lensHalfH);
        ctx.moveTo(lensX + 8, axisY - lensHalfH);
        ctx.quadraticCurveTo(lensX, axisY, lensX + 8, axisY + lensHalfH);
      }
      ctx.stroke();
      // Lens centre marker
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = colors.teal;
      ctx.beginPath(); ctx.arc(lensX, axisY, 2, 0, Math.PI * 2); ctx.fill();

      // Focal points on each side
      const fpx = pxPerCm * fAbs;
      ctx.restore();
      ctx.fillStyle = getCanvasColors().accent;
      function focalDot(x: number) {
        ctx.beginPath(); ctx.arc(x, axisY, 3.5, 0, Math.PI * 2); ctx.fill();
      }
      focalDot(lensX + fpx);
      focalDot(lensX - fpx);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.textAlign = 'center';
      ctx.fillText('F', lensX + fpx, axisY + 16);
      ctx.fillText('F', lensX - fpx, axisY + 16);

      // === Mode 1: three parallel rays from the left ===
      const rayYs = [-30, 0, 30];
      ctx.lineWidth = 1.3;
      for (const dy of rayYs) {
        const yIn = axisY + dy;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = colors.accent;
        // incoming horizontal ray
        ctx.beginPath();
        ctx.moveTo(20, yIn); ctx.lineTo(lensX, yIn);
        ctx.stroke();

        // After refraction: thin-lens approximation — ray crossing the lens at height h
        // emerges aimed at the focal point on the far side:
        //   convex: aimed at (lensX + f, axisY)
        //   concave: aimed away from the near-side virtual focal point (lensX + f, axisY) (with f < 0).
        // In either case the outgoing direction is from (lensX, yIn) toward (lensX + f, axisY).
        const targetX = lensX + (convex ? fpx : -fpx);
        const targetY = axisY;
        // Parametrize the outgoing ray and extend it to the right edge.
        const dx = targetX - lensX;
        const dyRay = targetY - yIn;
        // Extend out to xEnd
        const xEnd = W - 20;
        const t = (xEnd - lensX) / dx;
        const yEnd = yIn + dyRay * t;

        if (convex) {
          ctx.strokeStyle = getCanvasColors().accent;
          ctx.beginPath();
          ctx.moveTo(lensX, yIn); ctx.lineTo(xEnd, yEnd);
          ctx.stroke();
        } else {
          // Concave: outgoing ray diverges. Solid forward ray + dashed virtual extension back to focal point on near side.
          ctx.strokeStyle = getCanvasColors().accent;
          ctx.beginPath();
          // direction: from (lensX, yIn) AWAY from (lensX - fpx, axisY)
          const dvx = lensX - (lensX - fpx);
          const dvy = yIn - axisY;
          const norm = Math.hypot(dvx, dvy);
          const ux = dvx / norm;
          const uy = dvy / norm;
          ctx.moveTo(lensX, yIn);
          ctx.lineTo(lensX + ux * 220, yIn + uy * 220);
          ctx.stroke();
          // dashed back-extension to virtual focal point
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = 'rgba(255,107,42,0.35)';
          ctx.beginPath();
          ctx.moveTo(lensX, yIn);
          ctx.lineTo(lensX - fpx, axisY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // === Mode 2: object and image (only meaningful in convex case for a real image;
      //     we draw the object always, and only show the image arrow if d_i is finite
      //     and not absurd) ===
      const objHpx = 28;     // object arrow height
      const objX = lensX - pxPerCm * dObj;
      // Object arrow (red, upward)
      ctx.strokeStyle = getCanvasColors().pink;
      ctx.fillStyle = getCanvasColors().pink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(objX, axisY); ctx.lineTo(objX, axisY - objHpx); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(objX, axisY - objHpx);
      ctx.lineTo(objX - 4, axisY - objHpx + 6);
      ctx.lineTo(objX + 4, axisY - objHpx + 6);
      ctx.closePath(); ctx.fill();

      // Image arrow
      const invDi = 1 / f - 1 / dObj;
      const di = 1 / invDi;
      const m = -di / dObj;
      if (Number.isFinite(di) && Math.abs(di) * pxPerCm < W && Math.abs(m) < 30) {
        const imgX = lensX + pxPerCm * di;
        const imgHpx = objHpx * m;     // signed; negative m → inverted (downward)
        ctx.strokeStyle = getCanvasColors().blue;
        ctx.fillStyle = getCanvasColors().blue;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(imgX, axisY); ctx.lineTo(imgX, axisY - imgHpx); ctx.stroke();
        // Arrowhead
        const dir = imgHpx < 0 ? 1 : -1;
        const tipY = axisY - imgHpx;
        ctx.beginPath();
        ctx.moveTo(imgX, tipY);
        ctx.lineTo(imgX - 4, tipY + 6 * dir);
        ctx.lineTo(imgX + 4, tipY + 6 * dir);
        ctx.closePath(); ctx.fill();

        // Chief rays from the object tip:
        //   1) parallel to axis → through far focal point (convex) or away from near focal point (concave)
        //   2) through lens centre, undeviated
        ctx.lineWidth = 1;
        const tipX = objX;
        const tipY0 = axisY - objHpx;

        // (a) horizontal from tip to lens
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.beginPath(); ctx.moveTo(tipX, tipY0); ctx.lineTo(lensX, tipY0); ctx.stroke();
        // then from lens toward far focal point and beyond to image-tip x
        const farFx = lensX + (convex ? fpx : -fpx);
        const farFy = axisY;
        const a_dx = farFx - lensX;
        const a_dy = farFy - tipY0;
        if (Math.abs(a_dx) > 0.5) {
          const tA = (imgX - lensX) / a_dx;
          const yA = tipY0 + a_dy * tA;
          ctx.beginPath(); ctx.moveTo(lensX, tipY0); ctx.lineTo(imgX, yA); ctx.stroke();
        }
        // (b) ray through centre, undeviated
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY0);
        // extend through (lensX, axisY) to imgX
        const slope = (axisY - tipY0) / (lensX - tipX);
        const yB = tipY0 + slope * (imgX - tipX);
        ctx.lineTo(imgX, yB);
        ctx.stroke();
      }

      // Labels
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText(`f = ${convex ? '+' : '−'}${fAbs.toFixed(1)} cm`, 12, 18);
      ctx.fillText(`d₀ = ${dObj.toFixed(1)} cm`, 12, 34);
      ctx.fillStyle = convex ? 'rgba(108,197,194,0.9)' : 'rgba(255,107,42,0.9)';
      ctx.textAlign = 'right';
      ctx.fillText(convex ? 'convex' : 'concave', W - 12, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.8'}
      title="Thin-lens focusing — 1/f = 1/d₀ + 1/dᵢ"
      question="Where does the image form, and how big is it?"
      caption={<>
        Parallel rays (orange) hit a thin lens and refract once. A <strong>convex</strong> lens
        bends them toward the far focal point F at distance f; a <strong>concave</strong> lens makes
        them appear to diverge from the near focal point. With an object (pink arrow) at distance
        <strong> d₀</strong>, the thin-lens equation <strong>1/f = 1/d₀ + 1/dᵢ</strong> locates the
        image (blue arrow), and the magnification is <strong>m = −dᵢ/d₀</strong>. Negative m means
        inverted; |m| &gt; 1 means enlarged.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="|f|" value={fAbs} min={3} max={15} step={0.1}
          format={v => v.toFixed(1) + ' cm'} onChange={setFAbs} />
        <MiniSlider label="d₀" value={dObj} min={4} max={30} step={0.1}
          format={v => v.toFixed(1) + ' cm'} onChange={setDObj} />
        <MiniToggle label={convex ? 'convex' : 'concave'} checked={convex} onChange={setConvex} />
        <MiniReadout label="dᵢ" value={Number.isFinite(dImg) ? dImg.toFixed(2) : '∞'} unit="cm" />
        <MiniReadout label="m" value={Number.isFinite(mag) ? mag.toFixed(2) : '—'} unit="×" />
      </DemoControls>
    </Demo>
  );
}
