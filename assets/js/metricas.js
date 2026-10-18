/**
 * ALFA PREV — assets/js/metricas.js
 *
 * Métricas anônimas e sem cookies das páginas públicas. Sem dependências,
 * sem CDN de terceiros. Envia os eventos via fetch (caminho relativo) para
 * api/metrica.php — nunca bloqueia a renderização: o envio só ocorre
 * dentro de requestIdleCallback (ou setTimeout como fallback) e falha
 * silenciosamente em qualquer erro de rede/armazenamento.
 *
 * Nunca registra IP, user-agent, cookies ou qualquer identificador
 * persistente entre visitas. O identificador de sessão vive só em
 * sessionStorage (apagado quando a aba/navegador é fechado).
 *
 * Expõe window.AlfaPrevMetricas para o formulário de contato reaproveitar
 * o mesmo sessao_id / origem / UTMs / gclid já capturados nesta sessão.
 */
'use strict';

(function () {
  var SESSAO_KEY  = 'alfaprev_sessao_id';
  var ORIGEM_KEY  = 'alfaprev_origem_sessao';
  var ADMIN_FLAG  = 'alfaprev_admin_ativo';
  var HOSTS_TESTE = ['localhost', '127.0.0.1', '0.0.0.0'];

  function ehBot() {
    try {
      if (navigator.webdriver) return true;
      var ua = navigator.userAgent || '';
      return /HeadlessChrome|Lighthouse|PageSpeed|GTmetrix|Pingdom|bot|crawl|spider/i.test(ua);
    } catch (e) {
      return false;
    }
  }

  function ehAmbienteFiltrado() {
    try {
      if (HOSTS_TESTE.indexOf(location.hostname) !== -1) return true;
      if (location.pathname.indexOf('/leads') === 0) return true;
      if (localStorage.getItem(ADMIN_FLAG) === '1') return true;
    } catch (e) {
      // localStorage indisponível — segue sem esse filtro específico.
    }
    return ehBot();
  }

  function idAleatorio() {
    try {
      if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    } catch (e) { /* ignora */ }
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, function () {
      return Math.floor(Math.random() * 16).toString(16);
    });
  }

  function obterSessaoId() {
    try {
      var id = sessionStorage.getItem(SESSAO_KEY);
      if (!id) {
        id = idAleatorio();
        sessionStorage.setItem(SESSAO_KEY, id);
      }
      return id;
    } catch (e) {
      return null; // sem sessionStorage: segue sem sessao_id (eventos ainda funcionam via hash do servidor)
    }
  }

  function parametrosUrl() {
    var params = {};
    try {
      var sp = new URL(location.href).searchParams;
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
        var v = sp.get(k);
        if (v) params[k] = v.slice(0, 150);
      });
    } catch (e) { /* ignora */ }
    return params;
  }

  function obterOrigemSessao() {
    // Captura origem/UTMs/gclid só na primeira página da sessão e mantém em sessionStorage,
    // para que o lead enviado depois (em qualquer página) carregue a origem real da visita.
    try {
      var existente = sessionStorage.getItem(ORIGEM_KEY);
      if (existente) return JSON.parse(existente);
    } catch (e) { /* segue para recalcular */ }

    var origem = { origem: 'direto' };
    try {
      if (document.referrer) {
        var host = new URL(document.referrer).hostname.replace(/^www\./, '');
        if (host && host !== location.hostname) origem.origem = host;
      }
    } catch (e) { /* mantém 'direto' */ }

    var utms = parametrosUrl();
    Object.keys(utms).forEach(function (k) { origem[k] = utms[k]; });

    try {
      sessionStorage.setItem(ORIGEM_KEY, JSON.stringify(origem));
    } catch (e) { /* segue sem persistir — ainda retorna o valor calculado agora */ }

    return origem;
  }

  function detectarDispositivo() {
    var ua = navigator.userAgent || '';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function enviar(tipo) {
    if (ehAmbienteFiltrado()) return;

    var origem = obterOrigemSessao();
    var corpo = {
      tipo:         tipo,
      caminho:      location.pathname,
      origem:       origem.origem || 'direto',
      utm_source:   origem.utm_source || null,
      utm_medium:   origem.utm_medium || null,
      utm_campaign: origem.utm_campaign || null,
      utm_term:     origem.utm_term || null,
      utm_content:  origem.utm_content || null,
      gclid:        origem.gclid || null,
      dispositivo:  detectarDispositivo(),
      sessao_id:    obterSessaoId(),
    };

    try {
      fetch('/api/metrica.php', {
        method: 'POST',
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      }).catch(function () { /* falha silenciosa — nunca exibe erro ao visitante */ });
    } catch (e) { /* falha silenciosa */ }
  }

  function agendar(fn) {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 1);
    }
  }

  // ── page_view: uma vez por carregamento de página ──────────────────
  agendar(function () { enviar('page_view'); });

  // ── whatsapp_click: listener delegado, reaproveita a convenção cta-whatsapp-* já usada no site ──
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('a[class*="cta-whatsapp"]') : null;
    if (el) agendar(function () { enviar('whatsapp_click'); });
  });

  // API pública mínima para o formulário de contato reaproveitar sessão/origem já capturados.
  window.AlfaPrevMetricas = {
    sessaoId: obterSessaoId,
    origemSessao: obterOrigemSessao,
  };
})();
