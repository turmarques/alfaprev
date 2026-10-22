# Relatório de Palavras-chave, Google Ads e Relevância nas Buscas — Alfa Prev

**Data da análise:** 2026-10-18
**Autor:** Claude Code (análise autônoma, somente leitura — nenhum arquivo do site, código, banco de dados ou configuração de servidor foi alterado)
**Arquivo gerado:** apenas este documento, na raiz do projeto.

## Como ler este relatório

Toda afirmação está marcada com um destes três selos:

- **[VERIFICADO]** — confirmado lendo o código-fonte real do site nesta análise.
- **[OBSERVADO]** — visto em um resultado de busca pública durante esta análise (não é garantia de posição nem de volume de busca).
- **[HIPÓTESE]** — julgamento do analista, sem medição. Trate como ponto de partida, não como fato.

Nenhum número de volume de busca, CPC (custo por clique), nível de concorrência, orçamento ou posição esperada foi inventado. Onde esses números importam, a coluna está em branco com a instrução "preencher no Planejador de Palavras-chave do Google".

Termos técnicos do Google Ads (CPC, Quality Score, correspondência de palavra-chave, etc.) são explicados na primeira vez em que aparecem, já que este relatório assume que quem vai executar o trabalho nunca configurou uma campanha.

---

## 1. Resumo (leia isto primeiro)

- **Onde investir primeiro:** os três grupos de maior intenção de compra comprovada pelo próprio conteúdo do site são **AVCB**, **CLCB** e **PPCI** (projeto técnico) — são os três temas com página de serviço dedicada, citação normativa correta e, no caso de AVCB/CLCB, um artigo informacional já publicado. **[VERIFICADO]**
- **Grupos mais promissores para começar:** (1) AVCB — maior volume de busca aparente nas páginas que apareceram na pesquisa pública feita nesta análise **[OBSERVADO]**; (2) CLCB — menos concorrido nos resultados observados, mais fácil de aparecer **[OBSERVADO]**; (3) Manutenção de extintores — intenção de compra recorrente (serviço periódico, não um evento único) **[HIPÓTESE]**.
- **Maiores bloqueadores do próprio site, hoje:**
  1. **Desempenho mobile 36/100** (medido via Lighthouse, causa raiz: Tailwind CSS via CDN) — isso pode prejudicar tanto o SEO orgânico quanto o Índice de Qualidade do Google Ads, encarecendo o clique. **[VERIFICADO]** (ver seção 8)
  2. **Nome da marca inconsistente** em pelo menos 4 variações no código (JSON-LD, `robots.txt`) — confunde o Google sobre qual é o nome oficial da empresa. **[VERIFICADO]**
  3. **`servicos.html`, a página mais importante para anúncios pagos, não tem "CLCB" no `<title>`** — quem pesquisa só por CLCB pode não reconhecer a página como relevante antes mesmo de clicar. **[VERIFICADO]**
- **Decisões que dependem do usuário (não técnicas):** qual caminho de mensuração de conversão adotar (seção 6), qual orçamento diário testar (seção 8), e se vale reativar o FAQ oculto (seção 7).

---

## 2. O que o site cobre hoje e o que foi removido

### 2.1 Páginas e serviços existentes **[VERIFICADO]**

Fonte: `src/pages/*.html` + `partials/*.html`, lidos nesta análise.

| Página | Arquivo-fonte | Função |
|---|---|---|
| Home | `src/pages/index.html` | Hero + teasers de 3 dos 6 serviços, Blog SCI, Quem Somos |
| Serviços | `src/pages/servicos.html` | Os 6 serviços completos, com citação normativa cada |
| Quem Somos | `src/pages/quem-somos.html` | Texto institucional + bloco da responsável técnica (Cassia) |
| Blog SCI (hub) | `src/pages/blog-sci.html` | 1 artigo publicado (AVCB x CLCB) |
| Artigo AVCB x CLCB | `src/pages/blog-sci/avcb-clcb.html` | Conteúdo informacional, `datePublished: 2026-09-12` |
| Contato | `src/pages/contato.html` | Formulário de orçamento, LGPD, dados de contato |
| FAQ (oculto) | `src/pages/faq.html` | Não gerado, não linkado (ver 2.2) |
| Painel `/leads` | `src/pages/leads.html` | Admin interno, `noindex`, fora do escopo de marketing |

Os 6 serviços confirmados em `servicos.html` (anchors `servico-ppci`, `servico-avcb`, `servico-extintores`, `servico-hidrostatico`, `servico-sinalizacao`, `servico-digitalizacao`):

1. **PPCI** — Projeto de Prevenção e Combate a Incêndio
2. **AVCB/CLCB** — Assessoria para Auto de Vistoria e Certificado de Licença do Corpo de Bombeiros (mesma seção/página cobre os dois documentos)
3. **Extintores** — manutenção, classes A, B, C, D, K
4. **Teste hidrostático de mangueiras de incêndio**
5. **Sinalização de Emergência**
6. **Digitalização de Projetos Arquitetônicos**

### 2.2 O que foi removido ou ocultado por decisão de negócio **[VERIFICADO]**

Confirmado contra o código atual (não apenas contra o `CLAUDE.md`):

| O que foi removido/ocultado | Evidência no código atual | Observação para este relatório |
|---|---|---|
| Página FAQ | `build.js` tem `faq.html` em `SKIP_FILES`; não existe `faq.html` gerado na raiz; links "FAQ" comentados em `partials/header.html` e `partials/footer.html`; CTA ao FAQ comentado em `src/pages/servicos.html`; sem entrada em `sitemap.xml` | Conteúdo-fonte intacto (`src/pages/faq.html`, 9 perguntas numeradas). Ver seção 7.3 — não propomos reativar, só avaliamos o impacto. |
| Artigo "Lei Kiss e Decreto 69.118/2024" | Não existe mais arquivo-fonte nem gerado; `blog-sci.html` tem só 1 card de artigo | Termo "Lei Kiss" ainda tem alto volume de busca popular (apareceu nos resultados públicos desta análise como fundamentação legal do AVCB) **[OBSERVADO]** — é um gap de conteúdo informacional, sinalizado na seção 7, sem recomendar reintrodução. |
| Tópico "vencimento do AVCB/CLCB sem renovação" | Artigo inteiro removido (`vencimento-avcb-clcb.html` não existe mais); pergunta correspondente também não existe mais no FAQ oculto (numeração salta de faq-7 para faq-9, sem faq-8) | Termo de alta intenção informacional ("o que acontece se o AVCB vencer") não tem página própria hoje. Decisão de negócio documentada no `CLAUDE.md` — não reintroduzir sem autorização explícita. |
| Opção "Digitalização de Plantas/Projetos" no formulário | `src/pages/contato.html`, select `#tipo-imovel`: opções atuais são `comercial`, `industrial`, `condominio_residencial`, `escritorios`, `outro` | O **serviço** de digitalização continua ativo em `servicos.html#servico-digitalizacao` — só a opção no dropdown de ocupação do formulário foi removida (ela nunca fez sentido ali, já que é tipo de serviço, não tipo de imóvel). |
| Opção "Condomínio Comercial" no formulário | Mesmo select acima — não existe mais essa opção | Substituída por "Escritórios" (`escritorios`), confirmado no mesmo arquivo. |

### 2.3 Dados de contato e atendimento usados neste relatório **[VERIFICADO]**

Fonte: `CLAUDE.md` (dados de negócio confirmados) e JSON-LD de `src/pages/index.html`/`contato.html`.

- Telefone/WhatsApp: +55 11 98932-5513
- E-mail: contato@alfasci.com.br
- Horário comercial: segunda a sexta, 09h às 17h — **com atendimento de emergências fora desse horário** (ver seção 4 para como isso afeta a estratégia de horário de anúncios)
- Área de atendimento: todo o Estado de São Paulo
- **Sem endereço físico publicado** (atendimento no local do cliente) — regra de negócio documentada no `CLAUDE.md`, relevante para a seção 7.4 (Google Business Profile)

---

## 3. Palavras-chave candidatas

### 3.1 Como esta tabela foi construída

Os termos abaixo foram gerados a partir de três fontes combinadas: (a) os serviços e a terminologia real do site **[VERIFICADO]**; (b) padrões de busca comuns no setor observados nos resultados públicos desta análise **[OBSERVADO]**; (c) variações plausíveis (perguntas, "quanto custa", "perto de mim", combinação com região) que ainda não foram medidas **[HIPÓTESE]**. Nenhuma estimativa de volume ou CPC foi inventada — essas colunas ficam em branco, para você preencher no Planejador de Palavras-chave do Google (passo a passo na seção 8.3).

Legenda de colunas:
- **Correspondência sugerida:** ampla, de frase ou exata — os três tipos de "correspondência de palavra-chave" do Google Ads, que controlam o quão parecida a busca do usuário precisa ser do termo cadastrado para o anúncio aparecer. Ampla = mais alcance e menos controle; exata = mais controle e menos alcance.
- **Prioridade:** Alta/Média/Baixa, segundo o julgamento desta análise sobre intenção de compra e alinhamento com o site atual.

### 3.2 Grupo: AVCB

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| avcb | Informacional/Transacional | — | `servicos.html#servico-avcb` | Frase | Alta | [HIPÓTESE] | _preencher_ | _preencher_ |
| o que é avcb | Informacional | — | `blog-sci/avcb-clcb.html` | Frase | Média | [OBSERVADO] | _preencher_ | _preencher_ |
| como tirar avcb | Transacional | — | `servicos.html#servico-avcb` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| avcb são paulo | Transacional/Local | Estado de SP | `servicos.html#servico-avcb` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| empresa para avcb | Transacional | — | `servicos.html#servico-avcb` | Frase | Alta | [HIPÓTESE] | _preencher_ | _preencher_ |
| quanto custa avcb | Comercial (pesquisa de preço) | — | nenhuma hoje (gap) | Frase | Média | [OBSERVADO] | _preencher_ | _preencher_ |
| vistoria corpo de bombeiros | Informacional | — | `blog-sci/avcb-clcb.html` | Ampla | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| projeto técnico avcb | Transacional | — | `servicos.html#servico-ppci` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| renovação de avcb | Transacional | — | `servicos.html#servico-avcb` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |

### 3.3 Grupo: CLCB

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| clcb | Informacional/Transacional | — | `servicos.html#servico-avcb` (sem menção a CLCB no `<title>`) | Frase | Alta | [HIPÓTESE] | _preencher_ | _preencher_ |
| o que é clcb | Informacional | — | `blog-sci/avcb-clcb.html` | Frase | Média | [OBSERVADO] | _preencher_ | _preencher_ |
| certificado de licença do corpo de bombeiros | Informacional | — | `blog-sci/avcb-clcb.html` | Frase | Baixa (termo longo, baixo volume provável) | [OBSERVADO] | _preencher_ | _preencher_ |
| como tirar clcb | Transacional | — | `servicos.html#servico-avcb` | Frase | Alta | [HIPÓTESE] | _preencher_ | _preencher_ |
| clcb para escritório | Transacional | — | nenhuma hoje (gap — único serviço sem página 1:1) | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| diferença entre avcb e clcb | Informacional | — | `blog-sci/avcb-clcb.html` | Frase | Média | [OBSERVADO] | _preencher_ | _preencher_ |

### 3.4 Grupo: PPCI (projeto técnico)

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| ppci | Informacional/Transacional | — | `servicos.html#servico-ppci` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| projeto de prevenção e combate a incêndio | Transacional | — | `servicos.html#servico-ppci` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| empresa de ppci são paulo | Transacional/Local | Estado de SP | `servicos.html#servico-ppci` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| projeto de incêndio para bombeiros | Informacional | — | `servicos.html#servico-ppci` | Ampla | Média | [OBSERVADO] | _preencher_ | _preencher_ |
| engenharia de incêndio são paulo | Transacional/Marca | Estado de SP | `index.html` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |

### 3.5 Grupo: Extintores

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| manutenção de extintores | Transacional | — | `servicos.html#servico-extintores` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| recarga de extintores são paulo | Transacional/Local | Estado de SP | `servicos.html#servico-extintores` | Frase | Alta | [OBSERVADO] | _preencher_ | _preencher_ |
| teste hidrostático de extintores | Transacional | — | `servicos.html#servico-extintores` (sobreposição com o serviço de mangueiras — ver nota) | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| laudo técnico extintores | Transacional | — | `servicos.html#servico-extintores` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| extintor classe k | Informacional | — | `servicos.html#servico-extintores` | Exata | Baixa | [HIPÓTESE] | _preencher_ | _preencher_ |

> Nota: o site tem um serviço específico de "Teste hidrostático de mangueiras de incêndio" (`servico-hidrostatico`), que é diferente de teste hidrostático de **extintores** (regulado por norma própria, NBR 12962, mas tecnicamente distinto de mangueiras/NBR 12779). Confirme com a Cassia se a Alfa Prev também faz teste hidrostático do próprio extintor antes de usar esse termo em anúncios — isto não foi possível confirmar apenas lendo o código do site.

### 3.6 Grupo: Teste hidrostático de mangueiras

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| teste hidrostático de mangueiras de incêndio | Transacional | — | `servicos.html#servico-hidrostatico` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| manutenção de mangueiras de incêndio | Transacional | — | `servicos.html#servico-hidrostatico` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| nbr 12779 | Informacional (nicho) | — | `servicos.html#servico-hidrostatico` | Exata | Baixa | [VERIFICADO — a norma está citada no código] | _preencher_ | _preencher_ |

### 3.7 Grupo: Sinalização de Emergência

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| sinalização de emergência | Transacional | — | `servicos.html#servico-sinalizacao` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| placas de sinalização contra incêndio | Transacional | — | `servicos.html#servico-sinalizacao` | Frase | Média | [HIPÓTESE] | _preencher_ | _preencher_ |
| nbr 16820 sinalização | Informacional (nicho) | — | `servicos.html#servico-sinalizacao` | Exata | Baixa | [VERIFICADO — norma citada no código] | _preencher_ | _preencher_ |

### 3.8 Grupo: Digitalização de Projetos

| Termo | Intenção | Região | Página de destino atual | Correspondência sugerida | Prioridade | Confiança | Volume mensal | CPC estimado |
|---|---|---|---|---|---|---|---|---|
| digitalização de plantas arquitetônicas | Transacional (B2B nicho) | — | `servicos.html#servico-digitalizacao` | Frase | Baixa | [HIPÓTESE] | _preencher_ | _preencher_ |

> Este grupo foi marcado como baixa prioridade porque é um serviço de apoio, não o core de regularização contra incêndio — provavelmente tem volume de busca pequeno e concorrência vinda de empresas de arquitetura/BIM, não de engenharia de incêndio. Avalie no Planejador se vale um grupo de anúncios dedicado ou se é melhor deixar só como item de SEO orgânico na própria página de serviços.

### 3.9 Termos ligados a conteúdo removido, com intenção de compra ainda alta

Flag, sem recomendar reintrodução (decisões de negócio documentadas no `CLAUDE.md`):

- **"o que acontece se o avcb vencer"** / **"avcb vencido multa"** — intenção informacional com viés de urgência (quem busca isso normalmente também precisa regularizar). O artigo que cobria esse tema foi removido por decisão do cliente. **[VERIFICADO + HIPÓTESE sobre intenção]**
- **"lei kiss avcb"** — ainda apareceu como referência legal comum nos resultados públicos desta análise **[OBSERVADO]**. O artigo dedicado foi removido; hoje o site não cita "Lei Kiss" em nenhum lugar.

### 3.10 Lista de palavras-chave negativas (o que excluir dos anúncios)

"Palavra-chave negativa" é um termo que você cadastra no Google Ads para que seu anúncio **nunca** apareça para essa busca, mesmo que contenha palavras parecidas com as suas palavras-chave positivas. Isso evita pagar por cliques de gente que não vai comprar.

| Família | Exemplos de termos a negativar | Por quê |
|---|---|---|
| Vagas de emprego | "vaga bombeiro civil", "emprego engenheiro de incêndio", "currículo brigadista" | Quem busca isso quer emprego, não contratar o serviço. |
| Cursos/certificações | "curso de brigada de incêndio", "curso nr 23", "como ser brigadista" | Intenção educacional, não contratação de projeto/AVCB. |
| Download de normas | "nbr 12962 pdf download", "decreto 69118 pdf", "it 01 corpo de bombeiros download" | Quem só quer o documento gratuito, não um serviço pago. |
| Uso doméstico/residencial de extintor | "como usar extintor em casa", "extintor residencial obrigatório" | Fora do público B2B/condomínio-prédio que a Alfa Prev atende; a Alfa Prev não vende para uso doméstico avulso. |
| Venda de equipamento que a empresa não vende | "comprar extintor", "extintor novo preço", "loja de extintores" | O site oferece **manutenção/serviço técnico**, não varejo de equipamentos — confirmar com a Cassia se há revenda, mas pelo conteúdo atual do site **[VERIFICADO]** não há página de venda de produto. |
| Termos "gratuito" | "avcb grátis", "projeto ppci gratuito", "consultoria incêndio grátis" | Serviço técnico pago; atrai cliques de quem não vai converter. |
| Órgãos públicos / telefones oficiais | "telefone corpo de bombeiros", "bombeiros emergência 193", "via fácil bombeiros login" | Quem busca isso quer contato direto com o órgão público, não uma empresa privada — também evita qualquer aparência de afiliação com o Corpo de Bombeiros (ver política do Google Ads na seção 8.5). |

---

## 4. O que a pesquisa pública mostrou

### 4.1 Limitação importante desta etapa

A ferramenta de busca usada nesta análise retorna resultados e resumos processados por IA, **não uma captura real da página de resultados do Google (SERP) localizada para o Brasil**. Isso significa que **não foi possível observar diretamente**: presença/ausência de anúncios pagos, "as pessoas também perguntam", sugestões de autocompletar, nem buscas relacionadas como apareceriam para um usuário real em São Paulo. Tudo abaixo é apenas sobre **quais domínios e que tipo de página apareceram** nos resultados — não é uma leitura de ranking nem de concorrência publicitária real.

### 4.2 Domínios observados por grupo de termo **[OBSERVADO]**

Nenhum texto de concorrente foi copiado — apenas o domínio e o tipo de página são registrados, como pedido.

| Grupo pesquisado | Domínios/tipos de página observados |
|---|---|
| AVCB (definição, como tirar, custo) | Seprev (órgão estadual), avcbcorpobombeiros.com.br, Expanzio, HS Serv, Casa das Normas (hub de blog com múltiplos artigos "como obter"/"guia completo"), Concenttre, avcbsp.com, DRD2 Engenharia, WHL Engenharia, SELF Engenharia, Forthlux, Lar Pontual, Lima Coelho Engenharia, Engefogo, Impacto Eng. Trab. |
| PPCI | A5S Engenharia, PR Fácil, Cruzeiro Engenharia, DRD2 Engenharia, BIMGO, Anti-Fire Soluções, Cestec Engenharia, Casa Castilho, Coimbra Projetos |
| CLCB | A5S Engenharia, Sallus Engenharia Jurídica, Cruzeiro Engenharia, Dauar Medtra, Portal Incêndio, Licenciei, Hidrocamp, Avante Arquitetura e Regularização, Connapa |
| Manutenção de extintores / "perto de mim" | Incender, Triunfo Extintores, Redentor Extintores, DigFire, Rava Campos, Casa dos Extintores, AP Extintores, GloboFire, Rival do Fogo |

**Padrão observado [OBSERVADO]:** a maioria dos concorrentes visíveis são páginas de **conteúdo em formato de blog/guia** ("como obter", "passo a passo", "guia completo", "quanto custa") hospedadas no próprio domínio da empresa de engenharia — não só páginas de serviço estáticas. Isso é consistente com a estratégia de Blog SCI que o site da Alfa Prev já começou (seção 7).

Nenhum anúncio pago, nenhuma posição de ranking e nenhum dado de "pessoas também perguntam" pôde ser observado com a ferramenta disponível — **[HIPÓTESE]** sobre a existência de concorrência paga nesses termos não pode ser descartada nem confirmada aqui.

### 4.3 Verificação de terminologia oficial **[OBSERVADO]**

Fontes públicas consultadas (sem copiar texto, apenas confirmando nomenclatura):

- **AVCB** confirmado como "Auto de Vistoria do Corpo de Bombeiros", emitido pelo Corpo de Bombeiros da Polícia Militar do Estado de São Paulo (CBPMESP), processado via sistema "Via Fácil Bombeiros" — fonte: Seprev (órgão de transparência do Governo do Estado de SP) e páginas de empresas do setor.
- **CLCB** confirmado como "Certificado de Licença do Corpo de Bombeiros", destinado a edificações de baixo risco (até 750 m², até 3 pavimentos ou 12 m, baixa carga de incêndio, segundo as fontes consultadas) — isso é **consistente** com o framing já usado em `src/pages/blog-sci/avcb-clcb.html` **[VERIFICADO]**.
- **PPCI** confirmado como "Projeto de Prevenção e Combate a Incêndio", documento técnico pré-requisito para o AVCB — terminologia já usada corretamente no site **[VERIFICADO]**.
- Uma fonte observada citou o CLCB como originado no **Decreto Estadual 56.819/2011**, que é o decreto **antigo**, já substituído por **69.118/2024** segundo o `CLAUDE.md` deste projeto (correção feita em set/2026, documentada e validada pela Cassia). Isto é um exemplo de como fontes de terceiros na internet podem estar desatualizadas — **o `CLAUDE.md` deste projeto, já validado pela responsável técnica, deve prevalecer sobre o que apareceu na busca pública**, não o contrário.
- Uma fonte observada mencionou validade do AVCB "de 1 a 5 anos" e vinculada ao "risco da edificação". O `CLAUDE.md` deste projeto já documenta que a faixa correta, validada pela Cassia, é de **1 a 3 anos**, determinada **apenas pela ocupação**, não por "risco" ou complexidade — **esta regra do projeto não deve ser alterada com base no que terceiros publicam**.

---

## 5. Estrutura de campanhas, anúncios e extensões

### 5.1 Estrutura proposta (campanhas e grupos de anúncios)

"Grupo de anúncios" é um conjunto pequeno de palavras-chave bem parecidas entre si, com seus próprios anúncios — a boa prática é um grupo por intenção/serviço, não um grupo genérico "incêndio" com tudo misturado (isso prejudica a relevância do anúncio, explicada na seção 5.4).

| Campanha | Grupo de anúncios | Página de destino | A página atende bem o grupo? |
|---|---|---|---|
| Regularização (AVCB/CLCB) | AVCB | `servicos.html#servico-avcb` | Sim, mas o `<title>` da página não menciona CLCB — ver 5.1.1 |
| Regularização (AVCB/CLCB) | CLCB | `servicos.html#servico-avcb` (mesma seção) | Parcial — ver gap acima |
| Projetos técnicos | PPCI | `servicos.html#servico-ppci` | Sim |
| Manutenção de equipamentos | Extintores | `servicos.html#servico-extintores` | Sim |
| Manutenção de equipamentos | Mangueiras/teste hidrostático | `servicos.html#servico-hidrostatico` | Sim, nicho pequeno |
| Serviços complementares | Sinalização de emergência | `servicos.html#servico-sinalizacao` | Sim |
| Serviços complementares | Digitalização de projetos | `servicos.html#servico-digitalizacao` | Sim, mas prioridade baixa (seção 3.8) |

**5.1.1 Gap identificado:** nenhuma página tem CLCB como protagonista do `<title>`/`<h1>` — isso é relevante tanto para SEO orgânico quanto para o Índice de Qualidade de anúncios pagos no grupo CLCB (ver seção 5.4). Esta é uma correção de conteúdo, fora do escopo de execução autônoma deste relatório — fica registrada para decisão humana futura.

### 5.2 Segmentação geográfica, idioma, dias/horários e dispositivos

- **Geografia:** o site declara atendimento em **todo o Estado de São Paulo** (`areaServed` no JSON-LD) **[VERIFICADO]**, não um raio a partir de um endereço (o site não publica endereço físico). Portanto, a segmentação geográfica correta no Google Ads é **"Estado de São Paulo"** como local de segmentação, não um raio de distância a partir de uma cidade — raio exigiria um ponto de referência que o site intencionalmente não publica.
- **Idioma:** português (Brasil).
- **Dias/horários:** o site informa atendimento comercial de segunda a sexta, 09h às 17h, **com emergências também atendidas fora desse horário** **[VERIFICADO]**. Isso cria uma decisão prática: anúncios fora do horário comercial podem gerar cliques que ninguém responde rápido pelo WhatsApp/telefone, mas o próprio site já atende emergências fora de horário. Uma abordagem possível é segmentar por hora do dia com um lance mais baixo fora do horário comercial e destacar no anúncio apenas o canal que de fato está disponível naquele momento (ex.: formulário de orçamento, que não depende de resposta imediata) — mas isso é uma decisão de atendimento, não uma recomendação técnica desta análise.
- **Dispositivos:** sem exclusão recomendada a priori, mas monitorar separadamente o desempenho mobile depois de rodar a campanha, já que o problema de desempenho mobile do site (36/100, seção 8) pode fazer visitantes mobile abandonarem a página antes de converter — isso tende a aparecer nos próprios relatórios do Google Ads como taxa de conversão mobile mais baixa.

### 5.3 Extensões de anúncio (assets)

"Extensões" (hoje chamadas de "assets" pelo Google) são blocos extras que aparecem junto com o anúncio de texto, sem custo adicional por exibição — você paga só pelo clique, igual ao anúnco principal.

| Extensão | Uso recomendado | Confiança |
|---|---|---|
| **Extensão de chamada** (call asset) | Usar o telefone/WhatsApp real +55 11 98932-5513 | [VERIFICADO — número real existe] |
| **Sitelinks** | Linkar para `servicos.html`, `quem-somos.html`, `contato.html`, `blog-sci.html` | [VERIFICADO — páginas existem] |
| **Callouts** (frases curtas de destaque) | "Atendimento em todo o Estado de SP", "Responsável técnica CAU/SP ativo" — usando só fatos já verificados no site | [VERIFICADO] |
| **Snippets estruturados** | Categoria "Serviços": PPCI, AVCB, CLCB, Extintores, Sinalização, Teste Hidrostático, Digitalização | [VERIFICADO] |
| **Extensão de mensagem (WhatsApp)** | Existe no Google Ads como "message asset", permitindo abrir uma conversa de WhatsApp Business direto a partir do anúncio. A documentação oficial (support.google.com, resposta 14888522) indica que esse recurso tem **requisitos de verificação do anunciante e histórico de conformidade de políticas** antes de ser liberado — não é algo que se ativa automaticamente ao criar a conta. | [OBSERVADO — fonte: Google Ads Help, "About message assets"] |

### 5.4 Rascunhos de anúncios de pesquisa responsivos (RSA)

"Anúncio de pesquisa responsivo" é o formato padrão atual do Google Ads: você fornece várias opções de título (até 15, cada um com **no máximo 30 caracteres**) e várias opções de descrição (até 4, cada uma com **no máximo 90 caracteres**), e o Google testa automaticamente combinações para ver quais convertem melhor — fonte: Google Ads Help, "About responsive search ads" (resposta 7684791).

Todas as contagens abaixo foram calculadas por script (contagem de caracteres real, não por leitura visual) — nenhum título excede 30 caracteres e nenhuma descrição excede 90.

Nenhuma afirmação abaixo promete prazo, aprovação, preço ou qualquer vínculo com o Corpo de Bombeiros. "CAU/SP Ativo: 00A1858351" é o registro profissional real da responsável técnica **[VERIFICADO]**, não uma credencial inventada.

#### Grupo AVCB

**Títulos (15):**
1. Assessoria para AVCB em SP (26)
2. AVCB em Todo Estado de SP (25)
3. Projeto Técnico para AVCB (25)
4. Regularização de AVCB (21)
5. Laudo Técnico para AVCB (23)
6. CAU/SP Ativo: 00A1858351 (24)
7. Suporte até a Vistoria (22)
8. Atendimento em Todo SP (22)
9. Fale no WhatsApp Agora (22)
10. Engenharia de Incêndio (22)
11. Assessoria em PPCI, AVCB (24)
12. Acompanhamento Técnico (22)
13. Seg a Sex, 9h às 17h (20)
14. Orçamento pelo WhatsApp (23)
15. Visita Técnica se Necessário (28)

**Descrições (4):**
1. Assessoria técnica para obtenção do AVCB em edificações de SP. (62)
2. Projeto técnico, laudos e acompanhamento até a vistoria do AVCB. (64)
3. Responsável técnica com registro ativo no CAU/SP. Solicite contato. (67)
4. Atendimento em todo o Estado de São Paulo. Fale pelo WhatsApp. (62)

#### Grupo CLCB

**Títulos (15):**
1. Assessoria para CLCB em SP (26)
2. CLCB para Baixo Risco (21)
3. Regularização de CLCB (21)
4. Projeto Técnico para CLCB (25)
5. Laudo Técnico para CLCB (23)
6. CAU/SP Ativo: 00A1858351 (24)
7. Suporte até a Vistoria (22)
8. Atendimento em Todo SP (22)
9. Fale no WhatsApp Agora (22)
10. Engenharia de Incêndio (22)
11. Documentação para Alvará (24)
12. Acompanhamento Técnico (22)
13. Seg a Sex, 9h às 17h (20)
14. Orçamento pelo WhatsApp (23)
15. Visita Técnica se Necessário (28)

**Descrições (4):**
1. Assessoria técnica para obtenção do CLCB em edificações de baixo risco. (71)
2. Projeto, laudos e acompanhamento até a emissão do CLCB. (55)
3. Responsável técnica com registro ativo no CAU/SP. Solicite orçamento. (69)
4. Atendimento em todo o Estado de São Paulo. Fale pelo WhatsApp. (62)

#### Grupo PPCI

**Títulos (15):**
1. Projeto Técnico PPCI (20)
2. Elaboração de PPCI em SP (24)
3. Engenharia de Incêndio (22)
4. Projeto PPCI com CAU/SP (23)
5. Suporte até a Aprovação (23)
6. Atendimento em Todo SP (22)
7. Fale no WhatsApp Agora (22)
8. Assessoria Técnica PPCI (23)
9. Documentação para PPCI (22)
10. Orçamento pelo WhatsApp (23)
11. CAU/SP Ativo: 00A1858351 (24)
12. Acompanhamento Técnico (22)
13. Seg a Sex, 9h às 17h (20)
14. Visita Técnica se Necessário (28)
15. PPCI para AVCB ou CLCB (22)

**Descrições (4):**
1. Elaboração de Projeto de Prevenção e Combate a Incêndio (PPCI). (63)
2. Projeto técnico com responsável habilitada no CAU/SP. (53)
3. Suporte do projeto PPCI até a aprovação para AVCB ou CLCB. (58)
4. Atendimento em todo o Estado de São Paulo. Fale pelo WhatsApp. (62)

#### Grupo Extintores

**Títulos (15):**
1. Manutenção de Extintores (24)
2. Teste e Recarga (15)
3. Laudo Técnico de Extintores (27)
4. Classes A, B, C, D e K (22)
5. Conforme a NBR 12962 (20)
6. Atendimento em Todo SP (22)
7. Fale no WhatsApp Agora (22)
8. Engenharia de Incêndio (22)
9. Orçamento pelo WhatsApp (23)
10. CAU/SP Ativo: 00A1858351 (24)
11. Visita Técnica se Necessário (28)
12. Manutenção Periódica (20)
13. Seg a Sex, 9h às 17h (20)
14. Extintores para AVCB/CLCB (25)
15. Documentação Técnica (20)

**Descrições (4):**
1. Manutenção e teste de extintores conforme a NBR 12962. (54)
2. Classes A, B, C, D e K de incêndio. Atendimento em todo o Estado de SP. (71)
3. Laudo técnico para regularização junto ao AVCB ou CLCB. (55)
4. Atendimento em todo o Estado de São Paulo. Fale pelo WhatsApp. (62)

### 5.5 Índice de Qualidade (Quality Score) e por que o desempenho mobile importa

"Índice de Qualidade" é uma nota (de 1 a 10) que o Google dá a cada palavra-chave, baseada em três fatores — fonte: Google Ads Help, "About ad quality" (resposta 156066) e "Using Quality Score to improve your performance" (resposta 13738235):

1. **CTR esperado** (a probabilidade de alguém clicar no seu anúncio quando ele aparecer)
2. **Relevância do anúncio** (o quanto o texto do anúncio corresponde à intenção da busca)
3. **Experiência da página de destino** — definida pela documentação oficial como a utilidade e relevância da informação na página, a facilidade de navegação e **a velocidade de carregamento, especialmente em mobile**

Um Índice de Qualidade mais baixo tende a exigir um CPC (custo por clique) mais alto para manter a mesma posição do anúncio — é assim que a "experiência da página de destino" se conecta a custo, segundo a própria lógica publicada pelo Google (fonte acima).

**Relação direta com o achado da auditoria:** `publicacao/AUDITORIA-SEO.md` mediu, via Lighthouse, **36/100 de performance mobile** no site atual, com causa raiz isolada no uso do Tailwind CSS via CDN **[VERIFICADO — medido, não hipótese]**. Como a maioria das buscas de serviços locais acontece em celular, é razoável esperar que esse fator pese contra o componente "experiência da página de destino" do Índice de Qualidade — **mas esta análise não estima nenhum valor de CPC resultante disso**, porque isso dependeria de dados reais da conta de Ads que ainda não existe. A recomendação prática é: **medir o Índice de Qualidade reportado pelo próprio Google Ads depois que a campanha estiver rodando**, e tratar a correção de performance mobile (já pendente no `CLAUDE.md`, seção "Pendente após publicar") como uma prioridade que também afeta anúncios pagos, não só SEO orgânico.

---

## 6. Mensuração de conversão e decisão pendente

### 6.1 O que o site já registra hoje **[VERIFICADO]**

- `assets/js/metricas.js` envia eventos `page_view` e `whatsapp_click` (via clique em qualquer link com classe `cta-whatsapp-*`) para `api/metrica.php`, gravados na tabela `eventos` do MySQL. Sem cookies, sem identificador persistente entre visitas.
- O envio do formulário de contato grava o lead na tabela `leads` via `api/lead.php`, **já incluindo UTM, `gclid`, `sessao_id` e `visitante_hash`**. Isso quer dizer que, se um visitante chegar por um anúncio do Google Ads (que anexa um parâmetro `gclid` na URL), **esse identificador já é capturado e salvo no banco de dados próprio hoje**, mesmo sem nenhuma tag do Google no site.
- Esses dados ficam visíveis apenas no painel interno `/leads` — não há envio automático de volta para o Google Ads hoje.

### 6.2 As três alternativas (sem escolher por você)

**(a) Medir só pelo painel interno + parâmetros de UTM/clique já gravados**
- **Ganho:** zero dependência de terceiros, alinhado à política atual do site (sem GA4/GTM/pixels).
- **Perda:** o Google Ads nunca fica sabendo quais cliques geraram lead — ele continua otimizando "no escuro", sem aprender quais palavras-chave/anúncios convertem de fato.
- **Esforço:** nenhum esforço adicional — já é o estado atual.
- **Risco legal:** nenhum, já está dentro da política de privacidade publicada.

**(b) Importar conversões offline para o Google Ads a partir dos leads**
- Funciona assim: periodicamente, você exporta do seu próprio banco (ou do painel `/leads`) os `gclid` dos leads que de fato converteram, e sobe esse arquivo (ou usa a API) para o Google Ads marcar aquele clique específico como uma conversão.
- **Ganho:** fecha o ciclo "anúncio → clique → lead" sem adicionar nenhuma tag do Google ao site — o `gclid` que fecha esse ciclo **já está sendo capturado hoje** (seção 6.1), então o trabalho que falta é só de exportação/importação, não de instrumentação nova no site.
- **Perda/risco:** processo manual ou que exige um script próprio (fora do escopo deste relatório) para gerar o arquivo de upload; a documentação oficial (support.google.com, resposta 15081888 e resposta 10029210) impõe **janelas de prazo entre o clique e a importação** — por exemplo, a versão "enhanced conversions for leads" rejeita importações feitas mais de 63 dias depois do último clique, segundo a documentação consultada nesta análise; a versão "legada" de importação de conversão offline pode ter regras diferentes — **confirme a janela exata da variante que você escolher na documentação oficial antes de depender disso**, pois isso não foi medido nem confirmado em profundidade nesta análise [OBSERVADO, com incerteza sinalizada].
- Uma versão "melhorada" chamada **enhanced conversions for leads** existe, mas essa versão **exige configurar a "tag do Google" (Google tag) no site**, segundo a documentação oficial — o que reabre a decisão da opção (c) abaixo. A versão clássica ("legacy" offline conversion import, resposta 7014069) parece não exigir tag no site, só o `gclid` capturado e um upload de arquivo/API — mas confirme isso diretamente na conta de Google Ads antes de decidir, já que a documentação mudou mais de uma vez nesse recurso.

**(c) Adicionar a tag de conversão do Google ao site**
- **Ganho:** medição automática e em tempo real, sem processo manual de exportação.
- **Perda/risco:** isso é, por definição, adicionar um rastreador de terceiro ao site — **o projeto hoje não usa nenhum** (GA4/GTM/pixels foram removidos deliberadamente, segundo o `CLAUDE.md`). Adotar essa opção exige revisar o banner de cookies LGPD (`partials/cookie-banner.html`, hoje diz "Este site não usa cookies de rastreamento") e a política de privacidade inline em `contato.html`, para não ficar desalinhado com o que o próprio site declara ao visitante.
- **Esforço:** maior que (b), mas sem trabalho manual recorrente depois de configurado.
- **Risco legal:** exige atenção à LGPD (consentimento explícito antes de carregar a tag, já que ela normalmente grava identificadores no navegador do visitante).

### 6.3 Pergunta de decisão para o usuário

**Dado que o site hoje não usa nenhum rastreador de terceiro por decisão de projeto, e que o `gclid` de cliques pagos já é capturado e salvo no banco próprio: você quer (a) continuar só com o painel interno, (b) usar a importação de conversões offline aproveitando o `gclid` já capturado — mantendo zero tags de terceiro no site, ou (c) adicionar a tag de conversão do Google, reabrindo a revisão do banner de cookies e da política de privacidade?** Esta é uma decisão de negócio/privacidade, não uma decisão técnica — esta análise não escolhe por você.

---

## 7. Relevância orgânica (SEO)

### 7.1 Cobertura de página por grupo de palavra-chave

| Grupo | Cobertura hoje | Observação |
|---|---|---|
| AVCB | Boa | Página de serviço + artigo informacional dedicado + menção no H1 da Home |
| CLCB | Parcial | Compartilha seção/página com AVCB; nenhuma página/título tem "CLCB" como protagonista |
| PPCI | Boa | Página de serviço dedicada, terminologia correta |
| Extintores | Boa | Classes de incêndio detalhadas, norma citada |
| Teste hidrostático (mangueiras) | Boa, nicho pequeno | Seção própria, norma citada |
| Sinalização de Emergência | Boa, nicho pequeno | Seção própria, norma citada |
| Digitalização de Projetos | Fraca (B2B, baixo volume provável) | Seção existe, mas é um serviço de apoio, não core |
| "Quanto custa AVCB/CLCB/PPCI" | Nenhuma | Gap — ver sugestão de pauta 7.2 |
| "O que acontece se o AVCB vencer" | Nenhuma (removido por decisão de negócio) | Não recomendamos reintroduzir — apenas registrado como gap |

### 7.2 Pautas de conteúdo sugeridas para o Blog SCI

Respeitando o `CLAUDE.md` (nenhum dado inventado, citação normativa cautelosa com fonte verificada, terminologia "Engenharia de Incêndio"):

| Título provável | Intenção | Termo principal | Termos secundários | Deve linkar para |
|---|---|---|---|---|
| "CLCB: o que é e quais prédios se qualificam" | Informacional | clcb | o que é clcb, certificado de licença do corpo de bombeiros | `servicos.html#servico-avcb`, `contato.html` |
| "Como funciona a manutenção periódica de extintores" | Informacional | manutenção de extintores | classes de incêndio, nbr 12962 | `servicos.html#servico-extintores` |
| "PPCI: o que entra no projeto técnico de incêndio" | Informacional | ppci | projeto de prevenção e combate a incêndio | `servicos.html#servico-ppci` |

Cada pauta precisa de validação de conteúdo técnico pela Cassia antes de publicar, como já é prática documentada no projeto — isto é uma sugestão de pauta, não um texto pronto.

### 7.3 FAQ oculto: ajudaria o SEO de cauda longa?

"Cauda longa" são buscas mais específicas e em formato de pergunta (ex. "quais edificações precisam de AVCB"), que individualmente têm pouco volume, mas somadas podem trazer tráfego relevante com baixa concorrência.

O FAQ oculto (`src/pages/faq.html`) tem 9 perguntas em formato de pergunta direta, com Schema `FAQPage` já implementado **[VERIFICADO]** — esse formato historicamente ajuda a aparecer em buscas de cauda longa e em "as pessoas também perguntam". **Reativá-lo provavelmente ajudaria o SEO de cauda longa**, mas isso é uma decisão de negócio já tomada (ocultação deliberada, documentada no `CLAUDE.md`) — **nenhuma alteração foi feita**, esta seção só registra o trade-off para quando a decisão for revisitada.

### 7.4 Páginas por cidade: vale a pena?

Como o site atende todo o Estado de SP sem endereço físico, poderia parecer atrativo criar páginas como "AVCB em Guarulhos", "AVCB em Campinas" etc. **Isso tem um risco real de ser penalizado como conteúdo duplicado ou "doorway page"** (página feita só para capturar busca local, sem conteúdo realmente diferente de uma cidade para outra) — isso costuma acontecer quando dezenas de páginas têm o mesmo texto com o nome da cidade trocado.

**Recomendação [HIPÓTESE, mas alinhada com práticas de SEO amplamente documentadas]:** só vale criar uma página por cidade/região se houver conteúdo genuinamente diferente por região (ex. uma observação técnica real sobre exigências daquele município, não apenas "atendemos AVCB em [cidade]" repetido). Como alternativa mais segura, cobrir a busca local através do **Google Business Profile** (seção 7.5) e de uma única página "Área de Atendimento" que liste as regiões servidas sem duplicar texto — mas isso também exigiria decisão/conteúdo humano, não é implementado aqui.

### 7.5 Google Business Profile como empresa de atendimento em área de serviço

- O site não publica endereço físico (regra de negócio) — o Google Business Profile tem uma configuração específica para isso: "Service Area Business" (empresa de área de atendimento), em que o endereço é ocultado ao público e só a área de atendimento é exibida. Confirme essa configuração no painel do Google Business Profile antes de publicar o perfil.
- **Achado importante não resolvido, já documentado no `CLAUDE.md`:** as meta tags `geo.region`, `geo.placename` ("Guarulhos, São Paulo") e `geo.position` em `partials/head-common.html` **[VERIFICADO]** contradizem a regra "sem endereço físico no site". Essa é uma decisão de conteúdo pendente entre o Artur e a Cassia, segundo o próprio `CLAUDE.md` — sinalizada aqui novamente porque afeta diretamente a consistência "NAP" (Nome, Endereço, Telefone) que o Google usa para confiar no Business Profile. Nenhuma alteração foi feita.
- **Consistência de Nome:** o nome da marca aparece de pelo menos 4 formas diferentes no código hoje (ver seção 7.6) — isso precisa ser resolvido **antes** de cadastrar o Business Profile, porque o nome cadastrado lá precisa ser idêntico ao que aparece no site.
- **Avaliações reais:** sem inventar nada, o caminho legítimo é pedir avaliação a clientes reais depois da conclusão de um serviço (ex. um link de avaliação enviado por WhatsApp após a entrega do AVCB/CLCB). Nenhuma avaliação deve ser fabricada ou incentivada com troca de benefício, o que viola as políticas do próprio Google.

### 7.6 Formas legítimas de ganhar links/menções

Sem comprar links (prática que viola as diretrizes do Google e pode penalizar o site):

- Associações profissionais e sindicatos do setor de engenharia/segurança contra incêndio em SP (ex. possível perfil/menção em conselhos como CREA/CAU, se aplicável à atuação da empresa).
- Parceiros de negócio reais (administradoras de condomínio, construtoras, escritórios de arquitetura) que já trabalhem com a Alfa Prev e possam citar o serviço em seus próprios sites.
- Diretórios setoriais legítimos do setor de prevenção contra incêndio (não diretórios genéricos de baixa qualidade).
- O próprio conteúdo do Blog SCI, se for referenciado por outros sites como fonte — isso só acontece organicamente com conteúdo útil e correto, não pode ser forçado.

### 7.7 O que ainda prejudica a relevância, segundo a auditoria já feita

| Achado da auditoria (`publicacao/AUDITORIA-SEO.md`) | Resolvido nesta revisão? | Evidência |
|---|---|---|
| Performance mobile 36/100 (Tailwind CDN) | Não | Ainda é `<script src="https://cdn.tailwindcss.com">` em `partials/head-common.html` **[VERIFICADO]** |
| Nome da marca inconsistente | Não — piorou para 4 variações | `src/pages/index.html`, `quem-somos.html`, `contato.html` têm `"Alfa Prev - Segurança Contra Incêndios"` no JSON-LD; `src/pages/blog-sci/avcb-clcb.html` tem `"Alfa Prev \| ALFA SEGURANÇA CONTRA INCÊNDIO LTDA"` no `Article.author.name`; `robots.txt` tem o mesmo nome incorreto em um comentário **[VERIFICADO]** |
| `quem-somos.html` sem `ProfessionalService` dedicado | Não verificado novamente a fundo nesta análise — não contradiz o achado original | — |
| Registro CAU/SP ausente do `Person` estruturado | Não | `quem-somos.html`, `Person.hasCredential` só tem "Especialização: Engenharia de Incêndio", sem o número do CAU/SP **[VERIFICADO]** |
| `Article.publisher` sem `logo` | Não | Confirmado em `blog-sci/avcb-clcb.html` **[VERIFICADO]** |
| Terminologia "Segurança Contra Incêndio" em vez de "Engenharia de Incêndio" | Não — mais ocorrências encontradas nesta análise | `index.html` (`<title>`), `contato.html` (`<title>`), corpo de texto de `quem-somos.html` em múltiplos parágrafos, `aria-label` de dois links do WhatsApp em `index.html`, `alt` do logo em `header.html`/`footer.html` **[VERIFICADO]** |
| `<title>` de `servicos.html` sem "CLCB" | Achado novo desta análise | **[VERIFICADO]** |

---

## 8. Plano por fases, orçamento, validação no Planejador, riscos e expectativas

### 8.1 Fases

**Fase 0 — antes de gastar qualquer valor em anúncios**
- *Seu trabalho:* decidir a questão da seção 6.3 (mensuração); decidir se corrige as inconsistências de marca/terminologia (seção 7.7) antes ou depois de começar a anunciar — anunciar com uma página inconsistente não impede o anúncio de funcionar, mas prejudica a confiança de quem clica.
- *Trabalho de um prompt futuro dedicado ao Claude Code (não executado aqui):* corrigir o nome da marca no JSON-LD/`robots.txt` para "Alfa Prev" em todas as ocorrências; corrigir a terminologia "Segurança Contra Incêndio" → "Engenharia de Incêndio" nos arquivos listados na seção 7.7; adicionar "CLCB" ao `<title>` de `servicos.html`; migrar o Tailwind CDN para uma versão compilada (resolve o achado de performance mobile). Cada um desses é um prompt separado, com decisão humana antes de executar.
- *Trabalho da responsável técnica (Cassia):* validar as pautas de conteúdo do Blog SCI sugeridas na seção 7.2 antes de qualquer publicação.

**Fase 1 — primeiras semanas, campanha pequena e controlada**
- *Seu trabalho:* criar a conta do Google Ads (seção 8.3), validar os termos candidatos no Planejador de Palavras-chave, escolher um orçamento diário baixo (seção 8.2) e ativar só 1–2 grupos de anúncios dos mais prioritários (AVCB e PPCI, segundo esta análise).
- Monitorar o Índice de Qualidade reportado pelo próprio Google Ads e comparar com o que esta análise previu na seção 5.5.

**Fase 2 — ajustar com dados reais**
- *Seu trabalho:* depois de alguns leads reais, ajustar lances, pausar termos sem conversão, adicionar negativas que apareceram no relatório de termos de pesquisa (um relatório do próprio Google Ads que mostra a busca exata que disparou o anúncio).
- *Trabalho de um prompt futuro dedicado:* se a opção (b) da seção 6.2 for escolhida, construir o processo/script de exportação de `gclid` + resultado do lead para importação de conversão offline.

**Fase 3 — escalar**
- *Seu trabalho:* ampliar para os grupos de prioridade média (CLCB, Extintores, Sinalização, Mangueiras) só depois de validar que os grupos de prioridade alta têm custo por lead sustentável para o negócio.

### 8.2 Lógica de orçamento (sem inventar números)

O orçamento diário de uma campanha de pesquisa normalmente é calculado assim: **valor de um lead fechado** (quanto a Alfa Prev ganha, em média, ao converter um orçamento em contrato) × **taxa de fechamento** (de quantos leads recebidos, quantos se tornam clientes) = **CPL máximo aceitável** (quanto vale a pena pagar por lead). Nenhum desses três números foi informado nesta análise, então ficam em branco para você preencher:

- Valor médio de um lead fechado: **_______**
- Taxa de fechamento (%): **_______**
- CPL máximo aceitável = valor × taxa: **_______**

Para começar sem gastar muito enquanto você ainda não tem esses números reais, a prática comum é testar com um **orçamento diário baixo** (um valor que você possa perder sem impacto, só para aprender) durante as primeiras semanas, antes de comprometer um orçamento maior — o valor exato de "baixo" depende do seu caixa disponível, que esta análise não tem acesso para estimar.

### 8.3 Como validar no Planejador de Palavras-chave do Google, passo a passo para quem nunca usou

Fonte: documentação oficial e páginas de terceiros consultadas nesta análise, já que a documentação oficial direta do Keyword Planner ficou mais difícil de localizar isoladamente — trate o passo a passo abaixo como **[OBSERVADO]**, não [VERIFICADO] linha por linha na documentação oficial.

1. Crie ou acesse uma conta Google normal, depois acesse **ads.google.com**.
2. Se o Google pedir para criar uma campanha logo de início, procure o link **"Alternar para o modo especialista"** (ou "Expert mode") — isso evita ser obrigado a configurar uma campanha paga só para acessar as ferramentas.
3. Na tela de criação de conta sem campanha, escolha a opção equivalente a **"Criar conta sem campanha"**.
4. No menu, vá em **Ferramentas e configurações → Planejamento → Planejador de Palavras-chave**.
5. Escolha **"Descobrir novas palavras-chave"**.
6. Cole até 10 termos por vez das tabelas da seção 3 (ex.: avcb, como tirar avcb, clcb, ppci, manutenção de extintores).
7. Antes de clicar em "Obter resultados", confira o filtro de localização — ajuste para **"São Paulo, Brasil"** (estado), para não misturar dados de busca de outros estados/países.
8. Leia a coluna de **volume médio de buscas mensais** — o Planejador normalmente mostra uma **faixa** (ex. "1 mil a 10 mil"), não um número exato, a menos que a conta já tenha gasto o suficiente em anúncios.
9. Preencha as colunas em branco das tabelas da seção 3 com os valores reais que você encontrar (volume e a estimativa de CPC que a ferramenta mostrar).
10. Repita para cada grupo de termos da seção 3.

### 8.4 Expectativas realistas

Sem prometer resultado: um domínio recente, sem histórico de campanhas, normalmente passa por um período inicial em que o próprio Google ainda está "aprendendo" o padrão de conversão da conta — isso é esperado, não é falha da campanha. SEO orgânico para um domínio novo (`alfasci.com.br`, publicado em 2026) tipicamente leva **meses, não dias**, para ganhar posição consistente, mesmo com conteúdo correto — isso é um padrão amplamente conhecido do setor de SEO, não uma garantia específica desta análise. Nenhuma posição, prazo exato ou volume de lead é prometido aqui.

### 8.5 Riscos e conformidade

- **Políticas do Google Ads aplicáveis ao setor:** a política de "Misrepresentation" (deturpação) do Google proíbe qualquer anúncio que **dê a entender afiliação com um órgão/agência governamental sem ser** — isso é diretamente relevante aqui, porque o serviço depende do Corpo de Bombeiros (órgão público) para a emissão final do AVCB/CLCB. **Nunca** usar frases como "aprovação garantida pelo Corpo de Bombeiros" ou qualquer linguagem que sugira que a Alfa Prev é parte do órgão público ou tem relação oficial com ele — fonte: Google Ads Advertising Policies Help, "Unacceptable business practices" e "Misleading representation" (respostas 15938071 e 15936666).
- **Reivindicações enganosas:** a política geral "False, misleading, or unrealistic claims" proíbe prometer resultado específico (ex. "AVCB garantido em 15 dias") — todos os rascunhos de anúncio da seção 5.4 já evitam isso deliberadamente.
- **LGPD:** os dados coletados pelo formulário (nome, e-mail, telefone, tipo de imóvel, resumo do serviço) já têm política de privacidade inline em `contato.html`, incluindo retenção declarada — qualquer novo dado de rastreamento adicionado (ex. se a opção (c) da seção 6 for escolhida) precisa ser refletido nessa política antes de entrar no ar, não depois.
- **Cliques desperdiçados:** a lista de negativas da seção 3.10 é a principal defesa contra gasto sem conversão — revisar o relatório de "termos de pesquisa" do Google Ads semanalmente nas primeiras semanas é a prática recomendada para pegar termos irrelevantes que passaram pela correspondência ampla/frase.

### 8.6 Perguntas que só o usuário pode responder

- Quais dos 6 serviços têm a melhor margem, para priorizar orçamento?
- Existe algum limite real de capacidade de atendimento simultâneo (ex. quantos AVCBs a Alfa Prev consegue tocar ao mesmo tempo)? Isso afeta se vale a pena atrair mais leads do que a empresa consegue atender.
- A empresa realmente atende emergências fora do horário comercial com a mesma velocidade que durante o horário comercial, ou isso é mais uma exceção pontual? (O site declara isso, mas a prática operacional real só o usuário sabe.)
- Qual o tempo médio de resposta a um lead recebido pelo formulário/WhatsApp?
- Quem responde o WhatsApp e em quais horários, de fato?
- Qual orçamento mensal está disponível para testar a campanha na Fase 1?

---

## 9. Fontes consultadas

**Código-fonte do projeto (leitura direta, sem alteração):**
`CLAUDE.md`, `publicacao/AUDITORIA-SEO.md`, `publicacao/RELATORIO-SEO-E-SEARCH-CONSOLE.md`, `src/pages/index.html`, `src/pages/servicos.html`, `src/pages/quem-somos.html`, `src/pages/blog-sci.html`, `src/pages/blog-sci/avcb-clcb.html`, `src/pages/contato.html`, `src/pages/faq.html`, `partials/header.html`, `partials/footer.html`, `partials/whatsapp-float.html`, `partials/head-common.html`, `partials/scripts.html`, `partials/cookie-banner.html`, `build.js` (referência a `SKIP_FILES`), `scripts/empacotar-locaweb.js`, `sitemap.xml`, `robots.txt`.

**Fontes públicas (buscas realizadas nesta análise, [OBSERVADO]):**
- Seprev — Transparência AVCB: https://www.seprev.sp.gov.br/transparencia/certidoes-de-regularidade/avcb-auto-de-vistoria-do-corpo-de-bombeiros
- Diversas páginas de empresas do setor (Expanzio, Casa das Normas, DRD2 Engenharia, WHL Engenharia, A5S Engenharia, Cruzeiro Engenharia, Portal Incêndio, Licenciei, Hidrocamp, Avante Arquitetura, Connapa, Incender, Triunfo Extintores, Redentor Extintores, AP Extintores, GloboFire, Rival do Fogo, entre outras listadas na seção 4.2) — consultadas apenas para observar domínio/tipo de página, nenhum texto copiado.

**Documentação oficial do Google Ads ([OBSERVADO]):**
- About message assets: https://support.google.com/google-ads/answer/14888522
- About responsive search ads: https://support.google.com/google-ads/answer/7684791
- About ad quality: https://support.google.com/google-ads/answer/156066
- Using Quality Score to improve your performance: https://support.google.com/google-ads/answer/13738235
- Guidelines for importing offline conversions: https://support.google.com/google-ads/answer/15081888
- Offline conversion imports FAQs: https://support.google.com/google-ads/answer/10029210
- About enhanced conversions for leads: https://support.google.com/google-ads/answer/15713840
- Import conversions from ad clicks into Google Ads using files (legacy): https://support.google.com/google-ads/answer/7014069
- Unacceptable business practices: https://support.google.com/adspolicy/answer/15938071
- Misleading representation: https://support.google.com/adspolicy/answer/15936666
- False, misleading, or unrealistic claims: https://support.google.com/adspolicy/answer/6086777

---

## Nota sobre empacotamento

Confirmado por leitura de `scripts/empacotar-locaweb.js`: o pacote de publicação (`dist-locaweb/` e o `.zip`) é montado a partir de uma **lista fixa e explícita** de arquivos (`ARQUIVOS_PUBLICAR = [...PAGINAS_HTML, ...ARQUIVOS_RAIZ, ...ARQUIVOS_ASSETS, ...ARQUIVOS_API]`), nunca a partir de uma cópia geral da raiz do repositório. `ARQUIVOS_RAIZ` contém apenas `'robots.txt'` e `'sitemap.xml'`. Nenhum arquivo `.md` aparece em nenhuma das quatro listas. **Portanto, `RELATORIO-PALAVRAS-CHAVE-E-RELEVANCIA.md` não entra no pacote `dist-locaweb/` nem no `.zip` gerado por `npm run empacotar`** — a exclusão já é garantida pelo desenho atual do script (allowlist explícita), sem necessidade de qualquer alteração.
