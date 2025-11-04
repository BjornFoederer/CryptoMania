<?php
session_start(); // Start sessie
session_unset(); // Leeg sessie
session_destroy(); // Vernietig sessie
header("Location: ../index.html"); // Terug naar homepage
exit;
