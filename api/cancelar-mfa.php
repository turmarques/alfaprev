<?php
/**
 * ALFA PREV — api/cancelar-mfa.php
 *
 * Cancela o fluxo de MFA em andamento (botão "Cancelar e sair" do diálogo
 * TOTP) e volta ao estado "não autenticado". Equivalente a
 * cancelarFluxoMfa() em assets/js/leads/auth.js.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/sessao.php';

alfaprev_exigir_metodo('POST');
alfaprev_exigir_same_origin();

alfaprev_limpar_pre_login();

alfaprev_json(['ok' => true]);
