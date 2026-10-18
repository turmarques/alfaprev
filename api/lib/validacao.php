<?php
/**
 * ALFA PREV — api/lib/validacao.php
 *
 * Validação/normalização server-side dos campos do formulário de contato,
 * independente da validação client-side que já existe em script.js.
 * Espelha as checagens que antes viviam em registrar_lead() (PL/pgSQL).
 */
declare(strict_types=1);

// Valores aceitos do <select id="imovel"> em src/pages/contato.html.
const ALFAPREV_OCUPACOES_VALIDAS = ['comercial', 'industrial', 'condominio_residencial', 'escritorios', 'outro'];

function alfaprev_validar_nome(?string $nome): ?string
{
    if ($nome === null) {
        return null;
    }
    $nome = trim($nome);
    $tamanho = mb_strlen($nome);
    if ($tamanho < 2 || $tamanho > 200) {
        return null;
    }
    return mb_substr($nome, 0, 200);
}

function alfaprev_validar_email(?string $email): ?string
{
    if ($email === null) {
        return null;
    }
    $email = trim($email);
    if (mb_strlen($email) > 200 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return null;
    }
    return mb_substr($email, 0, 200);
}

/**
 * Remove tudo que não é dígito e valida 10-13 dígitos (igual ao Postgres).
 */
function alfaprev_validar_telefone(?string $telefone): ?string
{
    if ($telefone === null) {
        return null;
    }
    $apenasDigitos = preg_replace('/\D/', '', $telefone) ?? '';
    $tamanho = strlen($apenasDigitos);
    if ($tamanho < 10 || $tamanho > 13) {
        return null;
    }
    return substr($apenasDigitos, 0, 20);
}

function alfaprev_validar_ocupacao(?string $ocupacao): ?string
{
    if ($ocupacao === null || !in_array($ocupacao, ALFAPREV_OCUPACOES_VALIDAS, true)) {
        return null;
    }
    return $ocupacao;
}

function alfaprev_validar_mensagem(?string $mensagem): ?string
{
    if ($mensagem === null || trim($mensagem) === '') {
        return null;
    }
    $mensagem = trim($mensagem);
    if (mb_strlen($mensagem) > 2000) {
        $mensagem = mb_substr($mensagem, 0, 2000);
    }
    return $mensagem;
}

function alfaprev_truncar(?string $valor, int $tamanho): ?string
{
    if ($valor === null || $valor === '') {
        return null;
    }
    return mb_substr($valor, 0, $tamanho);
}
