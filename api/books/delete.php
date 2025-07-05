<?php
require __DIR__ . '/../config.php';
requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$id   = $data['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM user_books WHERE user_id = ? AND id = ?');
$stmt->execute([$_SESSION['uid'], $id]);
echo json_encode(['ok' => true]);
