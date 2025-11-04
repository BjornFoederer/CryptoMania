<?php
session_start();

// Check of er een user is ingelogd
$user = isset($_SESSION['username']) ? $_SESSION['username'] : null;

// Stuur dit als JSON naar je frontend
header('Content-Type: application/json');
echo json_encode(['user' => $user]);
exit;
