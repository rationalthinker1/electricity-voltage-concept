---
name: ch24-rectifiers-inverters-audit
description: Findings from Rule A/B/C audit of Ch24RectifiersAndInverters.tsx
metadata:
  type: project
---

## Key findings from Ch24 audit

### Rule A — Term-popover-only for rectification, ripple, PWM duty cycle
All three of the caller-specified foundational quantities (rectification/half-wave/bridge,
ripple, and PWM duty cycle) are introduced exclusively inside `<Term def={…}>` popovers,
never in a visible three-tier narrative sequence. In particular:
- "ripple" is defined only inside a Term popover at L245–255 (the `<Term>` wraps the word
  "smoothing capacitor" but the ripple definition and its formula ΔV ≈ I/(2fC) lives only
  in the def prop). No standalone intuition → formal → operational tiers in prose.
- "duty cycle" is defined only inside a Term popover at L488–498.
- Rectification (half-wave, bridge) is introduced via Term popovers at L177–193, L219–241.
  Intuition is present in surrounding prose but no formal-tier definition in narrative.
This is the same Term-popover trap documented for Ch17.

### Rule A — Shockley equation: all three tiers present but V and I not unit-defined (Rule B boundary)
The Shockley equation's "where" paragraph (L89–108) names I_s, n, V_T but does NOT name
I (diode current, amperes) or V (applied voltage, volts). These are the left-hand-side
primary symbols.

### Rule B — L86 Shockley formula: I and V undefined in "where" paragraph
The glossary paragraph at L89 omits I (the diode current) and V (the applied voltage).

### Rule C — Post-demo UI-framing paragraphs appear AFTER demos, not before
L160–167 (after DiodeCharacteristicDemo), L270–274 (after BridgeRectifierDemo), and
L803–813 (after PWMInverterOutputDemo) all describe what to do with or what is visible
in the demo. These are post-demo, not pre-demo, so Rule C does NOT apply (Rule C only
catches paragraphs immediately *before* a demo). NOT flagged.

### Rule C — No pre-demo bridging paragraphs detected
No standalone paragraph immediately before any demo was found to be pure UI framing.
Pre-demo prose is always physics-forward.

