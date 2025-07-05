<?php
require __DIR__ . '/../config.php';

$data = json_decode(file_get_contents('php://input'), true);
$stmt = $pdo->prepare('SELECT id,password_hash FROM users WHERE email = ?');
$stmt->execute([$data['email']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($data['password'], $user['password_hash'])) {
    $_SESSION['uid'] = $user['id'];
    echo json_encode(['ok' => true]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
