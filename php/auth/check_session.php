<?php
// php/auth/check_session.php
require_once __DIR__ . '/../../config/session.php';
header('Content-Type: application/json');
if (isLoggedIn()) {
    echo json_encode(['logged_in' => true, 'user' => getCurrentUser()]);
} else {
    echo json_encode(['logged_in' => false, 'user' => null]);
}
