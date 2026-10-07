'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { criarBloqueio } = require('../assets/js/leads/bloqueio.js');

function storageFalso() {
  var dados = {};
  return {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(dados, k) ? dados[k] : null; },
    setItem: function (k, v) { dados[k] = String(v); },
    removeItem: function (k) { delete dados[k]; },
  };
}

function relogioFalso(inicial) {
  var t = inicial || 0;
  var fn = function () { return t; };
  fn.avancar = function (ms) { t += ms; };
  return fn;
}

test('começa destravado com zero tentativas', () => {
  const b = criarBloqueio({ storage: storageFalso(), agora: relogioFalso(0) });
  const s = b.status();
  assert.equal(s.bloqueado, false);
  assert.equal(s.tentativas, 0);
});

test('3 falhas consecutivas bloqueiam por 5 minutos', () => {
  const relogio = relogioFalso(0);
  const b = criarBloqueio({ storage: storageFalso(), agora: relogio, maxTentativas: 3, duracaoMs: 5 * 60 * 1000 });
  b.registrarFalha();
  b.registrarFalha();
  let s = b.registrarFalha();
  assert.equal(s.bloqueado, true);
  assert.equal(s.tentativas, 3);
  assert.equal(s.restanteMs, 5 * 60 * 1000);
});

test('bloqueio expira depois de 5 minutos', () => {
  const relogio = relogioFalso(0);
  const b = criarBloqueio({ storage: storageFalso(), agora: relogio, maxTentativas: 3, duracaoMs: 5 * 60 * 1000 });
  b.registrarFalha(); b.registrarFalha(); b.registrarFalha();
  assert.equal(b.status().bloqueado, true);
  relogio.avancar(5 * 60 * 1000 + 1);
  assert.equal(b.status().bloqueado, false);
});

test('login bem-sucedido reseta o contador', () => {
  const relogio = relogioFalso(0);
  const b = criarBloqueio({ storage: storageFalso(), agora: relogio, maxTentativas: 3 });
  b.registrarFalha(); b.registrarFalha();
  b.registrarSucesso();
  const s = b.status();
  assert.equal(s.bloqueado, false);
  assert.equal(s.tentativas, 0);
});

test('estado persiste entre instâncias com o mesmo storage (reload/nova aba)', () => {
  const storage = storageFalso();
  const relogio = relogioFalso(0);
  const b1 = criarBloqueio({ storage, agora: relogio, maxTentativas: 3 });
  b1.registrarFalha(); b1.registrarFalha(); b1.registrarFalha();

  const b2 = criarBloqueio({ storage, agora: relogio, maxTentativas: 3 });
  assert.equal(b2.status().bloqueado, true);
});

test('forcarBloqueio (usado no 429 do Supabase Auth) bloqueia imediatamente', () => {
  const relogio = relogioFalso(0);
  const b = criarBloqueio({ storage: storageFalso(), agora: relogio, duracaoMs: 5 * 60 * 1000 });
  const s = b.forcarBloqueio();
  assert.equal(s.bloqueado, true);
});

test('funciona sem storage (fallback em memória), sem lançar erro', () => {
  const relogio = relogioFalso(0);
  const b = criarBloqueio({ storage: null, agora: relogio, maxTentativas: 2, duracaoMs: 1000 });
  b.registrarFalha();
  const s = b.registrarFalha();
  assert.equal(s.bloqueado, true);
});

test('formatarContagem retorna mm:ss', () => {
  const b = criarBloqueio({ storage: storageFalso() });
  assert.equal(b.formatarContagem(65000), '01:05');
  assert.equal(b.formatarContagem(0), '00:00');
  assert.equal(b.formatarContagem(-500), '00:00');
});
