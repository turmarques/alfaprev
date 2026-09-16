'use strict';
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src', 'pages');
const OUT_FILE = path.join(__dirname, 'CONTEUDO-PAGINAS.md');

// Ordem de exibição das páginas no arquivo .md
const PAGE_ORDER = [
  { file: 'index.html',                             label: 'Home (index.html)' },
  { file: 'servicos.html',                          label: 'Serviços (servicos.html)' },
  { file: 'blog-sci.html',                          label: 'Blog SCI — Hub (blog-sci.html)' },
  { file: path.join('blog-sci', 'avcb-clcb.html'),                   label: 'Artigo: AVCB e CLCB (blog-sci/avcb-clcb.html)' },
  { file: path.join('blog-sci', 'lei-kiss-decreto-56819.html'),       label: 'Artigo: Lei Kiss e Decreto 56.819 (blog-sci/lei-kiss-decreto-56819.html)' },
  { file: path.join('blog-sci', 'vencimento-avcb-clcb.html'),        label: 'Artigo: Vencimento AVCB/CLCB (blog-sci/vencimento-avcb-clcb.html)' },
  { file: 'quem-somos.html',                        label: 'Quem Somos (quem-somos.html)' },
  { file: 'faq.html',                               label: 'FAQ (faq.html)' },
  { file: 'contato.html',                           label: 'Contato (contato.html)' },
];

function extractText(html) {
  // Remove bloco <head> inteiro (meta, title, scripts, JSON-LD, etc.)
  html = html.replace(/<head[\s\S]*?<\/head>/gi, '');
  // Remove todos os blocos <script> e seu conteúdo
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove todos os blocos <style> e seu conteúdo
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove comentários HTML
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  // Remove atributos de tags de forma a não deixar lixo (ex: class="...", aria-label="...")
  // Remove todas as tags HTML restantes
  html = html.replace(/<[^>]+>/g, ' ');
  // Decodifica entidades HTML comuns
  html = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&#x2F;/g, '/')
    .replace(/&[a-z]+;/gi, ' ');
  // Colapsa múltiplos espaços/tabs em um único espaço
  html = html.replace(/[ \t]+/g, ' ');
  // Colapsa mais de 2 quebras de linha consecutivas em 2
  html = html.replace(/\n{3,}/g, '\n\n');
  // Remove linhas que contenham apenas espaços
  html = html.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
  return html.trim();
}

const lines = [];
lines.push('# Conteúdo Textual das Páginas — Alfa Prev');
lines.push('');
lines.push('> Arquivo gerado automaticamente por `generate-content-md.js` via `npm run build`.');
lines.push('> **Não edite manualmente.** Edite o conteúdo em `src/pages/` e rode `npm run build`.');
lines.push('');
lines.push(`Gerado em: ${new Date().toISOString()}`);
lines.push('');
lines.push('---');
lines.push('');

let found = 0;
let missing = 0;

for (const { file, label } of PAGE_ORDER) {
  const srcPath = path.join(SRC_DIR, file);
  lines.push(`## ${label}`);
  lines.push('');
  if (!fs.existsSync(srcPath)) {
    lines.push(`_Arquivo não encontrado: src/pages/${file.replace(/\\/g, '/')}_`);
    lines.push('');
    missing++;
  } else {
    const raw = fs.readFileSync(srcPath, 'utf8');
    const text = extractText(raw);
    lines.push(text);
    lines.push('');
    found++;
  }
  lines.push('---');
  lines.push('');
}

fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
console.log(`  ✓ CONTEUDO-PAGINAS.md gerado (${found} página(s)${missing > 0 ? `, ${missing} não encontrada(s)` : ''})`);
