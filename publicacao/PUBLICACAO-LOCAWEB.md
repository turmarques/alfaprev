# Publicação na Locaweb — Guia Passo a Passo

> Documento de **levantamento, empacotamento e instruções**. Não altera nenhum conteúdo ou
> design do site. Escrito para quem **nunca publicou um site em hospedagem compartilhada**.
> Sempre que um passo depender do painel real da Locaweb (nomes de menus/botões podem mudar),
> está marcado como **"confirmar no painel"** em vez de afirmado de memória.
>
> Gerado em: 2026-10-07. Build confirmado sem erros (`npm run build`, 7 páginas geradas,
> `faq.html` ignorado de propósito — ver `CLAUDE.md`, seção "FAQ oculto").
>
> **Revisado em 2026-10-14 (1ª revisão):** conferido o documento inteiro contra o estado
> atual do repositório (`api/*.php`, `database/schema.mysql.sql`, `docs/DASHBOARD-LEADS.md`,
> `scripts/empacotar-locaweb.js`) — nenhuma inconsistência encontrada; o conteúdo já
> refletia corretamente a arquitetura MySQL/PHP (migração de out/2026). Única mudança
> desta revisão: a seção **8-A** foi expandida com o passo a passo detalhado de como
> criar o banco MySQL no painel da Locaweb e rodar `database/schema.mysql.sql` via
> phpMyAdmin (antes era um resumo de poucas linhas).
>
> **Revisado em 2026-10-14 (2ª revisão, mesmo dia):** nova conferência completa, já com o
> banco MySQL criado e o schema executado em produção (5 tabelas vazias, confirmado pelo
> Artur). Mudanças desta revisão: seção "Ordem recomendada" adicionada (ver abaixo);
> tabela de Bloqueadores atualizada para refletir o que já foi resolvido; `tools/
> gerar-hash-admin.php` reescrito com 3 modos (criar admin / trocar senha / zerar 2FA),
> todos imprimindo apenas o comando SQL para colar no phpMyAdmin — 8-A.5 e 8-A.6 revisados
> para usar o novo script; §8-A.1 detalhado com os padrões reais já observados (sem prefixo
> no nome do banco, host dedicado, nunca `localhost`); DNS (passo 2) agora cobre também o
> registro `www`; checklist de teste (§7) e tabela de problemas comuns (§11) ampliadas;
> nova nota de segurança antes do passo de DNS (§2) sobre validar pendências de conteúdo
> com a Cassia antes de tornar o site público; contradição entre "sem endereço físico no
> site" (`CLAUDE.md`) e as meta tags `geo.*` de Guarulhos registrada como decisão pendente
> (não corrigida aqui — ver nota no passo 9, Google Business Profile).
>
> **Revisado em 2026-10-18 (3ª revisão):** conteúdo técnico/legal validado pela Cassia (sem
> pendências restantes); bloqueador 1 (Web3Forms) corrigido de fato — a causa real era a
> string `SUA_CHAVE_WEB3FORMS` dentro do comentário de `script.js:245` (não um comentário
> `// PREENCHER`, como esta revisão supunha antes) — `npm run build`, `npm run seguranca`,
> `npm test` e `npm run empacotar` executados com sucesso, pacote real gerado (47 arquivos,
> 459,7 KB); "Ordem recomendada" reescrita para a sequência de publicação (commit → pacote →
> credenciais de FTP → conexão → remoção da página padrão → upload do conteúdo de
> `dist-locaweb/` → upload do `config.local.php` → criação do admin → testes); DNS (§0.4)
> atualizado — `alfasci.com.br` já resolve para `179.188.54.226`, falta só confirmar no painel
> que esse é o IP da hospedagem; domínio, Linux/PHP 8.5, SSL, MySQL, e-mail e Web3Forms já
> confirmados funcionando — só faltam upload, criação do admin do `/leads` e os testes finais.

---

## Ordem recomendada (visão geral antes de seguir os passos numerados)

Este documento numera os passos na ordem em que a Locaweb normalmente apresenta as opções
no painel (domínio → DNS → e-mail → FTP → upload → SSL → banco de dados), o que faz a seção
do banco MySQL (**8-A**) aparecer depois dos testes pós-publicação (**7**) no índice.

**Atualizado em 2026-10-18:** DNS e SSL **já estão resolvidos** (domínio `alfasci.com.br` já
vinculado à hospedagem, Linux com PHP 8.5 confirmado, certificado SSL Let's Encrypt já ativo —
ver `publicacao/RELATORIO-ESTADO-PUBLICACAO.md`). O que falta é só a publicação do conteúdo em
si. A ordem de execução recomendada a partir de agora é:

1. **Commit** — garantir que todo o trabalho local (incluindo as correções desta sessão) está
   commitado no Git antes de gerar o pacote. Publicar a partir de um estado não commitado
   dificulta reverter caso algo dê errado depois do upload.
2. **Pacote** (`npm run build && npm run seguranca && npm test && npm run empacotar`, passo 5) —
   gera `dist-locaweb/` com só os arquivos que devem ir para o servidor.
3. **Credenciais de FTP** (passo 4) — obter host, usuário e senha no painel Locaweb
   ("Arquivos e FTP").
4. **Conexão** (passo 4) — conectar com um cliente (FileZilla recomendado), localizar a pasta
   pública (`public_html`) e ativar "mostrar arquivos ocultos" (necessário para ver o
   `.htaccess` depois do upload).
5. **Remoção da página padrão** (passo 5) — apagar qualquer `index.html`/`index.php` de
   boas-vindas que a Locaweb já tenha colocado na pasta pública, antes de enviar o site real.
6. **Envio do conteúdo de `dist-locaweb/`** (passo 5) — subir todos os arquivos e subpastas de
   dentro de `dist-locaweb/` (não a pasta em si) para a raiz pública.
7. **Envio do `api/config.local.php` à parte** (passo 8-A.4) — esse arquivo nunca entra no
   pacote (é secreto, fica fora do Git); enviar separadamente para dentro da pasta `api/` já
   publicada no passo anterior.
8. **Criação do admin** (passos 8-A.5 e 8-A.6) — rodar `tools/gerar-hash-admin.php`, colar o
   `INSERT` gerado no phpMyAdmin, depois fazer o primeiro login em produção para cadastrar o
   2FA (esse cadastro só é possível com o site já publicado).
9. **Testes** (passo 7) — checklist completo pós-publicação, incluindo envio de um lead de
   teste e conferência no `/leads`.

Os números de seção abaixo não foram alterados para não quebrar referências cruzadas já
existentes neste documento — use esta lista apenas como guia de ordem, não como substituta
da numeração.

## Bloqueadores (ler antes de tudo)

Lista completa e atualizada de tudo que impede a publicação agora. Itens marcados
**"só Artur pode confirmar"** dependem de acesso a sistemas fora deste ambiente
(painel Locaweb, caixa de e-mail, banco MySQL real).

> **Atualizado out/2026 — migração de Supabase para MySQL/PHP:** o banco de leads deixou de
> ser externo (Supabase/Postgres) e passou a ser o próprio MySQL da hospedagem Locaweb, acessado
> via API PHP própria em `api/*.php` (ver `docs/DASHBOARD-LEADS.md`). Isso muda a Parte 2 (o
> servidor agora precisa de PHP + MySQL, não só Apache estático) e o bloqueador 2-5 abaixo.

| # | Bloqueador | Onde | Status (2026-10-14) | Só Artur? |
|---|---|---|---|---|
| 1 | Chave Web3Forms | `script.js:282` | **Resolvido em 2026-10-18.** O valor de `ACCESS_KEY` já não é mais o placeholder `SUA_CHAVE_WEB3FORMS` — já é uma chave com formato real. A causa real do bloqueio de `npm run empacotar` **não era** um comentário `// PREENCHER` (como relatos anteriores supunham) e sim a string literal `SUA_CHAVE_WEB3FORMS` dentro do texto explicativo do comentário na linha 245 (o regex `PADRAO_PREENCHER` em `scripts/empacotar-locaweb.js:111` procura essa string em qualquer lugar do arquivo, incluindo comentários). Corrigido reescrevendo apenas o texto do comentário, sem alterar a chave real (linha 282) nem a lógica de envio — confirmado rodando `npm run empacotar` com sucesso (47 arquivos, 459,7 KB). Segundo o contexto confirmado nesta sessão, o Web3Forms já está funcionando com `contato@alfasci.com.br`. | Não |
| 2 | `api/config.local.php` (credenciais reais do MySQL) | `api/config.local.php` (gitignored, nunca entra no pacote — não é bloqueador de empacotamento) | O arquivo já existe no ambiente local. Antes de subir para o servidor, confirmar que todos os campos (`host`, `port`, `dbname`, `user`, `password`, `sal_fixo`) foram preenchidos com os dados reais do banco já criado na Locaweb (8-A.1), não com os valores de exemplo do template. | Sim |
| 3 | `database/schema.mysql.sql` executado em produção | phpMyAdmin da Locaweb | **Resolvido** — relatado pelo Artur: banco `alfasci` criado, schema executado, 5 tabelas vazias confirmadas. Falta apenas confirmar a existência da procedure `limpar_dados_antigos` (ver 8-A.3) e o collation default do banco (`latin1` no banco em si não afeta as tabelas, que já têm `utf8mb4_unicode_ci` explícito). | Sim, já feito — só falta a conferência final |
| 4 | Confirmação de versão de PHP/MySQL e extensões (`pdo_mysql`) do plano contratado | N/A — depende do painel Locaweb | **Parcialmente resolvido** — Linux com PHP 8.5 já confirmado. Falta só confirmar no painel que a extensão `pdo_mysql` está habilitada (seção de configuração de PHP da hospedagem). Teste prático mais confiável que olhar o painel: depois do upload, enviar um lead de teste pelo formulário de contato e confirmar que ele aparece na grade do `/leads` — isso prova a cadeia completa (PHP → PDO → MySQL) funcionando, não só a presença da extensão. | Sim |
| 5 | Admin do `/leads` ainda não criado na tabela `admins`; 2FA ainda não cadastrado | `tools/gerar-hash-admin.php` (reescrito nesta revisão) + `docs/DASHBOARD-LEADS.md` §4 | Pendente — pode ser feito **antes** do DNS apontar (ver "Ordem recomendada") | Sim |
| 6 | Parágrafo sobre coleta de dados/estatísticas em `contato.html`, antes marcado `<!-- REVISAR COM CASSIA -->` | `contato.html` (fonte: `src/pages/contato.html`) | **Resolvido** — conteúdo validado pela Cassia em out/2026; marcação removida do código | Não |
| 7 | 6 blocos de texto sobre cookies/rastreamento, antes marcados `<!-- REVISAR COM CASSIA -->` | `index.html`, `servicos.html`, `quem-somos.html`, `contato.html`, `blog-sci.html`, `blog-sci/avcb-clcb.html` | **Resolvido** — conteúdo validado pela Cassia em out/2026; marcações removidas do código | Não |
| 8 | Faixa de validade do AVCB ("entre 1 e 3 anos") | `CLAUDE.md` | **Resolvido** — confirmado pela Cassia em out/2026 | Não |
| 9 | Citações legais/normativas (ITs, NBR 12962) | `CLAUDE.md` | **Resolvido** — validado pela Cassia em out/2026 | Não |
| 10 | Caixa `contato@alfasci.com.br` | painel Locaweb → E-mails | **Parcialmente resolvido** — relatado pelo Artur: todas as caixas do domínio já foram criadas, incluindo `contato@alfasci.com.br`. **Envio/recebimento real ainda não testado.** | Sim — testar envio/recebimento (ver passo 3) |
| 11 | Decisão sobre endereço físico (Guarulhos) nas meta tags `geo.*` vs. regra "sem endereço no site" do `CLAUDE.md` | `partials/head-common.html`, `index.html`, `contato.html` — ver nota no passo 9 (Google Business Profile) abaixo | **Contradição encontrada nesta revisão, não corrigida** — decisão de conteúdo, não técnica | Precisa decisão do Artur + Cassia |

**Não encontrados** (checados e ausentes, portanto NÃO bloqueiam):
- Nenhum `[PREENCHER]` ou `TODO`/`FIXME`/`lorem ipsum` em texto visível de página publicada (o único resultado de busca por "preencher" textual foi o rótulo de exemplo `joao@empresa.com` em um `placeholder` de formulário, que é comportamento esperado de um campo de e-mail, não um dado real preenchido incorretamente).
- Nenhum `noindex` fora de `leads.html` (onde é **intencional**).
- Nenhum `Disallow: /` em `robots.txt` — está `Allow: /`, correto.
- Nenhuma URL `localhost`/`127.0.0.1` em página pública (a única ocorrência de "localhost" como palavra solta está em `assets/js/metricas.js`, numa lista de hosts de desenvolvimento usada para **desativar** métricas localmente — não é um link apontando para lá).
- Nenhum e-mail pessoal da Cassia encontrado em código publicado — só `contato@alfasci.com.br`.
- Nenhum link de rede social quebrado/placeholder — Instagram, Facebook e LinkedIn apontam para perfis reais já confirmados em `CLAUDE.md`.
- Nenhuma credencial real do MySQL encontrada em nenhum arquivo publicável — `api/config.local.php` é gitignored e nunca faz parte da lista de arquivos a publicar; `api/config.example.php` mantém os placeholders `SUBSTITUIR_*` (checado por `npm run seguranca`).
- `leads.html` está corretamente fora de `sitemap.xml`, `robots.txt` e de qualquer link interno (header/footer/qualquer página) — ver seção "Páginas Publicadas" abaixo.
- Nenhum resíduo de link/sitemap/JSON-LD para `faq.html`, artigo "Lei Kiss" ou "vencimento sem renovação" (todos removidos do site em out/2026 — os únicos resquícios são links `/faq.html` **comentados** em HTML, que são removidos automaticamente do pacote publicado, ver §1.3).

### 0.4 — Domínio do site e do e-mail (DNS, somente leitura)

**(Atualizado out/2026)** Por decisão do cliente, `alfasci.com.br` passou a ser o domínio
final e único do site (o mesmo já usado para o e-mail `contato@alfasci.com.br`). O domínio
`alfaprev-sci.com.br` (registrado na Locaweb em set/2026, ativo até 08/09/2027) foi
abandonado: não é mais referenciado em nenhum arquivo do código e não há redirecionamento
dele para `alfasci.com.br` configurado ou planejado. Consulta DNS pública (`nslookup`,
somente leitura, sem alterar nada) feita em 2026-10-07 para `alfasci.com.br`:

- NS: `ns1.locaweb.com.br`, `ns2.locaweb.com.br`, `ns3.locaweb.com.br`
- MX: `mx.core.locaweb.com.br` (pref. 10), `mx.b.locaweb.com.br` (pref. 10), `mx.a.locaweb.com.br` (pref. 20), `mx.jk.locaweb.com.br` (pref. 20)
- TXT (SPF): `v=spf1 include:_spf.locaweb.com.br -all`
- A: sem resposta de endereço IPv4 no momento da consulta (domínio ainda sem hospedagem apontada — esperado, já que o site ainda não foi publicado)

**Atualizado em 2026-10-18:** nova consulta DNS mostra que `alfasci.com.br` agora resolve
para o endereço IPv4 `179.188.54.226`, e o registro `www` já existe como `CNAME` apontando
para o domínio principal. **Falta eu (Artur) confirmar no painel Locaweb que `179.188.54.226`
é de fato o IP da hospedagem contratada** (e não, por exemplo, o IP de um serviço de e-mail ou
de outro produto Locaweb) antes de considerar o DNS definitivamente correto.

**O que isso prova e o que NÃO prova:** o domínio tem nameservers e MX apontando para a
infraestrutura de e-mail da Locaweb, consistente com estar configurado na mesma conta
Locaweb que será usada para a hospedagem, e agora também tem um registro A resolvendo para
um IP. **Isso não comprova que a caixa `contato@alfasci.com.br` existe e está ativa** — DNS/MX
só mostra para onde o e-mail *seria roteado*, não se a caixa foi criada no painel. Segundo o
contexto confirmado nesta sessão, a caixa já existe e o Web3Forms já está funcionando — ainda
assim, testar envio/recebimento real antes de publicar é uma boa prática (ver passo 3 abaixo).

### 0.5 — Host canônico (www vs. sem-www)

**Verificado no código**: todas as páginas usam consistentemente `https://alfasci.com.br`
(sem `www`) em `<link rel="canonical">`, `<meta property="og:url">`, todo campo `"url"` de
JSON-LD, e em `sitemap.xml`. **Nenhuma inconsistência encontrada** — não há nenhum arquivo
usando `www.alfasci.com.br`. Decisão adotada por este documento: **manter sem `www`**
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
| `assets/js/metricas.js` | Métricas anônimas (fala só com `api/metrica.php`, same-origin) |
| `assets/css/leads.css`, `assets/js/leads/*.js` (7 arquivos) | CSS/JS exclusivos do `/leads` |
| `api/*.php`, `api/lib/*.php` (ver lista completa em `scripts/empacotar-locaweb.js` → `ARQUIVOS_API`) | API PHP (vanilla, sem Composer) que substitui o Supabase — nunca inclui `api/config.local.php` |
| `assets/fonts/inter-var.woff2` | Fonte self-hosted do `/leads` |
| `assets/favicon.ico`, `assets/favicon.svg` | Favicon (referenciado via `/assets/favicon.*`) |
| `assets/logo/logo-white.svg`, `assets/logo/logo-icon-dark.svg` | Únicos logos efetivamente referenciados no HTML |
| `assets/images/logo-dark-bg.jpg` | Usado como `og:image` em todas as páginas |
| `.htaccess` (de `publicacao/modelos/.htaccess`) | Headers de segurança + cache (ver Parte 2) |

**Nota sobre `/leads`:** é publicado (precisa estar acessível em produção), mas é
**intencionalmente oculto**: `noindex, nofollow, noarchive` na própria página, ausente de
`sitemap.xml` e `robots.txt`, e sem nenhum link de qualquer página pública até ele. A
proteção real contra acesso não autorizado é a sessão PHP + verificação de admin no MySQL
(2FA/TOTP obrigatório — ver `docs/DASHBOARD-LEADS.md`), não a obscuridade da URL — mas a
obscuridade reduz a chance de ser encontrado por acaso ou por crawler.

**Não publicar** (fica fora de `dist-locaweb/`):

| Item | Por quê |
|---|---|
| `src/`, `partials/` | Arquivos-fonte do build, não o site final |
| `build.js`, `generate-content-md.js`, `package.json`, `package-lock.json` | Ferramentas de build, não fazem parte do site |
| `node_modules/` | Dependências de desenvolvimento |
| `.git/`, `.gitignore`, `.idea/`, `.claude/` | Controle de versão e config de IDE |
| `CLAUDE.md`, `CONTEUDO-PAGINAS.md` | Documentação interna do projeto |
| `AUDITORIA-*.md`, `AVALIACAO-*.md` | Relatórios/guias internos |
| `publicacao/` (este diretório) | Documentação e modelos desta tarefa |
| `docs/` | Documentação técnica interna (`DASHBOARD-LEADS.md`) |
| `scripts/` | Scripts internos (empacotamento, verificação de segurança) |
| `database/schema.mysql.sql`, `tools/gerar-hash-admin.php` | SQL/utilitário de infraestrutura — nunca devem estar acessíveis via HTTP; rodados manualmente pelo Artur (ver `docs/DASHBOARD-LEADS.md` §4) |
| `api/config.local.php` | Credenciais reais do MySQL — gitignored, nunca commitado, criado manualmente no servidor a partir de `api/config.example.php` |
| `.env*` | Nenhum encontrado no repositório — mas nunca deveria ser publicado se existisse |
| `test/` | Testes automatizados |
| Imagens/logos não referenciados: `logo-original.png`, `logo-color.svg`, `logo-icon-white.svg`, `logo-light-bg.jpg`, `logo-dark-helmet.jpg`, `logo-white-helmet.jpg` | Confirmado via busca por referência no HTML — nenhuma página os usa |
| `favicon.ico`/`favicon.svg` da **raiz** (fora de `assets/`) | Duplicados — o HTML só referencia `/assets/favicon.*` |
| `assets/icons/` | Pasta vazia no momento da auditoria |

### 1.2 Scan de segredos e resíduos

Varredura feita em todos os arquivos da lista "Publicar" acima, antes do empacotamento:

- **Credenciais reais do MySQL**: nenhuma encontrada em arquivo publicável — `api/config.local.php`
  nunca está na lista de arquivos a publicar, e `api/config.example.php` mantém os placeholders
  `SUBSTITUIR_*` (checado automaticamente por `scripts/empacotar-locaweb.js` e por
  `npm run seguranca`).
- **`secret`/`password`/`private key`/tokens**: a única ocorrência de "password" fora de `api/`
  é o atributo HTML `type="password"` do campo de login em `leads.html` (comportamento normal de
  formulário, não um segredo exposto). Nenhuma chave ou token hardcoded encontrado.
- **E-mails não oficiais**: nenhum encontrado — todas as ocorrências de e-mail nas páginas
  publicadas são `contato@alfasci.com.br` (e o placeholder de exemplo `joao@empresa.com` no
  atributo `placeholder` do campo de formulário, que nunca é enviado, é só texto de exemplo
  visível antes do usuário digitar).
- **E-mail/senha do admin do `/leads`**: não aparece em nenhum arquivo publicado (login é feito
  via formulário vazio — usuário digita as credenciais, nada fica hardcoded no HTML/JS; o hash
  da senha fica só na tabela `admins` do MySQL, nunca em arquivo).
- **`/leads` sem modo demo**: confirmado em `assets/js/leads/auth.js` — não há atalho de acesso
  sem autenticação nem dados de demonstração embutidos.
- **Nenhuma página pública carrega script de terceiros**: as 6 páginas públicas carregam apenas
  `metricas.js` (que fala só com `api/metrica.php`, same-origin, sem SDK de terceiro). `leads.html`
  carrega só os módulos próprios em `assets/js/leads/*.js` — zero dependências vendorizadas desde
  a remoção de `@supabase/supabase-js`.

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
   o arquivo e o motivo: credencial real do MySQL em `api/config.example.php` (sem o placeholder
   `SUBSTITUIR_*`), marcador de placeholder (`[PREENCHER...]` ou `SUA_CHAVE_WEB3FORMS`), URL
   apontando para `localhost`/`127.0.0.1`, ou `noindex` em qualquer página que não seja
   `leads.html`.
5. Copia o modelo de `.htaccess` (`publicacao/modelos/.htaccess`) para a raiz do pacote.
6. Gera `publicacao/MANIFESTO-PACOTE.txt` com todos os arquivos, tamanho e hash SHA-256 de
   cada um (fica fora do pacote, é só para conferência).
7. Tenta gerar `alfaprev-site-AAAA-MM-DD.zip` (via PowerShell `Compress-Archive` no Windows,
   ou `zip` se disponível). Se nenhuma ferramenta de compressão existir, avisa que a pasta
   `dist-locaweb/` sozinha já é suficiente para upload via FTP.

**`dist-locaweb/` nunca deve ser editada manualmente.** Qualquer mudança de conteúdo é feita
em `/src/pages/` ou `/partials/`, depois rodar `npm run empacotar` de novo.

### 1.5 Validação do pacote (executada em 2026-10-07, anterior à migração de Supabase para MySQL/PHP)

> **Nota (out/2026):** esta validação foi feita contra a versão do pacote que ainda incluía
> `assets/js/config.js` e `assets/vendor/supabase-js/`. O bloqueador de `service_role`
> (JWT do Supabase) descrito abaixo foi removido de `scripts/empacotar-locaweb.js` e substituído
> por um check de credencial real do MySQL em `api/config.example.php` (ver §1.2/§1.4 acima).
> As estatísticas de tamanho de pacote abaixo também estavam desatualizadas (não incluíam
> `api/*.php` nem a remoção do bundle Supabase de 212,8 KB) — **regeneradas em 2026-10-18**,
> depois que o bloqueador 1 (string `SUA_CHAVE_WEB3FORMS` dentro do comentário em `script.js:245`
> — não um comentário `// PREENCHER`, como uma revisão anterior deste documento supunha — ver
> tabela de Bloqueadores) foi resolvido. O restante das checagens (links internos,
> case-sensitivity, JSON-LD, sitemap) continua válido em princípio.

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
- ✅ **Canonical/OG/JSON-LD**: todos usam `https://alfasci.com.br` (sem www), consistente
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
da validação — nada do teste permanece no repositório.

**Pacote real gerado em 2026-10-18** (depois de corrigido o bloqueador 1): `npm run build`,
`npm run seguranca`, `npm test` e `npm run empacotar` executados em sequência, todos sem erro —
**47 arquivos, 459,7 KB no total** em `dist-locaweb/` (número menor que o teste de 2026-10-07
porque aquele teste antigo ainda incluía o bundle vendorizado do Supabase, já removido).
Confirmado que `dist-locaweb/` não contém `api/config.local.php`, `CLAUDE.md`, nenhum `.sql`,
nem as pastas `tools/`, `database/` ou `src/` — só páginas públicas, `.htaccess` e `api/*.php`.
`api/config.local.php` (bloqueador 2) nunca entra na lista de arquivos a publicar (§1.1), então
ele **não** impede o empacotamento, só precisa estar correto antes do upload manual via FTP
(passo 8-A.4).

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

**`web.config` (IIS/Windows): confirmado NÃO necessário.** O plano Locaweb contratado é **Linux**
(confirmado em 2026-10-07) — o `.htaccess` acima é a configuração final e definitiva de
servidor para este site, não um modelo provisório. Nenhum arquivo `web.config` precisa ser
criado.

**Adaptação feita nesta sessão para o ambiente Linux real:** adicionado um bloco `mod_mime`
explícito no início do Bloco 1 do `.htaccess` (`AddType font/woff2 .woff2`, `image/svg+xml .svg`,
`image/x-icon .ico`, `application/javascript .js`). Motivo: os blocos `mod_deflate` (compressão)
e `mod_expires` (cache) abaixo filtram por **Content-Type**, não por extensão de arquivo — em um
servidor Apache com uma tabela `mime.types` desatualizada (comum em hospedagem compartilhada mais
antiga), arquivos `.woff2` podem ser servidos sem o Content-Type correto, o que faz esses dois
blocos simplesmente não encontrarem o tipo esperado e não aplicarem compressão/cache a esses
arquivos — sem gerar nenhum erro visível, só uma degradação silenciosa de performance. O bloco
`mod_mime` novo garante o Content-Type correto independentemente da versão da tabela MIME do
servidor. **[VERIFICADO]** testado localmente: `npm run empacotar` continua copiando o
`.htaccess` atualizado para `dist-locaweb/` sem erros após essa mudança.

O antigo `publicacao/modelos/leads.htaccess` (arquivo isolado, criado em sessão anterior) foi
**removido** em out/2026 por estar redundante e desatualizado (ainda citava
`https://*.supabase.co` na CSP) — seu conteúdo já está embutido no `.htaccess` único da raiz
(Bloco 1, `<FilesMatch "^leads\.html$">`).

**Checagem de compatibilidade Linux feita nesta sessão (2026-10-07):**
- **[VERIFICADO]** `build.js` e `scripts/empacotar-locaweb.js` usam `path.join`/`path.sep` em
  todo lugar (nunca uma barra invertida `\` hardcoded) — caminhos funcionam igual em Windows (dev)
  e Linux (produção).
- **[VERIFICADO]** Nova varredura de todos os `href`/`src`/`action`/`url()` internos do site
  (HTML/CSS/JS gerados) comparados contra o nome exato (sensível a maiúsculas/minúsculas) de cada
  arquivo no disco — **zero mismatch real** (os únicos resultados sem correspondência exata são
  os links para `/faq.html` dentro de comentários HTML `<!-- -->`, intencionalmente comentados
  pela decisão de ocultar o FAQ — não é um link ativo, não quebra nada).
- **[VERIFICADO]** Nenhum arquivo do projeto tem extensão em maiúscula (ex.: `.JPG`, `.PNG`) —
  elimina outra fonte comum de mismatch de case ao subir para Linux.
- **[VERIFICADO]** A aplicação não depende de Node.js em produção — o `build.js` e o
  `empacotar-locaweb.js` só rodam localmente (ou em CI, se adotado no futuro); o que sobe para a
  hospedagem Locaweb é o conteúdo de `dist-locaweb/` (HTML/CSS/JS/assets + a API PHP em `api/`)
  mais o `.htaccess`.
- **[ATUALIZADO out/2026 — migração de Supabase para MySQL/PHP]** Diferente da versão anterior
  deste documento, **o servidor agora precisa de PHP (com PDO/`pdo_mysql`) e um banco MySQL** —
  o banco de leads deixou de ser externo (Supabase) e passa a ser o MySQL da própria hospedagem,
  acessado pela API em `api/*.php`. O plano "Hospedagem Compartilhada I" da Locaweb já inclui
  PHP + MySQL (confirmado em `CLAUDE.md`), então não é necessário upgrade de plano — mas qualquer
  plano Locaweb puramente estático (sem PHP/MySQL) **não seria mais suficiente** para este site.
- **[VERIFICADO]** Todos os módulos Apache usados no `.htaccess` (`mod_deflate`, `mod_expires`,
  `mod_headers`, `mod_mime`, `mod_authz_core`, e `mod_rewrite` no Bloco 2 ainda comentado) são
  módulos padrão, universalmente habilitados em hospedagem compartilhada Apache — e todos os
  blocos que dependem deles estão dentro de `<IfModule>`, então mesmo que algum módulo
  específico não esteja habilitado no plano contratado, o bloco correspondente é apenas
  ignorado, nunca causa erro 500.

**Conclusão desta checagem: a aplicação é 100% compatível com a hospedagem Locaweb Linux
confirmada (PHP + MySQL inclusos no plano "Hospedagem Compartilhada I"), sem bloqueadores
técnicos de compatibilidade.** As únicas pendências que restam para publicar são as já listadas
na tabela de Bloqueadores no topo deste documento (chave Web3Forms, credenciais do MySQL) —
nenhuma delas é relacionada ao sistema operacional da hospedagem.

---

## PARTE 3 — Passo a passo de publicação

### 0. Antes de começar
- [ ] Reveja a tabela de bloqueadores no topo deste documento.
- [ ] **Commitar antes de empacotar**: o pacote gerado por `npm run empacotar` sempre reflete o
  que estiver no disco no momento, não o último commit — sempre rode `git status` e crie o
  commit das mudanças pendentes antes de gerar o pacote final para publicação (ver "Ordem
  recomendada" no início do documento).
- [x] A Cassia validou o conteúdo técnico/legal do site em outubro de 2026 (bloqueadores 6-9, resolvidos).

### 1. Confirme o que foi contratado
- [x] **Domínio**: `alfasci.com.br` — já ativo e vinculado à hospedagem (confirmado nesta
  sessão). Domínio final e único do site (decisão out/2026, mesmo domínio já usado para
  e-mail). O domínio `alfaprev-sci.com.br` (registrado via Locaweb, ativo até 08/09/2027) foi
  abandonado e não deve mais ser usado.
- [x] **Plano de hospedagem**: **Linux, confirmado em 2026-10-07.** O modelo de servidor a usar é
  o `.htaccess` (`publicacao/modelos/.htaccess`), já pronto e validado — não é necessário
  `web.config`/IIS.
  - **Atualizado out/2026:** o plano precisa incluir PHP (com `pdo_mysql`) e um banco MySQL —
    o plano "Hospedagem Compartilhada I" já contratado atende isso (ver checagem de
    compatibilidade na Parte 2 acima). Não é necessário Node.js no servidor.
- [x] **SSL incluso?** Sim — certificado SSL Let's Encrypt já confirmado ativo nesta sessão.
- [ ] **FTP/SFTP incluso?** Sim, em todos os planos de hospedagem de sites da Locaweb segundo a
  documentação consultada — acesso via painel em "Arquivos e FTP".

### 2. Aponte o domínio para a hospedagem (DNS)

> **🔒 Portão de segurança antes de continuar — leia antes de tocar em qualquer registro DNS.**
> Apontar o DNS é o que torna o site **visível publicamente** pela primeira vez. Antes deste
> passo, confirmar que:
> 1. O admin do `/leads` e o 2FA já foram criados (8-A, idealmente antes mesmo deste passo —
>    ver "Ordem recomendada" no início do documento) — publicar sem isso deixa o painel restante
>    acessível (mesmo que oculto) sem ninguém conseguindo entrar nele de forma legítima ainda.
>
> (Os itens de validação de conteúdo/legislação que antes estavam neste portão foram resolvidos —
> a Cassia validou todo o conteúdo técnico/legal do site em outubro de 2026.)
>
> Se o item acima ainda estiver pendente, **não apontar o DNS ainda** — resolver primeiro, mesmo
> que o restante da preparação técnica (upload, SSL) já esteja pronto.

- [ ] A zona DNS é gerenciada no mesmo painel Locaweb (seção DNS/Zona DNS, **confirmar no painel**
  o caminho exato do menu).
- [ ] **O que mudar**: se o domínio ainda não está apontado para a hospedagem (a consulta DNS
  feita nesta sessão não encontrou registro A para `alfasci.com.br`), será necessário criar/
  ajustar o registro A (ou usar a opção "ativar hospedagem neste domínio" se o painel tiver essa
  automação — **confirmar no painel**).
- [ ] **Registro `www` também precisa existir**, além da raiz: criar um registro `CNAME` de
  `www.alfasci.com.br` apontando para `alfasci.com.br`, ou um segundo registro `A` com o mesmo
  IP da hospedagem (**confirmar no painel** qual opção o painel Locaweb oferece — CNAME é o mais
  comum). Sem esse registro, `https://www.alfasci.com.br` não vai carregar o site mesmo depois
  que o Bloco 2 do `.htaccess` (que redireciona `www` → sem-`www`) estiver ativo — o navegador
  precisa primeiro conseguir resolver `www` para algum servidor antes do redirecionamento rodar.
- [ ] **O que NÃO tocar**: os registros **MX** (já existem e apontam para o e-mail Locaweb —
  alterá-los pode quebrar o recebimento de e-mail) e o registro **TXT de SPF** existente
  (`v=spf1 include:_spf.locaweb.com.br -all` — removê-lo pode fazer e-mails enviados pelo
  domínio caírem em spam).
- [ ] **Tempo de propagação**: minutos a 24-48h (padrão de DNS). Verificar com `nslookup
  alfasci.com.br` **e** `nslookup www.alfasci.com.br` (Windows) ou qualquer ferramenta de lookup
  DNS online, até o endereço IP retornado corresponder ao servidor da Locaweb em ambos os casos.
- [ ] **Cobertura do SSL para `www`**: ao emitir o certificado SSL (passo 6), confirmar que ele
  cobre tanto `alfasci.com.br` quanto `www.alfasci.com.br` (certificados Let's Encrypt/ZeroSSL
  emitidos via painéis de hospedagem geralmente já incluem as duas variantes automaticamente,
  mas **confirmar no painel** antes de ativar o Bloco 2 do `.htaccess`, já que esse bloco força
  HTTPS também na variante `www`).

### 3. Confirme o e-mail de contato
- [x] **Bloqueador nº 10 acima — resolvido em 2026-10-18.** `contato@alfasci.com.br` é o
  e-mail exibido no site; segundo o contexto confirmado nesta sessão, a caixa já existe, está
  ativa, e o Web3Forms já está entregando e-mails nela normalmente.

### 4. Credenciais de upload (FTP/SFTP)
- [ ] No painel Locaweb, seção **"Arquivos e FTP"** (segundo a documentação consultada) —
  mostra os dados de conexão (host, usuário, senha) e permite acesso via Web FTP, SSH, ou
  cliente como FileZilla.
- [ ] **Pasta raiz pública**: `public_html` (confirmado — hospedagem Linux, segundo a
  documentação da Locaweb). **Confirmar no painel** apenas o caminho exato até essa pasta no
  cliente FTP escolhido (pode variar conforme o cliente/visualização).
- [ ] **Cliente recomendado**: FileZilla (gratuito, multiplataforma) — a própria Locaweb tem
  tutorial de uso publicado.
- [ ] **Mostrar arquivos ocultos**: no FileZilla, menu "Servidor" → "Forçar mostrar arquivos
  ocultos" (necessário para ver/confirmar o `.htaccess` depois do upload, já que arquivos
  começando com `.` costumam ficar escondidos por padrão).

### 5. Suba o pacote
- [ ] Gere o pacote com `npm run empacotar` (depois que o bloqueador 1 for resolvido —
  `api/config.local.php` nunca entra no pacote, então o bloqueador 2 não impede o
  empacotamento, só precisa estar correto antes do upload separado do passo 8-A.4).
- [ ] Suba o **conteúdo** da pasta `dist-locaweb/` (todos os arquivos e subpastas dentro dela),
  não a pasta `dist-locaweb` em si, para a raiz pública `public_html` (confirmado no passo 4).
- [ ] **Apague páginas padrão da hospedagem** que possam ter prioridade sobre `index.html` (ex:
  página "em construção", `index.php` de boas-vindas) — **confirmar no painel** se a conta já
  vem com algum arquivo desses.
- [ ] **Permissões padrão**: arquivos `644`, pastas `755` (ajustar via cliente FTP se necessário
  — a maioria dos clientes já aplica esses valores por padrão ao enviar).
- [ ] **Confira a contagem**: compare o número de arquivos enviados com o total listado em
  `publicacao/MANIFESTO-PACOTE.txt` (gerado junto com o pacote).

### 6. Ative o SSL (HTTPS)
- [x] **Confirmado nesta sessão:** certificado SSL Let's Encrypt já está ativo no domínio.
- [ ] Mesmo assim, antes de ativar o Bloco 2 do `.htaccess`, abrir `https://alfasci.com.br` no
  navegador e confirmar visualmente que não há aviso de certificado em nenhuma página.
- [ ] **Só depois** dessa confirmação visual, descomente o **Bloco 2** do `.htaccess`
  (`publicacao/modelos/.htaccess`) e reenvie esse arquivo. Ativar esse bloco antes do certificado
  confirmado funcionando em todas as páginas, no domínio e no `www`, causa erro de
  redirecionamento/certificado para todos os visitantes.
- [ ] **Imediatamente depois de ativar o Bloco 2**, testar as quatro variantes de URL:
  `http://alfasci.com.br`, `https://alfasci.com.br`, `http://www.alfasci.com.br` e
  `https://www.alfasci.com.br` — todas as quatro devem terminar em `https://alfasci.com.br`
  (sem `www`), sem erro de certificado em nenhuma delas.
- [ ] A documentação da Locaweb também menciona uma opção **"Force HTTPS Redirect"** no painel
  de domínios — se essa opção existir e for ativada, o Bloco 2 do `.htaccess` fica redundante
  (mas não prejudicial, pode manter os dois).

### 7. Checklist de teste pós-publicação
- [ ] Todas as páginas abrem via **HTTPS** sem aviso de certificado.
- [ ] As quatro variantes de URL (`http`/`https` × com/sem `www`) terminam na versão canônica
  (`https://alfasci.com.br`, sem `www`) — isso só funciona depois que o Bloco 2 do
  `.htaccess` (passo 6) estiver ativo.
- [ ] `https://alfasci.com.br/robots.txt` e `/sitemap.xml` abrem corretamente.
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
  buscas** (`site:alfasci.com.br/leads.html` no Google só é confiável depois de alguns dias;
  a verificação correta e imediata é pela ferramenta "Inspeção de URL" do Search Console, que
  deve mostrar `noindex` detectado).
- [ ] **Acesso direto a `api/config.local.php` é negado** — abrir
  `https://alfasci.com.br/api/config.local.php` no navegador deve retornar 403 (bloqueado por
  `api/.htaccess`, já confirmado no código desta revisão — ver §8-A.4). Se retornar 200 ou o
  conteúdo do arquivo, é um bloqueador crítico: **suspender o acesso público imediatamente**
  (renomear/mover o arquivo via FTP) até confirmar por que o `.htaccess` não foi aplicado.
- [ ] **Comunicação PHP ↔ MySQL de fato funcionando**: navegar por 2-3 páginas públicas e
  depois abrir a tabela `eventos` no phpMyAdmin (aba "Procurar") — devem aparecer linhas novas
  de `page_view` com `criado_em` recente. Isso prova que `api/metrica.php` está conseguindo
  conectar no banco (não só que a página carregou sem erro visível no navegador).
- [ ] **Cookie de sessão do `/leads` exige HTTPS**: se o HTTPS ainda não estiver 100%
  funcionando (passo 6 incompleto), o login em `/leads.html` pode falhar silenciosamente ou não
  persistir entre páginas — o cookie de sessão é `Secure` (ver `api/lib/sessao.php`), então só
  funciona de fato sobre `https://`. Não testar o login do admin antes do HTTPS estar confirmado.
- [ ] **Primeiro login do admin + cadastro do 2FA**: seguir 8-A.6 por completo nesta etapa —
  login inicial, cadastro do TOTP no app autenticador, confirmação do primeiro código, e
  conferir no phpMyAdmin que `totp_confirmado` virou `1` para esse e-mail.
- [ ] **O primeiro e-mail do Web3Forms pode cair em spam/lixo eletrônico** — ao testar o
  formulário de contato, verificar a caixa de spam de `contato@alfasci.com.br` antes de concluir
  que o envio falhou.
- [ ] **Apagar o lead de teste**: depois de confirmar que o envio de teste do formulário
  apareceu na grade de `/leads`, excluir esse lead de teste pela própria interface do painel
  (não deixar dados fictícios misturados com leads reais).

### 8. Serviços externos a reconfigurar para o domínio final
- [x] **Web3Forms**: a chave em `script.js:282` já tem formato de chave real (não é mais o
  placeholder), e segundo o contexto confirmado nesta sessão já está entregando e-mails em
  `contato@alfasci.com.br`. O comentário na linha 245 que citava o texto do placeholder
  (`SUA_CHAVE_WEB3FORMS`) foi reescrito em 2026-10-18 — era essa string, não o valor da chave,
  que fazia `npm run empacotar` falhar (ver tabela de Bloqueadores).
- [ ] **"Trusted Domains" do Web3Forms**: essa funcionalidade (lista de domínios permitidos a
  usar a chave) é recurso de **plano pago** do Web3Forms — **não aplicável** no plano gratuito
  atual. Marcar como "feito/N/A", não como pendência.
- [ ] Qualquer outra chave/domínio permitido de serviço de terceiro usado pelo site (no momento,
  só Web3Forms se aplica — o banco de leads passou a ser o MySQL interno da própria hospedagem,
  ver 8-A).

### 8-A. Banco MySQL em produção (só Artur — baseado em `docs/DASHBOARD-LEADS.md`)

> Os nomes exatos de menus/botões do painel Locaweb podem mudar com o tempo — qualquer passo
> abaixo que dependa disso está marcado **"confirmar no painel"**, no mesmo espírito do resto
> deste documento.

#### 8-A.1 — Criar o banco de dados MySQL no painel

**✅ Já feito, confirmado pelo Artur (2026-10-14).** Padrões reais observados nesta
hospedagem (úteis para a próxima vez que isso precisar ser repetido, ex.: segundo ambiente
de teste): o nome do banco **não** recebeu prefixo automático do login da hospedagem (diferente
do que algumas hospedagens compartilhadas fazem); o host de conexão é um **host dedicado**
(formato `nomedobanco.mysql.dbaas.com.br`), **nunca** `localhost`; a porta é a padrão `3306`
(a confirmar na primeira tentativa real de conexão, já que não foi testada ainda — bloqueador
4); o charset de conexão a usar é `utf8mb4` (já o padrão em `api/config.example.php`). O passo
a passo abaixo é mantido como referência para o caso de precisar criar um segundo banco (ex.:
ambiente de teste/staging) no futuro:
- [ ] Acessar o painel da Locaweb → seção de **Banco de Dados MySQL** (normalmente dentro de
  "Hospedagem de Sites" → gerenciar o plano contratado → "Banco de Dados" — **confirmar no
  painel** o caminho exato do menu).
- [ ] Clicar em "Criar Banco de Dados MySQL" (**confirmar no painel** o texto exato do botão).
- [ ] Definir um nome para o banco e confirmar se o painel adiciona algum prefixo automático
  (nesta hospedagem, não adicionou).
- [ ] Criar/confirmar o usuário MySQL associado a esse banco. Definir uma senha forte e única
  (gerenciador de senhas, nunca reaproveitada de outro serviço).
- [ ] Conceder ao usuário todas as permissões sobre esse banco específico (equivalente a `ALL
  PRIVILEGES` apenas no schema criado — não um usuário com privilégio global/`SUPER`, se o
  painel oferecer essa granularidade).
- [ ] Anotar host, porta, nome do banco e usuário exibidos pelo painel. Guardar a senha só em
  gerenciador de senhas — nunca em texto plano em nenhum arquivo do repositório.

#### 8-A.2 — Rodar `database/schema.mysql.sql` via phpMyAdmin
- [ ] No mesmo painel de bancos de dados, localizar o link/botão de acesso ao **phpMyAdmin** do
  banco recém-criado (geralmente abre uma nova aba já autenticada direto no banco certo —
  **confirmar no painel**).
- [ ] Dentro do phpMyAdmin, selecionar o banco criado na barra lateral esquerda e **conferir que
  é o nome certo** antes de rodar qualquer SQL (rodar no banco errado pode afetar outro projeto,
  se a conta Locaweb tiver mais de um banco).
- [ ] Ir na aba **"SQL"** no topo da tela.
- [ ] Abrir `database/schema.mysql.sql` neste repositório, copiar o conteúdo inteiro do arquivo e
  colar na caixa de texto SQL do phpMyAdmin.
- [ ] Clicar em **"Executar"** (pode aparecer como "Go", dependendo do idioma configurado no
  painel).
- [ ] **Variante por upload de arquivo:** em vez de colar, a aba **"Importar"** do phpMyAdmin
  aceita o `.sql` diretamente — "Escolher arquivo" → selecionar `database/schema.mysql.sql` →
  "Executar". Qualquer uma das duas formas produz o mesmo resultado, já que o script é
  idempotente (pode ser rodado mais de uma vez sem erro nem duplicação).
- [ ] **Esperado:** phpMyAdmin reporta sucesso sem nenhuma linha de erro na saída.

#### 8-A.3 — Verificar que o schema foi aplicado corretamente

**✅ Já feito, parcialmente confirmado pelo Artur (2026-10-14):** as 5 tabelas existem e estão
vazias. Falta confirmar só os dois últimos itens abaixo:
- [x] Na barra lateral do phpMyAdmin, confirmar que aparecem as 5 tabelas: `leads`, `admins`,
  `eventos`, `sais_diarios`, `tentativas_login`.
- [x] Confirmar que todas as 5 tabelas aparecem com 0 linhas — o script só cria estrutura, nunca
  insere dados.
- [ ] Abrir a aba **"Estrutura"** de uma delas (ex: `leads`) e confirmar no rodapé da página
  `Mecanismo de armazenamento: InnoDB` e `Collation: utf8mb4_unicode_ci`. **Nota:** o banco em
  si (`alfasci`) tem collation default `latin1` relatado pelo Artur — isso **não afeta** estas
  tabelas, porque o `CREATE TABLE` em `database/schema.mysql.sql` especifica explicitamente
  `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` em cada uma; o `latin1` do banco só valeria
  para uma tabela nova criada **sem** especificar charset/collation. Ainda assim, confirmar aqui
  para ter certeza de que o `CREATE TABLE` não foi silenciosamente ignorado em algum campo.
- [ ] Na aba de rotinas do banco (**"Rotinas"** ou dentro de "Mais" — **confirmar no painel**,
  varia por versão do phpMyAdmin), confirmar que a procedure `limpar_dados_antigos` aparece
  listada.

#### 8-A.4 — Preencher `api/config.local.php` no servidor
- [x] **Confirmado nesta sessão:** `api/config.local.php` já existe no ambiente local e já está
  preenchido com os valores reais (não os placeholders `SUBSTITUIR_*`). Por ser gitignored e
  conter segredos, não foi lido nem impresso nesta sessão — apenas confirmado que o arquivo não
  foi alterado.
- [ ] Gerar o `sal_fixo` uma única vez (ex.: `php -r "echo bin2hex(random_bytes(32));"` se houver
  PHP CLI disponível localmente, ou qualquer gerador confiável de string aleatória longa) e
  preencher — nunca reaproveitar esse valor de outro projeto. (Só relevante se o valor atual de
  `sal_fixo` ainda não tiver sido gerado dessa forma — não regerar um valor já preenchido.)
- [ ] **Se precisar rodar esse comando (ou `tools/gerar-hash-admin.php`, passo 8-A.5) e o PHP
  CLI não estiver instalado no Windows local**, duas alternativas gratuitas:
  - **Instalação nativa no Windows 11 (recomendada, mais rápida nas próximas vezes):** baixar o
    ZIP "VC15 x64 Non Thread Safe" em `windows.php.net/download`, extrair o conteúdo numa pasta
    fixa (ex.: `C:\php`), adicionar essa pasta ao `PATH` **do usuário** (Configurações →
    Variáveis de ambiente → Variáveis do usuário → `Path` → "Novo" → colar `C:\php`), **fechar e
    reabrir o terminal** (o `PATH` só é recarregado em uma sessão nova) e confirmar com `php -v`.
    Extensões necessárias para este projeto (`pdo_mysql`, `openssl`, `hash`) já vêm habilitadas
    por padrão no instalador oficial do Windows — não é necessário compilar nada nem usar
    Composer. (`winget install PHP.PHP.8.3` é equivalente, se o `winget` estiver disponível.)
  - **Docker (alternativa, se preferir não instalar nada permanentemente no Windows):** com o
    Docker Desktop instalado, rodar `docker run --rm -it -v "${PWD}:/app" -w /app php:8.3-cli
    php tools/gerar-hash-admin.php` — baixa uma imagem oficial do PHP, roda o script num
    container temporário (que some depois) e mostra o resultado no terminal normalmente.
- [ ] Fazer upload de **apenas esse arquivo** (`api/config.local.php`) para a pasta `api/` dentro
  de `public_html` no servidor, via FTP/SFTP (ver passo 4 da Parte 3) — ele nunca faz parte do
  pacote gerado por `npm run empacotar` (ver §1.1, lista "Não publicar").

#### 8-A.5 — Criar o primeiro admin do painel `/leads`

**O que cada peça faz, em português simples:** a senha do admin **nunca** é guardada como foi
digitada — ela passa por uma função de hash (`password_hash`, bcrypt) que a transforma num texto
irreversível; é esse texto (o "hash") que fica guardado na coluna `senha_hash` da tabela
`admins`, nunca a senha em si. `tools/gerar-hash-admin.php` só serve para gerar esse hash no seu
computador (a senha nunca sai da sua máquina, nunca é enviada para lugar nenhum) e montar o
comando SQL pronto para você colar no phpMyAdmin — o script em si nunca se conecta a nenhum
banco.

- [ ] No terminal, dentro da pasta do projeto, rodar: `php tools/gerar-hash-admin.php` (ver nota
  de instalação do PHP em 8-A.4 se necessário).
- [ ] Escolher a opção **1) Criar um novo admin**.
- [ ] Digitar o e-mail real da pessoa que vai administrar o painel (nunca
  `contato@alfasci.com.br` — o script recusa esse e-mail automaticamente, por ser o e-mail
  público do site).
- [ ] Digitar a senha (não aparece na tela) e digitar de novo para confirmar. Mínimo de 12
  caracteres — use um gerenciador de senhas para gerar e guardar essa senha, nunca anote em
  texto simples.
- [ ] O script imprime um comando `INSERT INTO admins (...) VALUES (...);` já pronto.
- [ ] No phpMyAdmin (banco `alfasci`, aba **"SQL"** — confirmar que o banco certo está
  selecionado antes de colar qualquer coisa), colar o comando impresso e clicar em "Executar"/"Go".
  (Se preferir usar a aba "Inserir" em vez da aba "SQL": preencher `email` e `senha_hash`
  manualmente com os valores impressos, deixar `totp_secret` em branco, `totp_confirmado = 0`, e
  **deixar a coluna "Função" vazia** — não selecionar nenhuma função SQL ali, ou o valor pode ser
  interpretado errado.)
- [ ] **Confirmar sucesso sem expor o hash**: rodar `SELECT id, email, totp_confirmado FROM
  admins;` na aba SQL — deve aparecer uma linha com o e-mail digitado e `totp_confirmado = 0`.
  **Nunca** rodar `SELECT *` ou selecionar a coluna `senha_hash` só para "conferir" — não há
  necessidade, e isso expõe o hash na tela sem motivo.

#### 8-A.6 — Primeiro login e cadastro do 2FA (obrigatório)

**O que é e por que só funciona com o site no ar:** 2FA (segundo fator de autenticação) é um
código de 6 dígitos, válido por 30 segundos, gerado por um aplicativo autenticador (Google
Authenticator, Authy, Microsoft Authenticator, etc.) no celular. Ele é **obrigatório** para
entrar no painel `/leads` — mesmo sabendo a senha certa, o login só é concluído depois do código
certo. O cadastro desse código só pode ser feito fazendo login de verdade na página
`/leads.html`, então **este passo só é possível depois que o site estiver publicado e acessível**
(depois do passo 6 — SSL funcionando).

**Agora (antes do site estar no ar), o que já pode ser feito:** só 8-A.4 e 8-A.5 (preencher a
config e criar a linha do admin no banco). O cadastro do 2FA abaixo **tem** que esperar o site
estar publicado.

**Depois que o site estiver no ar:**
- [ ] Acessar `https://alfasci.com.br/leads.html` e fazer login com o e-mail e a senha
  escolhidos em 8-A.5.
- [ ] O sistema responde `mfa_cadastro_necessario` (primeiro acesso) e mostra um código/segredo
  em texto (não é QR code, de propósito — ver `CLAUDE.md`, seção Segurança). Abrir o app
  autenticador no celular, escolher "adicionar conta manualmente" (ou "digitar chave de
  configuração") e colar esse texto.
- [ ] Digitar na tela do painel o código de 6 dígitos que o app autenticador mostrou e confirmar.
- [ ] Confirmar no phpMyAdmin (`SELECT id, email, totp_confirmado FROM admins;`) que a linha
  desse admin passou a ter `totp_confirmado = 1`.
- [ ] Só a partir daqui o admin está operacional — **nunca distribuir a URL do painel antes de
  completar este passo** (ver regra em `CLAUDE.md`, seção Segurança).
- [ ] **Proteger o acesso ao 2FA**: o app autenticador fica vinculado a um único celular. Se
  possível, usar um app que permita backup/sincronização em nuvem protegida por senha (ex.:
  Authy, ou a sincronização nativa do Google Authenticator), ou anotar a chave de configuração
  mostrada no cadastro num gerenciador de senhas, como seguro contra perda do celular.

**Procedimentos de recuperação (quando algo dá errado depois que o admin já existe):**
- [ ] **Esqueceu a senha**: rodar `tools/gerar-hash-admin.php` de novo, opção **2) Trocar a senha
  de um admin existente**, digitar o e-mail e a nova senha — o script imprime um `UPDATE` pronto
  para colar no phpMyAdmin. O 2FA não é afetado.
- [ ] **Perdeu o celular com o app autenticador**: rodar `tools/gerar-hash-admin.php`, opção
  **3) Zerar o 2FA de um admin**, digitar o e-mail — o script imprime um `UPDATE` que zera
  `totp_secret`/`totp_confirmado`. No próximo login, o painel pede um novo cadastro de 2FA (como
  no primeiro acesso).
- [ ] **Bloqueio por 3 tentativas de senha erradas**: esperar 5 minutos (bloqueio automático do
  servidor, baseado na tabela `tentativas_login`) — não existe comando para "desbloquear
  antes do tempo" por design (evita que um atacante force reset de bloqueio); se for realmente
  urgente, um `DELETE FROM tentativas_login WHERE email = 'email-do-admin';` no phpMyAdmin limpa
  o histórico, mas use isso com moderação (é o mecanismo de proteção contra força bruta).
- [ ] **Criar um segundo admin**: repetir 8-A.5 (opção 1) com o e-mail da nova pessoa — não há
  limite de quantos admins podem existir na tabela.

#### 8-A.7 — Itens finais
- [ ] Exportar backup CSV dos leads existentes antes de qualquer mudança futura de schema (se já
  houver leads de teste em algum banco anterior).
- [ ] Rodar `npm test` e `npm run seguranca` localmente e **só publicar se ambos passarem**.
- [ ] Confirmar que nenhum arquivo publicado contém `api/config.local.php` ou qualquer credencial
  real do MySQL (checado automaticamente por `scripts/empacotar-locaweb.js`).
- [ ] Registrar pendências de retenção de dados conforme LGPD (ver `docs/DASHBOARD-LEADS.md`,
  seção LGPD).
- [ ] Confirmar com o suporte Locaweb se o Event Scheduler do MySQL está disponível no plano
  contratado; se não, agendar a execução manual/periódica de
  `CALL limpar_dados_antigos(180, 1)` via phpMyAdmin e manter uma rotina de exportação CSV dos
  leads como backup próprio.

#### 8-A.8 — Verificações técnicas confirmadas nesta revisão (2026-10-14)

Checagens pedidas nesta revisão, já confirmadas lendo o código (sem precisar de acesso ao
painel Locaweb):

- **✅ CSP permite o Web3Forms**: `publicacao/modelos/.htaccess` tem `connect-src 'self'
  https://api.web3forms.com` na CSP das páginas públicas — sem isso, o envio do formulário
  falharia silenciosamente só no console do navegador (o usuário não veria erro nenhum na tela).
  Nada a corrigir.
- **✅ `config*.php` e `api/lib/` já bloqueados por HTTP**: `api/.htaccess` (arquivo próprio,
  separado do `.htaccess` da raiz) já nega acesso direto a `config.php`/`config.local.php`/
  `config.example.php`/qualquer `.sql`, e bloqueia todo o diretório `api/lib/` via
  `mod_rewrite`. Isso já está implementado — só falta confirmar que o arquivo `api/.htaccess`
  também é enviado ao servidor junto com os demais (ver passo 7 do checklist pós-publicação,
  item "acesso direto a `api/config.local.php` é negado").
- **✅ `api/config.example.php` já tem `port` e `charset: utf8mb4`** como campos do template —
  nada a ajustar; e o template nunca usa `localhost` como valor (usa o placeholder
  `SUBSTITUIR_HOST_MYSQL`).
- **✅ Disciplina de fuso horário**: a API nunca depende do fuso horário do próprio servidor
  MySQL — `api/lib/tempo.php` calcula o horário atual em UTC dentro do próprio PHP
  (`gmdate`), grava sempre em UTC, e só converte para `America/Sao_Paulo` no momento de exibir
  no painel. Mesmo que o servidor MySQL da Locaweb esteja configurado num fuso diferente, os
  dados continuam corretos.
- **Cookie de sessão do `/leads`** (`api/lib/sessao.php`): `HttpOnly` sempre ativo (JavaScript
  nunca consegue ler o cookie), `SameSite=Strict`, e `Secure` **condicional** — só fica marcado
  quando a requisição já está em HTTPS. Isso significa que **sobre HTTP puro (sem SSL ainda), o
  login funciona tecnicamente, mas de forma menos segura** (sem a proteção `Secure`) — reforça
  por que o passo 6 (SSL) deve vir antes de testar o login real do admin.
- **✅ `limpar_dados_antigos` existe no schema**: confirmado em `database/schema.mysql.sql`
  (`DROP PROCEDURE IF EXISTS` + `CREATE PROCEDURE limpar_dados_antigos(p_dias_eventos,
  p_dias_login)`) — falta só confirmar no phpMyAdmin que ela foi criada de fato no banco
  (ver 8-A.3) e decidir o agendamento (Event Scheduler do MySQL, se disponível no plano, ou
  execução manual periódica — ver item acima).

### 9. Depois de publicar — mecanismos de busca
- [ ] **Google Search Console**: criar uma propriedade do tipo domínio, verificar via registro
  TXT na zona DNS (confirmado pela documentação pública: criar entrada TXT na zona DNS do
  Locaweb com o código fornecido pelo Search Console, aguardar propagação — até 24h — e clicar
  em "Verificar"). Depois, enviar `sitemap.xml` e solicitar indexação da Home e páginas principais.
- [ ] **Bing Webmaster Tools**: pode importar diretamente do Search Console (opção padrão da
  ferramenta).
- [ ] **Google Business Profile**: criar/verificar o perfil. Dados que precisam ser **idênticos**
  aos do site: nome (Alfa Prev), telefone ((11) 98932-5513).
  **⚠️ Contradição encontrada nesta revisão (2026-10-14), não corrigida — decisão do Artur +
  Cassia antes de publicar:** `CLAUDE.md` afirma que o site **não deve exibir endereço físico em
  lugar nenhum** ("NÃO USAR ENDEREÇO EM LUGAR NENHUM DO SITE"), mas o HTML publicado (via
  `partials/head-common.html`, herdado por `index.html`, `contato.html` e as demais páginas) já
  contém `<meta name="geo.placename" content="Guarulhos, São Paulo">` e `<meta name="geo.position"
  content="-23.4630;-46.5333">` — ou seja, o site hoje **já** expõe uma localização (Guarulhos)
  em metadados, mesmo sem mostrar um endereço de rua visível na página. Isto não foi alterado
  por este documento (fora do escopo de uma revisão de publicação). Antes de publicar, decidir
  com a Cassia: (a) manter as meta tags `geo.*` e ajustar a regra do `CLAUDE.md` para refletir
  que a área de atendimento (não o endereço exato) pode aparecer em metadados, ou (b) remover as
  meta tags `geo.*` para ficar 100% consistente com "sem localização em lugar nenhum". Essa
  mesma decisão se aplica ao Business Profile: se a opção (a) for escolhida, o perfil pode exibir
  "Guarulhos, SP" como área de atendimento; se (b), configurar o perfil só com área de serviço
  (todo o Estado de SP), sem endereço nem cidade-base visível.
- [ ] **Medição de visitas/conversão**: feita pelo próprio dashboard de `/leads` (métricas
  anônimas, sem cookies, no MySQL via `api/dashboard.php`) — **sem Google Analytics**. Search
  Console e Bing mostram
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
| Erro 500 especificamente em qualquer URL de `/api/*.php` | Versão de PHP incompatível no plano, ou extensão `pdo_mysql` não habilitada | Confirmar no painel a versão de PHP (8-A antes de 8-A.1) e se `pdo_mysql` está ativa; sem essa extensão, `api/lib/db.php` não consegue abrir conexão |
| `/api/*.php` responde, mas sempre com erro de "banco indisponível" | Falha de conexão com o MySQL: host/porta/usuário/senha errados em `api/config.local.php`, ou banco ainda não liberado para esse host | Reconferir os 5 valores de `api/config.local.php` contra o que o painel Locaweb mostra (8-A.1); `api/lib/db.php` nunca expõe o erro real do PDO por segurança, então o diagnóstico tem que ser feito comparando a config, não pela mensagem de erro |
| Acentos/caracteres especiais aparecem corrompidos (ex.: "Ã©" em vez de "é") | Charset da conexão PDO diferente de `utf8mb4` | Confirmar `'charset' => 'utf8mb4'` em `api/config.local.php` — já é o padrão do template, não deveria precisar mudar |
| Login em `/leads` funciona mas desloga ao navegar para outra tela/aba | Cookie de sessão é `Secure` e o site ainda está em `http://` (sem HTTPS funcionando) | Completar o passo 6 (SSL) antes de testar o login do admin — ver item correspondente no checklist do passo 7 |
| E-mail do formulário de contato não chega | Chave Web3Forms não registrada com `contato@alfasci.com.br`, ou e-mail caiu em spam | Conferir o bloqueador 1 (painel web3forms.com) e a caixa de spam antes de supor falha técnica |

### 12. O que só Artur pode fazer (contas/acessos que Claude Code não tem)
- Painel da Locaweb (contratação de plano, FTP, DNS, SSL, e-mail, criação do banco MySQL).
- Caixa de e-mail `contato@alfasci.com.br` (confirmação de existência e teste de envio/recebimento).
- phpMyAdmin da hospedagem (produção): rodar `database/schema.mysql.sql`, criar o admin na tabela
  `admins`, agendar/rodar `limpar_dados_antigos`.
- Painel do Web3Forms (criar chave nova).
- Google Search Console, Bing Webmaster Tools, Google Business Profile.

### Nota sobre URLs temporárias/subpasta
O site usa caminhos absolutos a partir da raiz (`/assets/...`, `/leads.html`, etc.), então
**não funciona** se servido a partir de uma subpasta (ex: `servidor.com/~usuario/`) — todos os
links quebrariam, pois o navegador buscaria `/assets/...` na raiz do domínio, não dentro da
subpasta. O teste completo só deve ser feito depois que o domínio estiver apontado para a
hospedagem (passo 2), ou usando uma URL temporária que sirva os arquivos a partir da raiz, se
o plano contratado oferecer isso (**confirmar no painel**).
