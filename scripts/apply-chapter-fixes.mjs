#!/usr/bin/env node
/**
 * Apply chapter-tag-bumper fixes across all chapters.
 * Also adds explicit `figure` props to demo usages where missing.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const TEXTBOOK_DIR = 'src/textbook';
const DEMOS_DIR = 'src/textbook/demos';
const CHAPTERS_FILE = 'src/textbook/data/chapters.ts';

// ─── Parse chapters.ts ───
const chaptersSrc = readFileSync(CHAPTERS_FILE, 'utf-8');
const slugToNumber = {};
const numberToSlug = {};

const slugMatches = [...chaptersSrc.matchAll(/slug:\s*'([^']+)'/g)];
const numberMatches = [...chaptersSrc.matchAll(/number:\s*(\d+)/g)];

for (let i = 0; i < slugMatches.length; i++) {
  const slug = slugMatches[i][1];
  const num = parseInt(numberMatches[i][1], 10);
  slugToNumber[slug] = num;
  numberToSlug[num] = slug;
}

// ─── Find chapter files ───
const chapterFiles = readdirSync(TEXTBOOK_DIR)
  .filter(f => f.startsWith('Ch') && f.endsWith('.tsx'))
  .map(f => join(TEXTBOOK_DIR, f));

// ─── Helpers ───
function findSlug(content) {
  const m = content.match(/getChapter\('([^']+)'\)/);
  return m ? m[1] : null;
}

function findEmbeddedDemos(content) {
  const out = new Set();
  const re = /<([A-Z][A-Za-z0-9]*Demo)\b/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.add(m[1]);
  }
  return [...out];
}

function findDemoFigures(content) {
  const out = [];
  const re1 = /figure\s*=\s*['"]Fig\.\s*(\d+)\.(\d+)['"]/g;
  const re2 = /\?\?\s*['"]Fig\.\s*(\d+)\.(\d+)['"]/g;
  let m;
  while ((m = re1.exec(content)) !== null) {
    out.push({ n: parseInt(m[1], 10), m: m[2] });
  }
  while ((m = re2.exec(content)) !== null) {
    out.push({ n: parseInt(m[1], 10), m: m[2] });
  }
  return out;
}

function resolveDemoPath(demoName) {
  const baseName = demoName.endsWith('Demo') ? demoName.slice(0, -4) : demoName;
  let demoPath = join(DEMOS_DIR, `${baseName}.tsx`);
  try {
    readFileSync(demoPath, 'utf-8');
    return demoPath;
  } catch {
    demoPath = join(DEMOS_DIR, `${demoName}.tsx`);
    try {
      readFileSync(demoPath, 'utf-8');
      return demoPath;
    } catch {
      return null;
    }
  }
}

// ─── Pre-compute demo sharing ───
const demoToChapters = {};
for (const chPath of chapterFiles) {
  const content = readFileSync(chPath, 'utf-8');
  const slug = findSlug(content);
  if (!slug) continue;
  const num = slugToNumber[slug];
  const demos = findEmbeddedDemos(content);
  for (const d of demos) {
    if (!demoToChapters[d]) demoToChapters[d] = [];
    demoToChapters[d].push(num);
  }
}

// ─── Build fix report ───
const log = [];

for (const chPath of chapterFiles.sort()) {
  const chName = basename(chPath);
  let content = readFileSync(chPath, 'utf-8');
  const slug = findSlug(content);
  if (!slug) continue;
  const expectedNum = slugToNumber[slug];
  if (!expectedNum) continue;

  let changed = false;

  // 1. Header comment: "Chapter N" anywhere in first 10 lines
  const headLines = content.split('\n').slice(0, 10);
  for (let i = 0; i < headLines.length; i++) {
    const line = headLines[i];
    const m = line.match(/(Chapter\s+)(\d+)/);
    if (m) {
      const oldNum = parseInt(m[2], 10);
      if (oldNum !== expectedNum) {
        headLines[i] = line.replace(m[0], m[1] + expectedNum);
        log.push(`${chName}: header ${oldNum} → ${expectedNum}`);
        changed = true;
      }
    }
  }
  if (changed) {
    const rest = content.split('\n').slice(10);
    content = [...headLines, ...rest].join('\n');
  }

  // 2. Function name
  const funcMatch = content.match(/(export\s+default\s+function\s+Ch)(\d+)/);
  if (funcMatch) {
    const oldNum = parseInt(funcMatch[2], 10);
    if (oldNum !== expectedNum) {
      content = content.replace(funcMatch[0], funcMatch[1] + expectedNum);
      log.push(`${chName}: function name Ch${oldNum} → Ch${expectedNum}`);
      changed = true;
    }
  }

  // 3. TryIt tags
  content = content.replace(/tag="Try\s+(\d+)\./g, (match, oldNum) => {
    const n = parseInt(oldNum, 10);
    if (n !== expectedNum) {
      log.push(`${chName}: TryIt ${n}.x → ${expectedNum}.x`);
      changed = true;
      return `tag="Try ${expectedNum}.`;
    }
    return match;
  });

  // 4. CaseStudy tags
  content = content.replace(/tag="Case\s+(\d+)\./g, (match, oldNum) => {
    const n = parseInt(oldNum, 10);
    if (n !== expectedNum) {
      log.push(`${chName}: CaseStudy ${n}.x → ${expectedNum}.x`);
      changed = true;
      return `tag="Case ${expectedNum}.`;
    }
    return match;
  });

  // 5. Demo figure props in chapter file
  content = content.replace(/figure="Fig\.\s+(\d+)\./g, (match, oldNum) => {
    const n = parseInt(oldNum, 10);
    if (n !== expectedNum) {
      log.push(`${chName}: Demo figure ${n}.x → ${expectedNum}.x`);
      changed = true;
      return `figure="Fig. ${expectedNum}.`;
    }
    return match;
  });

  // 6. id anchors
  content = content.replace(/id="ch\.(\d+)\./g, (match, oldNum) => {
    const n = parseInt(oldNum, 10);
    if (n !== expectedNum) {
      changed = true;
      return `id="ch.${expectedNum}.`;
    }
    return match;
  });
  content = content.replace(/id="(\d+)\.(\d+)-/g, (match, oldNum, sub) => {
    const n = parseInt(oldNum, 10);
    if (n !== expectedNum) {
      changed = true;
      return `id="${expectedNum}.${sub}-`;
    }
    return match;
  });

  // 7. Add explicit figure props to demo usages that lack them
  // First, collect all demo usages in order and their intended figure numbers
  const demoUsages = [];
  const usageRe = /<([A-Z][A-Za-z0-9]*Demo)\b([^>]*)\/>/g;
  let m;
  while ((m = usageRe.exec(content)) !== null) {
    const demoName = m[1];
    const attrs = m[2];
    const hasFigure = /\bfigure\s*=/.test(attrs);
    demoUsages.push({ demoName, attrs, hasFigure, index: m.index, full: m[0] });
  }

  // For demos without figure prop, try to infer from demo file default
  // or assign next sequential number
  let nextFig = 1;
  const usedIndices = new Set();
  
  // First pass: figure out what indices are already used
  for (const u of demoUsages) {
    if (u.hasFigure) {
      const fm = u.attrs.match(/figure\s*=\s*['"]Fig\.\s*\d+\.(\d+)['"]/);
      if (fm) usedIndices.add(parseInt(fm[1], 10));
    } else {
      // Check demo file default
      const demoPath = resolveDemoPath(u.demoName);
      if (demoPath) {
        const demoContent = readFileSync(demoPath, 'utf-8');
        const figs = findDemoFigures(demoContent);
        if (figs.length) {
          // Use the .M from the default if the chapter number matches or is close
          const idx = parseInt(figs[0].m, 10);
          usedIndices.add(idx);
        }
      }
    }
  }

  // Second pass: assign figures to demos without them
  for (let i = demoUsages.length - 1; i >= 0; i--) {
    const u = demoUsages[i];
    if (!u.hasFigure) {
      const demoPath = resolveDemoPath(u.demoName);
      let idx = null;
      if (demoPath) {
        const demoContent = readFileSync(demoPath, 'utf-8');
        const figs = findDemoFigures(demoContent);
        if (figs.length) {
          idx = parseInt(figs[0].m, 10);
        }
      }
      if (idx === null || usedIndices.has(idx)) {
        // Find next available
        while (usedIndices.has(nextFig)) nextFig++;
        idx = nextFig;
      }
      usedIndices.add(idx);
      
      const newAttrs = u.attrs.trim() + ` figure="Fig. ${expectedNum}.${idx}"`;
      const oldStr = u.full;
      const newStr = `<${u.demoName}${newAttrs} />`;
      // Replace at exact position to avoid re-processing
      content = content.slice(0, u.index) + newStr + content.slice(u.index + oldStr.length);
      log.push(`${chName}: added figure prop to <${u.demoName} /> → Fig. ${expectedNum}.${idx}`);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(chPath, content, 'utf-8');
  }
}

// ─── Fix demo files ───
for (const chPath of chapterFiles) {
  const chContent = readFileSync(chPath, 'utf-8');
  const slug = findSlug(chContent);
  if (!slug) continue;
  const expectedNum = slugToNumber[slug];
  const demos = findEmbeddedDemos(chContent);

  for (const demoName of demos) {
    const demoPath = resolveDemoPath(demoName);
    if (!demoPath) continue;

    // Skip shared demos for figure-default bumps
    const sharedBy = demoToChapters[demoName];
    const isShared = sharedBy && sharedBy.length > 1;

    let demoContent = readFileSync(demoPath, 'utf-8');
    let changed = false;

    // Bump default figure strings
    demoContent = demoContent.replace(/(figure\s*=\s*['"]Fig\.\s*)(\d+)(\.\d+['"])/g, (match, prefix, oldNum, suffix) => {
      const n = parseInt(oldNum, 10);
      if (n !== expectedNum) {
        if (isShared) {
          log.push(`SKIP ${basename(demoPath)}: shared demo figure default ${n}${suffix} (used by ${sharedBy.join(',')})`);
          return match;
        }
        log.push(`${basename(demoPath)}: default figure ${n}${suffix} → ${expectedNum}${suffix}`);
        changed = true;
        return prefix + expectedNum + suffix;
      }
      return match;
    });

    demoContent = demoContent.replace(/(\?\?\s*['"]Fig\.\s*)(\d+)(\.\d+['"])/g, (match, prefix, oldNum, suffix) => {
      const n = parseInt(oldNum, 10);
      if (n !== expectedNum) {
        if (isShared) {
          log.push(`SKIP ${basename(demoPath)}: shared demo ?? figure ${n}${suffix}`);
          return match;
        }
        log.push(`${basename(demoPath)}: ?? figure ${n}${suffix} → ${expectedNum}${suffix}`);
        changed = true;
        return prefix + expectedNum + suffix;
      }
      return match;
    });

    // Bump leading comment Ch.N references
    const lines = demoContent.split('\n');
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i];
      const m = line.match(/(Ch\.)(\d+)/);
      if (m) {
        const oldNum = parseInt(m[2], 10);
        if (oldNum !== expectedNum) {
          lines[i] = line.replace(m[0], m[1] + expectedNum);
          log.push(`${basename(demoPath)}: comment ${m[0]} → Ch.${expectedNum}`);
          changed = true;
        }
      }
    }
    if (changed) {
      demoContent = lines.join('\n');
      writeFileSync(demoPath, demoContent, 'utf-8');
    }
  }
}

console.log(log.join('\n'));
console.log(`\nDone: ${log.length} change(s) applied.`);
