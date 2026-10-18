/**
 * ALFA PREV — assets/js/leads/auth.js
 *
 * Autenticação do painel /leads via api/login.php + api/mfa-*.php (sessão
 * PHP nativa, cookie HttpOnly/Secure/SameSite=Strict — ver api/lib/sessao.php).
 *
 * Regras de segurança (ver docs/DASHBOARD-LEADS.md):
 *  - Sessão expira por inatividade (padrão: 30 minutos) — o timer aqui é só
 *    UX; a imposição real é no servidor (api/lib/sessao.php).
 *  - Em logout (manual, por inatividade ou por falha no fluxo de MFA), o DOM
 *    com dados de leads é limpo antes de qualquer outra coisa.
 *
 * 2FA (TOTP) obrigatório (adicionado out/2026, auditoria de segurança):
 *  - O login só é considerado completo depois do desafio TOTP ser verificado
 *    (api/mfa-verificar.php). Se o admin ainda não tiver um fator TOTP
 *    confirmado, o cadastro (api/mfa-cadastro.php) é obrigatório antes do
 *    primeiro acesso ao painel.
 *  - O segredo TOTP nunca é logado nem persistido pelo front-end — existe só
 *    na resposta de api/mfa-cadastro.php, repassado direto para a tela.
 *
 * Todas as chamadas são fetch same-origin (caminhos relativos). As chamadas
 * GET administrativas (sessao-verificar.php) funcionam mesmo com a página
 * usando <meta name="referrer" content="no-referrer"> porque o servidor
 * tolera a ausência de Origin/Referer nesse caso (ver
 * api/lib/resposta.php::alfaprev_exigir_same_origin($exigirPresenca=false)).
 *
 * Módulo com DOM (depende do browser) — não é testado via node --test.
 * A lógica pura de bloqueio é testada em assets/js/leads/bloqueio.js.
 */
'use strict';

(function () {
  var INATIVIDADE_MS = 30 * 60 * 1000;
  var timerInatividade = null;
  var callbacksEstado = [];
  var csrfTokenAtual = null;

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

  async function requisitarJson(caminho, opcoes) {
    var resposta = await fetch(caminho, Object.assign({ credentials: 'same-origin' }, opcoes || {}));
    var dados = null;
    try { dados = await resposta.json(); } catch (e) { /* corpo vazio ou inválido */ }
    return { status: resposta.status, ok: resposta.ok, dados: dados };
  }

  function csrfToken() {
    return csrfTokenAtual;
  }

  // Busca o token CSRF atual chamando sessao-verificar.php — chamado sempre
  // que uma sessão admin é finalizada (login completo ou restauração).
  async function atualizarCsrfToken() {
    try {
      var resultado = await requisitarJson('/api/sessao-verificar.php', { method: 'GET', cache: 'no-store' });
      if (resultado.ok && resultado.dados && resultado.dados.autenticado) {
        csrfTokenAtual = resultado.dados.csrf_token || null;
        return true;
      }
    } catch (e) { /* trata como não autenticado abaixo */ }
    csrfTokenAtual = null;
    return false;
  }

  async function finalizarLoginAdmin() {
    var ok = await atualizarCsrfToken();
    if (!ok) return { ok: false, motivo: 'rede' };
    agendarInatividade();
    monitorarAtividade();
    notificar('autenticado');
    return { ok: true };
  }

  async function entrar(email, senha) {
    var resultado;
    try {
      resultado = await requisitarJson('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: senha }),
      });
    } catch (e) {
      return { ok: false, motivo: 'rede' };
    }

    if (resultado.status === 429) return { ok: false, motivo: '429' };

    if (!resultado.ok) {
      if (resultado.dados && resultado.dados.erro === 'credenciais_invalidas') {
        return { ok: false, motivo: 'credenciais' };
      }
      return { ok: false, motivo: 'rede' };
    }

    var dados = resultado.dados || {};
    if (dados.motivo === 'mfa_cadastro_necessario') {
      return { ok: false, motivo: 'mfa_cadastro_necessario' };
    }
    if (dados.motivo === 'mfa_codigo_necessario') {
      return { ok: false, motivo: 'mfa_codigo_necessario', factorId: dados.factorId };
    }
    return { ok: false, motivo: 'rede' };
  }

  // Inicia o cadastro de um novo fator TOTP. Retorna o segredo em texto para
  // o admin digitar manualmente no app autenticador (Google Authenticator,
  // Authy, 1Password, etc.) — sem QR code (CSP restrita, sem innerHTML de
  // terceiro).
  async function iniciarCadastroMfa() {
    try {
      var resultado = await requisitarJson('/api/mfa-cadastro.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!resultado.ok || !resultado.dados || !resultado.dados.ok) return { ok: false };
      return {
        ok: true,
        factorId: resultado.dados.factorId,
        secret: resultado.dados.secret,
      };
    } catch (e) {
      return { ok: false };
    }
  }

  // Usado tanto para confirmar o cadastro (primeiro código gerado pelo app
  // autenticador) quanto para o desafio normal de login em sessões futuras.
  async function verificarCodigoMfa(factorId, codigo) {
    var resultado;
    try {
      resultado = await requisitarJson('/api/mfa-verificar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo }),
      });
    } catch (e) {
      return { ok: false, motivo: 'rede' };
    }
    if (!resultado.ok) return { ok: false, motivo: 'codigo_invalido' };
    return await finalizarLoginAdmin();
  }

  // Cancela um cadastro/desafio de MFA em andamento (ex: o admin fechou o
  // diálogo sem concluir). O servidor já limpa o estado de pré-login
  // (pre_admin_id) — aqui só garantimos o estado local coerente.
  async function cancelarFluxoMfa() {
    try {
      await requisitarJson('/api/cancelar-mfa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (e) { /* ignora — não há sessão sensível a proteger aqui */ }
    limparInatividade();
    csrfTokenAtual = null;
    notificar('limpar_dom');
    notificar('deslogado');
  }

  async function sair(motivo) {
    limparInatividade();
    notificar('limpar_dom');
    try {
      await requisitarJson('/api/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (e) { /* idempotente — segue mesmo se a requisição falhar */ }
    csrfTokenAtual = null;
    notificar('deslogado');
  }

  async function restaurarSessao() {
    var ok = await atualizarCsrfToken();
    if (!ok) return false;
    agendarInatividade();
    monitorarAtividade();
    return true;
  }

  window.AlfaPrevAuth = {
    entrar: entrar,
    sair: sair,
    restaurarSessao: restaurarSessao,
    aoMudarEstado: aoMudarEstado,
    iniciarCadastroMfa: iniciarCadastroMfa,
    verificarCodigoMfa: verificarCodigoMfa,
    cancelarFluxoMfa: cancelarFluxoMfa,
    csrfToken: csrfToken,
  };
})();
