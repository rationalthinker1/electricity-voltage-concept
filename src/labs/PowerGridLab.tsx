import { LabShell } from '@/components/LabShell';

/**
 * Sandbox lab stub — full content authored in a follow-up pass.
 * The lab is registered in src/labs/data/manifest.ts with the hero
 * metadata, slug, and sources whitelist; the actual one-line-diagram
 * editor + power-flow solver lives in src/labs/power-grid/ once the
 * agent ships the content.
 */
const SLUG = 'power-grid';

export default function PowerGridLab() {
  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Sandbox"
      labId="power-grid"
      labContent={
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
          <p>Sandbox under construction — see the deck above for what this lab will eventually let you build.</p>
        </div>
      }
      prose={<p>Content arriving in the next pass.</p>}
    />
  );
}
