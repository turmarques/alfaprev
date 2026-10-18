-- ======================================================================
-- Alfa Prev — Schema MySQL (Métricas + Leads + Dashboard /leads)
-- Hospedagem: Locaweb "Hospedagem Compartilhada I" (MySQL 5.7+ / 8.x)
--
-- Substitui supabase-schema.sql (Postgres) — ver histórico do git para a
-- versão anterior. Migração decidida out/2026: a hospedagem Locaweb não
-- oferece Postgres, só MySQL, então o acesso direto do navegador ao banco
-- (PostgREST/RLS) deixou de existir. Toda regra que antes vivia em RLS e em
-- funções PL/pgSQL (is_admin, dashboard_dados, listar_leads, registrar_lead,
-- registrar_evento) agora vive na camada api/ (PHP + PDO), nunca no navegador.
-- Este arquivo só define tabelas — nenhuma lógica de negócio em procedure,
-- exceto a procedure de limpeza (equivalente a limpar_eventos_antigos).
--
-- Script IDEMPOTENTE: pode ser executado várias vezes sem erro.
-- Sem CREATE DATABASE / USE — o banco é criado antes, no painel da Locaweb.
-- InnoDB + utf8mb4 + utf8mb4_unicode_ci em todas as tabelas.
--
-- Mapeamento de tipos (Postgres → MySQL):
--   uuid            → INT UNSIGNED AUTO_INCREMENT (chave simples; nenhum
--                      endpoint público expõe o id, só o painel /leads
--                      autenticado usa para editar/excluir um lead)
--   timestamptz     → DATETIME (sempre gravado em UTC pela camada PHP;
--                      exibido em America/Sao_Paulo só na hora de formatar
--                      para o painel, nunca na gravação)
--   jsonb           → não usado neste schema (dashboard_dados/listar_leads
--                      viram consultas SQL normais em api/dashboard.php e
--                      api/leads.php, que montam o JSON em PHP)
--   enum (CHECK)    → ENUM nativo do MySQL (mesmas listas fechadas de antes)
--   now()           → CURRENT_TIMESTAMP / NOW()
--
-- Decisão de design — rate limit por IP/sessão:
--   Os limites de 5 leads/hora e 30 eventos/minuto por visitante continuam
--   usando as próprias colunas visitante_hash + created_at/criado_em das
--   tabelas leads/eventos (exatamente como as funções Postgres faziam),
--   em vez de uma tabela de apoio separada — evita duplicar contagem e
--   mantém uma única fonte de verdade. A única tabela de apoio nova é
--   tentativas_login (seção 5), porque não existe mais um "auth.users" do
--   Supabase Auth guardando histórico de tentativas — essa tabela é
--   necessária para impor o bloqueio de 3 tentativas / 5 min no servidor.
-- ======================================================================


-- ======================================================================
-- 1. TABELA leads
-- ======================================================================
CREATE TABLE IF NOT EXISTS leads (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nome               VARCHAR(200) NOT NULL,
  email              VARCHAR(200) NOT NULL,
  telefone           VARCHAR(20) NOT NULL,
  tipo_imovel        VARCHAR(50) NOT NULL,
  mensagem           VARCHAR(2000) NULL,
  consentimento_lgpd TINYINT(1) NOT NULL DEFAULT 0,
  consentimento_em   DATETIME NULL,
  status             ENUM('novo', 'contatado', 'em_negociacao', 'fechado', 'perdido') NOT NULL DEFAULT 'novo',
  observacao         VARCHAR(2000) NULL,
  pagina_origem      VARCHAR(300) NULL,
  utm_source         VARCHAR(150) NULL,
  utm_medium         VARCHAR(150) NULL,
  utm_campaign       VARCHAR(150) NULL,
  utm_term           VARCHAR(150) NULL,
  utm_content        VARCHAR(150) NULL,
  gclid              VARCHAR(150) NULL,
  sessao_id          VARCHAR(100) NULL,
  visitante_hash     VARCHAR(100) NULL,
  atualizado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY leads_created_at_idx (created_at),
  KEY leads_status_idx (status),
  KEY leads_email_idx (email),
  KEY leads_tipo_imovel_idx (tipo_imovel),
  KEY leads_visitante_hash_idx (visitante_hash, created_at),
  KEY leads_sessao_id_idx (sessao_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Leads do formulário de orçamento — site Alfa Prev. status: controle manual do funil. consentimento_lgpd/consentimento_em: aceite da Política de Privacidade. visitante_hash: hash diário não reversível (ver sais_diarios), nunca permite reidentificação. observacao: nota interna, editável só pelo admin no painel.';


-- ======================================================================
-- 2. TABELA admins — credenciais do painel /leads
-- ======================================================================
-- Substitui public.admins + auth.users do Supabase Auth. Sem SDK de
-- autenticação de terceiros: senha com password_hash()/password_verify()
-- do próprio PHP, TOTP (RFC 6238) implementado à mão em api/ (sem
-- Composer). totp_confirmado = 0 até o admin cadastrar e confirmar o
-- primeiro código do app autenticador — nenhum admin deve receber a URL
-- do painel antes disso. Nunca inserir aqui via endpoint público; só via
-- tools/gerar-hash-admin.php (gera o hash) + INSERT manual no phpMyAdmin.
CREATE TABLE IF NOT EXISTS admins (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(200) NOT NULL,
  senha_hash      VARCHAR(255) NOT NULL,
  totp_secret     VARCHAR(64) NULL,
  totp_confirmado TINYINT(1) NOT NULL DEFAULT 0,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admins_email_uk (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Administradores do painel /leads. senha_hash via password_hash() do PHP. totp_confirmado=1 só após confirmar o primeiro código TOTP (2FA obrigatório, equivalente ao AAL2 do Supabase).';


-- ======================================================================
-- 3. TABELA eventos — métricas anônimas de navegação
-- ======================================================================
CREATE TABLE IF NOT EXISTS eventos (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo           ENUM('page_view', 'whatsapp_click') NOT NULL,
  caminho        VARCHAR(300) NULL,
  origem         VARCHAR(150) NULL,
  utm_source     VARCHAR(150) NULL,
  utm_medium     VARCHAR(150) NULL,
  utm_campaign   VARCHAR(150) NULL,
  utm_term       VARCHAR(150) NULL,
  utm_content    VARCHAR(150) NULL,
  gclid          VARCHAR(150) NULL,
  dispositivo    ENUM('mobile', 'tablet', 'desktop') NULL,
  sessao_id      VARCHAR(100) NULL,
  visitante_hash VARCHAR(100) NULL,
  PRIMARY KEY (id),
  KEY eventos_criado_em_idx (criado_em),
  KEY eventos_tipo_idx (tipo),
  KEY eventos_caminho_idx (caminho),
  KEY eventos_visitante_hash_idx (visitante_hash, criado_em),
  KEY eventos_sessao_id_idx (sessao_id, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Eventos anônimos de navegação (page_view, whatsapp_click). Nunca armazena IP ou user-agent — só o hash diário (visitante_hash).';


-- ======================================================================
-- 4. TABELA sais_diarios — sal diário para hash de visitante e de login
-- ======================================================================
-- Mesmo papel do Postgres: um sal aleatório por dia (fuso America/Sao_Paulo),
-- usado para computar tanto visitante_hash (leads/eventos) quanto
-- identificador_hash (tentativas_login, seção 5). Gerado/lido só pela
-- camada PHP (api/lib/hash.php) — nenhum endpoint expõe esta tabela.
CREATE TABLE IF NOT EXISTS sais_diarios (
  dia DATE NOT NULL,
  sal VARCHAR(64) NOT NULL,
  PRIMARY KEY (dia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sal aleatório por dia (America/Sao_Paulo) usado para visitante_hash e identificador_hash de login. Nunca exposto por nenhum endpoint.';


-- ======================================================================
-- 5. TABELA tentativas_login — bloqueio de login no servidor
-- ======================================================================
-- Guarda apenas o hash do identificador (IP + sal do dia, nunca o IP em
-- texto puro) e se a tentativa teve sucesso. Usada por api/login.php para
-- impor, no servidor, o mesmo bloqueio de 3 tentativas / 5 min que hoje é
-- só client-side (assets/js/leads/bloqueio.js). Registros antigos são
-- removidos pela procedure limpar_dados_antigos (seção 6).
CREATE TABLE IF NOT EXISTS tentativas_login (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  identificador_hash CHAR(64) NOT NULL,
  email              VARCHAR(200) NULL,
  sucesso            TINYINT(1) NOT NULL DEFAULT 0,
  criado_em          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY tentativas_login_hash_idx (identificador_hash, criado_em),
  KEY tentativas_login_email_idx (email, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tentativas de login no painel /leads. identificador_hash = SHA-256(ip + sal do dia). Base do bloqueio de 3 tentativas / 5 min imposto no servidor.';


-- ======================================================================
-- 6. MANUTENÇÃO — purga de eventos/sais/tentativas antigos
-- ======================================================================
-- Equivalente a limpar_eventos_antigos() do Postgres. Sem pg_cron aqui —
-- chamar via CALL manualmente (phpMyAdmin) ou por uma tarefa agendada do
-- painel Locaweb/cron do PHP, se disponível (confirmar no painel; a
-- Hospedagem Compartilhada I pode não liberar o Event Scheduler do MySQL,
-- que exigiria privilégio SUPER).
DROP PROCEDURE IF EXISTS limpar_dados_antigos;

DELIMITER $$
CREATE PROCEDURE limpar_dados_antigos(IN p_dias_eventos INT, IN p_dias_login INT)
BEGIN
  DELETE FROM eventos WHERE criado_em < DATE_SUB(NOW(), INTERVAL p_dias_eventos DAY);
  DELETE FROM sais_diarios WHERE dia < DATE_SUB(CURDATE(), INTERVAL p_dias_eventos DAY);
  DELETE FROM tentativas_login WHERE criado_em < DATE_SUB(NOW(), INTERVAL p_dias_login DAY);
END$$
DELIMITER ;

-- Exemplo de uso (retenção padrão: 180 dias de eventos/sais, 1 dia de tentativas de login):
-- CALL limpar_dados_antigos(180, 1);


-- ======================================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ======================================================================
-- No phpMyAdmin: confirmar que as tabelas leads, admins, eventos,
-- sais_diarios, tentativas_login existem com ENGINE=InnoDB e
-- CHARSET=utf8mb4. A procedure limpar_dados_antigos deve aparecer em
-- "Rotinas". Nenhuma linha é inserida por este script — o primeiro admin
-- é cadastrado manualmente (ver tools/gerar-hash-admin.php e o passo a
-- passo em CLAUDE.md / docs/DASHBOARD-LEADS.md).
