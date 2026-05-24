# chapter-tag-bumper memory: manifest parser order

Date: 2026-05-24

`src/textbook/data/chapters.ts` stores each chapter entry as `slug` followed by `number`.
The old bumper script independently collected all `slug:` and `number:` matches and paired by
array index, which can be wrong when non-entry comments/types also contain nearby fields or when
the manifest shape changes.

The script now parses each chapter object with one regex:

`/{\s*slug:\s*'([^']+)',\s*number:\s*(\d+),/g`

Future checks should validate with an independent self-tag scan after running the bumper:
chapter file `Try`, `Case`, `Fig.`, and `id="ch.N..."` prefixes should match `getChapter(slug).number`.
