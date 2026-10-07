/**
 * ALFA PREV — assets/js/leads/csv.js
 * Geração de CSV para exportação de leads. UTF-8 com BOM, separador ';'
 * (padrão Excel pt-BR), neutraliza injeção de fórmula em células que
 * começam com = + - @ (recomendação OWASP para exportação de CSV).
 */
'use strict';

function neutralizarFormula(valor) {
  var texto = String(valor == null ? '' : valor);
  if (/^[=+\-@]/.test(texto)) return "'" + texto;
  return texto;
}

function escaparCampoCsv(valor, separador) {
  var texto = neutralizarFormula(valor);
  if (texto.indexOf(separador) !== -1 || texto.indexOf('"') !== -1 || /[\r\n]/.test(texto)) {
    texto = '"' + texto.replace(/"/g, '""') + '"';
  }
  return texto;
}

/**
 * @param {Array<Object>} linhas
 * @param {Array<{titulo: string, chave: string}>} colunas
 * @param {string} [separador=';']
 * @returns {string} conteúdo do CSV, já com BOM UTF-8 no início
 */
function gerarCsv(linhas, colunas, separador) {
  separador = separador || ';';
  var cabecalho = colunas.map(function (c) { return escaparCampoCsv(c.titulo, separador); }).join(separador);
  var corpo = (linhas || []).map(function (linha) {
    return colunas.map(function (c) { return escaparCampoCsv(linha[c.chave], separador); }).join(separador);
  });
  var BOM = '\uFEFF';
  return BOM + [cabecalho].concat(corpo).join('\r\n');
}

var api = { neutralizarFormula: neutralizarFormula, escaparCampoCsv: escaparCampoCsv, gerarCsv: gerarCsv };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  window.AlfaPrevCsv = api;
}
