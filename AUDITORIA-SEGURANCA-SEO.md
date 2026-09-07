# Auditoria de Segurança e SEO — Alfa Prev

> Auditoria realizada em setembro de 2026, antes da publicação do site.
> Arquivos analisados: `index.html`, `script.js`, `styles.css`, `robots.txt`, `sitemap.xml`.

---

## PARTE 1 — SEGURANÇA

### ✅ Corrigido automaticamente

| # | O que foi corrigido | Por que importava |
|---|---|---|
| 1 | **`canonical` e `og:url`** substituídos: o placeholder `[URL FINAL DA PÁGINA]` foi trocado por `https://www.alfaprev.com.br/` | Um canonical inválido desorienita o Google (pode tratar o site como duplicata de si mesmo) e os bots do WhatsApp/Facebook não conseguem gerar o preview correto do link. |
| 2 | **`og:image` e `twitter:image`** corrigidos: URL relativa + formato SVG → URL absoluta + JPG (`logo-dark-bg.jpg`) | URLs relativas não funcionam para bots de redes sociais. SVG não é suportado pelo Facebook/WhatsApp para geração de thumbnail. |
| 3 | **Honeypot Web3Forms** adicionado ao formulário de contato (`<input name="botcheck" ...>`) | O campo invisível engana bots de envio automático: um humano nunca marca esse campo, um bot geralmente marca — e o Web3Forms descarta a submissão silenciosamente. Reduz spam sem usar CAPTCHA. |
| 4 | **Comentário de desenvolvimento** `<!-- Facebook: link a confirmar com a responsável -->` removido do HTML | Comentários internos de projeto ficam visíveis em "Ver código-fonte" do navegador — evitar notas de desenvolvimento em produção. |

---

### ⚠️ Requer ação humana (não resolvido automaticamente)

#### 1. Chave do Web3Forms — `SUA_CHAVE_WEB3FORMS` (pendente crítico)
**O que é:** O formulário de contato usa o serviço Web3Forms para enviar os dados por e-mail. A chave de integração (`access_key`) está como placeholder `SUA_CHAVE_WEB3FORMS` em `script.js` (linha ~271).

**Por que importa:** Sem uma chave real, o formulário nunca funciona — o botão "Enviar" sempre mostrará erro.

**O que fazer:**
1. Acesse [web3forms.com](https://web3forms.com) e crie uma conta gratuita.
2. Cadastre o e-mail `cassia.marques@alfaseguranca.com`.
3. Copie a chave gerada e substitua `SUA_CHAVE_WEB3FORMS` no arquivo `script.js`.

**Sobre o risco de spam:** A chave fica visível no código-fonte (JavaScript no navegador). Isso é esperado e aceito pelo Web3Forms — eles protegem via rate limiting e honeypot (já configurado). Qualquer pessoa que encontrar a chave poderia enviar e-mails para o endereço da empresa, mas o volume é limitado pelos controles do serviço.

---

#### 2. Tailwind CSS via CDN de desenvolvimento em produção
**O que é:** O site usa `https://cdn.tailwindcss.com` — esta é a versão "Play CDN" do Tailwind, criada para desenvolvimento. Ela carrega um runtime JavaScript que gera o CSS em tempo real no navegador.

**Por que importa:** Dois problemas para produção:
- **Desempenho:** O script JavaScript adiciona 100–200 ms ao carregamento (penaliza o Core Web Vitals, que é fator de ranqueamento Google).
- **Não há SRI (Subresource Integrity):** Não é possível usar `integrity=` neste CDN porque o conteúdo é gerado dinamicamente. Se o CDN for comprometido, código malicioso poderia ser injetado.

**O que fazer (a decidir):** Duas opções:
- **Opção A (recomendada a médio prazo):** Instalar Tailwind via npm e gerar um CSS compilado. Isso elimina ambos os problemas, mas requer um passo de build.
- **Opção B (aceitável para o lançamento):** Manter o CDN por ora e monitorar a pontuação no PageSpeed Insights após publicar. Se o Core Web Vitals for reprovado, migrar para a Opção A.

---

#### 3. Google Analytics 4 — script ausente (e comportamento de cookies)
**O que é:** O `script.js` já tem o código de rastreamento GA4 (`window.gtag`), mas o script de inicialização do GA4 ainda não foi adicionado ao `<head>` do HTML.

**Por que importa:** Sem o script, nenhum dado de visitas é coletado. Além disso, quando o script for adicionado, ele deve ser carregado **somente após o usuário aceitar os cookies** (o banner de consentimento já existe, mas a lógica de ativar o GA após o aceite está comentada em `script.js`).

**O que fazer:**
1. Crie uma conta no Google Analytics 4 e obtenha o Measurement ID (formato `G-XXXXXXXXXX`).
2. Adicione o script de inicialização no `<head>` do `index.html`, mas com carregamento condicional (após consentimento do usuário).
3. Descomente e ajuste o bloco comentado em `script.js` (seção "Banner de Cookies", linhas ~341–347) que ativa o GA após o aceite.

---

#### 4. Headers de segurança HTTP — arquivo `netlify.toml` criado
**O que é:** Criado o arquivo `netlify.toml` com headers de segurança (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.).

**Por que importa:** Headers de segurança são enviados pelo servidor para o navegador e protegem contra ataques como clickjacking (outro site colocar o seu em um iframe) e injeção de scripts externos.

**O que fazer:**
- **Se usar Netlify:** O arquivo `netlify.toml` criado já funciona. Nenhuma ação adicional.
- **Se usar Vercel:** Crie um arquivo `vercel.json` com estrutura equivalente (veja [documentação Vercel headers](https://vercel.com/docs/projects/project-configuration#headers)).
- **Se usar hospedagem compartilhada cPanel:** Crie ou edite o arquivo `.htaccess` na raiz e adicione `Header set X-Frame-Options "SAMEORIGIN"` etc.
- **Atenção:** O `Content-Security-Policy` no `netlify.toml` pode precisar de ajuste se serviços novos forem adicionados (ex: chat ao vivo, fontes de ícones adicionais). Teste sempre após a publicação.

---

#### 5. HTTPS — verificado
Todos os recursos externos já usam `https://`: Tailwind CDN, Google Fonts, Google Maps, Web3Forms API. Nenhum recurso via `http://` encontrado. ✅

---

#### 6. Links externos — verificado
Todos os `target="_blank"` (WhatsApp, Instagram, Google Maps) já possuem `rel="noopener noreferrer"`. ✅

---

#### 7. XSS / injeção — verificado
Nenhum uso de `innerHTML`, `document.write` ou inserção de HTML sem sanitização encontrado em `script.js`. Todas as manipulações de DOM usam `.textContent`, `.classList` e `.setAttribute` — operações seguras. ✅

---

#### 8. Console.log em produção — verificado
Nenhum `console.log` encontrado no código. ✅

---

#### 9. Dados sensíveis no código — verificado
Não há senhas, tokens de acesso privados ou dados de autenticação hardcoded. O e-mail da responsável e o CNPJ são dados públicos exibidos intencionalmente. ✅

---

#### 10. Formulário — validação client-side e server-side
**O que está feito:** Validação no front-end (JavaScript) verifica todos os campos obrigatórios, formato de e-mail e telefone, e o checkbox LGPD antes de permitir o envio.

**O que falta:** Validação client-side **pode ser burlada** (basta desabilitar JavaScript). O Web3Forms oferece a camada server-side, mas depende da chave configurada corretamente (ver item 1). O honeypot adicionado (item 3 das correções) reduz bots. ✅ com ressalvas

---

#### 11. Consentimento LGPD e cookies — verificado
- O banner de cookies aparece após 800ms e não coleta dados antes do aceite. ✅
- O formulário exige o checkbox de consentimento LGPD antes do envio. ✅
- O GA4 não está ativo (script não carregado), portanto nenhuma coleta de analytics ocorre ainda. ✅

---

#### 12. Link do Facebook — placeholder `href="#"`
O ícone do Facebook no rodapé aponta para `href="#"` (placeholder). Não é um problema de segurança, mas deve ser atualizado com a URL real da página do Facebook antes da publicação (ou o ícone removido caso não exista página).

---

## PARTE 2 — SEO / ENCONTRABILIDADE

### ✅ Corrigido automaticamente

| # | O que foi corrigido | Por que importava |
|---|---|---|
| 1 | **Canonical URL** corrigida (ver segurança item 1) | Google usa o canonical para evitar duplicatas. Um valor inválido pode prejudicar o ranqueamento. |
| 2 | **og:url** corrigida (ver segurança item 1) | Necessária para links compartilhados no WhatsApp e Facebook gerarem preview correto. |
| 3 | **og:image / twitter:image** → URL absoluta + JPG | SVG não funciona em pré-visualizações sociais; URL relativa não funciona para crawlers externos. |
| 4 | **Meta description** encurtada de ~225 para ~162 caracteres | Google trunca descrições acima de ~155–160 caracteres no resultado de busca, desperdiçando espaço de persuasão. |
| 5 | **Campo `"url"`** adicionado ao JSON-LD `ProfessionalService` | Informa explicitamente ao Google qual é o site oficial da empresa no Schema.org. |

---

### ⚠️ Requer ação humana

#### 1. Google Search Console — cadastro do site (crítico para indexação)
**O que é:** Ferramenta gratuita do Google que permite submeter o site para indexação, monitorar erros, ver por quais termos você aparece e acompanhar cliques.

**Por que importa:** Sem isso, o Google pode levar semanas ou meses para encontrar o site por conta própria.

**O que fazer:** Ver o GUIA-PUBLICACAO-INICIANTE.md, Seção 7.

---

#### 2. Google Business Profile (fundamental para buscas locais)
**O que é:** O "cartão do Google" que aparece no Maps e nas buscas locais (ex: "segurança contra incêndio guarulhos").

**Por que importa:** Para o segmento de serviços B2B local, uma fatia significativa das buscas acontece com termos geográficos. Sem o perfil, a empresa fica invisível nesse canal.

**O que fazer:** Ver o GUIA-PUBLICACAO-INICIANTE.md, Seção 8.

---

#### 3. Imagem para OG tags — dimensão ideal não verificada
O arquivo `assets/images/logo-dark-bg.jpg` foi configurado como OG image. O ideal para compartilhamentos sociais é uma imagem de **1200×630 pixels**. Verifique se a imagem existente tem essas dimensões ou substitua por uma imagem específica para esse fim (banner da empresa, foto do escritório ou montagem profissional).

Adicione também as tags de dimensão ao `<head>` quando tiver as medidas exatas:
```html
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

---

#### 4. Tailwind CDN e Core Web Vitals (ver item de segurança)
O CDN do Tailwind adiciona um script de runtime que impacta o LCP (Largest Contentful Paint) e pode prejudicar a pontuação no PageSpeed Insights. Após publicar, teste em [pagespeed.web.dev](https://pagespeed.web.dev) e, se a nota for < 70 no mobile, considere migrar para Tailwind compilado.

---

#### 5. Imagens de conteúdo ausentes
O site não possui fotos de projetos executados, da equipe ou do escritório. Imagens reais:
- Ajudam a construir confiança com potenciais clientes.
- Podem aparecer no Google Imagens.
- Reduzem a taxa de rejeição (pessoas ficam mais tempo em páginas com visual rico).

Quando adicionar imagens, use atributos `alt` descritivos com palavras-chave naturais (ex: `alt="Projeto de prevenção e combate a incêndio executado pela Alfa Prev em Guarulhos"`).

---

#### 6. Domínio — não registrado / inconsistência
`robots.txt` e `sitemap.xml` já referenciam `www.alfaprev.com.br`, e as correções aplicadas usam este domínio. Se o domínio final for diferente, todos os seguintes devem ser atualizados:
- `<link rel="canonical">` no `index.html`
- `<meta property="og:url">` no `index.html`
- `og:image` e `twitter:image` (URLs absolutas) no `index.html`
- `"url"` no JSON-LD do `index.html`
- `robots.txt` (linha Sitemap)
- `sitemap.xml` (tag `<loc>`)

---

#### 7. Title — levemente longo
O `<title>` atual tem ~94 caracteres. O Google exibe até ~60–70 caracteres nos resultados de busca antes de truncar. O conteúdo é relevante e rico em palavras-chave; se preferir encurtar para garantir exibição completa, uma opção seria:
> `Alfa Prev | PPCI, AVCB e Segurança Contra Incêndio em SP`

Isso não é crítico, mas vale avaliar.

---

#### 8. Estrutura de headings — verificada ✅
- Um único `<h1>` com os termos principais (PPCI, AVCB/CLCB, Laudos Técnicos). ✅
- `<h2>` em cada seção (Serviços, Legislação, Responsável Técnica, FAQ, Contato, Localização). ✅
- `<h3>` dentro das seções para sub-itens. ✅

---

#### 9. Schema.org — verificado ✅
- `ProfessionalService` com CNPJ, telefone, e-mail, endereço, horário e área de atendimento. ✅
- `FAQPage` com todas as perguntas e respostas. ✅
- Campo `url` adicionado nesta auditoria. ✅

---

#### 10. robots.txt e sitemap.xml — verificados ✅
- `robots.txt` correto, sem bloqueios indevidos. ✅
- `sitemap.xml` presente, com a URL da home. ✅
- Ambos já referenciam `www.alfaprev.com.br` — consistentes com as correções aplicadas.

---

#### 11. Mobile-friendly — verificado ✅
Meta viewport configurada. Layout responsivo com Tailwind. Textos legíveis em telas pequenas. Botões com tamanho adequado para toque. ✅

---

### Resumo de prioridades

| Prioridade | Ação |
|---|---|
| 🔴 Crítico (antes de publicar) | Registrar domínio `alfaprev.com.br` |
| 🔴 Crítico (antes de publicar) | Configurar chave Web3Forms em `script.js` |
| 🔴 Crítico (antes de publicar) | Criar projeto Supabase, rodar `supabase-schema.sql`, preencher `assets/js/config.js` |
| 🟠 Alta (na semana de publicação) | Cadastrar no Google Search Console e enviar sitemap |
| 🟠 Alta (na semana de publicação) | Criar/verificar Google Business Profile |
| 🟠 Alta (na semana de publicação) | Revisar Política de Privacidade — mencionar armazenamento de dados no Supabase (ver nota abaixo) |
| 🟡 Média (1–2 semanas após publicar) | Adicionar script GA4 com controle de consentimento |
| 🟡 Média (1–2 semanas após publicar) | Adicionar URL real do Facebook ou remover ícone |
| 🟡 Média (1–2 semanas após publicar) | Verificar dimensões da og:image e adicionar tags de tamanho |
| 🟢 Baixa (avaliação pós-publicação) | Avaliar migração do Tailwind CDN para versão compilada |
| 🟢 Baixa (longo prazo) | Adicionar fotos reais de projetos e equipe |

---

## PENDÊNCIA LGPD — Armazenamento de dados no Supabase

> Adicionado em setembro de 2026, após implementação da integração com Supabase.

### O que mudou
Além do envio por e-mail (Web3Forms), os dados do formulário de contato (nome, e-mail, telefone, tipo de imóvel, mensagem) agora são armazenados em um banco de dados Postgres gerenciado pelo **Supabase** — um serviço de terceiro com sede nos EUA.

### Por que isso importa para a LGPD
A LGPD (Lei 13.709/2018) exige que a Política de Privacidade do site informe:
- Quais dados são coletados
- Com quais finalidades
- Onde e por quanto tempo são armazenados
- Quem tem acesso (operadores de dados)

O Supabase atua como **operador de dados** (processa os dados em nome da Alfa Prev). Isso precisa constar na política.

### Ações necessárias (decisão humana)

**1. Verificar a região do projeto Supabase**
Ao criar o projeto no Supabase, é possível escolher a região do servidor. Para LGPD:
- **Preferível:** `South America (São Paulo)` — dados permanecem no Brasil
- **Aceitável:** regiões da UE (Alemanha, Irlanda) — GDPR equivale a proteção adequada
- **Menos ideal:** regiões nos EUA — requer cláusulas contratuais adicionais (SCCs)

Como verificar: `Supabase Dashboard → Project Settings → Infrastructure → Region`

**2. Atualizar a Política de Privacidade no `index.html`**
A seção `#politica-privacidade` deve mencionar que os dados também são armazenados no Supabase. Exemplo de trecho a acrescentar:
> *"Os dados coletados pelo formulário de contato são armazenados de forma segura em banco de dados gerenciado pela Supabase Inc. (supabase.com), serviço contratado como operador de dados, em conformidade com as políticas de privacidade deste prestador."*

**3. Verificar o DPA (Data Processing Agreement) do Supabase**
O Supabase disponibiliza um DPA para uso empresarial. Acesse: `supabase.com/privacy` → seção "Data Processing Agreement". Para compliance formal, baixe e arquive o DPA vigente.

**4. Definir e documentar o prazo de retenção dos dados**
A LGPD exige que os dados sejam mantidos apenas pelo tempo necessário. Sugestão:
- Leads com status `convertido` ou `descartado`: podem ser anonimizados após 2 anos
- Leads com status `novo` ou `contatado`: manter enquanto o relacionamento estiver ativo

Isso pode ser feito manualmente via painel do Supabase ou com uma função SQL agendada.
