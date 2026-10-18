<?php
/**
 * ALFA PREV — api/lead.php
 *
 * Endpoint público (POST) para registrar um lead do formulário de contato.
 * Equivalente a rpc/registrar_lead do antigo Supabase. Mensagem de erro
 * sempre genérica — nunca revela qual validação falhou (evita dar dica a
 * quem estiver testando o formulário de forma abusiva).
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

// Honeypot: campo que só um bot preencheria. Responde "sucesso" sem gravar
// nada, para não indicar ao bot que foi detectado.
if (trim((string) ($corpo['armadilha'] ?? '')) !== '') {
    alfaprev_json(['ok' => true]);
}

$nome = alfaprev_validar_nome($corpo['nome'] ?? null);
$email = alfaprev_validar_email($corpo['email'] ?? null);
$telefone = alfaprev_validar_telefone($corpo['telefone'] ?? null);
$ocupacao = alfaprev_validar_ocupacao($corpo['ocupacao'] ?? null);
$mensagem = alfaprev_validar_mensagem($corpo['mensagem'] ?? null);
$consentimento = ($corpo['consentimento_lgpd'] ?? null) === true;

if ($nome === null || $email === null || $telefone === null || $ocupacao === null || !$consentimento) {
    alfaprev_erro('nao_foi_possivel_enviar', 422);
}

$pdo = alfaprev_db();
$sessaoId = alfaprev_truncar((string) ($corpo['sessao_id'] ?? ''), 100);
$hash = alfaprev_hash_visitante($pdo, $sessaoId);

if (alfaprev_limite_lead_atingido($pdo, $hash, $sessaoId)) {
    alfaprev_erro('nao_foi_possivel_enviar', 429);
}

$sql = 'INSERT INTO leads (
            created_at, nome, email, telefone, tipo_imovel, mensagem,
            consentimento_lgpd, consentimento_em, pagina_origem,
            utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid,
            sessao_id, visitante_hash, atualizado_em
        ) VALUES (
            :agora, :nome, :email, :telefone, :tipo_imovel, :mensagem,
            1, :agora2, :pagina_origem,
            :utm_source, :utm_medium, :utm_campaign, :utm_term, :utm_content, :gclid,
            :sessao_id, :visitante_hash, :agora3
        )';

try {
    $agoraUtc = alfaprev_agora_utc();
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'agora' => $agoraUtc,
        'agora2' => $agoraUtc,
        'agora3' => $agoraUtc,
        'nome' => $nome,
        'email' => $email,
        'telefone' => $telefone,
        'tipo_imovel' => $ocupacao,
        'mensagem' => $mensagem,
        'pagina_origem' => alfaprev_truncar((string) ($corpo['pagina_origem'] ?? ''), 300),
        'utm_source' => alfaprev_truncar((string) ($corpo['utm_source'] ?? ''), 150),
        'utm_medium' => alfaprev_truncar((string) ($corpo['utm_medium'] ?? ''), 150),
        'utm_campaign' => alfaprev_truncar((string) ($corpo['utm_campaign'] ?? ''), 150),
        'utm_term' => alfaprev_truncar((string) ($corpo['utm_term'] ?? ''), 150),
        'utm_content' => alfaprev_truncar((string) ($corpo['utm_content'] ?? ''), 150),
        'gclid' => alfaprev_truncar((string) ($corpo['gclid'] ?? ''), 150),
        'sessao_id' => $sessaoId,
        'visitante_hash' => $hash,
    ]);
} catch (PDOException $e) {
    error_log('alfaprev: falha ao inserir lead: ' . $e->getMessage());
    alfaprev_erro('nao_foi_possivel_enviar', 500);
}

alfaprev_json(['ok' => true]);
