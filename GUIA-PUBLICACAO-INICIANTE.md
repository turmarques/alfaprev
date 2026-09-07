# Guia de Publicação — Site Alfa Prev
### Para quem nunca colocou um site empresarial no ar

> Este guia foi escrito para ser seguido do zero, sem assumir conhecimento técnico prévio.
> Siga os passos em ordem — cada etapa depende da anterior.

---

## Antes de começar: o que você vai precisar

Separe antes de iniciar:

- [ ] Acesso ao e-mail da empresa (`cassia.marques@alfaseguranca.com`) para confirmações e cadastros
- [ ] Cartão de crédito ou conta bancária (para pagar o domínio — custo anual de ~R$ 40)
- [ ] Decisão sobre o nome de domínio (ex: `alfaprev.com.br`) — veja o Passo 1
- [ ] Acesso ao código do site (a pasta do projeto no computador)
- [ ] Cerca de 2–4 horas para concluir todos os passos

---

## Passo 1 — Registrar o domínio (o endereço do site)

### O que é um domínio?
É o endereço que as pessoas digitam para acessar o site (ex: `www.alfaprev.com.br`). Sem um domínio registrado no seu nome, o site não tem um endereço fixo na internet.

### Por que `.com.br`?
Para empresas brasileiras, o `.com.br` é o mais reconhecido e confiável pelo público local. O Google também tende a priorizar domínios com extensão local nas buscas feitas no Brasil.

### Onde registrar?
O órgão oficial para domínios `.com.br` é o **Registro.br** ([registro.br](https://registro.br)), mantido pelo NIC.br (entidade sem fins lucrativos ligada ao governo). É o lugar mais seguro e direto para registrar.

### Como verificar antes de escolher o nome:
1. Acesse [registro.br](https://registro.br)
2. Na caixa de busca, digite o nome desejado (ex: `alfaprev`)
3. Se aparecer "disponível", você pode registrar
4. Se estiver ocupado, tente variações: `alfaprev-guarulhos`, `alfaprev-sci`, `alfaseguranca`

### Como registrar:
1. Crie uma conta no Registro.br (use CPF ou CNPJ da empresa)
2. Busque o domínio, selecione e adicione ao carrinho
3. Complete o pagamento (Pix, boleto ou cartão)
4. **Custo:** R$ 40,00/ano para `.com.br` (renovação anual obrigatória — anotar no calendário)

### Após registrar:
Você terá acesso a um painel onde poderá configurar para onde o domínio "aponta" — isso é feito no Passo 4 (DNS).

---

## Passo 2 — Escolher a hospedagem

### O que é hospedagem?
É o computador (servidor) conectado 24h por dia à internet que vai guardar os arquivos do site e entregá-los para quem acessar o endereço. Sem hospedagem, o site não fica disponível online.

### Comparativo de opções para este site

Este site é **estático** (apenas HTML, CSS e JavaScript — sem banco de dados ou linguagem de servidor). Isso significa que as opções mais modernas são as mais adequadas.

---

#### Opção A — Netlify ⭐ (recomendado para iniciantes)
**Site:** [netlify.com](https://netlify.com)

| Item | Detalhe |
|---|---|
| Preço | Gratuito para sites estáticos com tráfego moderado |
| HTTPS | Automático (certificado SSL gratuito) |
| Como publicar | Arrastar a pasta do site para o navegador |
| Domínio personalizado | Configuração guiada pelo painel |
| Headers de segurança | O arquivo `netlify.toml` já está pronto no projeto |
| Suporte | Documentação em inglês |

**Prós:** Muito fácil para iniciantes, deploy por drag-and-drop, o arquivo `netlify.toml` (já pronto) configura tudo automaticamente.
**Contras:** Interface em inglês, plano gratuito tem limite de 100GB de transferência/mês (mais que suficiente para este site).

---

#### Opção B — Vercel
**Site:** [vercel.com](https://vercel.com)

| Item | Detalhe |
|---|---|
| Preço | Gratuito para sites estáticos |
| HTTPS | Automático |
| Como publicar | Por upload ou conectando repositório Git |
| Domínio personalizado | Configuração guiada |

**Prós:** Ótima performance global, gratuito.
**Contras:** Interface em inglês, configuração de headers requer um arquivo `vercel.json` diferente do `netlify.toml` já preparado.

---

#### Opção C — Hospedagem compartilhada brasileira (ex: Hostgator, Locaweb, Umbler)
**Para quem quer suporte em português e nota fiscal em real.**

| Item | Detalhe |
|---|---|
| Preço | R$ 15–50/mês dependendo do plano |
| HTTPS | Incluído na maioria dos planos (Let's Encrypt) |
| Como publicar | Via painel cPanel + gerenciador de arquivos ou FTP |
| Suporte | Em português, por chat ou telefone |

**Prós:** Suporte em português, nota fiscal, familiar para quem já usou cPanel.
**Contras:** Mais complexo de configurar, headers de segurança exigem editar `.htaccess` manualmente.

---

> **Recomendação:** Para publicar com mais rapidez e facilidade, escolha **Netlify**. Custo zero, mais simples, e o arquivo `netlify.toml` já está configurado no projeto.

---

## Passo 3 — Publicar os arquivos no Netlify (passo a passo)

> Se escolheu outra hospedagem, pule para o Passo 3B.

### Passo 3A — Publicando no Netlify (drag-and-drop)

1. Acesse [netlify.com](https://netlify.com) e clique em **Sign up** (cadastro gratuito)
2. Cadastre-se com e-mail e senha (ou via conta Google/GitHub)
3. Após fazer login, você verá o painel principal
4. Na área central, procure a caixa com o texto **"Drag and drop your site output folder here"**
5. Abra o gerenciador de arquivos do seu computador
6. Navegue até a pasta do projeto do site (onde ficam `index.html`, `script.js`, `styles.css`)
7. Arraste **toda a pasta** para dentro da área indicada no Netlify
8. Aguarde o upload (costuma levar 30–60 segundos)
9. O Netlify vai gerar um endereço temporário tipo `amazing-site-abc123.netlify.app` — esse é o seu site no ar!
10. Clique no endereço gerado para testar se o site está funcionando corretamente

---

### Passo 3B — Publicando em hospedagem compartilhada (cPanel/FTP)

1. Acesse o painel da sua hospedagem (geralmente `seudominio.com.br/cpanel`)
2. Procure o ícone **"Gerenciador de Arquivos"**
3. Navegue até a pasta `public_html` (é onde os arquivos do site devem ficar)
4. Exclua qualquer arquivo `index.html` padrão que já estiver lá
5. Faça o upload de todos os arquivos do projeto:
   - `index.html`
   - `script.js`
   - `styles.css`
   - `robots.txt`
   - `sitemap.xml`
   - Pasta `assets/` (com todos os logos, favicon, imagens)
6. Após o upload, acesse o endereço temporário da sua hospedagem para verificar

---

## Passo 4 — Apontar o domínio para a hospedagem (DNS)

### O que é DNS?
DNS (Sistema de Nomes de Domínio) é como uma agenda telefônica da internet: converte o nome do domínio (`alfaprev.com.br`) em um endereço numérico que os servidores entendem. Você precisa "dizer" ao seu domínio onde os arquivos do site estão hospedados.

### Onde configurar:
O DNS é configurado no painel do **Registro.br** (onde você registrou o domínio), ou você pode delegar o controle do DNS para a hospedagem/Netlify/Vercel.

### Como fazer no Netlify:
1. No painel do Netlify, acesse seu site publicado
2. Vá em **"Domain settings"** → **"Add custom domain"**
3. Digite seu domínio (ex: `alfaprev.com.br`) e clique em confirmar
4. O Netlify vai mostrar os servidores de DNS dele (chamados de "nameservers"), algo como:
   - `dns1.p04.nsone.net`
   - `dns2.p04.nsone.net`
5. Acesse o painel do [registro.br](https://registro.br)
6. Selecione seu domínio e clique em **"Alterar servidores DNS"**
7. Substitua os servidores atuais pelos fornecidos pelo Netlify

### Quanto tempo leva:
A propagação do DNS leva entre **1 hora e 48 horas**. Nesse período, algumas pessoas ao redor do mundo ainda podem ver a página antiga (ou uma página em branco). Isso é normal — não entre em pânico.

Para verificar se o domínio já está funcionando, acesse [whatsmydns.net](https://whatsmydns.net) e digite seu domínio.

---

## Passo 5 — Certificado SSL (HTTPS)

### O que é SSL/HTTPS?
É o "cadeado" que aparece na barra de endereços do navegador. Ele criptografa a comunicação entre o visitante e o site. Sem HTTPS:
- O navegador exibe um aviso de "site não seguro" que afasta visitantes
- O Google penaliza o site no ranqueamento
- Formulários e dados pessoais ficam expostos

### Como ativar:
- **Netlify:** Automático. Após apontar o DNS, o Netlify ativa o HTTPS gratuitamente via Let's Encrypt. Aguarde até 24h após a propagação do DNS.
- **Vercel:** Também automático após configurar o domínio.
- **Hospedagem compartilhada:** Geralmente há um botão "Ativar SSL/Let's Encrypt" no painel cPanel. Se não houver, contate o suporte.

### Como verificar:
Acesse o site e confirme que o endereço começa com `https://` e o cadeado está visível. Se ainda aparecer `http://`, aguarde mais algumas horas.

---

## Passo 6 — Conectar o formulário de contato

O formulário do site usa o serviço **Web3Forms** para receber as mensagens por e-mail. Sem configuração, o botão "Enviar" nunca funciona.

### Como configurar:
1. Acesse [web3forms.com](https://web3forms.com)
2. No campo "Email Address", digite: `cassia.marques@alfaseguranca.com`
3. Clique em **"Create Access Key"**
4. Verifique o e-mail da empresa e confirme o cadastro (clique no link de verificação)
5. Copie a chave gerada (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
6. Abra o arquivo `script.js` no projeto
7. Procure a linha: `const ACCESS_KEY = 'SUA_CHAVE_WEB3FORMS';`
8. Substitua `SUA_CHAVE_WEB3FORMS` pela chave copiada
9. Faça o upload do `script.js` atualizado para a hospedagem (mesmo processo do Passo 3)

### Testar se está funcionando:
1. Acesse o site publicado
2. Preencha o formulário de contato com dados reais
3. Clique em "Enviar e Solicitar Orçamento"
4. Se aparecer a mensagem de sucesso verde, o formulário está funcionando
5. Verifique se o e-mail chegou em `cassia.marques@alfaseguranca.com` (verifique também a pasta de spam)

### Sobre o plano gratuito do Web3Forms:
O plano gratuito permite até 250 submissões por mês. Para um site que está começando, isso é mais que suficiente.

---

## Passo 7 — Google Search Console (para aparecer no Google)

### O que é?
Ferramenta gratuita do Google que:
- Permite pedir ao Google para visitar e indexar seu site rapidamente
- Mostra quais palavras-chave levam pessoas ao seu site
- Alerta sobre problemas técnicos que impedem o ranqueamento

### Por que é importante?
Sem Search Console, o Google pode levar semanas ou meses para "descobrir" que seu site existe. Com ele, você acelera isso para dias.

### Como cadastrar:
1. Acesse [search.google.com/search-console](https://search.google.com/search-console)
2. Faça login com a conta Google da empresa (ou crie uma)
3. Clique em **"Adicionar propriedade"**
4. Escolha **"Prefixo de URL"** e digite: `https://www.alfaprev.com.br/`
5. O Google vai pedir para verificar que você é o dono do site. Escolha o método de **tag HTML**:
   - Copie o código fornecido (algo como `<meta name="google-site-verification" content="..." />`)
   - Abra o `index.html` do projeto
   - Cole a tag logo após a linha `<head>` (antes das outras meta tags)
   - Faça o upload do arquivo atualizado para a hospedagem
   - Volte ao Search Console e clique em **"Verificar"**
6. Após verificação, vá em **"Sitemaps"** no menu lateral
7. No campo, digite: `sitemap.xml` e clique em **"Enviar"**

### Quanto tempo leva para aparecer no Google?
Após submeter o sitemap, geralmente entre 3 e 14 dias para a primeira indexação. Continue acompanhando o painel — ele mostra quando as páginas foram indexadas.

---

## Passo 8 — Perfil da Empresa no Google (Google Business Profile)

### O que é?
É o card que aparece no Google Maps e na barra lateral das buscas quando alguém procura pela empresa pelo nome ou por serviços locais (ex: "projeto de prevenção incêndio guarulhos").

### Por que é essencial?
- Aparece nas buscas locais muito antes do site orgânico
- Exibe endereço, horário, telefone e avaliações diretamente no Google
- Fundamental para captar clientes da região de Guarulhos e Grande São Paulo

### Como criar:
1. Acesse [business.google.com](https://business.google.com)
2. Clique em **"Gerenciar agora"** e faça login com a conta Google da empresa
3. Clique em **"Adicionar sua empresa"**
4. Preencha:
   - **Nome:** ALFA SEGURANÇA CONTRA INCÊNDIO LTDA (Alfa Prev)
   - **Categoria:** "Empresa de segurança contra incêndio" ou "Engenheiro"
   - **Endereço:** Rua Floro de Oliveira, 491, Jardim Adriana, Guarulhos, SP
   - **Telefone:** (11) 94566-5263
   - **Site:** https://www.alfaprev.com.br

### Verificação (etapa obrigatória):
O Google precisa confirmar que o endereço é real. Métodos disponíveis:
- **Carta pelo Correios (mais comum):** O Google envia um cartão postal com um código para o endereço cadastrado. Prazo: 5–14 dias. Ao receber, acesse o painel e insira o código.
- **Ligação telefônica ou SMS:** Disponível para alguns cadastros.

### Após verificar:
- Adicione fotos do escritório, equipe e projetos (mínimo 5–10 fotos melhoram muito o perfil)
- Complete todos os campos: horário de funcionamento, descrição da empresa, serviços oferecidos
- Incentive clientes satisfeitos a deixar avaliações (link de avaliação disponível no painel)

---

## Passo 9 — Google Analytics (opcional, mas recomendado)

### O que é?
Ferramenta gratuita que registra quantas pessoas visitaram o site, de onde vieram, quanto tempo ficaram e se preencheram o formulário.

### Por que usar?
Sem Analytics, você voa às cegas: não sabe se o site está trazendo clientes, qual seção as pessoas leem mais, nem se o formulário está sendo enviado com sucesso.

### Como configurar:
1. Acesse [analytics.google.com](https://analytics.google.com) com a conta Google da empresa
2. Clique em **"Criar conta"** → **"Criar propriedade"**
3. Preencha o nome (ex: "Alfa Prev — Site"), país (Brasil), moeda (BRL)
4. Escolha o tipo de plataforma: **"Web"**
5. Digite o endereço do site e confirme
6. Na seção **"Fluxos de dados"**, copie o **Measurement ID** (formato `G-XXXXXXXXXX`)
7. Abra o `index.html` do projeto
8. Antes do `</head>`, adicione o código de rastreamento:

```html
<!-- Google Analytics GA4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

9. Substitua `G-XXXXXXXXXX` pelo seu Measurement ID real (duas vezes no código)
10. Faça upload do arquivo atualizado

> **Atenção LGPD:** O banner de consentimento de cookies já está implementado no site. Após adicionar o GA4, garanta que ele só seja ativado após o usuário aceitar os cookies (edite a lógica comentada em `script.js`, na seção "Banner de Cookies").

---

## Passo 10 — Checklist final antes de divulgar

Execute cada item abaixo antes de compartilhar o site publicamente:

### Formulário
- [ ] Preenchi o formulário completo e recebi o e-mail em `cassia.marques@alfaseguranca.com`
- [ ] O e-mail de confirmação não caiu na pasta de spam
- [ ] A mensagem de sucesso aparece na tela após enviar

### Links e contato
- [ ] Todos os botões de WhatsApp abrem o WhatsApp com a mensagem correta
- [ ] O link do telefone `(11) 94566-5263` funciona no celular (deve abrir o discador)
- [ ] O link do e-mail abre o aplicativo de e-mail
- [ ] O botão "Abrir no Google Maps" leva ao endereço correto
- [ ] O link do Instagram (`@alfaprev_sci`) abre o perfil correto
- [ ] Link do Facebook atualizado (ou ícone removido se não existir página)

### Visual e texto
- [ ] O site funciona bem no celular (abra no smartphone e navegue por todas as seções)
- [ ] Todos os textos estão corretos (endereço, CNPJ, telefone, horário)
- [ ] O logo aparece corretamente no cabeçalho e no rodapé
- [ ] O mapa do Google aparece corretamente na seção "Onde Estamos"
- [ ] O FAQ abre e fecha corretamente ao clicar nas perguntas

### Performance
- [ ] Testei a velocidade em [pagespeed.web.dev](https://pagespeed.web.dev) — nota ≥ 70 no mobile é aceitável para o lançamento
- [ ] O site carrega em menos de 5 segundos em conexão 4G

### SEO e rastreamento
- [ ] O Search Console está configurado e o sitemap enviado
- [ ] O link canônico no HTML aponta para o domínio correto (`https://www.alfaprev.com.br/`)
- [ ] O HTTPS está ativo (cadeado visível na barra de endereços)

---

## Passo 11 — Após publicar: manutenção e monitoramento

### Como monitorar se o site continua funcionando
- Acesse o site pelo menos uma vez por semana nos primeiros meses
- Configure alertas no Google Search Console (aba "Cobertura") — ele notifica por e-mail se houver erros de indexação
- Serviços de monitoramento gratuitos como [UptimeRobot](https://uptimerobot.com) avisam por e-mail se o site ficar fora do ar

### Se o formulário parar de enviar e-mails
1. Teste o formulário do site e veja se aparece erro na tela
2. Acesse o painel do [web3forms.com](https://web3forms.com) e verifique se a conta está ativa
3. Verifique se o plano gratuito atingiu o limite de 250 envios/mês
4. Confira se o e-mail `cassia.marques@alfaseguranca.com` está com caixa cheia
5. Se o problema persistir, tente o método alternativo: no `script.js`, leia o comentário "MAILTO FALLBACK" e siga as instruções para ativar o envio via link de e-mail nativo

### Como atualizar informações (endereço, horário, telefone)
1. Abra o arquivo `index.html` no editor de texto (Bloco de Notas, VS Code, etc.)
2. Use Ctrl+F para buscar o texto que quer alterar
3. Edite e salve o arquivo
4. Faça o re-upload do arquivo para a hospedagem (mesmo processo do Passo 3)
5. Lembre-se de atualizar também no **Google Business Profile** se mudar endereço ou horário

### Como renovar o domínio
O domínio `.com.br` expira anualmente. O Registro.br envia e-mails de aviso com 90, 60 e 30 dias de antecedência. Renove antes do vencimento — domínios expirados entram em quarentena e podem ser registrados por outra pessoa.

### Como acompanhar o ranqueamento
- **Google Search Console:** Veja quais termos geram impressões e cliques (demora 2–4 semanas para aparecer dados)
- **Busca manual:** Pesquise no Google termos como "projeto de prevenção incêndio guarulhos" e veja em que posição o site aparece
- O ranqueamento orgânico leva tempo — espere de 3 a 6 meses para ver resultados significativos. O Google Business Profile costuma aparecer muito antes.

---

## Resumo do cronograma sugerido

| Etapa | Quando fazer | Tempo estimado |
|---|---|---|
| Registrar domínio (Passo 1) | Hoje | 20 minutos |
| Escolher e configurar hospedagem (Passos 2–3) | Hoje | 30 minutos |
| Configurar DNS (Passo 4) | Hoje, após hospedagem | 15 minutos + aguardar propagação |
| Verificar HTTPS (Passo 5) | 24h após DNS | 5 minutos |
| Configurar formulário Web3Forms (Passo 6) | Mesma semana | 20 minutos |
| Cadastrar no Search Console (Passo 7) | Mesma semana | 30 minutos |
| Criar Google Business Profile (Passo 8) | Mesma semana | 1 hora + aguardar verificação postal |
| Adicionar Google Analytics (Passo 9) | Opcional, primeiros 30 dias | 30 minutos |
| Checklist final (Passo 10) | Antes de divulgar | 30 minutos |
