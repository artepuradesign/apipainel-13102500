<?php
/**
 * Configurações do Admin
 */

// Habilitar CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Se for requisição OPTIONS, retornar vazio
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configurações do banco de dados
$db_config = [
    'host' => '45.151.120.2',
    'usuario' => 'u617342185_iplace',
    'senha' => 'SUA_SENHA_AQUI', // TROQUE PELA SUA SENHA
    'banco' => 'u617342185_iplace'
];

// Criar conexão
function getConnection() {
    global $db_config;
    
    $conexao = new mysqli(
        $db_config['host'],
        $db_config['usuario'],
        $db_config['senha'],
        $db_config['banco']
    );
    
    if ($conexao->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Erro na conexão com o banco de dados'
        ]);
        exit();
    }
    
    $conexao->set_charset("utf8mb4");
    return $conexao;
}

// Verificar autenticação via token
function verificarAuth() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    
    if (empty($token)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Token não fornecido'
        ]);
        exit();
    }
    
    // Remover "Bearer " do início
    $token = str_replace('Bearer ', '', $token);
    
    // Decodificar token (base64 simples para exemplo)
    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);
    
    if (count($parts) !== 2) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Token inválido'
        ]);
        exit();
    }
    
    $userId = $parts[0];
    $timestamp = $parts[1];
    
    // Verificar se o token não expirou (24 horas)
    if (time() - intval($timestamp) > 86400) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Token expirado'
        ]);
        exit();
    }
    
    // Verificar se o usuário existe e é admin
    $conexao = getConnection();
    $stmt = $conexao->prepare("SELECT id, nome, email, tipo FROM usuarios WHERE id = ? AND tipo = 'admin' AND ativo = 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Usuário não autorizado'
        ]);
        exit();
    }
    
    $usuario = $result->fetch_assoc();
    $stmt->close();
    $conexao->close();
    
    return $usuario;
}

// Resposta de sucesso
function responderSucesso($data, $mensagem = null) {
    $response = ['success' => true, 'data' => $data];
    if ($mensagem) {
        $response['message'] = $mensagem;
    }
    echo json_encode($response);
    exit();
}

// Resposta de erro
function responderErro($mensagem, $codigo = 400) {
    http_response_code($codigo);
    echo json_encode([
        'success' => false,
        'error' => $mensagem
    ]);
    exit();
}
?>
