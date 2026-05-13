/**
 * Demo D18.6 — The grid as a transformer hierarchy
 *
 * Static-ish labelled diagram: generator → step-up → transmission tower →
 * substation → distribution → pole transformer → house. Voltage labels at
 * each step. Hover/click a stage to "select" it and read a short note in
 * the panel below.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout } from '@/components/Demo';

interface Props { figure?: string }

interface Stage {
  key: string;
  label: string;
  voltage: string;
  blurb: string;
}

const STAGES: Stage[] = [
  { key: 'gen',    label: 'Generator',         voltage: '25 kV',    blurb: 'Stator winding terminal voltage, limited by insulation.' },
  { key: 'step1',  label: 'Step-up transformer', voltage: '25 → 500 kV', blurb: 'Generator step-up (GSU): raises to transmission voltage at the power plant.' },
  { key: 'trans',  label: 'Transmission line', voltage: '500 kV',   blurb: 'EHV/UHV overhead line; high V → low I → low I²R losses.' },
  { key: 'sub1',   label: 'Substation',        voltage: '500 → 138 kV', blurb: 'Bulk substation: HV to regional sub-transmission.' },
  { key: 'sub2',   label: 'Distribution substation', voltage: '138 → 12.47 kV', blurb: 'Distribution substation: down to the neighbourhood feeder.' },
  { key: 'pole',   label: 'Pole transformer',  voltage: '12.47 kV → 240 V', blurb: 'The "pole-pig": single-phase tap, 240 V centre-tapped for your house.' },
  { key: 'house',  label: 'House',             voltage: '240 / 120 V', blurb: 'Split-phase wall outlets in North America.' },
];

export function GridHierarchyDemo({ figure }: Props) {
  const [selected, setSelected] = useState('gen');

  const stateRef = useRef({ selected });
  useEffect(() => { stateRef.current.selected = selected; }, [selected]);

  // Hit regions for canvas
  const hitsRef = useRef<{ key: string; x: number; y: number; w: number; h: number }[]>([]);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;

    function onClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      for (const hit of hitsRef.current) {
        if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) {
          setSelected(hit.key);
          break;
        }
      }
    }
    canvas.addEventListener('click', onClick);

    function draw() {
      const { selected } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cy = h / 2;
      const padX = 12;
      const n = STAGES.length;
      const slotW = (w - 2 * padX) / n;
      const blockW = Math.min(slotW - 8, 80);
      const blockH = 56;

      hitsRef.current = [];

      // Wires connecting boxes (drawn first so blocks sit on top)
      ctx.strokeStyle = 'rgba(255,107,42,0.6)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < n - 1; i++) {
        const xA = padX + (i + 0.5) * slotW + blockW / 2;
        const xB = padX + (i + 1.5) * slotW - blockW / 2;
        ctx.beginPath();
        ctx.moveTo(xA, cy); ctx.lineTo(xB, cy); ctx.stroke();
      }

      for (let i = 0; i < n; i++) {
        const s = STAGES[i];
        const cx = padX + (i + 0.5) * slotW;
        const bx = cx - blockW / 2;
        const by = cy - blockH / 2;
        const isSel = s.key === selected;
        ctx.fillStyle = isSel ? '#1c1c22' : '#16161a';
        ctx.strokeStyle = isSel ? 'rgba(255,107,42,0.95)' : 'rgba(160,158,149,0.5)';
        ctx.lineWidth = isSel ? 2 : 1.2;
        ctx.fillRect(bx, by, blockW, blockH);
        ctx.strokeRect(bx, by, blockW, blockH);

        ctx.fillStyle = isSel ? 'rgba(255,107,42,0.95)' : 'rgba(236,235,229,0.85)';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        // multi-line label: split on space if long
        const lbl = s.label;
        const words = lbl.split(' ');
        if (words.length > 1 && lbl.length > 10) {
          ctx.fillText(words.slice(0, Math.ceil(words.length / 2)).join(' '), cx, by + 14);
          ctx.fillText(words.slice(Math.ceil(words.length / 2)).join(' '), cx, by + 26);
        } else {
          ctx.fillText(lbl, cx, by + 18);
        }
        ctx.fillStyle = 'rgba(108,197,194,0.85)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(s.voltage, cx, by + blockH - 12);

        hitsRef.current.push({ key: s.key, x: bx, y: by, w: blockW, h: blockH });
      }

      // raf = requestAnimationFrame(draw);  // static is fine; only redraw when selection changes
    }

    // Redraw whenever selection state ref changes; use rAF loop to keep simple.
    function loop() {
      draw();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  const sel = STAGES.find(s => s.key === selected) ?? STAGES[0];

  return (
    <Demo
      figure={figure ?? 'Fig. 18.6'}
      title="The grid as a stack of transformers"
      question="From power plant to wall outlet: how many transformers, what voltages?"
      caption={<>
        Click any stage. Energy leaves a generating station at ~25 kV (stator-insulation limit), gets bumped
        up to 230–765 kV for cross-country transmission (low loss), and is stepped back down in stages at every
        substation along the way. The last transformer in the chain — the "pole-pig" on the wooden pole outside
        your house — drops 12.47 kV single-phase to the 240/120 V split-phase that powers your kitchen.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <div ref={canvasContainerRef}>
        <AutoResizeCanvas height={200} setup={setup} />
      </div>
      <DemoControls>
        <MiniReadout label="selected" value={sel.label} />
        <MiniReadout label="voltage" value={sel.voltage} />
      </DemoControls>
      <p style={{
        margin: '8px 0 0',
        fontSize: '0.85rem',
        color: 'var(--text-dim)',
        fontStyle: 'italic',
      }}>
        {sel.blurb}
      </p>
    </Demo>
  );
}
