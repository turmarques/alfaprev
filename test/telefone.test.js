'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  somenteDigitos,
  normalizarTelefone,
  formatarTelefoneExibicao,
  telefoneParaWhatsapp,
} = require('../assets/js/leads/telefone.js');

test('somenteDigitos remove tudo que não é número', () => {
  assert.equal(somenteDigitos('(11) 98932-5513'), '11989325513');
  assert.equal(somenteDigitos(null), '');
  assert.equal(somenteDigitos(undefined), '');
});

test('normalizarTelefone adiciona 55 em número de 11 dígitos sem DDI', () => {
  assert.equal(normalizarTelefone('11989325513'), '5511989325513');
});

test('normalizarTelefone adiciona 55 em número de 10 dígitos sem DDI', () => {
  assert.equal(normalizarTelefone('1132654321'), '551132654321');
});

test('normalizarTelefone não duplica 55 quando já presente', () => {
  assert.equal(normalizarTelefone('5511989325513'), '5511989325513');
});

test('normalizarTelefone com formatação visual (parênteses/espaço/hífen)', () => {
  assert.equal(normalizarTelefone('(11) 98932-5513'), '5511989325513');
});

test('formatarTelefoneExibicao formata celular (11 dígitos locais)', () => {
  assert.equal(formatarTelefoneExibicao('5511989325513'), '(11) 98932-5513');
  assert.equal(formatarTelefoneExibicao('11989325513'), '(11) 98932-5513');
});

test('formatarTelefoneExibicao formata fixo (10 dígitos locais)', () => {
  assert.equal(formatarTelefoneExibicao('551132654321'), '(11) 3265-4321');
  assert.equal(formatarTelefoneExibicao('1132654321'), '(11) 3265-4321');
});

test('formatarTelefoneExibicao retorna dígitos crus quando não reconhece o formato', () => {
  assert.equal(formatarTelefoneExibicao('123'), '123');
  assert.equal(formatarTelefoneExibicao(''), '');
});

test('telefoneParaWhatsapp é equivalente a normalizarTelefone', () => {
  assert.equal(telefoneParaWhatsapp('(11) 98932-5513'), normalizarTelefone('(11) 98932-5513'));
});
