<?php
session_start();

// Middleware-achtig stuk:
if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}
//Alerts voor feedback
if (isset($_SESSION['alert'])) {
    echo "<script>alert('" . addslashes($_SESSION['alert']) . "');</script>";
    unset($_SESSION['alert']);
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="index.css">
    <title>Crypto Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Mustache.js toevoegen -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.1.0/mustache.min.js"></script>
</head>

<body class="bg-gray-900 text-white min-h-screen">
    <div id="crypto-navbar"></div>
    <!-- Main content -->
    <div class="container mx-auto p-4">

        <div class="overflow-x-auto">
            <table class="min-w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-20">
                <thead>
                    <tr class="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                        <th class="py-3 px-6 text-left">Rank</th>
                        <th class="py-3 px-6 text-left">Name</th>
                        <th class="py-3 px-6 text-left">Price (USD)</th>
                        <th class="py-3 px-6 text-left">Your Amount</th>
                        <th class="py-3 px-6 text-left">Total Value</th>
                        <th class="py-3 px-6 text-left">Sell?</th>
                    </tr>
                </thead>
                <tbody class="text-gray-300 text-sm font-light" id="wallet-body">
                    <!-- Mustache rows komen hier -->
                </tbody>
            </table>
        </div>

        <!-- Custom JS -->
        <script src="js/main.js"></script>
        <script src="js/crypto.js"></script>
        <script src="js/chart.js"></script>

</body>

</html>