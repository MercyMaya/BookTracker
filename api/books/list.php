<?php
require __DIR__ . '/../config.php';
requireAuth();

$stmt = $pdo->prepare(
    'SELECT ub.id, b.title, b.author, b.cover_url, ub.status, ub.rating,
          ub.review, ub.pages_read
   FROM user_books ub
   JOIN books b ON b.id = ub.book_id
   WHERE ub.user_id = ?'
);
$stmt->execute([$_SESSION['uid']]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
