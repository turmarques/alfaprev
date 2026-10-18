<?php
/**
 * ALFA PREV — api/mfa-cadastro.php
 *
 * Inicia o cadastro do fator TOTP (primeiro acesso do admin). Gera um
 * segredo novo e o mantém só na sessão (pre_admin_secret_temp) — nada é
 * gravado em `admins` até o código ser confirmado em api/mfa-verificar.php.
 * Equivalente a auth.mfa.enroll() do Supabase.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/sessao.php';
require_once __DIR__ . '/lib/totp.php';

alfaprev_exigir_metodo('POST');
alfaprev_exigir_same_origin();

$adminId = alfaprev_pre_login_admin_id();
if ($adminId === null) {
    alfaprev_erro('sessao_invalida', 401);
}

$pdo = alfaprev_db();
$stmt = $pdo->prepare('SELECT totp_confirmado FROM admins WHERE id = :id');
$stmt->execute(['id' => $adminId]);
$admin = $stmt->fetch();

if ($admin === false || (int) $admin['totp_confirmado'] === 1) {
    alfaprev_erro('cadastro_nao_aplicavel', 409);
}

$secret = alfaprev_totp_gerar_secreto();
alfaprev_definir_segredo_temporario($secret);

alfaprev_json(['ok' => true, 'factorId' => (string) $adminId, 'secret' => $secret]);
