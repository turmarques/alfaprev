/**
 * ALFA PREV — assets/js/leads/telefone.js
 * Normalização/formatação de telefone para exibição no painel /leads e
 * montagem de links wa.me. Validação de segurança de verdade acontece no
 * banco (registrar_lead) — este módulo é só apresentação.
 */
'use strict';

function somenteDigitos(valor) {
  return String(valor == null ? '' : valor).replace(/\D/g, '');
}

function normalizarTelefone(valor) {
  var digitos = somenteDigitos(valor);
  if ((digitos.length === 10 || digitos.length === 11) && digitos.slice(0, 2) !== '55') {
    digitos = '55' + digitos;
  }
  return digitos;
}

function formatarTelefoneExibicao(valor) {
  var digitos = somenteDigitos(valor);
  var local = digitos;
  if (local.length > 11 && local.slice(0, 2) === '55') local = local.slice(2);
  if (local.length === 11) return '(' + local.slice(0, 2) + ') ' + local.slice(2, 7) + '-' + local.slice(7);
  if (local.length === 10) return '(' + local.slice(0, 2) + ') ' + local.slice(2, 6) + '-' + local.slice(6);
  return digitos || '';
}

function telefoneParaWhatsapp(valor) {
  return normalizarTelefone(valor);
}

var api = {
  somenteDigitos: somenteDigitos,
  normalizarTelefone: normalizarTelefone,
  formatarTelefoneExibicao: formatarTelefoneExibicao,
  telefoneParaWhatsapp: telefoneParaWhatsapp,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  window.AlfaPrevTelefone = api;
}
