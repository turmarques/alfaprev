/**
 * ALFA PREV — assets/js/leads/auth.js
 *
 * Autenticação do painel /leads via Supabase Auth (e-mail/senha).
 * Depende do cliente vendorizado em assets/vendor/supabase-js/supabase.js
 * e de SUPABASE_URL / SUPABASE_ANON_KEY (assets/js/config.js).
 *
 * Regras de segurança (ver docs/DASHBOARD-LEADS.md):
 *  - Login válido mas sem is_admin() verdadeiro é tratado como falha
 *    (o usuário é deslogado e contabilizado no bloqueio local).
 *  - Sessão expira por inatividade (padrão: 30 minutos).
 *  - Em logout (manual, por inatividade ou por falha de admin), o DOM com
 *    dados de leads é limpo antes de qualquer outra coisa.
 *
 * Módulo com DOM (depende do browser) — não é testado via node --test.
 * A lógica pura de bloqueio é testada em assets/js/leads/bloqueio.js.
 */
'use strict';

(function () {
  var INATIVIDADE_MS = 30 * 60 * 1000;
  var client = null;
  var timerInatividade = null;
  var callbacksEstado = [];

  function clienteSupabase() {
    if (client) return client;
    if (typeof supabase === 'undefined' || typeof SUPABASE_URL === 'undefined') return null;
    if (!SUPABASE_URL.startsWith('https://')) return null;
    client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storage: window.sessionStorage },
    });
    return client;
  }

  function notificar(estado) {
    callbacksEstado.forEach(function (fn) {
      try { fn(estado); } catch (e) { /* ignora erro de um observador isolado */ }
    });
  }

  function aoMudarEstado(fn) {
    callbacksEstado.push(fn);
  }

  function limparInatividade() {
    if (timerInatividade) clearTimeout(timerInatividade);
  }

  function agendarInatividade() {
    limparInatividade();
    timerInatividade = setTimeout(function () {
      sair('inatividade');
    }, INATIVIDADE_MS);
  }

  function monitorarAtividade() {
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(function (evento) {
      document.addEventListener(evento, agendarInatividade, { passive: true });
    });
  }

  async function verificarAdmin() {
    var c = clienteSupabase();
    if (!c) return false;
    try {
      var resultado = await c.rpc('is_admin');
      if (resultado.error) return false;
      return resultado.data === true;
    } catch (e) {
      return false;
    }
  }

  async function entrar(email, senha) {
    var c = clienteSupabase();
    if (!c) return { ok: false, motivo: 'config' };

    var resultado;
    try {
      resultado = await c.auth.signInWithPassword({ email: email, password: senha });
    } catch (e) {
      return { ok: false, motivo: 'rede' };
    }

    if (resultado.error) {
      var status = resultado.error.status;
      if (status === 429) return { ok: false, motivo: '429' };
      return { ok: false, motivo: 'credenciais' };
    }

    var ehAdmin = await verificarAdmin();
    if (!ehAdmin) {
      await c.auth.signOut();
      return { ok: false, motivo: 'nao_admin' };
    }

    agendarInatividade();
    monitorarAtividade();
    notificar('autenticado');
    return { ok: true };
  }

  async function sair(motivo) {
    limparInatividade();
    notificar('limpar_dom');
    var c = clienteSupabase();
    if (c) {
      try { await c.auth.signOut(); } catch (e) { /* já pode estar sem sessão */ }
    }
    notificar('deslogado');
  }

  async function sessaoAtual() {
    var c = clienteSupabase();
    if (!c) return null;
    try {
      var resultado = await c.auth.getSession();
      if (resultado.error || !resultado.data || !resultado.data.session) return null;
      return resultado.data.session;
    } catch (e) {
      return null;
    }
  }

  async function restaurarSessao() {
    var sessao = await sessaoAtual();
    if (!sessao) return false;
    var ehAdmin = await verificarAdmin();
    if (!ehAdmin) {
      await sair('nao_admin');
      return false;
    }
    agendarInatividade();
    monitorarAtividade();
    return true;
  }

  window.AlfaPrevAuth = {
    entrar: entrar,
    sair: sair,
    restaurarSessao: restaurarSessao,
    aoMudarEstado: aoMudarEstado,
    clienteSupabase: clienteSupabase,
  };
})();
