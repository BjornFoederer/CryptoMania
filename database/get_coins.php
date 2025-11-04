<?php
header('Content-Type: application/json'); // Output is JSON
include('db.php'); // Databaseverbinding

session_start(); // Start sessie
$userID = $_SESSION['user_id']; // Huidige gebruiker

// Haal alle munten van deze gebruiker op
$getAllCoins = "SELECT * FROM cryptofolio WHERE userID = '$userID'";
$resultGetAllCoins = mysqli_query($conn, $getAllCoins);

$allCoinsArray = array(); // Lege lijst voor resultaten

// Voeg elke rij toe aan de array
while ($rowAllCoins = mysqli_fetch_assoc($resultGetAllCoins)) {
    $allCoinsArray[] = $rowAllCoins;
}

// Stuur alles terug als JSON
echo json_encode($allCoinsArray);
