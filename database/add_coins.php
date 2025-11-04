<?php
include('db.php');
session_start(); // nodig als je uit de sessie wilt lezen

// Haal gegevens op
$coinName     = $_POST['coin_name'];
$coinPrice    = $_POST['coin_price'];
$amountCoins  = $_POST['amount_coins'];
$totalValue   = $_POST['total_value'];

// userID ophalen
$userID = $_SESSION['user_id'];

// SQL-query
$addCoin = "INSERT INTO cryptofolio (cryptoID, userID, name, price, amount, totalValue, bought_on)
            VALUES (NULL, '$userID', '$coinName', '$coinPrice', '$amountCoins', '$totalValue', NOW())";

// Uitvoeren
if (mysqli_query($conn, $addCoin)) {
    echo "Succesfully added to your cryptofolio";
} else {
    echo "Oops, cannot add a coin: " . mysqli_error($conn);
}
