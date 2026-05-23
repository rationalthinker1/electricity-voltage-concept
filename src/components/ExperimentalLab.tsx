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
      <div className="gap-md mb-lg flex items-baseline border-b border-border pb-sm">
        <span className="font-3 text-2 text-accent tracking-3 uppercase">{tag}</span>
        <h2 className="font-2 text-text text-7 font-normal leading-2">{title}</h2>
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
  return (
    <ol className="space-y-md list-none pl-0 [counter-reset:step]">{children}</ol>
  );
}

interface StepProps {
  children: ReactNode;
}

/** A single procedure step with a hanging amber step number. */
export function Step({ children }: StepProps) {
  return (
    <li className="border-border-1 flex gap-md border-l-2 pl-md py-xs [counter-increment:step] before:content-[counter(step)] before:font-3 before:text-2 before:text-accent before:tracking-3 before:min-w-[1.5rem] before:text-right">
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
      <div className="border-border-1 bg-bg-card overflow-x-auto rounded-2 border">
        <table className="font-3 text-3 w-full border-collapse text-text-dim">
          <thead>
            <tr className="bg-bg-elevated border-border-1 border-b text-text">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-md py-sm text-left font-normal tracking-3 uppercase text-2"
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
                        className="text-text-muted inline-block min-w-[6ch] border-b border-dashed border-border-strong"
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
        <figcaption className="font-1 text-3 text-text-muted leading-3 mt-sm italic">
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
    <div className="border-border-1 bg-bg-elevated mb-md gap-md flex rounded-3 border p-md">
      <span className="font-3 text-2 text-accent tracking-3 uppercase shrink-0 pt-1">{label}</span>
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
    <aside className="border-accent-soft bg-accent-soft my-2xl rounded-3 border p-lg">
      <div className="font-3 text-2 text-accent mb-sm tracking-3 uppercase">{title}</div>
      <div className="text-6 text-text-dim leading-4">{children}</div>
    </aside>
  );
}
