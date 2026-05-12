import { LabShell } from '@/components/LabShell';
import { LabGrid } from '@/components/LabLayout';
import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { useCallback } from 'react';

const SLUG = 'resistance';

export default function ResistanceLab() {
  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    ctx.fillStyle = '#0d0d10';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff6b2a';
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Lab visualization coming up…', w / 2, h / 2);
  }, []);

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Interactive Lab"
      labId="placeholder"
      labContent={
        <LabGrid
          canvas={<AutoResizeCanvas height={380} setup={setup} />}
          inputs={<p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Controls porting from vanilla source — in progress.</p>}
          outputs={<p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Readouts porting from vanilla source — in progress.</p>}
        />
      }
      prose={
        <>
          <h3>Porting in progress</h3>
          <p style={{ color: 'var(--text-dim)' }}>
            The vanilla version of this lab is available at <code>/pages/resistance.html</code> and
            is being ported to a React component with verified sources. The prose, sliders, viz,
            and sources will all appear here once the migration is complete.
          </p>
        </>
      }
    />
  );
}
