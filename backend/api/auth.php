<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/auth.php';
require_once '../utils/response.php';
require_once '../utils/validator.php';

class AuthController {
    private $db;
    private $auth;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new AuthManager();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        try {
            switch ($method) {
                case 'POST':
                    if (strpos($path, '/login') !== false) {
                        $this->login();
                    } elseif (strpos($path, '/register') !== false) {
                        $this->register();
                    } elseif (strpos($path, '/logout') !== false) {
                        $this->logout();
                    } else {
                        ResponseHandler::notFound("Endpoint not found");
                    }
                    break;
                case 'GET':
                    if (strpos($path, '/me') !== false) {
                        $this->getCurrentUser();
                    } else {
                        ResponseHandler::notFound("Endpoint not found");
                    }
                    break;
                default:
                    ResponseHandler::error("Method not allowed", 405);
            }
        } catch (Exception $e) {
            error_log("Auth API Error: " . $e->getMessage());
            ResponseHandler::serverError("An error occurred while processing your request");
        }
    }
    
    private function login() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'email' => ['required', 'email'],
            'password' => ['required']
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        // Find user
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id, name, email, password FROM users WHERE email = ?"
        );
        $stmt->execute([$input['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !$this->auth->verifyPassword($input['password'], $user['password'])) {
            ResponseHandler::error("Invalid email or password", 401);
        }
        
        // Generate token
        $token = $this->auth->generateToken($user['id']);
        
        if (!$token) {
            ResponseHandler::serverError("Failed to generate authentication token");
        }
        
        // Update last login
        $stmt = $this->db->getConnection()->prepare(
            "UPDATE users SET last_login = NOW() WHERE id = ?"
        );
        $stmt->execute([$user['id']]);
        
        ResponseHandler::success([
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ],
            'token' => $token
        ], "Login successful");
    }
    
    private function register() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'name' => ['required', 'min' => 2, 'max' => 255],
            'email' => ['required', 'email'],
            'password' => ['required', 'min' => 6]
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        // Check if user already exists
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id FROM users WHERE email = ?"
        );
        $stmt->execute([$input['email']]);
        
        if ($stmt->fetch()) {
            ResponseHandler::error("User with this email already exists", 409);
        }
        
        // Create new user
        $hashedPassword = $this->auth->hashPassword($input['password']);
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
        );
        
        if (!$stmt->execute([$input['name'], $input['email'], $hashedPassword])) {
            ResponseHandler::serverError("Failed to create user account");
        }
        
        $userId = $this->db->getConnection()->lastInsertId();
        
        // Generate token
        $token = $this->auth->generateToken($userId);
        
        if (!$token) {
            ResponseHandler::serverError("Failed to generate authentication token");
        }
        
        ResponseHandler::success([
            'user' => [
                'id' => $userId,
                'name' => $input['name'],
                'email' => $input['email']
            ],
            'token' => $token
        ], "Account created successfully", 201);
    }
    
    private function logout() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $this->auth->revokeToken($token);
        }
        
        ResponseHandler::success(null, "Logged out successfully");
    }
    
    private function getCurrentUser() {
        $userId = $this->auth->authenticate();
        
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id, name, email, created_at, last_login FROM users WHERE id = ?"
        );
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            ResponseHandler::notFound("User not found");
        }
        
        ResponseHandler::success($user);
    }
}

$auth = new AuthController();
$auth->handleRequest();
?>