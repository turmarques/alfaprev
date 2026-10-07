/**
 * ALFA PREV — assets/js/leads/grade.js
 *
 * Grade (tabela) de leads do painel /leads: busca, filtro, ordenação,
 * paginação, painel de detalhe, atualização de status/observação,
 * exclusão (com confirmação) e exportação CSV.
 *
 * Usa listar_leads() (ver supabase-schema.sql), assets/js/leads/telefone.js
 * e assets/js/leads/csv.js. Toda renderização usa textContent (nunca
 * innerHTML com dado vindo do servidor) para não abrir espaço a XSS.
 *
 * Módulo com DOM — não testado via node --test.
 */
'use strict';

(function () {
  var ESTADO = {
    busca: '',
    status: '',
    ocupacao: '',
    inicio: null,
    fim: null,
    ordenarPor: 'criado_em',
    ordem: 'desc',
    pagina: 1,
    porPagina: 20,
    dados: [],
    total: 0,
  };

  var ROTULOS_STATUS = {
    novo: 'Novo',
    contatado: 'Contatado',
    em_negociacao: 'Em negociação',
    fechado: 'Fechado',
    perdido: 'Perdido',
  };

  function elemento(id) { return document.getElementById(id); }

  function clienteSupabase() {
    var auth = window.AlfaPrevAuth;
    return auth ? auth.clienteSupabase() : null;
  }

  async function carregar() {
    var c = clienteSupabase();
    var corpo = elemento('tabela-leads-corpo');
    if (!c || !corpo) return;

    corpo.innerHTML = '';
    var linhaCarregando = document.createElement('tr');
    var celulaCarregando = document.createElement('td');
    celulaCarregando.colSpan = 6;
    celulaCarregando.className = 'carregando';
    celulaCarregando.textContent = 'Carregando…';
    linhaCarregando.appendChild(celulaCarregando);
    corpo.appendChild(linhaCarregando);

    var resultado;
    try {
      resultado = await c.rpc('listar_leads', {
        p_busca: ESTADO.busca || null,
        p_status: ESTADO.status || null,
        p_ocupacao: ESTADO.ocupacao || null,
        p_inicio: ESTADO.inicio,
        p_fim: ESTADO.fim,
        p_ordenar_por: ESTADO.ordenarPor,
        p_ordem: ESTADO.ordem,
        p_pagina: ESTADO.pagina,
        p_por_pagina: ESTADO.porPagina,
      });
    } catch (e) {
      corpo.innerHTML = '';
      renderizarVazio(corpo, 'Não foi possível carregar os leads. Tente novamente.');
      return;
    }

    if (resultado.error || !resultado.data) {
      corpo.innerHTML = '';
      renderizarVazio(corpo, 'Não foi possível carregar os leads. Tente novamente.');
      return;
    }

    ESTADO.dados = resultado.data.dados || [];
    ESTADO.total = resultado.data.total || 0;
    renderizarTabela();
    renderizarPaginacao();
  }

  function renderizarVazio(corpo, mensagem) {
    var linha = document.createElement('tr');
    var celula = document.createElement('td');
    celula.colSpan = 6;
    celula.className = 'vazio';
    celula.textContent = mensagem;
    linha.appendChild(celula);
    corpo.appendChild(linha);
  }

  function celulaTexto(rotulo, texto) {
    var td = document.createElement('td');
    td.setAttribute('data-rotulo', rotulo);
    td.textContent = texto == null ? '' : String(texto);
    return td;
  }

  function formatarData(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function renderizarTabela() {
    var corpo = elemento('tabela-leads-corpo');
    corpo.innerHTML = '';

    if (ESTADO.dados.length === 0) {
      renderizarVazio(corpo, 'Nenhum lead encontrado com os filtros atuais.');
      return;
    }

    var telefoneApi = window.AlfaPrevTelefone;

    ESTADO.dados.forEach(function (lead) {
      var linha = document.createElement('tr');
      linha.tabIndex = 0;
      linha.setAttribute('role', 'button');
      linha.setAttribute('aria-label', 'Ver detalhes do lead ' + (lead.nome || ''));

      linha.appendChild(celulaTexto('Nome', lead.nome));
      linha.appendChild(celulaTexto('Contato', telefoneApi ? telefoneApi.formatarTelefoneExibicao(lead.telefone) : lead.telefone));
      linha.appendChild(celulaTexto('Ocupação', lead.tipo_imovel));

      var tdStatus = document.createElement('td');
      tdStatus.setAttribute('data-rotulo', 'Status');
      var selo = document.createElement('span');
      selo.className = 'selo-status';
      selo.setAttribute('data-status', lead.status || 'novo');
      selo.textContent = ROTULOS_STATUS[lead.status] || lead.status || '';
      tdStatus.appendChild(selo);
      linha.appendChild(tdStatus);

      linha.appendChild(celulaTexto('Origem', lead.pagina_origem || lead.utm_source || '—'));
      linha.appendChild(celulaTexto('Recebido em', formatarData(lead.criado_em)));

      linha.addEventListener('click', function () { abrirDetalhe(lead); });
      linha.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirDetalhe(lead); }
      });

      corpo.appendChild(linha);
    });
  }

  function renderizarPaginacao() {
    var el = elemento('paginacao-info');
    if (!el) return;
    var totalPaginas = Math.max(Math.ceil(ESTADO.total / ESTADO.porPagina), 1);
    el.textContent = 'Página ' + ESTADO.pagina + ' de ' + totalPaginas + ' — ' + ESTADO.total + ' lead(s)';

    var btnAnterior = elemento('btn-pagina-anterior');
    var btnProxima = elemento('btn-pagina-proxima');
    if (btnAnterior) btnAnterior.disabled = ESTADO.pagina <= 1;
    if (btnProxima) btnProxima.disabled = ESTADO.pagina >= totalPaginas;
  }

  var leadAtual = null;

  function abrirDetalhe(lead) {
    leadAtual = lead;
    var dialogo = elemento('detalhe-dialogo');
    if (!dialogo) return;

    var telefoneApi = window.AlfaPrevTelefone;

    elemento('detalhe-nome').textContent = lead.nome || '';
    elemento('detalhe-email').textContent = lead.email || '';
    elemento('detalhe-telefone').textContent = telefoneApi ? telefoneApi.formatarTelefoneExibicao(lead.telefone) : (lead.telefone || '');
    elemento('detalhe-ocupacao').textContent = lead.tipo_imovel || '';
    elemento('detalhe-mensagem').textContent = lead.mensagem || '';
    elemento('detalhe-origem').textContent = lead.pagina_origem || '—';
    elemento('detalhe-recebido').textContent = formatarData(lead.criado_em);

    var selectStatus = elemento('detalhe-status');
    if (selectStatus) selectStatus.value = lead.status || 'novo';
    var areaObservacao = elemento('detalhe-observacao');
    if (areaObservacao) areaObservacao.value = lead.observacao || '';

    var linkWhatsapp = elemento('detalhe-link-whatsapp');
    if (linkWhatsapp && telefoneApi) {
      var numero = telefoneApi.telefoneParaWhatsapp(lead.telefone);
      linkWhatsapp.href = numero ? ('https://wa.me/' + numero) : '#';
      linkWhatsapp.classList.toggle('oculto', !numero);
    }

    var linkEmail = elemento('detalhe-link-email');
    if (linkEmail) {
      linkEmail.href = lead.email ? ('mailto:' + lead.email) : '#';
      linkEmail.classList.toggle('oculto', !lead.email);
    }

    if (typeof dialogo.showModal === 'function') dialogo.showModal();
  }

  async function salvarDetalhe() {
    if (!leadAtual) return;
    var c = clienteSupabase();
    if (!c) return;

    var novoStatus = elemento('detalhe-status').value;
    var novaObservacao = elemento('detalhe-observacao').value;
    var botaoSalvar = elemento('btn-detalhe-salvar');
    if (botaoSalvar) botaoSalvar.disabled = true;

    try {
      var resultado = await c.from('leads')
        .update({ status: novoStatus, observacao: novaObservacao, atualizado_em: new Date().toISOString() })
        .eq('id', leadAtual.id);
      if (!resultado.error) {
        leadAtual.status = novoStatus;
        leadAtual.observacao = novaObservacao;
        await carregar();
      }
    } catch (e) {
      // Falha silenciosa — usuário pode tentar de novo; não há dado sensível a expor em alerta.
    } finally {
      if (botaoSalvar) botaoSalvar.disabled = false;
    }
  }

  async function excluirDetalhe() {
    if (!leadAtual) return;
    var confirmar = window.confirm('Excluir este lead permanentemente? Esta ação não pode ser desfeita.');
    if (!confirmar) return;

    var c = clienteSupabase();
    if (!c) return;

    try {
      await c.from('leads').delete().eq('id', leadAtual.id);
    } catch (e) {
      // Falha silenciosa.
    }

    var dialogo = elemento('detalhe-dialogo');
    if (dialogo && dialogo.close) dialogo.close();
    leadAtual = null;
    await carregar();
  }

  function exportarCsv() {
    var csvApi = window.AlfaPrevCsv;
    var telefoneApi = window.AlfaPrevTelefone;
    if (!csvApi) return;

    var colunas = [
      { titulo: 'Nome', chave: 'nome' },
      { titulo: 'E-mail', chave: 'email' },
      { titulo: 'Telefone', chave: 'telefone' },
      { titulo: 'Ocupação', chave: 'tipo_imovel' },
      { titulo: 'Mensagem', chave: 'mensagem' },
      { titulo: 'Status', chave: 'status' },
      { titulo: 'Origem', chave: 'pagina_origem' },
      { titulo: 'Recebido em', chave: 'criado_em' },
    ];

    var linhas = ESTADO.dados.map(function (lead) {
      return {
        nome: lead.nome,
        email: lead.email,
        telefone: telefoneApi ? telefoneApi.formatarTelefoneExibicao(lead.telefone) : lead.telefone,
        tipo_imovel: lead.tipo_imovel,
        mensagem: lead.mensagem,
        status: ROTULOS_STATUS[lead.status] || lead.status,
        pagina_origem: lead.pagina_origem,
        criado_em: formatarData(lead.criado_em),
      };
    });

    var csv = csvApi.gerarCsv(linhas, colunas);
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'leads-alfaprev-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function limpar() {
    ESTADO.dados = [];
    ESTADO.total = 0;
    var corpo = elemento('tabela-leads-corpo');
    if (corpo) corpo.innerHTML = '';
    leadAtual = null;
  }

  function configurarControles() {
    var campoBusca = elemento('filtro-busca');
    var selectStatus = elemento('filtro-status');
    var selectOcupacao = elemento('filtro-ocupacao');
    var botaoExportar = elemento('btn-exportar-csv');
    var botaoAnterior = elemento('btn-pagina-anterior');
    var botaoProxima = elemento('btn-pagina-proxima');
    var botaoSalvarDetalhe = elemento('btn-detalhe-salvar');
    var botaoExcluirDetalhe = elemento('btn-detalhe-excluir');

    var timerBusca = null;
    if (campoBusca) {
      campoBusca.addEventListener('input', function () {
        clearTimeout(timerBusca);
        timerBusca = setTimeout(function () {
          ESTADO.busca = campoBusca.value.trim();
          ESTADO.pagina = 1;
          carregar();
        }, 350);
      });
    }

    if (selectStatus) {
      selectStatus.addEventListener('change', function () {
        ESTADO.status = selectStatus.value;
        ESTADO.pagina = 1;
        carregar();
      });
    }

    if (selectOcupacao) {
      selectOcupacao.addEventListener('change', function () {
        ESTADO.ocupacao = selectOcupacao.value;
        ESTADO.pagina = 1;
        carregar();
      });
    }

    document.querySelectorAll('[data-ordenar-por]').forEach(function (botao) {
      botao.addEventListener('click', function () {
        var campo = botao.getAttribute('data-ordenar-por');
        if (ESTADO.ordenarPor === campo) {
          ESTADO.ordem = ESTADO.ordem === 'asc' ? 'desc' : 'asc';
        } else {
          ESTADO.ordenarPor = campo;
          ESTADO.ordem = 'asc';
        }
        carregar();
      });
    });

    if (botaoAnterior) {
      botaoAnterior.addEventListener('click', function () {
        if (ESTADO.pagina > 1) { ESTADO.pagina--; carregar(); }
      });
    }
    if (botaoProxima) {
      botaoProxima.addEventListener('click', function () {
        ESTADO.pagina++; carregar();
      });
    }

    if (botaoExportar) botaoExportar.addEventListener('click', exportarCsv);
    if (botaoSalvarDetalhe) botaoSalvarDetalhe.addEventListener('click', salvarDetalhe);
    if (botaoExcluirDetalhe) botaoExcluirDetalhe.addEventListener('click', excluirDetalhe);
  }

  window.AlfaPrevGrade = { carregar: carregar, limpar: limpar, configurarControles: configurarControles };
})();
