# CONTEXTO PARA CLAUDE WEB — Alfa Prev Site
Gerado por Claude Code CLI em: 2026-09-19

Este arquivo documenta o estado atual do site da Alfa Prev, o que foi feito na sessão mais recente e o que ainda está pendente. Serve para troca de informações entre Claude Code CLI e Claude Web.

---

## Sobre o Projeto

**Site:** Alfa Prev (ALFA SEGURANÇA CONTRA INCÊNDIO LTDA)
**Segmento:** Engenharia de prevenção e combate a incêndio em São Paulo
**Stack:** HTML/CSS/JS vanilla + Tailwind CDN + Web3Forms (formulário) + Supabase (leads)
**Domínio:** https://alfasci.com.br (atualizado out/2026 — ver nota abaixo)
**Repositório local:** C:\Users\artur\dev\repository\alfaprev

### Arquitetura
- Arquivos-fonte em `/src/pages/` e `/partials/` — **NUNCA editar os HTMLs da raiz diretamente**
- Build via `npm run build` — regenera todos os HTMLs da raiz e atualiza `CONTEUDO-PAGINAS.md`
- Páginas: Home, Serviços, Quem Somos, Blog SCI (hub + 3 artigos), FAQ, Contato

---

## O que foi feito na sessão de 2026-09-19

### PARTE 1 — E-mail atualizado

**Troca:** `cassia.marques@alfaseguranca.com` → `contato@alfasci.com.br`

Arquivos editados:
- `partials/footer.html` — link `mailto:` e texto exibido
- `src/pages/contato.html` — link e texto no bloco de contato, texto na Política de Privacidade, JSON-LD LocalBusiness
- `src/pages/index.html` — JSON-LD ProfessionalService
- `src/pages/quem-somos.html` — JSON-LD Person/ProfessionalService

**PENDENCIA CRITICA:** O formulário envia e-mail via Web3Forms. O e-mail de destino é configurado NO PAINEL do Web3Forms, não no código. Foi adicionado um comentário de alerta em `script.js` próximo à `ACCESS_KEY`. Para que os leads cheguem ao novo e-mail, é necessário:
1. Acessar https://web3forms.com
2. Criar uma nova chave de acesso registrada com `contato@alfasci.com.br`
3. Substituir o valor de `ACCESS_KEY` em `script.js`

Também confirmar que a caixa `contato@alfasci.com.br` está criada e recebendo mensagens. Na época desta sessão (set/2026), o domínio do e-mail (`alfasci.com.br`) era diferente do domínio do site (`alfaprev-sci.com.br`); em out/2026 o cliente decidiu unificar os dois no mesmo domínio `alfasci.com.br` (ver `CLAUDE.md`).

---

### PARTE 2 — Telefone/WhatsApp atualizado

**Troca:** `(11) 94566-5263` / `5511945665263` → `(11) 98932-5513` / `5511989325513`

Formatos atualizados:
- Texto exibido: `(11) 98932-5513`
- Links `tel:`: `tel:+5511989325513`
- Links `wa.me`: número atualizado em todos os links
- JSON-LD `telephone`: `+5511989325513`

Arquivos editados:
- `partials/header.html` — botão WhatsApp desktop e mobile
- `partials/footer.html` — link de telefone e WhatsApp no ícone social
- `partials/whatsapp-float.html` — botão flutuante
- `src/pages/index.html` — 3 links WhatsApp (hero, legislação teaser, final CTA) + JSON-LD
- `src/pages/contato.html` — link tel: + JSON-LD
- `src/pages/quem-somos.html` — 2 links WhatsApp + JSON-LD
- `src/pages/servicos.html` — link WhatsApp no banner de CTA

---

### PARTE 3 — Terminologia: "Obtenção" no H1 do Hero

**Troca específica no H1 da Home:**
- Antes: "...Assessoria Técnica para **Regularização** de AVCB/CLCB..."
- Depois: "...Assessoria Técnica para **Obtenção do** AVCB/CLCB..."

Arquivo editado: `src/pages/index.html`

Nota: outros usos de "regularização" no site foram mantidos como estavam (ex: "Regularização não é opcional", "processo de regularização") — refletem conceito geral correto.

---

### PARTE 4 — "Situação de emergência" substitui "princípio de incêndio"

Locais atualizados:
- `src/pages/index.html` — parágrafo do Hero
- `src/pages/faq.html` — resposta FAQ-3 (HTML visível) + JSON-LD FAQPage (texto do schema)

---

### PARTE 5 — Mensagem WhatsApp unificada

**Mensagem anterior (variação 1):** "Olá! Gostaria de mais informações sobre os projetos de prevenção e combate a incêndio da Alfa Prev."
**Mensagem anterior (variação 2):** "Olá! Preciso de assessoria em segurança contra incêndio e AVCB/CLCB. Podem me ajudar?"
**Mensagem anterior (variação 3):** "Olá! Gostaria de falar com a Alfa Prev sobre um projeto de segurança contra incêndio."
**Mensagem anterior (variação 4):** "Olá! Gostaria de uma avaliação técnica personalizada da Alfa Prev para o meu imóvel."

**Nova mensagem única (todos os links):**
"Olá equipe Alfa Prev, gostaria de saber mais sobre os serviços oferecidos por vocês falando com um especialista."

URL codificada: `https://wa.me/5511989325513?text=Ol%C3%A1%20equipe%20Alfa%20Prev%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20oferecidos%20por%20voc%C3%AAs%20falando%20com%20um%20especialista.`

Todos os links `wa.me` do site foram atualizados com essa mensagem e o novo número.

---

### PARTE 6 — Rótulos do formulário simplificados

Arquivo: `src/pages/contato.html`
- `Ocupação / Projeto` → `Ocupação`
- `Tipo de Serviços / Projeto` → `Tipos de Serviços`

---

### PARTE 7 — Revalidação de SEO

Achados e correções:
1. **OG/Twitter title da Home** continham "Engenharia de Segurança" (terminologia antiga) — corrigido para "Engenharia de Incêndio".
2. **H1 único por página:** confirmado em todas as 9 páginas.
3. **Alt text:** logo tem alt descritivo em todas as ocorrências; marca d'água decorativa tem `alt=""` correto com `aria-hidden="true"`.
4. **Geo tags:** já presentes em todas as páginas via `head-common.html` (Guarulhos/SP).
5. **Sitemap.xml:** `lastmod` atualizado para 2026-09-19 nas páginas modificadas.
6. **JSON-LD:** todos os blocos atualizados com novo email/telefone e "situação de emergência" na FAQPage.
7. **Palavras-chave:** distribuição natural verificada — AVCB, CLCB, PPCI, extintores, Estado de São Paulo, Guarulhos presentes nas páginas corretas.
8. **Links internos:** estrutura de links entre páginas verificada e OK.

Arquivo completo da auditoria: `AUDITORIA-SEO-REVALIDACAO.md`

---

### PARTE 8 — CLAUDE.md atualizado

As seguintes informações foram atualizadas no `CLAUDE.md`:
- E-mail de contato
- Telefone/WhatsApp
- Convenções desta rodada (obtenção, situação de emergência, mensagem WhatsApp)

---

## Estado atual do site (2026-09-19)

### Dados de contato ativos no site
| Campo | Valor |
|---|---|
| Telefone/WhatsApp | (11) 98932-5513 / +5511989325513 |
| E-mail exibido | contato@alfasci.com.br |
| WhatsApp mensagem | "Olá equipe Alfa Prev, gostaria de saber mais sobre os serviços oferecidos por vocês falando com um especialista." |

### Pendências críticas (antes de publicar)
1. **Web3Forms:** criar chave no painel para `contato@alfasci.com.br` e atualizar `ACCESS_KEY` em `script.js`
2. **Caixa de e-mail:** confirmar que `contato@alfasci.com.br` está ativa e recebendo
3. **Supabase:** criar projeto, rodar `supabase-schema.sql`, preencher `assets/js/config.js`
4. **Hospedagem:** escolher (Netlify recomendado, `netlify.toml` já configurado)

### Pendências de conteúdo (aguardando Cassia)
Marcadas com `<!-- REVISAR COM CASSIA -->` no código:
- Numeração das ITs com o Decreto 69.118/2024
- NBR 12962 (edição 2016 — ainda vigente?)
- VIA-FÁCIL e TAACB (plataforma digital do Decreto 69.118)
- Demais impactos do Decreto 69.118/2024 nos serviços

---

## Arquivos importantes para Claude Web saber

| Arquivo | O que é |
|---|---|
| `CLAUDE.md` | Documento central de contexto do projeto |
| `CONTEUDO-PAGINAS.md` | Conteúdo textual de todas as páginas (gerado automaticamente) |
| `AUDITORIA-SEO-REVALIDACAO.md` | Auditoria de SEO desta sessão |
| `AUDITORIA-SEGURANCA-SEO.md` | Auditoria de segurança anterior |
| `AUDITORIA-CONTEUDO.md` | Auditoria de conteúdo anterior |
| `GUIA-PUBLICACAO-INICIANTE.md` | Guia passo a passo para publicar |
| `supabase-schema.sql` | Schema SQL pronto para o Supabase |
| `netlify.toml` | Configuração de deploy (Netlify) |
| `build.js` | Script de build (gera HTMLs da raiz a partir de src/pages + partials) |

---

## Como o Claude Code CLI trabalha neste projeto

1. **Editar:** sempre em `src/pages/` ou `partials/` — nunca na raiz
2. **Construir:** `npm run build` após cada edição
3. **Verificar:** abrir o arquivo gerado na raiz (ex: `index.html`) no navegador — não o arquivo-fonte
4. **Commitar:** com mensagem descritiva após cada sessão funcional

---

## Perguntas para Claude Web fazer ao Artur (sugestões)

- A caixa de e-mail `contato@alfasci.com.br` já foi criada?
- A nova chave do Web3Forms já foi registrada com o novo e-mail?
- Há confirmação da Cassia sobre as pendências técnicas (ITs, NBR 12962, VIA-FÁCIL)?
- Qual é a data prevista para publicação do site?
