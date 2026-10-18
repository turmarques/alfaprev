/**
 * ALFA PREV — assets/js/leads/dashboard.js
 *
 * Renderização do painel de métricas (/leads) a partir de api/dashboard.php
 * (equivalente à antiga função dashboard_dados() do Supabase).
 * Gráficos em SVG puro, sem bibliotecas externas (CSP restrita).
 *
 * Módulo com DOM — não testado via node --test.
 */
'use strict';

(function () {
  function elemento(id) { return document.getElementById(id); }

  function textoOuTraco(valor) {
    return (valor === null || valor === undefined) ? '—' : String(valor);
  }

  function formatarPercentual(valor) {
    if (valor === null || valor === undefined) return '—';
    return Number(valor).toFixed(1).replace('.', ',') + '%';
  }

  function renderizarIndicadores(totais) {
    var mapa = [
      { id: 'ind-visualizacoes', valor: totais.visualizacoes, rotulo: 'Visualizações de página' },
      { id: 'ind-visitantes', valor: totais.visitantes_unicos_aprox, rotulo: 'Visitantes únicos (aprox.)' },
      { id: 'ind-whatsapp', valor: totais.cliques_whatsapp, rotulo: 'Cliques no WhatsApp' },
      { id: 'ind-leads', valor: totais.leads, rotulo: 'Leads recebidos' },
      { id: 'ind-conversao', valor: formatarPercentual(totais.taxa_conversao), rotulo: 'Taxa de conversão' },
    ];
    mapa.forEach(function (item) {
      var el = elemento(item.id);
      if (el) el.textContent = textoOuTraco(item.valor);
    });
  }

  // Gráfico de linha simples (série diária) em SVG, sem dependências.
  function renderizarSerieDiaria(serie) {
    var svg = elemento('grafico-serie-svg');
    if (!svg) return;
    svg.innerHTML = '';

    if (!serie || serie.length === 0) {
      svg.setAttribute('viewBox', '0 0 600 200');
      return;
    }

    var largura = 600, altura = 200, margem = 24;
    var valores = serie.map(function (p) { return Number(p.visualizacoes) || 0; });
    var max = Math.max.apply(null, valores.concat([1]));
    var passoX = (largura - margem * 2) / Math.max(serie.length - 1, 1);

    var pontos = serie.map(function (p, i) {
      var x = margem + i * passoX;
      var y = altura - margem - ((Number(p.visualizacoes) || 0) / max) * (altura - margem * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });

    svg.setAttribute('viewBox', '0 0 ' + largura + ' ' + altura);

    var ns = 'http://www.w3.org/2000/svg';

    var eixo = document.createElementNS(ns, 'line');
    eixo.setAttribute('class', 'grafico-eixo');
    eixo.setAttribute('x1', margem); eixo.setAttribute('y1', altura - margem);
    eixo.setAttribute('x2', largura - margem); eixo.setAttribute('y2', altura - margem);
    svg.appendChild(eixo);

    var area = document.createElementNS(ns, 'polygon');
    area.setAttribute('class', 'grafico-area');
    area.setAttribute('points', margem + ',' + (altura - margem) + ' ' + pontos.join(' ') + ' ' + (largura - margem) + ',' + (altura - margem));
    svg.appendChild(area);

    var linha = document.createElementNS(ns, 'polyline');
    linha.setAttribute('class', 'grafico-linha');
    linha.setAttribute('points', pontos.join(' '));
    svg.appendChild(linha);

    var titulo = document.createElementNS(ns, 'title');
    titulo.textContent = serie.map(function (p) { return p.dia + ': ' + p.visualizacoes; }).join('; ');
    svg.appendChild(titulo);
  }

  // Gráfico de barras horizontal simples para listas (top páginas, origens, dispositivos).
  function renderizarBarras(svgId, dados, chaveRotulo, chaveValor) {
    var svg = elemento(svgId);
    if (!svg) return;
    svg.innerHTML = '';

    if (!dados || dados.length === 0) {
      svg.setAttribute('viewBox', '0 0 400 100');
      return;
    }

    var largura = 400;
    var alturaLinha = 24;
    var altura = dados.length * alturaLinha + 10;
    var max = Math.max.apply(null, dados.map(function (d) { return Number(d[chaveValor]) || 0; }).concat([1]));
    var ns = 'http://www.w3.org/2000/svg';

    svg.setAttribute('viewBox', '0 0 ' + largura + ' ' + altura);

    dados.forEach(function (d, i) {
      var valor = Number(d[chaveValor]) || 0;
      var y = i * alturaLinha + 4;
      var larguraBarra = Math.max((valor / max) * (largura - 140), 1);

      var rotulo = document.createElementNS(ns, 'text');
      rotulo.setAttribute('class', 'grafico-rotulo');
      rotulo.setAttribute('x', 0);
      rotulo.setAttribute('y', y + 13);
      rotulo.textContent = String(d[chaveRotulo]).slice(0, 18);
      svg.appendChild(rotulo);

      var barra = document.createElementNS(ns, 'rect');
      barra.setAttribute('class', 'grafico-barra');
      barra.setAttribute('x', 130);
      barra.setAttribute('y', y);
      barra.setAttribute('width', larguraBarra);
      barra.setAttribute('height', alturaLinha - 6);
      var titulo = document.createElementNS(ns, 'title');
      titulo.textContent = d[chaveRotulo] + ': ' + valor;
      barra.appendChild(titulo);
      svg.appendChild(barra);

      var valorTexto = document.createElementNS(ns, 'text');
      valorTexto.setAttribute('class', 'grafico-rotulo');
      valorTexto.setAttribute('x', 130 + larguraBarra + 6);
      valorTexto.setAttribute('y', y + 13);
      valorTexto.textContent = String(valor);
      svg.appendChild(valorTexto);
    });
  }

  function renderizarLegenda(listaId, dados, chaveRotulo, chaveValor) {
    var el = elemento(listaId);
    if (!el) return;
    el.innerHTML = '';
    (dados || []).forEach(function (d) {
      var li = document.createElement('li');
      var nome = document.createElement('span');
      nome.textContent = textoOuTraco(d[chaveRotulo]);
      var valor = document.createElement('span');
      valor.textContent = textoOuTraco(d[chaveValor]);
      li.appendChild(nome);
      li.appendChild(valor);
      el.appendChild(li);
    });
  }

  async function carregar(inicio, fim) {
    var container = elemento('painel-dashboard');
    if (!container) return;

    container.setAttribute('aria-busy', 'true');

    var dados;
    try {
      var resposta = await fetch(
        '/api/dashboard.php?inicio=' + encodeURIComponent(inicio) + '&fim=' + encodeURIComponent(fim),
        { method: 'GET', credentials: 'same-origin', cache: 'no-store' }
      );
      var corpo = null;
      try { corpo = await resposta.json(); } catch (e) { /* corpo vazio ou inválido */ }
      if (!resposta.ok || !corpo || !corpo.ok) {
        container.setAttribute('aria-busy', 'false');
        return;
      }
      dados = corpo;
    } catch (e) {
      container.setAttribute('aria-busy', 'false');
      return;
    }

    container.setAttribute('aria-busy', 'false');

    renderizarIndicadores(dados.totais || {});
    renderizarSerieDiaria(dados.serie_diaria || []);
    renderizarBarras('grafico-paginas-svg', dados.top_paginas || [], 'caminho', 'visualizacoes');
    renderizarBarras('grafico-origens-svg', dados.origens || [], 'origem', 'visitas');
    renderizarLegenda('legenda-dispositivos', dados.dispositivos || [], 'dispositivo', 'visitas');
    renderizarLegenda('legenda-ocupacao', dados.leads_por_ocupacao || [], 'tipo_imovel', 'total');
    renderizarLegenda('legenda-status', dados.leads_por_status || [], 'status', 'total');
  }

  window.AlfaPrevDashboard = { carregar: carregar };
})();
