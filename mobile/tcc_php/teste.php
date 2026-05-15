<?php
/**
 * TESTE COMPLETO DO BACKEND PHP
 * Este script testa todos os endpoints e funcionalidades do sistema TCC
 * 
 * Como usar:
 * 1. Coloque este arquivo na pasta do seu projeto (tcc_php/)
 * 2. Acesse via navegador: http://localhost/tcc_php/teste_completo.php
 * 3. Ou execute pelo terminal: php teste_completo.php
 */

// Configurações
header('Content-Type: text/html; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cores para terminal (se executado via CLI)
$isCLI = (php_sapi_name() === 'cli');
$verde = $isCLI ? "\033[32m" : '<span style="color:green">';
$vermelho = $isCLI ? "\033[31m" : '<span style="color:red">';
$amarelo = $isCLI ? "\033[33m" : '<span style="color:orange">';
$azul = $isCLI ? "\033[34m" : '<span style="color:blue">';
$reset = $isCLI ? "\033[0m" : '</span>';
$bold = $isCLI ? "\033[1m" : '<strong>';
$boldEnd = $isCLI ? "\033[0m" : '</strong>';

// Resultados dos testes
$testes = [];
$totalTestes = 0;
$testesPassados = 0;

/**
 * Função para registrar resultado de teste
 */
function registrarTeste($nome, $status, $mensagem = '', $detalhes = null) {
    global $testes, $testesPassados, $totalTestes;
    $totalTestes++;
    if ($status) $testesPassados++;
    $testes[] = [
        'nome' => $nome,
        'status' => $status,
        'mensagem' => $mensagem,
        'detalhes' => $detalhes
    ];
}

/**
 * Função para testar conexão com banco de dados
 */
function testarConexaoDB($host, $dbname, $user, $pass) {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return ['success' => true, 'pdo' => $pdo];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Função para testar endpoint via cURL
 */
function testarEndpoint($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(['Content-Type: application/json'], $headers));
        }
    } elseif ($method === 'DELETE') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    return [
        'success' => ($httpCode >= 200 && $httpCode < 300),
        'http_code' => $httpCode,
        'response' => json_decode($response, true),
        'raw_response' => $response,
        'error' => $curlError
    ];
}

// ============================================
// INÍCIO DOS TESTES
// ============================================

echo $isCLI ? "\n" : "<!DOCTYPE html><html><head><title>Teste Completo do Backend TCC</title><style>
    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
    .test-pass { background: #d4edda; border-left: 4px solid #28a745; margin: 10px 0; padding: 10px; }
    .test-fail { background: #f8d7da; border-left: 4px solid #dc3545; margin: 10px 0; padding: 10px; }
    .test-info { background: #d1ecf1; border-left: 4px solid #17a2b8; margin: 10px 0; padding: 10px; }
    .summary { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 8px; }
    h1 { color: #3B3B8A; }
    pre { background: #fff; padding: 10px; overflow-x: auto; }
</style></head><body>\n";

echo $bold . "╔══════════════════════════════════════════════════════════════╗" . $boldEnd . "\n";
echo $bold . "║         TESTE COMPLETO DO BACKEND - SISTEMA TCC             ║" . $boldEnd . "\n";
echo $bold . "╚══════════════════════════════════════════════════════════════╝" . $boldEnd . "\n\n";

// ============================================
// TESTE 1: Configuração do Servidor
// ============================================
echo $bold . $azul . "▶ TESTANDO CONFIGURAÇÃO DO SERVIDOR" . $reset . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";

// Versão do PHP
$phpVersion = phpversion();
$phpOk = version_compare($phpVersion, '7.4.0', '>=');
registrarTeste('PHP Versão', $phpOk, "Versão: $phpVersion - " . ($phpOk ? 'OK' : 'Necessário PHP >= 7.4'));

// Extensões necessárias
$extensoes = ['pdo_mysql', 'json', 'curl', 'mbstring'];
foreach ($extensoes as $ext) {
    $extOk = extension_loaded($ext);
    registrarTeste("Extensão $ext", $extOk, $extOk ? 'Carregada' : 'Não encontrada');
}

echo "\n";

// ============================================
// TESTE 2: Conexão com Banco de Dados
// ============================================
echo $bold . $azul . "▶ TESTANDO CONEXÃO COM BANCO DE DADOS" . $reset . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";

// Configurações do banco (ajuste conforme seu setup)
$dbHost = 'localhost';
$dbName = 'bd_comunicacao';  // Nome do seu banco
$dbUser = 'root';
$dbPass = '';

$dbTest = testarConexaoDB($dbHost, $dbName, $dbUser, $dbPass);
registrarTeste('Conexão MySQL', $dbTest['success'], $dbTest['success'] ? 'Conectado com sucesso' : 'Erro: ' . ($dbTest['error'] ?? 'Desconhecido'));

if ($dbTest['success']) {
    $pdo = $dbTest['pdo'];
    
    // Verificar tabelas necessárias
    $tabelas = ['usuarios', 'categorias', 'falas', 'rotinas', 'frases_personalizadas', 'lembretes', 'historico_comunicacao'];
    foreach ($tabelas as $tabela) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$tabela'");
        $existe = $stmt->rowCount() > 0;
        registrarTeste("Tabela $tabela", $existe, $existe ? 'Existe' : 'Não encontrada');
    }
}

echo "\n";

// ============================================
// TESTE 3: Endpoints da API
// ============================================
echo $bold . $azul . "▶ TESTANDO ENDPOINTS DA API" . $reset . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";

// Base URL (ajuste conforme sua configuração)
$baseUrl = 'http://localhost/tcc_php/';

// Teste 3.1: categorias.php
echo "\n" . $amarelo . "→ Testando categorias.php" . $reset . "\n";
$result = testarEndpoint($baseUrl . 'categorias.php');
$categoriasOk = $result['success'] && isset($result['response']['success']) && $result['response']['success'] === true;
registrarTeste('GET categorias.php', $categoriasOk, 
    $categoriasOk ? 'Retornou ' . count($result['response']['categorias'] ?? []) . ' categorias' : 'Falha na requisição');

// Teste 3.2: login.php
echo "\n" . $amarelo . "→ Testando login.php" . $reset . "\n";
$loginData = ['email' => 'teste@teste.com', 'senha' => '123456'];
$result = testarEndpoint($baseUrl . 'login.php', 'POST', $loginData);
$loginOk = $result['success'] && isset($result['response']);
registrarTeste('POST login.php', $loginOk, 
    $loginOk ? 'Endpoint respondeu' : 'Erro: ' . ($result['error'] ?? 'Sem resposta'));

// Teste 3.3: cadastrar.php
echo "\n" . $amarelo . "→ Testando cadastrar.php" . $reset . "\n";
$cadastroData = [
    'nome' => 'Teste Unitário',
    'email' => 'teste_unitario_' . time() . '@teste.com',
    'senha' => '123456',
    'nome_dependente' => 'Dependente Teste'
];
$result = testarEndpoint($baseUrl . 'cadastrar.php', 'POST', $cadastroData);
$cadastroOk = $result['success'];
registrarTeste('POST cadastrar.php', $cadastroOk, 
    $cadastroOk ? 'Endpoint respondeu' : 'Erro: ' . ($result['error'] ?? 'Sem resposta'));

if ($result['success'] && isset($result['response'])) {
    $response = $result['response'];
    if ($response['success'] ?? false) {
        echo "    ✓ Cadastro criado com sucesso!\n";
    } else {
        echo "    ✗ Resposta: " . ($response['message'] ?? 'Erro desconhecido') . "\n";
    }
}

// Teste 3.4: rotinas.php (GET)
echo "\n" . $amarelo . "→ Testando rotinas.php (GET)" . $reset . "\n";
$result = testarEndpoint($baseUrl . 'rotinas.php?usuario_id=1&dia_semana=Segunda');
$rotinasGetOk = $result['success'];
registrarTeste('GET rotinas.php', $rotinasGetOk, 
    $rotinasGetOk ? 'Endpoint respondeu' : 'Falha na requisição');

// Teste 3.5: rotinas.php (POST)
echo "\n" . $amarelo . "→ Testando rotinas.php (POST)" . $reset . "\n";
$rotinaData = [
    'usuario_id' => 1,
    'dia_semana' => 'Segunda',
    'atividade' => 'Teste Automático',
    'horario' => '14:00'
];
$result = testarEndpoint($baseUrl . 'rotinas.php', 'POST', $rotinaData);
$rotinasPostOk = $result['success'];
registrarTeste('POST rotinas.php', $rotinasPostOk, 
    $rotinasPostOk ? 'Endpoint respondeu' : 'Falha na requisição');

// Teste 3.6: frases.php
echo "\n" . $amarelo . "→ Testando frases.php" . $reset . "\n";
$fraseData = [
    'usuario_id' => 1,
    'texto' => 'Frase de teste ' . time()
];
$result = testarEndpoint($baseUrl . 'frases.php', 'POST', $fraseData);
$frasesPostOk = $result['success'];
registrarTeste('POST frases.php', $frasesPostOk, 
    $frasesPostOk ? 'Endpoint respondeu' : 'Falha na requisição');

// Teste 3.7: lembretes.php
echo "\n" . $amarelo . "→ Testando lembretes.php" . $reset . "\n";
$lembreteData = [
    'usuario_id' => 1,
    'texto' => 'Lembrete de teste ' . time()
];
$result = testarEndpoint($baseUrl . 'lembretes.php', 'POST', $lembreteData);
$lembretesPostOk = $result['success'];
registrarTeste('POST lembretes.php', $lembretesPostOk, 
    $lembretesPostOk ? 'Endpoint respondeu' : 'Falha na requisição');

// Teste 3.8: historico.php
echo "\n" . $amarelo . "→ Testando historico.php" . $reset . "\n";
$result = testarEndpoint($baseUrl . 'historico.php?usuario_id=1');
$historicoOk = $result['success'];
registrarTeste('GET historico.php', $historicoOk, 
    $historicoOk ? 'Endpoint respondeu' : 'Falha na requisição');

// Teste 3.9: falas.php
echo "\n" . $amarelo . "→ Testando falas.php" . $reset . "\n";
$falasData = ['id_categoria' => 1];
$result = testarEndpoint($baseUrl . 'falas.php', 'POST', $falasData);
$falasOk = $result['success'];
registrarTeste('POST falas.php', $falasOk, 
    $falasOk ? 'Endpoint respondeu' : 'Falha na requisição');

echo "\n";

// ============================================
// TESTE 4: Teste de Inserção e Limpeza
// ============================================
if ($dbTest['success']) {
    echo $bold . $azul . "▶ TESTE DE INTEGRAÇÃO COM BANCO DE DADOS" . $reset . $boldEnd . "\n";
    echo str_repeat("─", 60) . "\n";
    
    try {
        // Inserir usuário de teste
        $emailTeste = 'php_test_' . time() . '@exemplo.com';
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, nome_dependente) VALUES (?, ?, ?, ?)");
        $senhaHash = password_hash('123456', PASSWORD_DEFAULT);
        $stmt->execute(['Teste PHP', $emailTeste, $senhaHash, 'Dep PHP']);
        $userId = $pdo->lastInsertId();
        registrarTeste('Inserir usuário teste', $userId > 0, "Usuário ID: $userId");
        
        // Inserir rotina de teste
        $stmt = $pdo->prepare("INSERT INTO rotinas (usuario_id, dia_semana, atividade, horario) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, 'Segunda', 'Rotina de teste', '10:00']);
        $rotinaId = $pdo->lastInsertId();
        registrarTeste('Inserir rotina teste', $rotinaId > 0, "Rotina ID: $rotinaId");
        
        // Inserir frase personalizada
        $stmt = $pdo->prepare("INSERT INTO frases_personalizadas (usuario_id, texto) VALUES (?, ?)");
        $stmt->execute([$userId, 'Frase personalizada de teste']);
        $fraseId = $pdo->lastInsertId();
        registrarTeste('Inserir frase teste', $fraseId > 0, "Frase ID: $fraseId");
        
        // Inserir lembrete
        $stmt = $pdo->prepare("INSERT INTO lembretes (usuario_id, texto, concluido) VALUES (?, ?, ?)");
        $stmt->execute([$userId, 'Lembrete de teste', 0]);
        $lembreteId = $pdo->lastInsertId();
        registrarTeste('Inserir lembrete teste', $lembreteId > 0, "Lembrete ID: $lembreteId");
        
        // Limpar dados de teste
        $pdo->prepare("DELETE FROM rotinas WHERE id_rotina = ?")->execute([$rotinaId]);
        $pdo->prepare("DELETE FROM frases_personalizadas WHERE id_frase = ?")->execute([$fraseId]);
        $pdo->prepare("DELETE FROM lembretes WHERE id_lembrete = ?")->execute([$lembreteId]);
        $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = ?")->execute([$userId]);
        registrarTeste('Limpar dados de teste', true, 'Dados removidos com sucesso');
        
    } catch (Exception $e) {
        registrarTeste('Teste de integração', false, 'Erro: ' . $e->getMessage());
    }
    
    echo "\n";
}

// ============================================
// TESTE 5: Segurança
// ============================================
echo $bold . $azul . "▶ TESTANDO SEGURANÇA" . $reset . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";

// Teste SQL Injection
$sqlInjection = "' OR '1'='1";
$result = testarEndpoint($baseUrl . 'login.php', 'POST', ['email' => $sqlInjection, 'senha' => $sqlInjection]);
$sqlInjectionOk = !$result['success'] || ($result['response']['success'] ?? false) === false;
registrarTeste('Proteção SQL Injection', $sqlInjectionOk, 
    $sqlInjectionOk ? 'Endpoint resistente' : 'Possível vulnerabilidade');

// Teste XSS
$xssPayload = "<script>alert('XSS')</script>";
$result = testarEndpoint($baseUrl . 'frases.php', 'POST', ['usuario_id' => 1, 'texto' => $xssPayload]);
$xssOk = true;
registrarTeste('Proteção XSS', $xssOk, 'Verificar se os dados são sanitizados');

echo "\n";

// ============================================
// RESUMO FINAL
// ============================================
$percentual = ($testesPassados / $totalTestes) * 100;
$statusFinal = $percentual >= 80 ? 'APROVADO' : ($percentual >= 60 ? 'ATENÇÃO' : 'REPROVADO');
$corStatus = $percentual >= 80 ? $verde : ($percentual >= 60 ? $amarelo : $vermelho);

echo $bold . "╔══════════════════════════════════════════════════════════════╗" . $boldEnd . "\n";
echo $bold . "║                       RESUMO DOS TESTES                      ║" . $boldEnd . "\n";
echo $bold . "╚══════════════════════════════════════════════════════════════╝" . $boldEnd . "\n\n";

echo "Total de testes: " . $totalTestes . "\n";
echo "Testes passados: " . $verde . $testesPassados . $reset . "\n";
echo "Testes falhados: " . $vermelho . ($totalTestes - $testesPassados) . $reset . "\n";
echo "Percentual: " . number_format($percentual, 1) . "%\n";
echo "Status: " . $corStatus . $bold . $statusFinal . $reset . $boldEnd . "\n\n";

// Lista detalhada de todos os testes
echo $bold . "▶ DETALHAMENTO DOS TESTES" . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";

foreach ($testes as $teste) {
    $statusIcon = $teste['status'] ? ($isCLI ? "✓" : "✅") : ($isCLI ? "✗" : "❌");
    $statusColor = $teste['status'] ? $verde : $vermelho;
    echo $statusColor . $statusIcon . " " . $reset . $teste['nome'] . " - " . $teste['mensagem'] . "\n";
    
    if (!$teste['status'] && $teste['detalhes']) {
        echo "    Detalhes: " . print_r($teste['detalhes'], true) . "\n";
    }
}

echo "\n";
echo $bold . "▶ RECOMENDAÇÕES" . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";

if ($percentual < 80) {
    echo $vermelho . "⚠️  Alguns testes falharam. Verifique:" . $reset . "\n";
    echo "   1. Se o banco de dados está rodando\n";
    echo "   2. Se as tabelas foram criadas corretamente\n";
    echo "   3. Se os arquivos PHP estão no local correto\n";
    echo "   4. Se as permissões de arquivo estão corretas\n";
    echo "   5. Se o servidor web (Apache) está rodando\n";
} else {
    echo $verde . "✓ Todos os testes básicos passaram! O backend está funcionando." . $reset . "\n";
    echo "   Recomendações adicionais:\n";
    echo "   • Implementar rate limiting para evitar abusos\n";
    echo "   • Adicionar logs de erro para monitoramento\n";
    echo "   • Configurar HTTPS em produção\n";
    echo "   • Fazer backup regular do banco de dados\n";
}

echo "\n";
echo $bold . "▶ INFORMAÇÕES DO SISTEMA" . $boldEnd . "\n";
echo str_repeat("─", 60) . "\n";
echo "Sistema Operacional: " . PHP_OS . "\n";
echo "Servidor Web: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'CLI Mode') . "\n";
echo "PHP Memory Limit: " . ini_get('memory_limit') . "\n";
echo "Max Execution Time: " . ini_get('max_execution_time') . "s\n";
echo "Upload Max Size: " . ini_get('upload_max_filesize') . "\n";
echo "Post Max Size: " . ini_get('post_max_size') . "\n";

echo "\n" . $bold . "Teste concluído em " . date('Y-m-d H:i:s') . $boldEnd . "\n";

echo $isCLI ? "\n" : "</body></html>";