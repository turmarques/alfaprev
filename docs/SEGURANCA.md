# Auditoria de Segurança — Alfa Prev (out/2026)

Relatório da varredura completa de segurança solicitada em out/2026, cobrindo o site público
estático e o painel administrativo `/leads`. Este documento é o registro permanente dos achados,
correções aplicadas, limitações de ferramental e pendências que só podem ser resolvidas por uma
pessoa com acesso a sistemas externos (painel Locaweb, DNS, Web3Forms, GitHub).

**Atualizado em 2026-10-18:** o projeto migrou de Supabase (Postgres + RLS) para um backend MySQL
com API PHP vanilla própria (`api/*.php`, sem Composer), já que a hospedagem Locaweb contratada
não oferece Postgres. As seções abaixo foram revisadas e reescritas para descrever a arquitetura
real atual (sessão PHP nativa, `api/login.php`, `api/mfa-*.php`, coluna `admins.totp_confirmado`,
bloqueio de tentativas e limites de envio no MySQL), lidas diretamente do código em `api/` e
`api/lib/` — não da memória de versões anteriores deste documento. Achados e commits antigos que
descreviam o comportamento no Postgres/Supabase foram mantidos como registro histórico apenas onde
o número do commit é citado, mas o texto de cada achado foi atualizado para refletir o estado
atual do código.

**Convenção de honestidade deste relatório:** cada item é marcado como **Verificado** (testado e
confirmado), **Analisado** (revisão de código/config sem execução, por não haver ambiente seguro
para testar ativamente) ou **Não verificável neste ambiente** (ferramenta ou acesso ausente —
nunca um resultado inventado).

---

## 1. Escopo e método

### 1.1 Escopo
- Site público estático (`/src/pages/`, `/partials/`, `assets/`, `script.js`, `styles.css`,
  `build.js`, `generate-content-md.js`).
- Painel administrativo `/leads` (`src/pages/leads.html`, `assets/js/leads/*.js`,
  `assets/css/leads.css`).
- Banco de dados MySQL (`database/schema.mysql.sql`) e a API PHP que o acessa (`api/*.php`,
  `api/lib/*.php` — conexão PDO, hashing, rate limit, sessão, TOTP, validação de entrada).
- Configuração de servidor (`netlify.toml` como referência histórica, `publicacao/modelos/.htaccess`
  como configuração real de produção na Locaweb).
- Pipeline de build e empacotamento (`build.js`, `scripts/empacotar-locaweb.js`).
- Cadeia de suprimentos (dependências npm, bibliotecas vendorizadas, CDNs de terceiros).
- DNS e e-mail do domínio `alfasci.com.br` (apenas consulta passiva).

Fora do escopo (por decisão do prompt original ou por ausência de ambiente): qualquer teste
ativo contra o banco MySQL real, contra a hospedagem Locaweb real, ou contra qualquer
serviço de terceiro (Web3Forms, Google Maps). Nenhuma credencial real foi usada ou existe no
repositório (`api/config.local.php` é gitignored; só `api/config.example.php`, com placeholders,
é commitado).

### 1.2 Ferramentas usadas e limitações explícitas
| Ferramenta | Resultado | Observação |
|---|---|---|
| `npm audit` | **Verificado** — 0 vulnerabilidades | Zero dependências de terceiro em runtime desde a migração para MySQL/PHP (out/2026): a API (`api/*.php`) é PHP vanilla sem Composer e o painel `/leads` é JS vanilla sem biblioteca vendorizada. As dependências em `package.json` são só de build/teste local (nenhuma delas vai para o pacote publicado). |
| `eslint` + `eslint-plugin-security` | **Verificado** — 26 avisos, todos falsos positivos revisados manualmente | Instalado numa pasta descartável fora do projeto (`npm install` isolado) e apontado para o código real via `--resolve-plugins-relative-to`, já que `npx -p` não resolveu o plugin corretamente. |
| Varredura de segredos no histórico do git | **Verificado** (via `git log --all -p` + busca por padrões de chave/JWT) — nenhum segredo real encontrado | Gitleaks (binário) não está disponível neste ambiente; usado como equivalente manual. |
| DNS passivo (SPF/DMARC/MX/NS/A) | **Verificado** via `nslookup` | SPF e DMARC presentes e coerentes com o provedor de e-mail. |
| DNS passivo (CAA) | **Não verificável neste ambiente** | `nslookup` do Windows não suporta o tipo de registro `CAA` e `dig` não está instalado. Recomenda-se checar via painel da Locaweb ou `https://toolbox.googleapps.com/apps/dig/` (serviço externo, não executado aqui). |
| DKIM | **Não verificável neste ambiente** | Nenhum registro encontrado nos seletores comuns testados (`default`, `mail`, `locaweb`, `selector1`, `selector2`) — isso é inconclusivo, não uma confirmação de ausência, já que o seletor real pode ter outro nome. Confirmar no painel da Locaweb. |
| Testes dinâmicos (DAST) | **Não executado** | O prompt original limitou testes ativos a localhost; o Docker daemon não estava disponível neste ambiente para isolar um alvo de teste. Nenhum teste foi feito contra o MySQL/Locaweb reais. |
| Validação de HTML | **Analisado** via leitura manual de todas as páginas-fonte e parciais | Sem validador W3C automatizado neste ambiente (exigiria rede externa). |

---

## 2. Modelo de ameaças (resumo)

| Ativo | Ameaça principal | Mitigação existente/aplicada |
|---|---|---|
| Formulário de contato público | Spam/bot, XSS via campos livres, enumeração de leads | Honeypot duplo, `api/lead.php` com validação/normalização (`api/lib/validacao.php`) e rate limit no banco (`alfaprev_limite_lead_atingido()`, 5/hora por `visitante_hash`/`sessao_id`), saída sempre via `textContent` |
| Métricas anônimas (`metricas.js`) | Poluição de dados, fingerprinting de usuário | Hash diário não reversível (IP+UA+sal do dia), sem cookies, sem identificador persistente; `api/metrica.php` também aplica rate limit (`alfaprev_limite_evento_atingido()`, 30/min) |
| Painel `/leads` | Acesso não autorizado a dados pessoais (LGPD), força bruta de login, CSRF, XSS | Sessão PHP nativa (`api/lib/sessao.php`) com fluxo de login em duas fases (`api/login.php` + `api/mfa-cadastro.php`/`api/mfa-verificar.php`), 2FA/TOTP obrigatório via coluna `admins.totp_confirmado` (acesso só é liberado — `admin_id` só é gravado na sessão — depois do código TOTP correto), bloqueio de tentativas tanto client-side (UX) quanto no servidor (tabela `tentativas_login`, por hash de IP), CSRF token obrigatório (`X-CSRF-Token`) em toda requisição mutável, CSP própria restrita, `textContent` em 100% da grade |
| Banco de dados (MySQL) | Leitura/escrita não autorizada, injeção de SQL | MySQL não tem RLS — toda autorização e validação de entrada é responsabilidade da camada PHP (`api/lib/validacao.php` nas entradas, verificação de sessão/`admin_id` nos endpoints do painel); toda consulta usa PDO com prepared statements (nunca concatenação de SQL); credenciais reais só em `api/config.local.php`, gitignored |
| Configuração de servidor (produção) | Ausência de headers de segurança, exposição de arquivos internos | CSP/COOP mantidos no `.htaccess` real (ver §3), bloqueio de dotfiles corrigido |
| Cadeia de suprimentos | CDN de terceiro comprometido, dependência maliciosa | Zero dependências de terceiro em runtime (API PHP vanilla, painel `/leads` JS vanilla); Google Fonts removido do CSP/runtime; Tailwind CDN mantido como risco residual aceito e documentado (§5) |
| Repositório / pipeline de build | Segredo commitado, arquivo interno vazando para o pacote publicado | Varredura de histórico limpa; `scripts/empacotar-locaweb.js` já bloqueia `service_role`/placeholder/localhost; `scripts/verificar-seguranca.js` (novo, nesta auditoria) adiciona uma segunda camada de guarda |

---

## 3. Achados e correções aplicadas

| # | Severidade | Classe (OWASP) | Local | Achado | Correção | Commit |
|---|---|---|---|---|---|---|
| F1 | **Crítico** | A05:2021 – Security Misconfiguration | `publicacao/modelos/.htaccess` (arquivo real de produção na Locaweb) | O arquivo que de fato vai para produção **não tinha nenhuma Content-Security-Policy para as páginas públicas** — só `/leads` tinha CSP. `netlify.toml` tinha CSP correta, mas o Netlify não é o host real (ver `publicacao/PUBLICACAO-LOCAWEB.md`), então o gap estava invisível numa leitura superficial do repositório. | CSP equivalente à do `netlify.toml` adicionada ao `.htaccess` real, mais `Cross-Origin-Opener-Policy` em ambos os blocos (público e `/leads`). | `222761d` |
| F2 | **Alto** | A05:2021 – Security Misconfiguration | `publicacao/modelos/.htaccess` | `<FilesMatch "^\.">` no Apache compara apenas o **basename** da requisição, nunca o caminho completo — a regra bloqueava `/.env` na raiz mas **não bloqueava `/.git/config`** (basename `config`, sem ponto) nem nenhum arquivo dentro de uma pasta oculta. | Substituído por `RewriteRule` operando em `%{REQUEST_URI}` completo, com exceção explícita para `/.well-known/` (obrigatória para validação ACME/SSL). | `222761d` |
| F3 | **Alto** | A07:2021 – Identification and Authentication Failures | Login do painel `/leads` (`api/login.php`) | A verificação de administrador do painel `/leads` dependia apenas de e-mail/senha — sem segundo fator, uma credencial vazada ou fraca compromete integralmente os dados de leads (LGPD). | TOTP (2FA) obrigatório, imposto no servidor, não só na UI: `api/login.php` valida e-mail/senha e grava apenas `pre_admin_id` na sessão (nunca `admin_id`); retorna `mfa_cadastro_necessario` (primeiro acesso, sem `totp_secret` ainda) ou `mfa_codigo_necessario` (acessos seguintes). `api/mfa-cadastro.php` gera o segredo TOTP e o mantém só na sessão (`pre_admin_secret_temp`) até a confirmação. `api/mfa-verificar.php` valida o código de 6 dígitos (RFC 6238, `api/lib/totp.php`); só depois do código correto é que `totp_secret`/`totp_confirmado = 1` são gravados em `admins` (primeiro acesso) e `alfaprev_finalizar_login_admin()` regenera o ID de sessão e grava `admin_id` + `csrf_token` — ou seja, a sessão só vira "autenticada como admin" depois do segundo fator, nunca antes. `api/cancelar-mfa.php` permite abortar o fluxo. | `a2de773` |
| F4 | **Médio** | A03:2021 – Injection (XSS de baixo risco) | `src/pages/leads.html` (botão "Fechar" do diálogo de detalhe) | Handler `onclick="document.getElementById(...).close()"` inline — inconsistente com a convenção do projeto (zero `onclick` inline) e o tipo de padrão que a própria CSP do painel (`script-src 'self'`, sem `'unsafe-inline'`) deveria impedir. Na prática já era bloqueado pela CSP (o botão não funcionava), então era também um bug funcional. | Handler movido para `addEventListener` em `assets/js/leads/grade.js`, elemento identificado por `id`. | `96751c3` |
| F5 | **Médio** | A08:2021 – Software and Data Integrity Failures (cadeia de suprimentos) | `partials/head-common.html`, `netlify.toml`, `.htaccess` | Fonte Inter carregada via `fonts.googleapis.com`/`fonts.gstatic.com` — dependência de terceiro em tempo de execução (disponibilidade, privacidade de IP do visitante, superfície de CSP extra) para as páginas públicas, enquanto `/leads` já usava uma cópia local. | Fonte variável self-hosted (`assets/fonts/inter-var.woff2`, já existente para `/leads`) adotada também nas páginas públicas via novo `@font-face` em `styles.css`; `<link>`/`preconnect` do Google Fonts removidos; CSP atualizada para não precisar mais desses domínios em `style-src`/`font-src`. | `222761d` |
| F6 | **Baixo** | A05:2021 – Security Misconfiguration | `netlify.toml`, `.htaccess` (comentado) | `Strict-Transport-Security` já estava configurado com `includeSubDomains; preload` antes de o HTTPS em produção ter sido confirmado funcionando de forma estável — `preload` é quase irreversível (fica em cache nos navegadores por meses). | HSTS escalonado: `max-age=21600` (6h), sem `includeSubDomains`/`preload`, com plano documentado de aumento gradual após confirmação de estabilidade. Bloco do `.htaccess` mantido comentado até a ativação do bloco de força-HTTPS (`BLOCO 2`). | `222761d` |
| F7 | **Baixo** (defesa em profundidade) | A05:2021 – Security Misconfiguration | `netlify.toml`, `.htaccess` | `X-Frame-Options` já mitigava clickjacking, mas `frame-ancestors` (CSP) é o padrão mais moderno e tem suporte mais amplo/granular. | `frame-ancestors 'self'` adicionado à CSP pública; `/leads` já tinha `frame-ancestors 'none'`, mantido. | `222761d` |
| F8 | Informativo (sem CVE, risco residual aceito) | — | Guarda de regressão | Nenhum destes achados tinha um mecanismo automatizado que impedisse reintrodução futura (ex: alguém reintroduzir um `onclick` inline numa edição futura). | Criado `scripts/verificar-seguranca.js` (`npm run seguranca`) — falha o build se qualquer um dos padrões acima (ou correlatos: `innerHTML` não-literal, `eval`, chave `service_role`, `target=_blank` sem `rel`, `/leads` em `robots.txt`/`sitemap.xml`, perda de `noindex`/CSP em `leads.html`, header ausente) for reintroduzido. | `fc07993` |

### 3.1 Itens revisados e confirmados como já corretos (sem correção necessária)
- **Injeção/XSS no site público:** todas as páginas-fonte e parciais revisadas (`header.html`,
  `footer.html`, `cookie-banner.html`, `whatsapp-float.html`, `contato.html`, `index.html`) —
  nenhum `innerHTML`/`eval`/handler inline com dado não confiável; todos os links externos usam
  `rel="noopener noreferrer"`; JSON-LD contém apenas dados estáticos confiáveis, nunca entrada do
  usuário refletida.
- **Painel `/leads`:** toda a grade de leads (`grade.js`) e o dashboard (`dashboard.js`) usam
  exclusivamente `textContent`/`createElement` para exibir dados do banco — nenhum vetor de XSS
  armazenado via nome/e-mail/mensagem de lead, mesmo que um atacante conseguisse inserir um lead
  malicioso através do formulário público.
- **CSV export (`csv.js`):** neutralização de injeção de fórmula (OWASP) já implementada e
  testada (`test/*.test.js`) antes desta auditoria — valores começando com `=`, `+`, `-`, `@` são
  prefixados antes da exportação.
- **Controle de acesso ao banco:** MySQL não tem RLS — a autorização é feita pela camada PHP.
  `api/lead.php` (inserção pública de lead) só aceita o que passa por `api/lib/validacao.php`
  (nome, e-mail, telefone, ocupação, mensagem, todos com limites de tamanho via
  `CHECK (char_length(...))` no schema); os endpoints do painel (`api/dashboard.php`,
  `api/leads.php`, `api/logout.php`) exigem sessão com `admin_id` já presente (gravado só depois
  do 2FA, ver F3) antes de ler ou escrever qualquer dado; nenhum endpoint aceita SQL ou nome de
  coluna vindo da requisição.
- **Segredos:** nenhuma senha, hash ou token real encontrado no código-fonte atual nem no
  histórico do git. As credenciais reais do MySQL ficam só em `api/config.local.php`
  (gitignored); o repositório só commita `api/config.example.php`, com placeholders
  `SUBSTITUIR_*`. Achado não corrigido nesta auditoria: `admins.totp_secret` é gravado em texto
  puro no MySQL (sem cifragem) — ver `docs/DASHBOARD-LEADS.md` §3 para a análise completa e a
  opção de correção.
- **Supply chain (dependências):** zero dependências de terceiro em runtime — a API (`api/*.php`)
  é PHP vanilla sem Composer, e o painel `/leads` é JS vanilla sem biblioteca vendorizada. As
  dependências em `package.json` (`npm audit` limpo) são só de build/teste local e não vão para
  o pacote publicado (`npm run empacotar`).
- **Rate limiting / anti-abuso:** `alfaprev_limite_lead_atingido()` (5 leads/hora) e
  `alfaprev_limite_evento_atingido()` (30 eventos/minuto), ambas em `api/lib/rate_limit.php`,
  chaveadas por `visitante_hash` ou `sessao_id`; bloqueio de tentativas de login aplicado em duas
  camadas: client-side (`assets/js/leads/bloqueio.js`, só UX) e server-side (tabela
  `tentativas_login`, 3 tentativas em 5 minutos, chaveada por hash de IP via
  `alfaprev_hash_login()` — nunca IP cru).

---

## 4. Lista priorizada — "só o Artur pode fazer isso"

Itens que exigem acesso a um painel/sistema externo e não podem ser feitos pelo Claude Code:

1. **Cadastrar o fator TOTP do admin** — acessar `/leads.html` após publicar, logar com
   e-mail/senha e seguir a tela de cadastro (app autenticador obrigatório) **antes** de divulgar
   a URL do painel para qualquer pessoa. Sem isso, a sessão nunca recebe `admin_id` e o acesso ao
   painel fica bloqueado (ver F3).
2. **Confirmar registro CAA do DNS** (`alfasci.com.br`) — ferramenta local não suporta esse tipo
   de consulta; verificar no painel da Locaweb ou com uma ferramenta de DNS externa.
3. **Confirmar seletor DKIM real** no painel da Locaweb — os seletores comuns testados não
   retornaram registro, o que é inconclusivo, não uma confirmação de ausência.
4. **Rotacionar/criar a chave Web3Forms** registrada com `contato@alfasci.com.br` (pendência já
   documentada em `CLAUDE.md`, não uma vulnerabilidade desta auditoria).
5. **Confirmar visibilidade do repositório GitHub** (privado/público) e revisar colaboradores com
   acesso — fora do alcance de qualquer ferramenta local.
6. **Ativar HSTS completo** (`includeSubDomains`/`preload` e aumento gradual do `max-age`) somente
   depois de confirmar, em produção, que HTTPS funciona de forma estável em todas as rotas e
   subdomínios relevantes (webmail/FTP da Locaweb, se aplicável).
7. **Confirmar `pdo_mysql` habilitado** no painel da hospedagem Locaweb e validar a conexão real da
   API com o banco em produção (ex: enviando um lead de teste pelo formulário público e
   confirmando que ele aparece em `/leads`) — não é possível testar isso neste ambiente local sem
   acesso ao MySQL real da hospedagem.

---

## 5. Riscos residuais aceitos (decisão documentada, não corrigidos nesta auditoria)

- **`script-src 'unsafe-inline'` na CSP pública:** necessário para o `tailwind.config` inline em
  `head-common.html` e para os blocos JSON-LD por página. Uma CSP baseada em hash/nonce exigiria
  mudar o pipeline de build (gerar hash a cada build) e está fora do escopo desta auditoria —
  documentado aqui como risco residual aceito, mitigado pelo fato de o site não ter nenhum ponto
  de injeção de conteúdo de usuário nas páginas públicas (ver §3.1).
- **Tailwind via CDN Play (`cdn.tailwindcss.com`) em runtime:** dependência de terceiro já
  identificada como a maior causa da nota baixa de performance mobile (`publicacao/AUDITORIA-SEO.md`).
  A migração para Tailwind CLI compilado é uma mudança de build maior, que precisa de teste de
  regressão visual (pixel a pixel) antes de ser aplicada — deliberadamente deixada de fora desta
  auditoria de segurança (que não deve introduzir mudanças visuais).
- **Google Maps embed (`frame-src`) e Web3Forms (`connect-src`/`form-action`):** únicos terceiros
  que permanecem na CSP pública — ambos necessários para funcionalidades centrais do site
  (localização e envio de formulário por e-mail) e sem alternativa self-hosted razoável.

---

## 6. Manutenção contínua

- Rodar `npm audit`, `npm test` e `npm run seguranca` antes de qualquer commit que toque
  `assets/js/`, `src/pages/`, `netlify.toml` ou `publicacao/modelos/`.
- Revisar este documento sempre que uma nova integração de terceiro for adicionada (atualizar
  CSP, tabela de dependências em `docs/DASHBOARD-LEADS.md` §1.9, e a lista de riscos residuais).
- Qualquer novo campo de formulário ou nova tabela no banco exige validação explícita na camada
  PHP (`api/lib/validacao.php`) antes de ir para produção — o MySQL não tem RLS; nunca assumir que
  uma tabela nova está protegida sem que o endpoint que a acessa valide explicitamente o que pode
  ler/escrever.

## 7. Checklist de resposta a incidente (LGPD)

Caso haja suspeita de acesso não autorizado aos dados de leads (nome, e-mail, telefone):
1. Revogar imediatamente a sessão do admin comprometido e trocar a senha: no servidor, remover/
   invalidar os arquivos de sessão PHP ativos (ou reiniciar o PHP-FPM/Apache, se o painel da
   Locaweb permitir, para encerrar todas as sessões em memória) e usar
   `tools/gerar-hash-admin.php` (opção 2) para gerar o `UPDATE` de nova senha, colado na aba SQL
   do phpMyAdmin.
2. Verificar a tabela `tentativas_login` no phpMyAdmin para identificar horários de tentativas de
   acesso suspeitas (lembrando que o campo é um hash de IP, não o IP em si — não é possível
   identificar o IP de origem a partir dele, só correlacionar com os horários de acesso
   observados em outros logs da hospedagem, se disponíveis).
3. Avaliar, com apoio jurídico, se o incidente se qualifica como violação de dados pessoais sob a
   LGPD (Art. 48) — nesse caso, há prazo para comunicação à ANPD e aos titulares afetados.
4. Depois de conter o incidente, usar `tools/gerar-hash-admin.php` (opção 3) para zerar o 2FA do(s)
   admin(s) afetado(s) (`totp_secret = NULL`, `totp_confirmado = 0`), forçando novo cadastro de
   TOTP no próximo login.

---

*Documento gerado em 2026-10-08 como parte da varredura completa de segurança solicitada em
out/2026. Ver commits `96751c3`, `222761d`, `a2de773`, `fc07993` para o detalhe linha-a-linha de
cada correção. Revisado em 2026-10-18 para substituir as descrições da arquitetura Supabase/
Postgres (já migrada para MySQL/PHP) pela arquitetura real atual, lida diretamente do código em
`api/` e `api/lib/`.*
