/**
 * ALFA PREV — script.js
 * Funcionalidades: menu mobile, FAQ accordion, máscara de telefone,
 * validação de formulário LGPD, banner de cookies, ano dinâmico, GA events.
 */

'use strict';

/* =====================================================
   1. ANO DINÂMICO NO FOOTER
   ===================================================== */
const yearEl = document.getElementById('footer-year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

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
    showError('lgpd', 'Você precisa aceitar a Política de Privacidade para continuar.');
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
   7. ENVIO DO FORMULÁRIO — duplo: e-mail (Web3Forms) + banco (Supabase)
   =====================================================
   Configuração necessária antes de funcionar:
     • Web3Forms: substitua 'SUA_CHAVE_WEB3FORMS' abaixo pela chave real
       (obtida em https://web3forms.com/ — gratuito)
     • Supabase: preencha SUPABASE_URL e SUPABASE_ANON_KEY em assets/js/config.js
       (obtidos em Project Settings → API no painel do Supabase)
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

    // Rastreamento GA4
    if (window.gtag) {
      window.gtag('event', 'form_submit', {
        event_category: 'Lead',
        event_label: 'Formulário de Orçamento'
      });
    }

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
    const ACCESS_KEY = 'SUA_CHAVE_WEB3FORMS'; // PREENCHER — ver https://web3forms.com/

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject:    'Novo orçamento — Projeto de Prevenção e Combate a Incêndio — Alfa Prev',
          from_name:  'Site Alfa Prev',
          name:       nome,
          email:      email,
          phone:      telefone,
          property:   tipo,
          message:    resumo,
          botcheck:   false, // honeypot Web3Forms — sempre false para envios legítimos
        }),
      });
      const data = await res.json();
      emailOk = data.success === true;
      if (!emailOk) console.error('[Alfa Prev] Web3Forms rejeitou o envio:', data);
    } catch (err) {
      console.error('[Alfa Prev] Falha no envio por e-mail (Web3Forms):', err);
    }

    // ── 7b. Gravação no banco via Supabase ───────────────
    // Só tenta se config.js estiver preenchido com a URL real do projeto
    if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL.startsWith('https://')) {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'apikey':        SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer':        'return=minimal',
          },
          body: JSON.stringify({
            nome,
            email,
            telefone,
            tipo_imovel:        tipo,
            mensagem:           resumo,
            consentimento_lgpd: true, // checkbox LGPD já validado pelo validateForm()
          }),
        });
        dbOk = res.status === 201;
        if (!dbOk) console.error('[Alfa Prev] Supabase retornou status inesperado:', res.status, await res.text());
      } catch (err) {
        console.error('[Alfa Prev] Erro de rede ao conectar ao Supabase:', err);
      }
    } else {
      console.warn('[Alfa Prev] Supabase não configurado — preencha assets/js/config.js.');
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
    // Aqui você pode inicializar GA ou outros scripts de analytics
    // if (window.gtag) { gtag('consent', 'update', { analytics_storage: 'granted' }); }
  });
}

if (cookieReject) {
  cookieReject.addEventListener('click', () => {
    localStorage.setItem('alfaprev_cookie_pref', 'rejected');
    hideCookieBanner();
  });
}

/* =====================================================
   9. RASTREAMENTO GA4 — CLIQUES NO WHATSAPP
   ===================================================== */
document.querySelectorAll('a[class*="cta-whatsapp"]').forEach(el => {
  el.addEventListener('click', () => {
    if (window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'Lead',
        event_label: el.id || el.className,
      });
    }
  });
});

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