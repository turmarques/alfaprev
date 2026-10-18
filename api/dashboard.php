<?php
/**
 * ALFA PREV — api/dashboard.php
 *
 * Métricas agregadas do período (equivalente a rpc/dashboard_dados do
 * antigo Supabase). Exige sessão admin (AAL2 equivalente). Datas de
 * entrada (?inicio=YYYY-MM-DD&fim=YYYY-MM-DD) são tratadas como dias no
 * fuso America/Sao_Paulo; os limites são convertidos para UTC antes de
 * consultar o banco (colunas created_at/criado_em são sempre UTC).
 *
 * Observação sobre fuso: em vez de depender de CONVERT_TZ do MySQL (que
 * exige as tabelas de fuso horário carregadas — nem sempre disponível em
 * hospedagem compartilhada), a conversão UTC <-> America/Sao_Paulo é feita
 * em PHP, tanto para os limites da consulta quanto para o agrupamento
 * diário da série temporal.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/sessao.php';

alfaprev_exigir_metodo('GET');
alfaprev_exigir_same_origin(false);
alfaprev_exigir_admin();

const ALFAPREV_FUSO_SP = 'America/Sao_Paulo';

function alfaprev_data_valida(?string $valor): ?DateTime
{
    if ($valor === null || $valor === '') {
        return null;
    }
    $dt = DateTime::createFromFormat('!Y-m-d', $valor, new DateTimeZone(ALFAPREV_FUSO_SP));
    if ($dt === false || $dt->format('Y-m-d') !== $valor) {
        return null;
    }
    return $dt;
}

$hojeSp = new DateTime('now', new DateTimeZone(ALFAPREV_FUSO_SP));
$inicioData = alfaprev_data_valida($_GET['inicio'] ?? null) ?? (clone $hojeSp)->modify('-30 days');
$fimData = alfaprev_data_valida($_GET['fim'] ?? null) ?? $hojeSp;

if ($inicioData > $fimData) {
    [$inicioData, $fimData] = [$fimData, $inicioData];
}

// Limites em UTC: início do dia `inicio` (SP) até início do dia seguinte a `fim` (SP), exclusivo.
$inicioUtc = (clone $inicioData)->setTime(0, 0, 0)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
$fimUtc = (clone $fimData)->modify('+1 day')->setTime(0, 0, 0)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');

$pdo = alfaprev_db();

// --- Totais + série diária: uma única leitura de eventos/leads, agregada em PHP ---
$stmtEventos = $pdo->prepare('SELECT criado_em, tipo, sessao_id, visitante_hash FROM eventos WHERE criado_em >= :inicio AND criado_em < :fim');
$stmtEventos->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$eventos = $stmtEventos->fetchAll();

$stmtLeads = $pdo->prepare('SELECT created_at FROM leads WHERE created_at >= :inicio AND created_at < :fim');
$stmtLeads->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$leadsPeriodo = $stmtLeads->fetchAll();

function alfaprev_dia_sp(string $datetimeUtc): string
{
    $dt = new DateTime($datetimeUtc, new DateTimeZone('UTC'));
    $dt->setTimezone(new DateTimeZone(ALFAPREV_FUSO_SP));
    return $dt->format('Y-m-d');
}

$visualizacoes = 0;
$cliquesWhatsapp = 0;
$sessoesUnicas = [];
$hashesUnicos = [];
$serieEventosPorDia = []; // dia => ['visualizacoes'=>0,'visitas'=>[sessao=>true],'cliques_whatsapp'=>0]

foreach ($eventos as $evento) {
    $dia = alfaprev_dia_sp($evento['criado_em']);
    if (!isset($serieEventosPorDia[$dia])) {
        $serieEventosPorDia[$dia] = ['visualizacoes' => 0, 'visitas' => [], 'cliques_whatsapp' => 0];
    }

    if ($evento['tipo'] === 'page_view') {
        $visualizacoes++;
        $serieEventosPorDia[$dia]['visualizacoes']++;
        if ($evento['sessao_id'] !== null && $evento['sessao_id'] !== '') {
            $sessoesUnicas[$evento['sessao_id']] = true;
            $serieEventosPorDia[$dia]['visitas'][$evento['sessao_id']] = true;
        }
        if ($evento['visitante_hash'] !== null && $evento['visitante_hash'] !== '') {
            $hashesUnicos[$evento['visitante_hash']] = true;
        }
    } elseif ($evento['tipo'] === 'whatsapp_click') {
        $cliquesWhatsapp++;
        $serieEventosPorDia[$dia]['cliques_whatsapp']++;
    }
}

$leadsPorDia = [];
foreach ($leadsPeriodo as $lead) {
    $dia = alfaprev_dia_sp($lead['created_at']);
    $leadsPorDia[$dia] = ($leadsPorDia[$dia] ?? 0) + 1;
}

$totalVisitas = count($sessoesUnicas);
$totalLeads = count($leadsPeriodo);
$taxaConversao = $totalVisitas > 0 ? round($totalLeads / $totalVisitas * 100, 2) : 0;

ksort($serieEventosPorDia);
$serieDiaria = [];
foreach ($serieEventosPorDia as $dia => $dados) {
    $serieDiaria[] = [
        'dia' => $dia,
        'visualizacoes' => $dados['visualizacoes'],
        'visitas' => count($dados['visitas']),
        'cliques_whatsapp' => $dados['cliques_whatsapp'],
        'leads' => $leadsPorDia[$dia] ?? 0,
    ];
}

// --- Top páginas / origens / dispositivos: agregação direta em SQL (não depende de dia local) ---
$stmtPaginas = $pdo->prepare("SELECT caminho, COUNT(*) AS visualizacoes FROM eventos
    WHERE tipo = 'page_view' AND criado_em >= :inicio AND criado_em < :fim AND caminho IS NOT NULL
    GROUP BY caminho ORDER BY visualizacoes DESC LIMIT 10");
$stmtPaginas->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$topPaginas = $stmtPaginas->fetchAll();

$stmtOrigens = $pdo->prepare("SELECT COALESCE(origem, 'direto') AS origem, COUNT(*) AS visualizacoes FROM eventos
    WHERE tipo = 'page_view' AND criado_em >= :inicio AND criado_em < :fim
    GROUP BY origem ORDER BY visualizacoes DESC LIMIT 10");
$stmtOrigens->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$origens = $stmtOrigens->fetchAll();

$stmtDispositivos = $pdo->prepare("SELECT COALESCE(dispositivo, 'desconhecido') AS dispositivo, COUNT(*) AS visualizacoes FROM eventos
    WHERE tipo = 'page_view' AND criado_em >= :inicio AND criado_em < :fim
    GROUP BY dispositivo");
$stmtDispositivos->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$dispositivos = $stmtDispositivos->fetchAll();

$stmtOcupacao = $pdo->prepare('SELECT tipo_imovel AS ocupacao, COUNT(*) AS total FROM leads
    WHERE created_at >= :inicio AND created_at < :fim
    GROUP BY tipo_imovel ORDER BY total DESC');
$stmtOcupacao->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$leadsPorOcupacao = $stmtOcupacao->fetchAll();

$stmtStatus = $pdo->prepare('SELECT status, COUNT(*) AS total FROM leads
    WHERE created_at >= :inicio AND created_at < :fim
    GROUP BY status ORDER BY total DESC');
$stmtStatus->execute(['inicio' => $inicioUtc, 'fim' => $fimUtc]);
$leadsPorStatus = $stmtStatus->fetchAll();

alfaprev_json([
    'ok' => true,
    'periodo' => ['inicio' => $inicioData->format('Y-m-d'), 'fim' => $fimData->format('Y-m-d'), 'fuso' => ALFAPREV_FUSO_SP],
    'totais' => [
        'visualizacoes' => $visualizacoes,
        'visitas' => $totalVisitas,
        'visitantes_unicos_aprox' => count($hashesUnicos),
        'cliques_whatsapp' => $cliquesWhatsapp,
        'leads' => $totalLeads,
        'taxa_conversao' => $taxaConversao,
    ],
    'serie_diaria' => $serieDiaria,
    'top_paginas' => $topPaginas,
    'origens' => $origens,
    'dispositivos' => $dispositivos,
    'leads_por_ocupacao' => $leadsPorOcupacao,
    'leads_por_status' => $leadsPorStatus,
]);
