-- ======================================================================
-- Alfa Prev — Schema Supabase (Métricas + Leads + Dashboard /leads)
-- Executar no SQL Editor do painel: supabase.com/dashboard
--
-- Script ADITIVO e IDEMPOTENTE: pode ser executado várias vezes sem erro
-- e nunca remove/renomeia/retipa colunas que já existiam antes dele.
-- Toda validação de tamanho em colunas existentes é feita via CHECK,
-- nunca via ALTER COLUMN TYPE (evita qualquer risco de truncar dados).
-- ======================================================================

-- Extensão necessária para gen_random_bytes()/digest() usados no hash de visitante.
create extension if not exists pgcrypto;


-- ======================================================================
-- 1. TABELA public.leads — ajustes aditivos sobre a tabela já existente
-- ======================================================================
create table if not exists public.leads (
  id                 uuid        default gen_random_uuid() primary key,
  created_at         timestamptz default now()             not null,
  nome               text                                  not null,
  email              text                                  not null,
  telefone           text                                  not null,
  tipo_imovel        text                                  not null,
  mensagem           text,
  consentimento_lgpd boolean                               not null default false,
  status             text        default 'novo'            not null
);

-- Novas colunas (nenhuma coluna existente é alterada/renomeada/removida)
alter table public.leads add column if not exists observacao       varchar(2000);
alter table public.leads add column if not exists consentimento_em timestamptz;
alter table public.leads add column if not exists pagina_origem    varchar(300);
alter table public.leads add column if not exists utm_source       varchar(150);
alter table public.leads add column if not exists utm_medium       varchar(150);
alter table public.leads add column if not exists utm_campaign     varchar(150);
alter table public.leads add column if not exists utm_term         varchar(150);
alter table public.leads add column if not exists utm_content      varchar(150);
alter table public.leads add column if not exists gclid            varchar(150);
alter table public.leads add column if not exists sessao_id        varchar(100);
alter table public.leads add column if not exists visitante_hash   varchar(100);
alter table public.leads add column if not exists atualizado_em    timestamptz default now() not null;

-- Limites de tamanho em colunas JÁ EXISTENTES via CHECK (não via retype — ver cabeçalho do arquivo).
alter table public.leads drop constraint if exists leads_nome_tamanho_check;
alter table public.leads add constraint leads_nome_tamanho_check check (char_length(nome) <= 200);

alter table public.leads drop constraint if exists leads_email_tamanho_check;
alter table public.leads add constraint leads_email_tamanho_check check (char_length(email) <= 200);

alter table public.leads drop constraint if exists leads_telefone_tamanho_check;
alter table public.leads add constraint leads_telefone_tamanho_check check (char_length(telefone) <= 20);

alter table public.leads drop constraint if exists leads_tipo_imovel_tamanho_check;
alter table public.leads add constraint leads_tipo_imovel_tamanho_check check (char_length(tipo_imovel) <= 50);

alter table public.leads drop constraint if exists leads_mensagem_tamanho_check;
alter table public.leads add constraint leads_mensagem_tamanho_check check (mensagem is null or char_length(mensagem) <= 2000);

-- Migração do status: lista fechada por ser campo interno/operacional (não vem do formulário público).
-- Lista antiga: novo | contatado | convertido | descartado
-- Lista nova:   novo | contatado | em_negociacao | fechado | perdido
alter table public.leads drop constraint if exists status_valores;
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('novo', 'contatado', 'em_negociacao', 'fechado', 'perdido'));

comment on table  public.leads                    is 'Leads do formulário de orçamento — site Alfa Prev.';
comment on column public.leads.status             is 'Controle manual do funil: novo | contatado | em_negociacao | fechado | perdido';
comment on column public.leads.consentimento_lgpd  is 'true = usuário aceitou a Política de Privacidade antes de enviar';
comment on column public.leads.consentimento_em    is 'Timestamp (servidor) do momento em que o consentimento foi registrado';
comment on column public.leads.pagina_origem       is 'Caminho da página onde o formulário foi enviado (ex: /contato.html)';
comment on column public.leads.sessao_id           is 'Identificador aleatório de sessão gerado no navegador (sessionStorage) — não é cookie persistente';
comment on column public.leads.visitante_hash      is 'Hash diário não reversível do visitante (ver sais_diarios) — nunca permite reidentificação';
comment on column public.leads.observacao          is 'Nota interna de acompanhamento, editável apenas pelo admin no painel /leads';

create index if not exists leads_created_at_idx      on public.leads (created_at desc);
create index if not exists leads_status_idx          on public.leads (status);
create index if not exists leads_email_idx            on public.leads (email);
create index if not exists leads_tipo_imovel_idx      on public.leads (tipo_imovel);
create index if not exists leads_visitante_hash_idx   on public.leads (visitante_hash, created_at desc);
create index if not exists leads_sessao_id_idx        on public.leads (sessao_id, created_at desc);

alter table public.leads enable row level security;


-- ======================================================================
-- 2. TABELA public.admins — usuários (auth.users) autorizados no /leads
-- ======================================================================
create table if not exists public.admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  criado_em timestamptz default now() not null
);
comment on table public.admins is 'Usuários autorizados a acessar o painel /leads. Inserir via supabase-admin.sql — nunca direto por API.';

alter table public.admins enable row level security;
-- Propositalmente SEM políticas: inacessível via REST/RPC em qualquer papel.
-- Só é lida pela função is_admin() (SECURITY DEFINER, roda com privilégio do dono da tabela).


-- ======================================================================
-- 3. TABELA public.eventos — métricas anônimas de navegação
-- ======================================================================
create table if not exists public.eventos (
  id             bigint generated always as identity primary key,
  criado_em      timestamptz default now() not null,
  tipo           text not null,
  caminho        varchar(300),
  origem         varchar(150),
  utm_source     varchar(150),
  utm_medium     varchar(150),
  utm_campaign   varchar(150),
  utm_term       varchar(150),
  utm_content    varchar(150),
  gclid          varchar(150),
  dispositivo    varchar(10),
  sessao_id      varchar(100),
  visitante_hash varchar(100)
);

alter table public.eventos drop constraint if exists eventos_tipo_check;
alter table public.eventos add constraint eventos_tipo_check
  check (tipo in ('page_view', 'whatsapp_click'));

alter table public.eventos drop constraint if exists eventos_dispositivo_check;
alter table public.eventos add constraint eventos_dispositivo_check
  check (dispositivo is null or dispositivo in ('mobile', 'tablet', 'desktop'));

comment on table  public.eventos               is 'Eventos anônimos de navegação (page_view, whatsapp_click). Nunca armazena IP ou user-agent.';
comment on column public.eventos.caminho       is 'Caminho da página, sempre sem query string (ex: /servicos.html)';
comment on column public.eventos.origem        is 'Domínio do referrer (ex: google.com) ou "direto"';
comment on column public.eventos.visitante_hash is 'Hash diário não reversível — ver sais_diarios';

create index if not exists eventos_criado_em_idx      on public.eventos (criado_em desc);
create index if not exists eventos_tipo_idx           on public.eventos (tipo);
create index if not exists eventos_caminho_idx        on public.eventos (caminho);
create index if not exists eventos_visitante_hash_idx on public.eventos (visitante_hash, criado_em desc);
create index if not exists eventos_sessao_id_idx      on public.eventos (sessao_id, criado_em desc);

alter table public.eventos enable row level security;
-- Sem políticas para anon/authenticated em nível de tabela: toda escrita passa por registrar_evento(),
-- toda leitura administrativa passa por dashboard_dados() (ambas abaixo), mais a policy de SELECT para admin.


-- ======================================================================
-- 4. TABELA public.sais_diarios — sal diário para o hash de visitante
-- ======================================================================
create table if not exists public.sais_diarios (
  dia date primary key,
  sal text not null
);
comment on table public.sais_diarios is
  'Sal aleatório por dia usado para computar visitante_hash. NUNCA exposto via API: RLS habilitado e SEM NENHUMA política. '
  'Sais de dias fora da retenção são apagados por limpar_eventos_antigos(), o que impede recomputar hashes antigos mesmo nos bastidores.';

alter table public.sais_diarios enable row level security;
-- Propositalmente ZERO políticas: inacessível via REST/RPC em qualquer papel (anon ou authenticated).
-- Só é lida/escrita pelas funções SECURITY DEFINER abaixo, que bypassam RLS por serem do dono da tabela.


-- ======================================================================
-- 5. FUNÇÕES INTERNAS (não concedidas a anon/authenticated — uso só interno)
-- ======================================================================
create or replace function public._sal_do_dia()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sal   text;
  v_hoje  date;
begin
  v_hoje := (now() at time zone 'America/Sao_Paulo')::date;
  select sal into v_sal from public.sais_diarios where dia = v_hoje;
  if v_sal is null then
    insert into public.sais_diarios (dia, sal)
      values (v_hoje, encode(gen_random_bytes(32), 'hex'))
      on conflict (dia) do nothing;
    select sal into v_sal from public.sais_diarios where dia = v_hoje;
  end if;
  return v_sal;
end;
$$;
comment on function public._sal_do_dia() is 'Helper interno: retorna (criando se preciso) o sal aleatório do dia atual (fuso America/Sao_Paulo).';
revoke all on function public._sal_do_dia() from public, anon, authenticated;

create or replace function public._hash_visitante(p_sessao_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sal     text;
  v_ip      text;
  v_ua      text;
  v_headers json;
  v_base    text;
begin
  v_sal := public._sal_do_dia();

  -- Tenta ler IP/User-Agent da GUC 'request.headers' exposta pelo PostgREST.
  -- Essa GUC não está disponível em todas as configurações de projeto Supabase —
  -- se não estiver, o hash cai para usar apenas o sessao_id (documentado em docs/DASHBOARD-LEADS.md).
  -- Em NENHUM caso o IP/user-agent são armazenados em qualquer tabela — só entram no hash.
  begin
    v_headers := current_setting('request.headers', true)::json;
    v_ip := coalesce(v_headers ->> 'x-forwarded-for', v_headers ->> 'cf-connecting-ip');
    v_ua := v_headers ->> 'user-agent';
  exception when others then
    v_ip := null;
    v_ua := null;
  end;

  v_base := coalesce(v_ip, '') || '|' || coalesce(v_ua, '') || '|' || coalesce(p_sessao_id, '');
  return encode(digest(v_base || v_sal, 'sha256'), 'hex');
end;
$$;
comment on function public._hash_visitante(text) is 'Helper interno: hash diário não reversível do visitante. Nunca persiste IP/user-agent — só os usa (se disponíveis) para compor o hash.';
revoke all on function public._hash_visitante(text) from public, anon, authenticated;


-- ======================================================================
-- 6. FUNÇÕES PÚBLICAS DE ESCRITA (SECURITY DEFINER — anon/authenticated podem chamar)
-- ======================================================================
create or replace function public.registrar_evento(
  p_tipo         text,
  p_caminho      text,
  p_origem       text default null,
  p_utm_source   text default null,
  p_utm_medium   text default null,
  p_utm_campaign text default null,
  p_utm_term     text default null,
  p_utm_content  text default null,
  p_gclid        text default null,
  p_dispositivo  text default null,
  p_sessao_id    text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash  text;
  v_count int;
begin
  if p_tipo is null or p_tipo not in ('page_view', 'whatsapp_click') then
    return; -- ignora silenciosamente tipo inválido, nunca retorna erro para o cliente
  end if;

  v_hash := public._hash_visitante(p_sessao_id);

  -- Rate limit silencioso: no máx. 30 eventos por hash/sessão por minuto (evita flood/abuso).
  select count(*) into v_count
    from public.eventos
    where (visitante_hash = v_hash or (p_sessao_id is not null and sessao_id = p_sessao_id))
      and criado_em > now() - interval '1 minute';
  if v_count >= 30 then
    return;
  end if;

  insert into public.eventos (
    tipo, caminho, origem,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid,
    dispositivo, sessao_id, visitante_hash
  ) values (
    p_tipo,
    left(split_part(coalesce(p_caminho, '/'), '?', 1), 300),
    left(coalesce(p_origem, 'direto'), 150),
    left(p_utm_source, 150), left(p_utm_medium, 150), left(p_utm_campaign, 150),
    left(p_utm_term, 150), left(p_utm_content, 150), left(p_gclid, 150),
    case when p_dispositivo in ('mobile', 'tablet', 'desktop') then p_dispositivo else null end,
    left(p_sessao_id, 100),
    v_hash
  );
end;
$$;
comment on function public.registrar_evento is 'Escrita pública de evento anônimo. Valida tipo, normaliza caminho/origem/UTMs, aplica rate limit silencioso, nunca retorna dados nem lança erro visível.';
revoke all on function public.registrar_evento(text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.registrar_evento(text,text,text,text,text,text,text,text,text,text,text) to anon, authenticated;


create or replace function public.registrar_lead(
  p_nome               text,
  p_email              text,
  p_telefone           text,
  p_tipo_imovel        text,
  p_mensagem           text,
  p_consentimento_lgpd boolean,
  p_pagina_origem      text default null,
  p_utm_source         text default null,
  p_utm_medium         text default null,
  p_utm_campaign       text default null,
  p_utm_term           text default null,
  p_utm_content        text default null,
  p_gclid              text default null,
  p_sessao_id          text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash                 text;
  v_count                int;
  v_telefone_normalizado text;
begin
  if p_consentimento_lgpd is distinct from true then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  if p_nome is null or length(trim(p_nome)) < 2 or length(p_nome) > 200 then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  if p_email is null or length(p_email) > 200 or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  v_telefone_normalizado := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
  if length(v_telefone_normalizado) < 10 or length(v_telefone_normalizado) > 13 then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  if p_tipo_imovel is null or length(p_tipo_imovel) = 0 or length(p_tipo_imovel) > 50 then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  if p_mensagem is not null and length(p_mensagem) > 2000 then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  v_hash := public._hash_visitante(p_sessao_id);

  -- Rate limit: no máx. 5 leads por hash/sessão por hora (erro genérico, nunca específico).
  select count(*) into v_count
    from public.leads
    where (visitante_hash = v_hash or (p_sessao_id is not null and sessao_id = p_sessao_id))
      and created_at > now() - interval '1 hour';
  if v_count >= 5 then
    raise exception 'Não foi possível enviar o formulário.';
  end if;

  insert into public.leads (
    nome, email, telefone, tipo_imovel, mensagem,
    consentimento_lgpd, consentimento_em, pagina_origem,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid,
    sessao_id, visitante_hash
  ) values (
    left(trim(p_nome), 200), left(trim(p_email), 200), left(v_telefone_normalizado, 20),
    left(p_tipo_imovel, 50), left(p_mensagem, 2000),
    true, now(), left(p_pagina_origem, 300),
    left(p_utm_source, 150), left(p_utm_medium, 150), left(p_utm_campaign, 150),
    left(p_utm_term, 150), left(p_utm_content, 150), left(p_gclid, 150),
    left(p_sessao_id, 100), v_hash
  );
end;
$$;
comment on function public.registrar_lead is 'Escrita pública de lead do formulário. Valida campos/consentimento, normaliza telefone, aplica rate limit, nunca retorna dados. Mensagem de erro sempre genérica.';
revoke all on function public.registrar_lead(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text) from public;
grant execute on function public.registrar_lead(text,text,text,text,text,boolean,text,text,text,text,text,text,text,text) to anon, authenticated;


-- ======================================================================
-- 7. is_admin() — usada nas policies e nas funções de leitura administrativa
-- ======================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
comment on function public.is_admin() is 'true se o usuário autenticado atual está na tabela admins.';
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- ======================================================================
-- 8. FUNÇÕES ADMINISTRATIVAS DE LEITURA (SECURITY INVOKER — RLS do caller aplica)
-- ======================================================================
create or replace function public.dashboard_dados(p_inicio date, p_fim date)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $$
declare
  v_resultado jsonb;
  v_inicio_ts timestamptz;
  v_fim_ts    timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;

  v_inicio_ts := (p_inicio::timestamp) at time zone 'America/Sao_Paulo';
  v_fim_ts    := ((p_fim + 1)::timestamp) at time zone 'America/Sao_Paulo';

  with eventos_periodo as (
    select * from public.eventos where criado_em >= v_inicio_ts and criado_em < v_fim_ts
  ),
  leads_periodo as (
    select * from public.leads where created_at >= v_inicio_ts and created_at < v_fim_ts
  ),
  totais as (
    select
      count(*) filter (where tipo = 'page_view')                      as visualizacoes,
      count(distinct sessao_id) filter (where tipo = 'page_view')      as visitas,
      count(distinct visitante_hash) filter (where tipo = 'page_view') as visitantes_unicos_aprox,
      count(*) filter (where tipo = 'whatsapp_click')                  as cliques_whatsapp
    from eventos_periodo
  ),
  total_leads as (
    select count(*) as total from leads_periodo
  ),
  serie_eventos as (
    select
      to_char(date_trunc('day', criado_em at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD') as dia,
      count(*) filter (where tipo = 'page_view')                  as visualizacoes,
      count(distinct sessao_id) filter (where tipo = 'page_view') as visitas,
      count(*) filter (where tipo = 'whatsapp_click')             as cliques_whatsapp
    from eventos_periodo
    group by 1
  ),
  serie_leads as (
    select
      to_char(date_trunc('day', created_at at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD') as dia,
      count(*) as leads
    from leads_periodo
    group by 1
  ),
  top_paginas as (
    select caminho, count(*) as visualizacoes
    from eventos_periodo where tipo = 'page_view'
    group by caminho order by visualizacoes desc limit 10
  ),
  origens as (
    select coalesce(origem, 'direto') as origem, count(*) as visualizacoes
    from eventos_periodo where tipo = 'page_view'
    group by 1 order by visualizacoes desc limit 10
  ),
  dispositivos as (
    select coalesce(dispositivo, 'desconhecido') as dispositivo, count(*) as visualizacoes
    from eventos_periodo where tipo = 'page_view'
    group by 1
  ),
  leads_por_ocupacao as (
    select tipo_imovel, count(*) as total from leads_periodo group by 1 order by total desc
  ),
  leads_por_status as (
    select status, count(*) as total from leads_periodo group by 1 order by total desc
  )
  select jsonb_build_object(
    'periodo', jsonb_build_object('inicio', p_inicio, 'fim', p_fim, 'fuso', 'America/Sao_Paulo'),
    'totais', jsonb_build_object(
      'visualizacoes', (select visualizacoes from totais),
      'visitas', (select visitas from totais),
      'visitantes_unicos_aprox', (select visitantes_unicos_aprox from totais),
      'cliques_whatsapp', (select cliques_whatsapp from totais),
      'leads', (select total from total_leads),
      'taxa_conversao', case when (select visitas from totais) > 0
        then round((select total from total_leads)::numeric / (select visitas from totais) * 100, 2)
        else 0 end
    ),
    'serie_diaria', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'dia', e.dia, 'visualizacoes', e.visualizacoes, 'visitas', e.visitas,
        'cliques_whatsapp', e.cliques_whatsapp,
        'leads', coalesce((select l.leads from serie_leads l where l.dia = e.dia), 0)
      ) order by e.dia), '[]'::jsonb)
      from serie_eventos e
    ),
    'top_paginas',        (select coalesce(jsonb_agg(jsonb_build_object('caminho', caminho, 'visualizacoes', visualizacoes)), '[]'::jsonb) from top_paginas),
    'origens',            (select coalesce(jsonb_agg(jsonb_build_object('origem', origem, 'visualizacoes', visualizacoes)), '[]'::jsonb) from origens),
    'dispositivos',       (select coalesce(jsonb_agg(jsonb_build_object('dispositivo', dispositivo, 'visualizacoes', visualizacoes)), '[]'::jsonb) from dispositivos),
    'leads_por_ocupacao', (select coalesce(jsonb_agg(jsonb_build_object('ocupacao', tipo_imovel, 'total', total)), '[]'::jsonb) from leads_por_ocupacao),
    'leads_por_status',   (select coalesce(jsonb_agg(jsonb_build_object('status', status, 'total', total)), '[]'::jsonb) from leads_por_status)
  ) into v_resultado;

  return v_resultado;
end;
$$;
comment on function public.dashboard_dados(date,date) is 'Leitura administrativa (SECURITY INVOKER — RLS do caller aplica). "visitantes_unicos_aprox" é uma aproximação por hash diário, NÃO rastreia a mesma pessoa entre dias diferentes.';
revoke all on function public.dashboard_dados(date,date) from public, anon;
grant execute on function public.dashboard_dados(date,date) to authenticated;


create or replace function public.listar_leads(
  p_busca       text default null,
  p_status      text default null,
  p_ocupacao    text default null,
  p_inicio      date default null,
  p_fim         date default null,
  p_ordenar_por text default 'created_at',
  p_ordem       text default 'desc',
  p_pagina      int  default 1,
  p_por_pagina  int  default 25
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = ''
as $$
declare
  v_offset           int;
  v_limite           int;
  v_coluna           text;
  v_direcao          text;
  v_total            int;
  v_dados            jsonb;
  v_busca_escapada   text;
begin
  if not public.is_admin() then
    raise exception 'Acesso negado.';
  end if;

  v_limite  := least(greatest(coalesce(p_por_pagina, 25), 1), 100);
  v_offset  := greatest(coalesce(p_pagina, 1) - 1, 0) * v_limite;
  v_coluna  := case p_ordenar_por when 'nome' then 'nome' when 'status' then 'status' when 'tipo_imovel' then 'tipo_imovel' else 'created_at' end;
  v_direcao := case when lower(coalesce(p_ordem, 'desc')) = 'asc' then 'asc' else 'desc' end;

  if p_busca is not null and length(trim(p_busca)) > 0 then
    -- Escapa caracteres especiais do ILIKE (\ % _) antes de envolver em wildcards.
    v_busca_escapada := '%' || replace(replace(replace(trim(p_busca), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  select count(*) into v_total
  from public.leads l
  where (v_busca_escapada is null or l.nome ilike v_busca_escapada escape '\' or l.email ilike v_busca_escapada escape '\' or l.telefone ilike v_busca_escapada escape '\')
    and (p_status   is null or l.status = p_status)
    and (p_ocupacao is null or l.tipo_imovel = p_ocupacao)
    and (p_inicio   is null or l.created_at >= (p_inicio::timestamp at time zone 'America/Sao_Paulo'))
    and (p_fim      is null or l.created_at <  ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo'));

  select coalesce(jsonb_agg(jsonb_build_object(
      'id', q.id, 'nome', q.nome, 'email', q.email, 'telefone', q.telefone,
      'ocupacao', q.tipo_imovel, 'mensagem', q.mensagem, 'status', q.status,
      'observacao', q.observacao,
      'contato_em', to_char(q.created_at at time zone 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
      'pagina_origem', q.pagina_origem
    )), '[]'::jsonb)
  into v_dados
  from (
    select * from public.leads l
    where (v_busca_escapada is null or l.nome ilike v_busca_escapada escape '\' or l.email ilike v_busca_escapada escape '\' or l.telefone ilike v_busca_escapada escape '\')
      and (p_status   is null or l.status = p_status)
      and (p_ocupacao is null or l.tipo_imovel = p_ocupacao)
      and (p_inicio   is null or l.created_at >= (p_inicio::timestamp at time zone 'America/Sao_Paulo'))
      and (p_fim      is null or l.created_at <  ((p_fim + 1)::timestamp at time zone 'America/Sao_Paulo'))
    order by
      (case when v_coluna = 'nome'        and v_direcao = 'asc'  then l.nome end) asc,
      (case when v_coluna = 'nome'        and v_direcao = 'desc' then l.nome end) desc,
      (case when v_coluna = 'status'      and v_direcao = 'asc'  then l.status end) asc,
      (case when v_coluna = 'status'      and v_direcao = 'desc' then l.status end) desc,
      (case when v_coluna = 'tipo_imovel' and v_direcao = 'asc'  then l.tipo_imovel end) asc,
      (case when v_coluna = 'tipo_imovel' and v_direcao = 'desc' then l.tipo_imovel end) desc,
      (case when v_coluna = 'created_at'  and v_direcao = 'asc'  then l.created_at end) asc,
      (case when v_coluna = 'created_at'  and v_direcao = 'desc' then l.created_at end) desc
    limit v_limite offset v_offset
  ) q;

  return jsonb_build_object('total', v_total, 'pagina', coalesce(p_pagina, 1), 'por_pagina', v_limite, 'dados', v_dados);
end;
$$;
comment on function public.listar_leads is 'Leitura administrativa paginada/filtrada de leads (SECURITY INVOKER — RLS do caller aplica). Busca via ILIKE com escape de wildcards.';
revoke all on function public.listar_leads(text,text,text,date,date,text,text,int,int) from public, anon;
grant execute on function public.listar_leads(text,text,text,date,date,text,text,int,int) to authenticated;


-- ======================================================================
-- 9. MANUTENÇÃO — purga de eventos/sais antigos (retenção configurável)
-- ======================================================================
create or replace function public.limpar_eventos_antigos(p_dias int default 180)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.eventos where criado_em < now() - (p_dias || ' days')::interval;
  delete from public.sais_diarios where dia < (now() at time zone 'America/Sao_Paulo')::date - p_dias;
end;
$$;
comment on function public.limpar_eventos_antigos(int) is 'Purga eventos e sais diários com mais de p_dias (padrão 180). Agendar via pg_cron se disponível no plano (confirmar no painel), senão executar manualmente — ver docs/DASHBOARD-LEADS.md.';
revoke all on function public.limpar_eventos_antigos(int) from public, anon, authenticated;

-- Agendamento automático (requer extensão pg_cron habilitada — confirmar em Database > Extensions):
-- select cron.schedule('limpar-eventos-antigos', '0 3 * * *', $$select public.limpar_eventos_antigos(180);$$);


-- ======================================================================
-- 10. GRANTS MÍNIMOS e POLICIES (revoga tudo, concede só o necessário)
-- ======================================================================
revoke all on public.leads        from public, anon, authenticated;
revoke all on public.eventos      from public, anon, authenticated;
revoke all on public.admins       from public, anon, authenticated;
revoke all on public.sais_diarios from public, anon, authenticated;

-- anon: NENHUM grant direto em tabela — só pode executar registrar_evento/registrar_lead (concedido acima).

-- authenticated (admin confirmado via is_admin() nas policies abaixo):
grant select, delete on public.leads to authenticated;
grant update (status, observacao, atualizado_em) on public.leads to authenticated;
grant select on public.eventos to authenticated;

-- Remove a política antiga de INSERT direto de anon em leads — só agora que registrar_lead já existe,
-- para que SQL e frontend novo sigam juntos no mesmo deploy (o site ainda não está em produção).
drop policy if exists "anon_insert_com_consentimento" on public.leads;

drop policy if exists "admin_select_leads" on public.leads;
create policy "admin_select_leads" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "admin_update_leads" on public.leads;
create policy "admin_update_leads" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_delete_leads" on public.leads;
create policy "admin_delete_leads" on public.leads
  for delete to authenticated using (public.is_admin());

drop policy if exists "admin_select_eventos" on public.eventos;
create policy "admin_select_eventos" on public.eventos
  for select to authenticated using (public.is_admin());

comment on policy "admin_select_leads"   on public.leads   is 'Só quem está em admins (is_admin()) pode ler leads.';
comment on policy "admin_update_leads"   on public.leads   is 'Só admin pode atualizar; GRANT de coluna restringe a status/observacao/atualizado_em.';
comment on policy "admin_delete_leads"   on public.leads   is 'Só admin pode excluir (atende solicitações de exclusão LGPD).';
comment on policy "admin_select_eventos" on public.eventos is 'Só admin pode ler eventos (usado por dashboard_dados).';


-- ======================================================================
-- VERIFICAÇÃO PÓS-EXECUÇÃO
-- ======================================================================
-- No painel: Database > Tables > leads/eventos/admins/sais_diarios devem mostrar "RLS enabled".
-- Database > Functions deve listar: registrar_evento, registrar_lead, is_admin, dashboard_dados,
--   listar_leads, limpar_eventos_antigos, _sal_do_dia, _hash_visitante.
--
-- Teste seguro de escrita (via função, nunca INSERT direto) no SQL Editor:
-- select public.registrar_lead('Teste', 'teste@teste.com', '(11) 99999-9999', 'comercial', 'Teste', true);
-- select public.registrar_evento('page_view', '/teste.html', 'direto', null,null,null,null,null,null,'desktop','sessao-teste');
-- → Ambos devem rodar sem erro; confira as linhas em Table Editor > leads / eventos.
