<?php
/**
 * ALFA PREV — api/sessao-verificar.php
 *
 * Checagem de sessão para restaurar o painel ao recarregar a página
 * (equivalente a restaurarSessao()/verificarAdmin() em auth.js). Também
 * devolve o token CSRF atual, usado pelas chamadas administrativas que
 * alteram dados (api/leads.php PATCH/DELETE).
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/sessao.php';

alfaprev_exigir_metodo('GET');
alfaprev_exigir_same_origin(false);

if (!alfaprev_admin_autenticado()) {
    alfaprev_json(['ok' => true, 'autenticado' => false]);
}

alfaprev_json([
    'ok' => true,
    'autenticado' => true,
    'csrf_token' => alfaprev_csrf_token(),
]);
