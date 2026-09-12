# CLAUDE.md

Fonte única de contexto do projeto para o Claude Code. Leia este arquivo no início de cada sessão.

---

## Sobre o Negócio

**Empresa:** ALFA SEGURANÇA CONTRA INCÊNDIO LTDA (marca: **Alfa Prev**)
**Segmento:** Engenharia de prevenção e combate a incêndio — regularização, projetos técnicos, laudos, manutenção de equipamentos
**Público-alvo:** B2B e B2C — síndicos, gestores prediais, empresas industriais/comerciais, condomínios residenciais — em todo o Estado de São Paulo

**Tom de voz esperado no copy:**
- Técnico mas acessível: explica os termos sem ser condescendente
- Autoridade sem arrogância: a empresa tem credencial real (CAU/SP ativo, especialização PUC-MG)
- Urgência legítima: a regularização tem consequências reais (multa, interdição, risco de vida)
- Nunca soar como "IA gerando texto": evitar frases genéricas, buzzwords de marketing, adjetivos vazios
- **Tom institucional:** o site fala sempre em nome da empresa ("a Alfa Prev"), não em nome de uma pessoa específica — exceto na seção dedicada à responsável técnica, onde nome e credenciais devem permanecer como ativo de credibilidade. Fora dessa seção, usar "a Alfa Prev" como agente em vez de "nossa equipe" (que pode sugerir pluralidade inexistente) ou o nome da responsável como sujeito da empresa. Nunca inventar equipe, funcionários ou estrutura que não existem.

---

## Dados de Negócio (confirmados e reais — não inventar variações)

| Campo | Valor |
|---|---|
| Razão social | ALFA SEGURANÇA CONTRA INCÊNDIO LTDA |
| Nome fantasia | Alfa Prev |
| CNPJ | 62.088.739/0001-54 |
| Endereço | NÃO USAR ENDEREÇO EM LUGAR NENHUM DO SITE — o atendimento é 100% no local do cliente (a Alfa Prev vai até o imóvel). Nunca colocar mapa, endereço físico ou qualquer dado de localização da empresa no site. |
| Telefone/WhatsApp | +55 11 94566-5263 / (11) 94566-5263 |
| E-mail | cassia.marques@alfaseguranca.com |
| Instagram | @alfaprev_sci |
| Facebook | https://www.facebook.com/profile.php?id=61594085214860 |
| Horário | Segunda a Sexta das 09h às 17h (emergências fora do horário também atendidas) |
| Área de atendimento | Todo o Estado de São Paulo |
| Domínio | alfaprev-sci.com.br — registrado via Locaweb em set/2026, expira 08/09/2027. www vs. sem-www pendente (depende do hosting). Usar sempre `https://alfaprev-sci.com.br` no código até decisão final. |

**Responsável Técnica:**
- Nome: Cassia Élica Spinelli Marques
- Formação: Arquiteta e Urbanista, Especialista em Engenharia de Prevenção Contra Incêndio (PUC-MG)
- Registro: CAU/SP 00A1858351 (ativo)
- Experiência: 8 anos de atuação no setor
- Portfólio: +50.000 m² em projetos executados

**Convenção crítica:** Nunca inventar dados de negócio (depoimentos, certificações adicionais, números de projetos além dos já confirmados, datas, preços). Se não houver confirmação real, marcar como `[PENDENTE — CONFIRMAR COM CASSIA]`.

---

## Stack Técnica

- **HTML/CSS/JS vanilla** — zero framework, zero bundler, zero build step
- **Tailwind CSS** via CDN Play (`cdn.tailwindcss.com`) — gera CSS no browser em tempo real
- **Google Fonts** (Inter) via CDN com `preconnect`
- **Web3Forms** — envio do formulário por e-mail (chave em `script.js`)
- **Supabase** — banco de dados Postgres para armazenar leads (URL + anon key em `assets/js/config.js`)
- **GA4** — rastreamento planejado, script ainda não adicionado ao HTML

**Para rodar localmente:**
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
# Abre em http://localhost:8080
```
Edite qualquer arquivo e recarregue o navegador — sem compilação.

---

## Estrutura de Arquivos

```
alfaprev/
├── index.html              # Todo o conteúdo (single-page, multi-section)
├── script.js               # Toda a lógica JS (10 módulos — ver seção abaixo)
├── styles.css              # Complementos ao Tailwind (scroll, focus, print)
├── robots.txt              # Permite todos os crawlers; referencia sitemap
├── sitemap.xml             # Referencia https://alfaprev-sci.com.br/
├── netlify.toml            # Headers de segurança + configuração de cache (Netlify)
├── server.ps1              # Servidor local PowerShell
├── CLAUDE.md               # Este arquivo
├── AUDITORIA-SEGURANCA-SEO.md  # Resultado da auditoria pré-publicação
├── GUIA-PUBLICACAO-INICIANTE.md # Guia passo a passo para publicar o site
├── supabase-schema.sql         # Script SQL para criar tabela + RLS no Supabase
└── assets/
    ├── favicon.ico
    ├── favicon.svg
    ├── js/
    │   └── config.js           # SUPABASE_URL e SUPABASE_ANON_KEY (preencher!)
    ├── logo/
    │   ├── logo-original.png
    │   ├── logo-color.svg
    │   └── logo-white.svg      # Usada no header e footer (fundo escuro)
    └── images/
        ├── logo-dark-bg.jpg    # Usada como og:image (redes sociais)
        └── logo-light-bg.jpg
```

---

## Seções do Site (em ordem)

| ID | Nome | Conteúdo |
|---|---|---|
| `#inicio` | Hero | H1, CTAs WhatsApp e formulário, badges de credibilidade, 4 estatísticas |
| `#servicos` | Serviços | 6 cards de serviço + banner de CTA |
| `#legislacao` | Legislação & Prevenção | Por que regularizar + 4 riscos + CTA lateral sticky |
| `#responsavel-tecnica` | Responsável Técnica | Card da Cassia + 3 estatísticas de destaque |
| `#faq` | FAQ | 7 perguntas/respostas com accordion (Schema FAQPage) |
| `#contato` | Contato & Orçamento | Dados de contato + formulário de orçamento |
| `#localizacao` | Localização | Google Maps embed |
| `#politica-privacidade` | Política de Privacidade | Texto LGPD inline |

---

## Módulos do script.js

1. **Ano dinâmico** no rodapé (`#footer-year`)
2. **Shadow no header** ao rolar (classe `.scrolled` ativada com `scrollY > 20`)
3. **Menu mobile** (hambúrguer, ESC para fechar, aria-expanded)
4. **FAQ accordion** (abre um, fecha todos os outros)
5. **Máscara de telefone** `(00) 00000-0000` com suporte a paste
6. **Validação de formulário** (nome, e-mail, telefone, tipo de imóvel, resumo, LGPD)
7. **Envio do formulário** — duplo canal:
   - Verificação de honeypot (`#hp-website`) antes de qualquer requisição
   - `fetch` POST JSON para Web3Forms (e-mail imediato)
   - `fetch` POST JSON para Supabase REST API (lead gravado no banco)
   - Sucesso mostrado se qualquer um dos dois funcionar; botão bloqueado após sucesso
8. **Banner de cookies LGPD** (`localStorage` key: `alfaprev_cookie_pref`)
9. **Rastreamento GA4** (cliques WhatsApp por classe `.cta-whatsapp-*`, submit do form)
10. **Smooth scroll polyfill** para âncoras `a[href^="#"]`

---

## Design System

### Paleta de cores (Tailwind config inline no `index.html`)

| Token Tailwind | Hex | Uso |
|---|---|---|
| `corp-red` | `#B91C1C` | CTA primário, destaques, erros de formulário |
| `corp-red-dk` | `#991B1B` | Hover do corp-red |
| `corp-black` | `#0F172A` | Header, footer, seção final de CTA, cards escuros — **NÃO mais o Hero** (ver tema visual abaixo) |
| `corp-slate` | `#1E293B` | Seção Responsável Técnica, menu mobile |
| `corp-gray` | `#F8FAFC` | Fundo de seções alternadas (Serviços, Contato) |
| `wa-green` | `#25D366` | Botões WhatsApp |
| `wa-green-dk` | `#1DA851` | Hover dos botões WhatsApp |

### Tipografia
- **Família:** Inter (Google Fonts) — fallbacks: `system-ui`, `sans-serif`
- **Pesos usados:** 400, 500, 600, 700, 800

### Tema visual (atualizado set/2026)

**Fundo predominantemente branco — header/footer escuros.**

- **Header e footer:** `bg-corp-black` — mantêm fundo escuro, usam `logo-white.svg` (logo completo com texto branco)
- **Hero (Home) e seções de conteúdo:** `bg-white` ou `bg-corp-gray` (alternância sutil) — texto escuro
- **Seção final de CTA** (antes do rodapé): `bg-corp-black` — bloco de contraste intencional
- **Marca d'água no Hero:** `assets/logo/logo-icon-dark.svg` posicionado à direita com `opacity-[0.05]`
- **Padrão de grid SVG removido** do Hero (era `<svg><pattern id="grid">...`)
- Logos disponíveis: `logo-white.svg` (completo, fundo escuro), `logo-color.svg` (completo, fundo claro), `logo-icon-white.svg` (ícone apenas, elementos brancos, bg transparente), `logo-icon-dark.svg` (ícone apenas, elementos escuros, bg transparente)
- **Nota PARTE 0:** os JPGs `logo-white-helmet.jpg` e `logo-dark-helmet.jpg` não foram convertidos para PNG transparente (remoção de fundo por pixel não é possível no ambiente CLI). Usar os SVGs criados acima em substituição. Se necessidade de PNG, solicitar versão transparente à Cassia.

### Diretrizes visuais (evitar "cara de IA")
- Sem gradientes de múltiplas cores ou animações de entrada em scroll
- Hover apenas em CTAs e links — não em blocos inteiros de conteúdo
- Sombras sutis (shadow-sm), não exageradas
- Ícones inline SVG (sem biblioteca externa de ícones)
- Sem frases como "Somos líderes em..." ou "Soluções completas e integradas..."
- Estatísticas concretas e verificáveis (+8 anos, +50.000 m², CAU/SP 00A1858351)

---

## Configurações Chave (onde estão e o que fazer)

| Item | Onde fica | Status |
|---|---|---|
| Chave Web3Forms | `script.js` → `const ACCESS_KEY = 'SUA_CHAVE_WEB3FORMS'` | **PENDENTE** — substituir pela chave real |
| Supabase URL | `assets/js/config.js` → `SUPABASE_URL` | **PENDENTE** — preencher após criar projeto |
| Supabase Anon Key | `assets/js/config.js` → `SUPABASE_ANON_KEY` | **PENDENTE** — preencher após criar projeto |
| Schema SQL Supabase | `supabase-schema.sql` | **PENDENTE** — rodar no SQL Editor do painel |
| Script GA4 | Não adicionado ainda ao `index.html` | **PENDENTE** — adicionar após decidir conta GA4 |
| Measurement ID GA4 | Inexistente | **PENDENTE** |
| Canonical URL | Todas as páginas → `https://alfaprev-sci.com.br/[pagina]` | OK — atualizado para domínio real |
| Link do Facebook | `index.html` footer | OK — `https://www.facebook.com/profile.php?id=61594085214860` |
| og:image | `index.html` → `assets/images/logo-dark-bg.jpg` | Funcional; ideal criar imagem 1200×630 |
| Google Maps iframe | `index.html` seção `#localizacao` | OK — embed do endereço confirmado |

---

## Status Atual e Pendências (setembro 2026)

### Feito ✅
- HTML/CSS/JS completos, site funcional localmente
- Schema.org (ProfessionalService + FAQPage + BreadcrumbList em todas as páginas) com dados reais
- Meta tags de geolocalização (`geo.region`, `geo.placename`, `geo.position`) em todas as páginas via `head-common.html`
- robots.txt e sitemap.xml
- Banner de cookies LGPD
- Validação de formulário client-side
- Todos os links externos com `rel="noopener noreferrer"`
- Honeypot duplo no formulário (checkbox Web3Forms `botcheck` + campo texto `#hp-website`)
- netlify.toml com headers de segurança (incluindo `*.supabase.co` no CSP)
- Auditoria de segurança e SEO concluída
- Auditoria de conteúdo concluída (`AUDITORIA-CONTEUDO.md`)
- Integração Supabase implementada no `script.js` — aguarda configuração
- `supabase-schema.sql` pronto para rodar no painel do Supabase
- `assets/js/config.js` criado com placeholders
- Bloco de estatísticas do Hero corrigido definitivamente:
  - Texto encurtado: `+50.000 m²` → `+50 mil m²` (reduz risco de overflow em qualquer breakpoint)
  - `min-w-0` em cada item do grid (impede que o conteúdo force a coluna a crescer além do espaço disponível)
  - Classe `.hero-stat-number` em `styles.css` com `font-size: clamp(1.1rem, 4.5vw, 1.75rem)` + `white-space: nowrap` — a fonte encolhe automaticamente quando o espaço é menor (nunca usar `nowrap` sem `clamp()`, causa sobreposição)
  - `md:grid-cols-4` em vez de `sm:grid-cols-4` — posterga o layout de 4 colunas para 768px, onde cada coluna tem ≥162px (suficiente para todos os textos)
  - 4º bloco: "100%" / "Cobertura no Estado de SP"
- Legislação: conteúdo expandido com comparativo AVCB×CLCB, base legal (Decreto 56.819/2011 + Lei 13.425/2017), edificações que precisam, processo em 5 etapas (accordion), validade e renovação
- Serviços: classes de extintores (A, BC, ABC, CO₂, AB, K, D) e categorias de sinalização/iluminação adicionadas — marcadas com `<!-- REVISAR COM CASSIA -->` para validação
- FAQ: 10 perguntas (7 originais + 3 novas: vencimento/consequências, documentação, quais edificações)
- Tema visual atualizado: Hero e seções de conteúdo em fundo branco/claro; header/footer mantêm `bg-corp-black`
- Padrão de grid SVG removido do Hero
- Marca d'água do logo adicionada ao Hero (`logo-icon-dark.svg`, `opacity-[0.05]`)
- Criados `assets/logo/logo-icon-dark.svg` e `assets/logo/logo-icon-white.svg` (ícone apenas, bg transparente)
- `.hero-stat-number` em `styles.css`: cor atualizada de `#ffffff` para `#0F172A` (fundo agora branco)
- H1 do Hero atualizado para nova redação (PPCI + Assessoria AVCB/CLCB)
- Estatísticas do Hero: "8 anos" → "+8 anos"; legenda de m² inclui "vistorias"
- Badges do Hero: 5 no total (3 existentes + 2 novos); cores adaptadas para fundo claro
- Terminologia atualizada: "Engenharia de Segurança Contra Incêndio" substituindo "Prevenção" (com exceções documentadas)
- Página "Sobre" renomeada para "Quem Somos" (`quem-somos.html`) com novo texto institucional
- Todos os links internos e sitemap.xml atualizados para `quem-somos.html`

### Pendente antes de publicar 🔴
- [x] Registrar domínio — `alfaprev-sci.com.br` registrado via Locaweb (ativo, expira 08/09/2027)
- [ ] Escolher hospedagem (Netlify recomendado — `netlify.toml` já pronto)
- [ ] Criar projeto no Supabase, rodar `supabase-schema.sql` e preencher `assets/js/config.js`
- [ ] Configurar chave Web3Forms em `script.js`
- [ ] Testar envio real do formulário (e-mail + gravação no banco)

### Pendente na semana de publicação 🟠
- [ ] Cadastrar no Google Search Console + enviar sitemap.xml
- [ ] Criar/verificar Google Business Profile
- [x] Atualizar link do Facebook — `https://www.facebook.com/profile.php?id=61594085214860`

### Pendente após publicar 🟡
- [ ] Adicionar script GA4 com controle de consentimento
- [ ] Avaliar nota PageSpeed Insights — se < 70 mobile, migrar Tailwind para versão compilada
- [ ] Criar og:image dedicada (1200×630 px) e adicionar tags `og:image:width/height`
- [ ] Adicionar fotos reais de projetos/equipe

### Referência
Resultado completo da auditoria pré-publicação: `AUDITORIA-SEGURANCA-SEO.md`
Resultado da auditoria de conteúdo (set/2026): `AUDITORIA-CONTEUDO.md`
Guia de publicação passo a passo: `GUIA-PUBLICACAO-INICIANTE.md`

---

## Arquitetura Multi-página (adicionado em set/2026)

### Fluxo de trabalho — LEIA ANTES DE EDITAR

**NUNCA edite os arquivos HTML na raiz diretamente.** Eles são gerados pelo processo de build e serão sobrescritos na próxima vez que `npm run build` for executado.

**Para editar conteúdo:**
- Conteúdo de páginas → edite em `/src/pages/pagename.html`
- Header (navegação) → edite em `/partials/header.html`
- Footer → edite em `/partials/footer.html`
- Botão WhatsApp flutuante → edite em `/partials/whatsapp-float.html`
- Banner de cookies → edite em `/partials/cookie-banner.html`
- Tags de fontes, Tailwind config, CSS → edite em `/partials/head-common.html`
- Tags de script (config.js, script.js) → edite em `/partials/scripts.html`

**Após qualquer edição em `/src/pages/` ou `/partials/`:**
```bash
npm run build
```
Isso regera todos os HTMLs na raiz do projeto.

**OBRIGATÓRIO após o build:** abrir o arquivo gerado na raiz (ex: `index.html`) no navegador via Live Server — nunca o arquivo-fonte em `/src/pages/`. Os arquivos-fonte não têm o Tailwind CDN nem os partials expandidos; abri-los diretamente exibe o site sem nenhum estilo. O `build.js` agora inclui sanity checks que avisam no terminal se `cdn.tailwindcss.com` ou partials não resolvidos forem detectados na saída.

**Guarda automática nos arquivos-fonte:** cada arquivo em `/src/pages/` contém um script que detecta se está sendo servido via URL `/src/` e redireciona automaticamente para o arquivo gerado equivalente na raiz. Isso evita o site sem estilo caso o arquivo errado seja aberto acidentalmente.

**Commits pequenos e frequentes:** fazer commit ao fim de cada prompt/tarefa concluída — não acumular várias mudanças estruturais sem commitar. Isso torna trivial identificar via `git diff` ou `git bisect` qual mudança específica introduziu um problema. Padrão: commitar após cada sessão de edição que produz um resultado visual verificável.

### Estrutura de arquivos atualizada

```
alfaprev/
├── index.html              # GERADO — não edite diretamente
├── servicos.html           # GERADO — não edite diretamente
├── quem-somos.html         # GERADO — não edite diretamente (renomeado de sobre.html em set/2026)
├── legislacao.html         # GERADO — não edite diretamente
├── faq.html                # GERADO — não edite diretamente
├── contato.html            # GERADO — não edite diretamente
├── build.js                # Script de build (Node.js nativo — sem dependências)
├── package.json            # {"scripts": {"build": "node build.js"}}
├── partials/
│   ├── head-common.html    # Tailwind CDN, Inter font, tailwind.config, styles.css
│   ├── header.html         # Header com navegação completa (editar aqui)
│   ├── footer.html         # Footer com links e dados institucionais (editar aqui)
│   ├── whatsapp-float.html # Botão WhatsApp flutuante
│   ├── cookie-banner.html  # Banner LGPD de cookies
│   └── scripts.html        # Tags <script> de config.js e script.js
└── src/
    └── pages/
        ├── index.html         # Home: Hero + teasers de serviços, legislação e quem somos
        ├── servicos.html      # Todos os 6 serviços com descrições completas
        ├── quem-somos.html    # Texto institucional + responsável técnica + dados da empresa
        ├── legislacao.html    # AVCB, CLCB e importância da regularização
        ├── faq.html        # 7 perguntas/respostas com accordion (Schema FAQPage)
        └── contato.html    # Formulário de orçamento, mapa, contatos, privacidade
```

### Páginas e SEO

Cada página publicada deve ter, obrigatoriamente:
- `<title>` único com termo relevante ao tema da página
- `<meta name="description">` único (não copiar de outra página)
- Um único `<h1>` por página com palavra-chave principal
- `<link rel="canonical">` para a própria URL
- Open Graph / Twitter Card específicos da página
- JSON-LD adequado ao conteúdo (ver cada página em `/src/pages/`)

### Links internos entre páginas

- Serviços → Contato (CTA principal)
- Serviços → FAQ (dúvidas sobre qual serviço)
- Legislação → Serviços (como resolver)
- Legislação → FAQ (dúvidas relacionadas)
- FAQ → Contato (CTA principal)
- FAQ → Serviços / Legislação (relacionados)
- Quem Somos → Contato (CTA principal)
- Home → todas as páginas via teasers e nav

---

## Diretrizes de Conteúdo (adicionado em set/2026)

### Dupla intenção: transacional + informacional
Cada página deve equilibrar dois perfis de visitante:
- **Quem quer contratar** (já sabe o que precisa): CTAs claros, dados de credibilidade, formulário fácil de acessar.
- **Quem está pesquisando** (quer entender antes de contratar): conteúdo explicativo com profundidade técnica real, referências a normas e legislação.
Não cortar conteúdo informacional para "parecer mais limpo" — organizar com accordions/tabs em vez de remover.

### Fontes de conteúdo
- Todo texto escrito para o site deve ser original. Nunca copiar de sites concorrentes ou de publicações externas (plágio e conteúdo duplicado são penalizados pelo Google).
- Referências legais/normativas citadas: sempre mencionar a lei/decreto/norma correta. Se houver dúvida sobre atualização, adicionar nota de rodapé/comentário para verificação.
- Dados de negócio: usar exclusivamente os confirmados na seção "Dados de Negócio" deste arquivo. Não inventar números, datas, depoimentos ou estrutura.

### Regra: whitespace-nowrap em CSS Grid
Nunca usar `whitespace-nowrap` em um elemento de grid sem também garantir:
1. `min-width: 0` (ou Tailwind `min-w-0`) no item do grid — impede que a coluna auto-expanda para o conteúdo
2. Font-size fluida com `clamp()` para que o texto possa encolher quando necessário
Usar `whitespace-nowrap` sozinho causa sobreposição de texto nos elementos vizinhos.
A classe `.hero-stat-number` em `styles.css` implementa esse padrão corretamente.

### Contador de anos de experiência

O número de anos de experiência é atualizado automaticamente por JS via `script.js` (módulo 1). Todos os elementos visíveis no site usam `class="js-exp-years"` — o script calcula `new Date().getFullYear() - 2018` e preenche esses elementos no carregamento da página.

**Atualização manual anual obrigatória (todo início de ano):** as `<meta name="description">`, `<meta property="og:description">` e `<meta name="twitter:description">` de `src/pages/quem-somos.html` contêm o número hardcoded (`+8 anos`) pois são lidas por crawlers no HTML estático antes do JS executar. Buscar `+8 anos` nas meta tags de `src/pages/quem-somos.html` e atualizar o número manualmente, depois rodar `npm run build`.

### Accordions para conteúdo extenso
- Usar o padrão `[data-faq]` já implementado no `script.js` para qualquer accordion novo no site (o script detecta todos os elementos `[data-faq]` na página).
- IDs dos itens de accordion devem ser únicos por página (ex: `faq-1..10` na FAQ, `leg-step-1..5` na legislação).
- Nunca remover conteúdo do DOM para "simplificar" — recolher visualmente com accordion mantém o texto indexável pelo Google.

### Marcadores de revisão
- Conteúdo que precisa de validação da responsável técnica deve ter comentário HTML: `<!-- REVISAR COM CASSIA: [motivo] -->`
- Atualmente marcados: classes de extintores e categorias de sinalização em `servicos.html`.

### Convenção de terminologia (atualizado set/2026)

Usar **"Engenharia de Segurança Contra Incêndio"** (não "Engenharia de Prevenção Contra Incêndio") para posicionamento geral da empresa.

**Duas exceções que NÃO devem ser alteradas:**
1. **"Projeto(s) de Prevenção e Combate a Incêndio (PPCI)"** — nome técnico/legal oficial exigido pelo Corpo de Bombeiros.
2. **"Especialista em Engenharia de Prevenção Contra Incêndio (PUC-MG)"** — pendente confirmação com Cassia se o nome oficial da especialização usa "Segurança" ou "Prevenção". Marcado com `<!-- REVISAR COM CASSIA -->` em `src/pages/quem-somos.html` e `src/pages/index.html`.

### Página "Quem Somos" (renomeada de "Sobre" em set/2026)

- URL: `quem-somos.html` (era `sobre.html`)
- Arquivo fonte: `src/pages/quem-somos.html`
- Nav: link "Quem Somos" em header e footer
- Conteúdo: texto institucional completo (set/2026) + bloco da responsável técnica (Cassia)

### Badges do Hero (set/2026)

5 badges com ícone de check verde:
1. Projetos 100% Adequados às Normas Técnicas
2. Responsável Técnica Especializada (PUC-MG)
3. Atendimento Personalizado
4. Serviços em conformidade com as legislações vigentes
5. Assessoria completa para segurança do seu patrimônio

Decisão: não duplicar sentido entre badges 2 e outro sobre "especialista" — manter os 5 acima. Se a Cassia quiser dois badges distintos sobre a especialização, confirmar antes de alterar.

### Schema.org — padrão por tipo de página
- **Todas as páginas:** `BreadcrumbList`
- **Home:** `ProfessionalService`
- **Quem Somos:** `Person` (responsável técnica) + `ProfessionalService`
- **Serviços:** `ItemList` (listagem dos 6 serviços)
- **Legislação:** `Article`
- **FAQ:** `FAQPage` (manter sincronizado com os itens do accordion)
- **Contato:** `LocalBusiness`
