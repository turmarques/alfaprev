/**
 * ALFA PREV — assets/js/leads/bloqueio.js
 *
 * Bloqueio de tentativas de login do painel /leads.
 *
 * IMPORTANTE — isto é só UX/dissuasão, NÃO é segurança real:
 * qualquer pessoa pode limpar o localStorage do navegador e tentar de novo.
 * A proteção real contra força bruta é o rate limit de api/login.php (ver
 * api/lib/rate_limit.php), a política de senha forte do usuário admin, e o
 * fato de que um login válido mas não-admin (is_admin() falso) é deslogado
 * e tratado como tentativa inválida (ver docs/DASHBOARD-LEADS.md, seção
 * "Segurança e limites").
 *
 * Módulo sem DOM, testável com storage/relógio injetáveis (node --test).
 */
'use strict';

function criarBloqueio(opcoes) {
  opcoes = opcoes || {};
  var storage        = 'storage' in opcoes ? opcoes.storage : (typeof localStorage !== 'undefined' ? localStorage : null);
  var agora          = opcoes.agora || function () { return Date.now(); };
  var maxTentativas   = opcoes.maxTentativas || 3;
  var duracaoMs       = opcoes.duracaoMs || 5 * 60 * 1000;
  var chave           = opcoes.chave || 'alfaprev_leads_bloqueio';

  // Fallback em memória quando localStorage está indisponível (ex: navegação privada restrita).
  // Limitação documentada: nesse caso o bloqueio não sobrevive a reload/nova aba.
  var memoria = { tentativas: 0, bloqueadoAte: 0 };

  function ler() {
    if (!storage) return memoria;
    try {
      var raw = storage.getItem(chave);
      if (!raw) return { tentativas: 0, bloqueadoAte: 0 };
      var dados = JSON.parse(raw);
      return {
        tentativas: typeof dados.tentativas === 'number' ? dados.tentativas : 0,
        bloqueadoAte: typeof dados.bloqueadoAte === 'number' ? dados.bloqueadoAte : 0,
      };
    } catch (e) {
      return { tentativas: 0, bloqueadoAte: 0 };
    }
  }

  function escrever(dados) {
    memoria = dados;
    if (!storage) return;
    try {
      storage.setItem(chave, JSON.stringify(dados));
    } catch (e) {
      // Sem storage disponível — segue só com o fallback em memória.
    }
  }

  function status() {
    var dados = ler();
    var restanteMs = dados.bloqueadoAte - agora();
    if (restanteMs > 0) {
      return { bloqueado: true, restanteMs: restanteMs, tentativas: dados.tentativas };
    }
    return { bloqueado: false, restanteMs: 0, tentativas: dados.tentativas };
  }

  function registrarFalha() {
    var dados = ler();
    dados.tentativas = (dados.tentativas || 0) + 1;
    if (dados.tentativas >= maxTentativas) {
      dados.bloqueadoAte = agora() + duracaoMs;
    }
    escrever(dados);
    return status();
  }

  function registrarSucesso() {
    escrever({ tentativas: 0, bloqueadoAte: 0 });
    return status();
  }

  // Usado quando api/login.php retorna 429 (rate limit no servidor) — também conta como bloqueio.
  function forcarBloqueio(duracaoCustomMs) {
    var dados = ler();
    dados.tentativas = Math.max(dados.tentativas, maxTentativas);
    dados.bloqueadoAte = agora() + (duracaoCustomMs || duracaoMs);
    escrever(dados);
    return status();
  }

  function formatarContagem(ms) {
    var totalSegundos = Math.max(0, Math.ceil(ms / 1000));
    var minutos = Math.floor(totalSegundos / 60);
    var segundos = totalSegundos % 60;
    return String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0');
  }

  return {
    status: status,
    registrarFalha: registrarFalha,
    registrarSucesso: registrarSucesso,
    forcarBloqueio: forcarBloqueio,
    formatarContagem: formatarContagem,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { criarBloqueio: criarBloqueio };
} else {
  window.AlfaPrevBloqueio = { criarBloqueio: criarBloqueio };
}
