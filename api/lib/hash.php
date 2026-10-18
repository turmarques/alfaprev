<?php
/**
 * ALFA PREV — api/lib/hash.php
 *
 * Equivalente PHP de _sal_do_dia()/_hash_visitante() do antigo
 * supabase-schema.sql (ver database/schema.mysql.sql para o schema atual).
 * Em nenhum momento o IP ou o User-Agent são persistidos em qualquer
 * tabela — só entram na composição do hash.
 */
declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * IP do visitante. Hospedagem Locaweb compartilhada atende a requisição
 * diretamente (sem proxy/CDN confirmado) — por isso usa-se REMOTE_ADDR,
 * que não pode ser forjado pelo cliente. Se no futuro um proxy confiável
 * (ex: Cloudflare) for colocado na frente do site, revisar este helper
 * para usar o header correto, nunca X-Forwarded-For sem validar a origem.
 */
function alfaprev_ip_cliente(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '';
}

/**
 * Retorna (criando se preciso) o sal aleatório do dia atual, no fuso
 * America/Sao_Paulo — mesma regra do antigo _sal_do_dia() em PL/pgSQL.
 */
function alfaprev_sal_do_dia(PDO $pdo): string
{
    $hoje = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
    $dia = $hoje->format('Y-m-d');

    $busca = $pdo->prepare('SELECT sal FROM sais_diarios WHERE dia = :dia');
    $busca->execute(['dia' => $dia]);
    $sal = $busca->fetchColumn();

    if ($sal !== false && $sal !== null) {
        return (string) $sal;
    }

    $novoSal = bin2hex(random_bytes(32));
    $inserir = $pdo->prepare('INSERT INTO sais_diarios (dia, sal) VALUES (:dia, :sal) ON DUPLICATE KEY UPDATE sal = sal');
    $inserir->execute(['dia' => $dia, 'sal' => $novoSal]);

    $busca->execute(['dia' => $dia]);
    $sal = $busca->fetchColumn();

    return $sal !== false ? (string) $sal : $novoSal;
}

/**
 * Hash diário não reversível do visitante (IP + User-Agent + sessao_id +
 * sal do dia). Usado em leads.visitante_hash / eventos.visitante_hash,
 * exatamente como antes no Postgres.
 */
function alfaprev_hash_visitante(PDO $pdo, ?string $sessaoId): string
{
    $sal = alfaprev_sal_do_dia($pdo);
    $ip = alfaprev_ip_cliente();
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

    $base = $ip . '|' . $ua . '|' . ($sessaoId ?? '');
    return hash('sha256', $base . $sal);
}

/**
 * Hash do IP para controle de tentativas de login (tentativas_login.identificador_hash).
 * Usa o sal fixo de config.local.php + o sal do dia, para não reaproveitar
 * o mesmo hash de visitante_hash em outro contexto.
 */
function alfaprev_hash_login(PDO $pdo): string
{
    $sal = alfaprev_sal_do_dia($pdo);
    $salFixo = alfaprev_config()['sal_fixo'];
    $ip = alfaprev_ip_cliente();

    return hash('sha256', $ip . '|' . $salFixo . '|' . $sal);
}
