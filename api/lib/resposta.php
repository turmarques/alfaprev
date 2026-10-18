<?php
/**
 * ALFA PREV — api/lib/resposta.php
 *
 * Helpers de resposta JSON padronizada + checagem de same-origin/método.
 * Nunca expõe mensagem de erro de banco/exceção ao cliente — só loga.
 */
declare(strict_types=1);

function alfaprev_json(array $dados, int $codigoHttp = 200): never
{
    http_response_code($codigoHttp);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($dados);
    exit;
}

function alfaprev_erro(string $codigo, int $codigoHttp = 400): never
{
    alfaprev_json(['ok' => false, 'erro' => $codigo], $codigoHttp);
}

/**
 * Garante método HTTP esperado e, para POST, Content-Type JSON.
 */
function alfaprev_exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        alfaprev_erro('metodo_nao_permitido', 405);
    }

    if ($metodo === 'POST') {
        $tipoConteudo = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($tipoConteudo, 'application/json') !== 0) {
            alfaprev_erro('content_type_invalido', 415);
        }
    }
}

/**
 * Bloqueia qualquer requisição que não seja same-origin. Como o front-end
 * nunca chama a API de outro domínio, qualquer Origin/Referer diferente do
 * próprio host é rejeitado (sem CORS aberto).
 *
 * $exigirPresenca = true (padrão, usado pelos endpoints públicos
 * lead.php/metrica.php): nega a requisição se nenhum dos dois headers
 * vier, já que é a única defesa desses endpoints (não há sessão/cookie).
 *
 * $exigirPresenca = false (usado pelos endpoints admin de leitura GET):
 * tolera a ausência de ambos os headers. src/pages/leads.html define
 * `<meta name="referrer" content="no-referrer">`, então chamadas GET
 * same-origin feitas de lá legitimamente não enviam Referer, e o header
 * Origin não é enviado pelo navegador em GET same-origin comuns — nesses
 * endpoints a defesa real contra CSRF é o cookie de sessão com
 * SameSite=Strict (nunca enviado em requisição cross-site). Se Origin/
 * Referer vierem mesmo assim e apontarem para outro host, a requisição
 * continua sendo rejeitada.
 */
function alfaprev_exigir_same_origin(bool $exigirPresenca = true): void
{
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host === '') {
        alfaprev_erro('host_invalido', 400);
    }

    $origem = $_SERVER['HTTP_ORIGIN'] ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';

    $origemHost = $origem !== '' ? (parse_url($origem, PHP_URL_HOST) ?? '') : '';
    $refererHost = $referer !== '' ? (parse_url($referer, PHP_URL_HOST) ?? '') : '';

    if ($origemHost === '' && $refererHost === '') {
        if ($exigirPresenca) {
            alfaprev_erro('origem_ausente', 403);
        }
        return;
    }

    if ($origemHost !== '' && $origemHost !== $host) {
        alfaprev_erro('origem_invalida', 403);
    }

    if ($origemHost === '' && $refererHost !== $host) {
        alfaprev_erro('origem_invalida', 403);
    }
}

/**
 * Lê e decodifica o corpo JSON da requisição. Retorna [] se vazio/invalido
 * (quem chama decide se isso é erro).
 */
function alfaprev_corpo_json(): array
{
    $bruto = file_get_contents('php://input');
    if ($bruto === false || $bruto === '') {
        return [];
    }

    $dados = json_decode($bruto, true);
    return is_array($dados) ? $dados : [];
}
