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

// Process each source page
let count = 0;
for (const file of fs.readdirSync(SRC_DIR)) {
  if (!file.endsWith('.html')) continue;
  let content = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');

  // Replace all <!-- INCLUDE:name --> markers
  content = content.replace(/<!-- INCLUDE:([\w-]+) -->/g, (match, name) => {
    if (partials[name] === undefined) {
      console.warn(`  [WARN] Partial não encontrado: "${name}" (em ${file})`);
      return match;
    }
    return partials[name];
  });

  fs.writeFileSync(path.join(OUT_DIR, file), content, 'utf8');
  console.log(`  ✓ ${file}`);
  count++;
}
console.log(`\nBuild concluído: ${count} página(s) gerada(s) em ${OUT_DIR}`);
