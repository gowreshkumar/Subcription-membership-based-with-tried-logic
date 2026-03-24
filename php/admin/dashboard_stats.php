<?php
// php/admin/dashboard_stats.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAdmin();

$db = getDB();

$totalUsers   = $db->query('SELECT COUNT(*) FROM users WHERE role="user"')->fetchColumn();
$activeSubs   = $db->query('SELECT COUNT(*) FROM subscriptions WHERE status="active"')->fetchColumn();
$totalRevenue = $db->query('SELECT COALESCE(SUM(p.price),0) FROM subscriptions s JOIN plans p ON p.id=s.plan_id WHERE s.status="active"')->fetchColumn();

$planDist = $db->query('
    SELECT p.name, p.badge_color, COUNT(s.id) AS count
    FROM plans p
    LEFT JOIN subscriptions s ON s.plan_id = p.id AND s.status="active"
    GROUP BY p.id ORDER BY p.tier
')->fetchAll();

echo json_encode([
    'success'       => true,
    'total_users'   => (int)$totalUsers,
    'active_subs'   => (int)$activeSubs,
    'total_revenue' => (float)$totalRevenue,
    'plan_dist'     => $planDist,
]);
