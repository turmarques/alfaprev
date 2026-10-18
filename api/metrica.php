<?php
/**
 * ALFA PREV — api/metrica.php
 *
 * Endpoint público (POST) para registrar evento anônimo (page_view,
 * whatsapp_click). Equivalente a rpc/registrar_evento do antigo Supabase.
 * Nunca retorna erro visível ao cliente — ignora silenciosamente entradas
 * inválidas ou acima do limite, exatamente como antes.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/resposta.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/hash.php';
require_once __DIR__ . '/lib/validacao.php';
require_once __DIR__ . '/lib/rate_limit.php';
require_once __DIR__ . '/lib/tempo.php';

alfaprev_exigir_metodo('POST');
alfaprev_exigir_same_origin();

$corpo = alfaprev_corpo_json();
$tipo = $corpo['tipo'] ?? null;

if (!in_array($tipo, ['page_view', 'whatsapp_click'], true)) {
    alfaprev_json(['ok' => true]); // ignora silenciosamente, nunca erro visível
}

$pdo = alfaprev_db();
$sessaoId = alfaprev_truncar((string) ($corpo['sessao_id'] ?? ''), 100);
$hash = alfaprev_hash_visitante($pdo, $sessaoId);

if (alfaprev_limite_evento_atingido($pdo, $hash, $sessaoId)) {
    alfaprev_json(['ok' => true]); // rate limit silencioso
}

$caminho = (string) ($corpo['caminho'] ?? '/');
$caminho = explode('?', $caminho, 2)[0];
$caminho = alfaprev_truncar($caminho !== '' ? $caminho : '/', 300);

$dispositivo = $corpo['dispositivo'] ?? null;
if (!in_array($dispositivo, ['mobile', 'tablet', 'desktop'], true)) {
    $dispositivo = null;
}

$sql = 'INSERT INTO eventos (
            criado_em, tipo, caminho, origem,
            utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid,
            dispositivo, sessao_id, visitante_hash
        ) VALUES (
            :agora, :tipo, :caminho, :origem,
            :utm_source, :utm_medium, :utm_campaign, :utm_term, :utm_content, :gclid,
            :dispositivo, :sessao_id, :visitante_hash
        )';

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'agora' => alfaprev_agora_utc(),
        'tipo' => $tipo,
        'caminho' => $caminho,
        'origem' => alfaprev_truncar((string) ($corpo['origem'] ?? 'direto'), 150) ?? 'direto',
        'utm_source' => alfaprev_truncar((string) ($corpo['utm_source'] ?? ''), 150),
        'utm_medium' => alfaprev_truncar((string) ($corpo['utm_medium'] ?? ''), 150),
        'utm_campaign' => alfaprev_truncar((string) ($corpo['utm_campaign'] ?? ''), 150),
        'utm_term' => alfaprev_truncar((string) ($corpo['utm_term'] ?? ''), 150),
        'utm_content' => alfaprev_truncar((string) ($corpo['utm_content'] ?? ''), 150),
        'gclid' => alfaprev_truncar((string) ($corpo['gclid'] ?? ''), 150),
        'dispositivo' => $dispositivo,
        'sessao_id' => $sessaoId,
        'visitante_hash' => $hash,
    ]);
} catch (PDOException $e) {
    error_log('alfaprev: falha ao inserir evento: ' . $e->getMessage());
    // Mesmo em erro, resposta silenciosa — métricas nunca devem travar a navegação.
}

alfaprev_json(['ok' => true]);
