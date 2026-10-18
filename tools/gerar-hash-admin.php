<?php
/**
 * ALFA PREV — tools/gerar-hash-admin.php
 *
 * Utilitário local de administração do painel /leads. NUNCA se conecta a
 * nenhum banco — só gera o comando SQL para você copiar e colar na aba
 * "SQL" do phpMyAdmin. Executar SÓ localmente, via CLI:
 *
 *   php tools/gerar-hash-admin.php
 *
 * E-mail e senha são sempre digitados interativamente (nunca como
 * argumento de linha de comando, para não ficar no histórico do shell).
 * A senha nunca aparece na tela (eco desligado via stty, quando
 * disponível) e nunca é gravada em nenhum arquivo — só o hash é exibido,
 * dentro do comando SQL pronto.
 *
 * Três modos, cada um só IMPRIME um comando (nunca executa nada):
 *   1) Criar um novo admin           -> INSERT
 *   2) Trocar a senha de um admin    -> UPDATE (senha_hash)
 *   3) Zerar o 2FA de um admin       -> UPDATE (totp_secret/totp_confirmado)
 *
 * Este script não deve ser copiado para o pacote publicado na Locaweb —
 * scripts/empacotar-locaweb.js já exclui a pasta tools/ do pacote.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo 'Este script só pode ser executado via linha de comando (CLI).';
    exit(1);
}

const ALFAPREV_SENHA_MIN_CARACTERES = 12;
// E-mail público exibido no site — nunca deve ser o login do painel admin
// (ver CLAUDE.md, seção "Dados de Negócio").
const ALFAPREV_EMAIL_PUBLICO_PROIBIDO = 'contato@alfasci.com.br';

function alfaprev_ler_linha(string $prompt): string
{
    fwrite(STDOUT, $prompt);
    return trim((string) fgets(STDIN));
}

function alfaprev_ler_senha_oculta(string $prompt): string
{
    fwrite(STDOUT, $prompt);

    // Tenta desligar o eco do terminal (Linux/macOS). No Windows (sem stty),
    // a senha aparece na tela mesmo assim — nesse caso, rodar num ambiente
    // sem ninguém olhando por perto.
    $temStty = stripos(PHP_OS, 'WIN') === false && shell_exec('stty -a 2>/dev/null') !== null;
    if ($temStty) {
        shell_exec('stty -echo');
    }

    $senha = trim((string) fgets(STDIN));

    if ($temStty) {
        shell_exec('stty echo');
    }
    fwrite(STDOUT, "\n");

    if (!$temStty) {
        fwrite(STDOUT, "(Sem suporte a ocultar a digitação neste terminal — a senha pode ter ficado visível na tela.)\n");
    }

    return $senha;
}

function alfaprev_email_valido(string $email): bool
{
    return $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function alfaprev_pedir_email(string $prompt): ?string
{
    $email = alfaprev_ler_linha($prompt);

    if (!alfaprev_email_valido($email)) {
        fwrite(STDERR, "E-mail inválido — abortado.\n");
        return null;
    }

    if (strcasecmp($email, ALFAPREV_EMAIL_PUBLICO_PROIBIDO) === 0) {
        fwrite(STDERR, "Este e-mail é o endereço público do site (" . ALFAPREV_EMAIL_PUBLICO_PROIBIDO . ") — use o e-mail pessoal/direto da pessoa admin, nunca o e-mail de contato do site.\n");
        return null;
    }

    return $email;
}

/**
 * Pede a senha duas vezes (confirmação) e valida o tamanho mínimo. Retorna
 * null (e já imprime o motivo em STDERR) se alguma validação falhar.
 */
function alfaprev_pedir_senha_confirmada(): ?string
{
    $senha1 = alfaprev_ler_senha_oculta('Digite a senha (não aparece na tela): ');

    if (strlen($senha1) < ALFAPREV_SENHA_MIN_CARACTERES) {
        fwrite(STDERR, 'Senha com menos de ' . ALFAPREV_SENHA_MIN_CARACTERES . " caracteres — abortado. Use uma senha mais longa (recomendado: gerenciador de senhas).\n");
        $senha1 = str_repeat('x', strlen($senha1));
        return null;
    }

    $senha2 = alfaprev_ler_senha_oculta('Digite a senha novamente para confirmar: ');

    if (!hash_equals($senha1, $senha2)) {
        fwrite(STDERR, "As duas senhas digitadas não coincidem — abortado.\n");
        $senha1 = str_repeat('x', strlen($senha1));
        $senha2 = str_repeat('x', strlen($senha2));
        return null;
    }

    $senha2 = str_repeat('x', strlen($senha2));
    return $senha1;
}

/**
 * Escapa uma string para uso dentro de uma instrução SQL impressa no
 * terminal (uso único, para colar no phpMyAdmin). A API em si (api/*.php)
 * nunca monta SQL por concatenação — sempre usa PDO com prepared
 * statements; esta função serve só para este utilitário local.
 */
function alfaprev_escapar_sql(string $valor): string
{
    return str_replace("'", "''", $valor);
}

fwrite(STDOUT, "Alfa Prev — utilitário de administração do painel /leads\n");
fwrite(STDOUT, "Nenhuma opção aqui se conecta a um banco de dados — tudo gera só um comando\n");
fwrite(STDOUT, "SQL para você revisar e colar na aba \"SQL\" do phpMyAdmin.\n\n");
fwrite(STDOUT, "Escolha uma opção:\n");
fwrite(STDOUT, "  1) Criar um novo admin\n");
fwrite(STDOUT, "  2) Trocar a senha de um admin existente\n");
fwrite(STDOUT, "  3) Zerar o 2FA de um admin (perdeu o celular/app autenticador)\n");
fwrite(STDOUT, "  0) Sair sem fazer nada\n");
$opcao = alfaprev_ler_linha('Opção: ');
fwrite(STDOUT, "\n");

switch ($opcao) {
    case '1':
        $email = alfaprev_pedir_email('E-mail do novo admin: ');
        if ($email === null) {
            exit(1);
        }
        $senha = alfaprev_pedir_senha_confirmada();
        if ($senha === null) {
            exit(1);
        }

        $hash = password_hash($senha, PASSWORD_BCRYPT);
        $senha = str_repeat('x', strlen($senha)); // limpa a variável da memória do processo

        fwrite(STDOUT, "Comando pronto — confirme que o banco `alfasci` está selecionado no phpMyAdmin,\n");
        fwrite(STDOUT, "abra a aba \"SQL\" e cole:\n\n");
        fwrite(STDOUT, "INSERT INTO admins (email, senha_hash, totp_secret, totp_confirmado) VALUES ('"
            . alfaprev_escapar_sql($email) . "', '" . $hash . "', NULL, 0);\n\n");
        fwrite(STDOUT, "Depois de rodar: acesse /leads.html e faça o primeiro login com esse e-mail e a\n");
        fwrite(STDOUT, "senha que você digitou agora. O próprio painel vai pedir o cadastro do 2FA (TOTP).\n");
        break;

    case '2':
        $email = alfaprev_pedir_email('E-mail do admin que vai trocar a senha: ');
        if ($email === null) {
            exit(1);
        }
        $senha = alfaprev_pedir_senha_confirmada();
        if ($senha === null) {
            exit(1);
        }

        $hash = password_hash($senha, PASSWORD_BCRYPT);
        $senha = str_repeat('x', strlen($senha));

        fwrite(STDOUT, "Comando pronto — confirme que o banco `alfasci` está selecionado no phpMyAdmin,\n");
        fwrite(STDOUT, "abra a aba \"SQL\" e cole:\n\n");
        fwrite(STDOUT, "UPDATE admins SET senha_hash = '" . $hash . "' WHERE email = '"
            . alfaprev_escapar_sql($email) . "';\n\n");
        fwrite(STDOUT, "Depois de rodar, confira no phpMyAdmin que a mensagem indica \"1 linha afetada\"\n");
        fwrite(STDOUT, "(0 linhas significa que esse e-mail não existe na tabela admins — confira o\n");
        fwrite(STDOUT, "e-mail digitado). O 2FA não é afetado por esta troca de senha.\n");
        break;

    case '3':
        $email = alfaprev_pedir_email('E-mail do admin que vai zerar o 2FA: ');
        if ($email === null) {
            exit(1);
        }

        fwrite(STDOUT, "Comando pronto — confirme que o banco `alfasci` está selecionado no phpMyAdmin,\n");
        fwrite(STDOUT, "abra a aba \"SQL\" e cole:\n\n");
        fwrite(STDOUT, "UPDATE admins SET totp_secret = NULL, totp_confirmado = 0 WHERE email = '"
            . alfaprev_escapar_sql($email) . "';\n\n");
        fwrite(STDOUT, "Depois de rodar, confira \"1 linha afetada\" no phpMyAdmin. No próximo login desse\n");
        fwrite(STDOUT, "e-mail, o painel vai pedir o cadastro de um novo fator TOTP, como no primeiro acesso.\n");
        break;

    case '0':
    case '':
        fwrite(STDOUT, "Nada feito.\n");
        exit(0);

    default:
        fwrite(STDERR, "Opção inválida — abortado.\n");
        exit(1);
}
