---
name: jsx-key-trap
description: Any JSX element placed inside a DataTable row array must carry an explicit key prop, or the pre-commit lint hook blocks the commit.
metadata:
  type: feedback
---

When a `<DataTable>` row contains a JSX element (commonly `<strong>` for a "Mean" row label, but also `<em>`, `<sub>`, `<InlineMath>`), give that element an explicit `key=` prop.

**Why:** `DataTable` renders rows via `rows.map((row, ri) => row.map((cell, ci) => <td>{cell}</td>))`. The `cell` expression is inside `.map`, so any JSX literal cell appears in an iteration context and React/eslint require a stable `key`. The project's pre-commit hook runs `eslint --fix` with `react/jsx-key` as an error (not a warning) and will **abort the commit**, leaving the staged changes stashed. This bit `FaradayCageLab.tsx`'s "Mean" row on first commit attempt.

**How to apply:**
- Plain strings in row cells (`'2.0'`, `'__'`, `'+87.0'`): no key needed, they aren't JSX.
- Any JSX cell: wrap explicitly with a key.
  ```tsx
  rows={[
    ['1', '−87', '−52'],
    [
      <strong key="mean" className="text-text font-medium">Mean</strong>,
      '__',
      '__',
    ],
  ]}
  ```
- The key value is local to the row; any short string works (`"mean"`, `"sum"`, `"header"`).

Catch this *before* the commit by running `npx eslint src/labs/{YourLab}.tsx` after drafting. The pre-commit hook will catch it too but at the cost of a stashed-and-reverted commit attempt.
