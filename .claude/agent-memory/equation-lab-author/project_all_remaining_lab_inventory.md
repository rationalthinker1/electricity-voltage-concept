# Equation Lab Author Memory: All Remaining Demo Links

Date: 2026-05-24

Scope:
- Completed the remaining orphan demo inventory after the chapter-specific Ch9-Ch12 passes.
- Added one shared equation-lab implementation, `src/labs/TopicEquationLab.tsx`, plus thin route wrappers for 20 topic labs.
- Added 20 manifest entries and route lazy-load entries.
- Inserted `deeperLab` pointers into the final 88 previously orphaned demos.
- Corrected the existing broken `BridgeRectifier` deeper lab slug from `rc-circuit` to `rectifier`.

New lab slugs:
- `network-analysis`
- `pn-junction`
- `transistor-iv`
- `fourier-series`
- `bode-filter`
- `op-amp`
- `transmission-line`
- `polarization-susceptibility`
- `snell-fresnel`
- `diffraction-interference`
- `antenna-radiation`
- `motor-torque-speed`
- `synchronous-machine`
- `transformer`
- `rectifier`
- `dc-dc-converter`
- `pwm-inverter`
- `cell-emf`
- `li-ion-cycling`
- `fiber-link`

Demo routing groups:
- Ch13 network analysis demos -> `network-analysis`
- Ch14 semiconductor junction demos -> `pn-junction`
- Ch14 transistor/amplifier demos -> `transistor-iv`
- Ch15 Fourier/harmonic demos -> `fourier-series`
- Ch16 op-amp demos -> `op-amp`
- Ch16 filter demo -> `bode-filter`
- Ch16 transmission-line demos -> `transmission-line`
- Ch17 materials/polarization demos -> `polarization-susceptibility`
- Ch18 Snell/Fresnel/refraction demos -> `snell-fresnel`
- Ch18 interference/diffraction/laser demos -> `diffraction-interference`
- Ch19 antenna/link/radiation demos -> `antenna-radiation`
- Ch20 motor demos -> `motor-torque-speed`
- Ch21 generator/grid sync demos -> `synchronous-machine`
- Ch23 transformer orphan demos -> `transformer`
- Ch24 rectifier/regulator demos -> `rectifier`
- Ch24 buck/boost/flyback demos -> `dc-dc-converter`
- Ch24 inverter demos -> `pwm-inverter`
- Ch25 electrochemistry demos -> `cell-emf`
- Ch26 battery/fuel-cell/supercapacitor demos -> `li-ion-cycling`
- Ch28/Ch30 house practical demos -> `house-wiring`
- Ch42 fiber demos -> `fiber-link`

Verification:
- Orphan check: 200 demos with `<Demo`, 200 with `deeperLab`, 0 orphans.
- Invalid slug check: 0 invalid `deeperLab` slugs.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Browser smoke test on all 20 new lab routes: all returned HTTP 200, rendered at least one canvas, and exposed at least 10 worked-problem prompts.
