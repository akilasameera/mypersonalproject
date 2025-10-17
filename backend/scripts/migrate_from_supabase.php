<?php
/**
 * Data Migration Script: Supabase to VPS MySQL
 *
 * This script exports data from Supabase and imports it into VPS MySQL
 * Run this once during migration
 */

require_once __DIR__ . '/../config/vps_database.php';

// Supabase configuration
$supabase_url = getenv('VITE_SUPABASE_URL');
$supabase_key = getenv('VITE_SUPABASE_ANON_KEY');
$supabase_service_key = getenv('SUPABASE_SERVICE_ROLE_KEY'); // You'll need this for full access

if (!$supabase_url || !$supabase_service_key) {
    die("Error: Supabase configuration missing\n");
}

echo "Starting migration from Supabase to VPS MySQL...\n\n";

// Function to map Supabase UUID to MySQL integer ID
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

// Function to fetch data from Supabase
function fetchFromSupabase($table) {
    global $supabase_url, $supabase_service_key;

    $url = "$supabase_url/rest/v1/$table?select=*";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $supabase_service_key",
        "Authorization: Bearer $supabase_service_key"
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

// Migrate users first (required for foreign keys)
echo "Migrating users...\n";
$users = fetchFromSupabase('profiles'); // Supabase typically uses 'profiles' table
if (empty($users)) {
    // Try 'users' table if profiles doesn't exist
    $users = fetchFromSupabase('users');
}

$stmt = $vps_db->prepare("
    INSERT INTO users (id, email, full_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        full_name = VALUES(full_name)
");

foreach ($users as $user) {
    $user_id = getOrCreateMappedId($user['id'], 'user');

    $stmt->execute([
        $user_id,
        $user['email'] ?? 'user' . $user_id . '@example.com',
        $user['full_name'] ?? $user['name'] ?? 'User ' . $user_id,
        $user['created_at'] ?? date('Y-m-d H:i:s'),
        $user['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($users) . " users\n";

// Migrate projects
echo "Migrating projects...\n";
$projects = fetchFromSupabase('projects');
$stmt = $vps_db->prepare("
    INSERT INTO projects (id, user_id, title, description, status, priority, start_date, end_date, progress, color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        status = VALUES(status),
        priority = VALUES(priority),
        start_date = VALUES(start_date),
        end_date = VALUES(end_date),
        progress = VALUES(progress),
        color = VALUES(color)
");

foreach ($projects as $project) {
    $project_id = getOrCreateMappedId($project['id'], 'project');
    $user_id = getOrCreateMappedId($project['user_id'], 'user');

    $stmt->execute([
        $project_id,
        $user_id,
        $project['title'],
        $project['description'] ?? '',
        $project['status'] ?? 'active',
        $project['priority'] ?? 'medium',
        $project['start_date'] ?? null,
        $project['end_date'] ?? null,
        $project['progress'] ?? 0,
        $project['color'] ?? null,
        $project['created_at'] ?? date('Y-m-d H:i:s'),
        $project['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($projects) . " projects\n";

// Migrate todos
echo "Migrating todos...\n";
$todos = fetchFromSupabase('todos');
$stmt = $vps_db->prepare("
    INSERT INTO todos (id, user_id, project_id, title, description, completed, priority, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        completed = VALUES(completed),
        priority = VALUES(priority),
        due_date = VALUES(due_date)
");

foreach ($todos as $todo) {
    $todo_id = getOrCreateMappedId($todo['id'], 'todo');
    $user_id = getOrCreateMappedId($todo['user_id'], 'user');
    $project_id = $todo['project_id'] ? getOrCreateMappedId($todo['project_id'], 'project') : null;

    $stmt->execute([
        $todo_id,
        $user_id,
        $project_id,
        $todo['title'],
        $todo['description'] ?? '',
        $todo['completed'] ?? false,
        $todo['priority'] ?? 'medium',
        $todo['due_date'] ?? null,
        $todo['created_at'] ?? date('Y-m-d H:i:s'),
        $todo['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($todos) . " todos\n";

// Migrate links
echo "Migrating links...\n";
$links = fetchFromSupabase('links');
$stmt = $vps_db->prepare("
    INSERT INTO links (id, user_id, project_id, title, url, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        url = VALUES(url),
        description = VALUES(description)
");

foreach ($links as $link) {
    $link_id = getOrCreateMappedId($link['id'], 'link');
    $user_id = getOrCreateMappedId($link['user_id'], 'user');
    $project_id = $link['project_id'] ? getOrCreateMappedId($link['project_id'], 'project') : null;

    $stmt->execute([
        $link_id,
        $user_id,
        $project_id,
        $link['title'],
        $link['url'],
        $link['description'] ?? '',
        $link['created_at'] ?? date('Y-m-d H:i:s'),
        $link['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($links) . " links\n";

// Migrate notes
echo "Migrating notes...\n";
$notes = fetchFromSupabase('notes');
$stmt = $vps_db->prepare("
    INSERT INTO notes (id, project_id, user_id, title, content, due_date, status_category, status_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        content = VALUES(content),
        due_date = VALUES(due_date),
        status_category = VALUES(status_category),
        status_type = VALUES(status_type)
");

foreach ($notes as $note) {
    $note_id = getOrCreateMappedId($note['id'], 'note');
    $user_id = getOrCreateMappedId($note['user_id'], 'user');
    $project_id = $note['project_id'] ? getOrCreateMappedId($note['project_id'], 'project') : null;

    $stmt->execute([
        $note_id,
        $project_id,
        $user_id,
        $note['title'],
        $note['content'],
        $note['due_date'] ?? null,
        $note['status_category'] ?? 'general',
        $note['status_type'] ?? null,
        $note['created_at'] ?? date('Y-m-d H:i:s'),
        $note['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($notes) . " notes\n";

// Migrate attachments
echo "Migrating attachments...\n";
$attachments = fetchFromSupabase('attachments');
$stmt = $vps_db->prepare("
    INSERT INTO attachments (id, note_id, user_id, name, size, type, url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        size = VALUES(size),
        type = VALUES(type),
        url = VALUES(url)
");

foreach ($attachments as $attachment) {
    $attachment_id = getOrCreateMappedId($attachment['id'], 'attachment');
    $note_id = getOrCreateMappedId($attachment['note_id'], 'note');
    $user_id = getOrCreateMappedId($attachment['user_id'], 'user');

    $stmt->execute([
        $attachment_id,
        $note_id,
        $user_id,
        $attachment['name'],
        $attachment['size'],
        $attachment['type'],
        $attachment['url'],
        $attachment['created_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($attachments) . " attachments\n";

// Migrate meetings
echo "Migrating meetings...\n";
$meetings = fetchFromSupabase('meetings');
$stmt = $vps_db->prepare("
    INSERT INTO meetings (id, project_id, user_id, title, description, meeting_date, duration, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        meeting_date = VALUES(meeting_date),
        duration = VALUES(duration),
        status = VALUES(status)
");

foreach ($meetings as $meeting) {
    $meeting_id = getOrCreateMappedId($meeting['id'], 'meeting');
    $user_id = getOrCreateMappedId($meeting['user_id'], 'user');
    $project_id = $meeting['project_id'] ? getOrCreateMappedId($meeting['project_id'], 'project') : null;

    $stmt->execute([
        $meeting_id,
        $project_id,
        $user_id,
        $meeting['title'],
        $meeting['description'] ?? '',
        $meeting['meeting_date'] ?? date('Y-m-d H:i:s'),
        $meeting['duration'] ?? 60,
        $meeting['status'] ?? 'scheduled',
        $meeting['created_at'] ?? date('Y-m-d H:i:s'),
        $meeting['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($meetings) . " meetings\n";

// Migrate meeting transcripts
echo "Migrating meeting transcripts...\n";
$transcripts = fetchFromSupabase('meeting_transcripts');
$stmt = $vps_db->prepare("
    INSERT INTO meeting_transcripts (id, meeting_id, user_id, content, speaker, timestamp_in_meeting, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        content = VALUES(content),
        speaker = VALUES(speaker),
        timestamp_in_meeting = VALUES(timestamp_in_meeting)
");

foreach ($transcripts as $transcript) {
    $transcript_id = getOrCreateMappedId($transcript['id'], 'transcript');
    $meeting_id = getOrCreateMappedId($transcript['meeting_id'], 'meeting');
    $user_id = getOrCreateMappedId($transcript['user_id'], 'user');

    $stmt->execute([
        $transcript_id,
        $meeting_id,
        $user_id,
        $transcript['content'],
        $transcript['speaker'] ?? '',
        $transcript['timestamp_in_meeting'] ?? '',
        $transcript['created_at'] ?? date('Y-m-d H:i:s'),
        $transcript['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($transcripts) . " meeting transcripts\n";

// Migrate meeting summaries
echo "Migrating meeting summaries...\n";
$summaries = fetchFromSupabase('meeting_summaries');
$stmt = $vps_db->prepare("
    INSERT INTO meeting_summaries (id, meeting_id, user_id, content, key_points, action_items, decisions, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        content = VALUES(content),
        key_points = VALUES(key_points),
        action_items = VALUES(action_items),
        decisions = VALUES(decisions)
");

foreach ($summaries as $summary) {
    $summary_id = getOrCreateMappedId($summary['id'], 'summary');
    $meeting_id = getOrCreateMappedId($summary['meeting_id'], 'meeting');
    $user_id = getOrCreateMappedId($summary['user_id'], 'user');

    $stmt->execute([
        $summary_id,
        $meeting_id,
        $user_id,
        $summary['content'],
        $summary['key_points'] ?? '',
        $summary['action_items'] ?? '',
        $summary['decisions'] ?? '',
        $summary['created_at'] ?? date('Y-m-d H:i:s'),
        $summary['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($summaries) . " meeting summaries\n";

// Migrate meeting todos
echo "Migrating meeting todos...\n";
$meeting_todos = fetchFromSupabase('meeting_todos');
$stmt = $vps_db->prepare("
    INSERT INTO meeting_todos (id, meeting_id, user_id, title, description, assigned_to, due_date, priority, completed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        assigned_to = VALUES(assigned_to),
        due_date = VALUES(due_date),
        priority = VALUES(priority),
        completed = VALUES(completed)
");

foreach ($meeting_todos as $todo) {
    $meeting_todo_id = getOrCreateMappedId($todo['id'], 'meeting_todo');
    $meeting_id = getOrCreateMappedId($todo['meeting_id'], 'meeting');
    $user_id = getOrCreateMappedId($todo['user_id'], 'user');

    $stmt->execute([
        $meeting_todo_id,
        $meeting_id,
        $user_id,
        $todo['title'],
        $todo['description'] ?? '',
        $todo['assigned_to'] ?? '',
        $todo['due_date'] ?? null,
        $todo['priority'] ?? 'medium',
        $todo['completed'] ?? false,
        $todo['created_at'] ?? date('Y-m-d H:i:s'),
        $todo['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($meeting_todos) . " meeting todos\n";

// Migrate knowledge topics
echo "Migrating knowledge topics...\n";
$topics = fetchFromSupabase('knowledge_topics');
$stmt = $vps_db->prepare("
    INSERT INTO knowledge_topics (id, user_id, title, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description)
");

foreach ($topics as $topic) {
    $topic_id = getOrCreateMappedId($topic['id'], 'topic');
    $user_id = getOrCreateMappedId($topic['user_id'], 'user');

    $stmt->execute([
        $topic_id,
        $user_id,
        $topic['title'],
        $topic['description'] ?? '',
        $topic['created_at'] ?? date('Y-m-d H:i:s'),
        $topic['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($topics) . " knowledge topics\n";

// Migrate knowledge sections
echo "Migrating knowledge sections...\n";
$sections = fetchFromSupabase('knowledge_sections');
$stmt = $vps_db->prepare("
    INSERT INTO knowledge_sections (id, topic_id, user_id, title, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        content = VALUES(content)
");

foreach ($sections as $section) {
    $section_id = getOrCreateMappedId($section['id'], 'section');
    $topic_id = getOrCreateMappedId($section['topic_id'], 'topic');
    $user_id = getOrCreateMappedId($section['user_id'], 'user');

    $stmt->execute([
        $section_id,
        $topic_id,
        $user_id,
        $section['title'],
        $section['content'],
        $section['created_at'] ?? date('Y-m-d H:i:s'),
        $section['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($sections) . " knowledge sections\n";

// Migrate knowledge tiles
echo "Migrating knowledge tiles...\n";
$tiles = fetchFromSupabase('knowledge_tiles');
$stmt = $vps_db->prepare("
    INSERT INTO knowledge_tiles (id, section_id, user_id, title, content, image_url, image_name, image_size, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        content = VALUES(content),
        image_url = VALUES(image_url),
        image_name = VALUES(image_name),
        image_size = VALUES(image_size)
");

foreach ($tiles as $tile) {
    $tile_id = getOrCreateMappedId($tile['id'], 'tile');
    $section_id = getOrCreateMappedId($tile['section_id'], 'section');
    $user_id = getOrCreateMappedId($tile['user_id'], 'user');

    $stmt->execute([
        $tile_id,
        $section_id,
        $user_id,
        $tile['title'],
        $tile['content'],
        $tile['image_url'] ?? null,
        $tile['image_name'] ?? null,
        $tile['image_size'] ?? null,
        $tile['created_at'] ?? date('Y-m-d H:i:s'),
        $tile['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($tiles) . " knowledge tiles\n";

// Migrate project configurations
echo "Migrating project configurations...\n";
$configs = fetchFromSupabase('project_configurations');
$stmt = $vps_db->prepare("
    INSERT INTO project_configurations (id, project_id, user_id, is_master, brd_content, business_profile_url, business_map_url, business_profile_name, business_map_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        is_master = VALUES(is_master),
        brd_content = VALUES(brd_content),
        business_profile_url = VALUES(business_profile_url),
        business_map_url = VALUES(business_map_url),
        business_profile_name = VALUES(business_profile_name),
        business_map_name = VALUES(business_map_name)
");

foreach ($configs as $config) {
    $config_id = getOrCreateMappedId($config['id'], 'config');
    $project_id = getOrCreateMappedId($config['project_id'], 'project');
    $user_id = getOrCreateMappedId($config['user_id'], 'user');

    $stmt->execute([
        $config_id,
        $project_id,
        $user_id,
        $config['is_master'] ?? false,
        $config['brd_content'] ?? '',
        $config['business_profile_url'] ?? null,
        $config['business_map_url'] ?? null,
        $config['business_profile_name'] ?? null,
        $config['business_map_name'] ?? null,
        $config['created_at'] ?? date('Y-m-d H:i:s'),
        $config['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($configs) . " project configurations\n";

// Migrate configurator blocks
echo "Migrating configurator blocks...\n";
$blocks = fetchFromSupabase('configurator_blocks');
$stmt = $vps_db->prepare("
    INSERT INTO configurator_blocks (id, configuration_id, user_id, block_name, block_order, image_url, image_name, image_size, text_content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        block_name = VALUES(block_name),
        block_order = VALUES(block_order),
        image_url = VALUES(image_url),
        image_name = VALUES(image_name),
        image_size = VALUES(image_size),
        text_content = VALUES(text_content)
");

foreach ($blocks as $block) {
    $block_id = getOrCreateMappedId($block['id'], 'block');
    $config_id = getOrCreateMappedId($block['configuration_id'], 'config');
    $user_id = getOrCreateMappedId($block['user_id'], 'user');

    $stmt->execute([
        $block_id,
        $config_id,
        $user_id,
        $block['block_name'],
        $block['block_order'],
        $block['image_url'] ?? null,
        $block['image_name'] ?? null,
        $block['image_size'] ?? null,
        $block['text_content'] ?? '',
        $block['created_at'] ?? date('Y-m-d H:i:s'),
        $block['updated_at'] ?? date('Y-m-d H:i:s')
    ]);
}
echo "Migrated " . count($blocks) . " configurator blocks\n";

echo "\n✅ Migration completed successfully!\n";
echo "Total records migrated:\n";
echo "  - Users: " . count($users) . "\n";
echo "  - Projects: " . count($projects) . "\n";
echo "  - Todos: " . count($todos) . "\n";
echo "  - Links: " . count($links) . "\n";
echo "  - Notes: " . count($notes) . "\n";
echo "  - Attachments: " . count($attachments) . "\n";
echo "  - Meetings: " . count($meetings) . "\n";
echo "  - Meeting Transcripts: " . count($transcripts) . "\n";
echo "  - Meeting Summaries: " . count($summaries) . "\n";
echo "  - Meeting Todos: " . count($meeting_todos) . "\n";
echo "  - Knowledge Topics: " . count($topics) . "\n";
echo "  - Knowledge Sections: " . count($sections) . "\n";
echo "  - Knowledge Tiles: " . count($tiles) . "\n";
echo "  - Project Configurations: " . count($configs) . "\n";
echo "  - Configurator Blocks: " . count($blocks) . "\n";
