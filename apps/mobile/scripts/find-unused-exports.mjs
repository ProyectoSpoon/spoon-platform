#!/usr/bin/env node
// Simple unused export finder for TS/TSX files.
// Heuristic: collects named exports and checks if they are imported elsewhere.
// Excludes: *.d.ts, examples/, node_modules, dist.
// Note: Does not resolve dynamic imports or runtime usage (false positives possible).

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const ROOT = process.cwd();
const SRC_DIRS = ['src', 'screens', 'navigation'];

const exportMap = new Map(); // name -> Set(files)
const usage = new Set(); // names seen in imports / re-exports

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (['node_modules', 'dist', 'build'].includes(entry)) continue;
      if (full.includes(path.sep + 'examples' + path.sep)) continue; // skip examples
      walk(full);
    } else if (/\.tsx?$/.test(entry) && !entry.endsWith('.d.ts')) {
      analyzeFile(full);
    }
  }
}

function addExport(name, file) {
  if (!name) return;
  if (!exportMap.has(name)) exportMap.set(name, new Set());
  exportMap.get(name).add(file);
}

function markUsage(name) {
  if (!name) return;
  usage.add(name);
}

function analyzeFile(file) {
  const code = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const isAggregator = path.basename(file) === 'index.ts' || path.basename(file) === 'index.tsx';

  function visit(node) {
    // Imports (usage)
    if (ts.isImportDeclaration(node) && node.importClause) {
      const { importClause } = node;
      if (importClause.name) markUsage(importClause.name.text);
      if (importClause.namedBindings) {
        if (ts.isNamedImports(importClause.namedBindings)) {
          importClause.namedBindings.elements.forEach(el => markUsage(el.name.text));
        } else if (ts.isNamespaceImport(importClause.namedBindings)) {
          // namespace import; cannot know individual members
        }
      }
    }
    // Re-exports with named specifiers: export { A, B } from './mod'; count A,B as usage
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      node.exportClause.elements.forEach(el => markUsage(el.name.text));
    }
    // Named export declarations
    if (node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isModuleDeclaration(node) || ts.isVariableStatement(node)) {
        if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach(dec => {
            if (ts.isIdentifier(dec.name)) addExport(dec.name.text, file);
          });
        } else if (node.name) {
          addExport(node.name.text, file);
        }
      }
    }
    // export default function Foo() {}
    if (ts.isFunctionDeclaration(node) && node.modifiers && node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      if (node.name) addExport(node.name.text, file);
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);

  // If aggregator index re-exports star, we don't treat that as usage; ok.
  // For index files themselves we usually allow that their own exports can appear unused internally.
  if (isAggregator) {
    // Remove its own exports from consideration (avoid false positives)
    for (const [name, files] of exportMap.entries()) {
      if (files.has(file)) markUsage(name);
    }
  }
}

for (const dir of SRC_DIRS) {
  const abs = path.join(ROOT, dir);
  if (fs.existsSync(abs)) walk(abs);
}

// Compute unused
const unused = [];
for (const [name, files] of exportMap.entries()) {
  if (usage.has(name)) continue;
  // ignore names starting with '_' (explicit private) or React/JSX patterns
  if (/^_|React$|Props$|State$/.test(name)) continue;
  unused.push({ name, files: Array.from(files) });
}

unused.sort((a,b)=> a.name.localeCompare(b.name));

if (unused.length === 0) {
  console.log('No unused exports found (heuristic).');
  process.exit(0);
}

console.log('Potential unused exports (verify manually):');
for (const u of unused) {
  console.log('-', u.name, '\n  ', u.files.join('\n   '));
}
process.exit(0);
