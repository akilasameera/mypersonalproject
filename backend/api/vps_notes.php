<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/supabase_auth.php';
$vps_db = require_once __DIR__ . '/../config/vps_database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $stmt = $vps_db->prepare("
                    SELECT * FROM notes
                    WHERE id = ? AND user_id = ?
                ");
                $stmt->execute([$_GET['id'], $user_id]);
                $result = $stmt->fetch();

                if (!$result) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Note not found']);
                    exit;
                }

                echo json_encode($result);
            } elseif (isset($_GET['project_id'])) {
                $stmt = $vps_db->prepare("
                    SELECT * FROM notes
                    WHERE project_id = ? AND user_id = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$_GET['project_id'], $user_id]);
                echo json_encode($stmt->fetchAll());
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required parameters']);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['project_id'], $data['title'], $data['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            $id = $data['id'] ?? generateUUID();

            $stmt = $vps_db->prepare("
                INSERT INTO notes (id, project_id, user_id, title, content, due_date, status_category, status_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $id,
                $data['project_id'],
                $user_id,
                $data['title'],
                $data['content'],
                $data['due_date'] ?? null,
                $data['status_category'] ?? 'general',
                $data['status_type'] ?? null
            ]);

            echo json_encode(['id' => $id, 'message' => 'Note created successfully']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing note ID']);
                exit;
            }

            $fields = [];
            $values = [];

            $allowed_fields = ['title', 'content', 'due_date', 'status_category', 'status_type'];
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $data['id'];
            $values[] = $user_id;

            $stmt = $vps_db->prepare("
                UPDATE notes
                SET " . implode(', ', $fields) . "
                WHERE id = ? AND user_id = ?
            ");

            $stmt->execute($values);
            echo json_encode(['message' => 'Note updated successfully']);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing note ID']);
                exit;
            }

            $stmt = $vps_db->prepare("DELETE FROM notes WHERE id = ? AND user_id = ?");
            $stmt->execute([$data['id'], $user_id]);

            echo json_encode(['message' => 'Note deleted successfully']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
