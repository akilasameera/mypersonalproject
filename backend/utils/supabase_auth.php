<?php
// Verify Supabase JWT token and get user info

function verifySupabaseToken() {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No authorization token provided']);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);

    // Get Supabase project details
    $supabase_url = getenv('VITE_SUPABASE_URL');
    $supabase_key = getenv('VITE_SUPABASE_ANON_KEY');

    if (!$supabase_url || !$supabase_key) {
        http_response_code(500);
        echo json_encode(['error' => 'Supabase configuration missing']);
        exit;
    }

    // Verify token with Supabase
    $ch = curl_init("$supabase_url/auth/v1/user");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $token",
        "apikey: $supabase_key"
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code !== 200) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    $user = json_decode($response, true);

    if (!$user || !isset($user['id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid user data']);
        exit;
    }

    return $user;
}

function getUserId() {
    $user = verifySupabaseToken();
    return $user['id'];
}
