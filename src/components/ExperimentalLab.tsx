import type { ReactNode } from 'react';

/**
 * Small presentational primitives shared by experimental-lab pages.
 *
 * Equation labs are interactive simulators; experimental labs are paper
 * worksheets in textbook clothing. They need a procedure list, a data table
 * that visibly marks "prefilled by us" vs "blank for the student," analysis
 * prompts the student writes against, and a stretch-problem callout.
 *
 * These primitives are stylistically aligned with the rest of the textbook
 * (mono labels, amber accents, cream prose). Drop them into the `labContent`
 * slot of <LabShell> for any 'experimental' lab.
 */

/* ─── Section ─────────────────────────────────────────────────────────── */

interface SectionProps {
  /** Section number, e.g. "1", "2.1". Rendered in the amber tag. */
  tag: string;
  /** Section title. */
  title: string;
  children: ReactNode;
}

/** Numbered top-level section block. */
export function Section({ tag, title, children }: SectionProps) {
  return (
    <section className="mb-3xl">
      <div className="gap-md mb-lg border-border pb-sm flex items-baseline border-b">
        <span className="font-3 text-2 text-accent tracking-3 uppercase">{tag}</span>
        <h2 className="font-2 text-text text-7 leading-2 font-normal">{title}</h2>
      </div>
      <div className="text-6 text-text-dim leading-4">{children}</div>
    </section>
  );
}

/* ─── ProcedureList ───────────────────────────────────────────────────── */

interface ProcedureProps {
  children: ReactNode;
}

/** Ordered list of procedure steps. Use <Step> children. */
export function Procedure({ children }: ProcedureProps) {
  return <ol className="space-y-lg my-2xl list-none pl-0 [counter-reset:step]">{children}</ol>;
}

interface StepProps {
  children: ReactNode;
}

/** A single procedure step with a hanging amber step number. */
export function Step({ children }: StepProps) {
  return (
    <li className="bg-bg-card border-border-1 gap-lg rounded-2 p-lg before:inline-flex before:items-center before:justify-center before:w-8 before:h-8 before:rounded-full before:bg-accent-soft before:text-accent before:font-3 before:text-2 before:shrink-0 flex border [counter-increment:step] before:content-[counter(step)]">
      <div className="flex-1">{children}</div>
    </li>
  );
}

/* ─── DataTable ───────────────────────────────────────────────────────── */

interface DataTableProps {
  /** Column header cells. */
  headers: ReactNode[];
  /** Row data. Use the literal string "__" in any cell to mark
   *  "student fills this in" — it renders as a styled blank slot. */
  rows: ReactNode[][];
  /** Optional caption below the table. */
  caption?: ReactNode;
}

/**
 * Worksheet-style table. Cells whose content is exactly the string "__"
 * render as visibly-empty fillable slots; any other content prints normally
 * (so we can pre-fill the first few rows as worked examples).
 */
export function DataTable({ headers, rows, caption }: DataTableProps) {
  return (
    <figure className="my-xl">
      <div className="border-border-1 bg-bg-card rounded-2 overflow-x-auto border">
        <table className="font-3 text-3 text-text-dim w-full border-collapse">
          <thead>
            <tr className="bg-bg-elevated border-border-1 text-text border-b">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-md py-sm tracking-3 text-2 text-left font-normal uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-border border-b last:border-b-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-md py-sm">
                    {cell === '__' ? (
                      <span
                        className="text-text-muted border-border-strong inline-block min-w-[6ch] border-b border-dashed"
                        aria-label="blank — fill in"
                      >
                        &nbsp;
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="font-1 text-3 text-text-muted mt-sm leading-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ─── Prompt ──────────────────────────────────────────────────────────── */

interface PromptProps {
  /** Short label that names this prompt (e.g. "Q3"). */
  label: string;
  children: ReactNode;
}

/** Open-ended analysis prompt — the student writes the answer offline. */
export function Prompt({ label, children }: PromptProps) {
  return (
    <div className="border-border-1 bg-bg-elevated mb-md gap-md rounded-3 p-md flex border">
      <span className="font-3 text-2 text-accent tracking-3 shrink-0 pt-1 uppercase">{label}</span>
      <div className="text-6 text-text leading-4">{children}</div>
    </div>
  );
}

/* ─── Stretch ─────────────────────────────────────────────────────────── */

interface StretchProps {
  title?: string;
  children: ReactNode;
}

/** A "going further" callout placed at the end of the lab. */
export function Stretch({ title = 'Going further', children }: StretchProps) {
  return (
    <aside className="border-accent-soft bg-accent-soft my-2xl rounded-3 p-lg border">
      <div className="font-3 text-2 text-accent mb-sm tracking-3 uppercase">{title}</div>
      <div className="text-6 text-text-dim leading-4">{children}</div>
    </aside>
  );
}
