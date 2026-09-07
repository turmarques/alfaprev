# AVALIAÇÃO — FOCO INSTITUCIONAL vs. PESSOAL
*Gerado automaticamente pelo Claude Code em 07/09/2026*

---

## 1. Ocorrências do nome "Cassia" (ou variações) no site

| Linha | Local / Seção | Trecho | Ação |
|---|---|---|---|
| 683 | Seção `#responsavel-tecnica` — card principal | `<h3>Cassia Élica Spinelli Marques</h3>` | **Manter** — é a seção dedicada a ela, nome completo é necessário |
| 689 | Seção `#responsavel-tecnica` — parágrafo 1 | "Cassia lidera a Alfa Prev com foco em..." | **Ajustar** — "Cassia" como sujeito verbal faz a empresa soar como extensão pessoal |
| 711 | Seção `#responsavel-tecnica` — link WhatsApp | `?text=Olá Cassia! Gostaria de falar...` | **Ajustar** — nomear pessoalmente no CTA reforça a impressão de "site pessoal" |
| 1228 | Seção `#politica-privacidade` — texto legal | e-mail `cassia.marques@alfaseguranca.com` como link para contato de dados LGPD | **Não alterar agora** — ver Recomendação 1 abaixo |
| 1288–1296 | Footer — bloco de contato | e-mail `cassia.marques@alfaseguranca.com` exibido | **Não alterar agora** — ver Recomendação 1 abaixo |

---

## 2. Trechos em primeira pessoa ligados à pessoa (fora da seção dedicada)

**Nenhum encontrado.** O site já não usa "eu", "minha experiência" ou similares em nenhuma seção. Isso é positivo — o trabalho aqui é sobre terceira pessoa pessoal vs. terceira pessoa institucional.

---

## 3. Avaliação por seção — pessoal vs. institucional

| Seção | Avaliação | Observação |
|---|---|---|
| **Meta tags / JSON-LD ProfessionalService** | ✅ Institucional | Nenhuma referência pessoal desnecessária. `email` é do negócio. |
| **JSON-LD FAQPage** | ✅ Institucional | Usa "nossa equipe" em um texto de resposta, aceitável. |
| **Header** | ✅ Institucional | Fala sempre da Alfa Prev. |
| **Hero** | ✅ Institucional | Badge "Responsável Técnica Especializada (PUC-MG)" é genérico, sem nomear. Estatísticas atribuídas ao histórico da empresa. |
| **Serviços** | ⚠️ Levemente pessoal | Banner: "Nossa **equipe técnica** avalia..." — se só há uma profissional, pode soar levemente enganoso. Ajustar para "A Alfa Prev avalia..." |
| **Legislação & Prevenção** | ⚠️ Levemente pessoal | CTA lateral: "Faça uma análise técnica com **nossa especialista**." — sem nomear, mas o singular pode reforçar a operação individual. Ajustar para linguagem institucional. |
| **Seção Responsável Técnica** | 🔵 Pessoal por natureza — **manter** | É a seção dedicada à Cassia. Nome completo, formação, credenciais: tudo deve permanecer. Dois pontos menores a corrigir: (a) frase onde ela aparece como sujeito da empresa; (b) texto pré-preenchido do WhatsApp nomeia ela diretamente. |
| **FAQ** | ✅ Institucional | Usa "A Alfa Prev" como agente. |
| **Contato** | ⚠️ Levemente pessoal | Parágrafo intro: "nossa **equipe técnica** entrará em contato" — mesma situação do banner de serviços. Ajustar para "a Alfa Prev entrará em contato". |
| **Formulário — mensagem de sucesso** | ⚠️ Levemente pessoal | "Nossa **equipe técnica** entrará em contato em breve." — ajustar para "A Alfa Prev entrará em contato em breve." |
| **Política de Privacidade** | ✅ Institucional (corpo) + ⚠️ e-mail pessoal | O texto legal fala da empresa corretamente. O e-mail de contato para direitos LGPD é o pessoal — recomendação de migração futura. |
| **Footer** | ✅ Majoritariamente institucional | Razão social, CNPJ, direitos reservados: tudo certo. E-mail de contato exibido é o pessoal — registrado como recomendação futura. |

---

## 4. Resumo — o que foi alterado na Parte 2

### Alterações aplicadas no `index.html`

1. **Seção Responsável Técnica — parágrafo "Cassia lidera"** (linha 689):
   - *Antes:* "Com 8 anos de atuação contínua no setor, **Cassia lidera a Alfa Prev** com foco em soluções de prevenção estrutural..."
   - *Depois:* "Com **8 anos de experiência contínua no setor**, a Alfa Prev atua com foco em soluções de prevenção estrutural..." + sentença sobre a responsável técnica em terceira pessoa qualificada.

2. **Seção Responsável Técnica — texto pré-preenchido WhatsApp** (linha 711):
   - *Antes:* `?text=Olá Cassia! Gostaria de falar sobre um projeto de segurança contra incêndio.`
   - *Depois:* `?text=Olá! Gostaria de falar com a Alfa Prev sobre um projeto de segurança contra incêndio.`

3. **Seção Serviços — banner "Atendimento Personalizado"** (linha 475):
   - *Antes:* "Nossa equipe técnica avalia a estrutura da sua edificação..."
   - *Depois:* "A Alfa Prev avalia a estrutura da sua edificação..."

4. **Seção Contato — parágrafo introdutório** (linha 1028):
   - *Antes:* "nossa equipe técnica entrará em contato para entender a necessidade..."
   - *Depois:* "a Alfa Prev entrará em contato para entender a necessidade..."

5. **Formulário — mensagem de sucesso** (linha 1196):
   - *Antes:* "Nossa equipe técnica entrará em contato em breve. Obrigado."
   - *Depois:* "A Alfa Prev entrará em contato em breve. Obrigado."

6. **Seção Legislação — CTA lateral** (linha 608):
   - *Antes:* "Faça uma análise técnica com nossa especialista."
   - *Depois:* "Solicite uma análise técnica com a Alfa Prev."

---

## Recomendações — não implementadas (dependem de ação externa)

### Recomendação 1 — Migrar e-mail para endereço institucional
**Situação atual:** `cassia.marques@alfaseguranca.com` aparece em dois locais visíveis (footer e política de privacidade) e no Schema.org JSON-LD.

**Por que isso importa:** O e-mail nomeia a responsável técnica diretamente, reforçando a impressão de operação individual. Qualquer pessoa que receber um e-mail pelo formulário também verá que veio de um endereço pessoal.

**Recomendação:** Criar uma caixa `contato@alfaseguranca.com` (ou `contato@alfaprev.com.br` quando o domínio for registrado) e redirecionar para o e-mail atual. Depois substituir nos dois locais e no JSON-LD. **Não alterar enquanto a caixa não existir** — risco de perder mensagens.

---

*Seções que não precisaram de ajuste: Header, Hero, FAQ, Política de Privacidade (corpo), Footer (estrutura), JSON-LD Schema.org.*
