'use strict';
const fs = require('fs');
const path = require('path');

const PARTIALS_DIR = path.join(__dirname, 'partials');
const SRC_DIR = path.join(__dirname, 'src', 'pages');
const OUT_DIR = __dirname;

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

    let content = fs.readFileSync(srcPath, 'utf8');

    // Replace all <!-- INCLUDE:name --> markers
    content = content.replace(/<!-- INCLUDE:([\w-]+) -->/g, (match, name) => {
      if (partials[name] === undefined) {
        console.warn(`  [WARN] Partial não encontrado: "${name}" (em ${item})`);
        return match;
      }
      return partials[name];
    });

    fs.writeFileSync(outPath, content, 'utf8');

    // Sanity check: Tailwind CDN must be present in every output
    if (!content.includes('cdn.tailwindcss.com')) {
      console.error(`  [ERRO] cdn.tailwindcss.com NÃO encontrado em ${path.relative(OUT_DIR, outPath)} — verifique o partial head-common!`);
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
