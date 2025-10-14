<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/auth.php';
require_once '../utils/response.php';
require_once '../utils/validator.php';

class LinksController {
    private $db;
    private $auth;
    private $userId;
    
    public function __construct() {
        $this->db = Database::getInstance();
        $this->auth = new AuthManager();
        $this->userId = $this->auth->authenticate();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        try {
            switch ($method) {
                case 'GET':
                    if (count($pathParts) === 3) {
                        $this->getProjectLinks($pathParts[2]);
                    } else {
                        $this->getLink($pathParts[3]);
                    }
                    break;
                case 'POST':
                    $this->createLink($pathParts[2]);
                    break;
                case 'PUT':
                    $this->updateLink($pathParts[3]);
                    break;
                case 'DELETE':
                    $this->deleteLink($pathParts[3]);
                    break;
                default:
                    ResponseHandler::error("Method not allowed", 405);
            }
        } catch (Exception $e) {
            error_log("Links API Error: " . $e->getMessage());
            ResponseHandler::serverError("An error occurred while processing your request");
        }
    }
    
    private function getProjectLinks($projectId) {
        if (!$this->verifyProjectOwnership($projectId)) {
            ResponseHandler::notFound("Project not found");
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM links WHERE project_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$projectId]);
        $links = $stmt->fetchAll();
        
        ResponseHandler::success($links);
    }
    
    private function getLink($linkId) {
        if (!$this->verifyLinkOwnership($linkId)) {
            ResponseHandler::notFound("Link not found");
        }
        
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM links WHERE id = ?");
        $stmt->execute([$linkId]);
        $link = $stmt->fetch();
        
        if (!$link) {
            ResponseHandler::notFound("Link not found");
        }
        
        ResponseHandler::success($link);
    }
    
    private function createLink($projectId) {
        if (!$this->verifyProjectOwnership($projectId)) {
            ResponseHandler::notFound("Project not found");
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'title' => ['required', 'max' => 255],
            'url' => ['required', 'url'],
            'username' => ['max' => 255],
            'password' => ['max' => 255],
            'description' => ['max' => 1000]
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO links (project_id, title, url, username, password, description) VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        $success = $stmt->execute([
            $projectId,
            $input['title'],
            $input['url'],
            $input['username'] ?? null,
            $input['password'] ?? null,
            $input['description'] ?? null
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to create link");
        }
        
        $linkId = $this->db->getConnection()->lastInsertId();
        $this->getLink($linkId);
    }
    
    private function updateLink($linkId) {
        if (!$this->verifyLinkOwnership($linkId)) {
            ResponseHandler::notFound("Link not found");
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'title' => ['required', 'max' => 255],
            'url' => ['required', 'url'],
            'username' => ['max' => 255],
            'password' => ['max' => 255],
            'description' => ['max' => 1000]
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "UPDATE links SET title = ?, url = ?, username = ?, password = ?, description = ? WHERE id = ?"
        );
        
        $success = $stmt->execute([
            $input['title'],
            $input['url'],
            $input['username'] ?? null,
            $input['password'] ?? null,
            $input['description'] ?? null,
            $linkId
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to update link");
        }
        
        $this->getLink($linkId);
    }
    
    private function deleteLink($linkId) {
        if (!$this->verifyLinkOwnership($linkId)) {
            ResponseHandler::notFound("Link not found");
        }
        
        $stmt = $this->db->getConnection()->prepare("DELETE FROM links WHERE id = ?");
        
        if (!$stmt->execute([$linkId])) {
            ResponseHandler::serverError("Failed to delete link");
        }
        
        ResponseHandler::success(null, "Link deleted successfully");
    }
    
    private function verifyProjectOwnership($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id FROM projects WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$projectId, $this->userId]);
        return $stmt->fetch() !== false;
    }
    
    private function verifyLinkOwnership($linkId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT l.id FROM links l 
             JOIN projects p ON l.project_id = p.id 
             WHERE l.id = ? AND p.user_id = ?"
        );
        $stmt->execute([$linkId, $this->userId]);
        return $stmt->fetch() !== false;
    }
}

$links = new LinksController();
$links->handleRequest();
?>