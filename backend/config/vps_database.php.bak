<?php
// VPS MySQL Database Connection Configuration

$vps_host = getenv('VPS_DB_HOST') ?: 'localhost';
$vps_dbname = getenv('VPS_DB_NAME') ?: 'projectmanager';
$vps_user = getenv('VPS_DB_USER') ?: 'root';
$vps_pass = getenv('VPS_DB_PASS') ?: '';

try {
    $vps_db = new PDO(
        "mysql:host=$vps_host;dbname=$vps_dbname;charset=utf8mb4",
        $vps_user,
        $vps_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

return $vps_db;
