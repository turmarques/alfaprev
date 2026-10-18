<?php
/**
 * ALFA PREV — api/lib/tempo.php
 *
 * Helpers de tempo em UTC. A hospedagem compartilhada pode não ter o
 * fuso do servidor MySQL configurado como UTC — por isso toda escrita e
 * toda comparação de tempo usa um timestamp UTC calculado aqui em PHP e
 * passado como parâmetro, em vez de confiar em NOW()/CURRENT_TIMESTAMP do
 * MySQL (que refletem o fuso do servidor de banco, não necessariamente UTC).
 */
declare(strict_types=1);

function alfaprev_agora_utc(): string
{
    return gmdate('Y-m-d H:i:s');
}

/**
 * @param string $intervalo Ex: '1 hour', '1 minute', '5 minutes'.
 */
function alfaprev_utc_subtrair(string $intervalo): string
{
    $dt = new DateTime('now', new DateTimeZone('UTC'));
    $dt->modify('-' . $intervalo);
    return $dt->format('Y-m-d H:i:s');
}
