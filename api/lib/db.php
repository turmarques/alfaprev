<?php
/**
 * ALFA PREV — api/lib/db.php
 *
 * Conexão PDO única (singleton por requisição) com MySQL. Prepared
 * statements sempre com EMULATE_PREPARES desligado (prepare real do
 * driver, não emulado em string pelo PHP).
 */
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

function alfaprev_db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $cfg = alfaprev_config()['db'];

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $cfg['host'],
            (int) ($cfg['port'] ?? 3306),
            $cfg['dbname'],
            $cfg['charset'] ?? 'utf8mb4'
        );

        try {
            $pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            error_log('alfaprev: falha ao conectar no MySQL: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['ok' => false, 'erro' => 'banco_indisponivel']);
            exit;
        }
    }

    return $pdo;
}
