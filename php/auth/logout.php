<?php
// php/auth/logout.php
require_once __DIR__ . '/../../config/session.php';
session_destroy();
jsonResponse(true, 'Logged out successfully.');
