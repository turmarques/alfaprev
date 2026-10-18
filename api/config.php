<?php
/**
 * ALFA PREV — api/config.php
 *
 * Carrega api/config.local.php (gitignored, criado manualmente no servidor
 * a partir de api/config.example.php) e expõe a configuração via função.
 * Nenhum segredo real fica neste arquivo — ele só sabe ONDE procurar.
 */
declare(strict_types=1);

function alfaprev_config(): array
{
    static $config = null;

    if ($config === null) {
        $caminhoLocal = __DIR__ . '/config.local.php';

        if (!is_file($caminhoLocal)) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => false, 'erro' => 'config_ausente']);
            error_log('alfaprev: api/config.local.php não encontrado — copie de config.example.php e preencha.');
            exit;
        }

        $config = require $caminhoLocal;

        if (!is_array($config) || empty($config['db']['host']) || empty($config['sal_fixo'])) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => false, 'erro' => 'config_incompleta']);
            error_log('alfaprev: api/config.local.php presente, mas incompleto (faltam chaves obrigatórias).');
            exit;
        }
    }

    return $config;
}
