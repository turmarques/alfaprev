# AUDITORIA-SEO-REVALIDACAO.md
Gerada em: 2026-09-19

Revalidação completa de SEO após rodada de atualizações de contato, terminologia, formulário e metadados.

---

## 1. Consistência de metadados

### Corrigidos nesta rodada
- **OG title / Twitter title da Home (`src/pages/index.html`):** "Engenharia de Segurança" substituído por "Engenharia de Incêndio" nos campos `og:title` e `twitter:title` — eram os únicos lugares restantes com a terminologia antiga.
- **JSON-LD `email`** em todas as páginas com o campo: atualizado para `contato@alfasci.com.br`.
- **JSON-LD `telephone`** em todas as páginas com o campo: atualizado para `+5511989325513`.
- **Página `index.html`:** ProfessionalService JSON-LD atualizado (email + telephone).
- **Página `contato.html`:** LocalBusiness JSON-LD atualizado (email + telephone).
- **Página `quem-somos.html`:** Person/ProfessionalService JSON-LD atualizado (email + telephone).

### Estado atual — OK
Todos os `<title>`, `<meta name="description">`, OG, Twitter Card e JSON-LD foram verificados e estão consistentes com o conteúdo visível atual.

---

## 2. Sitemap.xml

**Verificado e atualizado:**
- Todas as URLs do site atual estão presentes: `/`, `/servicos.html`, `/quem-somos.html`, `/blog-sci.html`, `/blog-sci/avcb-clcb.html`, `/blog-sci/lei-kiss-decreto-69118.html`, `/blog-sci/vencimento-avcb-clcb.html`, `/faq.html`, `/contato.html`.
- Nenhuma URL antiga (`sobre.html`, `legislacao.html`) aparece.
- Datas `lastmod` atualizadas para 2026-09-19 nas páginas que sofreram alterações nesta rodada: `/`, `/servicos.html`, `/quem-somos.html`, `/faq.html`, `/contato.html`.

---

## 3. robots.txt

**OK — sem alteração necessária.**
Permite todos os crawlers e aponta corretamente para `https://alfaprev-sci.com.br/sitemap.xml`.

---

## 4. Hierarquia de headings

Verificado em todas as páginas geradas:

| Página | H1s encontrados | Status |
|---|---|---|
| index.html | 1 | OK |
| servicos.html | 1 | OK |
| quem-somos.html | 1 | OK |
| blog-sci.html | 1 | OK |
| faq.html | 1 | OK |
| contato.html | 1 | OK |
| blog-sci/avcb-clcb.html | 1 | OK |
| blog-sci/lei-kiss-decreto-69118.html | 1 | OK |
| blog-sci/vencimento-avcb-clcb.html | 1 | OK |

Todas as páginas têm exatamente um H1. Hierarquia H2/H3 verificada e lógica nas páginas principais.

---

## 5. Alt text de imagens

- **Logos (`logo-white.svg`, `logo-color.svg`):** alt descritivo "Alfa Prev, Segurança Contra Incêndio" em todas as ocorrências. OK.
- **Marca d'água Hero (`logo-icon-dark.svg`):** `alt=""` com `aria-hidden="true"` no wrapper — correto, pois é puramente decorativa.
- **og:image (`logo-dark-bg.jpg`):** referenciada corretamente nas metatags de todas as páginas. OK.

---

## 6. Links internos

Verificado nas páginas principais:
- Home: links para Serviços (teaser + nav), Blog SCI (teaser + nav), Quem Somos (teaser + nav), FAQ (nav), Contato (CTA principal + nav).
- Serviços: link para Contato (CTA principal), link para FAQ (seção de dúvidas).
- Blog SCI: link para Serviços e Contato (CTAs nos artigos via partials).
- FAQ: link para Contato (CTA principal), link para Blog SCI e Serviços (seção "Veja também").
- Quem Somos: link para Contato (CTA principal).
- Contato: link para Política de Privacidade (âncora na mesma página).

Estrutura de links internos consistente. OK.

---

## 7. Dados estruturados (JSON-LD)

Validados estruturalmente:

| Página | Tipo | Status |
|---|---|---|
| index.html | ProfessionalService + BreadcrumbList | OK — email e telephone atualizados |
| servicos.html | ItemList + BreadcrumbList | OK |
| quem-somos.html | Person + BreadcrumbList | OK — email e telephone atualizados |
| blog-sci.html | CollectionPage + BreadcrumbList | OK |
| blog-sci/avcb-clcb.html | Article + BreadcrumbList | OK |
| blog-sci/lei-kiss-decreto-69118.html | Article + BreadcrumbList | OK |
| blog-sci/vencimento-avcb-clcb.html | Article + BreadcrumbList | OK |
| faq.html | FAQPage + BreadcrumbList | OK — resposta FAQ-3 atualizada para "situação de emergência" |
| contato.html | LocalBusiness + BreadcrumbList | OK — email e telephone atualizados |

Todos os blocos JSON-LD estão sintaticamente válidos (estrutura verificada manualmente). Nenhum validador externo foi acessado no ambiente CLI; recomenda-se validar em https://search.google.com/test/rich-results após publicação.

---

## 8. Mobile-friendliness e Core Web Vitals

Nenhuma mudança estrutural que possa afetar responsividade foi introduzida nesta rodada. Todas as alterações foram de conteúdo textual, URLs e metadados. O CSS e o layout permanecem idênticos.

Riscos conhecidos pré-existentes:
- Tailwind CDN em produção pode gerar pontuação PageSpeed < 70 em mobile. Avaliar migração para Tailwind compilado após publicação.

---

## 9. Palavras-chave

Distribuição dos termos centrais verificada na CONTEUDO-PAGINAS.md gerada:

| Termo | Presença |
|---|---|
| AVCB | Todas as páginas principais |
| CLCB | Todas as páginas principais |
| PPCI | Home, Serviços, FAQ, Blog SCI |
| segurança contra incêndio | Todas as páginas |
| extintores | Serviços, FAQ, Blog SCI |
| Estado de São Paulo | Todas as páginas (nav/footer) |
| Guarulhos | geo.placename nas metatags de todas as páginas via head-common |
| Engenharia de Incêndio | Todas as páginas (tag de seção e metadados) |

Distribuição natural. Nenhum problema de keyword stuffing ou ausência detectado.

---

## 10. Geo tags

Presentes via `head-common.html` em todas as páginas:

```html
<meta name="geo.region" content="BR-SP">
<meta name="geo.placename" content="Guarulhos, São Paulo">
<meta name="geo.position" content="-23.4630;-46.5333">
<meta name="ICBM" content="-23.4630, -46.5333">
```

OK. Todas as 9 páginas geradas herdam as geo tags.

---

## Resumo de pendências pós-auditoria

1. **Reconfigurar Web3Forms:** o e-mail de destino do formulário é determinado pelo painel do Web3Forms, não pelo código. Acessar web3forms.com, criar nova chave associada a `contato@alfasci.com.br`, e substituir `ACCESS_KEY` em `script.js`. Comentário de alerta adicionado no código.
2. **Validar JSON-LD com Rich Results Test:** após publicação em https://search.google.com/test/rich-results.
3. **Confirmar caixa `contato@alfasci.com.br`:** verificar que o e-mail já existe e está recebendo mensagens antes de considerar a migração de contato concluída.
4. **PageSpeed Insights:** avaliar após publicação; migrar Tailwind para versão compilada se nota mobile < 70.
