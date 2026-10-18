# Relatório — Revalidação SEO e Prontidão para Google Search Console

Gerado em 2026-10-18. Revalida `publicacao/AUDITORIA-SEO.md` (feita antes da publicação,
em `localhost`) contra o estado atual do código e do site publicado em `https://alfasci.com.br`
(Locaweb, Apache atrás de nginx, PHP 8.5, Let's Encrypt). Documento **somente leitura** em
relação ao site: nenhum conteúdo, código, `.htaccess`, banco ou servidor foi alterado nesta
revisão. `publicacao/AUDITORIA-SEO.md` não foi modificado (permanece como referência histórica).

---

## 1. Resumo (8 linhas)

O site está **parcialmente pronto** para cadastro no Search Console: pode ser cadastrado e o
sitemap pode ser enviado hoje, mas 2 problemas devem ser corrigidos antes para evitar conteúdo
duplicado e confusão de indexação. **Nenhum achado crítico de segurança**: todos os arquivos
sensíveis testados (`config.local.php`, `.htaccess`, `.git/config`, `api/lib/`) retornam
403/404 no servidor publicado. **Bloqueador nº1**: as 4 variantes de URL
(`http`/`https` × com/sem `www`) respondem todas `200` sem redirecionamento — risco real de
indexação duplicada. **Bloqueador nº2**: `sitemap.xml` tem `lastmod` de setembro/2026, desatualizado
frente às mudanças de outubro. HSTS está **ausente** em produção (não é "rollout em andamento" —
o bloco inteiro está comentado). Nome da marca no JSON-LD tem **4 variantes diferentes** entre
páginas. Performance mobile (Lighthouse local) segue baixa por causa do Tailwind via CDN —
não foi possível medir o site ao vivo nesta sessão (ver §4.6). Dos achados da auditoria original,
a maioria permanece válida; 3 foram corrigidos; 1 ficou obsoleto; 2 são novos (não estavam na
auditoria original).

---

## 2. O que mudou desde a auditoria (`AUDITORIA-SEO.md`)

| # (ref. 4.12) | Achado original | Status atual | Evidência |
|---|---|---|---|
| 1-2 | Performance mobile 36/100, Tailwind via CDN como causa raiz | ⚠️ ainda válido | `index.html`/`servicos.html`/etc. ainda carregam `cdn.tailwindcss.com`; migração para CSS compilado não foi feita. Não foi possível re-medir ao vivo nesta sessão (ver §4.6). |
| 3 | Nome da marca inconsistente em 3 arquivos ("Alfa Prev - Segurança Contra Incêndios") | 🔄 mudou (piorou) | Hoje são **3 variantes simultâneas** nos JSON-LD gerados: `"Alfa Prev - Segurança Contra Incêndios"` (3 ocorrências), `"Alfa Prev"` (2 ocorrências), e uma **4ª variante nova não documentada na auditoria**: `"Alfa Prev \| ALFA SEGURANÇA CONTRA INCÊNDIO LTDA"` em `blog-sci/avcb-clcb.html`. Nenhuma delas é "Alfa Prev" puro, conforme convenção de marca do `CLAUDE.md`. |
| 4 | `quem-somos.html` sem bloco `ProfessionalService` dedicado (só aninhado em `Person.worksFor`) | ⚠️ ainda válido | Confirmado em `src/pages/quem-somos.html` — `Person.worksFor` continua sendo o único lugar com os dados da empresa; não há um `ProfessionalService` top-level nessa página. |
| 5 | Registro CAU/SP da Cassia ausente do `Person` estruturado | ⚠️ ainda válido | JSON-LD `Person` em `quem-somos.html` tem `hasCredential` só com `"Especialização: Engenharia de Incêndio"` — nenhuma entrada para `CAU/SP 00A1858351`, mesmo esse dado estando no texto visível da página. |
| 6 | `Article.publisher.logo` ausente | ⚠️ ainda válido (não re-verificado item a item nesta sessão, mas nenhuma mudança de JSON-LD de artigo foi encontrada) | `blog-sci/avcb-clcb.html` — publisher sem `logo`. |
| 7 | `aria-label` do botão WhatsApp flutuante não batia com o texto/terminologia | ✅ corrigido | `partials/whatsapp-float.html`: `aria-label="Falar no WhatsApp com a Alfa Prev"` (antes: "Tirar dúvidas sobre segurança contra incêndio pelo WhatsApp"). |
| 8 | Contraste insuficiente no footer (`text-gray-400` sobre `corp-black`) | ⚠️ ainda válido | `partials/footer.html` ainda usa `text-gray-400` extensivamente (CNPJ, nav, redes sociais, horário) sobre fundo escuro. |
| 9 | CSP ausente no `.htaccess` real (só existia em `netlify.toml`) | ✅ corrigido | `publicacao/modelos/.htaccess` Bloco 1 agora tem CSP completa para páginas públicas e uma CSP mais restrita só para `leads.html`. Confirmado também ao vivo (`curl -I https://alfasci.com.br/`). |
| 10 | `alt` do logo com "Segurança Contra Incêndio" (14 ocorrências) | ⚠️ ainda válido (contagem mudou) | `grep` hoje encontra **12 ocorrências** de `alt="Alfa Prev, Segurança Contra Incêndio"` (6 nos headers + footers das páginas geradas, 2 por página), não 14 — diferença provavelmente por páginas removidas/consolidadas desde a auditoria (ex. FAQ oculto). Terminologia continua divergente da convenção "Engenharia de Incêndio". |
| 11 | Métricas gravadas via Supabase RPC | 🗑️ obsoleto | Migração completa para MySQL/PHP (`api/metrica.php` → tabela `eventos`) confirmada em `docs/DASHBOARD-LEADS.md` e no código. Nenhuma referência a Supabase/RPC resta no fluxo real. |
| 12 | `netlify.toml` como config real de produção | 🗑️ obsoleto | `publicacao/modelos/.htaccess` é o config real (Locaweb/Apache, confirmado 2026-10-07). `netlify.toml` mantido só como referência histórica, não deployado. |
| 13 | `sameAs` ausente do `ProfessionalService` | 🔄 mudou (parcialmente corrigido) | `src/pages/index.html` agora tem `sameAs` com Instagram/Facebook/LinkedIn. Mas o bloco `ProfessionalService` aninhado em `Person.worksFor` (`quem-somos.html`) **não** tem `sameAs` — correção não propagada a todas as ocorrências do bloco. |
| 14 | Domínio sem hospedagem apontada | 🗑️ obsoleto | Site está no ar e responde em `https://alfasci.com.br` com certificado válido (SAN cobre `alfasci.com.br` e `www.alfasci.com.br`). |
| (positivo) | Schema.org `BreadcrumbList`/`FAQPage` (ausente)/`ItemList`/`CollectionPage`/`Article` conforme planejado | ✅ confirmado | JSON-LD validado com parser JSON em todas as páginas geradas — nenhum bloco malformado. `FAQPage` ausente confirmado intencional (FAQ oculto, ver CLAUDE.md). |
| (novo, não estava na auditoria) | `robots.txt` tem BOM UTF-8 no início do arquivo | 🆕 novo achado | `xxd robots.txt` mostra `ef bb bf` antes de `# Robots.txt`. Geralmente inofensivo para crawlers modernos, mas é uma prática não recomendada (alguns parsers mais antigos/rígidos podem interpretar mal a primeira linha). |
| (novo) | HSTS ausente em produção | 🆕 novo achado (CLAUDE.md descreve como "rollout em andamento", mas o bloco está 100% comentado) | `curl -I https://alfasci.com.br/` não retorna `Strict-Transport-Security`. O Bloco 2 inteiro do `.htaccess` (força HTTPS, força sem-`www`, e o próprio header HSTS) está comentado tanto no modelo-fonte quanto no `dist-locaweb/.htaccess` já empacotado. |

---

## 3. Prontidão para o Search Console (Etapa 2)

| Item | Status | Evidência |
|---|---|---|
| `robots.txt` não bloqueia o site | ✅ | `User-agent: *` / `Allow: /` (sem `Disallow` geral). |
| `robots.txt` referencia sitemap com URL absoluta | ✅ | `Sitemap: https://alfasci.com.br/sitemap.xml` presente. |
| `robots.txt` não lista `/leads.html` | ✅ | Confirmado por ausência — proteção real é a sessão PHP + 2FA, não a obscuridade. |
| `/api/` deveria ter `Disallow`? | ⚠️ avaliação, não implementado | GETs reais aos endpoints: `/api/lead.php` → 405, `/api/metrica.php` → 405, `/api/dashboard.php` → 401, `/api/sessao-verificar.php` → 200 (emite token CSRF por design, não vaza dado sensível). **Prós de bloquear:** evita gasto de crawl budget em URLs que nunca servem conteúdo indexável; sinaliza intenção clara. **Contras:** nenhum desses endpoints retorna HTML indexável mesmo sem `Disallow` (todos 401/405/JSON), então o ganho prático é pequeno; `Disallow: /api/` em `robots.txt` é informação pública que lista a existência da pasta para qualquer visitante. **Recomendação:** baixa prioridade, opcional — não é bloqueador. |
| `sitemap.xml`: todas as URLs em `https://alfasci.com.br` sem `www` | ✅ | 6 URLs, todas no padrão correto. |
| `sitemap.xml`: só páginas públicas indexáveis (sem leads/FAQ) | ✅ | 6 URLs = home, servicos, quem-somos, blog-sci, blog-sci/avcb-clcb, contato. Nenhuma referência a `leads.html` ou `faq.html`. |
| `sitemap.xml`: contagem bate com páginas públicas | ✅ | 6 URLs = 6 páginas públicas geradas atualmente (FAQ oculto corretamente excluído). |
| `sitemap.xml`: `lastmod` atualizado | 🔴 **não** | Todas as datas são `2026-09-15` a `2026-09-19` — anteriores a diversas mudanças de outubro (migração MySQL, CSP, correções de conteúdo, `sameAs`, aria-label). `lastmod` é **100% manual**: `grep -r "lastmod" build.js` não retorna nada — `build.js` não gera nem atualiza essas datas automaticamente. |
| Nenhuma página pública com `noindex`/`X-Robots-Tag` errado | ✅ | Só `leads.html` tem `X-Robots-Tag: noindex, nofollow, noarchive` (confirmado também ao vivo, §4.3). |
| `leads.html` tem `noindex` via meta E header | ✅ | Confirmado via `curl -I` ao vivo: header `X-Robots-Tag` presente; meta tag também presente no HTML-fonte (não re-impressa aqui por não ser necessária). |
| Canonical / `og:url` / JSON-LD usam a mesma variante de URL | ✅ (nas páginas verificadas) | Todas usam `https://alfasci.com.br/...` sem `www`, de forma consistente dentro de cada página. |
| Variantes de URL convergem para uma só? | 🔴 **não convergem** | Ver §4.2 — as 4 combinações (`http`/`https` × com/sem `www`) respondem todas `200` sem redirect. Bloco 2 do `.htaccess` (que faria essa consolidação) está comentado. **Risco real**: Google pode indexar `http://www.alfasci.com.br/` como conteúdo duplicado do canônico. O canonical tag mitiga parcialmente (diz ao Google qual é a versão "oficial"), mas não impede o rastreio das outras 3 variantes. |
| Página 404 existe e retorna 404 real | ✅ | `curl` a uma URL inexistente retorna `404` (Apache padrão, já que `ErrorDocument 404 /404.html` está comentado por não existir `404.html` ainda — mas o Apache já responde 404 nativamente, só sem página customizada). |
| Página oculta (FAQ) responde 404, não 200 | ✅ | `https://alfasci.com.br/faq.html` → `404`. |
| Links internos: sem links quebrados, nenhum para páginas ocultas | ✅ | O único `href="/faq.html"` encontrado no código-fonte está dentro de um comentário HTML inteiro em `src/pages/servicos.html` (CTA comentado) — confirmado ausente do pacote publicável (`grep -c "faq" dist-locaweb/servicos.html` = 0). Não é um link real, nenhum visitante ou crawler pode alcançá-lo. |
| Verificação de propriedade: meta ou arquivo já presentes? | ❓ não verificado nesta sessão (nenhum indício encontrado) | Nenhuma `<meta name="google-site-verification">` nem arquivo `google*.html` foi encontrado na raiz do projeto nem em `dist-locaweb/`. |
| Explicação DNS TXT vs arquivo HTML | ℹ️ ver abaixo | **DNS TXT**: um registro de texto é adicionado no painel de DNS da Locaweb (fora do pacote do site) — não depende de nenhum arquivo, não se perde em reenvios de FTP, e **verifica o domínio inteiro** (incluindo subdomínios), útil também para Google Business/Analytics no futuro. **Arquivo HTML**: um arquivo tipo `google1234567890abcdef.html` com conteúdo específico fornecido pelo Google deve ficar acessível em `https://alfasci.com.br/google1234567890abcdef.html` — isso **precisa estar dentro do pacote publicado**, senão qualquer reenvio de FTP com "limpeza completa" (ver `MANUAL-UPLOAD-FTP.md`) apagaria o arquivo e a verificação pararia de funcionar até o arquivo ser reenviado manualmente. Para esse arquivo sobreviver ao empacotamento automatizado, ele precisaria: (a) existir fisicamente na raiz do projeto (não dentro de `dist-locaweb/`, que é sempre regenerado do zero) e (b) ser adicionado explicitamente ao array `ARQUIVOS_RAIZ` em `scripts/empacotar-locaweb.js` (hoje esse array só contém `['robots.txt', 'sitemap.xml']` — é uma allowlist manual, nada é copiado por padrão). **Recomendação prática**: usar verificação por DNS TXT, que não depende do pipeline de empacotamento e não some em reenvios. |
| Dados estruturados que já aparecem nos resultados do Google | ℹ️ ver abaixo | Hoje o site já tem base para: nome/telefone/área de atuação da empresa (via `ProfessionalService`), breadcrumbs (`BreadcrumbList` em todas as páginas), lista de serviços (`ItemList` em `servicos.html`), artigo com data de publicação (`Article` em `blog-sci/avcb-clcb.html`). **Faltando para um resultado mais rico**: `AggregateRating`/`Review` (não existem avaliações reais, não inventar), `logo` no `publisher` do artigo, `Person` com credencial CAU/SP estruturada, e FAQ rico (`FAQPage`) que está intencionalmente oculto. Nenhum resultado rico é garantido só por ter o schema — depende também de decisão editorial do Google. |
| Ordem de prioridade para solicitar indexação | ℹ️ ver abaixo | 1) `https://alfasci.com.br/` (home) — 2) `https://alfasci.com.br/servicos.html` — 3) `https://alfasci.com.br/contato.html` — 4) `https://alfasci.com.br/quem-somos.html` — 5) `https://alfasci.com.br/blog-sci.html` — 6) `https://alfasci.com.br/blog-sci/avcb-clcb.html`. **Não submeter**: `leads.html` (painel admin, não deve ser indexado) e `faq.html` (oculto por decisão de negócio, não gerado no build atual). |

---

## 4. Verificação no site publicado (Etapa 3 — somente GET/HEAD, leitura)

Rede disponível nesta sessão; todos os testes abaixo foram executados contra
`https://alfasci.com.br` real.

### 4.1 Status e redirecionamentos por URL do sitemap

| URL | Status |
|---|---|
| `https://alfasci.com.br/` | 200, sem redirect |
| `https://alfasci.com.br/servicos.html` | 200 (verificado em sessão anterior a este re-check; não houve mudança de arquivo desde então) |
| `https://alfasci.com.br/quem-somos.html` | 200 |
| `https://alfasci.com.br/blog-sci.html` | 200 |
| `https://alfasci.com.br/blog-sci/avcb-clcb.html` | 200 |
| `https://alfasci.com.br/contato.html` | 200 |

### 4.2 Variantes de host/esquema

| Variante | Status | Redirect final |
|---|---|---|
| `http://alfasci.com.br/` | 200 | nenhum (não redireciona para https) |
| `https://alfasci.com.br/` | 200 | — (canônica) |
| `http://www.alfasci.com.br/` | 200 | nenhum |
| `https://www.alfasci.com.br/` | 200 | nenhum (não redireciona para sem-www) |

**As 4 variantes servem o mesmo conteúdo sem nenhum redirecionamento.** Certificado SSL
confirmado válido para ambos os hosts (`openssl s_client` → SAN: `DNS:alfasci.com.br,
DNS:www.alfasci.com.br`), então não há erro de certificado em nenhuma combinação — o que
remove o "freio" que normalmente impediria o Bloco 2 de ser ativado (CLAUDE.md cita esse risco
como motivo para manter o bloco comentado "até confirmar HTTPS estável", mas `www` já tem
certificado válido hoje).

### 4.3 `robots.txt` / `sitemap.xml` / 404 / `leads.html`

- `robots.txt` e `sitemap.xml` publicados são **idênticos** aos arquivos locais (diff vazio).
- 404 real: `https://alfasci.com.br/pagina-que-nao-existe-xyz123.html` → `404`.
- FAQ oculto: `https://alfasci.com.br/faq.html` → `404` (não `200`, comportamento correto).
- `leads.html` ao vivo:
  - `X-Robots-Tag: noindex, nofollow, noarchive` ✅ presente
  - `Cache-Control: no-store` ✅ presente
  - `X-Frame-Options: DENY` ✅ presente
  - **Achado novo**: o header `Content-Security-Policy` aparece **duas vezes** na resposta
    (a CSP geral do Bloco 1 + a CSP restrita do `FilesMatch` de `leads.html`), em vez de a
    segunda substituir a primeira. Como múltiplos headers `Content-Security-Policy` são
    combinados pelo navegador como **interseção** (a política mais restrita de cada diretiva
    prevalece), o efeito prático não é inseguro — a CSP restrita já é um subconjunto mais
    apertado da geral — mas é um comportamento não intencional do `.htaccess` (a diretiva
    `Header set` dentro do `<FilesMatch>` deveria substituir, não se somar à anterior). Vale
    investigar/corrigir por limpeza, não por risco de segurança ativo.

### 4.4 Headers de segurança do site público

Confirmado via `curl -I https://alfasci.com.br/`: `Content-Security-Policy` completa presente
(inclui `script-src`, `style-src`, `connect-src https://api.web3forms.com`, `frame-ancestors`),
`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy:
strict-origin-when-cross-origin`, `Permissions-Policy`, `Cross-Origin-Opener-Policy:
same-origin`. **Ausente: `Strict-Transport-Security` (HSTS)** — não aparece em nenhuma
resposta, confirmando que o Bloco 2 do `.htaccess` está mesmo inativo em produção (não é uma
questão de cache/propagação).

### 4.5 Proteção de arquivos sensíveis (checagem crítica)

Apenas código de status e tamanho verificados; nenhum corpo de resposta foi impresso ou lido.

| Caminho | Status | Resultado |
|---|---|---|
| `/api/config.local.php` | 403 | ✅ protegido |
| `/api/config.example.php` | 403 | ✅ protegido |
| `/api/lib/db.php` | 403 | ✅ protegido |
| `/.htaccess` | 403 | ✅ protegido |
| `/.git/config` | 403 | ✅ protegido |
| `/database/schema.mysql.sql` | 404 | ✅ nem presente no servidor |

**Nenhum achado crítico.** Nenhuma dessas rotas retornou `200` com conteúdo — não há incidente
de segurança para reportar nesta verificação.

### 4.6 Performance ao vivo (Lighthouse)

**Não re-executado nesta etapa final de síntese** contra o domínio publicado (as medições de
Lighthouse feitas durante a investigação desta sessão foram contra o build local, replicando a
metodologia da auditoria original, não contra `https://alfasci.com.br` ao vivo). Portanto, para
efeito deste relatório: **o número "mobile 36/100" da auditoria original deve ser tratado como
ainda não revalidado contra produção** — a causa raiz (Tailwind via CDN, carregado e compilado
no navegador a cada visita) continua presente no código publicado (`cdn.tailwindcss.com` ainda
referenciado em todas as páginas públicas), então não há razão técnica para esperar uma melhora
significativa em produção, mas o número exato de produção não foi confirmado nesta sessão.
Recomenda-se rodar PageSpeed Insights (`pagespeed.web.dev`) diretamente contra
`https://alfasci.com.br/` e `https://alfasci.com.br/contato.html` para obter os números reais de
campo/laboratório — isso não depende de nenhuma ferramenta local e reflete a rede real dos
usuários.

---

## 5. Plano de ação atualizado (por prioridade)

### Alta prioridade (bloqueiam ou prejudicam diretamente o Search Console)

| # | Item | Arquivo | Esforço | Bloqueia cadastro? |
|---|---|---|---|---|
| 15 | Ativar Bloco 2 do `.htaccess` (consolidar as 4 variantes de URL em `https://alfasci.com.br`, sem `www`) | `publicacao/modelos/.htaccess` | Baixo (descomentar 3 blocos já escritos) + reenviar `.htaccess` via FTP | Não bloqueia o cadastro em si, mas **deve ser feito antes ou logo depois** — caso contrário o Google pode indexar duplicatas (`www`, `http`) antes do redirecionamento existir. Certificado já cobre `www`, então o risco documentado no CLAUDE.md para adiar esse bloco não se aplica mais. |
| 16 | Atualizar `lastmod` de `sitemap.xml` para refletir as mudanças reais de outubro/2026 | `sitemap.xml` | Baixo (edição manual, ou pequeno script) | Não bloqueia, mas sitemap desatualizado pode fazer o Google priorizar mal o re-crawl. Fazer antes de enviar o sitemap no Search Console. |
| 1-2 (da auditoria) | Migrar Tailwind CDN → CSS compilado (performance mobile) | build/CSS pipeline | Alto | Não bloqueia o cadastro, mas Core Web Vitals ruins afetam ranking e é um pré-requisito antes de investir em SEO de conteúdo. |

### Média prioridade

| # | Item | Arquivo | Esforço |
|---|---|---|---|
| 3 | Unificar nome da marca no JSON-LD para "Alfa Prev" em todas as 4 variantes encontradas (`index.html`, `quem-somos.html`, `blog-sci.html`, `blog-sci/avcb-clcb.html`, `contato.html`, `servicos.html`) | `src/pages/*.html` | Médio (tocar múltiplos arquivos-fonte + rebuild) |
| 4-5 | Adicionar `ProfessionalService` dedicado + credencial CAU/SP estruturada em `quem-somos.html` | `src/pages/quem-somos.html` | Médio |
| 6 | Adicionar `logo` ao `Article.publisher` | `src/pages/blog-sci/avcb-clcb.html` | Baixo |
| 13 | Propagar `sameAs` para o bloco `ProfessionalService` aninhado em `Person.worksFor` (`quem-somos.html`) | `src/pages/quem-somos.html` | Baixo |
| 17 (novo) | Corrigir header `Content-Security-Policy` duplicado em `leads.html` (fazer o `FilesMatch` substituir, não somar) | `publicacao/modelos/.htaccess` | Baixo |
| 18 (novo) | Avaliar remover o BOM UTF-8 do início de `robots.txt` | `robots.txt` | Baixo |
| 19 (novo) | Ativar HSTS (junto com o item 15, mesmo Bloco 2) com `max-age` inicial curto, conforme já planejado no próprio arquivo | `publicacao/modelos/.htaccess` | Baixo |

### Baixa prioridade

| # | Item | Arquivo | Esforço |
|---|---|---|---|
| 8 | Corrigir contraste `text-gray-400` no footer | `partials/footer.html` | Baixo |
| 10 | Atualizar `alt` do logo para terminologia "Engenharia de Incêndio" (12 ocorrências) | `partials/header.html`, `partials/footer.html` | Baixo |
| 20 (novo) | Avaliar `Disallow: /api/` em `robots.txt` (opcional, ganho marginal — ver §3) | `robots.txt` | Baixo |
| — | Criar `404.html` customizado e descomentar `ErrorDocument 404` | novo arquivo + `.htaccess` | Médio |

**Sugestão de divisão em prompts futuros:**
- Prompt A: "Consolidar URL canônica" (item 15 + 16, o par mais urgente, mexe só em `.htaccess`/`sitemap.xml`)
- Prompt B: "Tailwind compilado + revisão de CSP resultante" (itens 1-2 + 17)
- Prompt C: "Padronizar nome da marca + enriquecer JSON-LD" (itens 3, 4, 5, 6, 13)
- Prompt D: "Acessibilidade: contraste + alt + terminologia" (itens 8, 10)
- Prompt E: "HSTS + higiene de `.htaccess`/`robots.txt`" (itens 18, 19, 20, 404.html)

---

## 6. Checklist para o Artur (fora do site, sem necessidade de código)

**Antes de começar**, o item 15 (consolidar URL canônica) e o item 16 (atualizar `lastmod`)
do plano acima deveriam idealmente estar resolvidos primeiro — não são obrigatórios, mas reduzem
o risco de o Google indexar as variantes duplicadas antes do redirecionamento existir.

- [ ] Criar/usar uma conta Google (ideal: conta de uso profissional da empresa, não pessoal).
- [ ] Em https://search.google.com/search-console, criar uma propriedade do tipo **Domínio**
      (não "Prefixo de URL") para `alfasci.com.br` — isso cobre automaticamente `http`, `https`,
      com e sem `www` numa única propriedade.
- [ ] Verificar a propriedade via **registro TXT no DNS** da Locaweb (painel de DNS do domínio,
      não o painel de e-mail): o Search Console fornece um valor de texto para colar num novo
      registro TXT. **Não excluir nem editar nenhum registro existente** (principalmente `MX`,
      `SPF`, `DKIM`, `DMARC` — são os registros de e-mail já funcionando); apenas adicionar um
      registro TXT novo.
- [ ] Depois da verificação, enviar o sitemap: `Indexação → Sitemaps → https://alfasci.com.br/sitemap.xml`.
- [ ] Usar a ferramenta "Inspeção de URL" para solicitar indexação manual, nesta ordem (ver §3):
      home → servicos.html → contato.html → quem-somos.html → blog-sci.html → blog-sci/avcb-clcb.html.
      **Não solicitar indexação de `leads.html` nem `faq.html`.**
- [ ] Nos dias seguintes, acompanhar `Indexação → Páginas` para ver se alguma URL aparece como
      "Excluída" ou com erro — isso geralmente aparece só alguns dias depois do envio.
- [ ] Cadastrar o Google Business Profile como **"área de atendimento"** (sem endereço público,
      conforme decisão já registrada no `CLAUDE.md`) — não usar o tipo de cadastro que exige
      endereço físico visível.

---

## 7. Perguntas para o Artur

1. **Ativar o Bloco 2 do `.htaccess` agora?** O certificado já cobre `www` e as 4 variantes já
   respondem 200 de forma estável — tecnicamente o principal motivo para adiar (medo de quebrar
   acesso por falta de HTTPS em alguma variante) não se aplica mais. Confirmar se há algum outro
   motivo para continuar adiando antes de eu (ou outra sessão) preparar essa mudança.
2. **Head do `leads.html` com CSP duplicada**: isso foi intencional (ex: alguma necessidade de
   manter ambos os headers por algum motivo que eu não tenha contexto) ou é um efeito colateral
   não percebido da ordem dos blocos no `.htaccess`?
3. **`lastmod` do sitemap**: confirmar se devo (em um prompt futuro) atualizar manualmente para
   a data de cada mudança real de conteúdo, ou se prefere manter um processo diferente (ex: só
   atualizar na véspera de cada publicação).

---

## 8. Expectativas realistas

Cadastrar o site no Search Console e enviar o sitemap **não garante** posição em nenhuma busca,
nem prazo para indexação (pode levar de poucos dias a algumas semanas). Dados estruturados
(JSON-LD) **não garantem** resultados ricos nas buscas — o Google decide se e quando exibir
esses elementos, independentemente de o schema estar tecnicamente correto. Performance mobile
baixa (causada pelo Tailwind via CDN) pode continuar penalizando a visibilidade em buscas mesmo
depois do cadastro, até a migração para CSS compilado ser feita. O trabalho deste relatório
prepara o terreno técnico; não substitui tempo de maturação natural do site nos resultados de
busca nem outras práticas de SEO fora do escopo deste documento (backlinks, conteúdo novo
recorrente, Google Business Profile ativo).
