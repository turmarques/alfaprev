<?php
/**
 * ALFA PREV — api/config.example.php
 *
 * Modelo de configuração. NUNCA preencha valores reais aqui — copie este
 * arquivo para api/config.local.php (já listado em .gitignore) e preencha
 * os placeholders lá. api/config.php lê config.local.php automaticamente.
 *
 * Dados reais (host, porta, nome do banco, usuário, senha) só existem no
 * painel da Locaweb (Hospedagem Compartilhada I) — confirmar lá antes de
 * publicar.
 */

return [
    // Conexão MySQL (confirmar host/porta exatos no painel Locaweb — nunca assumir "localhost").
    'db' => [
        'host'    => 'SUBSTITUIR_HOST_MYSQL',
        'port'    => 3306,
        'dbname'  => 'SUBSTITUIR_NOME_BANCO',
        'user'    => 'SUBSTITUIR_USUARIO_MYSQL',
        'password'=> 'SUBSTITUIR_SENHA_MYSQL',
        'charset' => 'utf8mb4',
    ],

    // Sal fixo adicional (além do sal diário em sais_diarios) usado para
    // compor o hash de IP em tentativas de login e o hash de visitante.
    // Gerar um valor aleatório longo uma única vez (ex: bin2hex(random_bytes(32))
    // no console PHP) e nunca reaproveitar de outro projeto.
    'sal_fixo' => 'SUBSTITUIR_SAL_ALEATORIO_LONGO',

    // Hash da senha do(s) admin(s) é gerado por tools/gerar-hash-admin.php e
    // inserido diretamente na tabela `admins` via phpMyAdmin — não fica
    // nesta config. Este arquivo não guarda nenhuma credencial de admin.

    // Janela de inatividade da sessão admin, em segundos (equivalente ao
    // INATIVIDADE_MS de assets/js/leads/auth.js — mantenha os dois em sincronia).
    'sessao_inatividade_segundos' => 1800,
];
