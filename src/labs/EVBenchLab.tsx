import { LabShell } from '@/components/LabShell';

/**
 * Sandbox lab stub — full content authored in a follow-up pass.
 * The lab is registered in src/labs/data/manifest.ts with the hero
 * metadata, slug, and sources whitelist; the actual sandbox editor
 * lives in its own subfolder once the agent ships the content.
 */
const SLUG = 'ev-bench';

export default function EVBenchLab() {
  return (
    <LabShell
      slug={SLUG}
      labSubtitle=""
      labId=""
      labContent={
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
          <p>Sandbox under construction.</p>
        </div>
      }
      prose={<p>Content arriving in the next pass.</p>}
    />
  );
}
