<?php
require __DIR__ . '/../config.php';
requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$required = ['google_id', 'title'];
foreach ($required as $k)
    if (empty($data[$k])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing $k"]);
        exit;
    }

try {
    /* ensure book exists in master books table */
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('SELECT id FROM books WHERE google_id = ?');
    $stmt->execute([$data['google_id']]);
    $bookId = $stmt->fetchColumn();
    if (!$bookId) {
        $stmt = $pdo->prepare(
            'INSERT INTO books (google_id,title,author,cover_url,description)
       VALUES (?,?,?,?,?)'
        );
        $stmt->execute([
            $data['google_id'],
            $data['title'],
            $data['author']       ?? null,
            $data['cover_url']    ?? null,
            $data['description']  ?? null
        ]);
        $bookId = $pdo->lastInsertId();
    }

    /* link to user */
    $stmt = $pdo->prepare(
        'INSERT INTO user_books (user_id,book_id,status) VALUES (?,?,?)'
    );
    $stmt->execute([$_SESSION['uid'], $bookId, 'want']);
    $pdo->commit();

    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() === '23000') {    // duplicate key
        http_response_code(409);
        echo json_encode(['error' => 'Book already added']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Create failed']);
    }
}
