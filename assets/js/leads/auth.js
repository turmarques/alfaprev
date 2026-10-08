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
 * 2FA (TOTP) obrigatório (adicionado out/2026, auditoria de segurança):
 *  - public.is_admin() no banco exige AAL2 (ver supabase-schema.sql) — a
 *    aplicação é só a camada de UX; a imposição real está na função SQL.
 *  - Login só é considerado completo depois do desafio TOTP ser verificado.
 *    Se o admin ainda não tiver um fator TOTP verificado, o cadastro (QR/
 *    segredo) é obrigatório antes do primeiro acesso ao painel.
 *  - O segredo TOTP nunca é logado nem persistido pela aplicação — existe só
 *    na resposta da chamada de enroll, repassado direto para a tela.
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

  async function finalizarLoginAdmin() {
    var c = clienteSupabase();
    var ehAdmin = await verificarAdmin();
    if (!ehAdmin) {
      if (c) { try { await c.auth.signOut(); } catch (e) { /* ignora */ } }
      return { ok: false, motivo: 'nao_admin' };
    }
    agendarInatividade();
    monitorarAtividade();
    notificar('autenticado');
    return { ok: true };
  }

  // Decide, depois de senha+e-mail corretos, se falta cadastrar ou desafiar o
  // segundo fator (TOTP) antes de liberar o painel. is_admin() no banco exige
  // AAL2 (ver supabase-schema.sql) — aqui só decidimos qual tela mostrar.
  async function avaliarEstadoMfa() {
    var c = clienteSupabase();
    if (!c) return { ok: false, motivo: 'config' };

    var nivel;
    try {
      var resultadoNivel = await c.auth.mfa.getAuthenticatorAssuranceLevel();
      if (resultadoNivel.error) throw resultadoNivel.error;
      nivel = resultadoNivel.data;
    } catch (e) {
      return { ok: false, motivo: 'rede' };
    }

    if (nivel && nivel.currentLevel === 'aal2') {
      return await finalizarLoginAdmin();
    }

    var fatorVerificado = null;
    try {
      var resultadoFatores = await c.auth.mfa.listFactors();
      if (!resultadoFatores.error && resultadoFatores.data && resultadoFatores.data.totp) {
        resultadoFatores.data.totp.forEach(function (fator) {
          if (fator.status === 'verified') fatorVerificado = fator;
        });
      }
    } catch (e) { /* trata como "nenhum fator" abaixo */ }

    if (!fatorVerificado) {
      return { ok: false, motivo: 'mfa_cadastro_necessario' };
    }
    return { ok: false, motivo: 'mfa_codigo_necessario', factorId: fatorVerificado.id };
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

    return await avaliarEstadoMfa();
  }

  // Inicia o cadastro de um novo fator TOTP. Retorna o segredo em texto para
  // o admin digitar manualmente no app autenticador (Google Authenticator,
  // Authy, 1Password, etc.) — não renderizamos o QR code em SVG retornado
  // pela API para não precisar inserir HTML de terceiro via innerHTML.
  async function iniciarCadastroMfa() {
    var c = clienteSupabase();
    if (!c) return { ok: false };
    try {
      var resultado = await c.auth.mfa.enroll({ factorType: 'totp' });
      if (resultado.error || !resultado.data) return { ok: false };
      return {
        ok: true,
        factorId: resultado.data.id,
        secret: resultado.data.totp.secret,
        uri: resultado.data.totp.uri,
      };
    } catch (e) {
      return { ok: false };
    }
  }

  // Usado tanto para confirmar o cadastro (primeiro código gerado pelo app
  // autenticador) quanto para o desafio normal de login em sessões futuras.
  async function verificarCodigoMfa(factorId, codigo) {
    var c = clienteSupabase();
    if (!c) return { ok: false, motivo: 'config' };
    try {
      var resultado = await c.auth.mfa.challengeAndVerify({ factorId: factorId, code: codigo });
      if (resultado.error) return { ok: false, motivo: 'codigo_invalido' };
    } catch (e) {
      return { ok: false, motivo: 'rede' };
    }
    return await finalizarLoginAdmin();
  }

  // Cancela um cadastro/desafio de MFA em andamento (ex: o admin fechou o
  // diálogo sem concluir) — desloga para não deixar uma sessão aal1
  // "pendurada" sem o timer de inatividade (que só começa após o login
  // completo). Ver sair().
  async function cancelarFluxoMfa() {
    await sair('mfa_cancelado');
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
    iniciarCadastroMfa: iniciarCadastroMfa,
    verificarCodigoMfa: verificarCodigoMfa,
    cancelarFluxoMfa: cancelarFluxoMfa,
  };
})();
