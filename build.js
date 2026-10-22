'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PARTIALS_DIR = path.join(__dirname, 'partials');
const SRC_DIR = path.join(__dirname, 'src', 'pages');
const OUT_DIR = __dirname;

// Cache-busting por hash de conteúdo para o CSS compilado do Tailwind: evita que
// visitantes recebam CSS desatualizado do cache do navegador/Locaweb depois de um
// reenvio (ver publicacao/RELATORIO-TAILWIND-COMPILADO.md). Hash calculado a partir
// do próprio arquivo compilado — "npm run css:build" roda sempre antes deste script
// (ver "build" em package.json), então o arquivo já reflete o conteúdo atual.
const CSS_COMPILADO_PATH = path.join(__dirname, 'assets', 'css', 'tailwind.css');
let cssVersion = null;
if (fs.existsSync(CSS_COMPILADO_PATH)) {
  const cssBuf = fs.readFileSync(CSS_COMPILADO_PATH);
  cssVersion = crypto.createHash('sha256').update(cssBuf).digest('hex').slice(0, 10);
} else {
  console.warn('  [WARN] assets/css/tailwind.css não encontrado — rode "npm run css:build" antes do build (já incluso em "npm run build"). Link ficará sem cache-busting.');
}

// Páginas de src/pages/ que não devem gerar arquivo publicado na raiz.
// Caminho relativo a SRC_DIR, com '/' mesmo no Windows.
// Usado para ocultar páginas sem remover o conteúdo-fonte (ex: FAQ, set/2026).
const SKIP_FILES = [
  'faq.html',
];

// Load all partials into memory
const partials = {};
for (const file of fs.readdirSync(PARTIALS_DIR)) {
  if (!file.endsWith('.html')) continue;
  const key = file.replace('.html', '');
  partials[key] = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
}

let count = 0;
let errors = 0;

// Process src/pages/ recursively, mirroring the directory structure to the output
function processDir(srcDir, outDir) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const item of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, item);
    const outPath = path.join(outDir, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      processDir(srcPath, outPath);
      continue;
    }

    if (!item.endsWith('.html')) continue;

    const relPath = path.relative(SRC_DIR, srcPath).split(path.sep).join('/');
    if (SKIP_FILES.includes(relPath)) {
      console.log(`  ⏭ ${relPath} (ignorado — ver SKIP_FILES em build.js)`);
      continue;
    }

    let content = fs.readFileSync(srcPath, 'utf8');

    // Replace all <!-- INCLUDE:name --> markers
    content = content.replace(/<!-- INCLUDE:([\w-]+) -->/g, (match, name) => {
      if (partials[name] === undefined) {
        console.warn(`  [WARN] Partial não encontrado: "${name}" (em ${item})`);
        return match;
      }
      return partials[name];
    });

    // Aplica cache-busting no link do CSS compilado (ver cssVersion acima).
    if (cssVersion && content.includes('/assets/css/tailwind.css"')) {
      content = content.split('/assets/css/tailwind.css"').join(`/assets/css/tailwind.css?v=${cssVersion}"`);
    }

    fs.writeFileSync(outPath, content, 'utf8');

    // Sanity check: o CSS compilado do Tailwind (assets/css/tailwind.css) deve estar
    // presente em todo output, EXCETO em leads/**. /leads é a página administrativa com
    // CSP restrita (sem Tailwind) — ver docs/DASHBOARD-LEADS.md e assets/css/leads.css
    // (CSS próprio). Migrado do Play CDN (cdn.tailwindcss.com) para o Tailwind CLI
    // compilado em out/2026 — ver publicacao/RELATORIO-TAILWIND-COMPILADO.md.
    const ehPaginaLeads = relPath === 'leads.html' || relPath.startsWith('leads/');
    if (!ehPaginaLeads && !content.includes('assets/css/tailwind.css')) {
      console.error(`  [ERRO] assets/css/tailwind.css NÃO encontrado em ${path.relative(OUT_DIR, outPath)} — verifique o partial head-common!`);
      errors++;
    }
    if (ehPaginaLeads && (content.includes('cdn.tailwindcss.com') || content.includes('assets/css/tailwind.css'))) {
      console.error(`  [ERRO] ${path.relative(OUT_DIR, outPath)} é a página /leads (CSP restrita) e NÃO deve incluir Tailwind (CDN ou compilado)!`);
      errors++;
    }
    // Sanity check: no unresolved INCLUDE markers
    if (/<!-- INCLUDE:/.test(content)) {
      console.error(`  [ERRO] Marcador <!-- INCLUDE: --> não resolvido em ${path.relative(OUT_DIR, outPath)} — partial ausente?`);
      errors++;
    }

    console.log(`  ✓ ${path.relative(OUT_DIR, outPath)}`);
    count++;
  }
}

processDir(SRC_DIR, OUT_DIR);

if (errors > 0) process.exitCode = 1;
console.log(`\nBuild concluído: ${count} página(s) gerada(s) em ${OUT_DIR}`);
