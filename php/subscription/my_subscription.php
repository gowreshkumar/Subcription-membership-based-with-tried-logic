<?php
// php/subscription/my_subscription.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireLogin();

$user = getCurrentUser();
$db   = getDB();

// Auto-expire past subscriptions
$db->prepare("UPDATE subscriptions SET status='expired' WHERE status='active' AND expiry_date IS NOT NULL AND expiry_date < CURDATE()")->execute();

$stmt = $db->prepare('
    SELECT s.id, s.start_date, s.expiry_date, s.status,
           p.id AS plan_id, p.name AS plan_name, p.tier, p.badge_color, p.features
    FROM subscriptions s
    JOIN plans p ON p.id = s.plan_id
    WHERE s.user_id = ? AND s.status = "active"
    ORDER BY s.id DESC LIMIT 1
');
$stmt->execute([$user['id']]);
$sub = $stmt->fetch();

if (!$sub) {
    jsonResponse(false, 'No active subscription found.', ['subscription' => null]);
}

$sub['features'] = json_decode($sub['features'], true);
jsonResponse(true, 'OK', ['subscription' => $sub]);
