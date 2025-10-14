<?php
require_once __DIR__ . '/../config/database.php';

class AuthManager {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function authenticate() {
        $headers = $this->getAuthHeaders();
        
        if (!isset($headers['Authorization'])) {
            $this->sendError("Authorization header required", 401);
        }
        
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        if (empty($token)) {
            $this->sendError("Token required", 401);
        }
        
        $userId = $this->validateToken($token);
        
        if (!$userId) {
            $this->sendError("Invalid or expired token", 401);
        }
        
        return $userId;
    }
    
    private function getAuthHeaders() {
        $headers = [];
        
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        } else {
            // Fallback for servers that don't support getallheaders()
            foreach ($_SERVER as $name => $value) {
                if (substr($name, 0, 5) == 'HTTP_') {
                    $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
                }
            }
        }
        
        return $headers;
    }
    
    public function generateToken($userId) {
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours
        
        // Clean up expired tokens
        $this->cleanupExpiredTokens();
        
        // Insert new token
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)"
        );
        
        if ($stmt->execute([$userId, $token, $expiresAt])) {
            return $token;
        }
        
        return false;
    }
    
    private function validateToken($token) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()"
        );
        $stmt->execute([$token]);
        $session = $stmt->fetch();
        
        return $session ? $session['user_id'] : false;
    }
    
    public function revokeToken($token) {
        $stmt = $this->db->getConnection()->prepare(
            "DELETE FROM sessions WHERE token = ?"
        );
        return $stmt->execute([$token]);
    }
    
    private function cleanupExpiredTokens() {
        $stmt = $this->db->getConnection()->prepare(
            "DELETE FROM sessions WHERE expires_at <= NOW()"
        );
        $stmt->execute();
    }
    
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode(['success' => false, 'error' => $message]);
        exit();
    }
}
?>