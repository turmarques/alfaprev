#!/usr/bin/env node
'use strict';

/**
 * Teste automatizado de RLS/permissões do Supabase — Alfa Prev.
 *
 * Roda contra o projeto REAL (via REST API), mas usa SOMENTE a chave anon
 * (pública) — nunca a service_role. Lê as credenciais exclusivamente de
 * variáveis de ambiente e NUNCA as imprime no console.
 *
 * Uso:
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=xxxx node scripts/testar-supabase-rls.js
 *   ... --com-escrita   (habilita os testes que de fato escrevem linhas de teste identificáveis)
 *
 * Sai com código != 0 se qualquer verificação falhar.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const COM_ESCRITA = process.argv.includes('--com-escrita');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente antes de rodar este script.');
  process.exit(1);
}

const REST = SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1';

let falhas = 0;
let total = 0;

function headersBase(extra) {
  return Object.assign({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }, extra || {});
}

async function checar(nome, fn) {
  total++;
  try {
    const ok = await fn();
    if (ok) {
      console.log(`  OK   ${nome}`);
    } else {
      console.error(`  FALHA ${nome}`);
      falhas++;
    }
  } catch (err) {
    console.error(`  ERRO  ${nome} — ${err.message}`);
    falhas++;
  }
}

async function tabelaNaoLegivel(tabela) {
  const resp = await fetch(`${REST}/${tabela}?select=*&limit=1`, { headers: headersBase() });
  if (resp.status >= 200 && resp.status < 300) {
    const dados = await resp.json();
    // Sem GRANT de SELECT para anon, uma resposta 2xx só é aceitável se vier vazia.
    return Array.isArray(dados) && dados.length === 0;
  }
  return true; // qualquer erro (401/403/42501) é o esperado
}

async function tabelaNaoEscrevivel(tabela, corpo) {
  const resp = await fetch(`${REST}/${tabela}`, {
    method: 'POST',
    headers: headersBase({ Prefer: 'return=minimal' }),
    body: JSON.stringify(corpo),
  });
  return resp.status < 200 || resp.status >= 300;
}

async function rpcNegado(funcao, args) {
  const resp = await fetch(`${REST}/rpc/${funcao}`, {
    method: 'POST',
    headers: headersBase(),
    body: JSON.stringify(args || {}),
  });
  return resp.status < 200 || resp.status >= 300;
}

async function rpcPermitido(funcao, args) {
  const resp = await fetch(`${REST}/rpc/${funcao}`, {
    method: 'POST',
    headers: headersBase(),
    body: JSON.stringify(args || {}),
  });
  return resp.status >= 200 && resp.status < 300;
}

async function main() {
  console.log('Testando permissões anônimas no Supabase (Alfa Prev)...\n');

  console.log('1) Leitura direta de tabelas (deve ser negada ou vazia):');
  await checar('SELECT leads',        () => tabelaNaoLegivel('leads'));
  await checar('SELECT eventos',      () => tabelaNaoLegivel('eventos'));
  await checar('SELECT admins',       () => tabelaNaoLegivel('admins'));
  await checar('SELECT sais_diarios', () => tabelaNaoLegivel('sais_diarios'));

  console.log('\n2) Escrita direta via INSERT (deve ser negada — escrita só via função):');
  await checar('INSERT leads direto', () => tabelaNaoEscrevivel('leads', {
    nome: 'x', email: 'x@x.com', telefone: '11999999999', tipo_imovel: 'comercial', consentimento_lgpd: true,
  }));
  await checar('INSERT eventos direto', () => tabelaNaoEscrevivel('eventos', { tipo: 'page_view', caminho: '/x' }));

  console.log('\n3) Funções administrativas (devem ser negadas para anon):');
  await checar('RPC dashboard_dados negado', () => rpcNegado('dashboard_dados', { p_inicio: '2026-01-01', p_fim: '2026-01-31' }));
  await checar('RPC listar_leads negado',    () => rpcNegado('listar_leads', {}));

  console.log('\n4) Validação das funções públicas de escrita (devem rejeitar dados inválidos):');
  await checar('registrar_lead sem consentimento é rejeitado', () => rpcNegado('registrar_lead', {
    p_nome: 'Teste RLS', p_email: 'teste@teste.com', p_telefone: '11999999999',
    p_tipo_imovel: 'comercial', p_mensagem: 'teste', p_consentimento_lgpd: false,
  }));
  await checar('registrar_lead com e-mail inválido é rejeitado', () => rpcNegado('registrar_lead', {
    p_nome: 'Teste RLS', p_email: 'nao-e-email', p_telefone: '11999999999',
    p_tipo_imovel: 'comercial', p_mensagem: 'teste', p_consentimento_lgpd: true,
  }));
  await checar('registrar_evento com tipo inválido não gera erro HTTP (função ignora silenciosamente)', async () => {
    const resp = await fetch(`${REST}/rpc/registrar_evento`, {
      method: 'POST', headers: headersBase(),
      body: JSON.stringify({ p_tipo: 'tipo_invalido', p_caminho: '/x' }),
    });
    return resp.status >= 200 && resp.status < 300;
  });

  if (COM_ESCRITA) {
    console.log('\n5) Escrita válida via função (--com-escrita ativo — grava registros de teste identificáveis):');
    const marcador = `TESTE-RLS-${Date.now()}`;
    await checar('registrar_lead com dados válidos é aceito', () => rpcPermitido('registrar_lead', {
      p_nome: marcador, p_email: `${marcador}@teste-rls.invalid`, p_telefone: '11999999999',
      p_tipo_imovel: 'comercial', p_mensagem: 'Registro de teste automatizado — pode ser excluído.',
      p_consentimento_lgpd: true, p_pagina_origem: '/teste-rls',
    }));
    await checar('registrar_evento com dados válidos é aceito', () => rpcPermitido('registrar_evento', {
      p_tipo: 'page_view', p_caminho: '/teste-rls', p_origem: 'direto', p_dispositivo: 'desktop',
      p_sessao_id: marcador,
    }));
    console.log(`\n  Nota: exclua manualmente o lead com nome/e-mail "${marcador}" no painel após conferir.`);
  } else {
    console.log('\n5) Testes de escrita válida pulados (rode com --com-escrita para incluí-los).');
  }

  console.log(`\n${total - falhas}/${total} verificações passaram.`);
  if (falhas > 0) {
    console.error(`${falhas} verificação(ões) falharam.`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Erro inesperado ao rodar os testes:', err.message);
  process.exit(1);
});
