<?php
/**
 * ALFA PREV — api/lib/rate_limit.php
 *
 * Limites por visitante (visitante_hash OU sessao_id) nas tabelas leads/
 * eventos — mesma regra e mesmas colunas usadas pelas antigas funções
 * registrar_lead()/registrar_evento() do Postgres. Mais o bloqueio de
 * login (3 tentativas / 5 min) via tentativas_login.
 */
declare(strict_types=1);

require_once __DIR__ . '/tempo.php';

/**
 * true se o visitante já atingiu o limite de leads (5 por hora).
 */
function alfaprev_limite_lead_atingido(PDO $pdo, string $hash, ?string $sessaoId): bool
{
    $sql = 'SELECT COUNT(*) FROM leads
            WHERE (visitante_hash = :hash OR (:sessao_id1 IS NOT NULL AND sessao_id = :sessao_id2))
              AND created_at > :desde';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['hash' => $hash, 'sessao_id1' => $sessaoId, 'sessao_id2' => $sessaoId, 'desde' => alfaprev_utc_subtrair('1 hour')]);

    return (int) $stmt->fetchColumn() >= 5;
}

/**
 * true se o visitante já atingiu o limite de eventos (30 por minuto).
 */
function alfaprev_limite_evento_atingido(PDO $pdo, string $hash, ?string $sessaoId): bool
{
    $sql = 'SELECT COUNT(*) FROM eventos
            WHERE (visitante_hash = :hash OR (:sessao_id1 IS NOT NULL AND sessao_id = :sessao_id2))
              AND criado_em > :desde';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['hash' => $hash, 'sessao_id1' => $sessaoId, 'sessao_id2' => $sessaoId, 'desde' => alfaprev_utc_subtrair('1 minute')]);

    return (int) $stmt->fetchColumn() >= 30;
}

/**
 * true se o identificador (hash de IP) está bloqueado por tentativas de
 * login recentes: 3 ou mais tentativas sem sucesso nos últimos 5 minutos.
 */
function alfaprev_login_bloqueado(PDO $pdo, string $identificadorHash): bool
{
    $sql = 'SELECT COUNT(*) FROM tentativas_login
            WHERE identificador_hash = :hash
              AND sucesso = 0
              AND criado_em > :desde';
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['hash' => $identificadorHash, 'desde' => alfaprev_utc_subtrair('5 minutes')]);

    return (int) $stmt->fetchColumn() >= 3;
}

function alfaprev_registrar_tentativa_login(PDO $pdo, string $identificadorHash, ?string $email, bool $sucesso): void
{
    $sql = 'INSERT INTO tentativas_login (identificador_hash, email, sucesso, criado_em) VALUES (:hash, :email, :sucesso, :agora)';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'hash' => $identificadorHash,
        'email' => $email,
        'sucesso' => $sucesso ? 1 : 0,
        'agora' => alfaprev_agora_utc(),
    ]);
}

/**
 * Limpa tentativas de sucesso/falha antigas do mesmo identificador após um
 * login bem-sucedido, para não acumular histórico indefinidamente (a
 * procedure limpar_dados_antigos também cobre isso por retenção de tempo,
 * isto aqui é só uma limpeza oportunista extra).
 */
function alfaprev_limpar_tentativas_login(PDO $pdo, string $identificadorHash): void
{
    $stmt = $pdo->prepare('DELETE FROM tentativas_login WHERE identificador_hash = :hash');
    $stmt->execute(['hash' => $identificadorHash]);
}
