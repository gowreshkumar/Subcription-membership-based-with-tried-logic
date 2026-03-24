<?php
// php/admin/update_plan.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.');
}

$data   = json_decode(file_get_contents('php://input'), true);
$userId = (int)($data['user_id'] ?? 0);
$planId = (int)($data['plan_id'] ?? 0);

if (!$userId || !$planId) {
    jsonResponse(false, 'user_id and plan_id required.');
}

$db = getDB();

// Validate plan
$stmt = $db->prepare('SELECT id, duration_days FROM plans WHERE id=?');
$stmt->execute([$planId]);
$plan = $stmt->fetch();
if (!$plan) { jsonResponse(false, 'Invalid plan.'); }

// Cancel old subs
$db->prepare("UPDATE subscriptions SET status='cancelled' WHERE user_id=? AND status='active'")->execute([$userId]);

// New sub
$today  = date('Y-m-d');
$expiry = $plan['duration_days'] > 0 ? date('Y-m-d', strtotime('+' . $plan['duration_days'] . ' days')) : null;
$db->prepare('INSERT INTO subscriptions (user_id, plan_id, start_date, expiry_date) VALUES (?,?,?,?)')->execute([$userId, $planId, $today, $expiry]);

// Audit
$admin = getCurrentUser();
$db->prepare('INSERT INTO audit_log (user_id, action, detail) VALUES (?,?,?)')->execute([$admin['id'], 'admin_update_plan', "Set user $userId to plan_id=$planId"]);

jsonResponse(true, 'User plan updated.');
