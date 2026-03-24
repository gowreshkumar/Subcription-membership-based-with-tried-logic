<?php
// php/auth/login.php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../config/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.');
}

$data     = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(false, 'Email and password are required.');
}

$db = getDB();
$stmt = $db->prepare('SELECT id, username, email, password_hash, role FROM users WHERE email=?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(false, 'Invalid email or password.');
}

// Store session
$_SESSION['user'] = [
    'id'       => $user['id'],
    'username' => $user['username'],
    'email'    => $user['email'],
    'role'     => $user['role'],
];

// Log
$stmt = $db->prepare('INSERT INTO audit_log (user_id, action, ip_address) VALUES (?,?,?)');
$stmt->execute([$user['id'], 'login', $_SERVER['REMOTE_ADDR']]);

jsonResponse(true, 'Login successful.', [
    'user' => [
        'id'       => $user['id'],
        'username' => $user['username'],
        'role'     => $user['role'],
    ]
]);
