<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $vps_db = require_once __DIR__ . '/config/vps_database.php';
    
    $stmt = $vps_db->query("SELECT 1 as test, DATABASE() as db_name");
    $result = $stmt->fetch();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'VPS backend is working!',
        'database_connected' => true,
        'database_name' => $result['db_name'],
        'test_query' => $result['test']
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Connection failed',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
