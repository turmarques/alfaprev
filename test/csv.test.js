'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { neutralizarFormula, escaparCampoCsv, gerarCsv } = require('../assets/js/leads/csv.js');

test('neutralizarFormula prefixa valores que começam com = + - @', () => {
  assert.equal(neutralizarFormula('=SOMA(A1:A2)'), "'=SOMA(A1:A2)");
  assert.equal(neutralizarFormula('+5551199999999'), "'+5551199999999");
  assert.equal(neutralizarFormula('-1'), "'-1");
  assert.equal(neutralizarFormula('@alguem'), "'@alguem");
});

test('neutralizarFormula não altera valores normais', () => {
  assert.equal(neutralizarFormula('João da Silva'), 'João da Silva');
  assert.equal(neutralizarFormula(''), '');
  assert.equal(neutralizarFormula(null), '');
});

test('escaparCampoCsv coloca em aspas quando contém separador, aspas ou quebra de linha', () => {
  assert.equal(escaparCampoCsv('a;b', ';'), '"a;b"');
  assert.equal(escaparCampoCsv('ele disse "oi"', ';'), '"ele disse ""oi"""');
  assert.equal(escaparCampoCsv('linha1\nlinha2', ';'), '"linha1\nlinha2"');
  assert.equal(escaparCampoCsv('texto simples', ';'), 'texto simples');
});

test('escaparCampoCsv também neutraliza injeção de fórmula antes de escapar', () => {
  assert.equal(escaparCampoCsv('=1+1;2', ';'), '"\'=1+1;2"');
});

test('gerarCsv monta cabeçalho + linhas com BOM UTF-8 e separador ;', () => {
  const colunas = [{ titulo: 'Nome', chave: 'nome' }, { titulo: 'E-mail', chave: 'email' }];
  const linhas = [{ nome: 'Maria', email: 'maria@exemplo.com' }];
  const csv = gerarCsv(linhas, colunas);
  assert.equal(csv, '\uFEFFNome;E-mail\r\nMaria;maria@exemplo.com');
});

test('gerarCsv neutraliza fórmula em célula de dados', () => {
  const colunas = [{ titulo: 'Mensagem', chave: 'msg' }];
  const linhas = [{ msg: '=HYPERLINK("http://evil")' }];
  const csv = gerarCsv(linhas, colunas);
  assert.equal(csv, '\uFEFFMensagem\r\n"\'=HYPERLINK(""http://evil"")"');
});

test('gerarCsv funciona sem linhas (apenas cabeçalho)', () => {
  const colunas = [{ titulo: 'Nome', chave: 'nome' }];
  assert.equal(gerarCsv(null, colunas), '\uFEFFNome');
  assert.equal(gerarCsv([], colunas), '\uFEFFNome');
});

test('gerarCsv aceita separador customizado', () => {
  const colunas = [{ titulo: 'A', chave: 'a' }, { titulo: 'B', chave: 'b' }];
  const linhas = [{ a: '1', b: '2' }];
  assert.equal(gerarCsv(linhas, colunas, ','), '\uFEFFA,B\r\n1,2');
});
