<?php
/**
 * ALFA PREV — api/mfa-verificar.php
 *
 * Confirma o código TOTP de 6 dígitos — tanto para concluir o cadastro do
 * primeiro fator quanto para o desafio normal de login. Em qualquer dos
 * dois casos, só finaliza a sessão admin (AAL2 equivalente) se o código
 * bater. Equivalente a auth.mfa.challengeAndVerify() do Supabase.
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

$corpo = alfaprev_corpo_json();
$codigo = (string) ($corpo['codigo'] ?? '');

$pdo = alfaprev_db();
$stmt = $pdo->prepare('SELECT totp_secret, totp_confirmado FROM admins WHERE id = :id');
$stmt->execute(['id' => $adminId]);
$admin = $stmt->fetch();

if ($admin === false) {
    alfaprev_erro('sessao_invalida', 401);
}

if ((int) $admin['totp_confirmado'] === 0) {
    // Fluxo de cadastro: o segredo ainda não está salvo em `admins`.
    $secretoTemp = alfaprev_segredo_temporario();
    if ($secretoTemp === null) {
        alfaprev_erro('cadastro_nao_iniciado', 409);
    }

    if (!alfaprev_totp_verificar($secretoTemp, $codigo)) {
        alfaprev_erro('codigo_invalido', 401);
    }

    $atualizar = $pdo->prepare('UPDATE admins SET totp_secret = :secret, totp_confirmado = 1 WHERE id = :id');
    $atualizar->execute(['secret' => $secretoTemp, 'id' => $adminId]);

    alfaprev_finalizar_login_admin($adminId);
    alfaprev_json(['ok' => true]);
}

// Fluxo de desafio normal (fator já cadastrado em acessos anteriores).
if (!alfaprev_totp_verificar((string) $admin['totp_secret'], $codigo)) {
    alfaprev_erro('codigo_invalido', 401);
}

alfaprev_finalizar_login_admin($adminId);
alfaprev_json(['ok' => true]);
