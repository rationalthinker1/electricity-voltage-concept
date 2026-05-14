/**
 * Demo D30.1 — Wire a 3-way switch correctly.
 *
 * The reader sees a 120 V source on the left, a bulb on the right, and two
 * three-way switches in between. Eight terminals are exposed. The reader
 * clicks one terminal to start a wire, clicks another to finish it. Click a
 * wire again to delete it. Click a switch body to toggle it. There is a
 * "Reset wiring" button.
 *
 * Correct topology (one of two valid wirings):
 *   power-hot      → s1-common
 *   s1-t1          → s2-t1
 *   s1-t2          → s2-t2
 *   s2-common      → bulb-hot
 *   power-neutral  → bulb-neutral
 *
 * Bulb-lighting test:
 *   1. Build an undirected graph from the wires plus an implicit edge for
 *      each switch (common ↔ traveller-it-currently-selects).
 *   2. Check whether power-hot reaches bulb-hot AND power-neutral reaches
 *      bulb-neutral. If yes, the bulb is lit.
 *
 * Beginner-mistake feedback:
 *   - Wiring both travellers of a switch into the same terminal of the
 *     other switch (the redundant-pair mistake) is highlighted as
 *     "redundant traveller pairing".
 *   - Wiring the neutral through a switch is highlighted as
 *     "neutral must bypass the switch".
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout } from '@/components/Demo';
import { drawCircuit, drawGlowPath, type CircuitElement } from '@/lib/canvasPrimitives';

type TerminalId =
  | 'power-hot' | 'power-neutral'
  | 's1-common' | 's1-t1' | 's1-t2'
  | 's2-common' | 's2-t1' | 's2-t2'
  | 'bulb-hot'  | 'bulb-neutral';

interface Wire { id: string; from: TerminalId; to: TerminalId }

interface Props { figure?: string }

const ALL_TERMINALS: TerminalId[] = [
  'power-hot', 'power-neutral',
  's1-common', 's1-t1', 's1-t2',
  's2-common', 's2-t1', 's2-t2',
  'bulb-hot',  'bulb-neutral',
];

const TERMINAL_LABEL: Record<TerminalId, string> = {
  'power-hot':    'L-hot',
  'power-neutral':'L-neu',
  's1-common':    'S1 com',
  's1-t1':        'S1 t1',
  's1-t2':        'S1 t2',
  's2-common':    'S2 com',
  's2-t1':        'S2 t1',
  's2-t2':        'S2 t2',
  'bulb-hot':     'B-hot',
  'bulb-neutral': 'B-neu',
};

/** True if t belongs to a switch (S1 or S2). */
function isSwitchTerminal(t: TerminalId): boolean {
  return t.startsWith('s1-') || t.startsWith('s2-');
}
/** True if t is the neutral side (source or sink). */
function isNeutralTerminal(t: TerminalId): boolean {
  return t === 'power-neutral' || t === 'bulb-neutral';
}

/** Layout: returns canvas-pixel coordinates for every terminal. */
function layout(w: number, h: number): Record<TerminalId, { x: number; y: number }> {
  const cx = w / 2;
  const cy = h / 2;
  // Source on the left, switches in the middle, bulb on the right.
  const srcX  = 56;
  const s1X   = cx - 90;
  const s2X   = cx + 90;
  const bulbX = w - 56;
  const topY  = cy - 70;
  const botY  = cy + 70;
  const swComY  = cy + 60;     // switch common terminal (lower)
  const swT1Y   = cy - 60;     // upper traveller
  const swT2Y   = cy - 18;     // lower traveller
  return {
    'power-hot':    { x: srcX,   y: topY },
    'power-neutral':{ x: srcX,   y: botY },
    's1-common':    { x: s1X,    y: swComY },
    's1-t1':        { x: s1X - 22, y: swT1Y },
    's1-t2':        { x: s1X + 22, y: swT2Y },
    's2-common':    { x: s2X,    y: swComY },
    's2-t1':        { x: s2X - 22, y: swT1Y },
    's2-t2':        { x: s2X + 22, y: swT2Y },
    'bulb-hot':     { x: bulbX,  y: topY },
    'bulb-neutral': { x: bulbX,  y: botY },
  };
}

/** Which traveller terminal a switch's common is bonded to in a given position. */
function selectedTraveller(switchId: 's1' | 's2', position: 'up' | 'down'): TerminalId {
  return position === 'up'
    ? (switchId === 's1' ? 's1-t1' : 's2-t1')
    : (switchId === 's1' ? 's1-t2' : 's2-t2');
}

/**
 * Build an adjacency map: terminal → set of terminals it is electrically
 * tied to via wires PLUS the current switch state.
 */
function buildAdjacency(
  wires: Wire[],
  s1: 'up' | 'down',
  s2: 'up' | 'down',
): Map<TerminalId, Set<TerminalId>> {
  const adj = new Map<TerminalId, Set<TerminalId>>();
  for (const t of ALL_TERMINALS) adj.set(t, new Set());
  const add = (a: TerminalId, b: TerminalId) => {
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };
  for (const w of wires) add(w.from, w.to);
  // Implicit switch edges.
  add('s1-common', selectedTraveller('s1', s1));
  add('s2-common', selectedTraveller('s2', s2));
  return adj;
}

/** BFS — are a and b connected in the adjacency graph? */
function connected(adj: Map<TerminalId, Set<TerminalId>>, a: TerminalId, b: TerminalId): boolean {
  if (a === b) return true;
  const seen = new Set<TerminalId>([a]);
  const q: TerminalId[] = [a];
  while (q.length) {
    const cur = q.shift()!;
    for (const n of adj.get(cur)!) {
      if (n === b) return true;
      if (!seen.has(n)) { seen.add(n); q.push(n); }
    }
  }
  return false;
}

/**
 * Identify beginner mistakes in the current wiring.
 * Returns { mistakes, badWireIds } — bad wires get a red highlight.
 */
function diagnose(wires: Wire[]): { mistakes: string[]; badWireIds: Set<string> } {
  const mistakes: string[] = [];
  const badWireIds = new Set<string>();

  // Mistake 1: a switch's two travellers wired into the SAME terminal of the
  // other switch. Detect by counting how many wires bridge s1-travellers
  // into s2-travellers and whether the s2-side endpoints collide.
  const s1tToS2t: Wire[] = wires.filter(w =>
    ((w.from === 's1-t1' || w.from === 's1-t2') && (w.to === 's2-t1' || w.to === 's2-t2')) ||
    ((w.from === 's2-t1' || w.from === 's2-t2') && (w.to === 's1-t1' || w.to === 's1-t2')),
  );
  // Group by the s2-side endpoint.
  const byS2: Record<string, Wire[]> = {};
  for (const w of s1tToS2t) {
    const s2end = (w.from === 's2-t1' || w.from === 's2-t2') ? w.from : w.to;
    (byS2[s2end] = byS2[s2end] || []).push(w);
  }
  for (const k of Object.keys(byS2)) {
    if (byS2[k]!.length > 1) {
      mistakes.push('Both travellers landing on the same screw — each switch needs its own pair.');
      for (const w of byS2[k]!) badWireIds.add(w.id);
    }
  }

  // Mistake 2: neutral routed through a switch. Any wire that has one
  // endpoint on a neutral side (power-neutral or bulb-neutral) and the other
  // endpoint on any switch terminal is flagged.
  for (const w of wires) {
    const a = w.from;
    const b = w.to;
    if ((isNeutralTerminal(a) && isSwitchTerminal(b)) ||
        (isNeutralTerminal(b) && isSwitchTerminal(a))) {
      if (!mistakes.includes('Switches must interrupt the hot only — neutral goes straight to the bulb.')) {
        mistakes.push('Switches must interrupt the hot only — neutral goes straight to the bulb.');
      }
      badWireIds.add(w.id);
    }
  }

  return { mistakes, badWireIds };
}

export function ThreeWaySwitchBuilderDemo({ figure }: Props) {
  const [wires, setWires] = useState<Wire[]>([]);
  const [s1, setS1] = useState<'up' | 'down'>('up');
  const [s2, setS2] = useState<'up' | 'down'>('up');
  const [inProgressFrom, setInProgressFrom] = useState<TerminalId | null>(null);
  const [hoverTerm, setHoverTerm] = useState<TerminalId | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const { mistakes, badWireIds } = useMemo(() => diagnose(wires), [wires]);

  // Compute bulb state.
  const { hotPath, neutralPath, bulbLit } = useMemo(() => {
    const adj = buildAdjacency(wires, s1, s2);
    const hot = connected(adj, 'power-hot', 'bulb-hot');
    const neu = connected(adj, 'power-neutral', 'bulb-neutral');
    return { hotPath: hot, neutralPath: neu, bulbLit: hot && neu };
  }, [wires, s1, s2]);

  // State refs for the canvas draw loop.
  const stateRef = useRef({ wires, s1, s2, inProgressFrom, hoverTerm, pointer, badWireIds, bulbLit });
  useEffect(() => {
    stateRef.current = { wires, s1, s2, inProgressFrom, hoverTerm, pointer, badWireIds, bulbLit };
  }, [wires, s1, s2, inProgressFrom, hoverTerm, pointer, badWireIds, bulbLit]);

  // Stable callbacks the canvas needs to call.
  const handleTerminalClick = useCallback((t: TerminalId) => {
    setInProgressFrom(prev => {
      if (prev === null) return t;
      if (prev === t) return null;
      // Complete a wire (no duplicate from↔to).
      setWires(ws => {
        const exists = ws.some(w =>
          (w.from === prev && w.to === t) || (w.from === t && w.to === prev),
        );
        if (exists) return ws;
        return [...ws, { id: `${prev}-${t}-${Date.now().toString(36)}`, from: prev, to: t }];
      });
      return null;
    });
  }, []);
  const handleSwitchClick = useCallback((id: 's1' | 's2') => {
    if (id === 's1') setS1(p => p === 'up' ? 'down' : 'up');
    else setS2(p => p === 'up' ? 'down' : 'up');
  }, []);
  const handleWireClick = useCallback((id: string) => {
    setWires(ws => ws.filter(w => w.id !== id));
  }, []);
  const reset = useCallback(() => {
    setWires([]);
    setInProgressFrom(null);
  }, []);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    let raf = 0;

    function getXY(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? (e.touches[0] ?? e.changedTouches[0]) : e;
      if (!t) return [-1, -1];
      return [t.clientX - r.left, t.clientY - r.top];
    }

    function pickTerminal(mx: number, my: number): TerminalId | null {
      const L = layout(w, h);
      let best: TerminalId | null = null;
      let bestD = 14; // px hit radius
      for (const t of ALL_TERMINALS) {
        const p = L[t];
        const d = Math.hypot(mx - p.x, my - p.y);
        if (d < bestD) { bestD = d; best = t; }
      }
      return best;
    }

    function pickSwitch(mx: number, my: number): 's1' | 's2' | null {
      // Switch hit region: roughly between its three terminals, plus a margin.
      const L = layout(w, h);
      for (const sw of (['s1', 's2'] as const)) {
        const cx = L[`${sw}-common`].x;
        const yMin = L[`${sw}-t1`].y - 14;
        const yMax = L[`${sw}-common`].y + 14;
        if (mx > cx - 30 && mx < cx + 30 && my > yMin && my < yMax) {
          // Don't intercept clicks that land on the terminals themselves.
          if (!pickTerminal(mx, my)) return sw;
        }
      }
      return null;
    }

    function pickWire(mx: number, my: number): string | null {
      const { wires: ws } = stateRef.current;
      const L = layout(w, h);
      let bestId: string | null = null;
      let bestD = 6;
      for (const wr of ws) {
        const a = L[wr.from];
        const b = L[wr.to];
        const d = distToSeg(mx, my, a.x, a.y, b.x, b.y);
        if (d < bestD) { bestD = d; bestId = wr.id; }
      }
      return bestId;
    }

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if ('touches' in e) e.preventDefault();
      const [mx, my] = getXY(e);
      if (mx < 0) return;
      const term = pickTerminal(mx, my);
      if (term) { handleTerminalClick(term); return; }
      const wireId = pickWire(mx, my);
      if (wireId) { handleWireClick(wireId); return; }
      const sw = pickSwitch(mx, my);
      if (sw) { handleSwitchClick(sw); return; }
      // Click on empty canvas cancels in-progress wire.
      setInProgressFrom(null);
    }

    function onPointerMove(e: MouseEvent | TouchEvent) {
      const [mx, my] = getXY(e);
      if (mx < 0) return;
      const term = pickTerminal(mx, my);
      setHoverTerm(term);
      setPointer({ x: mx, y: my });
      const overWire = pickWire(mx, my);
      const overSwitch = pickSwitch(mx, my);
      canvas.style.cursor = term || overSwitch || overWire ? 'pointer' : 'default';
    }
    function onPointerLeave() {
      setHoverTerm(null);
      setPointer(null);
    }

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove',  onPointerMove, { passive: false });

    function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
      const dx = bx - ax, dy = by - ay;
      const len2 = dx * dx + dy * dy;
      if (len2 === 0) return Math.hypot(px - ax, py - ay);
      let t = ((px - ax) * dx + (py - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    }

    function draw() {
      const st = stateRef.current;
      const L = layout(w, h);

      // Background.
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Static elements: power source (battery), bulb, switches drawn manually.
      const staticElements: CircuitElement[] = [
        // Source label box on the left — vertical battery glyph.
        { kind: 'battery', at: { x: L['power-hot'].x, y: (L['power-hot'].y + L['power-neutral'].y) / 2 },
          color: 'rgba(236,235,229,.7)',
          label: '120 V', labelOffset: { x: -22, y: 0 },
          leadLength: (L['power-neutral'].y - L['power-hot'].y) / 2,
          plateGap: 8,
          positivePlateLength: 24,
          negativePlateLength: 14 },
        // Bulb on the right.
        { kind: 'bulb', at: { x: L['bulb-hot'].x, y: (L['bulb-hot'].y + L['bulb-neutral'].y) / 2 },
          radius: 16,
          brightness: st.bulbLit ? 1 : 0,
          label: 'lamp', labelOffset: { x: 0, y: 36 } },
        // Short stub leads from the bulb's body to its terminal dots.
        { kind: 'wire',
          points: [
            { x: L['bulb-hot'].x, y: L['bulb-hot'].y },
            { x: L['bulb-hot'].x, y: (L['bulb-hot'].y + L['bulb-neutral'].y) / 2 - 16 },
          ],
          color: 'rgba(236,235,229,.45)', lineWidth: 2 },
        { kind: 'wire',
          points: [
            { x: L['bulb-neutral'].x, y: (L['bulb-hot'].y + L['bulb-neutral'].y) / 2 + 16 },
            { x: L['bulb-neutral'].x, y: L['bulb-neutral'].y },
          ],
          color: 'rgba(236,235,229,.45)', lineWidth: 2 },
      ];
      drawCircuit(ctx, { elements: staticElements });

      // Draw switch bodies (custom — they have three terminals).
      for (const sw of (['s1', 's2'] as const)) {
        const com = L[`${sw}-common`];
        const t1  = L[`${sw}-t1`];
        const t2  = L[`${sw}-t2`];
        const pos = sw === 's1' ? st.s1 : st.s2;
        const active = pos === 'up' ? t1 : t2;

        // Box outline around the switch.
        ctx.save();
        ctx.strokeStyle = 'rgba(160,158,149,.35)';
        ctx.lineWidth = 1;
        const boxL = Math.min(t1.x, t2.x, com.x) - 14;
        const boxR = Math.max(t1.x, t2.x, com.x) + 14;
        const boxT = Math.min(t1.y, t2.y, com.y) - 14;
        const boxB = Math.max(t1.y, t2.y, com.y) + 14;
        ctx.strokeRect(boxL, boxT, boxR - boxL, boxB - boxT);
        ctx.fillStyle = 'rgba(160,158,149,.7)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(sw.toUpperCase(), (boxL + boxR) / 2, boxT - 4);
        ctx.restore();

        // Blade — the internal SPDT contact from common to active traveller.
        ctx.save();
        ctx.strokeStyle = '#ff6b2a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(com.x, com.y);
        ctx.lineTo(active.x, active.y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw wires the reader has placed.
      for (const wr of st.wires) {
        const a = L[wr.from];
        const b = L[wr.to];
        const isBad = st.badWireIds.has(wr.id);
        if (isBad) {
          drawGlowPath(ctx, [a, b], {
            color: '#ff3b6e',
            glowColor: 'rgba(255,59,110,.35)',
            lineWidth: 2.4, glowWidth: 7,
          });
        } else if (st.bulbLit) {
          drawGlowPath(ctx, [a, b], {
            color: '#ff6b2a',
            glowColor: 'rgba(255,107,42,.32)',
            lineWidth: 2.2, glowWidth: 6,
          });
        } else {
          ctx.save();
          ctx.strokeStyle = 'rgba(236,235,229,.6)';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // In-progress rubber-band wire from the held terminal to the pointer.
      if (st.inProgressFrom && st.pointer) {
        const a = L[st.inProgressFrom];
        ctx.save();
        ctx.strokeStyle = 'rgba(255,107,42,.55)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(st.pointer.x, st.pointer.y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw terminal dots on top.
      for (const t of ALL_TERMINALS) {
        const p = L[t];
        const isHover = st.hoverTerm === t;
        const isHeld = st.inProgressFrom === t;
        const isPower = t === 'power-hot' || t === 'power-neutral';
        const isBulb  = t === 'bulb-hot'  || t === 'bulb-neutral';
        const isHot   = t === 'power-hot' || t === 'bulb-hot';
        const isNeu   = t === 'power-neutral' || t === 'bulb-neutral';
        ctx.save();
        let fill = 'rgba(236,235,229,.8)';
        if (isHot && (isPower || isBulb)) fill = '#ff3b6e';
        else if (isNeu && (isPower || isBulb)) fill = '#5baef8';
        else if (isSwitchTerminal(t)) fill = '#ecebe5';
        ctx.fillStyle = fill;
        if (isHeld) {
          ctx.strokeStyle = '#ff6b2a';
          ctx.lineWidth = 2;
        } else if (isHover) {
          ctx.strokeStyle = 'rgba(255,107,42,.65)';
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = 'rgba(0,0,0,.35)';
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHover || isHeld ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Label below terminals (above for the top row).
        ctx.fillStyle = 'rgba(160,158,149,.85)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = p.y < h / 2 ? 'bottom' : 'top';
        const dy = p.y < h / 2 ? -10 : 10;
        ctx.fillText(TERMINAL_LABEL[t], p.x, p.y + dy);
        ctx.restore();
      }

      // Footer hint.
      ctx.save();
      ctx.fillStyle = 'rgba(160,158,149,.65)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const hint = st.inProgressFrom
        ? `wiring from ${TERMINAL_LABEL[st.inProgressFrom]} — click another terminal to complete (or empty space to cancel)`
        : 'click a terminal to start a wire · click a wire to delete · click a switch body to toggle';
      ctx.fillText(hint, w / 2, h - 6);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      canvas.removeEventListener('mouseleave', onPointerLeave);
      canvas.removeEventListener('touchstart', onPointerDown);
      canvas.removeEventListener('touchmove',  onPointerMove);
    };
  }, [handleSwitchClick, handleTerminalClick, handleWireClick]);

  return (
    <Demo
      figure={figure ?? 'Fig. 30.4'}
      title="Wire it yourself: the three-way XOR"
      question="Wire the bulb so it lights from either switch. There is one correct topology."
      caption={
        <>
          Click any terminal to start a wire, then click another terminal to finish it. Click a wire to delete it. Click either switch's body to flip its position. The bulb lights when there is a closed path from <strong>L-hot</strong> through both switches to <strong>B-hot</strong> and a separate path from <strong>L-neu</strong> to <strong>B-neu</strong>. If you wire something obviously wrong — both travellers landing on the same screw, or the neutral routed through a switch — the offending wire turns red.
        </>
      }
    >
      <AutoResizeCanvas height={340} setup={setup} ariaLabel="Three-way switch wiring builder" />
      <DemoControls>
        <MiniReadout label="S1" value={s1 === 'up' ? 'up (t1)' : 'down (t2)'} />
        <MiniReadout label="S2" value={s2 === 'up' ? 'up (t1)' : 'down (t2)'} />
        <MiniReadout
          label="hot path"
          value={hotPath ? 'closed' : 'open'}
        />
        <MiniReadout
          label="neutral path"
          value={neutralPath ? 'closed' : 'open'}
        />
        <MiniReadout label="bulb" value={bulbLit ? 'lit' : 'dark'} />
        <button type="button" className="mini-toggle" onClick={reset}>Reset wiring</button>
      </DemoControls>
      {mistakes.length > 0 && (
        <ul style={{
          margin: '6px 0 0',
          padding: '8px 14px',
          listStyle: 'square',
          fontSize: 12,
          color: '#ff3b6e',
          background: 'rgba(255,59,110,.06)',
          border: '1px solid rgba(255,59,110,.25)',
          borderRadius: 4,
        }}>
          {mistakes.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      )}
    </Demo>
  );
}
