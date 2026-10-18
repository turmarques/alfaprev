# Dashboard de Leads e Métricas — Alfa Prev

Documentação técnica do módulo de métricas anônimas, captura de leads e painel administrativo `/leads`, implementado sobre uma API PHP + MySQL própria (hospedagem Locaweb "Hospedagem Compartilhada I").

---

## 1. Histórico

- **set/2026:** implementação original sobre Supabase (Postgres + RLS + PostgREST), com `@supabase/supabase-js` carregado só em `/leads` e chamadas RPC (`registrar_lead`, `registrar_evento`, `dashboard_dados`, `listar_leads`) diretamente do navegador.
- **out/2026 — migração para MySQL/PHP:** a hospedagem Locaweb contratada ("Hospedagem Compartilhada I") não oferece Postgres, só MySQL + PHP, então o acesso direto do navegador ao banco (PostgREST/RLS) deixou de ser possível. Toda a lógica que antes vivia em RLS e funções PL/pgSQL agora vive em `api/*.php` (PHP vanilla + PDO, sem Composer), nunca no navegador. `supabase-schema.sql` foi substituído por `database/schema.mysql.sql`; `assets/vendor/supabase-js/`, `assets/js/config.js` e `scripts/testar-supabase-rls.js` foram removidos; a dependência `@supabase/supabase-js` foi retirada de `package.json`. Nenhuma mudança de comportamento visível, design ou texto foi feita nesta migração — apenas a camada de dados.
- **out/2026 — 2FA (TOTP) obrigatório:** adicionado depois da migração para MySQL, como parte da auditoria de segurança completa (`docs/SEGURANCA.md`). Ver §2 e §3.

---

## 2. Arquitetura (visão geral)

- **Coleta pública:** `assets/js/metricas.js`, sem dependências, carregado com `defer` em todas as páginas públicas via `partials/scripts.html`. Dispara `page_view` (uma vez por carregamento) e `whatsapp_click` (listener delegado em `a[class*="cta-whatsapp"]`). Envia via `fetch({keepalive:true})` em POST JSON para `api/metrica.php` (same-origin), agendado dentro de `requestIdleCallback`. O endpoint nunca retorna erro visível — entradas inválidas ou acima do limite são ignoradas silenciosamente (`{ok:true}` sempre).
- **Formulário:** `script.js` (módulo 7b) envia POST JSON para `api/lead.php` no lugar do INSERT direto/RPC antigo. Honeypot (`armadilha`) responde `{ok:true}` sem gravar nada.
- **Banco:** MySQL/MariaDB (InnoDB, utf8mb4), schema em `database/schema.mysql.sql` (idempotente, só `CREATE TABLE IF NOT EXISTS`/`DROP PROCEDURE IF EXISTS` + `CREATE`, nunca `ALTER COLUMN ... TYPE` destrutivo). Tabelas: `leads`, `admins`, `eventos`, `sais_diarios`, `tentativas_login`. Toda validação, normalização, hash de visitante (sem guardar IP/UA crus — ver `api/lib/hash.php`) e rate limit (`api/lib/rate_limit.php`) acontece em PHP antes do `INSERT`, nunca em RLS/trigger — o MySQL da Locaweb não tem RLS nem `SECURITY DEFINER`.
- **Timestamps:** toda gravação usa `alfaprev_agora_utc()` (`api/lib/tempo.php`) — sempre UTC no banco. A conversão para `America/Sao_Paulo` (exibição no painel) acontece só na leitura, em `api/leads.php` (campo `contato_em`, já formatado `d/m/Y H:i`).
- **Painel `/leads` (`leads.html`, gerado de `src/pages/leads.html`):** página isolada, sem partials públicos (nenhum `<!-- INCLUDE:... -->`, nem Tailwind CDN, nem Google Fonts em runtime), CSS próprio em `assets/css/leads.css` com fonte Inter self-hosted (`assets/fonts/inter-var.woff2`). `build.js` tem uma exceção explícita (`ehPaginaLeads`) que: (a) não exige `cdn.tailwindcss.com` nessa página, e (b) falha o build se `cdn.tailwindcss.com` aparecer nela por engano.
  - **Login (`api/login.php` + `api/mfa-*.php`):** etapa 1 é e-mail + senha (`password_verify()` contra `admins.senha_hash`). Nunca autentica totalmente nessa etapa — sempre exige TOTP (RFC 6238, implementado à mão em `api/lib/totp.php`, sem Composer) a seguir: `api/mfa-cadastro.php` no primeiro acesso (gera o segredo, devolvido em texto puro só na resposta, nunca logado/persistido no front — sem QR code, CSP restrita sem `innerHTML` de terceiro) ou `api/mfa-verificar.php` nos acessos seguintes. Estado intermediário guardado na sessão PHP como `pre_admin_id`, só promovido a `admin_id` depois do código TOTP confirmado. `api/cancelar-mfa.php` limpa esse estado se o admin fechar o diálogo sem concluir.
  - **Sessão:** `api/lib/sessao.php` — cookie `HttpOnly`/`Secure`/`SameSite=Strict`, same-origin exigido em toda rota de escrita (`alfaprev_exigir_same_origin()`), CSRF via header `X-CSRF-Token` obtido em `GET /api/sessao-verificar.php` (`AlfaPrevAuth.csrfToken()` no front) e validado em toda rota POST administrativa (`alfaprev_exigir_csrf()`).
  - **Bloqueio por tentativas no servidor:** tabela `tentativas_login` (hash do IP + sal do dia, nunca IP em texto puro — `api/lib/hash.php`), 3 falhas / 5 min, imposto em `api/login.php` independente do bloqueio de UX client-side (`assets/js/leads/bloqueio.js`, `forcarBloqueio()` usado quando o servidor devolve 429).
  - **Dashboard:** `assets/js/leads/dashboard.js` faz `GET /api/dashboard.php?inicio=...&fim=...` (padrão: últimos 30 dias) e renderiza indicadores + gráficos em SVG puro (linha para a série diária, barras horizontais para páginas/origens, listas para dispositivos/ocupação/status) — zero bibliotecas de gráfico.
  - **Grid de leads:** `assets/js/leads/grade.js` faz `GET /api/leads.php` com busca/filtro/ordenação/paginação server-side, abre um `<dialog id="detalhe-dialogo">` por lead (atualiza `status`/`observacao` via `POST /api/leads.php` com `{action:'atualizar',...}`), exclusão via `POST /api/leads.php` com `{action:'excluir', id}` (`window.confirm` antes), exportação CSV via `assets/js/leads/csv.js` (mesma neutralização de injeção de fórmula OWASP). Toda renderização de dado vindo do servidor usa `textContent`, nunca `innerHTML`.
  - **Telefone:** `assets/js/leads/telefone.js` normaliza/formata telefones só para exibição e para montar o link `wa.me` no painel — a validação de segurança de verdade (`alfaprev_validar_telefone()`) acontece em `api/lead.php` no servidor.
  - **Bootstrap:** `assets/js/leads/app.js` liga todos os módulos acima, mostra o login ou restaura sessão (`AlfaPrevAuth.restaurarSessao()`, que confirma a sessão ativa chamando `sessao-verificar.php`) ao carregar a página.

---

## 3. Segurança e limites (o que é proteção real vs. o que é só UX)

- **Proteção real** está sempre no servidor PHP: `api/config.local.php` (gitignored) nunca é enviado ao navegador; toda validação/normalização/rate-limit roda em `api/lib/*.php` antes de qualquer `INSERT`; rotas administrativas exigem sessão PHP válida (`admin_id`) + 2FA confirmado (`admins.totp_confirmado = 1`) + CSRF válido; `sais_diarios` e `tentativas_login` não têm nenhum endpoint que as exponha diretamente.
- **UX/dissuasão, não segurança:** o bloqueio de 3 tentativas / 5 minutos exibido em `/leads` é implementado em `localStorage` no navegador (`assets/js/leads/bloqueio.js`) — qualquer pessoa pode limpar o armazenamento do navegador e tentar de novo. A proteção real contra força bruta é o rate limit de `api/login.php` (tabela `tentativas_login`), a política de senha forte do admin, e o 2FA (TOTP) obrigatório — login válido mas sem TOTP confirmado nunca chega a `admin_id`.
- `noindex`/ocultar o link de `/leads` é **obscuridade, não controle de acesso** — a página é protegida de verdade pela sessão PHP + verificação de admin no banco, não por estar "escondida".
- **Achado registrado em 2026-10-14, não corrigido:** `admins.totp_secret` é gravado em **texto
  puro** no MySQL (ver `database/schema.mysql.sql` — `VARCHAR(64) NULL`, sem nenhuma camada de
  cifragem em `api/mfa-cadastro.php`/`api/mfa-verificar.php`). Quem tiver acesso de leitura ao
  banco (ex.: via phpMyAdmin, ou um backup exportado) consegue ler o segredo TOTP de qualquer
  admin e gerar códigos válidos sem precisar do celular da pessoa — o 2FA deixa de proteger
  contra esse cenário específico (acesso ao banco), embora continue protegendo contra o cenário
  mais comum (senha roubada/adivinhada sem acesso ao banco). Cifrar esse campo exigiria guardar
  uma chave de cifragem em algum lugar fora do próprio banco (ex.: `api/config.local.php`) — o
  que é viável e sem dependência nova (`openssl_encrypt`/`openssl_decrypt`, nativo do PHP), mas
  é uma mudança de schema e de fluxo de login que não foi feita nesta revisão (fora do escopo
  pedido, que era só o utilitário de criação de admin). Registrado aqui como pendência técnica
  para decisão futura, não como bloqueador de publicação — o risco é mitigado pelo próprio
  controle de acesso ao phpMyAdmin (só o Artur tem a senha do painel Locaweb).

---

## 4. Passo a passo que só o Artur pode executar (hospedagem/banco)

> **Atualizado 2026-10-14:** `tools/gerar-hash-admin.php` foi reescrito com 3 modos (criar
> admin / trocar senha / zerar 2FA), todos só imprimindo um comando SQL para colar no
> phpMyAdmin — nunca executa nada sozinho. Guia completo com linguagem simples (o que cada
> peça faz, o que já pode ser feito agora vs. só depois do site publicado, e procedimentos de
> recuperação) em `publicacao/PUBLICACAO-LOCAWEB.md`, seções 8-A.5 e 8-A.6 — esta seção foi
> condensada para apontar para lá em vez de duplicar o texto.

1. Exportar backup CSV dos leads atuais (se houver) antes de qualquer alteração de schema.
2. No painel da Locaweb, criar o banco MySQL e rodar `database/schema.mysql.sql` via phpMyAdmin.
3. Copiar `api/config.example.php` para `api/config.local.php` (nunca commitado) e preencher host/usuário/senha/nome do banco + `sal_fixo` (string aleatória longa, só para o hash de login).
4. **Criar o admin**: rodar `php tools/gerar-hash-admin.php` localmente, opção **1**. O script
   pede o e-mail e a senha interativamente (senha nunca aparece na tela, digitada duas vezes
   para confirmar, nunca aceita como argumento de linha de comando) e imprime um `INSERT`
   pronto — colar na aba "SQL" do phpMyAdmin. A senha nunca é gravada em nenhum arquivo nem
   enviada a nenhum servidor; só o hash (bcrypt, via `password_hash()`) sai do script, dentro do
   comando SQL. Ver passo a passo completo, com recuperação de senha/2FA perdido, em
   `publicacao/PUBLICACAO-LOCAWEB.md` §8-A.5/8-A.6.
5. Testar o fluxo **depois que o site estiver publicado** (o cadastro do 2FA exige login real em
   `/leads.html`, não funciona em `src/pages/leads.html` nem localmente sem um servidor PHP
   configurado): login com e-mail/senha, resposta `mfa_cadastro_necessario`, cadastro do
   primeiro fator TOTP (`api/mfa-cadastro.php`) no app autenticador, confirmação do código.
6. Depois da publicação, testar `/leads.html` no domínio final e confirmar nas DevTools (aba Network → Headers) que `Content-Security-Policy`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer` e `Cache-Control: no-store` estão presentes na resposta — modelo em `publicacao/modelos/.htaccess` (bloco `/leads.html`).
7. Agendar a limpeza de dados antigos (`CALL limpar_dados_antigos(180, 1)`) — via tarefa agendada do painel Locaweb/cron do PHP se disponível (confirmar no painel; o Event Scheduler nativo do MySQL pode exigir privilégio `SUPER`, não liberado na Hospedagem Compartilhada I), ou manualmente de tempos em tempos via phpMyAdmin.
8. Rodar `npm test`, `npm run seguranca` e `npm audit` antes de qualquer publicação subsequente que toque `assets/js/`, `src/pages/`, `netlify.toml` ou `publicacao/modelos/`.
9. **Esqueceu a senha de um admin**: `tools/gerar-hash-admin.php`, opção **2** — imprime um
   `UPDATE` só para esse e-mail; o 2FA não é afetado.
10. **Perdeu o celular com o app autenticador**: `tools/gerar-hash-admin.php`, opção **3** —
    imprime um `UPDATE` que zera `totp_secret`/`totp_confirmado`; no próximo login o painel
    pede um novo cadastro de 2FA.

---

## 5. LGPD

- **Inventário de dados pessoais:** nome, e-mail, telefone, ocupação, mensagem — coletados apenas de quem envia o formulário com consentimento explícito. Métricas de acesso (`eventos`) são anônimas e sem cookies; não há identificador persistente entre visitas.
- **Retenção:** eventos/sais diários por 180 dias, tentativas de login por 1 dia (`CALL limpar_dados_antigos(180, 1)` — ver §4); leads permanecem até exclusão manual pelo admin.
- **Exclusão:** solicitações de exclusão de lead são atendidas pelo admin diretamente no grid do `/leads` (botão excluir com confirmação, `POST /api/leads.php` `{action:'excluir'}`).
- Texto do banner de cookies e da Política de Privacidade (`src/pages/contato.html`, seção `#politica-privacidade`) já reflete a coleta anônima sem cookies — nenhuma alteração necessária por esta migração.

---

## 6. Dependências e licenças

Zero dependências de terceiros em páginas públicas e em `/leads` desde a migração para MySQL/PHP (`@supabase/supabase-js` removido de `package.json`, `assets/vendor/supabase-js/` removido do repositório). Gráficos do dashboard são SVG/CSS feitos à mão. PHP vanilla (sem Composer) em toda a camada `api/`.

---

## 7. Testes automatizados

- **Testes unitários (`node --test`, zero dependências):** `npm test` roda `test/*.test.js` — 25 testes, todos passando.
  - `test/bloqueio.test.js` — 8 casos: estado inicial destravado, 3 falhas bloqueiam por 5 min, expiração do bloqueio, reset por sucesso, persistência entre instâncias com o mesmo storage (simula reload/nova aba), `forcarBloqueio` (429 de `api/login.php`), fallback em memória sem `localStorage`, formatação `mm:ss` (incluindo clamp de negativo para `00:00`).
  - `test/telefone.test.js` — 9 casos: remoção de não-dígitos, normalização de 10/11 dígitos sem DDI, não duplicação do `55`, normalização a partir de texto formatado, formatação de celular/fixo, fallback para dígitos crus em formato não reconhecido.
  - `test/csv.test.js` — 8 casos: neutralização de fórmula (`=`, `+`, `-`, `@`), valores normais inalterados, escape de separador/aspas/quebra de linha, neutralização combinada com escape, geração completa de CSV com BOM UTF-8 e `\r\n`, CSV vazio (só cabeçalho), separador customizado.
- **Build:** `npm run build` executado após toda alteração em `src/pages/` ou `partials/` — confirmado que `leads.html` é gerado sem `cdn.tailwindcss.com` e sem marcadores `<!-- INCLUDE: -->` não resolvidos (exceção `ehPaginaLeads` em `build.js`).
- **Varredura de segredos:** `npm run seguranca` (`scripts/verificar-seguranca.js`) confirma que `.gitignore` lista `api/config.local.php` e que `api/config.example.php` mantém os placeholders `SUBSTITUIR_*` em vez de credenciais reais.
- **Não executado nesta implementação (limitação a ser considerada pelo Artur antes de publicar):**
  - **Testes de UI ponta-a-ponta (ex: Playwright)** não foram adicionados — introduziriam a primeira dependência de teste de terceiros do projeto, o que não é coerente com o princípio "zero dependências/bundler" do site público. Recomendação: testar manualmente o fluxo de login/MFA/bloqueio/dashboard/grid no navegador antes de publicar, usando o roteiro do §4.
  - **Validação local da API PHP contra MySQL real** não foi possível nesta sessão (PHP CLI não disponível no ambiente de desenvolvimento usado). Validação alternativa feita: leitura manual de todo `api/*.php`/`api/lib/*.php` e revisão de cada `PREPARE`/`EXECUTE` contra `database/schema.mysql.sql`. **Recomendação:** testar a API contra uma instância MySQL de homologação (ou a própria Locaweb) antes de considerar o painel pronto para produção.
  - **Lighthouse/acessibilidade automatizados** não foram executados contra `leads.html` nesta sessão.

---

*Este documento é atualizado sempre que o módulo de métricas/leads/painel administrativo mudar. Ver também `CLAUDE.md` para as regras gerais do projeto.*
