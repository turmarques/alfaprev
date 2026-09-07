-- ======================================================
-- Alfa Prev — Schema Supabase
-- Executar no SQL Editor do painel: supabase.com/dashboard
-- Projeto sugerido: alfa-prev-leads
-- ======================================================

-- 1. CRIAR TABELA DE LEADS
-- ======================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         timestamptz DEFAULT now()             NOT NULL,
  nome               text                                  NOT NULL,
  email              text                                  NOT NULL,
  telefone           text                                  NOT NULL,
  tipo_imovel        text                                  NOT NULL,
  mensagem           text,
  consentimento_lgpd boolean                               NOT NULL DEFAULT false,
  status             text        DEFAULT 'novo'            NOT NULL
    CONSTRAINT status_valores CHECK (status IN ('novo', 'contatado', 'convertido', 'descartado'))
);

COMMENT ON TABLE  public.leads                        IS 'Leads do formulário de orçamento — site Alfa Prev.';
COMMENT ON COLUMN public.leads.status                 IS 'Controle manual: novo | contatado | convertido | descartado';
COMMENT ON COLUMN public.leads.consentimento_lgpd     IS 'true = usuário aceitou a Política de Privacidade antes de enviar';


-- 2. ÍNDICES (melhora velocidade de filtros no painel)
-- ======================================================
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx     ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_email_idx      ON public.leads (email);


-- 3. ROW LEVEL SECURITY (RLS)
-- ======================================================
-- Habilita RLS: sem políticas explícitas, NENHUMA operação é permitida por padrão.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política: qualquer visitante anônimo do site pode inserir um lead,
-- MAS somente se consentimento_lgpd = true.
-- Isso bloqueia inserções sem consentimento mesmo que o JS seja burlado.
CREATE POLICY "anon_insert_com_consentimento"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (consentimento_lgpd = true);

-- Sem políticas de SELECT, UPDATE ou DELETE para 'anon':
-- Visitantes do site NÃO conseguem ler, editar ou apagar leads via API pública.
-- Gestão dos leads só acontece pelo painel autenticado do Supabase.


-- ======================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ======================================================
-- Após rodar este script, confirme no painel do Supabase:
--   Database > Tables > leads
--     → Cadeado "RLS enabled" deve estar visível
--     → A política "anon_insert_com_consentimento" deve aparecer em "Policies"
--
-- Para testar a inserção diretamente no SQL Editor:
-- INSERT INTO public.leads (nome, email, telefone, tipo_imovel, mensagem, consentimento_lgpd)
-- VALUES ('Teste', 'teste@teste.com', '(11) 99999-9999', 'comercial', 'Teste de inserção', true);
-- → Deve retornar sem erro e a linha deve aparecer em Table Editor > leads
