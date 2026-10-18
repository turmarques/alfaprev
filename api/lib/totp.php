<?php
/**
 * ALFA PREV — api/lib/totp.php
 *
 * TOTP (RFC 6238) implementado sem dependências (sem Composer, hospedagem
 * compartilhada). Substitui auth.mfa.enroll()/challengeAndVerify() do
 * Supabase Auth. Compatível com qualquer app autenticador padrão (Google
 * Authenticator, Authy, 1Password): HMAC-SHA1, período de 30s, 6 dígitos.
 */
declare(strict_types=1);

const ALFAPREV_TOTP_ALFABETO_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function alfaprev_base32_codificar(string $dados): string
{
    if ($dados === '') {
        return '';
    }

    $bits = '';
    foreach (str_split($dados) as $caractere) {
        $bits .= str_pad(decbin(ord($caractere)), 8, '0', STR_PAD_LEFT);
    }

    $saida = '';
    foreach (str_split($bits, 5) as $grupo) {
        $grupo = str_pad($grupo, 5, '0', STR_PAD_RIGHT);
        $saida .= ALFAPREV_TOTP_ALFABETO_BASE32[bindec($grupo)];
    }

    return $saida;
}

function alfaprev_base32_decodificar(string $base32): string
{
    $base32 = strtoupper(preg_replace('/[^A-Z2-7]/', '', $base32) ?? '');
    if ($base32 === '') {
        return '';
    }

    $bits = '';
    foreach (str_split($base32) as $caractere) {
        $posicao = strpos(ALFAPREV_TOTP_ALFABETO_BASE32, $caractere);
        if ($posicao === false) {
            continue;
        }
        $bits .= str_pad(decbin($posicao), 5, '0', STR_PAD_LEFT);
    }

    $dados = '';
    foreach (str_split($bits, 8) as $byte) {
        if (strlen($byte) < 8) {
            continue; // descarta bits de preenchimento finais
        }
        $dados .= chr((int) bindec($byte));
    }

    return $dados;
}

/**
 * Gera um novo segredo aleatório (160 bits, igual ao padrão TOTP) em Base32.
 */
function alfaprev_totp_gerar_secreto(): string
{
    return alfaprev_base32_codificar(random_bytes(20));
}

function alfaprev_totp_codigo(string $secretoBase32, ?int $timestamp = null, int $periodo = 30, int $digitos = 6): string
{
    $timestamp ??= time();
    $contador = (int) floor($timestamp / $periodo);

    $segredoBinario = alfaprev_base32_decodificar($secretoBase32);
    $contadorBinario = str_pad(pack('N', $contador), 8, "\x00", STR_PAD_LEFT);

    $hash = hash_hmac('sha1', $contadorBinario, $segredoBinario, true);
    $deslocamento = ord($hash[19]) & 0x0F;

    $parte = (ord($hash[$deslocamento]) & 0x7F) << 24
        | (ord($hash[$deslocamento + 1]) & 0xFF) << 16
        | (ord($hash[$deslocamento + 2]) & 0xFF) << 8
        | (ord($hash[$deslocamento + 3]) & 0xFF);

    $codigo = (string) ($parte % (10 ** $digitos));
    return str_pad($codigo, $digitos, '0', STR_PAD_LEFT);
}

/**
 * Verifica o código digitado permitindo uma pequena janela de tolerância
 * de relógio (um passo de 30s para antes e para depois).
 */
function alfaprev_totp_verificar(string $secretoBase32, string $codigo, int $janelaPassos = 1): bool
{
    $codigo = preg_replace('/\D/', '', $codigo) ?? '';
    if ($codigo === '' || strlen($codigo) !== 6) {
        return false;
    }

    $agora = time();
    for ($passo = -$janelaPassos; $passo <= $janelaPassos; $passo++) {
        $esperado = alfaprev_totp_codigo($secretoBase32, $agora + ($passo * 30));
        if (hash_equals($esperado, $codigo)) {
            return true;
        }
    }

    return false;
}
