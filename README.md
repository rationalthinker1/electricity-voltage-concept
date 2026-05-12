# Field · Theory

An interactive web essay on how electricity actually works — voltage as a field property, energy flow via the Poynting vector, and the orders-of-magnitude gap between electron drift and signal propagation.

Built for a technical reader who wants the real picture, not the marble-in-a-pipe metaphor.

## Run it

```bash
npx http-server -p 8080 -c-1
```

Or open `index.html` directly.

## Structure

```
field-theory/
├── index.html              Main essay + nav hub
├── assets/
│   ├── styles.css          Shared design system
│   └── shared.js           Physics constants + UI helpers
└── pages/
    ├── potential.html      V = −∫E·dl  (draggable charges + probes)
    ├── ohms-law.html       J = σE       (material + geometry sliders)
    ├── poynting.html       S = E×B/μ₀  (energy flow around a wire)
    └── drift.html          vd = I/(nqA) (how slow electrons actually are)
```

## Sources

- Feynman Lectures on Physics Vol II, Ch. 27
- Davis & Kaplan, *Am. J. Phys.* 79 (2011)
- Morris & Styer, *Am. J. Phys.* (2012)
