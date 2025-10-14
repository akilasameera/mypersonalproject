<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/auth.php';
require_once '../utils/response.php';
require_once '../utils/validator.php';

class ProjectController {
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
                    if (count($pathParts) === 2) {
                        $this->getAllProjects();
                    } else {
                        $this->getProject($pathParts[2]);
                    }
                    break;
                case 'POST':
                    $this->createProject();
                    break;
                case 'PUT':
                    $this->updateProject($pathParts[2]);
                    break;
                case 'DELETE':
                    $this->deleteProject($pathParts[2]);
                    break;
                default:
                    ResponseHandler::error("Method not allowed", 405);
            }
        } catch (Exception $e) {
            error_log("Projects API Error: " . $e->getMessage());
            ResponseHandler::serverError("An error occurred while processing your request");
        }
    }
    
    private function getAllProjects() {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$this->userId]);
        $projects = $stmt->fetchAll();
        
        // Get related data for each project
        foreach ($projects as &$project) {
            $project['notes'] = $this->getProjectNotes($project['id']);
            $project['links'] = $this->getProjectLinks($project['id']);
            $project['todos'] = $this->getProjectTodos($project['id']);
        }
        
        ResponseHandler::success($projects);
    }
    
    private function getProject($projectId) {
        if (!$this->verifyProjectOwnership($projectId)) {
            ResponseHandler::notFound("Project not found");
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM projects WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$projectId, $this->userId]);
        $project = $stmt->fetch();
        
        if (!$project) {
            ResponseHandler::notFound("Project not found");
        }
        
        $project['notes'] = $this->getProjectNotes($projectId);
        $project['links'] = $this->getProjectLinks($projectId);
        $project['todos'] = $this->getProjectTodos($projectId);
        
        ResponseHandler::success($project);
    }
    
    private function createProject() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'title' => ['required', 'max' => 255],
            'description' => ['max' => 1000],
            'color' => ['max' => 7],
            'due_date' => ['date']
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO projects (user_id, title, description, color, due_date) VALUES (?, ?, ?, ?, ?)"
        );
        
        $success = $stmt->execute([
            $this->userId,
            $input['title'],
            $input['description'] ?? '',
            $input['color'] ?? '#3B82F6',
            $input['due_date'] ?? null
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to create project");
        }
        
        $projectId = $this->db->getConnection()->lastInsertId();
        $this->getProject($projectId);
    }
    
    private function updateProject($projectId) {
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
            'description' => ['max' => 1000],
            'color' => ['max' => 7],
            'due_date' => ['date']
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "UPDATE projects SET title = ?, description = ?, color = ?, due_date = ? WHERE id = ? AND user_id = ?"
        );
        
        $success = $stmt->execute([
            $input['title'],
            $input['description'] ?? '',
            $input['color'] ?? '#3B82F6',
            $input['due_date'] ?? null,
            $projectId,
            $this->userId
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to update project");
        }
        
        $this->getProject($projectId);
    }
    
    private function deleteProject($projectId) {
        if (!$this->verifyProjectOwnership($projectId)) {
            ResponseHandler::notFound("Project not found");
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "DELETE FROM projects WHERE id = ? AND user_id = ?"
        );
        
        if (!$stmt->execute([$projectId, $this->userId])) {
            ResponseHandler::serverError("Failed to delete project");
        }
        
        ResponseHandler::success(null, "Project deleted successfully");
    }
    
    private function getProjectNotes($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT n.*, 
             (SELECT COUNT(*) FROM attachments WHERE note_id = n.id) as attachment_count
             FROM notes n WHERE project_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$projectId]);
        $notes = $stmt->fetchAll();
        
        // Get attachments for each note
        foreach ($notes as &$note) {
            $note['attachments'] = $this->getNoteAttachments($note['id']);
        }
        
        return $notes;
    }
    
    private function getNoteAttachments($noteId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id, name, original_name, file_size, mime_type, created_at FROM attachments WHERE note_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$noteId]);
        return $stmt->fetchAll();
    }
    
    private function getProjectLinks($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM links WHERE project_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$projectId]);
        return $stmt->fetchAll();
    }
    
    private function getProjectTodos($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM todos WHERE project_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$projectId]);
        return $stmt->fetchAll();
    }
    
    private function verifyProjectOwnership($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id FROM projects WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$projectId, $this->userId]);
        return $stmt->fetch() !== false;
    }
}

$projects = new ProjectController();
$projects->handleRequest();
?>