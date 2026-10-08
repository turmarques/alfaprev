# Dashboard de Leads e Métricas — Alfa Prev

Documentação técnica do módulo de métricas anônimas, captura de leads e painel administrativo `/leads`, implementado sobre a infraestrutura Supabase já usada pelo formulário de contato.

---

## 1. Diagnóstico (estado antes desta implementação)

Levantamento feito em `CLAUDE.md`, `build.js`, `package.json`, `assets/js/config.js`, `script.js`, `supabase-schema.sql`, partials (`head-common.html`, `scripts.html`, `cookie-banner.html`), `src/pages/contato.html`, `netlify.toml`, `robots.txt`, `sitemap.xml` e todas as páginas públicas (`grep` por `wa.me` / `cta-whatsapp`).

### 1.1 Arquitetura atual do site
- Site estático multi-página, sem framework/bundler. `build.js` resolve `<!-- INCLUDE:nome -->` a partir de `/partials/*.html` dentro de `/src/pages/**/*.html`, gerando os arquivos finais na raiz do projeto (inclusive subpastas, ex. `blog-sci/`).
- `build.js` tem duas verificações de sanidade pós-build: toda saída deve conter `cdn.tailwindcss.com` e não pode conter `<!-- INCLUDE:` não resolvido. Isso quebraria uma página `/leads` com CSP estrita sem Tailwind CDN — **decisão:** adicionar exceção explícita no `build.js` para caminhos que começam com `leads/` (pular apenas o check do Tailwind, manter o check de INCLUDE não resolvido).
- `SKIP_FILES` em `build.js` já existe como mecanismo (hoje usado só para `faq.html`) para impedir a geração de um arquivo-fonte sem removê-lo do histórico. Não será necessário para `/leads` (ele deve ser gerado, só que sem os partials públicos).
- `generate-content-md.js` usa uma whitelist (`PAGE_ORDER`) para decidir o que entra em `CONTEUDO-PAGINAS.md` — bastou não adicionar `/leads` nela para a página ficar automaticamente fora do documento.
- `package.json` não declara nenhuma dependência nem lockfile. `@supabase/supabase-js` será a primeira dependência de verdade do projeto (ver §1.9).

### 1.2 Esquema Supabase atual (`supabase-schema.sql`)
- Tabela `leads` já existe com colunas básicas (nome, email, telefone, tipo_imovel, mensagem, consentimento_lgpd, criado_em) e um `CHECK` de status com valores diferentes dos pedidos agora (`novo|contatado|convertido|descartado` → precisa migrar para `novo|contatado|em_negociacao|fechado|perdido`).
- Única política RLS existente: INSERT anônimo condicionado a `consentimento_lgpd = true` (`anon_insert_com_consentimento`). Não há política de leitura para `anon` nem para `authenticated` — ou seja, hoje **nenhum papel consegue ler a tabela `leads` via API**, nem mesmo um admin autenticado (ausência de política de SELECT). Isso não é um risco de exposição, mas impede qualquer dashboard sem as mudanças desta implementação.
- Não existem as tabelas `admins`, `eventos`, `sais_diarios`, nem funções `registrar_evento`, `registrar_lead`, `dashboard_dados`, `listar_leads`, `limpar_eventos_antigos`, `is_admin()`.
- `assets/js/config.js` tem `SUPABASE_URL` e `SUPABASE_ANON_KEY` ainda como placeholders — confirmado que **nenhuma chave real está no repositório**.

### 1.3 Mecanismo atual de envio do formulário (`script.js`, módulo 7)
- Duplo canal: (1) `fetch` POST para Web3Forms (e-mail imediato, chave `ACCESS_KEY` ainda placeholder); (2) `fetch` POST direto para `${SUPABASE_URL}/rest/v1/leads` com header `Prefer: return=minimal`.
- **Achado positivo:** por já usar `return=minimal`, o envio atual não depende de `INSERT ... RETURNING` nem exige grant de `SELECT` para `anon` — ou seja, não há o risco comum de "insert com select liberado por engano" nesse ponto específico. Mesmo assim, a troca para a função `registrar_lead` (Parte 3) será feita porque ela adiciona validação server-side, normalização, consentimento obrigatório, rate limiting e novos campos (UTM, origem, sessão) — não porque o método atual seja inseguro nesse aspecto.
- Campos hoje enviados: `{nome, email, telefone, tipo_imovel, mensagem, consentimento_lgpd: true}`. IDs do formulário: `nome`, `email`, `telefone` (máscara `(00) 00000-0000`), `tipo-imovel` (select, label "Ocupação": `comercial|industrial|condominio_residencial|escritorios|outro`), `resumo` (textarea, label "Tipos de Serviços" → mapeado para a coluna `mensagem`), `lgpd` (checkbox).
- Honeypot duplo: campo de texto oculto `#hp-website` + checkbox nativo do Web3Forms `name="botcheck"`.
- Mensagens de sucesso/erro e bloqueio de reenvio durante o submit já existem e devem ser preservados na Parte 3.

### 1.4 Rastreamento existente (achado de risco/inconsistência)
- `script.js` módulo 9 contém **stubs mortos de `gtag`** (Google Analytics/GTM) em cliques de WhatsApp e submit do formulário — o script do GA nunca foi carregado em nenhuma página, então essas chamadas são no-ops silenciosos, mas **conflitam com o princípio "nunca GA/GTM" desta implementação**. `netlify.toml` também referencia `googletagmanager.com`/`google-analytics.com` no CSP, hoje morto (Netlify não é nem o host real — o host real é Locaweb/Apache, conforme `docs/SEGURANCA.md`). **Decisão:** remover os stubs `gtag` do `script.js` na Parte 3 e remover as referências a GA/GTM do `netlify.toml` na Parte 2/6, documentando a remoção.
- **Achado favorável:** todo link do WhatsApp do site (header desktop/mobile, footer, botão flutuante, 3× em `index.html`, `servicos.html`, 2× em `quem-somos.html` — 8 ocorrências no total) já usa a mesma URL `wa.me` e já tem uma classe `cta-whatsapp-*` única. Isso permite que o novo listener delegado de cliques em `metricas.js` funcione sem qualquer alteração de HTML.

### 1.5 Cookie banner e Política de Privacidade
- `partials/cookie-banner.html` já menciona genericamente "cookies e dados de navegação para fins de análise" — o texto precisa ser revisado para refletir com precisão que a nova coleta de métricas é **anônima e sem cookies** (usa apenas `sessionStorage`, nunca persiste entre visitas). Texto proposto fica pendente de revisão da Cassia/jurídico (§5).
- A Política de Privacidade (inline em `contato.html`, seção `#politica-privacidade`) ainda não cita o novo tratamento de dados de métricas nem o canal de solicitação de exclusão de lead — parágrafo proposto também pendente de revisão (§5).

### 1.6 `robots.txt` / `sitemap.xml`
- Ambos simples e sem qualquer referência a `/leads` hoje. **Decisão:** manter assim — `/leads` nunca deve ser citado em `robots.txt` nem em `sitemap.xml` (confiar em `noindex` + ausência total de link, não em "disallow", que na prática denuncia a existência da rota).

### 1.7 Design tokens e fontes
- Paleta Tailwind inline em `partials/head-common.html`: `corp-red #B91C1C`, `corp-red-dk #991B1B`, `corp-black #0F172A`, `corp-slate #1E293B`, `corp-gray #F8FAFC`, `wa-green #25D366`, `wa-green-dk #1DA851`.
- Fonte Inter hoje vem do Google Fonts CDN. Para `/leads` (CSP sem CDN de fonte), foi baixado localmente um único arquivo variável `assets/fonts/inter-var.woff2` (48 KB) que cobre os pesos 400–800 usados no site (confirmado por hash idêntico entre as 5 URLs de peso retornadas pela API do Google Fonts — é um único woff2 de fonte variável, não 5 arquivos estáticos). `assets/css/leads.css` declara um único `@font-face` com `font-weight: 400 800`.

### 1.8 Inconsistência de modelagem encontrada (decisão registrada, não corrigida por invenção)
- O prompt pede um indicador "leads por tipo de serviço", mas **não existe campo categórico de tipo de serviço** no formulário — o campo correspondente (`resumo`/`mensagem`) é um `<textarea>` livre. O único campo categórico é `tipo_imovel` ("Ocupação"). **Decisão:** não inventar um novo campo de formulário (fora do escopo autorizado e violaria a regra "não inventar" do `CLAUDE.md`). O dashboard implementa "leads por ocupação" e "leads por status"; a quebra por "tipo de serviço" é omitida e a omissão é registrada aqui como pendência de produto, não de bug.

### 1.9 Dependências novas e licenças
| Pacote | Versão fixada | Licença | Uso | Onde carrega |
|---|---|---|---|---|
| `@supabase/supabase-js` | `2.117.2` | MIT | Cliente Auth + REST/RPC no painel `/leads` | Copiado pelo build para `assets/vendor/supabase-js/`, servido local, **apenas** em `/leads` |

Nenhuma outra dependência de terceiros é usada. Gráficos do dashboard são SVG/CSS feitos à mão (sem biblioteca) — ver §3 Arquitetura. `pg_cron` (extensão do Postgres) é avaliado na Parte 1 para a limpeza automática de eventos antigos; se indisponível no plano gratuito, a limpeza é entregue como script SQL para execução manual (documentado em §4, passo do Artur).

### 1.10 Limites explícitos desta implementação
- Claude Code não tem acesso ao projeto Supabase real e **não executa SQL em produção** — todo SQL é entregue em arquivos (`supabase-schema.sql`, `supabase-admin.sql`) para o Artur rodar manualmente no painel.
- Nenhuma credencial, chave de serviço (`service_role`) ou e-mail de admin é commitado neste repositório. Apenas a chave pública (`anon`) pode aparecer em `assets/js/config.js`.
- Testes de RLS (`scripts/testar-supabase-rls.js`) rodam contra o projeto real somente quando o Artur fornecer `SUPABASE_URL`/`SUPABASE_ANON_KEY` via variável de ambiente — nunca hardcoded.

---

## 2. Arquitetura (visão geral)

- **Coleta pública:** `assets/js/metricas.js`, sem dependências, carregado com `defer` em todas as páginas públicas via `partials/scripts.html`. Dispara `page_view` (uma vez por carregamento) e `whatsapp_click` (listener delegado em `a[class*="cta-whatsapp"]`). Envia via `fetch({keepalive:true})` para a função SQL `registrar_evento`, agendado dentro de `requestIdleCallback`.
- **Formulário:** `script.js` chama a função SQL `registrar_lead` via RPC (`POST /rest/v1/rpc/registrar_lead`) no lugar do INSERT direto antigo.
- **Banco:** Postgres do Supabase com RLS em todas as tabelas, funções `SECURITY DEFINER` para escrita pública (validação + rate limit + hash de visitante sem guardar IP/UA crus) e `SECURITY INVOKER` para leitura administrativa (RLS garante que só `is_admin()` lê).
- **Painel `/leads` (`leads.html`, gerado de `src/pages/leads.html`):** página isolada, sem partials públicos (nenhum `<!-- INCLUDE:... -->`, nem Tailwind CDN, nem Google Fonts em runtime), CSS próprio em `assets/css/leads.css` com fonte Inter self-hosted (`assets/fonts/inter-var.woff2`). `build.js` tem uma exceção explícita (`ehPaginaLeads`) que: (a) não exige `cdn.tailwindcss.com` nessa página, e (b) falha o build se `cdn.tailwindcss.com` aparecer nela por engano — garante nos dois sentidos que a página nunca ganhe o Tailwind CDN de volta por um partial incluído sem querer.
  - **Login:** `<dialog id="login-dialogo">` nativo do HTML, aberto com `showModal()`, fundo (`#conteudo-painel`) marcado `inert` + borrado via CSS enquanto não autenticado (`assets/js/leads/app.js`).
  - **Bloqueio por tentativas:** `assets/js/leads/bloqueio.js` (módulo puro, testado — ver §7), 3 falhas → 5 minutos de bloqueio, contagem regressiva visível, também usado para o 429 nativo do Supabase Auth (`forcarBloqueio`). É só UX/dissuasão (ver §3).
  - **Autenticação:** `assets/js/leads/auth.js` usa `@supabase/supabase-js` (vendorizado em `assets/vendor/supabase-js/supabase.js`) com `signInWithPassword`, confirma `is_admin()` via RPC logo após login (login válido porém não-admin é deslogado e tratado como falha), sessão persistida em `sessionStorage` (não `localStorage` — não sobrevive ao fechar a aba), logout automático após 30 minutos de inatividade (mousemove/keydown/click/scroll/touchstart resetam o temporizador), DOM de leads limpo (`AlfaPrevGrade.limpar()`) antes de qualquer outra ação de logout.
  - **Dashboard:** `assets/js/leads/dashboard.js` chama `dashboard_dados(p_inicio, p_fim)` via RPC (padrão: últimos 30 dias) e renderiza indicadores + gráficos em SVG puro (linha para a série diária, barras horizontais para páginas/origens, listas para dispositivos/ocupação/status) — zero bibliotecas de gráfico.
  - **Grid de leads:** `assets/js/leads/grade.js` chama `listar_leads(...)` via RPC com busca/filtro/ordenação/paginação server-side, abre um `<dialog id="detalhe-dialogo">` por lead (atualiza `status`/`observacao` via `UPDATE` direto, permitido pela policy `admin_update_leads` com `is_admin()`), exclusão com `window.confirm` + `DELETE` (policy `admin_delete_leads`), exportação CSV via `assets/js/leads/csv.js` (mesma neutralização de injeção de fórmula usada em qualquer exportação). Toda renderização de dado vindo do servidor usa `textContent`, nunca `innerHTML`.
  - **Telefone:** `assets/js/leads/telefone.js` normaliza/formata telefones só para exibição e para montar o link `wa.me` no painel — a validação de segurança de verdade do telefone acontece em `registrar_lead` no banco.
  - **Bootstrap:** `assets/js/leads/app.js` liga todos os módulos acima, mostra o login ou restaura sessão (`AlfaPrevAuth.restaurarSessao()`) ao carregar a página.

---

## 3. Segurança e limites (o que é proteção real vs. o que é só UX)

- **Proteção real** está sempre no banco: RLS habilitado em `leads`, `eventos`, `admins`, `sais_diarios`; `REVOKE ALL` de `PUBLIC`/`anon`/`authenticated` seguido de grants mínimos; funções de escrita pública validam e limitam taxa; funções de leitura exigem `is_admin()`; `sais_diarios` não tem nenhuma política RLS, portanto é inacessível via API em qualquer papel.
- **UX/dissuasão, não segurança:** o bloqueio de 3 tentativas / 5 minutos no `/leads` é implementado em `localStorage` no navegador — qualquer pessoa pode limpar o armazenamento do navegador e tentar de novo. A proteção real contra força bruta é o rate limit nativo do Supabase Auth, a política de senha forte exigida na criação do usuário admin, e o fato de que, mesmo logado, um usuário não-admin (`is_admin()` falso) é imediatamente deslogado e recebe a mesma mensagem genérica de erro.
- `noindex`/ocultar o link de `/leads` é **obscuridade, não controle de acesso** — a página é protegida de verdade pelo Supabase Auth + RLS, não por estar "escondida".

---

## 4. Passo a passo que só o Artur pode executar no painel do Supabase

1. Exportar backup CSV dos leads atuais (se houver) antes de qualquer alteração de schema.
2. Rodar `supabase-schema.sql` no SQL Editor do painel.
3. Criar o usuário administrador em Authentication → Users (e-mail + senha forte).
4. Rodar `supabase-admin.sql` substituindo o placeholder de e-mail pelo e-mail real do admin.
5. Em Authentication → Settings: desabilitar cadastro público (signup) e provedores não usados; revisar Site URL, expiração de token e política mínima de senha; avaliar 2FA/CAPTCHA se disponível no plano gratuito (**confirmar no painel**).
6. Rodar `scripts/testar-supabase-rls.js` localmente com `SUPABASE_URL`/`SUPABASE_ANON_KEY` nas variáveis de ambiente.
7. Preencher `assets/js/config.js` apenas com `SUPABASE_URL` e a chave `anon` — nunca a `service_role`.
8. Testar o fluxo localmente (`server.ps1`) abrindo `http://localhost:8080/leads.html` (nunca `src/pages/leads.html` diretamente — a guarda de redirecionamento no topo do arquivo-fonte cuida disso se o engano acontecer via servidor HTTP).
9. Depois da publicação, testar `/leads.html` no domínio final e confirmar nas DevTools (aba Network → Headers) que `Content-Security-Policy`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer` e `Cache-Control: no-store` estão presentes na resposta. Se a hospedagem final for Apache em vez de Netlify, aplicar o modelo em `publicacao/modelos/leads.htaccess` (ver instruções no próprio arquivo) — **confirmar com o suporte da hospedagem se `mod_headers` está habilitado**.
10. Avaliar no painel do Supabase (Database → Extensions / Cron) se `pg_cron` está disponível no plano atual para agendar `limpar_eventos_antigos()` automaticamente (ver comentário `cron.schedule(...)` em `supabase-schema.sql`); se não estiver, rodar `select limpar_eventos_antigos();` manualmente de tempos em tempos.

---

## 5. LGPD

- **Inventário de dados pessoais:** nome, e-mail, telefone, ocupação, mensagem — coletados apenas de quem envia o formulário com consentimento explícito. Métricas de acesso (`eventos`) são anônimas e sem cookies; não há identificador persistente entre visitas.
- **Retenção:** eventos brutos por 180 dias (purga automática/manual — ver §1.9); leads permanecem até exclusão manual pelo admin.
- **Exclusão:** solicitações de exclusão de lead são atendidas pelo admin diretamente no grid do `/leads` (botão excluir com confirmação).
- **Texto proposto para o banner de cookies e Política de Privacidade** (pendente de revisão da Cassia/jurídico antes de publicar):
  > "Este site não usa cookies de rastreamento. Coletamos apenas métricas anônimas de navegação (páginas visitadas, cliques em WhatsApp, origem do acesso) sem qualquer identificador pessoal ou persistente entre visitas. Dados pessoais (nome, e-mail, telefone) só são coletados quando você envia o formulário de contato, com seu consentimento explícito, e usados exclusivamente para retorno comercial. Para solicitar a exclusão dos seus dados, envie e-mail para contato@alfasci.com.br."

---

## 6. Dependências e licenças

Ver tabela em §1.9. Resumo: zero dependências em páginas públicas; `@supabase/supabase-js` (MIT) é a única dependência de terceiros, usada exclusivamente em `/leads`.

---

## 7. Testes automatizados

- **Testes unitários (`node --test`, zero dependências):** `npm test` roda `test/*.test.js`.
  - `test/bloqueio.test.js` — 8 casos: estado inicial destravado, 3 falhas bloqueiam por 5 min, expiração do bloqueio, reset por sucesso, persistência entre instâncias com o mesmo storage (simula reload/nova aba), `forcarBloqueio` (429 do Supabase Auth), fallback em memória sem `localStorage`, formatação `mm:ss` (incluindo clamp de negativo para `00:00`).
  - `test/telefone.test.js` — 9 casos: remoção de não-dígitos, normalização de 10/11 dígitos sem DDI, não duplicação do `55`, normalização a partir de texto formatado, formatação de celular/fixo, fallback para dígitos crus em formato não reconhecido.
  - `test/csv.test.js` — 8 casos: neutralização de fórmula (`=`, `+`, `-`, `@`), valores normais inalterados, escape de separador/aspas/quebra de linha, neutralização combinada com escape, geração completa de CSV com BOM UTF-8 e `\r\n`, CSV vazio (só cabeçalho), separador customizado.
  - Total: 25 testes, todos passando (`node --test test/*.test.js` → `pass 25`, `fail 0`).
- **Build:** `npm run build` executado após toda alteração em `src/pages/` ou `partials/` — confirmado que `leads.html` é gerado sem `cdn.tailwindcss.com` e sem marcadores `<!-- INCLUDE: -->` não resolvidos (exceção `ehPaginaLeads` em `build.js` funcionando nos dois sentidos — ver §2).
- **Varredura de segredos:** `grep` manual por `eyJ` (prefixo de JWT) e `service_role` em todo o repositório (exceto `node_modules`) — nenhuma chave real encontrada, só os placeholders esperados em `assets/js/config.js` e os comentários explicativos em `scripts/testar-supabase-rls.js`/`supabase-admin.sql`.
- **Não executado nesta implementação (limitação a ser considerada pelo Artur antes de publicar):**
  - **Testes de UI ponta-a-ponta (ex: Playwright)** não foram adicionados — introduziriam a primeira dependência de teste de terceiros do projeto, o que não foi pedido explicitamente nem é coerente com o princípio "zero dependências/bundler" seguido até aqui para o site público. Recomendação: testar manualmente o fluxo de login/bloqueio/dashboard/grid no navegador antes de publicar, usando o roteiro do §4.
  - **Validação local do SQL via Postgres em Docker** não foi possível nesta sessão (`docker info` indica Docker Desktop instalado mas não iniciado). Validação alternativa feita: contagem de delimitadores `$...$` do PL/pgSQL em `supabase-schema.sql` (18, par/balanceado) e revisão manual de cada função. **Recomendação:** rodar `supabase-schema.sql` primeiro em um projeto Supabase de teste/staging (não direto em produção) antes do passo 2 do §4.
  - **Lighthouse/acessibilidade automatizados** não foram executados contra `leads.html` (precisaria de um servidor rodando + Chrome headless). Verificação manual feita: `<dialog>` nativo com `aria-labelledby`, `role="alert"`/`aria-live` no erro/contagem de login, `aria-busy` no dashboard durante carregamento, tabela com `data-rotulo` para o layout de cartões no mobile, `prefers-reduced-motion` respeitado em `assets/css/leads.css`.

---

*Este documento é atualizado sempre que o módulo de métricas/leads/painel administrativo mudar. Ver também `CLAUDE.md` para as regras gerais do projeto.*
