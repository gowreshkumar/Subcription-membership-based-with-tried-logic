<?php
// php/auth/register.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.');
}

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$planId   = (int)($data['plan_id'] ?? 1);

// Validation
if (!$username || !$email || !$password) {
    jsonResponse(false, 'All fields are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Invalid email address.');
}
if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters.');
}

$db = getDB();

// Check uniqueness
$stmt = $db->prepare('SELECT id FROM users WHERE email=? OR username=?');
$stmt->execute([$email, $username]);
if ($stmt->fetch()) {
    jsonResponse(false, 'Email or username already in use.');
}

// Validate plan
$stmt = $db->prepare('SELECT id, duration_days FROM plans WHERE id=?');
$stmt->execute([$planId]);
$plan = $stmt->fetch();
if (!$plan) {
    jsonResponse(false, 'Invalid plan selected.');
}

// Insert user
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (username, email, password_hash) VALUES (?,?,?)');
$stmt->execute([$username, $email, $hash]);
$userId = (int)$db->lastInsertId();

// Create subscription
$today  = date('Y-m-d');
$expiry = $plan['duration_days'] > 0 ? date('Y-m-d', strtotime('+' . $plan['duration_days'] . ' days')) : null;
$stmt = $db->prepare('INSERT INTO subscriptions (user_id, plan_id, start_date, expiry_date) VALUES (?,?,?,?)');
$stmt->execute([$userId, $planId, $today, $expiry]);

// Log
$stmt = $db->prepare('INSERT INTO audit_log (user_id, action, detail, ip_address) VALUES (?,?,?,?)');
$stmt->execute([$userId, 'register', "Registered with plan_id=$planId", $_SERVER['REMOTE_ADDR']]);

jsonResponse(true, 'Registration successful! Please log in.');
