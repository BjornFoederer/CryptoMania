<?php
session_start();
include 'db.php'; // Verbinding maken

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // Form data veilig ophalen
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // Controleren of velden niet leeg zijn
    if (empty($email) || empty($password)) {
        die("Vul alle velden in!");
    }

    // Ophalen gebruiker uit de database
    $stmt = $conn->prepare("SELECT * FROM Users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Wachtwoord controleren
        if (password_verify($password, $user['password'])) {
            // Sessies instellen
            $_SESSION['user_id']  = $user['userID'];
            $_SESSION['username'] = $user['name'];

            // Redirect naar wallet.php
            header("Location: ../wallet.php");
            exit; // Altijd exit na header redirect
        } else {
            echo "Verkeerd wachtwoord!";
        }
    } else {
        echo "Gebruiker niet gevonden!";
    }

    $stmt->close();
    $conn->close();
}
