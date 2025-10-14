<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../utils/supabase_auth.php';
$vps_db = require_once __DIR__ . '/../config/vps_database.php';

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getUserId();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['project_id'])) {
                $stmt = $vps_db->prepare("
                    SELECT * FROM project_configurations
                    WHERE project_id = ? AND user_id = ?
                ");
                $stmt->execute([$_GET['project_id'], $user_id]);
                $result = $stmt->fetch();

                echo json_encode($result ?: null);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Missing project_id']);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['project_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            $id = $data['id'] ?? generateUUID();

            $stmt = $vps_db->prepare("
                INSERT INTO project_configurations (
                    id, project_id, user_id, is_master, brd_content,
                    business_profile_url, business_map_url,
                    business_profile_name, business_map_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    is_master = VALUES(is_master),
                    brd_content = VALUES(brd_content),
                    business_profile_url = VALUES(business_profile_url),
                    business_map_url = VALUES(business_map_url),
                    business_profile_name = VALUES(business_profile_name),
                    business_map_name = VALUES(business_map_name)
            ");

            $stmt->execute([
                $id,
                $data['project_id'],
                $user_id,
                $data['is_master'] ?? false,
                $data['brd_content'] ?? '',
                $data['business_profile_url'] ?? null,
                $data['business_map_url'] ?? null,
                $data['business_profile_name'] ?? null,
                $data['business_map_name'] ?? null
            ]);

            echo json_encode(['id' => $id, 'message' => 'Configuration saved successfully']);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['project_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing project_id']);
                exit;
            }

            $fields = [];
            $values = [];

            $allowed_fields = [
                'brd_content', 'business_profile_url', 'business_map_url',
                'business_profile_name', 'business_map_name', 'is_master'
            ];

            foreach ($allowed_fields as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No fields to update']);
                exit;
            }

            $values[] = $data['project_id'];
            $values[] = $user_id;

            $stmt = $vps_db->prepare("
                UPDATE project_configurations
                SET " . implode(', ', $fields) . "
                WHERE project_id = ? AND user_id = ?
            ");

            $stmt->execute($values);
            echo json_encode(['message' => 'Configuration updated successfully']);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['project_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing project_id']);
                exit;
            }

            $stmt = $vps_db->prepare("DELETE FROM project_configurations WHERE project_id = ? AND user_id = ?");
            $stmt->execute([$data['project_id'], $user_id]);

            echo json_encode(['message' => 'Configuration deleted successfully']);
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
