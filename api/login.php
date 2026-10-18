<?php
/**
 * ALFA PREV — api/login.php
 *
 * Etapa 1 do login admin: e-mail + senha. Nunca autentica totalmente aqui
 * — sempre exige o segundo fator (TOTP) em seguida, via api/mfa-cadastro.php
 * (primeiro acesso) ou api/mfa-verificar.php (acessos seguintes).
 * Bloqueio de 3 tentativas / 5 min imposto no servidor (tabela
 * tentativas_login), independente do bloqueio de UX em bloqueio.js.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/hash.php';
require_once __DIR__ . '/lib/rate_limit.php';
require_once __DIR__ . '/lib/sessao.php';

alfaprev_exigir_metodo('POST');
alfaprev_exigir_same_origin();

$pdo = alfaprev_db();
$identificadorHash = alfaprev_hash_login($pdo);

if (alfaprev_login_bloqueado($pdo, $identificadorHash)) {
    alfaprev_erro('429', 429);
}

$corpo = alfaprev_corpo_json();
$email = trim((string) ($corpo['email'] ?? ''));
$senha = (string) ($corpo['senha'] ?? '');

if ($email === '' || $senha === '') {
    alfaprev_registrar_tentativa_login($pdo, $identificadorHash, $email !== '' ? $email : null, false);
    alfaprev_erro('credenciais_invalidas', 401);
}

$stmt = $pdo->prepare('SELECT id, senha_hash, totp_confirmado FROM admins WHERE email = :email');
$stmt->execute(['email' => $email]);
$admin = $stmt->fetch();

if ($admin === false || !password_verify($senha, $admin['senha_hash'])) {
    alfaprev_registrar_tentativa_login($pdo, $identificadorHash, $email, false);
    alfaprev_erro('credenciais_invalidas', 401);
}

alfaprev_registrar_tentativa_login($pdo, $identificadorHash, $email, true);
alfaprev_limpar_tentativas_login($pdo, $identificadorHash);

alfaprev_iniciar_pre_login((int) $admin['id']);

if ((int) $admin['totp_confirmado'] === 0) {
    alfaprev_json(['ok' => false, 'motivo' => 'mfa_cadastro_necessario']);
}

alfaprev_json(['ok' => false, 'motivo' => 'mfa_codigo_necessario', 'factorId' => (string) $admin['id']]);
