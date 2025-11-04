<?php
session_start();
include 'db.php'; // verbinding maken

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // Form data veilig ophalen
    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // Controleren of velden niet leeg zijn
    if (empty($username) || empty($email) || empty($password)) {
        die("Vul alle velden in!");
    }

    // Wachtwoord hashen
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Controleren of de gebruiker al bestaat
    $stmt = $conn->prepare("SELECT * FROM Users WHERE email = ? OR name = ?");
    $stmt->bind_param("ss", $email, $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "Gebruiker met deze naam of email bestaat al!";
        exit;
    }

    // Nieuwe gebruiker toevoegen
    $stmt = $conn->prepare("INSERT INTO Users (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashed_password);

    if ($stmt->execute()) {
        // Redirect naar wallet.php
        header("Location: ../wallet.php");
        exit; // Altijd exit na header redirect
    } else {
        echo "Er is iets misgegaan: " . $conn->error;
    }

    $stmt->close();
    $conn->close();
}
