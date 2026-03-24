<?php
// php/plans/get_plans.php  – public endpoint
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/db.php';

$plans = getDB()->query('SELECT * FROM plans ORDER BY tier ASC')->fetchAll();
foreach ($plans as &$p) {
    $p['features'] = json_decode($p['features'], true);
}
echo json_encode(['success' => true, 'plans' => $plans]);
