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

/* build SET clause dynamically */
$fields = ['status', 'rating', 'review', 'pages_read', 'started_at', 'finished_at'];
$set = [];
$vals = [];
foreach ($fields as $f) {
    if (array_key_exists($f, $data)) {
        $set[] = "$f = ?";
        $vals[] = $data[$f];
    }
}
if (!$set) {
    echo json_encode(['ok' => true]);
    exit;
}   // nothing to update

$vals[] = $_SESSION['uid'];
$vals[] = $id;

$sql = 'UPDATE user_books SET ' . implode(', ', $set) . ' WHERE user_id = ? AND id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute($vals);
echo json_encode(['ok' => true]);
