'use strict';
/**
 * ALFA PREV — scripts/verificar-seguranca.js
 * ===========================================
 * Guarda de regressão de segurança (auditoria out/2026, ver docs/SEGURANCA.md).
 * Não é um scanner genérico: verifica apenas os padrões que esta auditoria
 * encontrou e corrigiu, para falhar o build se alguém reintroduzir um deles
 * sem querer (merge, copiar/colar, reescrita futura).
 *
 * Uso: npm run seguranca
 * Saída: 0 (ok) ou 1 (bloqueador encontrado, mensagem explica o quê e onde).
 *
 * NÃO substitui revisão manual nem as ferramentas usadas na auditoria original
 * (npm audit, eslint-plugin-security, scan de histórico do git) — é só uma
 * rede de segurança rápida para rodar a cada build local.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const erros = [];
const avisos = [];

// -----------------------------------------------------------------------
// Utilitários
// -----------------------------------------------------------------------
function listarArquivos(dirRelativo, extensoes, ignorar) {
  const dirAbs = path.join(ROOT, dirRelativo);
  if (!fs.existsSync(dirAbs)) return [];
  const resultado = [];
  (function andar(atual) {
    for (const nome of fs.readdirSync(atual)) {
      const abs = path.join(atual, nome);
      const relRaiz = path.relative(ROOT, abs).split(path.sep).join('/');
      if (ignorar && ignorar.some((padrao) => relRaiz.includes(padrao))) continue;
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        andar(abs);
      } else if (extensoes.includes(path.extname(nome))) {
        resultado.push(abs);
      }
    }
  })(dirAbs);
  return resultado;
}

function conteudo(absPath) {
  return fs.readFileSync(absPath, 'utf8');
}

function rel(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join('/');
}

// Ignora vendor/ (biblioteca de terceiros, não é código nosso) e dist-locaweb/
// (pacote gerado, já passa pelos próprios bloqueadores de empacotar-locaweb.js).
const IGNORAR_JS = ['assets/vendor/', 'dist-locaweb/', 'node_modules/'];
const IGNORAR_HTML = ['dist-locaweb/', 'node_modules/'];

// -----------------------------------------------------------------------
// 1. innerHTML / outerHTML / insertAdjacentHTML em JS próprio
//    (convenção do projeto: só textContent para conteúdo potencialmente
//    não confiável, especialmente em /leads — ver CLAUDE.md)
// -----------------------------------------------------------------------
function checarInnerHtml() {
  const arquivosJs = [
    ...listarArquivos('assets/js', ['.js'], IGNORAR_JS),
    path.join(ROOT, 'script.js'),
  ].filter((f) => fs.existsSync(f));

  // innerHTML/outerHTML = '' (ou "") apenas LIMPA o elemento — sem risco de
  // injeção, é equivalente a removeChild em loop. Só interessa a atribuição
  // de algo que não seja uma string vazia literal, ou insertAdjacentHTML.
  const padraoAtribuicao = /\.(innerHTML|outerHTML)\s*=/;
  const padraoLimpezaSegura = /\.(innerHTML|outerHTML)\s*=\s*(["'])\2\s*;/;
  const padraoInsertAdjacent = /insertAdjacentHTML\s*\(/;
  for (const arquivo of arquivosJs) {
    const linhas = conteudo(arquivo).split('\n');
    linhas.forEach((linha, i) => {
      const atribuiHtml = padraoAtribuicao.test(linha) && !padraoLimpezaSegura.test(linha);
      if (atribuiHtml || padraoInsertAdjacent.test(linha)) {
        erros.push(`innerHTML/outerHTML/insertAdjacentHTML encontrado em ${rel(arquivo)}:${i + 1} — usar textContent (convenção do projeto, ver CLAUDE.md).`);
      }
    });
  }
}

// -----------------------------------------------------------------------
// 2. eval() / new Function() / document.write com variável
// -----------------------------------------------------------------------
function checarEvalEDocumentWrite() {
  const arquivosJs = [
    ...listarArquivos('assets/js', ['.js'], IGNORAR_JS),
    path.join(ROOT, 'script.js'),
    path.join(ROOT, 'build.js'),
    path.join(ROOT, 'generate-content-md.js'),
    // Exclui este próprio arquivo: os padrões de busca abaixo contêm, como
    // texto literal, as strings que eles mesmos procuram (ex: "eval(",
    // "document.write("), o que geraria falso positivo ao escanear a si
    // mesmo.
    ...listarArquivos('scripts', ['.js'], [...IGNORAR_JS, 'verificar-seguranca.js']),
  ].filter((f) => fs.existsSync(f));

  const padraoEval = /\beval\s*\(|new\s+Function\s*\(/;
  const padraoDocWrite = /document\.write\s*\(\s*[^'")]/; // document.write(variavel...) — literal entre aspas é inofensivo

  for (const arquivo of arquivosJs) {
    const linhas = conteudo(arquivo).split('\n');
    linhas.forEach((linha, i) => {
      if (padraoEval.test(linha)) {
        erros.push(`eval()/new Function() encontrado em ${rel(arquivo)}:${i + 1}.`);
      }
      if (padraoDocWrite.test(linha)) {
        erros.push(`document.write() com valor não-literal encontrado em ${rel(arquivo)}:${i + 1}.`);
      }
    });
  }
}

// -----------------------------------------------------------------------
// 3. Handlers de evento inline (onclick=, onerror=, etc.) em HTML próprio
// -----------------------------------------------------------------------
function checarHandlersInline() {
  const arquivosHtml = [
    ...listarArquivos('src/pages', ['.html'], IGNORAR_HTML),
    ...listarArquivos('partials', ['.html'], IGNORAR_HTML),
  ];

  const padrao = /\son(click|load|error|mouseover|submit|change|focus|blur)\s*=\s*["']/i;
  for (const arquivo of arquivosHtml) {
    const linhas = conteudo(arquivo).split('\n');
    linhas.forEach((linha, i) => {
      if (padrao.test(linha)) {
        erros.push(`handler de evento inline (on*=) encontrado em ${rel(arquivo)}:${i + 1} — usar addEventListener.`);
      }
    });
  }
}

// -----------------------------------------------------------------------
// 4. Chave Supabase service_role (JWT com claim role=service_role) em
//    qualquer arquivo que será publicado — nunca pode existir no repositório.
// -----------------------------------------------------------------------
function checarChaveServiceRole() {
  const padraoJwt = /\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g;
  const candidatos = [
    ...listarArquivos('assets', ['.js', '.html', '.json'], IGNORAR_JS),
    ...listarArquivos('src', ['.html'], IGNORAR_HTML),
    ...listarArquivos('partials', ['.html'], IGNORAR_HTML),
    path.join(ROOT, 'script.js'),
  ].filter((f) => fs.existsSync(f));

  for (const arquivo of candidatos) {
    const texto = conteudo(arquivo);
    const tokens = texto.match(padraoJwt) || [];
    for (const token of tokens) {
      const partes = token.split('.');
      if (partes.length < 2) continue;
      try {
        const payloadBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        if (payload && payload.role === 'service_role') {
          erros.push(`chave Supabase com role "service_role" encontrada em ${rel(arquivo)} — NUNCA pode estar no repositório.`);
        }
      } catch (e) {
        // não é um JWT decodificável — ignora
      }
    }
  }
}

// -----------------------------------------------------------------------
// 5. target="_blank" sem rel="noopener" (ou noreferrer)
// -----------------------------------------------------------------------
function checarTargetBlank() {
  const arquivosHtml = [
    ...listarArquivos('src/pages', ['.html'], IGNORAR_HTML),
    ...listarArquivos('partials', ['.html'], IGNORAR_HTML),
  ];

  for (const arquivo of arquivosHtml) {
    const texto = conteudo(arquivo);
    const tagsComBlank = texto.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || [];
    for (const tag of tagsComBlank) {
      if (!/rel=["'][^"']*(noopener|noreferrer)/i.test(tag)) {
        erros.push(`<a target="_blank"> sem rel="noopener"/"noreferrer" encontrado em ${rel(arquivo)}: ${tag.slice(0, 80)}...`);
      }
    }
  }
}

// -----------------------------------------------------------------------
// 6. /leads nunca pode aparecer em robots.txt ou sitemap.xml (proteção é
//    Supabase Auth + RLS, não obscuridade — mas também não precisa convidar).
// -----------------------------------------------------------------------
function checarLeadsNaoPublico() {
  for (const nome of ['robots.txt', 'sitemap.xml']) {
    const arquivo = path.join(ROOT, nome);
    if (!fs.existsSync(arquivo)) continue;
    if (/leads/i.test(conteudo(arquivo))) {
      erros.push(`"leads" encontrado em ${nome} — o painel administrativo nunca deve ser referenciado ali.`);
    }
  }
}

// -----------------------------------------------------------------------
// 7. leads.html (fonte e gerado) precisa manter noindex + CSP própria
// -----------------------------------------------------------------------
function checarLeadsNoindexECsp() {
  const candidatos = [
    path.join(ROOT, 'src', 'pages', 'leads.html'),
    path.join(ROOT, 'leads.html'),
  ];
  for (const arquivo of candidatos) {
    if (!fs.existsSync(arquivo)) {
      avisos.push(`${rel(arquivo)} não encontrado — rode "npm run build" antes de "npm run seguranca" para checar o arquivo gerado.`);
      continue;
    }
    const texto = conteudo(arquivo);
    if (!/noindex/i.test(texto)) {
      erros.push(`${rel(arquivo)} perdeu a meta "noindex".`);
    }
    if (!/Content-Security-Policy/i.test(texto)) {
      erros.push(`${rel(arquivo)} perdeu a <meta http-equiv="Content-Security-Policy">.`);
    }
  }
}

// -----------------------------------------------------------------------
// 8. Headers de segurança obrigatórios em netlify.toml e no .htaccess real
//    de produção (publicacao/modelos/.htaccess) — o achado mais grave da
//    auditoria de out/2026 foi o .htaccess de produção sem CSP nenhuma.
// -----------------------------------------------------------------------
function checarHeadersServidor() {
  const netlify = path.join(ROOT, 'netlify.toml');
  const htaccess = path.join(ROOT, 'publicacao', 'modelos', '.htaccess');

  const obrigatorios = ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Cross-Origin-Opener-Policy'];

  for (const arquivo of [netlify, htaccess]) {
    if (!fs.existsSync(arquivo)) {
      erros.push(`arquivo de configuração de servidor não encontrado: ${rel(arquivo)}.`);
      continue;
    }
    const texto = conteudo(arquivo);
    for (const header of obrigatorios) {
      if (!texto.includes(header)) {
        erros.push(`header "${header}" não encontrado em ${rel(arquivo)}.`);
      }
    }
  }
}

// -----------------------------------------------------------------------
// 9. Pacote publicado (dist-locaweb/, se existir) não pode conter arquivos
//    de documentação/fonte/configuração interna.
// -----------------------------------------------------------------------
function checarPacotePublicado() {
  const distDir = path.join(ROOT, 'dist-locaweb');
  if (!fs.existsSync(distDir)) return; // ok não existir ainda — só roda após "npm run empacotar"

  const extensoesProibidas = ['.md', '.sql', '.log', '.env', '.bak'];
  (function andar(atual) {
    for (const nome of fs.readdirSync(atual)) {
      const abs = path.join(atual, nome);
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        andar(abs);
      } else if (extensoesProibidas.includes(path.extname(nome)) || nome === '.git') {
        erros.push(`arquivo que não deveria estar no pacote publicado: ${rel(abs)}.`);
      }
    }
  })(distDir);
}

// -----------------------------------------------------------------------
// Execução
// -----------------------------------------------------------------------
checarInnerHtml();
checarEvalEDocumentWrite();
checarHandlersInline();
checarChaveServiceRole();
checarTargetBlank();
checarLeadsNaoPublico();
checarLeadsNoindexECsp();
checarHeadersServidor();
checarPacotePublicado();

if (avisos.length > 0) {
  console.log('Avisos (não bloqueiam o build):');
  for (const a of avisos) console.log(`  ⚠ ${a}`);
  console.log('');
}

if (erros.length > 0) {
  console.error(`❌ ${erros.length} bloqueador(es) de segurança encontrado(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exitCode = 1;
} else {
  console.log('✓ Nenhum bloqueador de segurança conhecido encontrado.');
}
