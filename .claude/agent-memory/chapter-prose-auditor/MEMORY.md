# Chapter Prose Auditor — persistent memory

- [JSX id/key hyphens are false positives](feedback_jsx-id-hyphen-false-positive.md) — `id="potential-point-charge"` and similar JSX attribute values are not prose hyphenation occurrences; filter them out before tallying consistency pairs.
- [Ch19 Antennas audit](project_ch19-audit.md) — two broken-hyphen artefacts (L76, L265); also documents `enviro?nment` grep false-positive trap.
- [Ch21 audit result](project_ch21-audit.md) — single broken-hyphen artefact `simple- cycle` at L494; otherwise clean.

- [Ch23 Transformers audit](project_ch23-audit.md) — two broken-hyphen artefacts (L1213, L1271); otherwise clean.
- [Ch26 Modern Batteries audit](project_ch26-audit.md) — clean; suspended-hyphen "Volume- and shape-optimized" at L537 confirmed false positive.
- [Ch27 House Grid Arrives audit](project_ch27-audit.md) — clean; "single- or split-phase" at L619 confirmed suspended-hyphen false positive.
- [Ch38 Smart Retrofits audit](project_ch38-audit.md) — clean; "leading- vs trailing-edge" at L8/L48 confirmed suspended-hyphen false positives.
- [Ch39 Outdoor/Wet audit](project_ch39-audit.md) — two broken-hyphen artefacts (L917, L1308); L92 suspended-hyphen false positive confirmed.
- [Ch41 EV Powertrain audit](project_ch41-audit.md) — one broken-hyphen artefact `vehicle- invariant` at L1037; otherwise clean.
- [Ch42 FiberOptics audit](project_ch42-audit.md) — clean on all four passes.
