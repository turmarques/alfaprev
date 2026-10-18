<?php
/**
 * ALFA PREV — api/leads.php
 *
 * GET:  lista paginada/filtrada de leads (equivalente a rpc/listar_leads).
 * POST: ação administrativa sobre um lead — {action:"atualizar", id,
 *       status, observacao} ou {action:"excluir", id}. Equivalente aos
 *       antigos .from('leads').update()/.delete() do client Supabase.
 *       Exige sessão admin + token CSRF (header X-CSRF-Token) por ser
 *       uma ação que muda dado.
 *
 * Datas de filtro (?inicio=&fim=) seguem a mesma convenção de dashboard.php:
 * dias no fuso America/Sao_Paulo, convertidos para limites UTC antes da
 * consulta. `contato_em` na resposta já vem formatado em America/Sao_Paulo
 * (DD/MM/YYYY HH:MM), igual ao antigo listar_leads().
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/sessao.php';
require_once __DIR__ . '/lib/tempo.php';

const ALFAPREV_LEADS_FUSO_SP = 'America/Sao_Paulo';
const ALFAPREV_LEADS_STATUS_VALIDOS = ['novo', 'contatado', 'em_negociacao', 'fechado', 'perdido'];

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';

if ($metodo === 'GET') {
    alfaprev_exigir_same_origin(false);
    alfaprev_exigir_admin();
    alfaprev_leads_listar();
} elseif ($metodo === 'POST') {
    alfaprev_exigir_same_origin();
    alfaprev_exigir_admin();
    alfaprev_exigir_csrf();
    alfaprev_leads_acao();
} else {
    alfaprev_erro('metodo_nao_permitido', 405);
}

function alfaprev_leads_escapar_busca(string $busca): string
{
    $escapada = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($busca));
    return '%' . $escapada . '%';
}

function alfaprev_leads_listar(): void
{
    $pdo = alfaprev_db();

    $busca = trim((string) ($_GET['busca'] ?? ''));
    $status = $_GET['status'] ?? null;
    $status = in_array($status, ALFAPREV_LEADS_STATUS_VALIDOS, true) ? $status : null;
    $ocupacao = isset($_GET['ocupacao']) && $_GET['ocupacao'] !== '' ? (string) $_GET['ocupacao'] : null;

    $inicio = $_GET['inicio'] ?? null;
    $fim = $_GET['fim'] ?? null;
    $inicioUtc = null;
    $fimUtc = null;

    if (is_string($inicio) && $inicio !== '') {
        $dt = DateTime::createFromFormat('!Y-m-d', $inicio, new DateTimeZone(ALFAPREV_LEADS_FUSO_SP));
        if ($dt !== false) {
            $inicioUtc = $dt->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
        }
    }
    if (is_string($fim) && $fim !== '') {
        $dt = DateTime::createFromFormat('!Y-m-d', $fim, new DateTimeZone(ALFAPREV_LEADS_FUSO_SP));
        if ($dt !== false) {
            $fimUtc = $dt->modify('+1 day')->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
        }
    }

    $colunasOrdenaveis = ['nome' => 'nome', 'status' => 'status', 'tipo_imovel' => 'tipo_imovel', 'created_at' => 'created_at'];
    $colunaPedida = (string) ($_GET['ordenar_por'] ?? 'created_at');
    $coluna = $colunasOrdenaveis[$colunaPedida] ?? 'created_at';
    $direcao = strtolower((string) ($_GET['ordem'] ?? 'desc')) === 'asc' ? 'ASC' : 'DESC';

    $porPagina = max(1, min(100, (int) ($_GET['por_pagina'] ?? 25)));
    $pagina = max(1, (int) ($_GET['pagina'] ?? 1));
    $offset = ($pagina - 1) * $porPagina;

    $condicoes = [];
    $parametros = [];

    if ($busca !== '') {
        // Placeholders repetidos (:busca1/:busca2/:busca3) em vez de um único
        // :busca reaproveitado — com PDO::ATTR_EMULATE_PREPARES desligado (prepare
        // nativo do mysqlnd), reaproveitar o mesmo nome de parâmetro várias vezes
        // na mesma query não é suportado de forma confiável.
        $condicoes[] = "(nome LIKE :busca1 ESCAPE '\\\\' OR email LIKE :busca2 ESCAPE '\\\\' OR telefone LIKE :busca3 ESCAPE '\\\\')";
        $valorBusca = alfaprev_leads_escapar_busca($busca);
        $parametros['busca1'] = $valorBusca;
        $parametros['busca2'] = $valorBusca;
        $parametros['busca3'] = $valorBusca;
    }
    if ($status !== null) {
        $condicoes[] = 'status = :status';
        $parametros['status'] = $status;
    }
    if ($ocupacao !== null) {
        $condicoes[] = 'tipo_imovel = :ocupacao';
        $parametros['ocupacao'] = $ocupacao;
    }
    if ($inicioUtc !== null) {
        $condicoes[] = 'created_at >= :inicio';
        $parametros['inicio'] = $inicioUtc;
    }
    if ($fimUtc !== null) {
        $condicoes[] = 'created_at < :fim';
        $parametros['fim'] = $fimUtc;
    }

    $whereSql = $condicoes !== [] ? ('WHERE ' . implode(' AND ', $condicoes)) : '';

    $stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM leads $whereSql");
    $stmtTotal->execute($parametros);
    $total = (int) $stmtTotal->fetchColumn();

    $sql = "SELECT id, nome, email, telefone, tipo_imovel AS ocupacao, mensagem, status, observacao, created_at, pagina_origem
            FROM leads $whereSql
            ORDER BY $coluna $direcao
            LIMIT :limite OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    foreach ($parametros as $chave => $valor) {
        $stmt->bindValue($chave, $valor);
    }
    $stmt->bindValue('limite', $porPagina, PDO::PARAM_INT);
    $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $linhas = $stmt->fetchAll();

    $dados = array_map(function (array $linha): array {
        $dt = new DateTime($linha['created_at'], new DateTimeZone('UTC'));
        $dt->setTimezone(new DateTimeZone(ALFAPREV_LEADS_FUSO_SP));

        return [
            'id' => (int) $linha['id'],
            'nome' => $linha['nome'],
            'email' => $linha['email'],
            'telefone' => $linha['telefone'],
            'ocupacao' => $linha['ocupacao'],
            'mensagem' => $linha['mensagem'],
            'status' => $linha['status'],
            'observacao' => $linha['observacao'],
            'contato_em' => $dt->format('d/m/Y H:i'),
            'pagina_origem' => $linha['pagina_origem'],
        ];
    }, $linhas);

    alfaprev_json(['ok' => true, 'total' => $total, 'pagina' => $pagina, 'por_pagina' => $porPagina, 'dados' => $dados]);
}

function alfaprev_leads_acao(): void
{
    $pdo = alfaprev_db();
    $corpo = alfaprev_corpo_json();
    $acao = $corpo['action'] ?? '';
    $id = (int) ($corpo['id'] ?? 0);

    if ($id <= 0) {
        alfaprev_erro('id_invalido', 422);
    }

    if ($acao === 'atualizar') {
        $status = $corpo['status'] ?? null;
        if (!in_array($status, ALFAPREV_LEADS_STATUS_VALIDOS, true)) {
            alfaprev_erro('status_invalido', 422);
        }
        $observacao = $corpo['observacao'] ?? null;
        if (is_string($observacao) && mb_strlen($observacao) > 2000) {
            $observacao = mb_substr($observacao, 0, 2000);
        }

        $stmt = $pdo->prepare('UPDATE leads SET status = :status, observacao = :observacao, atualizado_em = :agora WHERE id = :id');
        $stmt->execute([
            'status' => $status,
            'observacao' => $observacao !== '' ? $observacao : null,
            'agora' => alfaprev_agora_utc(),
            'id' => $id,
        ]);

        alfaprev_json(['ok' => true]);
    } elseif ($acao === 'excluir') {
        $stmt = $pdo->prepare('DELETE FROM leads WHERE id = :id');
        $stmt->execute(['id' => $id]);

        alfaprev_json(['ok' => true]);
    } else {
        alfaprev_erro('acao_invalida', 422);
    }
}
