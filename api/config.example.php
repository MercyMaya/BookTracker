<?php

/**
 * A template so we don't expose our secrets
 */

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Lax'
]);

$DB_HOST = 'mysql.example.com';
$DB_NAME = 'your_db';
$DB_USER = 'your_user';
$DB_PASS = 'your_pass';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}

header('Content-Type: application/json');

function requireAuth()
{
    if (empty($_SESSION['uid'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Not authenticated']);
        exit;
    }
}
