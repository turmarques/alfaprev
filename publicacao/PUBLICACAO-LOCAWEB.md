# Publicação na Locaweb — Guia Passo a Passo

> Documento de **levantamento, empacotamento e instruções**. Não altera nenhum conteúdo ou
> design do site. Escrito para quem **nunca publicou um site em hospedagem compartilhada**.
> Sempre que um passo depender do painel real da Locaweb (nomes de menus/botões podem mudar),
> está marcado como **"confirmar no painel"** em vez de afirmado de memória.
>
> Gerado em: 2026-10-07. Build confirmado sem erros (`npm run build`, 7 páginas geradas,
> `faq.html` ignorado de propósito — ver `CLAUDE.md`, seção "FAQ oculto").

---

## Bloqueadores (ler antes de tudo)

Lista completa e atualizada de tudo que impede a publicação agora. Itens marcados
**"só Artur pode confirmar"** dependem de acesso a sistemas fora deste ambiente
(painel Locaweb, caixa de e-mail, projeto Supabase real).

| # | Bloqueador | Onde | Só Artur? |
|---|---|---|---|
| 1 | Chave Web3Forms ainda é o placeholder `SUA_CHAVE_WEB3FORMS` | `script.js:282` | Sim — criar chave em web3forms.com |
| 2 | `SUPABASE_URL` e `SUPABASE_ANON_KEY` ainda são placeholders `[PREENCHER: ...]` | `assets/js/config.js:17-18` | Sim — criar projeto Supabase e colar valores |
| 3 | `supabase-schema.sql` ainda não confirmado como executado em produção | `docs/DASHBOARD-LEADS.md` não registra execução real | Sim — só Artur tem acesso ao painel Supabase |
| 4 | `scripts/testar-supabase-rls.js` ainda não confirmado como executado com sucesso contra o projeto real | idem | Sim |
| 5 | Admin do `/leads` (usuário/senha) ainda não criado, cadastro público ainda não desativado no Supabase Auth | idem | Sim |
| 6 | Parágrafo novo sobre coleta de dados/estatísticas em `contato.html` está marcado `<!-- REVISAR COM CASSIA -->`, pendente de validação jurídica | `contato.html:378` (fonte: `src/pages/contato.html`) | Precisa validação da Cassia, não é bloqueador técnico |
| 7 | 6 blocos de texto sobre cookies/rastreamento marcados `<!-- REVISAR COM CASSIA -->` em todas as páginas (footer de política de privacidade) | `index.html`, `servicos.html`, `quem-somos.html`, `contato.html`, `blog-sci.html`, `blog-sci/avcb-clcb.html` | Precisa validação da Cassia |
| 8 | Faixa de validade do AVCB ("entre 1 e 3 anos") não confirmada com a Cassia | já registrado em `CLAUDE.md`, pendência nº 5 | Precisa validação da Cassia |
| 9 | Citações legais/normativas (ITs, NBR 12962) ainda pendentes de validação técnica | já registrado em `CLAUDE.md`, pendências nº 1-4 e 6 | Precisa validação da Cassia |
| 10 | Domínio de e-mail do site (`alfasci.com.br`) é diferente do domínio do site (`alfaprev-sci.com.br`) — ver DNS abaixo | todas as páginas, JSON-LD, `script.js` | Ver seção DNS — mailbox real só Artur confirma |

**Não encontrados** (checados e ausentes, portanto NÃO bloqueiam):
- Nenhum `[PREENCHER]` ou `TODO`/`FIXME`/`lorem ipsum` em texto visível de página publicada (o único resultado de busca por "preencher" textual foi o rótulo de exemplo `joao@empresa.com` em um `placeholder` de formulário, que é comportamento esperado de um campo de e-mail, não um dado real preenchido incorretamente).
- Nenhum `noindex` fora de `leads.html` (onde é **intencional**).
- Nenhum `Disallow: /` em `robots.txt` — está `Allow: /`, correto.
- Nenhuma URL `localhost`/`127.0.0.1` em página pública (a única ocorrência de "localhost" como palavra solta está em `assets/js/metricas.js`, numa lista de hosts de desenvolvimento usada para **desativar** métricas localmente — não é um link apontando para lá).
- Nenhum e-mail pessoal da Cassia encontrado em código publicado — só `contato@alfasci.com.br`.
- Nenhum link de rede social quebrado/placeholder — Instagram, Facebook e LinkedIn apontam para perfis reais já confirmados em `CLAUDE.md`.
- Nenhuma chave `service_role` do Supabase encontrada em nenhum arquivo (`assets/js/config.js` só tem o placeholder da chave **anon**, que é o único tipo de chave permitido no front-end).
- `leads.html` está corretamente fora de `sitemap.xml`, `robots.txt` e de qualquer link interno (header/footer/qualquer página) — ver seção "Páginas Publicadas" abaixo.
- Nenhum resíduo de link/sitemap/JSON-LD para `faq.html`, artigo "Lei Kiss" ou "vencimento sem renovação" (todos removidos do site em out/2026 — os únicos resquícios são links `/faq.html` **comentados** em HTML, que são removidos automaticamente do pacote publicado, ver §1.3).

### 0.4 — Domínio do e-mail vs. domínio do site (DNS, somente leitura)

O site usa o e-mail `contato@alfasci.com.br` (atualizado em set/2026), mas o domínio do
site é `alfaprev-sci.com.br` (registrado na Locaweb, ativo até 08/09/2027). São domínios
diferentes. Consulta DNS pública (`nslookup`, somente leitura, sem alterar nada) feita em
2026-10-07:

**`alfaprev-sci.com.br`:**
- NS: `ns1.locaweb.com.br`, `ns2.locaweb.com.br`, `ns3.locaweb.com.br`
- MX: `mx.core.locaweb.com.br` (pref. 10), `mx.b.locaweb.com.br` (pref. 10), `mx.a.locaweb.com.br` (pref. 20), `mx.jk.locaweb.com.br` (pref. 20)
- TXT (SPF): `v=spf1 include:_spf.locaweb.com.br -all`
- A: sem resposta de endereço IPv4 no momento da consulta (domínio ainda sem hospedagem apontada — esperado, já que o site ainda não foi publicado)

**`alfasci.com.br`:**
- NS: idênticos (`ns1/ns2/ns3.locaweb.com.br`)
- MX: idênticos em mecanismo (`mx.core`, `mx.b`, `mx.jk`, `mx.a`, mesmas preferências)
- TXT (SPF): idêntico (`v=spf1 include:_spf.locaweb.com.br -all`)
- A: sem resposta de endereço IPv4

**O que isso prova e o que NÃO prova:** os dois domínios têm nameservers e MX apontando
para a infraestrutura de e-mail da Locaweb, o que é consistente com ambos terem sido
registrados/configurados na mesma conta Locaweb. **Isso não comprova que a caixa
`contato@alfasci.com.br` existe e está ativa** — DNS/MX só mostra para onde o e-mail
*seria roteado*, não se a caixa foi criada no painel. **Bloqueador a confirmar por Artur**:
entrar no painel Locaweb → E-mails e confirmar que a caixa `contato@alfasci.com.br` existe,
está ativa, e testar envio/recebimento real antes de publicar (ver passo 3 abaixo). Enquanto
não confirmado, o formulário de contato pode enviar e-mails para uma caixa que não existe.

### 0.5 — Host canônico (www vs. sem-www)

**Verificado no código**: todas as páginas usam consistentemente `https://alfaprev-sci.com.br`
(sem `www`) em `<link rel="canonical">`, `<meta property="og:url">`, todo campo `"url"` de
JSON-LD, e em `sitemap.xml`. **Nenhuma inconsistência encontrada** — não há nenhum arquivo
usando `www.alfaprev-sci.com.br`. Decisão adotada por este documento: **manter sem `www`**
como host canônico, por já ser o padrão 100% consistente no código atual.

---

## PARTE 1 — O que empacotar

### 1.1 Inventário: publicar vs. não publicar

**Publicar** (vai para `dist-locaweb/`, gerado automaticamente por `npm run empacotar`):

| Arquivo/pasta | Observação |
|---|---|
| `index.html`, `servicos.html`, `quem-somos.html`, `blog-sci.html`, `contato.html` | Páginas finais geradas pelo build |
| `blog-sci/avcb-clcb.html` | Único artigo do Blog SCI ainda publicado |
| `leads.html` | Painel administrativo — **publicado, mas oculto** (ver nota abaixo) |
| `robots.txt`, `sitemap.xml` | Config de crawler — já sem `/leads`, `/faq`, artigos removidos |
| `styles.css`, `script.js` | CSS/JS do site público |
| `assets/js/config.js`, `assets/js/metricas.js` | Config Supabase/Web3Forms + métricas anônimas |
| `assets/css/leads.css`, `assets/js/leads/*.js` (7 arquivos) | CSS/JS exclusivos do `/leads` |
| `assets/vendor/supabase-js/supabase.js` + `LICENSE` | Lib Supabase vendorizada (usada só em `/leads`) |
| `assets/fonts/inter-var.woff2` | Fonte self-hosted do `/leads` |
| `assets/favicon.ico`, `assets/favicon.svg` | Favicon (referenciado via `/assets/favicon.*`) |
| `assets/logo/logo-white.svg`, `assets/logo/logo-icon-dark.svg` | Únicos logos efetivamente referenciados no HTML |
| `assets/images/logo-dark-bg.jpg` | Usado como `og:image` em todas as páginas |
| `.htaccess` (de `publicacao/modelos/.htaccess`) | Headers de segurança + cache (ver Parte 2) |

**Nota sobre `/leads`:** é publicado (precisa estar acessível em produção), mas é
**intencionalmente oculto**: `noindex, nofollow, noarchive` na própria página, ausente de
`sitemap.xml` e `robots.txt`, e sem nenhum link de qualquer página pública até ele. A
proteção real contra acesso não autorizado é Supabase Auth + RLS (`is_admin()`), não a
obscuridade da URL — mas a obscuridade reduz a chance de ser encontrado por acaso ou por
crawler.

**Não publicar** (fica fora de `dist-locaweb/`):

| Item | Por quê |
|---|---|
| `src/`, `partials/` | Arquivos-fonte do build, não o site final |
| `build.js`, `generate-content-md.js`, `package.json`, `package-lock.json` | Ferramentas de build, não fazem parte do site |
| `node_modules/` | Dependências de desenvolvimento |
| `.git/`, `.gitignore`, `.idea/`, `.claude/` | Controle de versão e config de IDE |
| `CLAUDE.md`, `CONTEUDO-PAGINAS.md`, `CONTEXTO-CLAUDE-WEB.md` | Documentação interna do projeto |
| `AUDITORIA-*.md`, `AVALIACAO-*.md`, `GUIA-PUBLICACAO-INICIANTE.md` | Relatórios/guias internos |
| `publicacao/` (este diretório) | Documentação e modelos desta tarefa |
| `docs/` | Documentação técnica interna (`DASHBOARD-LEADS.md`) |
| `scripts/` | Scripts internos (empacotamento, teste de RLS) |
| `supabase/` (se existir), `supabase-schema.sql`, `supabase-admin.sql` | SQL de infraestrutura — nunca deve estar acessível via HTTP |
| `.env*` | Nenhum encontrado no repositório — mas nunca deveria ser publicado se existisse |
| `test/` | Testes automatizados |
| Imagens/logos não referenciados: `logo-original.png`, `logo-color.svg`, `logo-icon-white.svg`, `logo-light-bg.jpg`, `logo-dark-helmet.jpg`, `logo-white-helmet.jpg` | Confirmado via busca por referência no HTML — nenhuma página os usa |
| `favicon.ico`/`favicon.svg` da **raiz** (fora de `assets/`) | Duplicados — o HTML só referencia `/assets/favicon.*` |
| `assets/icons/` | Pasta vazia no momento da auditoria |

### 1.2 Scan de segredos e resíduos

Varredura feita em todos os arquivos da lista "Publicar" acima, antes do empacotamento:

- **`service_role`**: nenhuma chave com essa role encontrada. `assets/js/config.js` só tem
  o placeholder da chave `anon` (ainda não preenchido — bloqueador nº 2 acima).
- **`secret`/`password`/`private key`/tokens**: a única ocorrência de "password" é o atributo
  HTML `type="password"` do campo de login em `leads.html` (comportamento normal de formulário,
  não um segredo exposto). Nenhuma chave ou token hardcoded encontrado.
- **E-mails não oficiais**: nenhum encontrado — todas as ocorrências de e-mail nas páginas
  publicadas são `contato@alfasci.com.br` (e o placeholder de exemplo `joao@empresa.com` no
  atributo `placeholder` do campo de formulário, que nunca é enviado, é só texto de exemplo
  visível antes do usuário digitar).
- **E-mail do admin do `/leads`**: não aparece em nenhum arquivo publicado (login é feito via
  formulário vazio — usuário digita as credenciais, nada fica hardcoded no HTML/JS).
- **`/leads` sem modo demo**: confirmado em `assets/js/leads/auth.js` — não há atalho de acesso
  sem autenticação nem dados de demonstração embutidos.
- **Nenhuma página pública carrega o cliente Supabase ou qualquer script de terceiros**: as
  6 páginas públicas carregam apenas `config.js` e `metricas.js` (que fazem `fetch` direto à
  REST API do Supabase, sem a biblioteca `@supabase/supabase-js`). Só `leads.html` carrega
  `assets/vendor/supabase-js/supabase.js` (vendorizado, não CDN).

### 1.3 Comentários HTML não podem ir ao público

Comentários internos (ex: `<!-- REVISAR COM CASSIA: ... -->`, o link `<!-- <a href="/faq.html">...` comentado) ficariam visíveis a qualquer pessoa que inspecionar o código-fonte da
página publicada. `scripts/empacotar-locaweb.js` remove **todos** os comentários HTML
(`<!-- ... -->`) **apenas na cópia dentro de `dist-locaweb/`**, nunca nos arquivos-fonte.
A implementação preserva o conteúdo de `<script>`, `<style>` e `<pre>` (que podem ter texto
parecido com comentário dentro de strings) extraindo esses blocos antes da remoção e
devolvendo-os depois. Validado manualmente (ver §1.5) que o JSON-LD de todas as páginas
continua sendo JSON válido após a remoção.

### 1.4 Script de empacotamento

Criado `scripts/empacotar-locaweb.js` + `npm run empacotar`. O que ele faz, em ordem:

1. Roda `npm run build` (garante que os HTMLs na raiz estão sincronizados com `/src/pages/`).
2. Apaga qualquer `dist-locaweb/` anterior e recria do zero.
3. Copia cada arquivo da lista "Publicar" (§1.1) para `dist-locaweb/`, removendo comentários
   HTML na cópia (§1.3) e rodando o scan de bloqueadores críticos (§1.2) em cada arquivo antes
   de copiar.
4. **Bloqueadores críticos fazem o script falhar imediatamente** com mensagem clara, listando
   o arquivo e o motivo: chave Supabase com `role: "service_role"` no payload do JWT (decodificado
   de qualquer token `eyJ...` encontrado no arquivo), marcador de placeholder (`[PREENCHER...]`
   ou `SUA_CHAVE_WEB3FORMS`), URL apontando para `localhost`/`127.0.0.1`, ou `noindex` em
   qualquer página que não seja `leads.html`.
5. Copia o modelo de `.htaccess` (`publicacao/modelos/.htaccess`) para a raiz do pacote.
6. Gera `publicacao/MANIFESTO-PACOTE.txt` com todos os arquivos, tamanho e hash SHA-256 de
   cada um (fica fora do pacote, é só para conferência).
7. Tenta gerar `alfaprev-site-AAAA-MM-DD.zip` (via PowerShell `Compress-Archive` no Windows,
   ou `zip` se disponível). Se nenhuma ferramenta de compressão existir, avisa que a pasta
   `dist-locaweb/` sozinha já é suficiente para upload via FTP.

**`dist-locaweb/` nunca deve ser editada manualmente.** Qualquer mudança de conteúdo é feita
em `/src/pages/` ou `/partials/`, depois rodar `npm run empacotar` de novo.

### 1.5 Validação do pacote (executada nesta sessão)

Testada a mecânica completa do script com valores fictícios temporários (nunca comitados,
revertidos imediatamente após o teste — os placeholders reais em `assets/js/config.js` e
`script.js` seguem intactos):

- ✅ **Bloqueio funciona**: testado com uma chave JWT fictícia com `role: "service_role"` no
  payload — o script interrompeu a execução e reportou o arquivo + motivo corretamente.
- ✅ **Falso-positivo corrigido**: a primeira versão do check de `service_role` buscava a
  string literal "service_role", que aparece inocentemente em um comentário de documentação
  dentro do próprio `assets/js/config.js` ("NUNCA coloque a chave service_role aqui"). Corrigido
  para decodificar o payload de JWTs encontrados no arquivo e comparar a claim `role` — detecta
  a chave real sem disparar em texto de documentação.
- ✅ **Falso-positivo corrigido**: o check de `localhost` originalmente disparava na biblioteca
  vendorizada `assets/vendor/supabase-js/supabase.js`, que legitimamente contém a palavra
  `localhost` em sua própria lógica interna (valores padrão, detecção de ambiente). Corrigido
  para (a) só considerar `localhost`/`127.0.0.1` dentro de uma URL (`http://localhost...`), e
  (b) isentar arquivos em `assets/vendor/` desse check.
- ✅ **Remoção de comentários**: confirmado que 0 comentários HTML (`<!--`) restaram em nenhuma
  das 7 páginas do pacote de teste, e que os blocos `<script>` (8 por página, confirmado em
  `index.html`) permaneceram intactos.
- ✅ **JSON-LD válido**: confirmado programaticamente que todos os blocos `application/ld+json`
  em todas as 7 páginas continuam sendo JSON parseável após a remoção de comentários.
- ✅ **Links internos**: verificação automatizada de todo `href`/`src` começando com `/` em
  todas as páginas do pacote — **nenhum link quebrado encontrado**.
- ✅ **Case-sensitivity**: comparado cada caminho referenciado contra o nome real do arquivo
  no disco (sensível a maiúsculas/minúsculas, simulando Linux) — **nenhum mismatch encontrado**.
- ✅ **`sitemap.xml` consistente com o pacote**: todas as 6 URLs do sitemap (home + 5 páginas)
  correspondem a arquivos que existem no pacote gerado; nenhuma URL órfã.
- ✅ **`/leads` oculto confirmado no pacote**: `leads.html` não aparece em `sitemap.xml`, não é
  referenciado por nenhum `href` em nenhuma outra página do pacote, e mantém
  `<meta name="robots" content="noindex, nofollow, noarchive">`.
- ✅ **Canonical/OG/JSON-LD**: todos usam `https://alfaprev-sci.com.br` (sem www), consistente
  com a decisão de host canônico (§0.5).

**Estatísticas do pacote de teste** (valores reais; o pacote final terá peso ligeiramente
diferente dependendo das chaves reais, que têm tamanho parecido com as fictícias usadas no teste):
- 29 arquivos, 617,8 KB no total.
- 10 maiores arquivos: `assets/vendor/supabase-js/supabase.js` (212,8 KB — de longe o maior
  arquivo do pacote, usado só em `/leads`), `index.html` (47,3 KB), `assets/fonts/inter-var.woff2`
  (47,1 KB), `servicos.html` (46,5 KB), `contato.html` (41,4 KB), `quem-somos.html` (41,0 KB),
  `blog-sci/avcb-clcb.html` (38,4 KB), `blog-sci.html` (29,1 KB), `assets/images/logo-dark-bg.jpg`
  (25,0 KB), `script.js` (16,3 KB).

O pacote de teste foi completamente removido (`dist-locaweb/`, o `.zip` e o manifesto) ao final
da validação — nada do teste permanece no repositório. Para gerar o pacote real (depois que os
bloqueadores 1 e 2 forem resolvidos), rode `npm run empacotar`.

---

## PARTE 2 — Modelos de servidor

Criado `publicacao/modelos/.htaccess`, dividido em 3 blocos (comentários extensos no próprio
arquivo explicam cada regra):

- **Bloco 1 (ativo desde o primeiro upload)**: compressão de texto, cache de navegador
  (assets estáticos por 1 ano, HTML por 1 hora), headers de segurança básicos
  (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`), a
  CSP rígida de `leads.html` (via `<FilesMatch>`), bloqueio de arquivos ocultos e extensões
  não públicas (`.md`, `.sql`, `.log`, `.env`, `.bak`, `.zip`). Todos os blocos que dependem de
  um módulo Apache (`mod_deflate`, `mod_expires`, `mod_headers`) estão dentro de `<IfModule>`
  para não causar erro 500 se o módulo não existir no servidor.
- **Bloco 2 (deixado comentado)**: força HTTPS, força o host canônico sem `www`, remove
  `/index.html` explícito da URL. **Só ativar depois que o certificado SSL estiver emitido e
  testado** — ativar antes quebra o acesso ao site.
- **Bloco 3 (`/leads`)**: não existe uma subpasta `leads/` neste projeto — `leads.html` é um
  arquivo único na raiz, então o reforço de headers para ele já está dentro do Bloco 1
  (`<FilesMatch "^leads\.html$">`). Documentado explicitamente no arquivo que **nunca usar
  HTTP Basic Auth** nessa rota — abriria o diálogo de autenticação do navegador antes da tela
  de login real da aplicação, quebrando a UX do fundo desfocado.

**`web.config` (IIS/Windows)**: **não criado nesta sessão** porque o tipo de plano/SO da
Locaweb ainda não foi contratado/confirmado (ver Parte 3, passo 1). A pesquisa feita confirma
que a Locaweb permite escolher Linux ou Windows por site dentro da mesma conta — a confirmação
de qual SO foi escolhido é necessária antes de criar esse arquivo. **Ação futura:** se o plano
contratado for Windows, criar `publicacao/modelos/web.config` equivalente ao `.htaccess` antes
de publicar (sugestão de prompt: "Criar modelo web.config para Locaweb Windows equivalente ao
.htaccess existente").

`publicacao/modelos/leads.htaccess` (já existente, criado em sessão anterior) continua como
documento de referência isolado — não é copiado automaticamente ao pacote porque o reforço de
`/leads` já está embutido no `.htaccess` único da raiz.

---

## PARTE 3 — Passo a passo de publicação

### 0. Antes de começar
- [ ] Reveja a tabela de bloqueadores no topo deste documento.
- [ ] Confirme que o design atual foi aprovado — **neste momento (2026-10-07), o `git status`
  está limpo**: não há mudanças de design não commitadas. Se isso mudar antes da publicação,
  o pacote gerado por `npm run empacotar` vai refletir o que estiver no disco no momento —
  sempre rode `git status` de novo antes de empacotar para confirmar.
- [ ] Confirme que a Cassia validou o conteúdo técnico/legal pendente (bloqueadores 6-9).

### 1. Confirme o que foi contratado
- [ ] **Domínio**: `alfaprev-sci.com.br`, registrado via Locaweb, ativo até 08/09/2027 — confirmado.
- [ ] **Plano de hospedagem**: a contratar/confirmar no painel Locaweb. Segundo a documentação
  pública da Locaweb (consultada nesta sessão), hospedagem de sites oferece planos (ex:
  "Hospedagem Go", "Hospedagem 1", "Hospedagem 2") e você escolhe **Linux ou Windows por site**
  dentro da mesma conta — não é uma escolha única para a conta toda. **Confirmar no painel**:
  qual SO foi escolhido para este site (afeta qual modelo de servidor usar — `.htaccess` para
  Linux, que já está pronto, ou `web.config` para Windows, que ainda precisa ser criado).
  - Para um site estático simples como este, qualquer plano básico de hospedagem compartilhada
    atende (sem necessidade de banco de dados no servidor — o banco de leads é no Supabase,
    externo).
- [ ] **SSL incluso?** Segundo a documentação pública da Locaweb, certificado SSL gratuito
  (Let's Encrypt/ZeroSSL) é ativado automaticamente nos planos de hospedagem compartilhada e
  Cloud Hosting. **Confirmar no painel**: acessar "Hospedagem" → verificar status do SSL do
  domínio.
- [ ] **FTP/SFTP incluso?** Sim, em todos os planos de hospedagem de sites da Locaweb segundo a
  documentação consultada — acesso via painel em "Arquivos e FTP".

### 2. Aponte o domínio para a hospedagem (DNS)
- [ ] A zona DNS é gerenciada no mesmo painel Locaweb (seção DNS/Zona DNS, **confirmar no painel**
  o caminho exato do menu).
- [ ] **O que mudar**: se o domínio ainda não está apontado para a hospedagem (a consulta DNS
  feita nesta sessão não encontrou registro A para `alfaprev-sci.com.br`), será necessário criar/
  ajustar o registro A (ou usar a opção "ativar hospedagem neste domínio" se o painel tiver essa
  automação — **confirmar no painel**).
- [ ] **O que NÃO tocar**: os registros **MX** (já existem e apontam para o e-mail Locaweb —
  alterá-los pode quebrar o recebimento de e-mail) e o registro **TXT de SPF** existente
  (`v=spf1 include:_spf.locaweb.com.br -all` — removê-lo pode fazer e-mails enviados pelo
  domínio caírem em spam).
- [ ] **Tempo de propagação**: minutos a 24-48h (padrão de DNS). Verificar com `nslookup
  alfaprev-sci.com.br` (Windows) ou qualquer ferramenta de lookup DNS online, até o endereço IP
  retornado corresponder ao servidor da Locaweb.

### 3. Confirme o e-mail de contato
- [ ] **Bloqueador nº 10 acima**: `contato@alfasci.com.br` é o e-mail exibido no site, mas o
  domínio do e-mail (`alfasci.com.br`) é diferente do domínio do site (`alfaprev-sci.com.br`).
  A consulta DNS confirma que ambos os domínios estão configurados na infraestrutura de e-mail
  da Locaweb (mesmos servidores MX), mas **não prova que a caixa existe**.
- [ ] **Ação**: entrar no painel Locaweb → seção de e-mails do domínio `alfasci.com.br` →
  confirmar que a caixa `contato@alfasci.com.br` existe e está ativa (ou criá-la, se ainda não
  existir).
- [ ] **Testar**: enviar um e-mail de teste para `contato@alfasci.com.br` de uma conta externa
  (Gmail, por exemplo) e confirmar que chega. Depois, responder e confirmar que o envio funciona
  também no sentido inverso.

### 4. Credenciais de upload (FTP/SFTP)
- [ ] No painel Locaweb, seção **"Arquivos e FTP"** (segundo a documentação consultada) —
  mostra os dados de conexão (host, usuário, senha) e permite acesso via Web FTP, SSH, ou
  cliente como FileZilla.
- [ ] **Pasta raiz pública**: segundo a documentação da Locaweb, em hospedagem **Linux** a pasta
  raiz do domínio principal é `public_html`; em hospedagem **Windows** é `Web`. **Confirmar no
  painel** qual das duas se aplica, conforme o SO escolhido no passo 1.
- [ ] **Cliente recomendado**: FileZilla (gratuito, multiplataforma) — a própria Locaweb tem
  tutorial de uso publicado.
- [ ] **Mostrar arquivos ocultos**: no FileZilla, menu "Servidor" → "Forçar mostrar arquivos
  ocultos" (necessário para ver/confirmar o `.htaccess` depois do upload, já que arquivos
  começando com `.` costumam ficar escondidos por padrão).

### 5. Suba o pacote
- [ ] Gere o pacote com `npm run empacotar` (depois que os bloqueadores 1 e 2 forem resolvidos
  — o script falha de propósito enquanto esses placeholders existirem).
- [ ] Suba o **conteúdo** da pasta `dist-locaweb/` (todos os arquivos e subpastas dentro dela),
  não a pasta `dist-locaweb` em si, para a raiz pública (`public_html` ou `Web`, conforme passo 4).
- [ ] **Apague páginas padrão da hospedagem** que possam ter prioridade sobre `index.html` (ex:
  página "em construção", `index.php` de boas-vindas) — **confirmar no painel** se a conta já
  vem com algum arquivo desses.
- [ ] **Permissões padrão**: arquivos `644`, pastas `755` (ajustar via cliente FTP se necessário
  — a maioria dos clientes já aplica esses valores por padrão ao enviar).
- [ ] **Confira a contagem**: compare o número de arquivos enviados com o total listado em
  `publicacao/MANIFESTO-PACOTE.txt` (gerado junto com o pacote).

### 6. Ative o SSL (HTTPS)
- [ ] Segundo a documentação consultada, o SSL gratuito da Locaweb costuma ser ativado
  automaticamente — **confirmar no painel** (seção "Hospedagem" → status do SSL do domínio).
  Se não estiver ativo, há um botão "Ativar SSL" no painel (**confirmar no painel** o texto
  exato do botão).
- [ ] Aguarde a emissão do certificado (pode levar alguns minutos a algumas horas).
- [ ] **Só depois** que o HTTPS estiver funcionando e testado (abrir `https://alfaprev-sci.com.br`
  no navegador sem erro de certificado), descomente o **Bloco 2** do `.htaccess`
  (`publicacao/modelos/.htaccess`) e reenvie esse arquivo. Ativar esse bloco antes do certificado
  pronto causa erro de redirecionamento/certificado para todos os visitantes.
- [ ] A documentação da Locaweb também menciona uma opção **"Force HTTPS Redirect"** no painel
  de domínios — se essa opção existir e for ativada, o Bloco 2 do `.htaccess` fica redundante
  (mas não prejudicial, pode manter os dois).

### 7. Checklist de teste pós-publicação
- [ ] Todas as páginas abrem via **HTTPS** sem aviso de certificado.
- [ ] As quatro variantes de URL (`http`/`https` × com/sem `www`) terminam na versão canônica
  (`https://alfaprev-sci.com.br`, sem `www`) — isso só funciona depois que o Bloco 2 do
  `.htaccess` (passo 6) estiver ativo.
- [ ] `https://alfaprev-sci.com.br/robots.txt` e `/sitemap.xml` abrem corretamente.
- [ ] Uma URL inexistente (ex: `/pagina-que-nao-existe`) retorna 404 (comportamento padrão do
  Apache sem página customizada, já que `404.html` não existe no pacote — ver Parte 2).
- [ ] **Formulário de contato**: enviar um teste real e confirmar (a) chegada do e-mail em
  `contato@alfasci.com.br` e (b) gravação do lead no painel `/leads` — **depende dos
  bloqueadores 1-5 estarem resolvidos**.
- [ ] **Botão/link do WhatsApp**: abre com a mensagem padrão "Olá equipe Alfa Prev, gostaria de
  saber mais sobre os serviços oferecidos por vocês falando com um especialista."
- [ ] **Banner de cookies**: aparece exatamente uma vez (testar em aba anônima/nova, já que usa
  `localStorage`).
- [ ] Checar visualmente em um celular real (não só emulador do navegador).
- [ ] **Métricas/leads**: visitar uma página pública conta como `page_view` no dashboard de
  `/leads`; um clique no botão WhatsApp conta como `whatsapp_click`; um envio de teste do
  formulário aparece na grade de leads (**apagar o lead de teste depois**).
- [ ] **`/leads`**: o diálogo de login abre com fundo desfocado; login funciona com a conta
  admin criada (bloqueador 5); 3 erros consecutivos de senha bloqueiam por 5 minutos; acessar
  sem estar logado (outro navegador/pessoa) não mostra nenhum dado; a página **não aparece em
  buscas** (`site:alfaprev-sci.com.br/leads.html` no Google só é confiável depois de alguns dias;
  a verificação correta e imediata é pela ferramenta "Inspeção de URL" do Search Console, que
  deve mostrar `noindex` detectado).

### 8. Serviços externos a reconfigurar para o domínio final
- [ ] **Web3Forms**: criar nova chave de acesso registrada com `contato@alfasci.com.br` (ver
  bloqueador 1) e, se o painel do Web3Forms tiver uma lista de domínios permitidos, adicionar
  `alfaprev-sci.com.br`.
- [ ] Qualquer outra chave/domínio permitido de serviço de terceiro usado pelo site (no momento,
  só Web3Forms e Supabase se aplicam).

### 8-A. Supabase em produção (só Artur — baseado em `docs/DASHBOARD-LEADS.md`)
- [ ] Exportar backup CSV dos leads existentes antes de qualquer mudança (se já houver leads de
  teste em algum projeto Supabase anterior).
- [ ] Rodar `supabase-schema.sql` no SQL Editor do painel Supabase.
- [ ] Rodar `supabase-admin.sql` preenchendo o e-mail do admin real (nunca commitar esse e-mail
  no `supabase-admin.sql` do repositório — ele é só um template).
- [ ] Criar o usuário admin (e-mail + senha longa e única, guardada em gerenciador de senhas).
- [ ] **Desativar cadastro público de usuários** no Supabase Auth e qualquer provedor de login
  não usado; configurar a Site URL para o domínio final; checar expiração de token e política
  mínima de senha; avaliar 2FA/CAPTCHA se disponível no plano.
- [ ] Rodar `scripts/testar-supabase-rls.js` contra o projeto real e **só publicar se todos os
  testes passarem**.
- [ ] Confirmar que `assets/js/config.js` só tem a chave **anon** (nunca `service_role`).
- [ ] Registrar pendências de região dos dados e política de retenção conforme LGPD (ver
  `docs/DASHBOARD-LEADS.md`, seção LGPD).
- [ ] Checar nos termos atuais do plano gratuito do Supabase: pausa automática do projeto por
  inatividade, limite de tamanho do banco, se há ou não backup automático — e manter uma rotina
  semanal de exportação CSV dos leads como backup próprio.

### 9. Depois de publicar — mecanismos de busca
- [ ] **Google Search Console**: criar uma propriedade do tipo domínio, verificar via registro
  TXT na zona DNS (confirmado pela documentação pública: criar entrada TXT na zona DNS do
  Locaweb com o código fornecido pelo Search Console, aguardar propagação — até 24h — e clicar
  em "Verificar"). Depois, enviar `sitemap.xml` e solicitar indexação da Home e páginas principais.
- [ ] **Bing Webmaster Tools**: pode importar diretamente do Search Console (opção padrão da
  ferramenta).
- [ ] **Google Business Profile**: criar/verificar o perfil. Dados que precisam ser **idênticos**
  aos do site: nome (Alfa Prev), telefone ((11) 98932-5513). **Decisão sobre endereço**: o site
  não exibe endereço físico em nenhum lugar (atendimento é no local do cliente, confirmado em
  `CLAUDE.md`) — ao criar o perfil, avaliar se o Business Profile permite esconder o endereço e
  mostrar apenas a área de atendimento (todo o Estado de SP), mantendo consistência com a decisão
  já tomada para o site.
- [ ] **Medição de visitas/conversão**: feita pelo próprio dashboard de `/leads` (métricas
  anônimas, sem cookies, no Supabase) — **sem Google Analytics**. Search Console e Bing mostram
  apenas desempenho de busca (impressões/cliques), não comportamento dentro do site. Nenhum
  rastreador de terceiros será adicionado. Se o Google Ads for usado no futuro, a medição de
  conversão precisa ser avaliada separadamente (ver `AUDITORIA-SEO.md`, seção 4.10).

### 10. Rotina de atualização
- [ ] Fluxo: editar fonte (`/src/pages/` ou `/partials/`) → `npm run empacotar` → subir **apenas
  os arquivos que mudaram** (comparando com o manifesto anterior) → testar no site publicado.
- [ ] Depois de cada publicação, criar uma tag git `publicado-AAAA-MM-DD` e guardar o `.zip`
  daquela versão como backup.

### 11. Problemas comuns e como resolver
| Problema | Causa provável | Solução |
|---|---|---|
| Página "em construção" da hospedagem aparece em vez do site | Arquivo padrão da Locaweb ainda na raiz | Apagar o arquivo padrão (confirmar nome exato no painel) |
| Erro 500 ao abrir qualquer página | Bloco do `.htaccess` usando um módulo Apache ausente no servidor | Verificar se todos os blocos problemáticos estão dentro de `<IfModule>` (já estão no modelo fornecido) — se persistir, comentar blocos um a um para isolar o culpado |
| Erro 403/404 inesperado | Permissão de arquivo errada, ou arquivo não enviado | Confirmar permissões 644/755 e comparar contagem de arquivos com o manifesto |
| CSS/imagem não carrega | Mismatch de maiúsculas/minúsculas (Linux diferencia, ambiente de desenvolvimento não) | Já validado nesta sessão (§1.5) — se acontecer mesmo assim, comparar o nome exato do arquivo no FTP com a referência no HTML |
| "Conteúdo não seguro" no navegador (mixed content) | Algum recurso carregado via `http://` em vez de `https://` | Buscar por `http://` (sem s) em todos os arquivos do pacote |
| Domínio não abre ainda | DNS não propagou | Aguardar até 24-48h, verificar com `nslookup` |
| Site abre sem `www` mas não com `www` (ou vice-versa) | Bloco 2 do `.htaccess` ainda não ativado, ou registro DNS do `www` ausente | Confirmar registro DNS para `www` (CNAME ou A) e ativar o Bloco 2 só depois do SSL (passo 6) |

### 12. O que só Artur pode fazer (contas/acessos que Claude Code não tem)
- Painel da Locaweb (contratação de plano, FTP, DNS, SSL, e-mail).
- Caixa de e-mail `contato@alfasci.com.br` (confirmação de existência e teste de envio/recebimento).
- Painel do Supabase (produção): rodar SQL, criar admin, configurar Auth, rodar o script de teste de RLS.
- Painel do Web3Forms (criar chave nova).
- Google Search Console, Bing Webmaster Tools, Google Business Profile.

### Nota sobre URLs temporárias/subpasta
O site usa caminhos absolutos a partir da raiz (`/assets/...`, `/leads.html`, etc.), então
**não funciona** se servido a partir de uma subpasta (ex: `servidor.com/~usuario/`) — todos os
links quebrariam, pois o navegador buscaria `/assets/...` na raiz do domínio, não dentro da
subpasta. O teste completo só deve ser feito depois que o domínio estiver apontado para a
hospedagem (passo 2), ou usando uma URL temporária que sirva os arquivos a partir da raiz, se
o plano contratado oferecer isso (**confirmar no painel**).
