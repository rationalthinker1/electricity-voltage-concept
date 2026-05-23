---
name: external-tools
description: External simulators, measurement apps, and published references known to integrate well with experimental labs in this project.
metadata:
  type: reference
---

The following tools are verified-good for experimental-lab design in this textbook. Each has a corresponding source key in `src/lib/sources.ts` (or should be added before citing).

## Simulators

- **PhET Interactive Simulations** (University of Colorado Boulder) — `https://phet.colorado.edu/`. Free, peer-reviewed, browser-based. Source keys: `phet-coulombs-law` (Coulomb's Law sim), `phet-charges-and-fields` (field-mapping sim). Other simulator pages on the same site are equally citable — add a new `phet-{slug}` source if needed. Best for: software-tool labs at intro difficulty, especially the inverse-square / superposition / field-line family.

- **Tracker — Video Analysis and Modeling Tool** (Open Source Physics, Douglas Brown) — `https://physlets.org/tracker/`. Free, desktop. Source key: `osp-tracker`. Best for: blended labs where a real-world experiment is filmed and the data is extracted frame-by-frame. Excellent fit for pith-ball pendula, projectile motion, oscillator decay.

- **Falstad applets** (Paul Falstad) — `https://www.falstad.com/mathphysics.html`. Free, browser-based. No source key registered yet — add `falstad-circuit-simulator` / `falstad-em-fields` when first needed. Best for: AC circuits, transmission-line standing waves, EM-wave propagation.

- **GeoGebra Classic** — `https://www.geogebra.org/`. Free, browser + desktop. No source key registered yet. Best for: geometric / field-line construction labs where the student manipulates the geometry directly.

- **LTspice** (Analog Devices) — free SPICE simulator. Best for: any Chapter 12+ circuit lab requiring transient or AC analysis at simulator-accurate fidelity. Heavier install than browser tools; lab should justify the friction.

## Measurement apps (hands-on labs)

- **Network Cell Info Lite** (Android) — `https://play.google.com/store/apps/details?id=com.wilysis.cellinfolite`. Reports cellular RSRP/RSSI and WiFi RSSI in dBm. Free, no signup. Used in E1.2 Faraday cage lab.

- **Field Test Mode** (iOS) — dial `*3001#12345#*` on iPhone. Exposes raw cellular signal levels in the same dBm units. Free, built-in. No app store needed. Used in E1.2 Faraday cage lab.

- **PhyPhox** (RWTH Aachen) — `https://phyphox.org/`. Free, both platforms. Reads accelerometer, magnetometer, gyroscope, microphone, light sensor at high sample rate. Best for: any lab where the phone itself is the measurement device (magnetic-field mapping, sound-frequency Fourier, optical-intensity labs).

## Published references useful as comparison targets

- **CODATA 2018** — `codata-2018` source key — the canonical SI constants. Use as the comparison target whenever a lab back-solves for a physical constant.

- **ITU-R Recommendation P.2040** — `itu-r-p2040` source key. Building-material attenuation tables for radio propagation. Used in E1.2 to anchor expected dB values for foil shielding.

- **CRC Handbook of Chemistry and Physics** — `crc-resistivity` (already registered, focused on resistivity tables). Good general fallback for resistivity, density, and thermal-property comparison values.

- **OpenStax University Physics II** — `libretexts-univ-physics`. Open-access, freely linkable from any lab. The first place to send students who want an alternative pedagogical treatment of the same equation.

- **HyperPhysics** (Georgia State, Carl Nave) — `hyperphysics-emag`. Concept map plus worked examples; useful when a student needs a second voice on a topic.

## Adding a new tool

If a lab needs a tool not listed here:
1. Add it to `src/lib/sources.ts` with real title/author/year/url/note. CLAUDE.md §5 is non-negotiable.
2. Append a one-paragraph entry to this file with the URL, the source key, and "best for: …".
3. Update [[MEMORY.md]] index entry if the category expands.
