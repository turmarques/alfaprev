/**
 * ALFA PREV — script.js
 * Funcionalidades: menu mobile, FAQ accordion, máscara de telefone,
 * validação de formulário LGPD, banner de cookies, ano dinâmico, GA events.
 */

'use strict';

/* =====================================================
   1. ANO DINÂMICO NO FOOTER + CONTADOR DE EXPERIÊNCIA
   ===================================================== */
const yearEl = document.getElementById('footer-year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* Anos de experiência: incrementa automaticamente em 01/01 de cada ano.
   Ano de início da atividade: 2018 (8 anos em 2026). */
const EXP_START_YEAR = 2018;
const expYears = new Date().getFullYear() - EXP_START_YEAR;
document.querySelectorAll('.js-exp-years').forEach(el => {
  el.textContent = expYears;
});

/* =====================================================
   2. HEADER — EFEITO AO ROLAR
   ===================================================== */
const header = document.getElementById('site-header');
function onScroll() {
  if (window.scrollY > 20) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
if (header) {
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* =====================================================
   3. MENU MOBILE (HAMBÚRGUER)
   ===================================================== */
const menuToggle   = document.getElementById('menu-toggle');
const mobileMenu   = document.getElementById('mobile-menu');
const iconOpen     = document.getElementById('icon-open');
const iconClose    = document.getElementById('icon-close');
const mobileLinks  = document.querySelectorAll('.mobile-nav-link');

function openMenu() {
  mobileMenu.classList.remove('hidden');
  iconOpen.classList.add('hidden');
  iconClose.classList.remove('hidden');
  menuToggle.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  mobileMenu.classList.add('hidden');
  iconOpen.classList.remove('hidden');
  iconClose.classList.add('hidden');
  menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Fechar ao clicar em um link
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fechar ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
}

/* =====================================================
   4. FAQ ACCORDION
   ===================================================== */
document.querySelectorAll('[data-faq]').forEach(item => {
  const btn    = item.querySelector('button');
  const answer = item.querySelector('.faq-answer');
  const plus   = item.querySelector('.icon-plus');
  const minus  = item.querySelector('.icon-minus');

  if (!btn || !answer) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Fechar todos os outros
    document.querySelectorAll('[data-faq]').forEach(other => {
      if (other !== item) {
        const otherBtn    = other.querySelector('button');
        const otherAnswer = other.querySelector('.faq-answer');
        const otherPlus   = other.querySelector('.icon-plus');
        const otherMinus  = other.querySelector('.icon-minus');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.classList.add('hidden');
        if (otherPlus)  otherPlus.classList.remove('hidden');
        if (otherMinus) otherMinus.classList.add('hidden');
      }
    });

    // Alternar o atual
    if (isOpen) {
      btn.setAttribute('aria-expanded', 'false');
      answer.classList.add('hidden');
      if (plus)  plus.classList.remove('hidden');
      if (minus) minus.classList.add('hidden');
    } else {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.remove('hidden');
      if (plus)  plus.classList.add('hidden');
      if (minus) minus.classList.remove('hidden');
    }
  });
});

/* =====================================================
   5. MÁSCARA DE TELEFONE — (00) 00000-0000
   ===================================================== */
const phoneInput = document.getElementById('telefone');

function maskPhone(value) {
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
  }
  return v.replace(/-$/, '');
}

if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    e.target.value = maskPhone(e.target.value);
  });
  phoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    phoneInput.value = maskPhone(pasted);
  });
}

/* =====================================================
   6. VALIDAÇÃO DO FORMULÁRIO
   ===================================================== */
const form      = document.getElementById('orcamento-form');
const submitBtn = document.getElementById('submit-btn');
const btnText   = document.getElementById('submit-btn-text');
const success   = document.getElementById('form-success');
const errorDiv  = document.getElementById('form-error');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-error');
  if (!input || !errEl) return;
  input.classList.add('border-corp-red');
  input.setAttribute('aria-invalid', 'true');
  errEl.textContent = msg;
  errEl.classList.remove('hidden');
}

function clearError(fieldId) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-error');
  if (!input || !errEl) return;
  input.classList.remove('border-corp-red');
  input.removeAttribute('aria-invalid');
  errEl.textContent = '';
  errEl.classList.add('hidden');
}

function getPhoneDigits(val) {
  return val.replace(/\D/g, '');
}

function validateForm() {
  let valid = true;
  clearError('nome');
  clearError('email');
  clearError('telefone');
  clearError('tipo-imovel');
  clearError('resumo');
  clearError('lgpd');

  const nome    = document.getElementById('nome').value.trim();
  const email   = document.getElementById('email').value.trim();
  const tel     = document.getElementById('telefone').value.trim();
  const tipo    = document.getElementById('tipo-imovel').value;
  const resumo  = document.getElementById('resumo').value.trim();
  const lgpd    = document.getElementById('lgpd').checked;

  if (!nome || nome.length < 3) {
    showError('nome', 'Por favor, informe seu nome completo.');
    valid = false;
  }
  if (!EMAIL_REGEX.test(email)) {
    showError('email', 'Informe um e-mail válido.');
    valid = false;
  }
  const digits = getPhoneDigits(tel);
  if (digits.length < 10 || digits.length > 11) {
    showError('telefone', 'Informe um telefone válido com DDD.');
    valid = false;
  }
  if (!tipo) {
    showError('tipo-imovel', 'Selecione o tipo de imóvel ou projeto.');
    valid = false;
  }
  if (!resumo || resumo.length < 10) {
    showError('resumo', 'Descreva brevemente sua necessidade (mínimo 10 caracteres).');
    valid = false;
  }
  if (!lgpd) {
    // Salvaguarda: nunca mostrar erro sobre um campo que o visitante não enxerga —
    // revela o checkbox (caso ainda esteja oculto) e leva o foco até ele.
    revelarConsentimentoLgpd();
    showError('lgpd', 'Você precisa aceitar a Política de Privacidade para continuar.');
    const lgpdInput = document.getElementById('lgpd');
    if (lgpdInput) {
      lgpdInput.scrollIntoView({ block: 'center' });
      lgpdInput.focus();
    }
    valid = false;
  }
  return valid;
}

// Limpar erros individualmente ao digitar
['nome','email','telefone','resumo'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => clearError(id));
});
const tipoEl = document.getElementById('tipo-imovel');
if (tipoEl) tipoEl.addEventListener('change', () => clearError('tipo-imovel'));
const lgpdEl = document.getElementById('lgpd');
if (lgpdEl) lgpdEl.addEventListener('change', () => clearError('lgpd'));

/* =====================================================
   6b. REVELAÇÃO DO CHECKBOX DE CONSENTIMENTO (LGPD)
   =====================================================
   Decisão de produto: o checkbox fica oculto ao carregar a página e aparece assim que o
   visitante começar a preencher qualquer campo do formulário. Sem JavaScript, o checkbox
   já é visível por padrão (ver HTML/CSS) — a classe que o oculta só é adicionada aqui,
   nunca no HTML/CSS de origem, para que uma falha do script nunca esconda o consentimento.
   ===================================================== */
const lgpdCampo = document.getElementById('lgpd-campo');
function revelarConsentimentoLgpd() {
  if (lgpdCampo) lgpdCampo.classList.remove('lgpd-oculto');
}
if (form && lgpdCampo) {
  lgpdCampo.classList.add('lgpd-oculto');
  // "input" cobre digitação, colar texto e a maioria dos preenchimentos automáticos do
  // navegador; "change" cobre o <select> de ocupação; "focusin" cobre o visitante que só
  // clica/tabula em um campo antes de digitar.
  form.addEventListener('input', revelarConsentimentoLgpd);
  form.addEventListener('change', revelarConsentimentoLgpd);
  form.addEventListener('focusin', revelarConsentimentoLgpd);
}

/* =====================================================
   7. ENVIO DO FORMULÁRIO — duplo: e-mail (Web3Forms) + banco (api/lead.php)
   =====================================================
   Configuração necessária antes de funcionar:
     • Web3Forms: a chave de acesso real já está configurada na constante ACCESS_KEY
       abaixo (obtida em https://web3forms.com/ — gratuito)
     • Banco: api/lead.php grava o lead via PDO/MySQL — exige api/config.local.php
       preenchido com as credenciais do banco (ver api/config.example.php)
   ===================================================== */
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ── Verificação honeypot ──────────────────────────────
    // Se o campo invisível #hp-website estiver preenchido, é bot.
    // Descartar silenciosamente sem fazer nenhuma requisição de rede.
    const hpField = document.getElementById('hp-website');
    if (hpField && hpField.value.trim() !== '') return;

    if (!validateForm()) return;

    submitBtn.disabled = true;
    btnText.textContent = 'Enviando...';
    success.classList.add('hidden');
    errorDiv.classList.add('hidden');

    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const tipo     = document.getElementById('tipo-imovel').value;
    const resumo   = document.getElementById('resumo').value.trim();

    let emailOk = false;
    let dbOk    = false;

    // ── 7a. Envio por e-mail via Web3Forms ───────────────
    // ⚠️ ATENÇÃO — PENDÊNCIA: o e-mail de destino do formulário é configurado no painel do Web3Forms
    // (web3forms.com), vinculado à chave ACCESS_KEY. O e-mail exibido no site foi atualizado para
    // contato@alfasci.com.br, mas o destino real dos envios só muda quando a chave for registrada
    // com o novo e-mail no painel do Web3Forms. Trocar a ACCESS_KEY abaixo não basta — é necessário
    // acessar web3forms.com, criar uma nova chave associada a contato@alfasci.com.br e substituir aqui.
    const ACCESS_KEY = '79231f9e-39cb-4b65-bb1d-53f14a2966b8';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject:    'Novo orçamento — Projeto de Prevenção e Combate a Incêndio — Alfa Prev',
          from_name:  'Site Alfa Prev',
          // Web3Forms usa o campo chamado "email" para definir o endereço de resposta —
          // como o campo abaixo passou a se chamar "E-mail" (rótulo em português no corpo
          // do e-mail), o reply-to precisa ser informado explicitamente aqui.
          replyto:    email,
          // Nomes dos campos abaixo viram os rótulos exibidos no corpo do e-mail recebido em
          // contato@alfasci.com.br — mantidos em português para quem lê o e-mail (não afeta
          // o payload enviado à API PHP/MySQL, que é um objeto totalmente separado, logo abaixo).
          'Nome':                  nome,
          'E-mail':                email,
          'Telefone':              telefone,
          'Ocupação':              tipo,
          'Tipos de serviços':     resumo,
          'Consentimento (LGPD)':  'Aceito',
          'Data e hora do envio':  new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
          botcheck:   false, // honeypot Web3Forms — sempre false para envios legítimos
        }),
      });
      const data = await res.json();
      emailOk = data.success === true;
      if (!emailOk) console.error('[Alfa Prev] Web3Forms rejeitou o envio:', data);
    } catch (err) {
      console.error('[Alfa Prev] Falha no envio por e-mail (Web3Forms):', err);
    }

    // ── 7b. Gravação no banco via api/lead.php ───
    // Nunca faz INSERT direto: o endpoint valida campos/consentimento no servidor,
    // normaliza o telefone, aplica rate limit e grava origem/UTMs/sessão (ver database/schema.mysql.sql).
    try {
      const origem = (window.AlfaPrevMetricas && window.AlfaPrevMetricas.origemSessao())
        || { origem: 'direto' };
      const sessaoId = window.AlfaPrevMetricas ? window.AlfaPrevMetricas.sessaoId() : null;

      const res = await fetch('/api/lead.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome:                 nome,
          email:                email,
          telefone:             telefone,
          ocupacao:             tipo,
          mensagem:             resumo,
          consentimento_lgpd:   true, // checkbox LGPD já validado pelo validateForm()
          pagina_origem:        location.pathname,
          utm_source:           origem.utm_source || null,
          utm_medium:           origem.utm_medium || null,
          utm_campaign:         origem.utm_campaign || null,
          utm_term:             origem.utm_term || null,
          utm_content:          origem.utm_content || null,
          gclid:                origem.gclid || null,
          sessao_id:            sessaoId,
        }),
      });
      dbOk = res.ok;
      if (!dbOk) console.error('[Alfa Prev] api/lead.php retornou status inesperado:', res.status, await res.text());
    } catch (err) {
      console.error('[Alfa Prev] Erro de rede ao conectar à API:', err);
    }

    // ── 7c. Resultado para o usuário ─────────────────────
    // Sucesso se ao menos um dos dois canais funcionou.
    // Falha total só se ambos falharem — aí permite nova tentativa.
    if (emailOk || dbOk) {
      success.classList.remove('hidden');
      form.reset();
      // Mantém botão desabilitado após sucesso — impede envio duplicado
      btnText.textContent = 'Orçamento enviado!';
    } else {
      errorDiv.classList.remove('hidden');
      submitBtn.disabled = false;
      btnText.textContent = 'Enviar e Solicitar Orçamento';
    }
  });
}

/* =====================================================
   8. BANNER DE COOKIES (LGPD)
   ===================================================== */
const cookieBanner = document.getElementById('cookie-banner');
const cookieAccept = document.getElementById('cookie-accept');
const cookieReject = document.getElementById('cookie-reject');

function hideCookieBanner() {
  if (cookieBanner) {
    cookieBanner.classList.add('hidden');
  }
}

if (cookieBanner) {
  const pref = localStorage.getItem('alfaprev_cookie_pref');
  if (!pref) {
    // Mostrar banner após 800ms para não travar LCP
    setTimeout(() => {
      cookieBanner.classList.remove('hidden');
    }, 800);
  }
}

if (cookieAccept) {
  cookieAccept.addEventListener('click', () => {
    localStorage.setItem('alfaprev_cookie_pref', 'accepted');
    hideCookieBanner();
  });
}

if (cookieReject) {
  cookieReject.addEventListener('click', () => {
    localStorage.setItem('alfaprev_cookie_pref', 'rejected');
    hideCookieBanner();
  });
}

/* =====================================================
   9. (removido) Rastreamento de cliques no WhatsApp agora é feito por
      assets/js/metricas.js (evento anônimo whatsapp_click via api/metrica.php,
      sem Google Analytics/Tag Manager — ver docs/DASHBOARD-LEADS.md).
   ===================================================== */

/* =====================================================
   10. SMOOTH SCROLL POLYFILL (para navegadores que não suportam CSS scroll-behavior)
   ===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* =====================================================
   11. ACTIVE NAV LINK — marca o item correspondente à página atual
   ===================================================== */
(function () {
  const raw = window.location.pathname;
  const page = (raw === '/' || /\/?index\.html$/.test(raw))
    ? 'index'
    : raw.replace(/.*\//, '').replace(/\.html$/, '');
  document.querySelectorAll('[data-nav]').forEach(function (link) {
    if (link.dataset.nav === page) {
      link.classList.remove('text-gray-300', 'text-gray-200');
      link.classList.add('text-white');
      link.setAttribute('aria-current', 'page');
    }
  });
}());