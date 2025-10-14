<?php
/**
 * Test VPS Database Connection
 * Run this to verify your VPS MySQL setup is working
 */

echo "Testing VPS MySQL Connection...\n\n";

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

$vps_host = getenv('VPS_DB_HOST') ?: 'localhost';
$vps_dbname = getenv('VPS_DB_NAME') ?: 'projectmanager';
$vps_user = getenv('VPS_DB_USER') ?: 'root';
$vps_pass = getenv('VPS_DB_PASS') ?: '';

echo "Configuration:\n";
echo "  Host: $vps_host\n";
echo "  Database: $vps_dbname\n";
echo "  User: $vps_user\n";
echo "  Password: " . (empty($vps_pass) ? '[empty]' : '[set]') . "\n\n";

try {
    echo "Attempting connection...\n";
    $vps_db = new PDO(
        "mysql:host=$vps_host;dbname=$vps_dbname;charset=utf8mb4",
        $vps_user,
        $vps_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    echo "✅ Connection successful!\n\n";

    // Test table existence
    echo "Checking tables...\n";
    $tables = [
        'notes',
        'attachments',
        'meetings',
        'meeting_transcripts',
        'meeting_summaries',
        'meeting_todos',
        'knowledge_topics',
        'knowledge_sections',
        'knowledge_tiles',
        'project_configurations',
        'configurator_blocks'
    ];

    $stmt = $vps_db->query("SHOW TABLES");
    $existing_tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $table) {
        if (in_array($table, $existing_tables)) {
            // Count records
            $count_stmt = $vps_db->query("SELECT COUNT(*) as count FROM $table");
            $count = $count_stmt->fetch()['count'];
            echo "  ✅ $table ($count records)\n";
        } else {
            echo "  ❌ $table (missing)\n";
        }
    }

    echo "\n✅ All tests passed!\n";
    echo "\nYour VPS database is ready to use.\n";

} catch (PDOException $e) {
    echo "❌ Connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "Troubleshooting:\n";
    echo "1. Check MySQL is running: sudo systemctl status mysql\n";
    echo "2. Verify credentials in backend/.env\n";
    echo "3. Check database exists: mysql -u root -p -e 'SHOW DATABASES;'\n";
    echo "4. Run schema: mysql -u root -p projectmanager < backend/schema/vps_schema.sql\n";
    exit(1);
}
