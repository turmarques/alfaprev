-- ======================================================================
-- Alfa Prev — Cadastro do usuário administrador do painel /leads
-- Executar no SQL Editor do painel DEPOIS de:
--   1) rodar supabase-schema.sql
--   2) criar o usuário em Authentication > Users (e-mail + senha forte)
--
-- NUNCA commitar este arquivo com o e-mail real preenchido — mantenha o
-- placeholder abaixo no controle de versão e substitua apenas localmente
-- antes de colar no SQL Editor.
-- ======================================================================

insert into public.admins (user_id)
select id from auth.users
where email = 'EMAIL_DO_ADMIN_AQUI@substituir.com'
on conflict (user_id) do nothing;

-- Verificação: deve retornar 1 linha com o e-mail do admin recém-cadastrado.
-- select u.email, a.criado_em
-- from public.admins a
-- join auth.users u on u.id = a.user_id;
