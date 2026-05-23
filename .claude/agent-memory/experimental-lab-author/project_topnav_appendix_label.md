---
name: topnav-appendix-label
description: src/components/TopNav.tsx hardcodes "Lab N · appendix" for every /labs/* route, including experimental labs that aren't appendix content.
metadata:
  type: project
---

The top-right meta label in `TopNav` reads `Lab {lab.number} · appendix` for *every* lab page (see `src/components/TopNav.tsx:42`). This is pre-existing — the original design assumed all labs were equation-lab appendix content.

For experimental labs that live inside a chapter group (E1.1, E1.2, …), the "appendix" suffix is misleading; those labs are first-class chapter material, not appendix sandboxes.

**Why this matters:** Authoring more experimental labs without fixing the label will compound the inconsistency. The label appears on every page load, top-right.

**How to apply:**
- Do *not* fix the label as part of a lab-authoring task — it's a separate concern that touches a shared component, and a one-off lab author shouldn't introduce nav refactors.
- *Do* mention it in your end-of-turn report when the user is reviewing the new lab — they may want to schedule the fix.
- The probable fix is to read `lab.kind` in `TopNav.tsx:42` and branch: `lab.kind === 'experimental' ? \`Lab ${lab.number} · chapter ${chapterNum}\` : \`Lab ${lab.number} · appendix\``. The chapter number can be looked up by finding the CHAPTERS entry whose `slug` matches the lab's `chapter` ChapterId.
