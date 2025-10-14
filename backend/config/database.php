<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'project_manager');
define('DB_USER', 'root');
define('DB_PASS', '');

// For production, use environment variables
if (getenv('DB_HOST')) {
    define('DB_HOST_PROD', getenv('DB_HOST'));
    define('DB_NAME_PROD', getenv('DB_NAME'));
    define('DB_USER_PROD', getenv('DB_USER'));
    define('DB_PASS_PROD', getenv('DB_PASS'));
}

class Database {
    private $connection;
    private static $instance = null;
    
    private function __construct() {
        $this->connect();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }
    
    private function connect() {
        try {
            // Use production settings if available
            $host = defined('DB_HOST_PROD') ? DB_HOST_PROD : DB_HOST;
            $dbname = defined('DB_NAME_PROD') ? DB_NAME_PROD : DB_NAME;
            $username = defined('DB_USER_PROD') ? DB_USER_PROD : DB_USER;
            $password = defined('DB_PASS_PROD') ? DB_PASS_PROD : DB_PASS;
            
            $this->connection = new PDO(
                "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Database connection failed']);
            exit();
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        return $this->connection->commit();
    }
    
    public function rollback() {
        return $this->connection->rollback();
    }
}
?>