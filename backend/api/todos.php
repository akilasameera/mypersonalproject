<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/auth.php';
require_once '../utils/response.php';
require_once '../utils/validator.php';

class TodosController {
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
                        $this->getProjectTodos($pathParts[2]);
                    } else {
                        $this->getTodo($pathParts[3]);
                    }
                    break;
                case 'POST':
                    $this->createTodo($pathParts[2]);
                    break;
                case 'PUT':
                    $this->updateTodo($pathParts[3]);
                    break;
                case 'PATCH':
                    $this->toggleTodo($pathParts[3]);
                    break;
                case 'DELETE':
                    $this->deleteTodo($pathParts[3]);
                    break;
                default:
                    ResponseHandler::error("Method not allowed", 405);
            }
        } catch (Exception $e) {
            error_log("Todos API Error: " . $e->getMessage());
            ResponseHandler::serverError("An error occurred while processing your request");
        }
    }
    
    private function getProjectTodos($projectId) {
        if (!$this->verifyProjectOwnership($projectId)) {
            ResponseHandler::notFound("Project not found");
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM todos WHERE project_id = ? ORDER BY completed ASC, created_at DESC"
        );
        $stmt->execute([$projectId]);
        $todos = $stmt->fetchAll();
        
        ResponseHandler::success($todos);
    }
    
    private function getTodo($todoId) {
        if (!$this->verifyTodoOwnership($todoId)) {
            ResponseHandler::notFound("Todo not found");
        }
        
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM todos WHERE id = ?");
        $stmt->execute([$todoId]);
        $todo = $stmt->fetch();
        
        if (!$todo) {
            ResponseHandler::notFound("Todo not found");
        }
        
        ResponseHandler::success($todo);
    }
    
    private function createTodo($projectId) {
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
            'due_date' => ['date'],
            'priority' => ['in' => ['low', 'medium', 'high']],
            'notes' => ['max' => 2000]
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO todos (project_id, title, description, due_date, priority, notes) VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        $success = $stmt->execute([
            $projectId,
            $input['title'],
            $input['description'] ?? null,
            $input['due_date'] ?? null,
            $input['priority'] ?? 'medium',
            $input['notes'] ?? null
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to create todo");
        }
        
        $todoId = $this->db->getConnection()->lastInsertId();
        $this->getTodo($todoId);
    }
    
    private function updateTodo($todoId) {
        if (!$this->verifyTodoOwnership($todoId)) {
            ResponseHandler::notFound("Todo not found");
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'title' => ['required', 'max' => 255],
            'description' => ['max' => 1000],
            'due_date' => ['date'],
            'priority' => ['in' => ['low', 'medium', 'high']],
            'notes' => ['max' => 2000],
            'completed' => ['boolean']
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "UPDATE todos SET title = ?, description = ?, due_date = ?, priority = ?, notes = ?, completed = ? WHERE id = ?"
        );
        
        $success = $stmt->execute([
            $input['title'],
            $input['description'] ?? null,
            $input['due_date'] ?? null,
            $input['priority'] ?? 'medium',
            $input['notes'] ?? null,
            isset($input['completed']) ? (bool)$input['completed'] : false,
            $todoId
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to update todo");
        }
        
        $this->getTodo($todoId);
    }
    
    private function toggleTodo($todoId) {
        if (!$this->verifyTodoOwnership($todoId)) {
            ResponseHandler::notFound("Todo not found");
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "UPDATE todos SET completed = NOT completed WHERE id = ?"
        );
        
        if (!$stmt->execute([$todoId])) {
            ResponseHandler::serverError("Failed to toggle todo");
        }
        
        $this->getTodo($todoId);
    }
    
    private function deleteTodo($todoId) {
        if (!$this->verifyTodoOwnership($todoId)) {
            ResponseHandler::notFound("Todo not found");
        }
        
        $stmt = $this->db->getConnection()->prepare("DELETE FROM todos WHERE id = ?");
        
        if (!$stmt->execute([$todoId])) {
            ResponseHandler::serverError("Failed to delete todo");
        }
        
        ResponseHandler::success(null, "Todo deleted successfully");
    }
    
    private function verifyProjectOwnership($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id FROM projects WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$projectId, $this->userId]);
        return $stmt->fetch() !== false;
    }
    
    private function verifyTodoOwnership($todoId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT t.id FROM todos t 
             JOIN projects p ON t.project_id = p.id 
             WHERE t.id = ? AND p.user_id = ?"
        );
        $stmt->execute([$todoId, $this->userId]);
        return $stmt->fetch() !== false;
    }
}

$todos = new TodosController();
$todos->handleRequest();
?>