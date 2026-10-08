/**
 * ALFA PREV — assets/js/leads/app.js
 *
 * Bootstrap da página /leads: liga o diálogo de login, o bloqueio por
 * tentativas (assets/js/leads/bloqueio.js), a autenticação (auth.js) e o
 * carregamento do dashboard (dashboard.js) e da grade de leads (grade.js).
 *
 * Módulo com DOM — não testado via node --test.
 */
'use strict';

(function () {
  var bloqueio = null;
  var intervaloContagem = null;
  var fatorMfaAtual = null;

  function elemento(id) { return document.getElementById(id); }

  function travarFundo() {
    var conteudo = elemento('conteudo-painel');
    if (conteudo) conteudo.setAttribute('inert', '');
    document.body.classList.add('travado');
  }

  function destravarFundo() {
    var conteudo = elemento('conteudo-painel');
    if (conteudo) conteudo.removeAttribute('inert');
    document.body.classList.remove('travado');
  }

  function mostrarLogin() {
    var dialogo = elemento('login-dialogo');
    travarFundo();
    if (dialogo && typeof dialogo.showModal === 'function' && !dialogo.open) {
      dialogo.showModal();
    }
    atualizarEstadoBloqueio();
  }

  function esconderLogin() {
    var dialogo = elemento('login-dialogo');
    if (dialogo && dialogo.open) dialogo.close();
    destravarFundo();
  }

  function atualizarEstadoBloqueio() {
    if (!bloqueio) return;
    var status = bloqueio.status();
    var form = elemento('login-form');
    var campoSenha = elemento('login-senha');
    var campoEmail = elemento('login-email');
    var botaoEntrar = elemento('btn-login-entrar');
    var contagem = elemento('login-contagem');
    var erro = elemento('login-erro');

    clearInterval(intervaloContagem);

    if (status.bloqueado) {
      if (campoSenha) campoSenha.disabled = true;
      if (campoEmail) campoEmail.disabled = true;
      if (botaoEntrar) botaoEntrar.disabled = true;
      if (erro) erro.textContent = 'Muitas tentativas. Tente novamente em breve.';

      var restante = status.restanteMs;
      if (contagem) contagem.textContent = bloqueio.formatarContagem(restante);
      intervaloContagem = setInterval(function () {
        restante -= 1000;
        if (restante <= 0) {
          clearInterval(intervaloContagem);
          atualizarEstadoBloqueio();
          return;
        }
        if (contagem) contagem.textContent = bloqueio.formatarContagem(restante);
      }, 1000);
    } else {
      if (campoSenha) campoSenha.disabled = false;
      if (campoEmail) campoEmail.disabled = false;
      if (botaoEntrar) botaoEntrar.disabled = false;
      if (contagem) contagem.textContent = '';
    }
  }

  function mensagemErro(motivo) {
    switch (motivo) {
      case 'config': return 'Painel não configurado. Verifique assets/js/config.js.';
      case 'rede': return 'Falha de conexão. Verifique sua internet e tente novamente.';
      case '429': return 'Muitas tentativas de login. Aguarde antes de tentar novamente.';
      case 'nao_admin': return 'Este usuário não tem permissão de administrador.';
      default: return 'E-mail ou senha incorretos.';
    }
  }

  // Diálogo de verificação em duas etapas (TOTP) — cobre cadastro do primeiro
  // fator (motivo === 'mfa_cadastro_necessario') e desafio normal de login
  // (motivo === 'mfa_codigo_necessario'). Ver assets/js/leads/auth.js.
  async function abrirFluxoMfa(motivo, factorId) {
    var dialogoLogin = elemento('login-dialogo');
    if (dialogoLogin && dialogoLogin.open) dialogoLogin.close();

    var dialogo = elemento('mfa-dialogo');
    var instrucao = elemento('mfa-instrucao');
    var blocoCadastro = elemento('mfa-cadastro-bloco');
    var campoSegredo = elemento('mfa-segredo');
    var erro = elemento('mfa-erro');
    var campoCodigo = elemento('mfa-codigo');

    if (erro) erro.textContent = '';
    if (campoCodigo) campoCodigo.value = '';

    if (motivo === 'mfa_cadastro_necessario') {
      var cadastro = await window.AlfaPrevAuth.iniciarCadastroMfa();
      if (!cadastro.ok) {
        await window.AlfaPrevAuth.cancelarFluxoMfa();
        mostrarLogin();
        var erroLogin = elemento('login-erro');
        if (erroLogin) erroLogin.textContent = 'Não foi possível iniciar a verificação em duas etapas. Tente novamente.';
        return;
      }
      fatorMfaAtual = cadastro.factorId;
      if (instrucao) instrucao.textContent = 'Primeiro acesso: cadastre a verificação em duas etapas no seu app autenticador e digite o código gerado para confirmar.';
      if (blocoCadastro) blocoCadastro.hidden = false;
      if (campoSegredo) campoSegredo.value = cadastro.secret;
    } else {
      fatorMfaAtual = factorId;
      if (instrucao) instrucao.textContent = 'Digite o código de 6 dígitos do seu app autenticador.';
      if (blocoCadastro) blocoCadastro.hidden = true;
    }

    if (dialogo && typeof dialogo.showModal === 'function' && !dialogo.open) {
      dialogo.showModal();
    }
  }

  async function cancelarMfaEVoltarAoLogin() {
    var dialogo = elemento('mfa-dialogo');
    if (dialogo && dialogo.open) dialogo.close();
    fatorMfaAtual = null;
    await window.AlfaPrevAuth.cancelarFluxoMfa();
    mostrarLogin();
  }

  async function aoEnviarMfa(evento) {
    evento.preventDefault();
    var campoCodigo = elemento('mfa-codigo');
    var codigo = campoCodigo ? campoCodigo.value.trim() : '';
    var erro = elemento('mfa-erro');
    var botao = elemento('btn-mfa-confirmar');

    if (erro) erro.textContent = '';
    if (botao) botao.disabled = true;

    var resultado = fatorMfaAtual ? await window.AlfaPrevAuth.verificarCodigoMfa(fatorMfaAtual, codigo) : { ok: false };

    if (botao) botao.disabled = false;

    if (!resultado.ok) {
      if (erro) erro.textContent = 'Código inválido ou expirado. Confira o app autenticador e tente novamente.';
      return;
    }

    fatorMfaAtual = null;
    elemento('mfa-form').reset();
    var dialogo = elemento('mfa-dialogo');
    if (dialogo && dialogo.open) dialogo.close();
    bloqueio.registrarSucesso();
    aoAutenticar();
  }

  async function aoEnviarLogin(evento) {
    evento.preventDefault();
    if (!bloqueio || bloqueio.status().bloqueado) return;

    var email = elemento('login-email').value.trim();
    var senha = elemento('login-senha').value;
    var erro = elemento('login-erro');
    var botaoEntrar = elemento('btn-login-entrar');

    if (erro) erro.textContent = '';
    if (botaoEntrar) botaoEntrar.disabled = true;

    var resultado = await window.AlfaPrevAuth.entrar(email, senha);

    if (botaoEntrar) botaoEntrar.disabled = false;

    if (!resultado.ok) {
      if (resultado.motivo === 'mfa_cadastro_necessario' || resultado.motivo === 'mfa_codigo_necessario') {
        elemento('login-form').reset();
        abrirFluxoMfa(resultado.motivo, resultado.factorId);
        return;
      }
      if (resultado.motivo === '429') {
        bloqueio.forcarBloqueio();
      } else {
        bloqueio.registrarFalha();
      }
      if (erro) erro.textContent = mensagemErro(resultado.motivo);
      atualizarEstadoBloqueio();
      return;
    }

    bloqueio.registrarSucesso();
    elemento('login-form').reset();
    aoAutenticar();
  }

  function aoAutenticar() {
    esconderLogin();
    var hoje = new Date();
    var trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    var inicio = trintaDiasAtras.toISOString().slice(0, 10);
    var fim = hoje.toISOString().slice(0, 10);

    if (window.AlfaPrevDashboard) window.AlfaPrevDashboard.carregar(inicio, fim);
    if (window.AlfaPrevGrade) window.AlfaPrevGrade.carregar();
  }

  function aoDeslogar() {
    if (window.AlfaPrevGrade) window.AlfaPrevGrade.limpar();
    mostrarLogin();
  }

  async function inicializar() {
    bloqueio = window.AlfaPrevBloqueio.criarBloqueio({ chave: 'alfaprev_leads_bloqueio' });

    var form = elemento('login-form');
    if (form) form.addEventListener('submit', aoEnviarLogin);

    var formMfa = elemento('mfa-form');
    if (formMfa) formMfa.addEventListener('submit', aoEnviarMfa);

    var botaoMfaCancelar = elemento('btn-mfa-cancelar');
    if (botaoMfaCancelar) botaoMfaCancelar.addEventListener('click', cancelarMfaEVoltarAoLogin);

    var botaoSair = elemento('btn-sair');
    if (botaoSair) botaoSair.addEventListener('click', function () { window.AlfaPrevAuth.sair('manual'); });

    if (window.AlfaPrevGrade) window.AlfaPrevGrade.configurarControles();

    window.AlfaPrevAuth.aoMudarEstado(function (estado) {
      if (estado === 'limpar_dom') { if (window.AlfaPrevGrade) window.AlfaPrevGrade.limpar(); }
      if (estado === 'deslogado') aoDeslogar();
    });

    mostrarLogin();

    var restaurado = await window.AlfaPrevAuth.restaurarSessao();
    if (restaurado) aoAutenticar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }
})();
