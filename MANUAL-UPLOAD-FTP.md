# Manual de Upload por FTP — Alfa Prev

Este manual cobre **apenas o processo de envio dos arquivos do site para o servidor da
Locaweb via FTP**. Ele **não** cobre: configuração de DNS, emissão/ativação de SSL, criação
do admin do painel `/leads`, cadastro do 2FA/TOTP, o "Bloco 2" do `.htaccess` (força de
HTTPS), cadastro no Google Search Console, nem testes funcionais do site publicado. Esses
itens têm instruções em `publicacao/PUBLICACAO-LOCAWEB.md`.

Escrito para quem nunca usou um cliente de FTP antes. Siga os passos na ordem, marcando
cada caixa `[ ]` conforme concluir.

---

## 1. O que vai para o servidor

**Tudo o que está dentro da pasta `dist-locaweb/`** — o *conteúdo* da pasta, não a pasta
em si (ou seja, ao entrar em `dist-locaweb/` localmente, selecione tudo o que está dentro
dela, não a pasta `dist-locaweb` em si).

Além disso, **separadamente**, o arquivo `api/config.local.php` (que fica na pasta `api/`
da raiz do projeto, **fora** de `dist-locaweb/`, pois é gitignored e contém credenciais
reais do banco de dados — por isso nunca é copiado para dentro do pacote).

### Nunca enviar ao servidor

- [ ] `.git` (pasta inteira)
- [ ] `.claude` (pasta inteira)
- [ ] `.idea` (pasta inteira)
- [ ] `node_modules`
- [ ] `src/`
- [ ] `database/`
- [ ] `tools/`
- [ ] `docs/`
- [ ] `publicacao/`
- [ ] `scripts/`
- [ ] Qualquer arquivo de prompt/instrução de IA
- [ ] `CLAUDE.md`
- [ ] Este manual (`MANUAL-UPLOAD-FTP.md`)
- [ ] `package.json` / `package-lock.json`
- [ ] A própria pasta `dist-locaweb` (envie o **conteúdo** dela, não a pasta)
- [ ] O arquivo `.zip` gerado pelo empacotamento

---

## 2. Antes de começar: gerar o pacote atualizado

- [ ] No terminal, na raiz do projeto, rode em sequência:
  ```
  npm run build
  npm run seguranca
  npm test
  npm run empacotar
  ```
- [ ] Confirme que os 4 comandos terminaram sem erro.
- [ ] Confirme a contagem de arquivos/pastas do pacote gerado contra
      `publicacao/MANIFESTO-PACOTE.txt` (gerado automaticamente pelo último comando).

**Números confirmados nesta geração (2026-10-22, após migração do Tailwind Play CDN
para CSS compilado — ver `publicacao/RELATORIO-TAILWIND-COMPILADO.md`):**
- Total de arquivos no pacote: **48** (47 anteriores + 1 novo: `assets/css/tailwind.css`;
  contagem do manifesto; a pasta `dist-locaweb/` também contém o `.htaccess` da raiz, que
  por ser um arquivo de configuração de servidor não entra na contagem do manifesto
  SHA-256, mas **deve** ser enviado — ver seção 7)
- Tamanho total: **481.0 KB**
- `.htaccess` (raiz): **9857 bytes**
- `index.html`: **46973 bytes** (menor que antes — não tem mais o `<script>` inline do
  Tailwind Play CDN nem o `tailwind.config` inline, só um `<link>` para o CSS compilado)
- `script.js`: **19085 bytes** (inalterado — este arquivo não foi tocado pela migração)
- `assets/css/tailwind.css` (novo): **21296 bytes** (~20.8 KB, minificado, gerado por
  `npm run css:build`)

**Importante:** reenvie o pacote **completo**, não apenas os arquivos alterados. Navegadores
podem ter cacheado o HTML antigo (que referenciava `cdn.tailwindcss.com`) ou o CSS compilado
de uma geração anterior; o cache-busting por hash (`?v=...`) no link do CSS já resolve isso
para quem acessar depois do reenvio, mas o servidor precisa ter a versão nova de todos os
arquivos ao mesmo tempo.

Se os números que você vir ao gerar o pacote novamente forem muito diferentes destes, pare
e confira se alguma alteração de conteúdo não documentada aconteceu antes de subir.

---

## 3. Dados de conexão

- **Servidor:** `ftp.alfasci.com.br` (alternativo: `ftp.alfasci1.hospedagemdesites.ws`)
- **Usuário:** `alfasci1`
- **Senha:** *(não está neste manual — pegue no painel da Locaweb ou com quem a tiver)*
- **Porta:** `21`
- **Pasta raiz do FTP:** `/home/alfasci1/` (aparece como `/` dentro do FileZilla)
- **Pasta raiz pública do site:** `/public_html`

**Atenção:** este servidor **não suporta FTP sobre TLS** ("Servidor sem segurança, não
suporta FTP sobre TLS"). Isso significa que a senha trafega sem criptografia durante a
conexão. Por isso:

- [ ] Faça o upload apenas em uma rede confiável (nunca Wi-Fi público).
- [ ] Depois de concluir o upload, troque a senha de FTP no painel da Locaweb.

---

## 4. Conectando com o FileZilla

- [ ] Abra o FileZilla.
- [ ] Use **Conexão Rápida** (topo da janela: Servidor / Usuário / Senha / Porta) ou crie um
      site salvo em **Arquivo → Gerenciador de Sites** com os dados da seção 3.
- [ ] Clique em **Conectar**. O painel direito deve mostrar as pastas do servidor.
- [ ] Ative a exibição de arquivos ocultos: menu **Servidor → Forçar exibição de arquivos
      ocultos**. Sem isso, o `.htaccess` (que começa com ponto) não aparece na listagem.

---

## 5. Escolher o modo de reenvio

Há duas formas de colocar os arquivos no ar. **Recomendado: limpeza completa.**

### Opção A — Limpeza completa (recomendada)

- [ ] No painel direito (servidor), entre em `/public_html`.
- [ ] Selecione tudo dentro de `/public_html` e exclua.
- [ ] **Atenção:** isso também apaga o `api/config.local.php` que já estiver lá — você vai
      reenviá-lo no passo 8 deste manual, então isso é esperado.
- [ ] O site fica fora do ar durante a janela entre a exclusão e o fim do novo upload — por
      isso, faça isso em um horário de baixo movimento, se possível.

### Opção B — Sobrescrever no lugar

- [ ] Não exclua nada antes; vá direto para a seção 7 e envie por cima dos arquivos
      existentes.

---

## 6. Quando aparecer "O arquivo de destino já existe"

Ao arrastar os arquivos, o FileZilla pode perguntar o que fazer quando um arquivo já existe
no servidor com o mesmo nome:

- [ ] Escolha **Sobrescrever** ("Overwrite").
- [ ] Marque a opção **Aplicar a todos os arquivos na fila** ("Apply to all files in queue")
      para não precisar responder a cada arquivo individualmente.
- [ ] **Não** escolha a opção de "sobrescrever apenas se o tamanho for diferente/mais
      recente". Um arquivo pode ter sido alterado no conteúdo sem mudar de tamanho, e essa
      opção deixaria esse arquivo desatualizado no servidor sem avisar.

---

## 7. Enviando o site

- [ ] No painel esquerdo (seu computador), navegue até dentro da pasta `dist-locaweb` do
      projeto (entre nela, não selecione a pasta em si).
- [ ] Pressione **Ctrl+A** para selecionar tudo dentro dela.
- [ ] Confirme visualmente que a seleção inclui: `.htaccess`, `api`, `assets`, `blog-sci`,
      e todas as páginas `.html` (`index.html`, `servicos.html`, `quem-somos.html`,
      `blog-sci.html`, `contato.html`, `leads.html`), além de `robots.txt`, `sitemap.xml`,
      `script.js` e `styles.css`.
- [ ] Arraste a seleção para a pasta `/public_html` no painel direito (ou clique com o
      botão direito → **Fazer upload**).
- [ ] Aguarde a fila de transferência (parte inferior da janela) esvaziar completamente.
- [ ] Verifique a aba **Transferências com falha** ("Failed transfers"): deve estar vazia.
- [ ] Verifique a aba **Transferências bem-sucedidas** ("Successful transfers"): a
      quantidade deve bater com a quantidade de arquivos do pacote (seção 2).

---

## 8. Enviando o `config.local.php`

Este arquivo **não está** dentro de `dist-locaweb/` e precisa ser enviado à parte:

- [ ] No painel direito (servidor), entre em `/public_html/api`.
- [ ] No painel esquerdo (seu computador), navegue até a pasta `api/` **na raiz do
      projeto** (não dentro de `dist-locaweb`).
- [ ] Selecione apenas o arquivo `config.local.php`.
- [ ] Envie para `/public_html/api`.
- [ ] Confirme que o tamanho do arquivo no servidor é igual ao tamanho do arquivo local
      (clique com o botão direito → Propriedades, em ambos os lados).

---

## 9. Conferência final (apenas arquivos — não é teste funcional)

- [ ] `.htaccess` está presente na raiz de `/public_html`.
- [ ] `/public_html/api` contém os arquivos `.php`, a subpasta `lib/` e o próprio
      `.htaccess` da API.
- [ ] A quantidade de arquivos e pastas no servidor bate com a do pacote local (seção 2).
- [ ] Nenhum dos itens da lista "Nunca enviar" (seção 1) está presente no servidor.
- [ ] Tamanhos batendo entre local e servidor:
  - [ ] `index.html` → **47706 bytes**
  - [ ] `script.js` → **19085 bytes**
  - [ ] `.htaccess` → **9294 bytes**

(Esses três números valem para o pacote gerado em 2026-10-18 — se você gerar um novo
pacote depois de alterações no código, confira os valores atualizados em
`publicacao/MANIFESTO-PACOTE.txt` em vez destes.)

---

## 10. Problemas comuns no upload

| Problema | O que fazer |
|---|---|
| Conexão caiu por inatividade | Reconecte e clique em **Reiniciar fila de transferência** (não precisa recomeçar tudo). |
| Uma transferência falhou | Clique com o botão direito no item na aba de falhas → **Reenviar**. Depois confira o tamanho do arquivo no servidor. |
| `.htaccess` não aparece na pasta local ou remota | Confirme que **Forçar exibição de arquivos ocultos** está ativado tanto para o painel local quanto para o remoto (seção 4). |
| Site aparece sem estilo, ou aparece uma página padrão da hospedagem | Sinal de que os arquivos foram enviados para a pasta errada — confirme que você está dentro de `/public_html` no servidor, não em `/home/alfasci1/` nem em uma subpasta. |
| Ctrl+A selecionou a pasta errada | Confirme no caminho exibido no FileZilla (painel local) que você está **dentro** de `dist-locaweb`, não um nível acima (o que selecionaria a pasta inteira em vez do conteúdo dela). |

---

## Registro

Este manual foi criado em 2026-10-18 e cobre exclusivamente o processo de upload de
arquivos por FTP. Está registrado em `CLAUDE.md`.
