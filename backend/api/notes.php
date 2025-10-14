<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../utils/auth.php';
require_once '../utils/response.php';
require_once '../utils/validator.php';

class NotesController {
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
                        $this->getProjectNotes($pathParts[2]);
                    } else {
                        $this->getNote($pathParts[3]);
                    }
                    break;
                case 'POST':
                    if (strpos($path, '/upload') !== false) {
                        $this->uploadAttachment($pathParts[3]);
                    } else {
                        $this->createNote($pathParts[2]);
                    }
                    break;
                case 'PUT':
                    $this->updateNote($pathParts[3]);
                    break;
                case 'DELETE':
                    if (strpos($path, '/attachments/') !== false) {
                        $this->deleteAttachment($pathParts[5]);
                    } else {
                        $this->deleteNote($pathParts[3]);
                    }
                    break;
                default:
                    ResponseHandler::error("Method not allowed", 405);
            }
        } catch (Exception $e) {
            error_log("Notes API Error: " . $e->getMessage());
            ResponseHandler::serverError("An error occurred while processing your request");
        }
    }
    
    private function getProjectNotes($projectId) {
        if (!$this->verifyProjectOwnership($projectId)) {
            ResponseHandler::notFound("Project not found");
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "SELECT * FROM notes WHERE project_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$projectId]);
        $notes = $stmt->fetchAll();
        
        // Get attachments for each note
        foreach ($notes as &$note) {
            $note['attachments'] = $this->getNoteAttachments($note['id']);
        }
        
        ResponseHandler::success($notes);
    }
    
    private function getNote($noteId) {
        if (!$this->verifyNoteOwnership($noteId)) {
            ResponseHandler::notFound("Note not found");
        }
        
        $stmt = $this->db->getConnection()->prepare("SELECT * FROM notes WHERE id = ?");
        $stmt->execute([$noteId]);
        $note = $stmt->fetch();
        
        if (!$note) {
            ResponseHandler::notFound("Note not found");
        }
        
        $note['attachments'] = $this->getNoteAttachments($noteId);
        
        ResponseHandler::success($note);
    }
    
    private function createNote($projectId) {
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
            'content' => ['required'],
            'due_date' => ['date']
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO notes (project_id, title, content, due_date) VALUES (?, ?, ?, ?)"
        );
        
        $success = $stmt->execute([
            $projectId,
            $input['title'],
            $input['content'],
            $input['due_date'] ?? null
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to create note");
        }
        
        $noteId = $this->db->getConnection()->lastInsertId();
        $this->getNote($noteId);
    }
    
    private function updateNote($noteId) {
        if (!$this->verifyNoteOwnership($noteId)) {
            ResponseHandler::notFound("Note not found");
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            ResponseHandler::error("Invalid JSON data");
        }
        
        // Validate input
        $validator = Validator::validate($input, [
            'title' => ['required', 'max' => 255],
            'content' => ['required'],
            'due_date' => ['date']
        ]);
        
        if ($validator->hasErrors()) {
            ResponseHandler::validationError($validator->getErrors());
        }
        
        $stmt = $this->db->getConnection()->prepare(
            "UPDATE notes SET title = ?, content = ?, due_date = ? WHERE id = ?"
        );
        
        $success = $stmt->execute([
            $input['title'],
            $input['content'],
            $input['due_date'] ?? null,
            $noteId
        ]);
        
        if (!$success) {
            ResponseHandler::serverError("Failed to update note");
        }
        
        $this->getNote($noteId);
    }
    
    private function deleteNote($noteId) {
        if (!$this->verifyNoteOwnership($noteId)) {
            ResponseHandler::notFound("Note not found");
        }
        
        // Delete attachments first
        $this->deleteNoteAttachments($noteId);
        
        $stmt = $this->db->getConnection()->prepare("DELETE FROM notes WHERE id = ?");
        
        if (!$stmt->execute([$noteId])) {
            ResponseHandler::serverError("Failed to delete note");
        }
        
        ResponseHandler::success(null, "Note deleted successfully");
    }
    
    private function uploadAttachment($noteId) {
        if (!$this->verifyNoteOwnership($noteId)) {
            ResponseHandler::notFound("Note not found");
        }
        
        if (!isset($_FILES['file'])) {
            ResponseHandler::error("No file uploaded");
        }
        
        $file = $_FILES['file'];
        
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            ResponseHandler::error("File upload failed");
        }
        
        // Check file size (10MB max)
        if ($file['size'] > 10 * 1024 * 1024) {
            ResponseHandler::error("File size too large. Maximum 10MB allowed");
        }
        
        // Create uploads directory if it doesn't exist
        $uploadDir = '../uploads/attachments/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            ResponseHandler::serverError("Failed to save file");
        }
        
        // Save to database
        $stmt = $this->db->getConnection()->prepare(
            "INSERT INTO attachments (note_id, name, original_name, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        $success = $stmt->execute([
            $noteId,
            $filename,
            $file['name'],
            $filepath,
            $file['size'],
            $file['type']
        ]);
        
        if (!$success) {
            // Clean up uploaded file
            unlink($filepath);
            ResponseHandler::serverError("Failed to save attachment");
        }
        
        $attachmentId = $this->db->getConnection()->lastInsertId();
        
        // Return attachment info
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id, name, original_name, file_size, mime_type, created_at FROM attachments WHERE id = ?"
        );
        $stmt->execute([$attachmentId]);
        $attachment = $stmt->fetch();
        
        ResponseHandler::success($attachment, "File uploaded successfully", 201);
    }
    
    private function deleteAttachment($attachmentId) {
        // Verify attachment belongs to user's note
        $stmt = $this->db->getConnection()->prepare(
            "SELECT a.file_path FROM attachments a 
             JOIN notes n ON a.note_id = n.id 
             JOIN projects p ON n.project_id = p.id 
             WHERE a.id = ? AND p.user_id = ?"
        );
        $stmt->execute([$attachmentId, $this->userId]);
        $attachment = $stmt->fetch();
        
        if (!$attachment) {
            ResponseHandler::notFound("Attachment not found");
        }
        
        // Delete file from filesystem
        if (file_exists($attachment['file_path'])) {
            unlink($attachment['file_path']);
        }
        
        // Delete from database
        $stmt = $this->db->getConnection()->prepare("DELETE FROM attachments WHERE id = ?");
        
        if (!$stmt->execute([$attachmentId])) {
            ResponseHandler::serverError("Failed to delete attachment");
        }
        
        ResponseHandler::success(null, "Attachment deleted successfully");
    }
    
    private function getNoteAttachments($noteId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id, name, original_name, file_size, mime_type, created_at FROM attachments WHERE note_id = ? ORDER BY created_at DESC"
        );
        $stmt->execute([$noteId]);
        return $stmt->fetchAll();
    }
    
    private function deleteNoteAttachments($noteId) {
        // Get all attachments for the note
        $stmt = $this->db->getConnection()->prepare(
            "SELECT file_path FROM attachments WHERE note_id = ?"
        );
        $stmt->execute([$noteId]);
        $attachments = $stmt->fetchAll();
        
        // Delete files from filesystem
        foreach ($attachments as $attachment) {
            if (file_exists($attachment['file_path'])) {
                unlink($attachment['file_path']);
            }
        }
        
        // Delete from database
        $stmt = $this->db->getConnection()->prepare("DELETE FROM attachments WHERE note_id = ?");
        $stmt->execute([$noteId]);
    }
    
    private function verifyProjectOwnership($projectId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT id FROM projects WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$projectId, $this->userId]);
        return $stmt->fetch() !== false;
    }
    
    private function verifyNoteOwnership($noteId) {
        $stmt = $this->db->getConnection()->prepare(
            "SELECT n.id FROM notes n 
             JOIN projects p ON n.project_id = p.id 
             WHERE n.id = ? AND p.user_id = ?"
        );
        $stmt->execute([$noteId, $this->userId]);
        return $stmt->fetch() !== false;
    }
}

$notes = new NotesController();
$notes->handleRequest();
?>