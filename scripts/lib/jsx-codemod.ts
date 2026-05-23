/**
 * Shared ts-morph helpers for JSX codemods over the textbook source tree.
 *
 * Why this exists
 * ---------------
 * Most field-theory codemods rewrite the same shapes — JSX attribute
 * renames, element wrapping, ensuring an import line — across many demo or
 * chapter files. Writing each codemod from scratch means re-implementing
 * Project setup, source-file globbing, attribute lookup, import insertion,
 * and dry-run handling every time. This module is the thin layer that lets
 * a codemod focus on the *transform* and not the boilerplate.
 *
 * Usage shape
 * -----------
 *   import {
 *     createProject,
 *     walkSourceFiles,
 *     ensureImport,
 *     forEachJsxElement,
 *     findJsxAttribute,
 *     getStringAttributeValue,
 *     setStringAttributeValue,
 *     commitOrDryRun,
 *   } from './lib/jsx-codemod';
 *
 *   const project = createProject(['src/textbook/Ch*.tsx']);
 *   const dryRun = !process.argv.includes('--write');
 *
 *   walkSourceFiles(project, (sf) => {
 *     forEachJsxElement(sf, 'TryIt', (el) => {
 *       const tag = findJsxAttribute(el, 'tag');
 *       if (!tag) return;
 *       const v = getStringAttributeValue(tag);
 *       if (v?.startsWith('Try 17.')) {
 *         setStringAttributeValue(tag, v.replace(/^Try 17\./, 'Try 21.'));
 *       }
 *     });
 *   });
 *
 *   commitOrDryRun(project, { dryRun });
 *
 * Project conventions
 * -------------------
 * - Uses the repo `tsconfig.json` as its config base so import resolution
 *   and JSX parsing match the build.
 * - Default glob is `src/textbook/**\/*.tsx` (chapters + embedded demos).
 *   Pass an explicit glob list to narrow.
 * - The repo's `tsconfig.json` includes `src/labs` and `src/lib` via the
 *   project's `include` field; pass those directly if a codemod needs them.
 * - Dry-run mode prints a unified per-file change summary; write mode
 *   calls `project.save()`.
 */

import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import type { JsxAttribute, JsxElement, JsxOpeningElement, JsxSelfClosingElement } from 'ts-morph';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TSCONFIG = path.join(REPO_ROOT, 'tsconfig.json');

export type AnyJsxElement = JsxElement | JsxSelfClosingElement;

/* ──────────────────────────────────────────────────────────────────────
 *  Project setup
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Build a ts-morph Project rooted at the repo, with the given glob(s)
 * already loaded. Defaults to every chapter/demo file under
 * `src/textbook`.
 */
export function createProject(globs: string[] = ['src/textbook/**/*.tsx']): Project {
  const project = new Project({
    tsConfigFilePath: TSCONFIG,
    skipAddingFilesFromTsConfig: true,
  });
  for (const g of globs) {
    project.addSourceFilesAtPaths(path.join(REPO_ROOT, g));
  }
  return project;
}

/** Iterate over every source file in the project. */
export function walkSourceFiles(
  project: Project,
  fn: (sourceFile: SourceFile) => void,
): void {
  for (const sf of project.getSourceFiles()) {
    fn(sf);
  }
}

/* ──────────────────────────────────────────────────────────────────────
 *  JSX element traversal
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Visit every JSX element in `sourceFile` whose tag name matches
 * `tagName`. Handles both `<Foo>…</Foo>` (JsxElement) and `<Foo … />`
 * (JsxSelfClosingElement) forms.
 */
export function forEachJsxElement(
  sourceFile: SourceFile,
  tagName: string,
  fn: (element: AnyJsxElement) => void,
): void {
  for (const el of sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)) {
    if (el.getOpeningElement().getTagNameNode().getText() === tagName) {
      fn(el);
    }
  }
  for (const el of sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)) {
    if (el.getTagNameNode().getText() === tagName) {
      fn(el);
    }
  }
}

/** Return the opening element (the part that owns attributes). */
export function getOpening(
  element: AnyJsxElement,
): JsxOpeningElement | JsxSelfClosingElement {
  if (element.getKind() === SyntaxKind.JsxElement) {
    return (element as JsxElement).getOpeningElement();
  }
  return element as JsxSelfClosingElement;
}

/** Return the JSX attribute on `element` named `name`, or undefined. */
export function findJsxAttribute(
  element: AnyJsxElement,
  name: string,
): JsxAttribute | undefined {
  const opening = getOpening(element);
  for (const attr of opening.getAttributes()) {
    if (attr.getKind() !== SyntaxKind.JsxAttribute) continue;
    const a = attr.asKindOrThrow(SyntaxKind.JsxAttribute);
    if (a.getNameNode().getText() === name) return a;
  }
  return undefined;
}

/**
 * Read the string literal value of `attr` (form: `name="value"`).
 * Returns undefined when the attribute is a JSX expression
 * (`name={expr}`) or has no initializer (boolean form).
 */
export function getStringAttributeValue(attr: JsxAttribute): string | undefined {
  const init = attr.getInitializer();
  if (!init) return undefined;
  const lit = init.asKind(SyntaxKind.StringLiteral);
  return lit?.getLiteralValue();
}

/**
 * Replace the string literal initializer of `attr` with `value`. No-op
 * for expression initialisers; use `attr.setInitializer(\`{…}\`)` for
 * those.
 */
export function setStringAttributeValue(attr: JsxAttribute, value: string): void {
  const init = attr.getInitializer();
  if (!init) return;
  const lit = init.asKind(SyntaxKind.StringLiteral);
  if (lit) lit.setLiteralValue(value);
}

/** Rename a JSX attribute in place (`<Foo old="x" />` → `<Foo new="x" />`). */
export function renameJsxAttribute(
  element: AnyJsxElement,
  oldName: string,
  newName: string,
): boolean {
  const attr = findJsxAttribute(element, oldName);
  if (!attr) return false;
  attr.getNameNode().replaceWithText(newName);
  return true;
}

/* ──────────────────────────────────────────────────────────────────────
 *  JSX element transforms
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Wrap `element` in `<wrapperName>…</wrapperName>`. Returns the new
 * outer JSX text so the caller can chain further edits if needed.
 *
 * Note: this re-prints the element rather than reusing the original
 * source span, so any custom whitespace inside the wrapped element is
 * normalised. For surgical wrapping that preserves original layout,
 * prefer `element.replaceWithText(...)` directly.
 */
export function wrapJsxElement(element: AnyJsxElement, wrapperName: string): string {
  const inner = element.getText();
  const wrapped = `<${wrapperName}>${inner}</${wrapperName}>`;
  element.replaceWithText(wrapped);
  return wrapped;
}

/**
 * Replace the tag name on `element` (`<oldTag …>…</oldTag>` →
 * `<newTag …>…</newTag>`). Attributes and children are preserved.
 */
export function renameJsxElement(element: AnyJsxElement, newTag: string): void {
  if (element.getKind() === SyntaxKind.JsxElement) {
    const el = element as JsxElement;
    el.getOpeningElement().getTagNameNode().replaceWithText(newTag);
    el.getClosingElement().getTagNameNode().replaceWithText(newTag);
  } else {
    (element as JsxSelfClosingElement).getTagNameNode().replaceWithText(newTag);
  }
}

/* ──────────────────────────────────────────────────────────────────────
 *  Import management
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Ensure `sourceFile` has a named import `{ name }` from `moduleSpecifier`.
 *
 * - If an import declaration for `moduleSpecifier` already exists, the
 *   named binding is added to it (idempotent — re-running on an
 *   already-imported binding is a no-op).
 * - Otherwise, a fresh `import { name } from "moduleSpecifier";` is
 *   inserted at the top of the import block (above any non-import
 *   statements).
 *
 * Pass `names` as either a single string or an array. Returns true if
 * the file was modified.
 */
export function ensureImport(
  sourceFile: SourceFile,
  moduleSpecifier: string,
  names: string | string[],
): boolean {
  const wanted = Array.isArray(names) ? names : [names];
  const existing = sourceFile.getImportDeclaration(
    (d) => d.getModuleSpecifierValue() === moduleSpecifier,
  );

  if (existing) {
    const present = new Set(existing.getNamedImports().map((n) => n.getName()));
    let changed = false;
    for (const name of wanted) {
      if (!present.has(name)) {
        existing.addNamedImport(name);
        changed = true;
      }
    }
    return changed;
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier,
    namedImports: wanted.map((name) => ({ name })),
  });
  return true;
}

/* ──────────────────────────────────────────────────────────────────────
 *  Insertion helpers
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Insert `jsxText` (a string of JSX) immediately after `element` in its
 * parent. Useful for "place an `<EquationStrip>` right after
 * `<DemoControls>`" style edits.
 */
export function insertJsxAfter(element: AnyJsxElement, jsxText: string): void {
  const parent = element.getParent();
  if (!parent) {
    throw new Error('insertJsxAfter: element has no parent');
  }
  const next = element.getNextSibling();
  if (next) {
    next.replaceWithText(`${jsxText}\n${next.getText()}`);
  } else {
    element.replaceWithText(`${element.getText()}\n${jsxText}`);
  }
}

/* ──────────────────────────────────────────────────────────────────────
 *  Dry-run vs commit
 * ────────────────────────────────────────────────────────────────────── */

export interface CommitOptions {
  /** When true, just log changed files; don't save. Defaults to true. */
  dryRun?: boolean;
  /** Optional path-stripping for relative log output. Defaults to repo root. */
  logRoot?: string;
}

/**
 * Either print a summary of which files would change (dryRun=true) or
 * write changes to disk (dryRun=false).
 *
 * A common driver shape:
 *
 *   const dryRun = !process.argv.includes('--write');
 *   …mutations…
 *   commitOrDryRun(project, { dryRun });
 */
export function commitOrDryRun(project: Project, opts: CommitOptions = {}): void {
  const { dryRun = true, logRoot = REPO_ROOT } = opts;
  const changed = project.getSourceFiles().filter((sf) => !sf.isSaved());
  if (changed.length === 0) {
    console.log('No changes.');
    return;
  }
  const label = dryRun ? 'Would change' : 'Wrote';
  for (const sf of changed) {
    console.log(`${label}: ${path.relative(logRoot, sf.getFilePath())}`);
  }
  console.log(`${changed.length} file(s) ${dryRun ? 'pending' : 'updated'}.`);
  if (!dryRun) {
    project.saveSync();
  }
}
