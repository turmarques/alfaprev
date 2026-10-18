# Relatório de Estado de Publicação — Alfa Prev

Investigação completa, somente leitura, do repositório, feita em 2026-10-18 para responder a
uma pergunta simples: **o site está pronto para ser publicado na Locaweb hoje, e se não está, o
que falta exatamente, em que ordem, e quem precisa fazer o quê?**

Este documento não altera nenhum código, texto ou configuração. É só diagnóstico.

**Como ler este relatório:** você (Artur) é desenvolvedor Java, nunca publicou um site em
hospedagem compartilhada. Todo o vocabulário específico de hospedagem (FTP, `.htaccess`, DNS,
etc.) é explicado em linguagem simples na seção 6, que é a sequência de passos que você deve
seguir. As seções 1 a 5 são o diagnóstico técnico que sustenta essa sequência.

---

## 1. Resumo executivo (5 linhas)

1. O site (HTML/CSS/JS) está completo e o conteúdo foi validado pela Cassia — não há bloqueador
   de copy/conteúdo.
2. **O maior problema não é o site, é o Git:** a migração inteira de Supabase para MySQL/PHP
   (pastas `api/`, `database/`, `tools/`, mais a remoção dos arquivos antigos do Supabase) está
   **feita no disco mas não commitada** — 16 commits locais na frente de `origin/main`, e por
   cima disso um conjunto grande de mudanças não commitadas. Resolver isso é o primeiro passo,
   antes de qualquer outra coisa.
3. O DNS de `alfasci.com.br` **já está apontando para um servidor** (`179.188.54.226`) — isso
   contradiz a documentação existente (`PUBLICACAO-LOCAWEB.md`, datada de 07/10), que dizia que
   não havia registro A ainda. Você precisa só confirmar no painel da Locaweb que esse IP é
   realmente o da sua hospedagem (eu não tenho como confirmar isso de fora).
4. `npm run empacotar` muito provavelmente ainda falha hoje, mas por um motivo diferente do que a
   documentação atual descreve — é um comentário inofensivo em `script.js`, não uma chave não
   preenchida. É rápido de corrigir (uma linha).
5. Depois de resolvidos os itens acima, falta criar o admin do painel `/leads` (script já pronto,
   só precisa ser executado) e fazer o upload real dos arquivos — a sequência completa está na
   seção 6.

---

## 2. Checklist de publicação

| # | Etapa | Status | Evidência |
|---|---|---|---|
| 1 | Conteúdo/copy do site validado | ✅ | Confirmado pelo usuário (Cassia revisou tudo); nenhum `[PREENCHER]` encontrado em texto visível (grep vazio em `src/pages/`) |
| 2 | Domínio final decidido (`alfasci.com.br`, sem `www`) | ✅ | `CLAUDE.md`, canonical consistente em 100% das páginas (ver seção 4) |
| 3 | Domínio ligado à hospedagem Locaweb (painel) | ✅ (confirmado pelo usuário) | Você informou que já foi feito no painel |
| 4 | DNS realmente resolvendo para a Locaweb | ⚠️ | `nslookup alfasci.com.br` retorna `179.188.54.226` agora (antes não havia registro A). **Falta confirmar no painel Locaweb que este IP é o da sua hospedagem** — ver pergunta aberta na seção 5 |
| 5 | SSL (HTTPS) ativo | ✅ (confirmado pelo usuário) | Let's Encrypt já ativo, segundo você. Não verificável por mim sem o site publicado |
| 6 | Código-fonte da migração MySQL/PHP commitado no Git | ❌ | `git status`: pastas `api/`, `database/`, `tools/` **não rastreadas** (nunca commitadas); exclusão dos arquivos Supabase está só "staged", não commitada; mais 27 arquivos modificados não commitados (ver seção 3) |
| 7 | Banco MySQL criado + schema executado | ✅ (confirmado pelo usuário) | 5 tabelas confirmadas vazias via phpMyAdmin, segundo `CLAUDE.md`/você |
| 8 | `api/config.local.php` preenchido com credenciais reais | ✅ | Arquivo existe, listado no `.gitignore` (linha 7), todos os 7 campos esperados presentes, zero placeholder `SUBSTITUIR_*` restante (valores não lidos, só presença confirmada) |
| 9 | Extensão PHP `pdo_mysql` disponível no servidor Locaweb | ❓ | Não verificável sem acesso ao painel PHP da Locaweb — ver pergunta aberta |
| 10 | Chave Web3Forms válida e registrada com `contato@alfasci.com.br` | ✅ (confirmado pelo usuário) | `script.js:282` tem uma chave que não é placeholder |
| 11 | `npm run empacotar` funciona sem erro | ⚠️ | Não executado (ambiente sem permissão para rodar escrita/scripts neste investigação) — mas a leitura do código mostra que a regra que bloqueia o empacotamento (`PADRAO_PREENCHER` em `scripts/empacotar-locaweb.js:111`) ainda vai encontrar a string `SUA_CHAVE_WEB3FORMS` dentro de um comentário em `script.js:245`. Ver seção 4 |
| 12 | Caixas de e-mail do domínio funcionando | ✅ (confirmado pelo usuário) | `contato@alfasci.com.br` recebendo normalmente, segundo você |
| 13 | Admin do painel `/leads` criado no banco | ❌ | Tabela `admins` ainda vazia (schema recém-criado); `tools/gerar-hash-admin.php` existe e está pronto, mas **ainda não foi executado** |
| 14 | 2FA (TOTP) do admin cadastrado | ❌ | Só é possível depois do login real em `/leads.html`, que só existe depois da publicação |
| 15 | Upload FTP/SFTP dos arquivos para a Locaweb | ❌ | Ainda não feito, segundo você |
| 16 | Documentação técnica (`docs/SEGURANCA.md`) refletindo a arquitetura atual (MySQL/PHP) | ❌ | `docs/SEGURANCA.md` descreve a arquitetura **Supabase antiga** (RLS, `is_admin()` com `aal2`, Supabase Auth) — ficou desatualizado pela migração para MySQL/PHP. Não é um bloqueador de publicação, mas é uma inconsistência de documentação relevante (ver seção 4) |

**Legenda:** ✅ = confirmado/feito · ⚠️ = feito parcialmente ou precisa de atenção · ❌ = não feito · ❓ = não verificável a partir do repositório

---

## 3. Bloqueadores, em ordem, com responsável

### Bloqueador 1 — Migração MySQL/PHP não commitada no Git
**Responsável: Artur**

O `git status` mostra:
- `api/`, `database/`, `tools/` como **pastas totalmente não rastreadas** (o Git nunca viu esses
  arquivos antes — a API PHP inteira, o schema do banco e o utilitário de criar admin).
- A remoção de `assets/js/config.js`, `assets/vendor/supabase-js/` (LICENSE + supabase.js),
  `scripts/testar-supabase-rls.js`, `supabase-admin.sql`, `supabase-schema.sql` está **staged**
  (preparada) mas não commitada.
- Outros 27 arquivos modificados (incluindo `CLAUDE.md`, todo `assets/js/leads/*.js`, `script.js`,
  `netlify.toml`, `publicacao/PUBLICACAO-LOCAWEB.md`, `publicacao/modelos/.htaccess`,
  `scripts/empacotar-locaweb.js`, `scripts/verificar-seguranca.js`, os 6 HTMLs gerados na raiz,
  `leads.html`) não commitados.
- O repositório local já está **16 commits na frente do `origin/main`** (remoto) — ou seja, nem
  esses 16 commits anteriores foram enviados ainda.

**Por que isso importa antes de publicar:** não é tecnicamente necessário "commitar" para fazer
upload por FTP (o FTP sobe o que está no disco, não o que está no Git). Mas:
- Enquanto isso não for commitado, qualquer coisa pode apagar esse trabalho sem chance de
  recuperação (reinstalação do Windows, disco corrompido, `git checkout .` acidental).
- Se algo der errado durante a publicação e você precisar voltar para um estado anterior
  conhecido, não há um "ponto de salvamento" no Git para voltar — o estado anterior (Supabase)
  também não está mais limpo (os arquivos antigos já estão marcados para remoção).
- `npm run seguranca` e `npm test` (que você deve rodar antes de publicar, segundo o próprio
  `CLAUDE.md`) não têm nenhuma relação com o Git, mas rodar esses comandos e depois perder o
  resultado por não ter commitado é desperdício de trabalho.

**O que fazer:** revisar as mudanças (`git status`, `git diff`) e fazer um ou mais commits que
capturem a migração completa. Isso é trabalho seu (ou peça para eu fazer, mas em uma tarefa
separada — não é algo que esta investigação, somente leitura, deveria fazer sozinha).

### Bloqueador 2 — `npm run empacotar` provavelmente falha hoje
**Responsável: Artur (correção trivial) + confirmação depois**

`scripts/empacotar-locaweb.js` tem esta regra (linha 111):

```js
const PADRAO_PREENCHER = /\[PREENCHER|SUA_CHAVE_WEB3FORMS/;
```

Essa regra existe para impedir que o pacote publicado contenha um placeholder não preenchido. O
problema: `script.js` linha 245 tem um **comentário** (não o valor da chave) que contém
literalmente o texto `SUA_CHAVE_WEB3FORMS`:

```js
// • Web3Forms: substitua 'SUA_CHAVE_WEB3FORMS' abaixo pela chave real
```

A chave real já foi preenchida corretamente na linha 282 (`ACCESS_KEY = '79231f9e-...'`), mas o
comentário de instrução, deixado para lembrar de preencher, ainda contém a string que a regra de
segurança procura. Resultado esperado: `npm run empacotar` deve imprimir um erro e parar, mesmo
com a chave já correta.

**Nota de honestidade:** eu não executei `npm run empacotar` nesta investigação (fui instruído a
não alterar nada e evitar comandos que pudessem gerar/alterar arquivos fora do relatório). Esta
conclusão é baseada em leitura cuidadosa do código, não em execução real — **confirme rodando o
comando você mesmo** antes de assumir que é exatamente isso.

**O que fazer:** apagar ou reescrever esse comentário em `script.js:245` para não conter mais a
string `SUA_CHAVE_WEB3FORMS` (ex.: "a chave de acesso real já está configurada abaixo"). É uma
edição de uma linha, fora do escopo desta investigação (que é só leitura) — peça isso como uma
tarefa separada e pequena.

### Bloqueador 3 — Admin do painel `/leads` ainda não existe no banco
**Responsável: Artur**

A tabela `admins` foi criada vazia (schema só definiu a estrutura, não inseriu nada). O utilitário
`tools/gerar-hash-admin.php` já está pronto e funcional (não se conecta a nenhum banco — só
imprime o comando SQL para você colar no phpMyAdmin), mas **ainda não foi executado**. Passo a
passo completo na seção 6, item 10.

### Bloqueador 4 (menor, não impede publicar, mas deve ser resolvido logo) — Confirmar extensão `pdo_mysql` no PHP da Locaweb
**Responsável: Artur, no Painel Locaweb**

A API (`api/lib/db.php`) depende da extensão `pdo_mysql` do PHP para conectar ao banco. Eu não
tenho acesso ao painel da Locaweb para confirmar se essa extensão está habilitada no PHP 8.5
contratado. A maioria das hospedagens compartilhadas já vem com isso ativado por padrão, mas
**vale confirmar no painel (geralmente em "Configurações de PHP" ou similar) antes de depender
disso**, porque se não estiver habilitado, toda a API (`api/*.php`) vai falhar com erro 500 ao
tentar conectar — e o erro vai aparecer só depois de publicado.

Achado técnico relacionado (menor, registrado para conhecimento, não é bloqueador): o código em
`api/lib/db.php` só captura `PDOException`. Se a extensão `pdo` (a base, não só o driver MySQL)
estiver totalmente ausente do PHP, o erro que o PHP gera é diferente (`Error`, não
`PDOException`) e **não seria capturado** por esse `catch` — o resultado seria uma página de erro
feia do PHP em vez da resposta JSON de erro 500 planejada. Isso é extremamente improvável (a
classe `PDO` quase sempre existe em qualquer PHP moderno; só o driver MySQL específico às vezes
precisa ser habilitado), mas é um detalhe que vale saber.

---

## 4. Inconsistências entre o guia, o código e o `CLAUDE.md`

1. **DNS: o guia diz que não há registro A, mas há.** `publicacao/PUBLICACAO-LOCAWEB.md` §0.4
   (datado 2026-10-07) afirma que `alfasci.com.br` ainda não tinha registro A configurado. Uma
   consulta DNS real feita agora (`nslookup alfasci.com.br`) retorna `179.188.54.226`, com
   `www.alfasci.com.br` configurado como alias (CNAME) do domínio principal. **Isso é uma boa
   notícia** (o domínio parece já estar apontado), mas o documento está desatualizado nesse ponto
   e precisa de revisão. Eu não tenho como confirmar que esse IP é especificamente o servidor da
   sua hospedagem Locaweb — isso só você consegue confirmar no painel.

2. **`docs/SEGURANCA.md` descreve a arquitetura antiga (Supabase), não a atual (MySQL/PHP).**
   Esse documento (comitado) fala em RLS, `is_admin()`, `auth.jwt() ->> 'aal' = 'aal2'`,
   `@supabase/supabase-js` — toda a lógica de 2FA e controle de acesso que ele descreve foi
   implementada de outra forma na migração para MySQL/PHP (sessão PHP + `api/login.php` +
   `api/mfa-*.php` + coluna `admins.totp_confirmado`). O conteúdo de segurança em si (2FA
   obrigatório, CSP, headers, bloqueio de dotfiles) ainda é válido em espírito, mas os detalhes
   técnicos descritos não correspondem mais ao código real. Isso é esperado, já que a migração
   para MySQL ainda nem foi commitada no Git (ver Bloqueador 1) — o documento foi escrito antes
   dela. Não corrigi este documento (seria edição, fora do escopo desta investigação).

3. **Motivo do bloqueio de `npm run empacotar` está desatualizado na documentação.**
   `CLAUDE.md` e `publicacao/PUBLICACAO-LOCAWEB.md` atribuem a falha do empacotamento a um
   comentário `// PREENCHER` na linha 282 de `script.js`. Esse comentário específico não existe
   mais nessa forma — o que existe hoje é a string `SUA_CHAVE_WEB3FORMS` dentro de um comentário
   na linha 245 (ver Bloqueador 2). O *efeito* (empacotamento bloqueado) é provavelmente o mesmo;
   a *causa* documentada está desatualizada.

4. **Inconsistência de nome de marca é mais ampla do que a auditoria de SEO registrou.**
   `publicacao/AUDITORIA-SEO.md` (seção 4.7) lista "3 pontos" com o nome errado
   ("Alfa Prev - Segurança Contra Incêndios" em vez de apenas "Alfa Prev"): `robots.txt`,
   `quem-somos.html` (`Person.worksFor.name`) e `contato.html` (`LocalBusiness.name`). Uma
   varredura direta nesta investigação encontra **4 ocorrências**, não 3 — falta
   `index.html` (`ProfessionalService.name`, linha 27), que a auditoria de SEO não mencionou.
   Como o próprio `CLAUDE.md` já trata isso como um achado de prioridade média (não corrigido,
   fora do escopo desta investigação de leitura), só estou atualizando a contagem para quando
   isso for corrigido em uma tarefa dedicada.

5. **HSTS: o `.htaccess` de produção não tem o header, mesmo fora do bloco comentado.**
   `publicacao/AUDITORIA-SEO.md` (seção 4.9) já identifica isso como achado de prioridade média:
   o header `Strict-Transport-Security` está dentro do **Bloco 2** (força HTTPS + redirecionamento
   sem `www`), que está deliberadamente comentado até a confirmação de que o SSL funciona de
   forma estável. Confirmado nesta investigação: a linha
   `#   Header always set Strict-Transport-Security "max-age=21600"` (linha 152 do
   `.htaccess`) está mesmo comentada. Como você confirmou que o SSL (Let's Encrypt) **já está
   ativo**, uma pergunta em aberto fica registrada na seção 5 sobre se já é seguro ativar esse
   bloco.

6. **"Pendências de revisão com a Cassia" no `CLAUDE.md` podem estar desatualizadas.**
   O `CLAUDE.md` lista 6 itens sob "⚠️ Pendências de revisão técnica com a Cassia" (numeração de
   ITs, NBR 12962, VIA-FÁCIL/TAACB, outros impactos do Decreto 69.118, faixa de validade do AVCB,
   inconsistência CLCB declaratório vs. aprovação prévia) como ainda pendentes de validação.
   Você informou que a Cassia já validou o site inteiro. Não tratei nenhum desses itens como
   bloqueador neste relatório (conforme as instruções desta investigação), mas o `CLAUDE.md` em
   si não foi atualizado para refletir essa validação — isso é uma edição de documentação, fora
   do escopo de leitura desta tarefa, mas vale uma atualização futura para o arquivo não mentir
   para a próxima pessoa (ou IA) que o ler.

---

## 5. Perguntas que só você pode responder (não há como descobrir pelo repositório)

1. **O IP `179.188.54.226` (resolvido por `alfasci.com.br` agora) é realmente o servidor da sua
   hospedagem Locaweb?** Entre no painel da Locaweb → Hospedagem → verifique o IP do servidor
   atribuído à sua conta e compare. Se bater, o DNS já está correto e você pode focar no upload.
   Se não bater, pode ser um IP de "página de estacionamento" do registrador, e o DNS real da
   hospedagem ainda precisa ser configurado.
2. **A extensão `pdo_mysql` do PHP está habilitada na sua hospedagem?** Verifique no painel
   (geralmente em "Configurações de PHP" ou "Selecionar versão do PHP") se há uma lista de
   extensões e se `pdo_mysql` (ou só `mysqli`, que não seria suficiente — o código usa PDO)
   aparece marcada/disponível.
3. **Agora que o SSL/HTTPS está confirmado funcionando, é seguro ativar o Bloco 2 do
   `.htaccess`** (força HTTPS + remove `www` + HSTS)? Esse bloco está comentado por segurança
   (evitar loop de redirecionamento antes do certificado existir) — como o certificado já existe
   segundo você, essa decisão pode ser tomada agora, mas é uma mudança de configuração de servidor
   que só deve ser feita com cuidado e testada imediatamente depois (se o HTTPS realmente
   funcionar em todas as páginas, incluindo `/leads.html`).
4. **Existe algum backup ou cópia do estado atual do projeto fora deste computador** (outro
   notebook, nuvem, pendrive)? Pergunto por causa do Bloqueador 1 (trabalho de migração inteiro
   não commitado no Git) — se a resposta for não, commitar é ainda mais urgente.
5. **O Event Scheduler do MySQL (para rodar `limpar_dados_antigos` automaticamente) está
   disponível no seu plano, ou você vai rodar isso manualmente de vez em quando?** Isso não
   impede a publicação, mas `docs/DASHBOARD-LEADS.md` §4 item 7 já registra essa dúvida sem
   resposta.

---

## 6. Próximos passos, em ordem, para quem nunca publicou um site (linguagem simples)

> Cada passo assume que o anterior já foi concluído. Não pule etapas.

### Passo 0 — Entender 3 palavras antes de começar

- **FTP/SFTP:** é só um "copiar e colar de arquivos", só que do seu computador para o servidor da
  hospedagem, em vez de para outra pasta do seu HD. Você usa um programa (recomendo o
  **FileZilla**, gratuito, https://filezilla-project.org/) para isso — ele mostra duas colunas
  (seu computador à esquerda, o servidor à direita) e você arrasta arquivos de um lado para o
  outro, como um gerenciador de arquivos comum.
- **`.htaccess`:** é um arquivo de configuração do servidor Apache (o "motor" que entrega as
  páginas do site). Ele já está pronto em `publicacao/modelos/.htaccess` — você só precisa
  copiá-lo para a pasta certa no servidor. A particularidade dele é que **começa com um ponto**,
  o que faz ele ficar "escondido" por padrão em muitos programas (inclusive no Windows e no
  FileZilla) — veja o passo 5 abaixo para mostrar arquivos escondidos.
- **Canonical / www vs sem-www:** "canonical" é uma tag no HTML que diz ao Google "esta é a
  versão oficial desta página" (evita que `alfasci.com.br/contato.html` e uma cópia dela sejam
  vistas como duas páginas diferentes). "www vs sem-www" é a escolha entre o site responder em
  `https://www.alfasci.com.br` ou `https://alfasci.com.br` (sem o `www`) — o projeto já decidiu
  usar **sem `www`** em todo o código (confirmado: 100% consistente, nenhuma página usa `www`).
  Você não precisa decidir nada aqui, só saber que essa decisão já foi tomada e está tudo
  alinhado.

### Passo 1 — Resolver o Bloqueador 1 (Git)

Antes de mais nada, faça commit de todo o trabalho pendente (migração MySQL/PHP). Isso é
trabalho seu ou de uma tarefa separada — não misture com a publicação em si.

### Passo 2 — Corrigir o comentário em `script.js` (Bloqueador 2)

Peça para eu (ou você mesmo) remover a string `SUA_CHAVE_WEB3FORMS` do comentário da linha 245
de `script.js`, mantendo a chave real da linha 282 intacta.

### Passo 3 — Gerar o pacote de publicação

No terminal, na pasta do projeto:
```
npm run build
npm run seguranca
npm test
npm run empacotar
```
Se tudo passar sem erro, isso cria uma pasta `dist-locaweb/` com só os arquivos que devem ir para
o servidor (nada de `src/`, `node_modules/`, documentação interna, etc.) e um arquivo `.zip`
dentro de `publicacao/` (ambos ignorados pelo Git de propósito — são gerados, não fonte).

### Passo 4 — Pegar as credenciais de FTP

No painel da Locaweb, procure por algo como "FTP" ou "Gerenciador de Arquivos" ou "Acesso FTP".
Você vai encontrar: um endereço de servidor (geralmente algo como `ftp.alfasci.com.br` ou um IP),
um usuário e uma senha. Anote os três.

### Passo 5 — Conectar com o FileZilla e mostrar arquivos escondidos

1. Abra o FileZilla, cole o endereço do servidor, usuário e senha, clique em "Conexão Rápida".
2. No painel da direita (servidor), vá até a pasta pública do site — geralmente chamada
   `public_html`, `www` ou `httpdocs` (varia por hospedagem; se não souber qual é, pergunte ao
   suporte da Locaweb "qual é a pasta raiz pública do meu site").
3. No menu do FileZilla, vá em **Servidor → Forçar exibir arquivos ocultos** (ou similar) — isso
   é necessário para você ver o arquivo `.htaccess` depois de enviá-lo (e para confirmar que ele
   chegou certo).

### Passo 6 — Remover a página de boas-vindas padrão da Locaweb (se existir)

Hospedagens novas costumam colocar um `index.html` de boas-vindas padrão na pasta pública. Se
existir algum arquivo lá (`index.html`, `index.php` genérico da Locaweb) **antes** de você enviar
o seu site, apague-o pelo FileZilla (painel da direita, clique direito → excluir) para não haver
conflito com o `index.html` real do seu site.

### Passo 7 — Enviar os arquivos do site

Arraste **todo o conteúdo de dentro** de `dist-locaweb/` (não a pasta `dist-locaweb` em si, só o
que está dentro dela) do painel esquerdo do FileZilla para o painel direito (a pasta pública que
você abriu no passo 5). Isso inclui o `.htaccess` gerado pelo empacotamento.

### Passo 8 — Enviar o `api/config.local.php` separadamente

Esse arquivo **nunca** é incluído no pacote gerado automaticamente (é secreto, fica fora do Git e
fora do `dist-locaweb/` de propósito). Depois do passo 7, navegue manualmente até a pasta `api/`
dentro do servidor (ela já deve ter ido junto no passo 7, só sem esse arquivo específico) e envie
`api/config.local.php` do seu computador para lá, na mesma posição relativa.

### Passo 9 — Ajustar permissões de arquivos/pastas (se necessário)

Na maioria das hospedagens Linux isso já vem correto por padrão, mas se alguma página der erro
500 depois de publicada, uma causa comum é permissão incorreta. No FileZilla, clique direito num
arquivo/pasta → "Permissões de arquivo": o padrão esperado é **644** para arquivos e **755** para
pastas. Não altere isso a menos que apareça um erro específico de permissão.

### Passo 10 — Criar o admin do painel `/leads`

1. No seu computador, se você tiver PHP instalado, rode no terminal:
   `php tools/gerar-hash-admin.php` e escolha a opção 1 (criar novo admin).
2. **Se você não tiver PHP instalado** (confirmado nesta investigação: este ambiente Windows não
   tem PHP no PATH), a alternativa mais simples sem instalar nada no Windows é usar o **Docker**:
   com o Docker Desktop instalado, rode (no terminal, dentro da pasta do projeto):
   ```
   docker run --rm -it -v "${PWD}:/app" -w /app php:8.3-cli php tools/gerar-hash-admin.php
   ```
   Isso baixa uma imagem oficial do PHP, roda o script dentro de um container temporário (que
   some depois de terminar) e mostra o resultado no seu terminal normalmente — sem instalar PHP
   permanentemente no Windows.
3. Digite o e-mail (pessoal da Cassia ou seu, **nunca** `contato@alfasci.com.br`) e uma senha de
   pelo menos 12 caracteres (digitada duas vezes).
4. O script vai imprimir um comando `INSERT INTO admins (...) VALUES (...)`. Copie esse comando.
5. Entre no phpMyAdmin (painel da Locaweb), selecione o banco `alfasci`, vá na aba "SQL", cole o
   comando e execute.

### Passo 11 — Cadastrar o 2FA (só depois do site publicado)

1. Acesse `https://alfasci.com.br/leads.html` no navegador.
2. Faça login com o e-mail e senha criados no passo 10.
3. O painel vai pedir para cadastrar um segundo fator (TOTP) — você vai precisar de um app
   autenticador no celular (Google Authenticator, Microsoft Authenticator, Authy, ou qualquer
   outro compatível com TOTP). Siga as instruções na tela do painel.

### Passo 12 — Bateria de testes depois de publicado

Nesta ordem:
1. Abra `https://alfasci.com.br/` no navegador — confirme que aparece com todo o estilo (cores,
   fontes), não uma página sem formatação.
2. Confirme o cadeado de HTTPS (sem aviso de "não seguro").
3. Navegue por todas as páginas do menu (Serviços, Blog SCI, Quem Somos, Contato).
4. No Contato, preencha o formulário com um e-mail de teste seu e envie. Confirme que:
   a) chegou um e-mail em `contato@alfasci.com.br` (via Web3Forms);
   b) o lead aparece no painel `/leads` (confirma que a gravação no MySQL funcionou).
5. Abra as DevTools do navegador (F12) → aba "Network" → recarregue a página → clique em
   qualquer requisição do próprio domínio → aba "Headers" → confirme que aparecem
   `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security` e os demais headers
   de segurança.
6. Repita a checagem de headers especificamente em `/leads.html` — confirme adicionalmente
   `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer` e
   `Cache-Control: no-store`.
7. Teste o login e o 2FA do painel `/leads` de novo, agora como o fluxo "normal" (não o primeiro
   cadastro) — confirme que pede o código do app autenticador e não deixa entrar sem ele.
8. Teste digitar a senha errada 3 vezes seguidas no login do painel — confirme que é bloqueado
   temporariamente (mensagem de "muitas tentativas").
9. Depois de tudo funcionando: cadastre o site no Google Search Console e envie o `sitemap.xml`
   (item já listado como pendência de "semana de publicação" no `CLAUDE.md`).

---

*Relatório gerado em 2026-10-18 por investigação somente leitura. Nenhum arquivo de código,
conteúdo ou configuração foi alterado durante esta investigação — apenas este documento foi
criado.*
