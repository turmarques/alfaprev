# AUDITORIA DE CONTEÚDO — Alfa Prev
**Data:** setembro/2026 | **Escopo:** todas as páginas do site multi-página

---

## 1. Resumo do que cada página cobre hoje

| Página | Conteúdo atual |
|---|---|
| **index.html** | Hero com H1, CTAs, badges de credibilidade, 4 estatísticas. Teasers de serviços (3 cards), legislação (texto + CTA lateral), responsável técnica (card com stats), CTA final. |
| **servicos.html** | Mini-hero com anchors de navegação. 6 cards completos: PPCI, AVCB/CLCB, Extintores, Teste Hidrostático, Sinalização/Iluminação, Digitalização. Banner de consulta personalizada, CTA ao FAQ e CTA ao Contato. **Novo:** classes de extintores e categorias de sinalização/iluminação expandidas. |
| **sobre.html** | Mini-hero com badges. Seção da responsável técnica (card + 3 estatísticas). Dados institucionais em grid de 6 campos. CTA. |
| **legislacao.html** | Mini-hero com informações de urgência. Conteúdo em 2 colunas (esquerda: texto principal + 4 riscos; direita: CTA sticky). **Novo:** comparativo AVCB×CLCB, base legal (Decreto 56.819/2011 e Lei 13.425/2017), lista de edificações que precisam, processo passo a passo em accordion (5 etapas), validade e renovação. |
| **faq.html** | Mini-hero claro. Accordion com 10 perguntas (7 originais + 3 novas: consequências do vencimento, documentação necessária, quais edificações precisam). JSON-LD FAQPage atualizado. |
| **contato.html** | Mini-hero. Seção de contato (telefone, e-mail, horário) + formulário de orçamento completo. Mapa Google. Política de Privacidade. |

---

## 2. Onde o conteúdo estava raso e foi/pode ser aprofundado

### legislacao.html — CORRIGIDO nesta sessão
- **Antes:** 2 parágrafos explicando AVCB/CLCB + 4 cards de riscos. Sem base legal, sem processo, sem validade, sem diferença técnica entre os dois documentos.
- **Depois:** Adicionados comparativo AVCB×CLCB em cards, referências ao Decreto 56.819/2011 e Lei 13.425/2017 com contexto histórico (Boate Kiss), lista de 10 tipos de edificações, processo em 5 etapas com accordion, parágrafo sobre validade e renovação.
- **Ainda raso:** não há conteúdo sobre casos específicos por tipo de ocupação (ex: como funciona para academias, hospitais, escolas — cada um tem exigências próprias). Pode ser uma oportunidade futura de conteúdo aprofundado.

### servicos.html — CORRIGIDO nesta sessão
- **Antes:** Extintor descrevia pó ABC, CO₂ e água pressurizada, sem listar todas as classes. Sinalização mencionava NBR 13434 e 10898 mas sem detalhar os subtipos.
- **Depois:** 7 classes de extintores listadas (A, BC, ABC, CO₂/BC, AB, K, D). 4 categorias de sinalização/iluminação (orientação, equipamentos, autônoma, centralizada). Ambos marcados para revisão com Cassia.
- **Pendência:** confirmar com a Cassia quais classes/itens a Alfa Prev realmente oferece e remover os `<!-- REVISAR -->`.

### faq.html — CORRIGIDO nesta sessão
- **Antes:** 7 perguntas. Sem pergunta sobre consequências do vencimento, documentação necessária ou quais edificações precisam.
- **Depois:** 10 perguntas. As 3 novas cobrem as lacunas de intenção informacional mais buscada.

### sobre.html — sem conteúdo aprofundado
- Cobre bem os dados institucionais e a responsável técnica.
- **Oportunidade:** adicionar uma seção de metodologia de trabalho da Alfa Prev (como conduz os projetos, o que diferencia a abordagem). Mas isso requer confirmação com a Cassia sobre o processo real.

### contato.html — adequada para o propósito
- Foco transacional puro: formulário + dados de contato. Sem oportunidade de conteúdo informacional (correto para página de conversão).

---

## 3. Lacunas de termos de busca identificadas

| Termo de busca potencial | Página mais adequada | Status |
|---|---|---|
| "decreto 56819 2011 SP incêndio" | legislacao.html | ✅ Coberto (adicionado) |
| "lei kiss incêndio" / "lei 13425" | legislacao.html | ✅ Coberto (adicionado) |
| "classe extintor qual usar" | servicos.html | ✅ Coberto (adicionado) |
| "o que é AVCB" | legislacao.html + faq.html | ✅ Coberto |
| "diferença AVCB CLCB" | legislacao.html + faq.html | ✅ Coberto (expandido) |
| "AVCB vencido consequências" | faq.html | ✅ Coberto (adicionado) |
| "quais documentos AVCB" | faq.html | ✅ Coberto (adicionado) |
| "quem precisa AVCB condomínio" | legislacao.html + faq.html | ✅ Coberto (adicionado) |
| "processo obter AVCB SP" | legislacao.html | ✅ Coberto (accordion adicionado) |
| "validade AVCB anos" | legislacao.html | ✅ Coberto (adicionado) |
| "extintor classe K cozinha industrial" | servicos.html | ✅ Coberto (adicionado) |
| "iluminação emergência autônoma centralizada" | servicos.html | ✅ Coberto (adicionado) |
| "PPCI aprovação bombeiros SP" | servicos.html + legislacao.html | ✅ Coberto |
| "teste hidrostático mangueira NBR" | servicos.html | ✅ Coberto |
| "engenharia incêndio guarulhos" | index.html + todas | Parcial — cidades específicas do interior de SP não cobertas. Oportunidade futura: páginas de localidade se a demanda justificar. |
| "regularização incêndio condomínio residencial" | legislacao.html | ✅ Coberto |
| "RRT ART projeto incêndio" | faq.html | ✅ Coberto (faq-9) |

---

## 4. Onde cabem accordions/abas (situação atual e recomendações)

| Página | Status accordion | Recomendação |
|---|---|---|
| faq.html | ✅ Accordion implementado (10 perguntas) | OK — manter padrão atual |
| legislacao.html | ✅ Accordion adicionado (5 etapas do processo) | OK — conteúdo expandido mas organizado |
| servicos.html | ❌ Sem accordion | **Avaliar futuramente:** se os cards ficarem muito longos com as classes de equipamentos, considerar accordion por serviço. Por ora, os cards ainda têm tamanho razoável. |
| sobre.html | ❌ Sem accordion | Não necessário — conteúdo é compacto |
| index.html | ❌ Sem accordion | Não necessário — é página de overview |
| contato.html | ❌ Sem accordion | Não necessário |

---

## 5. Notas de qualidade e pendências de validação

- **Marcadores `<!-- REVISAR COM CASSIA -->`** adicionados nos cards de extintores e sinalização em `servicos.html`. Remover após confirmação de quais itens a empresa realmente oferece.
- **Schema.org** atualizado: BreadcrumbList em todas as 6 páginas, FAQPage com 10 questões, geo tags em head-common.
- **Conteúdo da legislação:** referências ao Decreto 56.819/2011 e Lei 13.425/2017 são factuais e verificáveis. Nunca afirmados valores de multa (que mudam) ou prazos específicos do CBPMESP (que variam por unidade).
- **Classes de extintor:** listagem baseada nas classes oficiais NBR — mas confirmação de quais a Alfa Prev realmente fornece é necessária antes da publicação definitiva.
