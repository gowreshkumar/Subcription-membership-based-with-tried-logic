<?php
// php/subscription/subscribe.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.');
}

$data   = json_decode(file_get_contents('php://input'), true);
$planId = (int)($data['plan_id'] ?? 0);
$user   = getCurrentUser();

$db = getDB();

// Validate plan
$stmt = $db->prepare('SELECT id, duration_days FROM plans WHERE id=?');
$stmt->execute([$planId]);
$plan = $stmt->fetch();
if (!$plan) {
    jsonResponse(false, 'Invalid plan.');
}

// Cancel existing active subscriptions
$stmt = $db->prepare("UPDATE subscriptions SET status='cancelled' WHERE user_id=? AND status='active'");
$stmt->execute([$user['id']]);

// Create new subscription
$today  = date('Y-m-d');
$expiry = $plan['duration_days'] > 0 ? date('Y-m-d', strtotime('+' . $plan['duration_days'] . ' days')) : null;
$stmt = $db->prepare('INSERT INTO subscriptions (user_id, plan_id, start_date, expiry_date) VALUES (?,?,?,?)');
$stmt->execute([$user['id'], $planId, $today, $expiry]);

// Audit
$stmt = $db->prepare('INSERT INTO audit_log (user_id, action, detail, ip_address) VALUES (?,?,?,?)');
$stmt->execute([$user['id'], 'subscribe', "Switched to plan_id=$planId", $_SERVER['REMOTE_ADDR']]);

jsonResponse(true, 'Subscription updated successfully!');
