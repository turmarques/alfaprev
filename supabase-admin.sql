-- ======================================================================
-- Alfa Prev — Cadastro do usuário administrador do painel /leads
-- Executar no SQL Editor do painel DEPOIS de:
--   1) rodar supabase-schema.sql
--   2) criar o usuário em Authentication > Users (e-mail + senha forte)
--
-- NUNCA commitar este arquivo com o e-mail real preenchido — mantenha o
-- placeholder abaixo no controle de versão e substitua apenas localmente
-- antes de colar no SQL Editor.
--
-- PASSO OBRIGATÓRIO SEGUINTE (2FA — out/2026): is_admin() agora exige AAL2
-- (ver supabase-schema.sql, seção 7). Isso significa que, mesmo depois deste
-- INSERT, o admin ainda NÃO conseguirá ler nenhum lead até cadastrar um fator
-- TOTP. Acesse https://alfasci.com.br/leads.html, faça login com e-mail/senha
-- e siga a tela de cadastro de verificação em duas etapas (um app autenticador
-- como Google Authenticator, Authy ou 1Password é necessário) ANTES de
-- divulgar a URL do painel para qualquer outra pessoa.
-- ======================================================================

insert into public.admins (user_id)
select id from auth.users
where email = 'EMAIL_DO_ADMIN_AQUI@substituir.com'
on conflict (user_id) do nothing;

-- Verificação: deve retornar 1 linha com o e-mail do admin recém-cadastrado.
-- select u.email, a.criado_em
-- from public.admins a
-- join auth.users u on u.id = a.user_id;
