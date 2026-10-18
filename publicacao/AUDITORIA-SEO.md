# AUDITORIA DE SEO — ALFA PREV

Documento de auditoria. Nenhum achado aqui foi corrigido automaticamente — correções
de conteúdo/código continuam exigindo decisão humana (ou um prompt dedicado), conforme
o escopo deste levantamento (investigação e documentação apenas).

**Legenda de confiança usada em todo o documento:**
- **[VERIFICADO]** — confirmado lendo o código-fonte diretamente (fato, não estimativa).
- **[MEDIDO]** — número real obtido por ferramenta (Lighthouse `v12`, rodado localmente nesta
  auditoria contra `http://localhost:8099/` servindo os arquivos gerados pelo `build.js`, usando
  o Chrome já instalado em `C:\Program Files\Google\Chrome\Application\chrome.exe`). Não é
  simulação — é a mesma métrica que o PageSpeed Insights mostraria para este HTML, mas sem a
  rede/CDN real da Locaweb (que ainda não existe — domínio sem hospedagem apontada).
- **[HIPÓTESE]** — minha avaliação ou expectativa, sem medição direta. Marcado explicitamente
  sempre que aparecer.

Todas as métricas de performance foram medidas em `index.html` (página mais pesada em JSON-LD e
com o Hero completo). As demais páginas compartilham o mesmo `<head>` (Tailwind CDN, mesmas
fontes, mesmo CSS), então o padrão de performance é **[HIPÓTESE]** o mesmo nas demais páginas
públicas — não medido individualmente nesta rodada.

---

## 4.1 — Auditoria técnica página a página

**[VERIFICADO]** Tabela de metadados por página (extraída do HTML gerado em `npm run build`):

| Página | `<title>` (chars) | `meta description` (chars) | `<h1>` (qtd) | Canonical | Palavras (aprox.) |
|---|---|---|---|---|---|
| `index.html` | 94 — "Alfa Prev \| Projetos de Prevenção e Combate a Incêndio, AVCB e Segurança Contra Incêndio em SP" | 172 | 1 | `https://alfasci.com.br/` | ~670 |
| `servicos.html` | 82 — "Serviços de Prevenção e Combate a Incêndio \| PPCI, AVCB, Extintores \| Alfa Prev SP" | 189 | 1 | `.../servicos.html` | ~1.047 |
| `quem-somos.html` | 60 — "Quem Somos \| Alfa Prev \| Engenharia de Incêndio em São Paulo" | 139 | 1 | `.../quem-somos.html` | ~664 |
| `blog-sci.html` | 61 — "Blog SCI \| Engenharia de Incêndio, Normas e Dicas \| Alfa Prev" | 136 | 1 | `.../blog-sci.html` | ~390 |
| `blog-sci/avcb-clcb.html` | 71 — "AVCB e CLCB: qual é a diferença e qual o seu imóvel precisa \| Alfa Prev" | 136 | 1 | `.../blog-sci/avcb-clcb.html` | ~1.389 |
| `contato.html` | 72 — "Contato e Orçamento em Segurança Contra Incêndio \| Alfa Prev \| São Paulo" | 169 | 1 | `.../contato.html` | ~578 |

**Achados:**

- **[VERIFICADO] Prioridade MÉDIA — título e descrição de `index.html` e `contato.html` violam a
  convenção de terminologia do próprio `CLAUDE.md`.** O `CLAUDE.md` define "Engenharia de
  Incêndio" como denominação padrão do site (seção "Convenção de terminologia"), proibindo
  "Segurança Contra Incêndio" fora de contextos legais específicos (PPCI). Porém:
  - `index.html` → `<title>`: "...e Segurança Contra Incêndio em SP"
  - `contato.html` → `<title>`: "Contato e Orçamento em Segurança Contra Incêndio..."
  Isso não é só uma inconsistência de copy: para o Google, o título e a descrição são o texto
  mais lido para decidir a relevância da página — usar dois termos diferentes ("Engenharia de
  Incêndio" em algumas páginas, "Segurança Contra Incêndio" em outras) dilui o sinal temático em
  vez de reforçá-lo. Páginas afetadas: `index.html`, `contato.html`. Correção não aplicada (fora
  do escopo desta auditoria) — só reportado.
  **Esforço estimado:** baixo (editar `<title>`/`<meta description>` em `src/pages/index.html` e
  `src/pages/contato.html`, depois `npm run build`).

- **[VERIFICADO] Prioridade BAIXA — todos os títulos e descrições têm tamanho dentro do razoável**
  (títulos 60–94 caracteres, descrições 136–189 caracteres). Google normalmente trunca títulos
  acima de ~60 caracteres e descrições acima de ~160 na SERP — os títulos de `index.html` (94) e
  `servicos.html` (82) provavelmente aparecem truncados na busca. **[HIPÓTESE]** o impacto prático
  é pequeno, já que a parte truncada tende a ser a menos informativa (sufixo "| Alfa Prev SP" etc).
  Não é bloqueador, mas pode ser ajustado numa revisão de copy futura.

- **[VERIFICADO] Prioridade BAIXA — um único `<h1>` por página em todas as 6 páginas públicas**,
  conforme a regra do `CLAUDE.md`. Nenhum achado aqui.

- **[VERIFICADO] Prioridade BAIXA — todos os `canonical` apontam para a própria URL**, sem
  `www`, consistente com a decisão de host canônico documentada na Parte 0 deste levantamento
  (`PUBLICACAO-LOCAWEB.md` §0.5). Nenhum achado.

---

## 4.2 — Estrutura do site

**[VERIFICADO]** Estrutura plana, 6 páginas públicas + 1 subpágina de artigo (`blog-sci/avcb-clcb.html`)
+ 1 painel administrativo não-indexável (`leads.html`). Navegação (header/footer) linka todas as
páginas públicas entre si; a página de FAQ existe como código-fonte mas está oculta do site
publicado (ver `CLAUDE.md` → "FAQ oculto (out/2026)") — **não é um achado**, é uma decisão de
negócio já documentada.

- **[VERIFICADO]** `sitemap.xml` lista exatamente as 6 páginas públicas esperadas, com `lastmod`
  entre 2026-09-15 e 2026-09-19, `priority` de 1.0 (home) a 0.7 (artigo). Não lista `faq.html` nem
  `leads.html` — correto, consistente com a decisão de ocultação e com a proteção do painel.
- **[VERIFICADO]** `robots.txt` permite todos os crawlers (`Allow: /`) e referencia o sitemap.
  Não existe `Disallow` para `/leads.html` — **isso é intencional e correto**: a proteção real do
  painel é `is_admin()` + `X-Robots-Tag: noindex` (ver `CLAUDE.md`), não ocultação por `robots.txt`
  (que é um arquivo público e listar `/leads.html` nele seria pior, pois revelaria a URL a quem lê
  o arquivo). Nenhum achado — comportamento correto.
- **[VERIFICADO] Achado cosmético, prioridade BAIXA** — a primeira linha de `robots.txt` é um
  comentário: `# Robots.txt - Alfa Prev - Segurança Contra Incêndios`. Esse comentário não afeta
  nenhum crawler (comentários em `robots.txt` são ignorados), mas usa a mesma variação de nome
  divergente da marca encontrada em outros lugares (ver achado de E-E-A-T/NAP em 4.7). Esforço:
  trivial.

---

## 4.3 — Performance e Core Web Vitals

**[MEDIDO]** Lighthouse 12, `index.html`, duas rodadas (mobile emulado e desktop), via Chrome
local contra o build estático servido em `localhost:8099`:

| Categoria / Métrica | Mobile | Desktop |
|---|---|---|
| Performance (score) | **36 / 100** | **99 / 100** |
| Accessibility (score) | 96 / 100 | 96 / 100 |
| Best Practices (score) | 100 / 100 | 100 / 100 |
| SEO (score) | 100 / 100 | 100 / 100 |
| LCP (Largest Contentful Paint) | 6.0 s | 0.8 s |
| FCP (First Contentful Paint) | 4.7 s | 0.8 s |
| CLS (Cumulative Layout Shift) | 0.061 | 0.047 |
| TBT (Total Blocking Time) | 1.860 ms | 0 ms |
| Speed Index | 6.2 s | 0.8 s |

- **[MEDIDO] Prioridade ALTA — Performance mobile crítica (36/100), causa raiz identificada e
  isolada: Tailwind CSS carregado via CDN em runtime (`cdn.tailwindcss.com`).** O breakdown de
  "bootup time" do Lighthouse atribui especificamente a esse script ~553 ms de tempo de thread
  principal no mobile, e o TBT de 1.860 ms é consistente com um script grande sendo parseado e
  executado no dispositivo (o Tailwind Play CDN gera *todo* o CSS da página via JS, no navegador,
  a cada carregamento — diferente de um `.css` estático). Esse comportamento já é um risco
  conhecido e documentado no próprio `CLAUDE.md` ("Pendente após publicar: Avaliar nota PageSpeed
  Insights — se < 70 mobile, migrar Tailwind para versão compilada"). **Esta auditoria confirma
  com medição real que o critério já foi atingido: 36 << 70.**
  **Fix:** compilar o Tailwind para um `.css` estático (Tailwind CLI, sem necessidade de Node
  bundler complexo) e remover o `<script src="cdn.tailwindcss.com">` de `partials/head-common.html`.
  Ferramenta livre/gratuita (`@tailwindcss/cli`, open-source, MIT). **Fora do escopo desta
  auditoria executar essa migração** — é uma mudança estrutural em `partials/head-common.html`
  que afeta a renderização de todas as páginas, deve ser um prompt dedicado com validação visual
  completa antes/depois. **Esforço estimado:** médio (instalar Tailwind CLI, gerar CSS compilado,
  testar todas as 6 páginas + `leads.html` visualmente, ajustar build.js se necessário).
- **[MEDIDO] Prioridade ALTA — LCP mobile de 6.0s está bem acima do limite "bom" do Google (2.5s).**
  Consequência direta do item acima (o maior elemento visível do Hero só renderiza depois que o
  CSS gerado pelo Tailwind Play está disponível). **[HIPÓTESE]** resolver o item do Tailwind CDN
  deve reduzir o LCP mobile para próximo do valor desktop (0.8s), já que não há imagens pesadas
  nem fontes bloqueando o render — o `styles.css` e os assets já são pequenos (confirmado abaixo).
- **[MEDIDO] Prioridade BAIXA — CLS (Cumulative Layout Shift) dentro do limite "bom" (< 0.1) em
  ambos os cenários** (0.061 mobile, 0.047 desktop). Nenhum achado — o site não tem o problema
  comum de imagens sem `width`/`height` causando reflow (confirmado em 4.8 — todas as `<img>` têm
  `width`/`height`).
- **[MEDIDO] Prioridade BAIXA — Best Practices (100) e SEO (100) no Lighthouse, ambos os
  cenários.** Nenhum achado.
- **[VERIFICADO] Peso dos assets de imagem é pequeno** (`logo-dark-bg.jpg` usado como `og:image`:
  25,6 KB; `logo-white.svg`: 2,2 KB; `logo-icon-dark.svg`: 1,6 KB) — não é fator de lentidão.
  `script.js`: 17,1 KB; `styles.css`: 2,4 KB — ambos pequenos. O único "peso" real de performance
  é o próprio Tailwind CDN (que gera CSS, não é um arquivo estático mensurável da mesma forma).

---

## 4.4 — Dados estruturados (Schema.org / JSON-LD)

**[VERIFICADO]** Tipos presentes por página, validados com `JSON.parse` (todos os blocos são JSON
válido em todas as 6 páginas — zero erro de sintaxe):

| Página | Tipos JSON-LD presentes | Esperado pelo `CLAUDE.md` |
|---|---|---|
| `index.html` | `ProfessionalService`, `BreadcrumbList` | `ProfessionalService` ✅ |
| `servicos.html` | `ItemList`, `BreadcrumbList` | `ItemList` ✅ |
| `quem-somos.html` | `Person`, `BreadcrumbList` | `Person` + `ProfessionalService` ⚠️ |
| `blog-sci.html` | `CollectionPage`, `BreadcrumbList` | `CollectionPage` ✅ |
| `blog-sci/avcb-clcb.html` | `Article`, `BreadcrumbList` | `Article` ✅ |
| `contato.html` | `LocalBusiness`, `BreadcrumbList` | `LocalBusiness` ✅ |

- **[VERIFICADO] Prioridade MÉDIA — `quem-somos.html` não tem um bloco `ProfessionalService`
  separado**, apenas um objeto `ProfessionaService` *aninhado* dentro de `Person.worksFor`. O
  `CLAUDE.md` (seção "Schema.org — padrão por tipo de página") especifica "Quem Somos: `Person`
  (responsável técnica) + `ProfessionalService`" como dois blocos — nas demais páginas que têm
  mais de um tipo de entidade principal (ex.: nenhuma outra página tem esse padrão de "dois
  tipos principais", então não há comparação direta), o padrão do site é sempre um bloco JSON-LD
  dedicado por tipo + um `BreadcrumbList` dedicado. Hoje `quem-somos.html` tem só 2 blocos
  (`Person` e `BreadcrumbList`), com o `ProfessionalService` "escondido" dentro do `worksFor`.
  **Impacto prático:** o Google ainda consegue extrair alguns dados da empresa via `worksFor`
  (é um padrão válido do schema.org), mas não é tratado como uma entidade `ProfessionalService`
  de primeira classe nessa página — menos robusto para rich results focados na empresa (em vez da
  pessoa) nessa URL específica. **Fix:** adicionar um terceiro bloco `<script type="application/
  ld+json">` com `ProfessionalService` completo (nome, `legalName`, `sameAs`, `areaServed`,
  `openingHours`) em `src/pages/quem-somos.html`, no mesmo padrão dos outros blocos dedicados.
  **Esforço estimado:** baixo.

- **[VERIFICADO] Prioridade MÉDIA — `Person` (Cassia, em `quem-somos.html`) não inclui o número
  de registro CAU/SP (00A1858351) em nenhum campo estruturado.** O `hasCredential` só tem a
  especialização ("Engenharia de Incêndio"), sem um segundo item de credencial para o registro
  profissional, nem o campo `identifier`. Esse número é citado no `CLAUDE.md` como dado real
  confirmado e é um dos maiores ativos de credibilidade/E-E-A-T da empresa (prova de registro
  profissional ativo) — vale representá-lo de forma estruturada, não só em texto visível.
  **Fix sugerido (schema.org válido):** adicionar um segundo item em `hasCredential`:
  `{"@type": "EducationalOccupationalCredential", "credentialCategory": "Registro Profissional",
  "name": "CAU/SP 00A1858351"}` — ou usar o campo `identifier` do `Person`. **Esforço estimado:**
  baixo.

- **[VERIFICADO] Prioridade BAIXA — `Article` (`blog-sci/avcb-clcb.html`) tem `publisher` do tipo
  `Organization`, mas sem o campo `logo`.** O Google documenta `publisher.logo` como recomendado
  para rich results de `Article` (ajuda a exibir a marca corretamente nos resultados). Hoje
  `publisher` só tem `@type`, `name` e `url`. **Fix sugerido:** adicionar
  `"logo": {"@type": "ImageObject", "url": "https://alfasci.com.br/assets/logo/logo-color.svg"}`
  (ou uma versão raster, já que alguns validadores de rich snippet preferem PNG/JPG a SVG para
  logos — **[HIPÓTESE]**, não confirmado se o Google aceita SVG aqui). **Esforço estimado:** baixo.

- **[VERIFICADO] Zero resíduo de `FAQPage`** em todo o site — confirmado grep vazio por
  `"@type": "FAQPage"` em todas as páginas geradas. Correto, consistente com a ocultação do FAQ.

---

## 4.5 — Palavras-chave e intenção de busca

**[VERIFICADO]** Estrutura de H2/H3 de `servicos.html` (página central para mapeamento de
palavras-chave de serviço):

```
H2: Todos os serviços da Alfa Prev
  H3: Projetos de Prevenção e Combate a Incêndio (PPCI)
  H3: Assessoria Técnica para AVCB / CLCB
  H3: Venda, Inspeção e Recarga de Extintores
  H3: Teste hidrostático de mangueiras de incêndio
  H3: Sinalização de Emergência
  H3: Digitalização de Projetos Arquitetônicos
  H3: Precisa de assessoria personalizada para o seu imóvel?
H2: Solicitar orçamento para os serviços
```

- **[VERIFICADO] Positivo, sem achado** — cada H3 de serviço já usa o termo de busca específico
  provável (ex.: "teste hidrostático de mangueiras de incêndio", "sinalização de emergência") em
  vez de um rótulo genérico. Isso é consistente com boas práticas de SEO on-page (correspondência
  entre heading e intenção de busca transacional/informacional por serviço).
- **[VERIFICADO] Prioridade BAIXA — `index.html` e `contato.html` usam "Segurança Contra Incêndio"
  no título/descrição (ver 4.1), o que na prática funciona como uma *segunda* palavra-chave
  guarda-chuva concorrendo com "Engenharia de Incêndio" nas demais páginas.** Do ponto de vista
  puramente de SEO (ignorando a regra de copy do `CLAUDE.md` por um momento), isso não é
  necessariamente negativo — pode até capturar buscas com os dois termos. Mas como o `CLAUDE.md`
  já decidiu unificar a terminologia, o ideal é alinhar por consistência de marca, não por SEO per
  se. **[HIPÓTESE]** o impacto de SEO de unificar é neutro a levemente positivo (menos diluição
  de sinal temático entre páginas).
- **[HIPÓTESE] — não medido com ferramenta de keyword research** (fora do escopo/sem acesso a uma
  ferramenta paga): não é possível confirmar volume de busca real para termos como "AVCB", "CLCB",
  "PPCI", "regularização bombeiros SP" etc. Qualquer afirmação sobre volume de busca seria
  invenção — não incluída aqui.

---

## 4.6 — SEO local

**[VERIFICADO]** `LocalBusiness` (`contato.html`) e demais menções de NAP (Name/Address/Phone)
revisadas:

- **telephone**: `+5511989325513` — **[VERIFICADO]** consistente com o dado confirmado no
  `CLAUDE.md` em todas as ocorrências (JSON-LD, `wa.me` links, texto visível).
- **email**: `contato@alfasci.com.br` — **[VERIFICADO]** consistente em todas as ocorrências.
- **endereço físico**: **[VERIFICADO] ausente em todo o site**, por decisão de negócio documentada
  no `CLAUDE.md` ("NÃO USAR ENDEREÇO EM LUGAR NENHUM DO SITE"). Isso é esperado e correto para
  este negócio (atendimento no local do cliente), mas tem uma implicação prática de SEO local:
  **[HIPÓTESE]** sem endereço físico, o site não pode usar completamente o schema `PostalAddress`
  nem concorrer plenamente no "local pack" do Google Maps da forma tradicional — isso é uma
  limitação já conhecida do modelo de negócio, não um defeito do site. O `CLAUDE.md` já lista
  "Criar/verificar Google Business Profile" como pendência pós-publicação — para negócios sem
  endereço público, o Google Business Profile permite configurar "área de atendimento" em vez de
  endereço (opção "Service Area Business"). Mencionado aqui apenas como contexto, não como ação
  desta auditoria.
- **[VERIFICADO] Prioridade MÉDIA — nome da empresa inconsistente entre o `CLAUDE.md` e o JSON-LD
  (ver detalhe completo em 4.7, E-E-A-T/NAP)**: `LocalBusiness.name`, `Person.worksFor.name` e
  também `ProfessionalService.name` (`index.html`) usam "Alfa Prev - Segurança Contra Incêndios",
  enquanto o nome fantasia confirmado é apenas "Alfa Prev". Isso afeta diretamente a consistência
  de NAP entre o site e qualquer perfil externo (Google Business Profile, redes sociais) que use
  "Alfa Prev" sem sufixo — inconsistência de NAP é um fator negativo documentado para SEO local.

---

## 4.7 — E-E-A-T (Experience, Expertise, Authoritativeness, Trust) e consistência de NAP

- **[VERIFICADO] Prioridade MÉDIA — variação de nome de marca em 4 pontos do código:**
  - `robots.txt` (comentário): "Alfa Prev - Segurança Contra Incêndios"
  - `quem-somos.html` → JSON-LD `Person.worksFor.name`: "Alfa Prev - Segurança Contra Incêndios"
  - `contato.html` → JSON-LD `LocalBusiness.name`: "Alfa Prev - Segurança Contra Incêndios"
  - `index.html` → JSON-LD `ProfessionalService.name`: "Alfa Prev - Segurança Contra Incêndios"

  O `CLAUDE.md` confirma a razão social completa (`ALFA SEGURANÇA CONTRA INCÊNDIO LTDA`) e o nome
  fantasia (`Alfa Prev`) como os dois únicos nomes oficiais — "Alfa Prev - Segurança Contra
  Incêndios" não é nenhum dos dois, é uma terceira variação híbrida. O `legalName` nesses mesmos
  blocos JSON-LD já usa corretamente a razão social completa — então o problema é só no campo
  `name`, que deveria ser exatamente `"Alfa Prev"`. **Impacto em E-E-A-T:** mecanismos de confiança
  do Google (e de qualquer usuário comparando o site a outras fontes, como Google Business
  Profile, redes sociais) dependem de o nome da entidade aparecer de forma idêntica em todos os
  lugares — essa variação é pequena, mas é exatamente o tipo de inconsistência que esses
  mecanismos são desenhados para notar. **Fix sugerido:** trocar `name` para `"Alfa Prev"` nos 3
  blocos JSON-LD e no comentário de `robots.txt`. **Esforço estimado:** baixo (4 arquivos).

- **[VERIFICADO] Positivo — credenciais da responsável técnica (Cassia) presentes e corretas** no
  texto visível de `quem-somos.html` (nome completo, CAU/SP 00A1858351, "+8 anos" via contador JS,
  "+50 mil m²"), consistente com o `CLAUDE.md`. O gap é só na representação *estruturada*
  (JSON-LD) do registro CAU/SP, já reportado em 4.4.

- **[VERIFICADO] Positivo — `sameAs` presente no `LocalBusiness`** (Instagram, Facebook, LinkedIn),
  o que ajuda o Google a associar o site aos perfis sociais da empresa — boa prática de E-E-A-T.
  **[VERIFICADO] Observação:** o mesmo `sameAs` não está presente no `ProfessionalService` de
  `index.html` nem no `worksFor` de `quem-somos.html` — só em `contato.html`. **[HIPÓTESE]**
  replicar o `sameAs` nos outros blocos de entidade da empresa reforçaria o sinal, mas não é
  incorreto deixá-lo apenas em um bloco (o Google normalmente consolida entidades pelo nome/URL).
  Prioridade BAIXA.

- **[VERIFICADO] Nenhum depoimento, nenhuma avaliação (`AggregateRating`/`Review`) no site** —
  consistente com a regra do `CLAUDE.md` de nunca inventar depoimentos sem confirmação real. Não
  é um achado negativo, é a aplicação correta da regra de honestidade de conteúdo — mas também
  significa que não há sinal de prova social estruturada disponível hoje. **[HIPÓTESE]** se/quando
  depoimentos reais de clientes existirem, adicionar `Review`/`AggregateRating` seria um reforço
  de E-E-A-T — fora do escopo atual por falta de dado real.

---

## 4.8 — Conteúdo

- **[VERIFICADO]** Todas as `<img>` do site público (14 ocorrências em 6 páginas, todas do mesmo
  logo `logo-white.svg` + `logo-icon-dark.svg` no Hero) têm atributo `alt` não vazio (exceto a
  marca d'água decorativa do Hero, `alt=""`, que é o padrão correto para imagens puramente
  decorativas) e têm `width`/`height` explícitos — consistente com o CLS baixo medido em 4.3.
  Nenhuma imagem usa `loading="lazy"`, mas **[HIPÓTESE]** isso não é um problema real aqui: são
  todas o mesmo logo pequeno (poucos KB) no header/footer, sempre visível perto do topo da página
  — lazy-load é uma otimização para imagens abaixo da dobra, que não é o caso.

- **[VERIFICADO] Prioridade BAIXA — todas as 14 ocorrências do `alt` do logo usam o texto "Alfa
  Prev, Segurança Contra Incêndio"**, repetindo a mesma inconsistência de terminologia do item
  4.1/4.7 (deveria ser "Engenharia de Incêndio" pela convenção do `CLAUDE.md`, se o texto alt
  pretende descrever o negócio). Como é um texto só lido por crawlers/leitores de tela (não
  visível ao usuário comum), o impacto de SEO é pequeno, mas é o mesmo tipo de inconsistência
  listada acima — se a correção de terminologia for feita, incluir estes 14 pontos (estão todos em
  `partials/header.html` e `partials/footer.html`, então a correção é centralizada, não por
  página). **Esforço estimado:** trivial (2 arquivos, `header.html` e `footer.html`).

- **[MEDIDO, via Lighthouse accessibility audit] Prioridade MÉDIA — mismatch entre texto visível e
  `aria-label` no botão de WhatsApp flutuante.** O elemento tem `aria-label="Tirar dúvidas sobre
  segurança contra incêndio pelo WhatsApp"`, que (a) não corresponde ao texto visível do botão
  (regra de acessibilidade WCAG sobre nome acessível vs. texto visível, sinalizada pelo próprio
  Lighthouse como `label-content-name-mismatch`) e (b) usa de novo "segurança contra incêndio" em
  vez da terminologia padrão. **Fix sugerido:** alinhar o `aria-label` ao texto visível do botão
  (ou removê-lo se o texto visível já for suficientemente descritivo) e trocar a terminologia.
  Localização: `partials/whatsapp-float.html` (ou onde o botão flutuante estiver definido).
  **Esforço estimado:** baixo.

- **[MEDIDO, via Lighthouse accessibility audit] Prioridade MÉDIA — contraste de cor insuficiente
  em vários elementos de texto**, incluindo: texto cinza claro (`text-gray-400`) no footer, texto
  do botão WhatsApp (`bg-wa-green` com texto claro), e dois links de política de privacidade no
  footer. O Lighthouse reporta `color-contrast` com score 0 (reprovado) para esses elementos
  especificamente. **[HIPÓTESE]** isso provavelmente afeta mais o footer (fundo escuro,
  `corp-black`) do que o conteúdo principal (fundo branco) — mas não medido elemento por elemento
  com um verificador de contraste dedicado (ex.: WebAIM), só via Lighthouse. **Fix sugerido:**
  revisar as combinações de cor no footer contra a escala de contraste WCAG AA (mínimo 4.5:1 para
  texto normal) — provavelmente envolve escurecer o fundo do botão WhatsApp ou clarear o texto
  `text-gray-400`. **Esforço estimado:** baixo a médio (requer teste visual após qualquer ajuste
  de cor, para não reintroduzir o problema oposto).

- **[VERIFICADO] Positivo — nenhum texto `[PREENCHER]`, placeholder ou "lorem ipsum" encontrado em
  conteúdo visível** (já confirmado na varredura de bloqueadores da Parte 1, ver
  `publicacao/PUBLICACAO-LOCAWEB.md`). Conteúdo de produção, não rascunho.

- **[VERIFICADO] Positivo — contagem de palavras razoável em todas as páginas** (390 a 1.389
  palavras) — nenhuma página tem "thin content" (geralmente definido como < 300 palavras de texto
  substantivo). `blog-sci.html` (hub, 390 palavras) é a mais curta, mas é uma página de listagem
  por natureza (links para o artigo), não um problema.

---

## 4.9 — Segurança e conformidade (LGPD, headers, CSP)

- **[VERIFICADO] Positivo — `netlify.toml` define um conjunto robusto de headers de segurança**
  para todo o site (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` com
  `preload`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`), com uma CSP
  própria e mais restrita especificamente para `/leads.html` (`default-src 'none'`, sem Tailwind,
  sem fontes externas). Boa prática, já documentada no `CLAUDE.md`.

- **[VERIFICADO] Prioridade MÉDIA (achado de infraestrutura, não de conteúdo) — o modelo Apache
  criado nesta publicação (`publicacao/modelos/.htaccess`) não replica o header
  `Strict-Transport-Security` presente em `netlify.toml`.** Isso é intencional em parte: o Bloco 2
  do `.htaccess` (force HTTPS + força host sem `www`) está deliberadamente comentado até o SSL ser
  confirmado funcionando na Locaweb (documentado em `PUBLICACAO-LOCAWEB.md` Parte 2, para evitar
  loop de redirecionamento antes do certificado existir). Mas o header HSTS em si (diferente do
  redirect) só tem efeito depois que o navegador já acessou o site por HTTPS pelo menos uma vez —
  **[HIPÓTESE]** poderia ser adicionado ao Bloco 1 (headers sempre ativos) com segurança, sem
  esperar o Bloco 2 ser ativado, já que HSTS não redireciona nada por si só, só instrui o navegador
  a preferir HTTPS em visitas futuras. Isso não foi feito no modelo atual por ter sido tratado como
  parte do mesmo "grupo de risco" do Bloco 2 na elaboração — mas tecnicamente são coisas
  independentes. **Sugestão para um prompt futuro dedicado a ajustar `publicacao/modelos/.htaccess`:**
  mover o header `Strict-Transport-Security` para o Bloco 1 (sempre ativo), mantendo o `mod_rewrite`
  de redirect no Bloco 2 (só após confirmar SSL). **Esforço estimado:** baixo, mas requer decisão
  consciente (não é "bug", é uma lacuna de paridade com o `netlify.toml` que vale uma decisão
  explícita do Artur sobre quando ativar).

- **[VERIFICADO] Observação, prioridade BAIXA — a CSP do site público em `netlify.toml` usa
  `'unsafe-inline'` em `script-src` e `style-src`, e permite `https://cdn.tailwindcss.com` em
  `script-src`.** Isso é uma consequência direta de usar o Tailwind Play CDN (que injeta `<style>`
  inline dinamicamente) — **não é um erro de configuração**, é uma restrição necessária enquanto o
  Tailwind CDN estiver em uso. **[HIPÓTESE] Esse é outro motivo (além de performance, ver 4.3) para
  migrar o Tailwind para build estático**: sem o CDN, a CSP do site público poderia remover
  `'unsafe-inline'` de `script-src` e ficar tão restrita quanto a de `/leads.html` hoje — reduzindo
  a superfície de ataque de XSS. Correlacionado ao achado de performance 4.3, mas reportado aqui
  como achado de segurança independente.

- **[VERIFICADO] Positivo — nenhum SRI (Subresource Integrity) hash no `<script
  src="cdn.tailwindcss.com">` nem no `<link>` de Google Fonts.** Isso é uma lacuna de segurança
  teórica (se o CDN de terceiro for comprometido, o navegador executaria o script sem verificação
  de integridade), mas **[HIPÓTESE]** o Tailwind Play CDN gera conteúdo dinâmico por design
  (não é um arquivo estático versionado), o que o torna **incompatível com SRI** por natureza (o
  hash mudaria a cada atualização do serviço). Essa lacuna desaparece completamente se a migração
  para Tailwind compilado (achado 4.3) for feita, já que o CSS compilado passaria a ser servido
  localmente, sem depender de CDN de terceiro para essa parte. Não reportável como "corrigível
  isoladamente" — está acoplado ao achado de performance.

- **[VERIFICADO] Positivo — formulário de contato tem duplo honeypot** (checkbox `botcheck` do
  Web3Forms + campo de texto oculto `#hp-website`), validação client-side e `registrar_lead` via
  RPC no Supabase (não `INSERT` direto), consistente com o `CLAUDE.md`. Nenhum achado.

- **[VERIFICADO] Positivo — banner de cookies LGPD presente**, com persistência via `localStorage`
  (`alfaprev_cookie_pref`), e página de política de privacidade com texto inline em `contato.html`.
  Não há Google Analytics/GTM nem nenhum rastreador de terceiro no site (confirmado via grep — zero
  ocorrência de `gtag`, `google-analytics`, `googletagmanager`, `facebook.net/.../fbevents` em todo
  o HTML/JS) — consistente com a proibição do `CLAUDE.md` e com o princípio de governança desta
  auditoria (nunca recomendar GA/GTM). As únicas métricas são first-party, via
  `assets/js/metricas.js` → Supabase do próprio projeto.

- **[VERIFICADO] Positivo — arquivo de política de privacidade existe e é referenciado no
  formulário** (checkbox de consentimento LGPD obrigatório antes do envio, conforme módulo 6 do
  `script.js` documentado no `CLAUDE.md`). Não auditado em profundidade jurídica (fora do escopo
  técnico desta auditoria e da competência de uma IA de código — recomendação: revisão jurídica
  humana antes da publicação, já listada como bloqueador em `PUBLICACAO-LOCAWEB.md`).

---

## 4.10 — Preparação para Google Ads (se aplicável no futuro)

**[HIPÓTESE] — não solicitado nem confirmado como objetivo atual do negócio**, mas incluído por
completude do escopo original da auditoria:

- Páginas de destino (`index.html`, `servicos.html`, `contato.html`) já têm CTAs claros (WhatsApp +
  formulário), tempo de carregamento desktop bom (medido: 0.8s LCP), mas tempo de carregamento
  mobile ruim (medido: 6.0s LCP) — **[MEDIDO]** isso é diretamente relevante para Google Ads: o
  Quality Score de campanhas leva em conta a experiência de página de destino, e o Google
  historicamente pondera performance mobile com peso maior. **Se Google Ads for considerado no
  futuro, resolver o achado de performance (4.3) antes de qualquer campanha paga é prioritário** —
  do contrário, o custo por clique tende a ser mais caro por Quality Score mais baixo.
- Não há pixel de conversão de nenhuma plataforma de anúncio instalado (consistente com "zero
  rastreadores de terceiro" documentado acima) — se Google Ads for adotado, a Alfa Prev precisará
  decidir entre (a) não rastrear conversões de anúncio (mede só pelo dashboard `/leads` interno,
  perdendo atribuição automática) ou (b) adicionar tracking de conversão do Google Ads, o que
  reabriria a discussão de rastreadores de terceiro hoje proibida pelo `CLAUDE.md`. **Essa é uma
  decisão de negócio, não uma recomendação desta auditoria** — só reportando a tensão entre as
  duas regras caso o tema surja no futuro.

---

## 4.11 — Mensuração

- **[VERIFICADO] Positivo — métricas first-party via `assets/js/metricas.js`**, sem cookies, sem
  rastreadores de terceiro, eventos `page_view` e `whatsapp_click` gravados via RPC Supabase
  (`registrar_evento`), visualizáveis no dashboard interno `/leads` (gráficos SVG, sem biblioteca
  externa). Essa arquitetura é **mais alinhada à LGPD** do que GA4 (que depende de banner de
  consentimento mais complexo e transferência de dados a servidor de terceiro).
- **[VERIFICADO] Lacuna conhecida e já documentada no `CLAUDE.md`**: sem GA4 (removido
  deliberadamente), a Alfa Prev não tem acesso a relatórios de aquisição de tráfego por canal
  (orgânico vs. direto vs. redes sociais) com o mesmo nível de detalhe que o GA4 ofereceria — só
  tem `page_view`/`whatsapp_click` agregados. **[HIPÓTESE]** isso é uma troca aceitável dado o
  princípio de governança do projeto (nunca usar rastreadores de terceiro) — não é um "bug", é uma
  escolha arquitetural consciente, mas vale deixar explícito que a profundidade analítica
  disponível é menor que a de ferramentas de terceiro por design.
- **[VERIFICADO] Positivo — Search Console (gratuito, não é rastreador de comportamento de
  usuário, é uma ferramenta de webmaster do próprio Google) está corretamente listado como
  pendência de pós-publicação no `CLAUDE.md` e detalhado no guia (`PUBLICACAO-LOCAWEB.md` Parte 3,
  item 9)** — verificação de propriedade via TXT no DNS da Locaweb, sem necessidade de nenhum
  script adicional no site.

---

## 4.12 — Plano de ação priorizado

Ordenado por prioridade (ALTA → MÉDIA → BAIXA), cada item com página/arquivo afetado e esforço
estimado. Nenhum destes itens foi implementado nesta auditoria — ficam como lista de prompts
futuros, a critério do Artur.

### Prioridade ALTA

| # | Achado | Arquivo(s) | Esforço |
|---|---|---|---|
| 1 | Performance mobile 36/100 — migrar Tailwind CDN para build estático compilado | `partials/head-common.html`, `build.js`, todas as páginas (efeito indireto) | Médio |
| 2 | LCP mobile 6.0s (consequência direta do item 1) | mesmo acima | Médio (resolvido junto) |

### Prioridade MÉDIA

| # | Achado | Arquivo(s) | Esforço |
|---|---|---|---|
| 3 | Nome da empresa inconsistente ("Alfa Prev - Segurança Contra Incêndios" vs. "Alfa Prev") | `robots.txt`, `src/pages/quem-somos.html`, `src/pages/contato.html`, `src/pages/index.html` | Baixo |
| 4 | `quem-somos.html` sem bloco `ProfessionalService` dedicado | `src/pages/quem-somos.html` | Baixo |
| 5 | `Person` sem registro CAU/SP estruturado | `src/pages/quem-somos.html` | Baixo |
| 6 | Título/descrição de `index.html` e `contato.html` usam "Segurança Contra Incêndio" em vez de "Engenharia de Incêndio" | `src/pages/index.html`, `src/pages/contato.html` | Baixo |
| 7 | `aria-label` do botão WhatsApp não corresponde ao texto visível + usa terminologia divergente | `partials/whatsapp-float.html` | Baixo |
| 8 | Contraste de cor insuficiente em footer/botão WhatsApp/links de privacidade | `partials/footer.html`, CSS relacionado | Baixo/Médio |
| 9 | `.htaccess` modelo sem HSTS no Bloco 1 (paridade com `netlify.toml`) | `publicacao/modelos/.htaccess` | Baixo (requer decisão consciente) |

### Prioridade BAIXA

| # | Achado | Arquivo(s) | Esforço |
|---|---|---|---|
| 10 | `alt` do logo (14 ocorrências) usa "Segurança Contra Incêndio" | `partials/header.html`, `partials/footer.html` | Trivial |
| 11 | Comentário de `robots.txt` com nome de marca divergente | `robots.txt` | Trivial |
| 12 | `Article.publisher` sem campo `logo` | `src/pages/blog-sci/avcb-clcb.html` | Baixo |
| 13 | `sameAs` presente só em `LocalBusiness`, não replicado em outros blocos de entidade | `src/pages/index.html`, `src/pages/quem-somos.html` | Baixo |
| 14 | Títulos de `index.html` (94) e `servicos.html` (82 chars) podem truncar na SERP | `src/pages/index.html`, `src/pages/servicos.html` | Baixo |

---

## 4.13 — Expectativas realistas

- **Nenhuma destas correções garante uma posição específica no Google.** SEO on-page (o que esta
  auditoria cobre) é necessário mas não suficiente — ranqueamento também depende de fatores fora
  do controle do código (autoridade de domínio, backlinks, idade do domínio, concorrência local,
  sinais de comportamento do usuário ao longo do tempo). O site ainda não foi publicado sob o
  domínio final `alfasci.com.br`, então **[HIPÓTESE]** é esperado um período de indexação/ranking
  mais lento nos primeiros meses, independentemente da qualidade técnica do site.
- **O achado de prioridade ALTA (performance mobile) é o único com impacto comprovadamente grande
  e mensurável** nesta auditoria — os demais são, na pior hipótese, pequenos ganhos incrementais
  de consistência/robustez de dados estruturados, não mudanças que por si só movem posições de
  busca de forma dramática.
- **Honestidade sobre o que não foi medido:** não há acesso nesta auditoria a Google Search
  Console (site ainda não publicado/verificado), a uma ferramenta de keyword research paga, nem a
  dados reais de concorrência SERP. Qualquer afirmação sobre volume de busca, dificuldade de
  palavra-chave ou posição esperada seria invenção — por isso não aparece neste documento.
