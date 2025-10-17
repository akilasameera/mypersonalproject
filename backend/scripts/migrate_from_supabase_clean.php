<?php
require_once __DIR__ . '/../config/vps_database.php';

$supabase_url = getenv('VITE_SUPABASE_URL');
$supabase_service_key = getenv('SUPABASE_SERVICE_ROLE_KEY');

if (!$supabase_url || !$supabase_service_key) {
    die("Error: Supabase configuration missing. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file\n");
}

echo "Starting migration from Supabase to VPS MySQL...\n\n";

$id_mapping = [];
function getOrCreateMappedId($uuid, $type) {
    global $id_mapping;
    if (!isset($id_mapping[$type])) {
        $id_mapping[$type] = [];
    }
    if (!isset($id_mapping[$type][$uuid])) {
        $id_mapping[$type][$uuid] = count($id_mapping[$type]) + 1;
    }
    return $id_mapping[$type][$uuid];
}

function fetchFromSupabase($table) {
    global $supabase_url, $supabase_service_key;
    $url = $supabase_url . '/rest/v1/' . $table . '?select=*';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabase_service_key,
        'Authorization: Bearer ' . $supabase_service_key
    ]);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($http_code !== 200) {
        echo "Error fetching from $table: HTTP $http_code\n";
        return [];
    }
    return json_decode($response, true) ?: [];
}

try {
    echo "Migrating users...\n";
    $users = fetchFromSupabase('profiles');
    if (empty($users)) {
        $users = fetchFromSupabase('users');
    }

    $sql = 'INSERT INTO users (id, email, full_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), full_name = VALUES(full_name)';
    $stmt = $vps_db->prepare($sql);

    foreach ($users as $user) {
        $user_id = getOrCreateMappedId($user['id'], 'user');
        $email = isset($user['email']) ? $user['email'] : 'user' . $user_id . '@example.com';
        $full_name = isset($user['full_name']) ? $user['full_name'] : (isset($user['name']) ? $user['name'] : 'User ' . $user_id);
        $created_at = isset($user['created_at']) ? $user['created_at'] : date('Y-m-d H:i:s');
        $updated_at = isset($user['updated_at']) ? $user['updated_at'] : date('Y-m-d H:i:s');

        $stmt->execute([$user_id, $email, $full_name, $created_at, $updated_at]);
    }
    $user_count = count($users);
    echo "Migrated $user_count users\n";

    echo "Migrating projects...\n";
    $projects = fetchFromSupabase('projects');
    $sql = 'INSERT INTO projects (id, user_id, title, description, status, priority, start_date, end_date, progress, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), status = VALUES(status), priority = VALUES(priority), start_date = VALUES(start_date), end_date = VALUES(end_date), progress = VALUES(progress), color = VALUES(color)';
    $stmt = $vps_db->prepare($sql);

    foreach ($projects as $project) {
        $project_id = getOrCreateMappedId($project['id'], 'project');
        $user_id = getOrCreateMappedId($project['user_id'], 'user');
        $stmt->execute([
            $project_id,
            $user_id,
            $project['title'],
            isset($project['description']) ? $project['description'] : '',
            isset($project['status']) ? $project['status'] : 'active',
            isset($project['priority']) ? $project['priority'] : 'medium',
            isset($project['start_date']) ? $project['start_date'] : null,
            isset($project['end_date']) ? $project['end_date'] : null,
            isset($project['progress']) ? $project['progress'] : 0,
            isset($project['color']) ? $project['color'] : null,
            isset($project['created_at']) ? $project['created_at'] : date('Y-m-d H:i:s'),
            isset($project['updated_at']) ? $project['updated_at'] : date('Y-m-d H:i:s')
        ]);
    }
    $project_count = count($projects);
    echo "Migrated $project_count projects\n";

    echo "Migrating todos...\n";
    $todos = fetchFromSupabase('todos');
    $sql = 'INSERT INTO todos (id, user_id, project_id, title, description, completed, priority, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), completed = VALUES(completed), priority = VALUES(priority), due_date = VALUES(due_date)';
    $stmt = $vps_db->prepare($sql);

    foreach ($todos as $todo) {
        $todo_id = getOrCreateMappedId($todo['id'], 'todo');
        $user_id = getOrCreateMappedId($todo['user_id'], 'user');
        $project_id = isset($todo['project_id']) && $todo['project_id'] ? getOrCreateMappedId($todo['project_id'], 'project') : null;
        $stmt->execute([
            $todo_id,
            $user_id,
            $project_id,
            $todo['title'],
            isset($todo['description']) ? $todo['description'] : '',
            isset($todo['completed']) ? $todo['completed'] : false,
            isset($todo['priority']) ? $todo['priority'] : 'medium',
            isset($todo['due_date']) ? $todo['due_date'] : null,
            isset($todo['created_at']) ? $todo['created_at'] : date('Y-m-d H:i:s'),
            isset($todo['updated_at']) ? $todo['updated_at'] : date('Y-m-d H:i:s')
        ]);
    }
    $todo_count = count($todos);
    echo "Migrated $todo_count todos\n";

    echo "Migrating links...\n";
    $links = fetchFromSupabase('links');
    $sql = 'INSERT INTO links (id, user_id, project_id, title, url, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title), url = VALUES(url), description = VALUES(description)';
    $stmt = $vps_db->prepare($sql);

    foreach ($links as $link) {
        $link_id = getOrCreateMappedId($link['id'], 'link');
        $user_id = getOrCreateMappedId($link['user_id'], 'user');
        $project_id = isset($link['project_id']) && $link['project_id'] ? getOrCreateMappedId($link['project_id'], 'project') : null;
        $stmt->execute([
            $link_id,
            $user_id,
            $project_id,
            $link['title'],
            $link['url'],
            isset($link['description']) ? $link['description'] : '',
            isset($link['created_at']) ? $link['created_at'] : date('Y-m-d H:i:s'),
            isset($link['updated_at']) ? $link['updated_at'] : date('Y-m-d H:i:s')
        ]);
    }
    $link_count = count($links);
    echo "Migrated $link_count links\n";

    echo "\n✅ Migration completed successfully!\n";
    echo "Total records migrated:\n";
    echo "  - Users: $user_count\n";
    echo "  - Projects: $project_count\n";
    echo "  - Todos: $todo_count\n";
    echo "  - Links: $link_count\n";

} catch (Exception $e) {
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
