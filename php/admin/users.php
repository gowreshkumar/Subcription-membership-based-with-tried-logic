<?php
// php/admin/users.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAdmin();

$db = getDB();
$stmt = $db->query('
    SELECT u.id, u.username, u.email, u.role, u.created_at,
           p.name AS plan_name, p.tier, p.badge_color,
           s.status AS sub_status, s.expiry_date
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = "active"
    LEFT JOIN plans p ON p.id = s.plan_id
    ORDER BY u.id DESC
');
$users = $stmt->fetchAll();
echo json_encode(['success' => true, 'users' => $users]);
