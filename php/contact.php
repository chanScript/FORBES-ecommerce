<?php
/**
 * Forbes Financial Consultancy Corporation — Contact Form Handler
 * Receives POST data, validates, sanitises, and saves to file / sends email.
 */

header('Content-Type: application/json; charset=utf-8');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* ---------- Collect & Sanitise ---------- */
$name    = trim(filter_input(INPUT_POST, 'full_name', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$email   = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL) ?? '');
$phone   = trim(filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$company = trim(filter_input(INPUT_POST, 'company', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$service = trim(filter_input(INPUT_POST, 'service', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$message = trim(filter_input(INPUT_POST, 'message', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');

/* ---------- Validate ---------- */
$errors = [];

if ($name === '') {
    $errors[] = 'Full name is required.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if (mb_strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ---------- Process ---------- */
$timestamp = date('Y-m-d H:i:s');
$logEntry  = "[$timestamp]\nName: $name\nEmail: $email\nPhone: $phone\nCompany: $company\nService: $service\nMessage: $message\n" . str_repeat('-', 60) . "\n\n";

// Save to local file
$logDir  = __DIR__ . '/submissions';
if (!is_dir($logDir)) {
    mkdir($logDir, 0750, true);
}
$logFile = $logDir . '/contact_submissions.txt';
$saved   = file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

// Optionally send email (uncomment and configure when ready)
/*
$to      = 'rsalas@forbesfinancial.com.ph';
$subject = 'New Contact Form Submission — ' . $name;
$headers = [
    'From: noreply@forbesfinancial.com.ph',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];
mail($to, $subject, $message, implode("\r\n", $headers));
*/

if ($saved !== false) {
    echo json_encode(['success' => true, 'message' => 'Thank you! Your message has been received.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
}
