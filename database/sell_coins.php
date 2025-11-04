<?php
include('db.php');
session_start();

// Haal userID op uit de sessie
$userID = $_SESSION['user_id'] ?? null;

if (!$userID) {
    die("Niet ingelogd.");
}

// Check of cryptoID meegestuurd is
if (!isset($_POST['cryptoID'])) {
    die("Geen coin geselecteerd.");
}

$cryptoID = (int)$_POST['cryptoID'];

// Verwijder coin uit de database
$sql = "DELETE FROM cryptofolio WHERE cryptoID = $cryptoID AND userID = $userID";

if (mysqli_query($conn, $sql)) {
    if (mysqli_affected_rows($conn) > 0) {
        $_SESSION['alert'] = "Coin succesvol verkocht!";
    } else {
        $_SESSION['alert'] = "Coin niet gevonden of al verwijderd.";
    }
} else {
    $_SESSION['alert'] = "Er is iets misgegaan bij het verkopen.";
}

header("Location: ../wallet.php");
exit;
