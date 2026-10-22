'use strict';
/**
 * ALFA PREV — scripts/empacotar-locaweb.js
 * ==========================================
 * Gera o pacote de publicação para hospedagem Locaweb (ou qualquer Apache
 * compartilhado) a partir dos arquivos já gerados pelo build (`npm run build`).
 *
 * NÃO modifica nada em /src/pages/, /partials/ ou /assets/ — apenas lê os
 * arquivos finais (gerados na raiz do repositório) e copia os que devem ir
 * ao ar para dist-locaweb/, removendo comentários HTML internos apenas na
 * CÓPIA (nunca no arquivo-fonte) e falhando com mensagem clara se encontrar
 * um bloqueador crítico (chave secreta, noindex fora de /leads, localhost,
 * marcador [PREENCHER] em página pública).
 *
 * Uso: npm run empacotar
 *
 * Saída:
 *   dist-locaweb/                         (pacote pronto para FTP — nunca editar à mão)
 *   publicacao/MANIFESTO-PACOTE.txt       (lista de arquivos + tamanho + SHA-256)
 *   alfaprev-site-AAAA-MM-DD.zip          (se houver ferramenta de zip disponível)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist-locaweb');
const MANIFESTO_PATH = path.join(ROOT, 'publicacao', 'MANIFESTO-PACOTE.txt');
const MODELOS_DIR = path.join(ROOT, 'publicacao', 'modelos');

// -----------------------------------------------------------------------
// 1. Lista do que publicar — caminhos relativos à raiz do repositório.
//    Mantida manualmente em sincronia com PUBLICACAO-LOCAWEB.md §1.1.
//    Apenas arquivos REALMENTE referenciados por alguma página (confirmado
//    por grep antes de cada publicação/revisão desta lista).
// -----------------------------------------------------------------------
const PAGINAS_HTML = [
  'index.html',
  'servicos.html',
  'quem-somos.html',
  'blog-sci.html',
  path.join('blog-sci', 'avcb-clcb.html'),
  'contato.html',
  'leads.html', // publicada, porém oculta (noindex, sem link, fora do sitemap)
];

const ARQUIVOS_RAIZ = [
  'robots.txt',
  'sitemap.xml',
];

const ARQUIVOS_ASSETS = [
  // CSS / JS do site público
  // assets/css/tailwind.css é GERADO por "npm run css:build" (parte de "npm run build")
  // a partir de assets/css/tailwind-origem.css — nunca publicar o arquivo de entrada,
  // só o compilado. Ver publicacao/RELATORIO-TAILWIND-COMPILADO.md.
  path.join('assets', 'css', 'tailwind.css'),
  path.join('styles.css'),
  path.join('script.js'),
  path.join('assets', 'js', 'metricas.js'),
  // CSS / JS / fonte exclusivos do /leads
  path.join('assets', 'css', 'leads.css'),
  path.join('assets', 'js', 'leads', 'app.js'),
  path.join('assets', 'js', 'leads', 'auth.js'),
  path.join('assets', 'js', 'leads', 'bloqueio.js'),
  path.join('assets', 'js', 'leads', 'csv.js'),
  path.join('assets', 'js', 'leads', 'dashboard.js'),
  path.join('assets', 'js', 'leads', 'grade.js'),
  path.join('assets', 'js', 'leads', 'telefone.js'),
  path.join('assets', 'fonts', 'inter-var.woff2'),
  // Favicon e imagens efetivamente referenciadas (ver PUBLICACAO-LOCAWEB.md §1.1 para o
  // resultado do grep de referência — exclui logo-original.png, logo-color.svg,
  // logo-icon-white.svg, *-helmet.jpg, logo-light-bg.jpg, e o favicon duplicado na raiz)
  path.join('assets', 'favicon.ico'),
  path.join('assets', 'favicon.svg'),
  path.join('assets', 'logo', 'logo-white.svg'),
  path.join('assets', 'logo', 'logo-icon-dark.svg'),
  path.join('assets', 'images', 'logo-dark-bg.jpg'),
];

// API PHP (api/) — nunca inclui api/config.local.php (gitignored, criado manualmente
// no servidor a partir de api/config.example.php). database/ e tools/ NUNCA são
// publicados (schema SQL e utilitário de geração de hash de admin são só para uso local).
const ARQUIVOS_API = [
  path.join('api', '.htaccess'),
  path.join('api', 'config.example.php'),
  path.join('api', 'config.php'),
  path.join('api', 'cancelar-mfa.php'),
  path.join('api', 'dashboard.php'),
  path.join('api', 'lead.php'),
  path.join('api', 'leads.php'),
  path.join('api', 'login.php'),
  path.join('api', 'logout.php'),
  path.join('api', 'metrica.php'),
  path.join('api', 'mfa-cadastro.php'),
  path.join('api', 'mfa-verificar.php'),
  path.join('api', 'sessao-verificar.php'),
  path.join('api', 'lib', 'db.php'),
  path.join('api', 'lib', 'hash.php'),
  path.join('api', 'lib', 'rate_limit.php'),
  path.join('api', 'lib', 'resposta.php'),
  path.join('api', 'lib', 'sessao.php'),
  path.join('api', 'lib', 'tempo.php'),
  path.join('api', 'lib', 'totp.php'),
  path.join('api', 'lib', 'validacao.php'),
];

const ARQUIVOS_PUBLICAR = [...PAGINAS_HTML, ...ARQUIVOS_RAIZ, ...ARQUIVOS_ASSETS, ...ARQUIVOS_API];

// -----------------------------------------------------------------------
// 2. Padrões de bloqueador crítico — se encontrados no CONTEÚDO de um arquivo
//    a publicar, o empacotamento é interrompido (exceto exceções explícitas).
// -----------------------------------------------------------------------
const PADRAO_PREENCHER = /\[PREENCHER|SUA_CHAVE_WEB3FORMS/;
// Procura localhost/127.0.0.1 apenas dentro de uma URL (schema:// ou porta :NNNN) — uma
// referência solta à palavra "localhost" (ex: lista de hosts de desenvolvimento em
// assets/js/metricas.js, usada para DESATIVAR métricas em ambiente local) não é bloqueador.
const PADRAO_LOCALHOST = /(https?:)?\/\/(localhost|127\.0\.0\.1)\b|:\/\/127\.0\.0\.1\b/i;
// noindex é ESPERADO em leads.html (ver exceção abaixo) — crítico em qualquer outra página.
const PADRAO_NOINDEX = /noindex/i;
// Credenciais reais do MySQL nunca podem ir ao pacote — api/config.local.php é gitignored e
// nunca faz parte de ARQUIVOS_PUBLICAR, mas o template (api/config.example.php) precisa manter
// o placeholder "SUBSTITUIR_" em vez de um valor real (mesma convenção checada em
// scripts/verificar-seguranca.js).
const PADRAO_CONFIG_LOCAL_REAL = /'(host|port|dbname|user|password|sal_fixo)'\s*=>\s*'(?!SUBSTITUIR_)[^']+'/;

function arquivoEhLeads(relPath) {
  const norm = relPath.split(path.sep).join('/');
  return norm === 'leads.html' || norm.startsWith('leads/');
}

function checarBloqueadores(relPath, conteudo) {
  const erros = [];
  const norm = relPath.split(path.sep).join('/');
  if (norm === 'api/config.example.php' && PADRAO_CONFIG_LOCAL_REAL.test(conteudo)) {
    erros.push(`api/config.example.php parece conter uma credencial real (sem placeholder "SUBSTITUIR_") — NUNCA pode ir ao ar.`);
  }
  if (PADRAO_PREENCHER.test(conteudo)) {
    erros.push(`marcador de placeholder ([PREENCHER] ou SUA_CHAVE_WEB3FORMS) encontrado em ${relPath}.`);
  }
  if (PADRAO_LOCALHOST.test(conteudo)) {
    erros.push(`referência a localhost/127.0.0.1 encontrada em ${relPath}.`);
  }
  if (!arquivoEhLeads(relPath) && PADRAO_NOINDEX.test(conteudo)) {
    erros.push(`"noindex" encontrado em ${relPath}, mas esta página não é /leads — bloqueia indexação indevidamente.`);
  }
  return erros;
}

// -----------------------------------------------------------------------
// 3. Remoção de comentários HTML — aplicada SOMENTE na cópia em dist-locaweb/,
//    nunca nos arquivos-fonte. Preserva o conteúdo de <script>, <style> e <pre>
//    (que podem conter "<!--" dentro de strings/CDATA) extraindo-os antes de
//    remover comentários e devolvendo-os depois.
// -----------------------------------------------------------------------
function removerComentariosHtml(html) {
  const preservados = [];
  const PLACEHOLDER = (i) => `__EMPACOTAR_PRESERVADO_${i}__`;

  // Extrai blocos <script>...</script>, <style>...</style> e <pre>...</pre> (case-insensitive, non-greedy)
  let semBlocosSensiveis = html.replace(/<(script|style|pre)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
    const idx = preservados.push(match) - 1;
    return PLACEHOLDER(idx);
  });

  // Remove comentários HTML (<!-- ... -->), exceto condicionais já expandidos (não usamos IE conditional comments)
  semBlocosSensiveis = semBlocosSensiveis.replace(/<!--[\s\S]*?-->/g, '');

  // Restaura os blocos preservados
  const restaurado = semBlocosSensiveis.replace(/__EMPACOTAR_PRESERVADO_(\d+)__/g, (_, i) => preservados[Number(i)]);

  return restaurado;
}

// -----------------------------------------------------------------------
// 4. Utilitários de arquivo
// -----------------------------------------------------------------------
function sha256DoArquivo(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function copiarArquivo(relPath) {
  const origem = path.join(ROOT, relPath);
  const destino = path.join(DIST_DIR, relPath);

  if (!fs.existsSync(origem)) {
    throw new Error(`Arquivo listado para publicação não existe: ${relPath}. Rode "npm run build" antes de empacotar.`);
  }

  fs.mkdirSync(path.dirname(destino), { recursive: true });

  const ehHtml = relPath.endsWith('.html');
  if (ehHtml) {
    const original = fs.readFileSync(origem, 'utf8');

    const erros = checarBloqueadores(relPath, original);
    if (erros.length > 0) {
      throw new Error(`Bloqueador crítico em ${relPath}:\n  - ${erros.join('\n  - ')}`);
    }

    const limpo = removerComentariosHtml(original);
    fs.writeFileSync(destino, limpo, 'utf8');
  } else {
    // Arquivos binários/CSS/JS: copiados sem alteração, mas ainda passam pelo
    // scan de bloqueadores se forem texto (CSS/JS/txt/xml).
    const extensoesTexto = ['.js', '.css', '.txt', '.xml', '.json', '.svg', '.php'];
    if (extensoesTexto.includes(path.extname(relPath))) {
      const conteudo = fs.readFileSync(origem, 'utf8');
      const erros = checarBloqueadores(relPath, conteudo);
      if (erros.length > 0) {
        throw new Error(`Bloqueador crítico em ${relPath}:\n  - ${erros.join('\n  - ')}`);
      }
    }
    fs.copyFileSync(origem, destino);
  }

  return destino;
}

function copiarModelosServidor() {
  // leads.html é um ARQUIVO único (não uma subpasta), então o bloco de headers restritos
  // para /leads (Bloco 3 — ver publicacao/AUDITORIA-SEO.md e publicacao/modelos/.htaccess)
  // já vem embutido como <FilesMatch "^leads\.html$"> dentro do .htaccess único da raiz —
  // não existe um "leads/.htaccess" separado neste site. O antigo publicacao/modelos/leads.htaccess
  // (arquivo isolado e desatualizado) foi removido em out/2026 — nunca foi copiado ao pacote.
  const htaccessRaiz = path.join(MODELOS_DIR, '.htaccess');
  if (fs.existsSync(htaccessRaiz)) {
    fs.copyFileSync(htaccessRaiz, path.join(DIST_DIR, '.htaccess'));
  } else {
    console.warn('   ⚠ publicacao/modelos/.htaccess não encontrado — pacote gerado SEM .htaccess. Copie manualmente antes do upload.');
  }
}

function gerarManifesto(arquivosCopiados) {
  const linhas = [];
  linhas.push('MANIFESTO DO PACOTE — alfaprev dist-locaweb/');
  linhas.push(`Gerado em: ${new Date().toISOString()}`);
  linhas.push('');
  let tamanhoTotal = 0;
  const detalhes = arquivosCopiados.map((destino) => {
    const stat = fs.statSync(destino);
    tamanhoTotal += stat.size;
    const relPath = path.relative(DIST_DIR, destino).split(path.sep).join('/');
    return { relPath, size: stat.size, sha256: sha256DoArquivo(destino) };
  });

  detalhes.sort((a, b) => a.relPath.localeCompare(b.relPath));
  for (const d of detalhes) {
    linhas.push(`${d.sha256}  ${String(d.size).padStart(10, ' ')} bytes  ${d.relPath}`);
  }

  linhas.push('');
  linhas.push(`Total de arquivos: ${detalhes.length}`);
  linhas.push(`Tamanho total: ${tamanhoTotal} bytes (${(tamanhoTotal / 1024).toFixed(1)} KB)`);
  linhas.push('');
  linhas.push('10 maiores arquivos:');
  const maiores = [...detalhes].sort((a, b) => b.size - a.size).slice(0, 10);
  for (const d of maiores) {
    linhas.push(`  ${(d.size / 1024).toFixed(1).padStart(8, ' ')} KB  ${d.relPath}`);
  }

  fs.mkdirSync(path.dirname(MANIFESTO_PATH), { recursive: true });
  fs.writeFileSync(MANIFESTO_PATH, linhas.join('\n') + '\n', 'utf8');

  return { totalArquivos: detalhes.length, tamanhoTotal, maiores };
}

function tentarGerarZip() {
  const dataHoje = new Date().toISOString().slice(0, 10);
  const zipPath = path.join(ROOT, `alfaprev-site-${dataHoje}.zip`);

  try {
    // PowerShell (Windows) — sempre disponível no ambiente de desenvolvimento deste projeto.
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'ignore' }
    );
    if (fs.existsSync(zipPath)) return zipPath;
  } catch (e) {
    // segue para a próxima tentativa
  }

  try {
    execSync(`zip -r "${zipPath}" .`, { cwd: DIST_DIR, stdio: 'ignore' });
    if (fs.existsSync(zipPath)) return zipPath;
  } catch (e) {
    // nenhuma ferramenta de zip disponível
  }

  return null;
}

// -----------------------------------------------------------------------
// Execução
// -----------------------------------------------------------------------
function main() {
  console.log('1. Rodando "npm run build"...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

  console.log('\n2. Limpando dist-locaweb/ anterior (se existir)...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  console.log('\n3. Copiando arquivos para dist-locaweb/ (removendo comentários HTML na cópia)...');
  const copiados = [];
  for (const relPath of ARQUIVOS_PUBLICAR) {
    const destino = copiarArquivo(relPath);
    copiados.push(destino);
    console.log(`   ✓ ${relPath}`);
  }

  console.log('\n4. Copiando modelos de servidor (.htaccess) para a raiz do pacote...');
  copiarModelosServidor();

  console.log('\n5. Gerando manifesto (publicacao/MANIFESTO-PACOTE.txt)...');
  const resumo = gerarManifesto(copiados);
  console.log(`   ✓ ${resumo.totalArquivos} arquivo(s), ${(resumo.tamanhoTotal / 1024).toFixed(1)} KB total`);

  console.log('\n6. Gerando .zip (se houver ferramenta disponível)...');
  const zip = tentarGerarZip();
  if (zip) {
    console.log(`   ✓ ${path.relative(ROOT, zip)}`);
  } else {
    console.log('   ⚠ Nenhuma ferramenta de zip encontrada (Compress-Archive/zip). A pasta dist-locaweb/ sozinha já é suficiente para upload via FTP — basta enviar o CONTEÚDO da pasta, não a pasta em si.');
  }

  console.log('\nPacote gerado em dist-locaweb/. Lembrete: nunca edite essa pasta manualmente — regenere com "npm run empacotar".');
}

try {
  main();
} catch (err) {
  console.error('\n❌ EMPACOTAMENTO INTERROMPIDO — bloqueador crítico encontrado:');
  console.error(err.message);
  process.exitCode = 1;
}
