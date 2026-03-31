<?php
/**
 * Forbes Financial Consultancy Corporation — Career Application Handler
 * Receives POST data + file upload, validates, sanitises, and saves.
 */

header('Content-Type: application/json; charset=utf-8');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* ---------- Collect & Sanitise ---------- */
$firstName = trim(filter_input(INPUT_POST, 'first_name', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$lastName  = trim(filter_input(INPUT_POST, 'last_name',  FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$email     = trim(filter_input(INPUT_POST, 'email',      FILTER_SANITIZE_EMAIL) ?? '');
$phone     = trim(filter_input(INPUT_POST, 'phone',      FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$address   = trim(filter_input(INPUT_POST, 'address',    FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$position  = trim(filter_input(INPUT_POST, 'desired_position', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$cover     = trim(filter_input(INPUT_POST, 'cover_letter', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');

/* ---------- Validate ---------- */
$errors = [];

if ($firstName === '') {
    $errors[] = 'First name is required.';
}
if ($lastName === '') {
    $errors[] = 'Last name is required.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($phone === '') {
    $errors[] = 'Phone number is required.';
}

/* ---------- Resume File Handling ---------- */
$allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
];
$allowedExts   = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
$maxFileSize   = 10 * 1024 * 1024; // 10 MB
$resumeSaved   = '';

if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['resume'];

    // Validate extension
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts, true)) {
        $errors[] = 'Resume must be PDF, DOC, DOCX, PNG, or JPG.';
    }

    // Validate MIME via finfo
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $allowedMimes, true)) {
        $errors[] = 'Invalid file type detected.';
    }

    // Validate size
    if ($file['size'] > $maxFileSize) {
        $errors[] = 'Resume must be 10 MB or less.';
    }
} elseif (isset($_FILES['resume']) && $_FILES['resume']['error'] !== UPLOAD_ERR_NO_FILE) {
    $errors[] = 'File upload error. Please try again.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ---------- Save Resume File ---------- */
$uploadDir = __DIR__ . '/uploads/resumes';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0750, true);
}

if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
    $safeFirst = preg_replace('/[^a-zA-Z0-9_-]/', '', $firstName);
    $safeLast  = preg_replace('/[^a-zA-Z0-9_-]/', '', $lastName);
    $uniqueName = $safeFirst . '_' . $safeLast . '_' . date('Ymd_His') . '.' . $ext;
    $destPath   = $uploadDir . '/' . $uniqueName;

    if (move_uploaded_file($file['tmp_name'], $destPath)) {
        $resumeSaved = $uniqueName;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file.']);
        exit;
    }
}

/* ---------- Save Application Log ---------- */
$timestamp = date('Y-m-d H:i:s');
$logEntry  = "[$timestamp]\nName: $firstName $lastName\nEmail: $email\nPhone: $phone\nAddress: $address\nPosition: $position\nCover Letter: $cover\nResume: $resumeSaved\n" . str_repeat('-', 60) . "\n\n";

$logDir  = __DIR__ . '/submissions';
if (!is_dir($logDir)) {
    mkdir($logDir, 0750, true);
}
$logFile = $logDir . '/career_applications.txt';
$saved   = file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

if ($saved !== false) {
    echo json_encode(['success' => true, 'message' => 'Application received! We will review and be in touch.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
}
