---
name: short-circuit-hyphenation
description: Ch3 uses both "short circuit" (noun) and "short-circuit" (adjective/modifier); both are grammatically correct in context.
metadata:
  type: project
---

In Ch3ResistanceAndPower.tsx, "short circuit" appears at L319 and L1152 (used as a noun phrase), while "short-circuit" appears at L879 (used as a compound adjective: "short-circuit protection"). The FAQ question at L1150 also uses the unhyphenated noun form.

**Rule:** "short circuit" as a standalone noun and "short-circuit" as a compound modifier before a noun are both standard English usage. This is NOT a bug — but if the chapter wants strict internal consistency for the noun-phrase form, all bare noun uses should match. The modifier use at L879 ("short-circuit protection") correctly takes a hyphen.

**Why:** The inconsistency is only worth flagging at the noun-phrase level (L319 vs hypothetical "short-circuit" used as noun). The adjective-modifier use is correctly hyphenated regardless.

**How to apply:** When grepping for hyphenation inconsistency, check whether each hit is the compound used as a noun (no hyphen preferred) or as an adjective modifier (hyphen preferred). Only flag when the same grammatical role uses both forms.
