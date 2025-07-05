<?php
require __DIR__ . '/../config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL) || strlen($data['password']) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email or password too short']);
    exit;
}

$stmt = $pdo->prepare('INSERT INTO users (email,password_hash) VALUES (?,?)');
try {
    $stmt->execute([$data['email'], password_hash($data['password'], PASSWORD_DEFAULT)]);
    $_SESSION['uid'] = $pdo->lastInsertId();
    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already exists']);
}
