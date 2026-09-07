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
| Endereço | Rua Floro de Oliveira, nº 491, Jardim Adriana, Guarulhos/SP |
| Telefone/WhatsApp | +55 11 94566-5263 / (11) 94566-5263 |
| E-mail | cassia.marques@alfaseguranca.com |
| Instagram | @alfaprev_sci |
| Facebook | https://www.facebook.com/profile.php?id=61594085214860 |
| Horário | Segunda a Sexta, 09h às 17h (emergências fora do horário também atendidas) |
| Área de atendimento | Todo o Estado de São Paulo |
| Domínio previsto | www.alfaprev.com.br (ainda não registrado em set/2026) |

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
├── sitemap.xml             # Referencia https://www.alfaprev.com.br/
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
| `corp-black` | `#0F172A` | Header, hero, footer, cards escuros |
| `corp-slate` | `#1E293B` | Seção Responsável Técnica, menu mobile |
| `corp-gray` | `#F8FAFC` | Fundo de seções alternadas (Serviços, Contato) |
| `wa-green` | `#25D366` | Botões WhatsApp |
| `wa-green-dk` | `#1DA851` | Hover dos botões WhatsApp |

### Tipografia
- **Família:** Inter (Google Fonts) — fallbacks: `system-ui`, `sans-serif`
- **Pesos usados:** 400, 500, 600, 700, 800

### Diretrizes visuais (evitar "cara de IA")
- Sem gradientes de múltiplas cores ou animações de entrada em scroll
- Hover apenas em CTAs e links — não em blocos inteiros de conteúdo
- Sombras sutis (shadow-sm), não exageradas
- Ícones inline SVG (sem biblioteca externa de ícones)
- Sem frases como "Somos líderes em..." ou "Soluções completas e integradas..."
- Estatísticas concretas e verificáveis (8 anos, +50.000 m², CAU/SP 00A1858351)

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
| Canonical URL | `index.html` → `https://www.alfaprev.com.br/` | OK (atualizar se domínio mudar) |
| Link do Facebook | `index.html` footer | OK — `https://www.facebook.com/profile.php?id=61594085214860` |
| og:image | `index.html` → `assets/images/logo-dark-bg.jpg` | Funcional; ideal criar imagem 1200×630 |
| Google Maps iframe | `index.html` seção `#localizacao` | OK — embed do endereço confirmado |

---

## Status Atual e Pendências (setembro 2026)

### Feito ✅
- HTML/CSS/JS completos, site funcional localmente
- Schema.org (ProfessionalService + FAQPage) com dados reais
- robots.txt e sitemap.xml
- Banner de cookies LGPD
- Validação de formulário client-side
- Todos os links externos com `rel="noopener noreferrer"`
- Honeypot duplo no formulário (checkbox Web3Forms `botcheck` + campo texto `#hp-website`)
- netlify.toml com headers de segurança (incluindo `*.supabase.co` no CSP)
- Auditoria de segurança e SEO concluída
- Integração Supabase implementada no `script.js` — aguarda configuração
- `supabase-schema.sql` pronto para rodar no painel do Supabase
- `assets/js/config.js` criado com placeholders

### Pendente antes de publicar 🔴
- [ ] Registrar domínio `alfaprev.com.br`
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
Guia de publicação passo a passo: `GUIA-PUBLICACAO-INICIANTE.md`
