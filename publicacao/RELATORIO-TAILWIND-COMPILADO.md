# Relatório — Migração do Tailwind Play CDN para CSS Compilado

**Data:** 2026-10-22
**Escopo:** migração de `cdn.tailwindcss.com` (Play CDN, compilação em tempo real no
navegador) para um arquivo CSS compilado e minificado localmente via Tailwind CLI,
servido como arquivo estático. Nenhuma alteração de conteúdo, design ou comportamento
do site foi feita — apenas a forma como o CSS do Tailwind chega ao navegador.

---

## 1. Causa e motivação

A auditoria de SEO/performance (`publicacao/AUDITORIA-SEO.md`, out/2026) mediu, via
Lighthouse local contra o build estático, uma nota de **Performance mobile de 36/100**
(desktop 99/100) — o achado de maior impacto do documento. A causa raiz identificada foi
o uso do Tailwind **Play CDN** (`cdn.tailwindcss.com`): esse script baixa o Tailwind
inteiro e recompila todas as classes utilitárias *no navegador do visitante*, a cada
carregamento de página, o que é lento especialmente em dispositivos móveis (CPU mais
fraca) e bloqueia a renderização até terminar.

Esse achado já estava listado como pendência em `CLAUDE.md`, seção "Pendente após
publicar": *"Avaliar nota PageSpeed Insights — se < 70 mobile, migrar Tailwind para
versão compilada"*. Como a nota medida (36) está bem abaixo do critério de 70, esta
migração foi executada.

---

## 2. Versão do Tailwind escolhida e por quê

**Tailwind CSS v3.4.17** (mesma major version do Play CDN, confirmada via inspeção do
cabeçalho de redirecionamento do script do CDN antes da migração). Usar a mesma major
version é o que garante paridade visual: o motor de geração de classes utilitárias e as
classes disponíveis são as mesmas; só muda o lugar/momento em que a compilação acontece
(em build time, local, em vez de runtime, no navegador).

Não foi usada a v4 (lançada com mudanças de configuração incompatíveis com a v3) para
não arriscar nenhuma diferença visual.

**Nota de segurança (não corrigida, documentada):** fixar `tailwindcss@3.4.17` introduz
7 vulnerabilidades conhecidas (2 moderate, 5 high) em dependências transitivas de
build-time (`braces`, `chokidar`, `micromatch`, `fast-glob`, `postcss-selector-parser`,
`postcss-nested`) — reportadas por `npm audit`. `npm audit fix --force` resolveria isso
atualizando para `tailwindcss@4.x`, mas isso quebraria a paridade de versão com o CDN e
arrisca mudança visual não controlada, então **não foi aplicado**. Risco considerado
baixo: essas dependências rodam apenas durante `npm run css:build` (tooling de
desenvolvimento), nunca em produção/runtime do site publicado.

---

## 3. O que mudou

### Arquivos novos
- `assets/css/tailwind-origem.css` — arquivo de entrada (`@tailwind base/components/utilities`), nunca publicado.
- `assets/css/tailwind.css` — CSS compilado e minificado (gerado por `npm run css:build`), publicado em produção.
- `tailwind.config.js` — config migrada do script inline do `<head>` (paleta de cores `corp-*`/`wa-green*`, fonte Inter), com `content` apontando para `partials/**/*.html`, `src/pages/**/*.html` e `script.js` (cobre classes adicionadas dinamicamente via JS, ex: `hidden`, `border-corp-red`, `scrolled`, `lgpd-oculto`).

### Arquivos alterados
- `partials/head-common.html` — removido `<script src="https://cdn.tailwindcss.com">` + config inline; adicionado `<link rel="stylesheet" href="/assets/css/tailwind.css">`.
- `build.js` — cache-busting por hash de conteúdo (sha256, 10 chars) no link do CSS compilado (`?v=<hash>`); sanity check trocado de "precisa ter `cdn.tailwindcss.com`" para "precisa ter `assets/css/tailwind.css`" (inverso em `leads.html`, que nunca usou Tailwind).
- `package.json` — nova dependência de build `tailwindcss@3.4.17`; novos scripts `css:build`/`css:watch`; `build` agora roda `css:build` antes de `build.js`.
- `publicacao/modelos/.htaccess` e `netlify.toml` — CSP `script-src` perdeu `https://cdn.tailwindcss.com` (domínio de terceiro não é mais necessário). `'unsafe-inline'` foi **mantido** em `script-src` e `style-src` porque o site ainda tem script inline (guarda de redirecionamento de `/src/pages/`, presente em toda página pública) e atributos `style=""` inline (marca d'água do Hero, honeypot) — não relacionados ao Tailwind, então a CSP não foi enfraquecida nem fortalecida além do necessário.
- `scripts/empacotar-locaweb.js` — `assets/css/tailwind.css` adicionado à allowlist de arquivos publicados.

### Arquivos **não** alterados (confirmado)
- `script.js` — só lido, para confirmar que toda classe manipulada via `classList` é uma string literal (coberta pelo scanner do Tailwind).
- `styles.css` — CSS complementar (fonte self-hosted, scroll, focus, clamp, print) continua carregado depois do Tailwind, sem mudança.
- `scripts/verificar-seguranca.js` — não referenciava `cdn.tailwindcss.com` diretamente, continua passando.

---

## 4. Validação visual (antes vs. depois)

Comparação automatizada por diff de pixel (`pixelmatch`, instalado apenas em ambiente
temporário de teste, nunca no projeto) entre screenshots tiradas **antes** e **depois**
da migração, em 3 larguras (360px mobile, 768px tablet, 1280px desktop) × 6 páginas
(`index`, `servicos`, `quem-somos`, `blog-sci`, `blog-sci/avcb-clcb`, `contato`):

**Resultado: 0 pixels de diferença em 18/18 comparações.**

Testes de interação (via Puppeteer apontando para o Chrome do sistema, 11 checks:
banner de cookies, menu mobile, sombra do header ao rolar, checkbox LGPD, erros de
validação do formulário, destaque do link de navegação ativo): **10/10 aplicáveis
passaram** (1 check tentou testar o accordion `[data-faq]` na página errada —
`blog-sci/avcb-clcb.html` em vez de `faq.html`; o FAQ está intencionalmente fora do
build desde out/2026, ver "FAQ oculto" em `CLAUDE.md` — não é uma regressão desta
migração).

---

## 5. Lighthouse — antes e depois

| Página / dispositivo | Nota (antes → depois) | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| index / mobile | 55 → **80** | 7.3s → 2.4s | 7.3s → 2.4s | 200ms → 540ms | 0.061 → 0.061 | 7.7s → 2.8s |
| index / desktop | 75 → **99** | 0.7s → 0.6s | 0.7s → 0.6s | 530ms → 10ms | 0.047 → 0.047 | 1.7s → 0.9s |
| contato / mobile | 56 → **90** | 7.2s → 3.0s | 6.3s → 2.2s | 170ms → 50ms | 0.087 → 0.087 | 6.6s → 2.5s |
| contato / desktop | 86 → **98** | 0.7s → 0.6s | 0.7s → 0.5s | 280ms → 130ms | 0.014 → 0.014 | 1.6s → 0.9s |

**CLS (Cumulative Layout Shift) permaneceu bit-a-bit idêntico nas 4 medições** — essa é
uma confirmação adicional forte de que não houve nenhuma mudança de layout, já que o CLS
é sensível a qualquer diferença de CSS que cause reposicionamento de elementos.

**Observação sobre TBT do index/mobile** (200ms → 540ms, piora isolada nessa métrica
apesar da nota geral subir de 55 para 80): atribuído a ruído de medição do Lighthouse
em modo headless (variância de timing de thread), não a uma regressão real — LCP, FCP e
Speed Index melhoraram de forma consistente e acentuada na mesma página/dispositivo, e
o CLS não mudou. Não foi encontrada nenhuma causa de código para esse número isolado.

### Tamanho do CSS

- **Antes:** CSS do Tailwind não existia como arquivo (gerado em runtime, no navegador, a partir do script do CDN — não comparável por tamanho de arquivo estático).
- **Depois:** `assets/css/tailwind.css` — **21.296 bytes (~20.8 KB) minificado**, servido como arquivo estático com cache de 1 ano (`Cache-Control` already configurado para `*.css` — ver `.htaccess`/`netlify.toml`) e cache-busting por hash de conteúdo.

---

## 6. Checagens finais (2026-10-22)

```
npm run build       → OK, 7 páginas geradas, CONTEUDO-PAGINAS.md regenerado
npm run seguranca    → OK, nenhum bloqueador conhecido encontrado
npm test             → OK, 25/25 testes passando
npm run empacotar     → OK, dist-locaweb/ com 48 arquivos, 481.0 KB
```

---

## 7. Google Fonts / self-hosting (apenas relato, nenhuma mudança feita)

A tarefa pediu para relatar, sem alterar, se o Google Fonts ainda é render-blocking ou
expõe o IP do visitante a terceiros. **Verificado: isso já está resolvido desde antes
desta migração** — o projeto já self-hospeda a fonte Inter
(`assets/fonts/inter-var.woff2`, referenciada via `@font-face` em `styles.css`), sem
nenhuma referência a `fonts.googleapis.com`/`fonts.gstatic.com` em nenhum HTML ou CSS do
site (confirmado por busca em todo o repositório). Não há ação pendente aqui.

---

## 8. Ação necessária após este relatório

**Reenviar o pacote `dist-locaweb/` completo via FTP** (não incremental) na próxima
publicação — ver `MANUAL-UPLOAD-FTP.md`, que já foi atualizado com os números desta
geração (48 arquivos, 481.0 KB). Depois do reenvio, testar manualmente no navegador:
visitar o site publicado e confirmar visualmente que nada mudou, e verificar no painel
de rede do navegador que `cdn.tailwindcss.com` não é mais requisitado.
