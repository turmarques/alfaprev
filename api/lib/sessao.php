<?php
/**
 * ALFA PREV — api/lib/sessao.php
 *
 * Sessão PHP nativa para o painel /leads (substitui o JWT/sessão do
 * Supabase Auth). Cookie HttpOnly + SameSite=Strict + Secure (quando
 * HTTPS). CSRF token por sessão para as ações administrativas que mudam
 * dado (atualizar/excluir lead). Timeout de inatividade equivalente ao
 * INATIVIDADE_MS de assets/js/leads/auth.js.
 *
 * Estados possíveis na sessão:
 *   - nenhum admin_id / pre_admin_id -> visitante não autenticado.
 *   - pre_admin_id definido          -> senha já confirmada, aguardando
 *                                        cadastro ou confirmação do TOTP
 *                                        (ver api/login.php, api/mfa-*.php).
 *   - admin_id definido              -> login completo (2FA confirmado),
 *                                        equivalente ao AAL2 do Supabase.
 */
declare(strict_types=1);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/resposta.php';

function alfaprev_iniciar_sessao(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_name('alfaprev_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function alfaprev_inatividade_segundos(): int
{
    return (int) (alfaprev_config()['sessao_inatividade_segundos'] ?? 1800);
}

/**
 * true se há uma sessão admin completa (2FA confirmado) e ainda dentro da
 * janela de inatividade. Atualiza o relógio de atividade quando válida.
 * Destroi a sessão quando expirada.
 */
function alfaprev_admin_autenticado(): bool
{
    alfaprev_iniciar_sessao();

    if (empty($_SESSION['admin_id'])) {
        return false;
    }

    $ultima = (int) ($_SESSION['ultima_atividade'] ?? 0);
    if ($ultima > 0 && (time() - $ultima) > alfaprev_inatividade_segundos()) {
        alfaprev_destruir_sessao();
        return false;
    }

    $_SESSION['ultima_atividade'] = time();
    return true;
}

function alfaprev_exigir_admin(): int
{
    if (!alfaprev_admin_autenticado()) {
        alfaprev_erro('nao_autenticado', 401);
    }
    return (int) $_SESSION['admin_id'];
}

function alfaprev_destruir_sessao(): void
{
    alfaprev_iniciar_sessao();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $parametros = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $parametros['path'], $parametros['domain'], $parametros['secure'], $parametros['httponly']);
    }
    session_destroy();
}

function alfaprev_iniciar_pre_login(int $adminId): void
{
    alfaprev_iniciar_sessao();
    session_regenerate_id(true);
    $_SESSION['pre_admin_id'] = $adminId;
    $_SESSION['pre_admin_desde'] = time();
}

function alfaprev_pre_login_admin_id(): ?int
{
    alfaprev_iniciar_sessao();

    if (empty($_SESSION['pre_admin_id'])) {
        return null;
    }

    // Janela curta (10 min) para completar o desafio/cadastro MFA depois da senha.
    $desde = (int) ($_SESSION['pre_admin_desde'] ?? 0);
    if ($desde === 0 || (time() - $desde) > 600) {
        alfaprev_limpar_pre_login();
        return null;
    }

    return (int) $_SESSION['pre_admin_id'];
}

function alfaprev_definir_segredo_temporario(string $secret): void
{
    alfaprev_iniciar_sessao();
    $_SESSION['pre_admin_secret_temp'] = $secret;
}

function alfaprev_segredo_temporario(): ?string
{
    alfaprev_iniciar_sessao();
    return $_SESSION['pre_admin_secret_temp'] ?? null;
}

function alfaprev_limpar_pre_login(): void
{
    alfaprev_iniciar_sessao();
    unset($_SESSION['pre_admin_id'], $_SESSION['pre_admin_desde'], $_SESSION['pre_admin_secret_temp']);
}

function alfaprev_finalizar_login_admin(int $adminId): void
{
    alfaprev_iniciar_sessao();
    alfaprev_limpar_pre_login();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = $adminId;
    $_SESSION['ultima_atividade'] = time();
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function alfaprev_csrf_token(): string
{
    alfaprev_iniciar_sessao();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function alfaprev_exigir_csrf(): void
{
    alfaprev_iniciar_sessao();
    $recebido = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $esperado = $_SESSION['csrf_token'] ?? '';

    if ($esperado === '' || $recebido === '' || !hash_equals($esperado, $recebido)) {
        alfaprev_erro('csrf_invalido', 403);
    }
}
