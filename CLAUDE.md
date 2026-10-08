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
| Telefone/WhatsApp | +55 11 98932-5513 / (11) 98932-5513 — atualizado em set/2026 |
| E-mail | contato@alfasci.com.br — atualizado em set/2026 |
| Instagram | @alfaprev_sci |
| Facebook | https://www.facebook.com/profile.php?id=61594085214860 |
| LinkedIn | https://www.linkedin.com/in/alfaprev/ |
| Horário | Segunda a Sexta das 09h às 17h (emergências fora do horário também atendidas) |
| Área de atendimento | Todo o Estado de São Paulo |
| Domínio | alfasci.com.br — domínio final e único do site, decidido em out/2026 (mesmo domínio já usado para e-mail). Sem `www`. Usar sempre `https://alfasci.com.br` no código. O domínio `alfaprev-sci.com.br`, registrado via Locaweb em set/2026 (expira 08/09/2027), foi abandonado por decisão do cliente — não está mais em uso em nenhum lugar do código e não há redirecionamento configurado dele para `alfasci.com.br`. |

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
├── sitemap.xml             # Referencia https://alfasci.com.br/
├── netlify.toml            # Headers de segurança + configuração de cache (Netlify)
├── server.ps1              # Servidor local PowerShell
├── CLAUDE.md               # Este arquivo
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
| Canonical URL | Todas as páginas → `https://alfasci.com.br/[pagina]` | OK — atualizado para domínio final (out/2026) |
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
- Auditoria de conteúdo concluída
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
- Artigo "Lei Kiss": renomeado para `lei-kiss-decreto-69118.html`, linha do tempo normativa (56.819 → 63.911 → 69.118) adicionada — **removido do site em out/2026, ver item abaixo**
- **(out/2026) Artigo "Lei Kiss e Decreto 69.118/2024" removido do Blog SCI**: arquivo-fonte, arquivo gerado, card no hub, entrada no `sitemap.xml` e entrada no `PAGE_ORDER` de `generate-content-md.js` foram todos removidos. O hub (`blog-sci.html`) ficou com 2 cards de artigo (AVCB/CLCB e Vencimento). O texto de introdução do hub ainda cita "o Decreto Estadual nº 69.118/2024 e suas Instruções Técnicas" como conteúdo disponível, mas não há mais artigo dedicado a isso — ver `CONTEUDO-PAGINAS.md` seção 4 para a inconsistência registrada.
- **(out/2026) Artigo `avcb-clcb.html` reescrito em pontos-chave**: processo do AVCB detalhado (PPCI → vistoria → emissão); processo do CLCB reescrito para não mais exigir aprovação prévia de projeto, mas reforçando que extintores/sinalização/saídas precisam estar corretos mesmo sem aprovação prévia; seção "Quando consultar um profissional" removida do final do artigo; parágrafo de validade do AVCB simplificado.
- **(out/2026) Regra de validade do AVCB:** a validade do AVCB (geralmente entre 1 e 3 anos) depende apenas do **grupo de ocupação** da edificação. Removida toda menção a "grupo de risco" ou "complexidade" como fator de validade — essa vinculação era usada antes em `avcb-clcb.html`, `faq.html` e trechos do site, e foi corrigida para citar apenas ocupação. **Pendente de confirmação com a Cassia** a faixa "entre 1 e 3 anos" (ver seção de pendências abaixo).
- **(out/2026) Página FAQ ocultada do site publicado** sem remover o conteúdo-fonte. Ver seção "FAQ oculto (out/2026)" mais abaixo para detalhes e instruções de reativação.
- **(out/2026) Select "Ocupação" do formulário de contato ajustado**: removidas as opções "Condomínio Comercial" e "Digitalização de Plantas / Projetos"; adicionada a opção "Escritórios" (valor `escritorios`). Nenhuma dependência encontrada em `script.js` ou `supabase-schema.sql` que precisasse de ajuste.
- **(out/2026) Tópico "o que acontece quando o AVCB/CLCB vence sem renovação" removido do site**: esse tópico não era uma seção dentro de um artigo maior, era o artigo inteiro (`blog-sci/vencimento-avcb-clcb.html` — título, meta, JSON-LD e 4 dos 6 H2 eram exatamente esse tópico). Removidos: arquivo-fonte (`src/pages/blog-sci/vencimento-avcb-clcb.html`), arquivo gerado (`blog-sci/vencimento-avcb-clcb.html`), card no hub (`src/pages/blog-sci.html`), entrada no `sitemap.xml`, entrada no `PAGE_ORDER` de `generate-content-md.js`, e a pergunta/resposta correspondente no FAQ oculto (`src/pages/faq.html`, pergunta "O que acontece se o AVCB ou CLCB vencer sem ser renovado?", JSON-LD + accordion). O hub (`blog-sci.html`) ficou com 1 card de artigo (AVCB/CLCB). **"Consequências do vencimento sem renovação" é assunto fora do site por decisão do cliente** — não reintroduzir esse conteúdo sem autorização explícita.

### ⚠️ Pendências de revisão técnica com a Cassia — OBRIGATÓRIO antes de considerar definitivo

> **Contexto:** as correções de citações legais/normativas abaixo foram feitas com base em pesquisa externa, NÃO em confirmação direta da responsável técnica. Conteúdo de lei e norma é o tipo de informação que mais compromete a credibilidade da empresa se estiver errado. Estes itens devem ser revisados pela Cassia antes da publicação do site ou de qualquer divulgação do Blog SCI.

1. **Órfão desde out/2026 — Numeração das Instruções Técnicas (ITs)** — confirmar se a numeração IT-01, IT-11, IT-18, IT-20, IT-21, IT-22 permanece igual com o Decreto 69.118/2024 ou se houve renumeração. O artigo que citava essas ITs (`lei-kiss-decreto-69118.html`) foi removido do site em out/2026 — este item não tem mais localização ativa, mantido aqui apenas como registro histórico até confirmação definitiva (caso o artigo seja reescrito/reativado no futuro).
2. **Órfão desde out/2026 — NBR 12962 (Extintores, edição 2016)** — verificar se a edição 2016 continua vigente ou foi cancelada/substituída. Foram encontrados sinais ambíguos em fontes secundárias, mas sem confirmação. Não alterar a citação enquanto não houver confirmação. Localização: `src/pages/servicos.html` (tag do card Extintores). *(Mantido como "ainda ativo" — a citação continua presente em `servicos.html`, diferente dos itens 1 e 3-4 que dependiam do artigo removido.)*
3. **Ainda ativo — VIA-FÁCIL e TAACB** — plataforma digital de licenciamento e novo documento citados em fontes de terceiros como novidades do Decreto 69.118/2024. Não foram adicionados ao site. Confirmar com a Cassia se já fazem parte do fluxo de trabalho real da Alfa Prev — podem ser conteúdo relevante para o Blog SCI se confirmados.
4. **Ainda ativo — Outros impactos do Decreto 69.118/2024** — verificar se há algum outro processo, prazo ou terminologia que mudou com o decreto e que afete a descrição dos serviços da Alfa Prev no site.
5. **(out/2026) Faixa de validade do AVCB ("entre 1 e 3 anos")** — o artigo `avcb-clcb.html` e outros trechos do site afirmam que a validade do AVCB varia "geralmente entre 1 e 3 anos" conforme o grupo de ocupação. Essa faixa numérica não foi confirmada diretamente com a Cassia — precisa de validação antes de qualquer divulgação do Blog SCI, já que está vinculada à regra de "validade depende apenas da ocupação" também adicionada em out/2026.
6. **Ainda ativo — Inconsistência CLCB declaração vs. aprovação prévia** — o processo de obtenção do CLCB em `avcb-clcb.html` foi reescrito para não exigir mais aprovação prévia de projeto, mas as seções "O que é o CLCB" e "A diferença essencial" (no mesmo artigo) continuam descrevendo o CLCB como documento "declaratório". Essa divergência não foi corrigida — avaliar com a Cassia qual framing é o correto e unificar. *(A segunda ocorrência desse mesmo problema estava no artigo `vencimento-avcb-clcb.html`, removido do site em out/2026 — ver item "Tópico ... removido do site" no histórico "Feito" acima.)*

### Pendente antes de publicar 🔴
- [x] Registrar domínio — domínio final do site é `alfasci.com.br` (decisão out/2026, mesmo domínio do e-mail). `alfaprev-sci.com.br` foi registrado via Locaweb em set/2026 (ativo, expira 08/09/2027) mas está abandonado, sem uso no site e sem redirecionamento configurado.
- [ ] Escolher hospedagem (Netlify recomendado — `netlify.toml` já pronto)
- [ ] Criar projeto no Supabase, rodar `supabase-schema.sql` e preencher `assets/js/config.js`
- [ ] Configurar chave Web3Forms em `script.js` — criar nova chave no painel do Web3Forms registrada com `contato@alfasci.com.br` (e-mail de contato atualizado em set/2026)
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
Resultado da auditoria de segurança (out/2026): `docs/SEGURANCA.md`
Resultado da auditoria de SEO/performance (out/2026, dados reais via Lighthouse): `publicacao/AUDITORIA-SEO.md`
Guia de publicação passo a passo (Locaweb, out/2026): `publicacao/PUBLICACAO-LOCAWEB.md`
Documentação do painel `/leads` e métricas: `docs/DASHBOARD-LEADS.md`

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

**Push para o repositório remoto:** nunca fazer push. O push é sempre responsabilidade do Artur. Claude Code apenas faz commits locais.

### Estrutura de arquivos atualizada

```
alfaprev/
├── index.html              # GERADO — não edite diretamente
├── servicos.html           # GERADO — não edite diretamente
├── quem-somos.html         # GERADO — não edite diretamente (renomeado de sobre.html em set/2026)
├── blog-sci.html           # GERADO — não edite diretamente
├── blog-sci/               # GERADO — não edite diretamente
│   └── avcb-clcb.html
├── contato.html            # GERADO — não edite diretamente
├── build.js                # Script de build (Node.js nativo — sem dependências; SKIP_FILES ignora faq.html, ver "FAQ oculto")
├── generate-content-md.js # Extrai texto das páginas e gera o rascunho simples de CONTEUDO-PAGINAS.md
├── CONTEUDO-PAGINAS.md     # GERADO (rascunho) + recomposto manualmente (versão rica) — não edite
├── package.json            # {"scripts": {"build": "node build.js && node generate-content-md.js"}}
├── partials/
│   ├── head-common.html    # Tailwind CDN, Inter font, tailwind.config, styles.css
│   ├── header.html         # Header com navegação completa (editar aqui) — link FAQ comentado (oculto)
│   ├── footer.html         # Footer com links e dados institucionais (editar aqui) — link FAQ comentado (oculto)
│   ├── whatsapp-float.html # Botão WhatsApp flutuante
│   ├── cookie-banner.html  # Banner LGPD de cookies
│   └── scripts.html        # Tags <script> de config.js e script.js
└── src/
    └── pages/
        ├── index.html         # Home: Hero + teasers de serviços, blog SCI e quem somos
        ├── servicos.html      # Todos os 6 serviços com descrições completas — CTA ao FAQ comentado (oculto)
        ├── quem-somos.html    # Texto institucional + responsável técnica + dados da empresa
        ├── blog-sci.html      # Hub do Blog SCI (artigos sobre normas e regularização) — 1 card (Lei Kiss e Vencimento removidos em out/2026)
        ├── blog-sci/
        │   └── avcb-clcb.html
        ├── faq.html           # 7 perguntas/respostas com accordion (Schema FAQPage) — NÃO gerado no build (ver "FAQ oculto")
        └── contato.html       # Formulário de orçamento, mapa, contatos, privacidade
```

### Arquivo CONTEUDO-PAGINAS.md — regras obrigatórias

`CONTEUDO-PAGINAS.md` é o documento de referência para revisão de copy pela Cassia e para auditoria de conteúdo/SEO. Desde out/2026 ele é **composto manualmente por Claude Code** a partir de `/src/pages/` + `/partials/` (não mais apenas pelo output simples de `generate-content-md.js` — esse script continua existindo e roda como parte de `npm run build`, mas seu output simples deve ser considerado apenas um rascunho intermediário, sempre substituído pela versão rica descrita abaixo).

**Regras:**
- **Nunca edite o conteúdo do site a partir deste arquivo.** Qualquer alteração de texto deve ser feita em `/src/pages/` ou `/partials/`, nunca em `CONTEUDO-PAGINAS.md` diretamente.
- **Sempre que o conteúdo textual do site mudar** (edição em `/src/pages/` ou `/partials/`), o arquivo deve ser regenerado manualmente: rodar `npm run build` primeiro (garante que o HTML gerado está sincronizado com as fontes), depois recompor `CONTEUDO-PAGINAS.md` lendo as fontes atualizadas e reescrevendo o arquivo por completo (não é um diff incremental).
- **Critério de extração:** apenas texto visível ao visitante (títulos, parágrafos, listas, CTAs, texto de cards, estatísticas, depoimentos, texto de links, perguntas/respostas completas do FAQ, rótulos/placeholders/opções de formulário, mensagens de sucesso/erro, textos alternativos relevantes) + metadados de SEO especificados (`<title>`, `meta description`, `canonical`, `datePublished` de artigos). Nunca incluir HTML, CSS, JS, tags, scripts, JSON-LD bruto ou comentários de código.
- **Preservação literal:** o texto deve ser copiado exatamente como aparece no código-fonte — nunca reescrito, resumido ou "melhorado". Formatação em negrito/itálico só é aplicada se já existir no original (`<strong>`, `<em>`).
- **Elementos compartilhados** (header, footer, banner de cookies, botão/mensagem do WhatsApp) ficam em uma única seção dedicada ("Elementos Compartilhados"), não repetidos por página.
- Marcadores `<!-- PREENCHER -->` encontrados no texto devem aparecer inline como `**[PREENCHER]**` e também ser listados na seção final "Pendências de Preenchimento".
- Marcadores `<!-- REVISAR COM CASSIA: ... -->` encontrados no código devem ser listados na seção final "Pendências de Revisão pela Cassia", junto com os itens de revisão técnica já documentados neste CLAUDE.md.
- Inconsistências encontradas durante a extração (ex.: texto que viola regras deste CLAUDE.md, divergências entre páginas) devem ser **listadas, nunca corrigidas**, na seção final "Inconsistências Encontradas", com arquivo + trecho exato.
- Se uma nova página for adicionada em `src/pages/`, adicione também uma entrada no array `PAGE_ORDER` de `generate-content-md.js` (para o rascunho automático) e uma seção correspondente na próxima recomposição manual do arquivo rico.
- O arquivo serve como referência textual completa do conteúdo do site para revisão de copy, auditoria de SEO e contexto em conversas futuras.

### Regra: sem aparência de texto gerado por IA

O site não deve soar como texto produzido por IA. Regras obrigatórias de escrita:

- **Proibido usar travessão (—) e meia-risca (–) em texto corrido.** Esses caracteres são marcadores frequentes de texto gerado automaticamente. Substituir por pontuação natural: dois pontos (`:`), vírgula, ponto ou parênteses — conforme o contexto.
- Sem frases genéricas ou adjetivos vazios ("soluções completas e integradas", "atendimento diferenciado", "líderes do setor").
- Sem estruturas do tipo "X — Y — Z" com travessões como parênteses.
- Dados e estatísticas: usar apenas os confirmados na seção "Dados de Negócio". Nunca inventar.
- Tom direto e técnico: dizer o que é, não o que parece ser.

Esta regra se aplica a todo texto visível no site: parágrafos, títulos, bullets, callouts e qualquer outro elemento de copy.

### Convenções de copy (adicionado set/2026)

- **"Obtenção" vs "Regularização" na frase de assessoria AVCB/CLCB:** o H1 do Hero usa "Assessoria Técnica para Obtenção do AVCB/CLCB". Outros usos genéricos de "regularização" no site (ex: "processo de regularização", "regularizar seu imóvel") continuam corretos e não devem ser alterados.
- **"Situação de emergência" em vez de "princípio de incêndio":** o termo "princípio de incêndio" foi removido de todo o site e substituído por "em uma situação de emergência" ou formulação equivalente.
- **Mensagem padrão única do WhatsApp:** todos os links `wa.me` do site usam a mesma mensagem: "Olá equipe Alfa Prev, gostaria de saber mais sobre os serviços oferecidos por vocês falando com um especialista." URL codificada: `https://wa.me/5511989325513?text=Ol%C3%A1%20equipe%20Alfa%20Prev%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20oferecidos%20por%20voc%C3%AAs%20falando%20com%20um%20especialista.` — não criar variações de mensagem.

### Pendência: reconfiguração do formulário de e-mail (OBRIGATÓRIO antes de publicar)

O formulário de contato envia e-mails via Web3Forms. O e-mail exibido no site foi atualizado para `contato@alfasci.com.br`, mas o destino real dos envios é configurado no painel do Web3Forms, não no código. Para que os leads cheguem ao novo e-mail:
1. Acessar https://web3forms.com
2. Criar nova chave de acesso registrada com `contato@alfasci.com.br`
3. Substituir `ACCESS_KEY` em `script.js` com a nova chave

Um comentário de alerta foi adicionado em `script.js` próximo à `ACCESS_KEY` para lembrar disso.

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

---

## FAQ oculto (out/2026)

A página de FAQ foi **ocultada do site publicado sem remover o conteúdo-fonte**. O conteúdo (7 perguntas/respostas, accordion, Schema `FAQPage`) continua intacto em `src/pages/faq.html`, apenas não é mais gerado nem linkado.

### O que foi feito

1. **`build.js`** — adicionado um array `SKIP_FILES` (lista arquivos relativos a `src/pages/` que o `processDir()` deve ignorar ao gerar a saída). `faq.html` foi incluído nessa lista. Essa abordagem foi escolhida em vez de comentar o arquivo-fonte inteiro (risco de conflito com comentários HTML já existentes dentro do próprio arquivo).
2. **`faq.html` na raiz** (gerado) — removido, já que o build não o gera mais enquanto estiver em `SKIP_FILES`.
3. **`partials/header.html`** — link de navegação "FAQ" (desktop e mobile) comentado com `<!-- -->`.
4. **`partials/footer.html`** — link "FAQ" comentado com `<!-- -->`.
5. **`src/pages/servicos.html`** — seção de CTA "Dúvidas sobre qual serviço? Consulte o FAQ" comentada.
6. **`sitemap.xml`** — entrada de `faq.html` removida.
7. **`CONTEUDO-PAGINAS.md`** — seção 5 (FAQ) substituída por uma nota explicando a ocultação (o conteúdo completo das perguntas não aparece mais no documento rico, já que não é mais público).

### Por quê

Decisão de negócio para remover a página de FAQ do site publicado temporariamente, sem perder o trabalho de conteúdo já feito (schema, copy, accordion) caso seja reativada no futuro.

### Como reativar

1. Remover `'faq.html'` do array `SKIP_FILES` em `build.js`.
2. Descomentar o link "FAQ" em `partials/header.html` (desktop e mobile) e `partials/footer.html`.
3. Descomentar a seção de CTA ao FAQ em `src/pages/servicos.html`.
4. Adicionar de volta a entrada de `faq.html` em `sitemap.xml` (`changefreq: monthly`, `priority: 0.7` — ou valor condizente com as demais páginas).
5. Rodar `npm run build`.
6. Recompor `CONTEUDO-PAGINAS.md` manualmente, restaurando a seção 5 com o conteúdo completo das 7 perguntas/respostas (ler `src/pages/faq.html` diretamente, já que a versão rica anterior ao out/2026 tem o texto literal).

---

## Métricas, Leads e Painel Administrativo /leads (adicionado out/2026)

Documentação técnica completa em `docs/DASHBOARD-LEADS.md` — leia-a antes de tocar em qualquer arquivo citado abaixo. Resumo operacional:

- **Métricas anônimas do site público:** `assets/js/metricas.js` (sem dependências, carregado via `partials/scripts.html`). Sem cookies, sem GA/GTM (removidos nesta implementação — não reintroduzir). `page_view` e `whatsapp_click` (delegado em `a[class*="cta-whatsapp"]`) são enviados à função SQL `registrar_evento` via RPC.
- **Formulário de contato:** `script.js` (módulo 7b) chama a função SQL `registrar_lead` via RPC (`/rest/v1/rpc/registrar_lead`) em vez de `INSERT` direto na tabela `leads`. Nunca reverter para `INSERT` direto — a função valida, normaliza telefone, exige consentimento e aplica rate limit no banco.
- **Banco:** `supabase-schema.sql` é idempotente e aditivo — sempre `DROP ... IF EXISTS` + `CREATE`/`ADD`, nunca editado destrutivamente. Nunca retipar colunas existentes de `leads` (usar `CHECK (char_length(...))` em vez de `ALTER COLUMN ... TYPE`). `supabase-admin.sql` é só um template (nunca commitar e-mail real de admin). Rodar `scripts/testar-supabase-rls.js` (variáveis de ambiente, nunca chave hardcoded) após qualquer mudança no schema.
- **Painel `/leads` (`src/pages/leads.html` → `leads.html` gerado):**
  - **Não usa os partials públicos nem Tailwind CDN** — CSS próprio em `assets/css/leads.css`, fonte self-hosted em `assets/fonts/inter-var.woff2`. CSP própria e mais restrita que a do site público, aplicada via `<meta http-equiv>` na própria página **e** via header HTTP (`netlify.toml` → bloco `for = "/leads.html"`; modelo Apache em `publicacao/modelos/leads.htaccess` se a hospedagem não for Netlify).
  - `build.js` tem uma exceção (`ehPaginaLeads`) que isenta `leads.html`/`leads/**` do check "precisa ter `cdn.tailwindcss.com`" e adiciona o check inverso ("não pode ter `cdn.tailwindcss.com`"). Não remover essa exceção nem apontar `leads.html` para `head-common.html`.
  - Lógica em `assets/js/leads/`: `bloqueio.js` (bloqueio de tentativas, só UX — ver aviso no topo do arquivo), `telefone.js` (formatação, não validação), `csv.js` (exportação com neutralização de injeção de fórmula OWASP), `auth.js` (Supabase Auth + `is_admin()` + sessão com timeout de inatividade), `dashboard.js` (gráficos em SVG puro, sem biblioteca), `grade.js` (grid de leads, filtros/paginação server-side via `listar_leads`), `app.js` (bootstrap).
  - Os três primeiros módulos (`bloqueio.js`, `telefone.js`, `csv.js`) são puros e testados em `test/*.test.js` (`npm test`, zero dependências, `node --test` nativo). Qualquer alteração nesses três arquivos deve manter os testes passando.
  - Nunca linkar `/leads.html` em `robots.txt`, `sitemap.xml` ou qualquer `partial` público — a proteção real é Supabase Auth + RLS (`is_admin()`), não a obscuridade da URL (que também tem `meta robots noindex, nofollow` e `X-Robots-Tag` via header).
- **Dependência nova:** `@supabase/supabase-js@2.117.2` (MIT, versão fixada) — vendorizado em `assets/vendor/supabase-js/supabase.js` (cópia do UMD bundle, nunca carregado via CDN em runtime). Usado exclusivamente em `/leads`.

---

## Publicação na Locaweb e Auditoria de SEO (adicionado out/2026)

Levantamento completo de empacotamento, configuração de servidor, guia de publicação e auditoria
de SEO/performance, feito como investigação e documentação — **sem alterar conteúdo, design ou
comportamento do site**. Três documentos de referência em `publicacao/`:

- **`publicacao/PUBLICACAO-LOCAWEB.md`** — bloqueadores antes de publicar (chaves placeholder,
  Supabase não configurado, pendências de confirmação com a Cassia), resultado da checagem de DNS
  de `alfasci.com.br` (apontando para servidores de nome/MX/SPF da Locaweb, ainda sem registro A —
  hospedagem não apontada), confirmação de que o host canônico (`https://alfasci.com.br`, sem
  `www`, domínio final único decidido em out/2026) é 100% consistente em todo o código, e o guia
  passo a passo completo de publicação (DNS, FTP, SSL, testes pós-publicação, reconfiguração
  do Web3Forms, checklist de produção do Supabase, cadastro em Search Console/Bing/Google Business
  Profile).
- **`publicacao/modelos/.htaccess`** — modelo de configuração Apache para hospedagem Locaweb
  (equivalente em headers HTTP ao `netlify.toml`), com blocos claramente separados: tipos MIME
  explícitos (`mod_mime` — adicionado out/2026, garante Content-Type correto de `.woff2`/`.svg`/
  `.ico`/`.js` independentemente da versão da tabela MIME do servidor), compressão/cache/headers
  de segurança (ativo desde o primeiro upload), força de HTTPS/host sem `www` (**mantido
  comentado** até o certificado SSL estar confirmado funcionando — ativar antes disso quebra o
  acesso ao site), e headers reforçados de `/leads.html`. **Plano Locaweb confirmado como Linux em
  2026-10-07** — este `.htaccess` é a configuração final do servidor; não é necessário (nem será
  criado) um `web.config`/IIS. `publicacao/modelos/leads.htaccess` (arquivo anterior a esta
  publicação) foi marcado como superado/redundante no próprio arquivo, já que seu conteúdo está
  embutido no `.htaccess` consolidado.
- **`scripts/empacotar-locaweb.js`** (`npm run empacotar`) — gera `dist-locaweb/` a partir da saída
  de `npm run build`: copia só os arquivos de produção (HTML/CSS/JS/assets necessários, nunca
  `src/`, `node_modules/`, documentação `.md`, scripts internos), remove comentários HTML da cópia,
  bloqueia o empacotamento se detectar qualquer chave `service_role` do Supabase (decodificando
  JWTs encontrados no conteúdo), placeholder não preenchido, ou link apontando para `localhost`,
  copia os modelos de servidor para a raiz do pacote, gera um manifesto SHA-256 por arquivo
  (`publicacao/MANIFESTO-PACOTE.txt`, gitignored) e tenta gerar um `.zip` (`alfaprev-site-*.zip`,
  gitignored, nunca commitado).
- **`publicacao/AUDITORIA-SEO.md`** — auditoria de SEO/performance/dados estruturados/E-E-A-T/
  segurança, com métricas reais medidas via Lighthouse local (não PageSpeed Insights, já que o site
  ainda não está publicado) contra o build estático. **Achado principal, medido e com maior
  impacto: Performance mobile 36/100 (desktop 99/100)**, causa raiz isolada no Tailwind CSS via
  CDN (`cdn.tailwindcss.com`) — confirma com número real a pendência já listada acima em
  "Pendente após publicar" (critério "< 70 mobile" foi atingido). Demais achados (prioridade média/
  baixa): nome da empresa inconsistente em 3 arquivos ("Alfa Prev - Segurança Contra Incêndios" em
  vez de "Alfa Prev", violando a convenção de marca e de terminologia já documentadas neste
  arquivo), `quem-somos.html` sem bloco `ProfessionalService` dedicado no JSON-LD, registro CAU/SP
  da Cassia ausente do `Person` estruturado, `Article.publisher` sem campo `logo`, mismatch de
  `aria-label` no botão de WhatsApp flutuante, contraste de cor insuficiente em elementos do
  footer (achados do Lighthouse accessibility). Nenhum destes foi corrigido nesta auditoria —
  lista completa com arquivo/esforço estimado na seção "Plano de ação priorizado" do documento.

**Nenhum destes três documentos nem o script de empacotamento alteram `/src/pages/`,
`/partials/` ou `assets/`** — qualquer correção de conteúdo/copy/schema listada neles exige um
prompt dedicado e decisão humana antes de ser implementada.

---

## Segurança (adicionado out/2026 — varredura completa)

Relatório completo em `docs/SEGURANCA.md` (achados, severidade, commits de correção, riscos
residuais aceitos, checklist de resposta a incidente LGPD). Regras permanentes resultantes dessa
auditoria:

- **`publicacao/modelos/.htaccess` é o arquivo que de fato vai para produção (Locaweb/Apache),
  não `netlify.toml`.** Qualquer header de segurança (CSP, COOP, HSTS, etc.) adicionado/alterado
  em um dos dois **deve** ser replicado no outro — a auditoria encontrou o `.htaccess` real sem
  nenhuma CSP para páginas públicas justamente porque só o `netlify.toml` (que não é o host real)
  estava atualizado.
- **2FA (TOTP) é obrigatório para qualquer admin do painel `/leads`.** `is_admin()` no banco exige
  `auth.jwt() ->> 'aal' = 'aal2'` — a imposição real está no SQL, não na UI. Nenhum admin novo
  pode receber a URL do painel antes de completar o cadastro do fator TOTP (ver
  `supabase-admin.sql`). Nunca remover essa checagem de `is_admin()` para "facilitar" acesso.
  Nunca criar um caminho na UI que permita desativar o 2FA do próprio usuário sem revisão humana
  — remoção de fator deve ser uma ação manual no painel do Supabase.
- **Fonte Inter é self-hosted** (`assets/fonts/inter-var.woff2`) em todo o site, público e
  `/leads`. Nunca reintroduzir `fonts.googleapis.com`/`fonts.gstatic.com` — isso exigiria reabrir
  esses domínios na CSP de ambos os arquivos de servidor.
- **`<FilesMatch>` no Apache opera só no basename, nunca no caminho completo.** Qualquer novo
  bloqueio de arquivo/pasta por padrão de caminho (não apenas extensão) no `.htaccess` deve usar
  `mod_rewrite` sobre `%{REQUEST_URI}`, como o bloco de dotfiles já corrigido.
- **HSTS está em rollout escalonado** (`max-age=21600`, sem `includeSubDomains`/`preload`) até
  confirmação de que HTTPS funciona de forma estável em produção. Não ativar `preload` sem essa
  confirmação — é quase irreversível.
- **Antes de qualquer commit que toque `assets/js/`, `src/pages/`, `netlify.toml` ou
  `publicacao/modelos/`:** rodar `npm test`, `npm run seguranca` e `npm audit`. Falha em qualquer
  um deve ser investigada antes do commit.
- **Nunca commitar a chave `service_role` do Supabase, e-mail real de admin, ou qualquer segredo**
  — `supabase-admin.sql` é só um template; `scripts/empacotar-locaweb.js` e
  `scripts/verificar-seguranca.js` já bloqueiam isso automaticamente, mas a regra vale também para
  qualquer arquivo novo.
- **Toda nova tabela/coluna no Supabase precisa de política RLS explícita antes de ir para
  produção** — nunca assumir que "RLS habilitado sem política" é documentação suficiente; declarar
  a política (ainda que seja "ninguém lê/escreve por enquanto") explicitamente.
