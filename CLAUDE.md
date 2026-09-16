# CLAUDE.md

Fonte única de contexto do projeto para o Claude Code. Leia este arquivo no início de cada sessão.

---

## Sobre o Negócio

**Empresa:** ALFA SEGURANÇA CONTRA INCÊNDIO LTDA (marca: **Alfa Prev**)
**Segmento:** Engenharia de prevenção e combate a incêndio — regularização, projetos técnicos, laudos, manutenção de equipamentos
**Público-alvo:** B2B e B2C — síndicos, gestores prediais, empresas industriais/comerciais, condomínios residenciais — em todo o Estado de São Paulo

**Tom de voz esperado no copy:**
- Técnico mas acessível: explica os termos sem ser condescendente
- Autoridade sem arrogância: a empresa tem credencial real (CAU/SP ativo, especialização em Engenharia de Incêndio)
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
- Formação: Arquiteta e Urbanista, Especialista em Engenharia de Incêndio
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
| `#blog-sci` | Blog SCI | Hub de artigos sobre Engenharia de Incêndio, normas e regularização |
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
- Terminologia atualizada: "Engenharia de Incêndio" como denominação padrão em todo o site (substituindo tanto "Segurança" quanto "Prevenção")
- PUC-MG removida de todas as menções ao site (credential simplificada para "Especialista em Engenharia de Incêndio")
- Página "Sobre" renomeada para "Quem Somos" (`quem-somos.html`) com novo texto institucional
- Todos os links internos e sitemap.xml atualizados para `quem-somos.html`
- Seção "Legislação" renomeada para "Blog SCI" — hub e artigos migrados para `blog-sci.html` / `blog-sci/`
- Nav (header/footer) e sitemap.xml atualizados para blog-sci
- Presença física no local: linguagem suavizada de "vai até você" para "quando necessário, realiza visita técnica ao imóvel"
- Extintores: descrição reescrita, classes de incêndio atualizadas (A, B, C, D, K)
- Sinalização: renomeada para "Sinalização de Emergência", iluminação de emergência removida da lista de sub-serviços
- Teste Hidrostático: renomeado para "Teste hidrostático de mangueiras de incêndio"
- FAQ: frequência de manutenção de mangueiras agora sem prazo fixo; PPCI com nomenclatura correta
- Citações legais/normativas corrigidas (set/2026): Decreto 56.819/2011 → 69.118/2024; Lei 16.213/2016 (inexistente) → LC 1.257/2015; NBR 11861 → NBR 12779; NBR 13434 → NBR 16820:2020
- Artigo "Lei Kiss": renomeado para `lei-kiss-decreto-69118.html`, linha do tempo normativa (56.819 → 63.911 → 69.118) adicionada

### ⚠️ Pendências de revisão técnica com a Cassia — OBRIGATÓRIO antes de considerar definitivo

> **Contexto:** as correções de citações legais/normativas abaixo foram feitas com base em pesquisa externa, NÃO em confirmação direta da responsável técnica. Conteúdo de lei e norma é o tipo de informação que mais compromete a credibilidade da empresa se estiver errado. Estes itens devem ser revisados pela Cassia antes da publicação do site ou de qualquer divulgação do Blog SCI.

1. **Numeração das Instruções Técnicas (ITs)** — confirmar se a numeração IT-01, IT-11, IT-18, IT-20, IT-21, IT-22 permanece igual com o Decreto 69.118/2024 ou se houve renumeração. Localização: artigo `src/pages/blog-sci/lei-kiss-decreto-69118.html`.
2. **NBR 12962 (Extintores, edição 2016)** — verificar se a edição 2016 continua vigente ou foi cancelada/substituída. Foram encontrados sinais ambíguos em fontes secundárias, mas sem confirmação. Não alterar a citação enquanto não houver confirmação. Localização: `src/pages/servicos.html` (tag do card Extintores).
3. **VIA-FÁCIL e TAACB** — plataforma digital de licenciamento e novo documento citados em fontes de terceiros como novidades do Decreto 69.118/2024. Não foram adicionados ao site. Confirmar com a Cassia se já fazem parte do fluxo de trabalho real da Alfa Prev — podem ser conteúdo relevante para o Blog SCI se confirmados.
4. **Outros impactos do Decreto 69.118/2024** — verificar se há algum outro processo, prazo ou terminologia que mudou com o decreto e que afete a descrição dos serviços da Alfa Prev no site.

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
Isso regera todos os HTMLs na raiz do projeto **e** atualiza automaticamente `CONTEUDO-PAGINAS.md`.

**OBRIGATÓRIO após o build:** abrir o arquivo gerado na raiz (ex: `index.html`) no navegador via Live Server — nunca o arquivo-fonte em `/src/pages/`. Os arquivos-fonte não têm o Tailwind CDN nem os partials expandidos; abri-los diretamente exibe o site sem nenhum estilo. O `build.js` agora inclui sanity checks que avisam no terminal se `cdn.tailwindcss.com` ou partials não resolvidos forem detectados na saída.

**Guarda automática nos arquivos-fonte:** cada arquivo em `/src/pages/` contém um script que detecta se está sendo servido via URL `/src/` e redireciona automaticamente para o arquivo gerado equivalente na raiz. Isso evita o site sem estilo caso o arquivo errado seja aberto acidentalmente.

**Commits pequenos e frequentes:** fazer commit ao fim de cada prompt/tarefa concluída — não acumular várias mudanças estruturais sem commitar. Isso torna trivial identificar via `git diff` ou `git bisect` qual mudança específica introduziu um problema. Padrão: commitar após cada sessão de edição que produz um resultado visual verificável.

### Estrutura de arquivos atualizada

```
alfaprev/
├── index.html              # GERADO — não edite diretamente
├── servicos.html           # GERADO — não edite diretamente
├── quem-somos.html         # GERADO — não edite diretamente (renomeado de sobre.html em set/2026)
├── blog-sci.html           # GERADO — não edite diretamente
├── blog-sci/               # GERADO — não edite diretamente
│   ├── avcb-clcb.html
│   ├── lei-kiss-decreto-56819.html
│   └── vencimento-avcb-clcb.html
├── faq.html                # GERADO — não edite diretamente
├── contato.html            # GERADO — não edite diretamente
├── build.js                # Script de build (Node.js nativo — sem dependências)
├── generate-content-md.js # Extrai texto das páginas e gera CONTEUDO-PAGINAS.md
├── CONTEUDO-PAGINAS.md     # GERADO — conteúdo textual de todas as páginas (não edite)
├── package.json            # {"scripts": {"build": "node build.js && node generate-content-md.js"}}
├── partials/
│   ├── head-common.html    # Tailwind CDN, Inter font, tailwind.config, styles.css
│   ├── header.html         # Header com navegação completa (editar aqui)
│   ├── footer.html         # Footer com links e dados institucionais (editar aqui)
│   ├── whatsapp-float.html # Botão WhatsApp flutuante
│   ├── cookie-banner.html  # Banner LGPD de cookies
│   └── scripts.html        # Tags <script> de config.js e script.js
└── src/
    └── pages/
        ├── index.html         # Home: Hero + teasers de serviços, blog SCI e quem somos
        ├── servicos.html      # Todos os 6 serviços com descrições completas
        ├── quem-somos.html    # Texto institucional + responsável técnica + dados da empresa
        ├── blog-sci.html      # Hub do Blog SCI (artigos sobre normas e regularização)
        ├── blog-sci/
        │   ├── avcb-clcb.html
        │   ├── lei-kiss-decreto-56819.html
        │   └── vencimento-avcb-clcb.html
        ├── faq.html           # 7 perguntas/respostas com accordion (Schema FAQPage)
        └── contato.html       # Formulário de orçamento, mapa, contatos, privacidade
```

### Arquivo CONTEUDO-PAGINAS.md — regras obrigatórias

`CONTEUDO-PAGINAS.md` é gerado automaticamente por `generate-content-md.js` e contém o conteúdo textual de todas as páginas do site extraído dos arquivos-fonte em `src/pages/`.

**Regras:**
- **Nunca edite `CONTEUDO-PAGINAS.md` diretamente** — qualquer alteração manual será sobrescrita no próximo `npm run build`.
- Sempre que você (Claude) editar conteúdo em `src/pages/` ou `partials/`, **o próximo `npm run build` já atualiza o arquivo automaticamente**. Não é necessário rodá-lo em separado.
- Se uma nova página for adicionada em `src/pages/`, adicione também uma entrada no array `PAGE_ORDER` de `generate-content-md.js` para que a nova página apareça no arquivo na ordem correta.
- O arquivo serve como referência textual rápida do conteúdo do site para revisão de copy, auditoria de SEO e contexto em conversas futuras.

### Regra: sem aparência de texto gerado por IA

O site não deve soar como texto produzido por IA. Regras obrigatórias de escrita:

- **Proibido usar travessão (—) e meia-risca (–) em texto corrido.** Esses caracteres são marcadores frequentes de texto gerado automaticamente. Substituir por pontuação natural: dois pontos (`:`), vírgula, ponto ou parênteses — conforme o contexto.
- Sem frases genéricas ou adjetivos vazios ("soluções completas e integradas", "atendimento diferenciado", "líderes do setor").
- Sem estruturas do tipo "X — Y — Z" com travessões como parênteses.
- Dados e estatísticas: usar apenas os confirmados na seção "Dados de Negócio". Nunca inventar.
- Tom direto e técnico: dizer o que é, não o que parece ser.

Esta regra se aplica a todo texto visível no site: parágrafos, títulos, bullets, callouts e qualquer outro elemento de copy.

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
- Blog SCI → Serviços (como resolver)
- Blog SCI → FAQ (dúvidas relacionadas)
- FAQ → Contato (CTA principal)
- FAQ → Serviços / Blog SCI (relacionados)
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

Usar **"Engenharia de Incêndio"** como denominação padrão em todo o site. Não usar "Engenharia de Segurança Contra Incêndio" nem "Engenharia de Prevenção Contra Incêndio".

**Exceção que NÃO deve ser alterada:**
1. **"Projeto(s) de Prevenção e Combate a Incêndio (PPCI)"** — nome técnico/legal oficial exigido pelo Corpo de Bombeiros.

**Credential da responsável técnica:** usar exatamente `"Arquiteta e Urbanista · Especialista em Engenharia de Incêndio"` — sem menção à PUC-MG em nenhum lugar do site.

### Página "Quem Somos" (renomeada de "Sobre" em set/2026)

- URL: `quem-somos.html` (era `sobre.html`)
- Arquivo fonte: `src/pages/quem-somos.html`
- Nav: link "Quem Somos" em header e footer
- Conteúdo: texto institucional completo (set/2026) + bloco da responsável técnica (Cassia)

### Badges do Hero (atualizado set/2026)

3 badges com ícone de check verde (reduzidos de 5):
1. Responsável Técnica Especializada em Engenharia de Incêndio
2. Serviços em conformidade com as legislações vigentes
3. Assessoria completa para segurança do seu patrimônio

Removidos: "Projetos 100% Adequados às Normas Técnicas" e "Atendimento Personalizado".

### Schema.org — padrão por tipo de página
- **Todas as páginas:** `BreadcrumbList`
- **Home:** `ProfessionalService`
- **Quem Somos:** `Person` (responsável técnica) + `ProfessionalService`
- **Serviços:** `ItemList` (listagem dos 6 serviços)
- **Blog SCI (hub):** `CollectionPage`
- **Artigos do Blog SCI (`/blog-sci/*.html`):** `Article` com `datePublished`
- **FAQ:** `FAQPage` (manter sincronizado com os itens do accordion)
- **Contato:** `LocalBusiness`

### Como adicionar um novo artigo no Blog SCI

1. **Criar o arquivo fonte** em `src/pages/blog-sci/nome-do-artigo.html` seguindo o padrão dos artigos existentes:
   - Redirect guard no `<head>` (idêntico aos outros artigos — adaptar o `replace` para `'/src/pages/blog-sci/'` → `'blog-sci/'`)
   - `<title>`, `<meta name="description">` e `<link rel="canonical">` únicos para o artigo
   - JSON-LD `Article` com `datePublished` no formato `YYYY-MM-DD`
   - JSON-LD `BreadcrumbList` com 3 níveis: Home → Blog SCI → título do artigo
   - `<!-- INCLUDE:head-common -->` antes de `</head>`
   - Mini-hero com breadcrumb de navegação (nav com links para `/` e `/blog-sci.html`)
   - ID único no `<section>` do mini-hero (ex: `art4-heading`) para evitar colisão entre páginas
   - Corpo do artigo em `<article class="py-16 lg:py-20 bg-white">` com `max-w-3xl`
   - Seção CTA ao final (`bg-corp-black`)
   - INCLUDEs de footer, whatsapp-float, cookie-banner, scripts

2. **Adicionar card no hub** em `src/pages/blog-sci.html` — copiar um dos `<article>` existentes no grid e ajustar título, descrição e link.

3. **Adicionar URL no `sitemap.xml`** com `changefreq: yearly` e `priority: 0.7`.

4. **Adicionar entrada no `PAGE_ORDER`** de `generate-content-md.js` usando `path.join('blog-sci', 'nome-do-artigo.html')`.

5. **Rodar `npm run build`** — o `processDir()` do `build.js` percorre recursivamente `src/pages/` incluindo subdiretórios.

6. **Verificar**: abrir o arquivo gerado na raiz (ex: `blog-sci/nome-do-artigo.html`) e confirmar que `cdn.tailwindcss.com` está presente no `<head>` (sinal de que o `<!-- INCLUDE:head-common -->` foi expandido corretamente).
