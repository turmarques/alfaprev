<?php
/**
 * ALFA PREV — api/logout.php
 *
 * Encerra a sessão admin (botão "Sair" ou timeout de inatividade
 * detectado no front-end). Idempotente: pode ser chamado mesmo sem
 * sessão ativa.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/sessao.php';

alfaprev_exigir_metodo('POST');
alfaprev_exigir_same_origin();

alfaprev_destruir_sessao();

alfaprev_json(['ok' => true]);
