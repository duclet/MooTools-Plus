<?php
// This files allow you to set the response to session and then retrieve it using responses.php
session_start();
$_SESSION[$_REQUEST['session_key']] = $_REQUEST['data'];

echo 'OK';
