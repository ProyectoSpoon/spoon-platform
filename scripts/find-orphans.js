#!/usr/bin/env node
/*
  find-orphans.js
  Escanea el monorepo para detectar archivos potencialmente "huérfanos" (no referenciados).
  - Soporta imports estáticos (import/require) y dinámicos básicos import("...")
  - Considera entradas implícitas de Next.js (app router: page/layout/loading/error/not-found/route)
  - Ignora tests, stories, d.ts, markdown, SQL, node_modules, builds, etc.
  - Resuelve imports relativos y mapea @spoon/<pkg> -> packages/<pkg>/ (con intento sobre src/)
  - Output: docs/orphan-report.json y docs/orphan-report.md
*/

const fs = require('fs');
const path = require('path');

// Raíz del repo: carpeta padre de /scripts
const ROOT = path.resolve(__dirname, '..');

const INCLUDE_DIRS = [
  'apps',
  'packages',
  // scripts a veces no son importados: no los contamos como huérfanos
];

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.next', 'out', 'build', 'dist', '.turbo', 'coverage', '.storybook'
]);

const CODE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const INDEX_BASENAMES = ['index'];

// Patrones de exclusión por archivo
const EXCLUDE_FILE_REGEXES = [
  /(^|[\\/])__tests__([\\/])/i,
  /\.(test|spec)\.[tj]sx?$/i,
  /\.stories\.[tj]sx?$/i,
  /\.d\.ts$/i,
  /\.(md|sql|lock|snap)$/i,
  /(^|[\\/])scripts([\\/])/i, // scripts no cuentan como huérfanos
  /(^|[\\.])env(\.|$)/i,
  /(^|[\\.])eslint(\.|$)/i,
  /(^|[\\.])prettier(\.|$)/i,
  /(^|[\\.])git(\.|$)/i,
  /(^|[\\.])vscode([\\/])/i,
  /(^|[\\.])github([\\/])/i,
  /\.(config|rc)\.[cm]?js$/i, // jest.config.js, tailwind.config.js, etc.
  /(^|[\\/])jest\.[\w.-]+\.js$/i,
  /(^|[\\/])storybook\.[\w.-]+\.js$/i,
  /(^|[\\/])turbo\.json$/i,
  /(^|[\\/])package(-lock)?\.json$/i,
  /(^|[\\/])tsconfig.*\.json$/i
];

// Patrones de entrada implícita (Next.js App Router y middleware)
const NEXT_ENTRY_REGEXES = [
  // app/(page|layout|template|loading|error|not-found).tsx en raíz o en subcarpetas
  /(^|[\\/])app[\\/](page|layout|template|loading|error|not-found)\.[tj]sx?$/i,
  /(^|[\\/])app[\\/].*[\\/](page|layout|template|loading|error|not-found)\.[tj]sx?$/i,
  // app/**/route.ts|js
  /(^|[\\/])app[\\/].*[\\/](route)\.[tj]s$/i,
  // middleware y pages router legado
  /(^|[\\/])middleware\.[tj]s$/i,
  /(^|[\\/])pages[\\/].*\.[tj]sx?$/i,
];

// Utilidad: listar archivos
function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return out;
  }
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function belongsToIncludedDirs(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  return INCLUDE_DIRS.some((d) => rel.startsWith(`${d}/`));
}

function isExcludedFile(file) {
  const rel = path.relative(ROOT, file);
  return EXCLUDE_FILE_REGEXES.some((re) => re.test(rel));
}

function isCodeFile(file) {
  return CODE_EXTS.includes(path.extname(file));
}

function isNextImplicitEntry(file) {
  const rel = path.relative(ROOT, file);
  return NEXT_ENTRY_REGEXES.some((re) => re.test(rel));
}

// Extrae imports de un archivo fuente
function extractImports(source) {
  const imports = new Set();
  const patterns = [
    /import\s+[^'"\n]+?from\s+['\"]([^'\"]+)['\"]/g, // import ... from '...'
    /import\s*\(\s*['\"]([^'\"]+)['\"]\s*\)/g, // import('...')
    /require\(\s*['\"]([^'\"]+)['\"]\s*\)/g, // require('...')
    /export\s+\*\s+from\s+['\"]([^'\"]+)['\"]/g, // export * from '...'
    /export\s+\{[^}]*\}\s+from\s+['\"]([^'\"]+)['\"]/g, // export { A, B } from '...'
    /export\s+\{\s*default\s+as\s+[^}]+\}\s+from\s+['\"]([^'\"]+)['\"]/g, // export { default as X } from '...'
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source))) {
      imports.add(m[1]);
    }
  }
  return [...imports];
}

// Resolver básico de rutas de import
function resolveImport(fromFile, spec) {
  // Ignorar módulos externos
  if (!spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('@spoon/') && !spec.startsWith('apps/') && !spec.startsWith('packages/')) {
    return null; // paquete npm externo
  }

  // Base path
  let base;
  if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else if (spec.startsWith('apps/') || spec.startsWith('/apps/')) {
    base = path.resolve(ROOT, spec.replace(/^\//, ''));
  } else if (spec.startsWith('packages/') || spec.startsWith('/packages/')) {
    base = path.resolve(ROOT, spec.replace(/^\//, ''));
  } else if (spec.startsWith('@spoon/')) {
    // Mapear @spoon/<pkg>/rest → packages/<pkg>/(src/)?rest
    const rest = spec.replace(/^@spoon\//, '');
    const [pkg, ...restParts] = rest.split('/');
    const restPath = restParts.join('/');
    const candidates = [
      path.resolve(ROOT, 'packages', pkg, 'src', restPath),
      path.resolve(ROOT, 'packages', pkg, restPath),
    ];
    for (const c of candidates) {
      const resolved = resolveWithExtensions(c);
      if (resolved) return resolved;
    }
    return null;
  } else {
    base = path.resolve(ROOT, spec);
  }

  return resolveWithExtensions(base);
}

function resolveWithExtensions(basePath) {
  // 1) Archivo exacto con extensión
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) return basePath;

  // 2) Probar con extensiones
  for (const ext of CODE_EXTS) {
    const p = basePath + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  // 3) Si es directorio, probar index.*
  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    for (const name of INDEX_BASENAMES) {
      for (const ext of CODE_EXTS) {
        const p = path.join(basePath, name + ext);
        if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
      }
    }
  }
  return null;
}

function main() {
  const allFiles = walk(ROOT)
    .filter(belongsToIncludedDirs)
    .filter((f) => !isExcludedFile(f));

  const codeFiles = allFiles.filter(isCodeFile);

  // Grafo de dependencias: file -> Set<file>
  const graph = new Map();
  for (const f of codeFiles) graph.set(f, new Set());

  // Construir grafo a partir de imports
  for (const file of codeFiles) {
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue;
    }
    const specs = extractImports(src);
    for (const spec of specs) {
      const resolved = resolveImport(file, spec);
      if (resolved && graph.has(resolved)) {
        graph.get(file).add(resolved);
      }
    }
  }

  // Entradas (roots): Next.js convenciones
  const roots = new Set(
    codeFiles.filter((f) => isNextImplicitEntry(f))
  );

  // Alcanzables por BFS desde roots
  const reachable = new Set();
  const queue = [...roots];
  while (queue.length) {
    const cur = queue.shift();
    if (reachable.has(cur)) continue;
    reachable.add(cur);
    const deps = graph.get(cur);
    if (!deps) continue;
    for (const d of deps) {
      if (!reachable.has(d)) queue.push(d);
    }
  }

  // Potenciales huérfanos: codeFiles - reachable
  const orphans = codeFiles.filter((f) => !reachable.has(f) && !isNextImplicitEntry(f));

  // Crear reporte
  const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
  const report = {
    root: ROOT,
    generatedAt: new Date().toISOString(),
    totals: {
      codeFiles: codeFiles.length,
      roots: roots.size,
      reachable: reachable.size,
      orphans: orphans.length,
    },
    roots: [...roots].map(rel).sort(),
    orphans: orphans.map(rel).sort(),
  };

  // Asegurar docs/
  const docsDir = path.join(ROOT, 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(path.join(docsDir, 'orphan-report.json'), JSON.stringify(report, null, 2));

  const md = [
    '# Orphan Files Report',
    '',
    `Generado: ${report.generatedAt}`,
    '',
    `- Archivos de código escaneados: ${report.totals.codeFiles}`,
    `- Entradas (roots): ${report.totals.roots}`,
    `- Alcanzables: ${report.totals.reachable}`,
    `- Huérfanos: ${report.totals.orphans}`,
    '',
    '## Entradas detectadas',
    ...report.roots.map((r) => `- ${r}`),
    '',
    '## Archivos potencialmente huérfanos',
    ...(report.orphans.length ? report.orphans.map((r) => `- ${r}`) : ['- (ninguno detectado)']),
    '',
    'Notas:',
    '- Este análisis es estático y heurístico. Comprueba manualmente antes de eliminar.',
    '- Se ignoran tests, stories, d.ts, scripts y configs. Next.js introduce entradas implícitas.',
    '- Aliases @spoon/<pkg> se mapean a packages/<pkg>/(src?). Ajusta el script si usas otras convenciones.',
  ].join('\n');

  fs.writeFileSync(path.join(docsDir, 'orphan-report.md'), md, 'utf8');

  console.log(md);
}

main();
