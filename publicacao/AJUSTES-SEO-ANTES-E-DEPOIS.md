# Ajustes de SEO, Marca e Dados Estruturados — Antes e Depois

Documento gerado em 2026-10-20. Registra todas as alterações feitas nesta tarefa (metadados,
dados estruturados, acessibilidade, comentário do `robots.txt` e `lastmod` do `sitemap.xml`),
mais os achados que foram apenas **relatados** (não corrigidos) por estarem fora do escopo
autorizado (texto visível, design, cores, lógica).

**Nenhum arquivo foi commitado.** Ver lista de arquivos alterados na seção final.

---

## 1. Etapa 1 — Nome da marca

JSON-LD `name` corrigido para exatamente `"Alfa Prev"` (mantendo `legalName` com a razão social
completa) em:

| Arquivo | Campo | Antes | Depois |
|---|---|---|---|
| `src/pages/index.html` | `ProfessionalService.name` | `"Alfa Prev - Segurança Contra Incêndios"` | `"Alfa Prev"` |
| `src/pages/quem-somos.html` | `Person.worksFor.name` | `"Alfa Prev - Segurança Contra Incêndios"` | `"Alfa Prev"` |
| `src/pages/contato.html` | `LocalBusiness.name` | `"Alfa Prev - Segurança Contra Incêndios"` | `"Alfa Prev"` |
| `src/pages/blog-sci/avcb-clcb.html` | `Article.author.name` | `"Alfa Prev \| ALFA SEGURANÇA CONTRA INCÊNDIO LTDA"` (um único campo misturando nome fantasia e razão social) | `"Alfa Prev"` + novo campo `"legalName": "ALFA SEGURANÇA CONTRA INCÊNDIO LTDA"` |
| `robots.txt` (fonte e gerado, são o mesmo arquivo) | comentário da 1ª linha | `# Robots.txt - Alfa Prev - Segurança Contra Incêndios` | `# Robots.txt - Alfa Prev - Engenharia de Incêndio` |

`src/pages/blog-sci.html` já estava correto (`CollectionPage.publisher.name = "Alfa Prev"`) —
nenhuma alteração necessária.

### Varredura de variantes remanescentes

Grep por `Alfa Prev` + (até 3 caracteres) + `Segurança/Seguranca Contra Incêndio` em todo o
repositório (exceto `node_modules/`, `dist-locaweb/`, histórico git), após as correções acima:

- **Único padrão remanescente:** o `alt` de imagem do logo nos partials de header/footer
  (`"Alfa Prev, Segurança Contra Incêndio"`) — tratado na Etapa 2 (é atributo de acessibilidade/
  metadado, não nome de marca em JSON-LD).
- Ocorrências em documentação (`CLAUDE.md`, `publicacao/AUDITORIA-SEO.md`,
  `publicacao/RELATORIO-SEO-E-SEARCH-CONSOLE.md`, `publicacao/RELATORIO-ESTADO-PUBLICACAO.md`,
  `RELATORIO-PALAVRAS-CHAVE-E-RELEVANCIA.md`) são **citações históricas do problema já corrigido**
  — fora do escopo desta tarefa (são relatórios/auditoria, não código do site) e não foram
  alteradas.
- Nenhuma outra ocorrência de "Alfa Prev - Segurança Contra Incêndios" (ou variantes) permanece em
  código do site.

---

## 2. Etapa 2 — Terminologia em metadados (não em texto visível)

"Segurança Contra Incêndio" → "Engenharia de Incêndio" aplicado **apenas** em `<title>`,
`meta description`, `og:*`/`twitter:*`, `aria-label` e `alt` — nunca em texto visível do corpo da
página (já validado pela Cassia).

| Arquivo | Campo | Antes | Depois |
|---|---|---|---|
| `src/pages/index.html` | `og:title` / `twitter:title` | `Alfa Prev \| Segurança Contra Incêndio & Engenharia de Incêndio` | `Alfa Prev \| Engenharia de Incêndio em São Paulo` |
| `src/pages/contato.html` | `og:title` / `twitter:title` | `Contato e Orçamento \| Alfa Prev \| Segurança Contra Incêndio SP` | `Contato e Orçamento \| Alfa Prev \| Engenharia de Incêndio SP` |
| `src/pages/servicos.html` | `og:title` / `twitter:title` | `Serviços de Segurança Contra Incêndio \| Alfa Prev SP` | `Serviços de Engenharia de Incêndio \| Alfa Prev SP` |
| `src/pages/servicos.html` | `ItemList.name` (JSON-LD) | `Serviços de Segurança Contra Incêndio \| Alfa Prev` | `Serviços de Engenharia de Incêndio \| Alfa Prev` |
| `partials/header.html` | `alt` do logo | `Alfa Prev, Segurança Contra Incêndio` | `Alfa Prev, Engenharia de Incêndio` |
| `partials/footer.html` | `alt` do logo | `Alfa Prev, Segurança Contra Incêndio` | `Alfa Prev, Engenharia de Incêndio` |
| `assets/logo/logo-white.svg` | `aria-label` do `<svg>` | `Alfa Prev — Segurança Contra Incêndio` | `Alfa Prev — Engenharia de Incêndio` |
| `assets/logo/logo-color.svg` | `aria-label` do `<svg>` | `Alfa Prev — Segurança Contra Incêndio` | `Alfa Prev — Engenharia de Incêndio` |

Os `<title>`/`meta description` de `index.html` e `contato.html` que também continham o termo
antigo foram reescritos por completo na Etapa 3 (já com a terminologia correta) — ver tabela
da Etapa 3, não duplicados aqui.

### Ocorrências remanescentes em texto visível (listadas, NÃO alteradas)

| Arquivo | Linha | Trecho |
|---|---|---|
| `src/pages/blog-sci.html` | 74 | "...sobre **Segurança Contra Incêndio** no Estado de São Paulo." |
| `src/pages/blog-sci.html` | 86 | "Blog SCI: Legislação, Normas e **Segurança Contra Incêndio** em São Paulo" (H2) |
| `src/pages/blog-sci.html` | 94 | "...legislação de **Segurança Contra Incêndio** vigente." |
| `src/pages/blog-sci/avcb-clcb.html` | 182 | "...aprovação prévia de um Projeto de **Segurança Contra Incêndio** pelo Corpo de Bombeiros." |
| `src/pages/quem-somos.html` | 105 | "...experiência na área de **Segurança Contra Incêndio**..." |
| `src/pages/faq.html` | 99 | "Perguntas Frequentes sobre Regularização de **Segurança Contra Incêndio**" (página oculta, não publicada — `SKIP_FILES`) |

Essas 6 ocorrências são texto corrido já validado pela Cassia; qualquer alteração exige decisão
humana dedicada (fora do escopo autorizado desta tarefa).

---

## 3. Etapa 3 — Títulos e descrições (antes → depois, com contagem de caracteres)

| Arquivo | Campo | Antes (chars) | Depois (chars) |
|---|---|---|---|
| `index.html` | `<title>` | `Alfa Prev \| Projetos de Prevenção e Combate a Incêndio, AVCB e Segurança Contra Incêndio em SP` (94) | `Alfa Prev \| Engenharia de Incêndio, PPCI e AVCB/CLCB em SP` (58) |
| `index.html` | `meta description` | `Alfa Prev \| Projetos de Prevenção e Combate a Incêndio (PPCI), regularização de AVCB/CLCB, laudos técnicos e assessoria técnica especializada em todo o Estado de São Paulo.` (172) | `PPCI, regularização de AVCB/CLCB e laudos técnicos com assessoria em Engenharia de Incêndio em todo o Estado de São Paulo.` (122) |
| `servicos.html` | `<title>` | `Serviços de Prevenção e Combate a Incêndio \| PPCI, AVCB, Extintores \| Alfa Prev SP` (82, **sem CLCB**) | `Serviços de PPCI, AVCB/CLCB e Extintores \| Alfa Prev SP` (55, **CLCB incluído**) |
| `servicos.html` | `meta description` | `Projetos de Prevenção e Combate a Incêndio (PPCI), assessoria para AVCB/CLCB, extintores, teste hidrostático, sinalização de emergência e digitalização de projetos em São Paulo \| Alfa Prev.` (189) | `PPCI, AVCB/CLCB, extintores, teste hidrostático, sinalização de emergência e digitalização de projetos. Atendimento da Alfa Prev em SP.` (135) |
| `contato.html` | `<title>` | `Contato e Orçamento em Segurança Contra Incêndio \| Alfa Prev \| São Paulo` (72) | `Contato e Orçamento \| Alfa Prev \| Engenharia de Incêndio SP` (59) |
| `contato.html` | `meta description` | `Solicite orçamento para projetos de prevenção e combate a incêndio, regularização AVCB/CLCB ou manutenção de equipamentos. A Alfa Prev atende todo o Estado de São Paulo.` (169) | `Solicite orçamento para PPCI, regularização de AVCB/CLCB ou manutenção de equipamentos de incêndio. A Alfa Prev atende todo o Estado de São Paulo.` (146) |

Contagem feita via script Node (`string.length`), não estimativa visual. Todos os novos
`<title>` ficaram ≤ 60 caracteres e todas as `meta description` ≤ 155 caracteres.

`servicos.html` já tinha "AVCB/CLCB" na `meta description`; só o `<title>` estava sem CLCB —
corrigido.

`canonical`, `og:url` e os campos `url`/`@id` do JSON-LD continuam todos apontando para
`https://alfasci.com.br/...` sem `www` — nenhuma inconsistência encontrada.

---

## 4. Etapa 4 — Dados estruturados

1. **`quem-somos.html` — novo bloco `ProfessionalService` dedicado** (além do `Person.worksFor`
   já existente), dado as características reais já usadas em `index.html`/`contato.html`:
   `name: "Alfa Prev"`, `legalName`, `url`, `taxID`, `telephone`, `email`, `areaServed`,
   `openingHours`, `sameAs`. Sem `address` (regra de não publicar endereço físico).

2. **`Person.hasCredential`** (Cassia) — adicionado um 2º item estruturado para o registro
   profissional, usando apenas o dado já visível no site (`CAU/SP 00A1858351`):
   ```json
   { "@type": "EducationalOccupationalCredential", "credentialCategory": "license", "name": "CAU/SP 00A1858351" }
   ```

3. **`Article.publisher.logo`** em `blog-sci/avcb-clcb.html` — adicionado:
   ```json
   "logo": { "@type": "ImageObject", "url": "https://alfasci.com.br/assets/images/logo-dark-bg.jpg" }
   ```
   Arquivo escolhido por já estar na allowlist de publicação
   (`scripts/empacotar-locaweb.js` → `ARQUIVOS_ASSETS`) e já ser usado como `og:image`/
   `twitter:image` em todas as páginas (formato raster, JPG).

4. **`sameAs`** replicado (mesmas 3 URLs já presentes em `contato.html`: Instagram, Facebook,
   LinkedIn) para:
   - `quem-somos.html` → `Person.worksFor` (não tinha) e novo bloco `ProfessionalService` dedicado.
   - `index.html` já tinha `sameAs` — nenhuma alteração necessária lá.

5. **Validação de JSON:** todos os 13 blocos `application/ld+json` de `index.html`,
   `servicos.html`, `quem-somos.html`, `contato.html`, `blog-sci.html` e `blog-sci/avcb-clcb.html`
   foram parseados com `JSON.parse` via script Node — **todos válidos**. Confirmado também que
   não existe `FAQPage`, `AggregateRating` nem `Review` em nenhuma página publicada (o único
   `FAQPage` do repositório está em `src/pages/faq.html`, página oculta via `SKIP_FILES`, não
   gerada nem publicada).

---

## 5. Etapa 5 — Acessibilidade (aria-label)

| Arquivo | Elemento | Antes | Depois |
|---|---|---|---|
| `index.html` (CTA WhatsApp do Hero) | `aria-label` | `Falar com especialista em segurança contra incêndio pelo WhatsApp` (texto visível "Falar com Especialista" não era prefixo exato) | `Falar com Especialista em Engenharia de Incêndio pelo WhatsApp` |
| `index.html` (CTA WhatsApp do teaser Blog SCI) | `aria-label` | `Tirar dúvidas sobre segurança contra incêndio pelo WhatsApp` (texto visível "Tirar dúvidas pelo WhatsApp" não aparecia como substring contígua — gerava o alerta Lighthouse `label-content-name-mismatch`) | `Tirar dúvidas pelo WhatsApp sobre Engenharia de Incêndio` (agora contém a substring exata do texto visível) |

O botão flutuante de WhatsApp (`partials/whatsapp-float.html`) **já estava correto**
(`aria-label="Falar no WhatsApp com a Alfa Prev"`) — confirmado, nenhuma alteração necessária.

### Item de design NÃO alterado (fora de escopo)

- **Contraste de cor no footer** (achado do Lighthouse accessibility, `publicacao/AUDITORIA-SEO.md`
  item #8): elementos de texto cinza sobre `bg-corp-black` no footer (`text-gray-400`,
  `text-gray-500`) têm contraste insuficiente contra o fundo escuro em alguns casos. Requer decisão
  de paleta/design — não tocado nesta tarefa.

---

## 6. Etapa 6 — Sitemap

`build.js` **não gera nem atualiza `lastmod`** — confirmado lendo o arquivo: ele só processa
`src/pages/` e expande partials, não toca em `sitemap.xml`. A atualização de `lastmod` é
inteiramente manual.

`lastmod` atualizado para `2026-10-20` (hoje) nas 5 páginas efetivamente alteradas nesta tarefa:

| URL | `lastmod` antigo | `lastmod` novo |
|---|---|---|
| `https://alfasci.com.br/` | 2026-09-19 | 2026-10-20 |
| `https://alfasci.com.br/servicos.html` | 2026-09-19 | 2026-10-20 |
| `https://alfasci.com.br/quem-somos.html` | 2026-09-19 | 2026-10-20 |
| `https://alfasci.com.br/blog-sci/avcb-clcb.html` | 2026-09-15 | 2026-10-20 |
| `https://alfasci.com.br/contato.html` | 2026-09-19 | 2026-10-20 |

`https://alfasci.com.br/blog-sci.html` **não foi alterado** no conteúdo-fonte desta tarefa — seu
`lastmod` (2026-09-15) foi mantido como estava.

Confirmado: o `sitemap.xml` lista exatamente as 6 páginas públicas esperadas, todas usando
`https://alfasci.com.br` sem `www`. `leads.html` (publicada, porém oculta) continua, corretamente,
fora do sitemap.

---

## 7. Etapa 7 — Verificações sem alteração de código

### 7.1 Extintores: "venda" vs. o que o site realmente oferece

- O H3 visível em `servicos.html` diz **"Venda, Inspeção e Recarga de Extintores"** e o
  `ListItem.name` do JSON-LD repete esse texto.
- O parágrafo de corpo abaixo do H3, porém, descreve apenas: *"Fornecimento, recarga e manutenção
  de todos os tipos de extintores de incêndio..."* e *"inspeção anual ou semestral e recarga
  periódica..."* — nunca menciona "venda" fora do título.
- `RELATORIO-PALAVRAS-CHAVE-E-RELEVANCIA.md` afirma que "o site oferece manutenção/serviço
  técnico, não varejo de equipamentos".
- **Resolvido pelo cliente (2026-10-20):** não é divergência. "Fornecimento" = "Venda" (a Alfa Prev
  vende o extintor ao cliente quando necessário, atuando como intermediadora — o cliente final não
  precisa saber desse detalhe de fornecimento) e "manutenção" = "Inspeção". "Recarga" já aparece
  explicitamente em ambos os textos. O título "Venda, Inspeção e Recarga de Extintores" já reflete
  corretamente a oferta real. **Nenhuma alteração de código necessária.**

### 7.2 Política de privacidade vs. comportamento real da API

- O texto da política (`contato.html`, seção `#politica-privacidade`) declara: *"este site coleta
  métricas anônimas de navegação (...), **sem uso de cookies e sem qualquer identificador que
  permita reconhecer o mesmo visitante em visitas diferentes**."*
- O código real (`api/lead.php`, `api/lib/hash.php`, `database/schema.mysql.sql`) grava, para cada
  lead enviado pelo formulário: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
  `utm_content`, `gclid` e, mais relevante, **`sessao_id`** e **`visitante_hash`** — um hash
  (com sal diário) derivado de IP/User-Agent, especificamente desenhado para permitir correlação
  de eventos de um mesmo visitante (ver `CLAUDE.md`, seção "Métricas, Leads e Painel Administrativo").
  Esse hash é recalculado diariamente (sal diário), então não identifica o mesmo visitante **entre
  dias diferentes**, mas identifica o mesmo visitante dentro do mesmo dia através de múltiplas
  visitas/eventos.
- **Resolvido pelo cliente (2026-10-20):** o `visitante_hash`/`sessao_id` é um dado quantitativo
  (serve apenas para contar número de visitas/eventos, não para identificar quem visitou o site) e
  não é relevante para o aceite de privacidade do visitante. A caracterização da política como
  "sem identificador que permita reconhecer o mesmo visitante" é a leitura pretendida pelo cliente
  (uso estatístico/contagem, não reidentificação de pessoa). **Nenhuma alteração de texto legal
  necessária.**

### 7.3 Meta tags de geolocalização vs. regra "sem endereço físico"

- `partials/head-common.html` expõe, em toda página do site: `geo.region` (`BR-SP`),
  `geo.placename` (`Guarulhos, São Paulo`) e `geo.position`/`ICBM` (coordenadas
  `-23.4630, -46.5333`) — essas coordenadas correspondem ao centro de Guarulhos, não a um endereço
  específico da empresa (a Alfa Prev não tem endereço físico de atendimento, por regra de
  negócio).
- Essa é a mesma contradição já registrada em `publicacao/RELATORIO-ESTADO-PUBLICACAO.md`
  (achado anterior a esta tarefa): a regra "nunca colocar endereço físico no site" convive com
  meta tags que expõem uma localização (ainda que apenas no nível de cidade, não de endereço
  exato).
- **Resolvido pelo cliente (2026-10-20):** a área de atendimento é o Estado de São Paulo inteiro
  (podendo eventualmente atender outros estados para projetos de grande porte) — não apenas
  Guarulhos. `partials/head-common.html` foi corrigido: `geo.position` e `ICBM`
  (coordenadas de ponto único, centro de Guarulhos) foram **removidos**, e `geo.placename` foi
  alterado de `"Guarulhos, São Paulo"` para `"Estado de São Paulo"` (consistente com o `areaServed`
  já usado no JSON-LD). `geo.region` (`BR-SP`) foi mantido — já era um código de nível estadual,
  não específico de cidade. A possibilidade de atendimento ocasional fora de SP (projetos grandes)
  não foi adicionada ao `areaServed` estruturado nem a nenhuma meta tag — é uma exceção pontual, não
  o escopo principal documentado (`CLAUDE.md`: "Área de atendimento: Todo o Estado de São Paulo"); formalizar
  isso no schema é uma decisão de conteúdo maior, fora desta correção pontual de metadados.
  Rebuild e validação (`npm run build`, `npm run seguranca`, `npm test`) executados novamente após
  o ajuste — todos passando.

---

## 8. Etapa 8 — Validação

| Comando | Resultado |
|---|---|
| `npm run build` | ✅ OK — 7 páginas geradas (`faq.html` ignorado por `SKIP_FILES`, como esperado), `CONTEUDO-PAGINAS.md` regenerado, zero erros de sanity check (Tailwind CDN presente em todas as páginas públicas, ausente em `leads.html`, nenhum marcador `INCLUDE` não resolvido). |
| `npm run seguranca` | ✅ OK — "Nenhum bloqueador de segurança conhecido encontrado." |
| `npm test` | ✅ OK — 25/25 testes passando (`bloqueio.js`, `csv.js`, `telefone.js`). |
| `npm run empacotar` | ✅ OK — `dist-locaweb/` gerado com **47 arquivos, 463,5 KB**. `.zip` gerado com sucesso (`alfaprev-site-2026-10-21.zip`, removido após a validação, pois é artefato gitignored e não deve ser mantido no diretório de trabalho). |

Confirmado: **nenhum arquivo `.md` entrou no pacote** (`dist-locaweb/` não contém nenhum arquivo
com extensão `.md` — verificado diretamente na pasta gerada). A allowlist `ARQUIVOS_PUBLICAR` em
`scripts/empacotar-locaweb.js` nunca incluiu documentação.

---

## 9. Decisões pendentes do usuário — resolvidas em 2026-10-20

Todas as 3 decisões listadas originalmente foram respondidas pelo cliente nesta mesma sessão:

1. **Extintores — "Venda" vs. apenas serviço técnico** (Etapa 7.1): confirmado que não é
   divergência ("Fornecimento" = "Venda", "manutenção" = "Inspeção", "Recarga" já explícita).
   Título mantido sem alteração.
2. **Texto da política de privacidade sobre identificação de visitantes** (Etapa 7.2): confirmado
   que o `visitante_hash`/`sessao_id` é uso quantitativo (contagem), não identificação de pessoa —
   irrelevante para o aceite de privacidade do visitante. Texto legal mantido sem alteração.
3. **Meta tags `geo.*`/`ICBM`** (Etapa 7.3): confirmado que a área de atendimento é o Estado de São
   Paulo inteiro. `geo.position`/`ICBM` (ponto único em Guarulhos) **removidos** de
   `partials/head-common.html`; `geo.placename` atualizado para `"Estado de São Paulo"`. Rebuild e
   validação (`build`/`seguranca`/`test`) executados novamente com sucesso.

## 10. O que permanece sem verificação

- **Contraste de cor no footer** (Etapa 5) — segue como item de design pendente, não quantificado
  nesta tarefa com uma nova medição de Lighthouse (o número original está em
  `publicacao/AUDITORIA-SEO.md`).
- **Snapshot real do Lighthouse pós-alteração** — as mudanças desta tarefa são apenas metadados/
  dados estruturados/acessibilidade pontual; não foi rodado um novo Lighthouse para confirmar
  impacto agregado (o achado de performance mobile 36/100, por exemplo, é causado pelo Tailwind via
  CDN e não foi tocado nesta tarefa).
- **Como o Google re-indexará os títulos/descrições reescritos** — só será visível após
  publicação + recrawl; não há como validar isso localmente.

---

## Arquivos alterados nesta tarefa

```
 M CONTEUDO-PAGINAS.md                 (regenerado automaticamente por npm run build)
 M assets/logo/logo-color.svg
 M assets/logo/logo-white.svg
 M blog-sci.html                       (gerado — só reflete o ajuste de geo.* via head-common)
 M blog-sci/avcb-clcb.html             (gerado)
 M contato.html                        (gerado)
 M index.html                          (gerado)
 M partials/footer.html
 M partials/head-common.html          (Etapa 7.3 — geo.position/ICBM removidos, geo.placename
                                        atualizado para "Estado de São Paulo"; via
                                        <!-- INCLUDE:head-common --> isso se propaga para TODAS
                                        as páginas públicas geradas, não só as 5 já listadas aqui)
 M partials/header.html
 M quem-somos.html                     (gerado)
 M robots.txt
 M servicos.html                       (gerado)
 M sitemap.xml
 M src/pages/blog-sci/avcb-clcb.html
 M src/pages/contato.html
 M src/pages/index.html
 M src/pages/quem-somos.html
 M src/pages/servicos.html
```

Nenhum commit foi criado. `dist-locaweb/` e o `.zip` gerados pela validação da Etapa 8 são
artefatos de build (gitignored) — o `.zip` foi removido ao final; `dist-locaweb/` permanece para
inspeção, se desejado, mas deve ser regenerado via `npm run empacotar` antes do upload real.
