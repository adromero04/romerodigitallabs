<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/SmtpMailer.php';

function wants_json(): bool
{
    return isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json');
}

function respond(bool $ok, string $error = '', int $status = 200, string $returnPath = 'index.html#contact'): void
{
    if (wants_json()) {
        header('Content-Type: application/json; charset=utf-8');
        if (!$ok) {
            http_response_code($status);
            echo json_encode(['ok' => false, 'error' => $error]);
            return;
        }
        echo json_encode(['ok' => true]);
        return;
    }

    $allowedReturns = [
        'index.html#contact',
        'products.html#contact',
    ];
    if (!in_array($returnPath, $allowedReturns, true)) {
        $returnPath = 'index.html#contact';
    }

    [$page, $hash] = array_pad(explode('#', $returnPath, 2), 2, '');
    $hashSuffix = $hash !== '' ? '#' . $hash : '';

    if ($ok) {
        header('Location: ' . $page . '?sent=1' . $hashSuffix);
        return;
    }
    header('Location: ' . $page . '?error=' . rawurlencode($error) . $hashSuffix);
}

function resolve_return_path(): string
{
    $returnPath = trim((string) ($_POST['_return'] ?? 'index.html#contact'));
    return $returnPath === '' ? 'index.html#contact' : $returnPath;
}

function load_contact_config(): array
{
    $defaults = [
        'to' => 'contact@romerodigitallabs.com',
        'from_email' => 'contact@romerodigitallabs.com',
        'from_name' => 'Romero Digital Labs Website',
        'smtp' => [
            'host' => 'smtp.hostinger.com',
            'port' => 587,
            'username' => 'contact@romerodigitallabs.com',
            'password' => '',
            'encryption' => 'tls',
        ],
    ];

    $configPath = __DIR__ . '/contact-config.php';
    if (!is_readable($configPath)) {
        return $defaults;
    }

    $custom = require $configPath;
    if (!is_array($custom)) {
        return $defaults;
    }

    return array_replace_recursive($defaults, $custom);
}

function format_reply_to(string $name, string $email): string
{
    $safeName = trim(str_replace(["\r", "\n", '"'], '', $name));
    $safeEmail = filter_var($email, FILTER_VALIDATE_EMAIL);
    if (!$safeEmail) {
        return '';
    }
    if ($safeName === '') {
        return '<' . $safeEmail . '>';
    }
    return '"' . $safeName . '" <' . $safeEmail . '>';
}

function send_contact_email(array $config, string $to, string $subject, string $body, string $replyTo): bool
{
    $fromEmail = (string) ($config['from_email'] ?? $to);
    $fromName = (string) ($config['from_name'] ?? 'Romero Digital Labs Website');
    $smtp = $config['smtp'] ?? [];
    $smtpPassword = trim((string) ($smtp['password'] ?? ''));

    if ($smtpPassword !== '') {
        try {
            $mailer = new SmtpMailer(
                (string) ($smtp['host'] ?? 'smtp.hostinger.com'),
                (int) ($smtp['port'] ?? 587),
                (string) ($smtp['username'] ?? $fromEmail),
                $smtpPassword,
                (string) ($smtp['encryption'] ?? 'tls'),
            );
            return $mailer->send($to, $subject, $body, $fromEmail, $fromName, $replyTo);
        } catch (Throwable) {
            return false;
        }
    }

    $headers = implode("\r\n", [
        'MIME-Version: 1.0',
        'From: ' . $fromName . ' <' . $fromEmail . '>',
        'Reply-To: ' . $replyTo,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'X-Auto-Response-Suppress: All',
    ]);

    return @mail($to, $subject, $body, $headers, '-f' . $fromEmail);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
    exit;
}

$returnPath = resolve_return_path();

if (!empty($_POST['_honey'] ?? '')) {
    respond(true, '', 200, $returnPath);
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$business = trim((string) ($_POST['business'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$service = trim((string) ($_POST['service'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    respond(false, 'Please fill in your name, email, and message.', 400, $returnPath);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 400, $returnPath);
    exit;
}

if (strlen($name) > 120 || strlen($email) > 254 || strlen($business) > 160 || strlen($phone) > 40 || strlen($service) > 80 || strlen($message) > 5000) {
    respond(false, 'One or more fields are too long.', 400, $returnPath);
    exit;
}

$config = load_contact_config();
$to = (string) ($config['to'] ?? 'contact@romerodigitallabs.com');
$subject = 'Website Quote Request — ' . $name;

$bodyLines = [
    'New website services inquiry',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
];

if ($business !== '') {
    $bodyLines[] = 'Business: ' . $business;
}
if ($phone !== '') {
    $bodyLines[] = 'Phone: ' . $phone;
}
if ($service !== '') {
    $bodyLines[] = 'Service interest: ' . $service;
}

$bodyLines[] = '';
$bodyLines[] = 'Message:';
$bodyLines[] = $message;
$bodyLines[] = '';
$bodyLines[] = '—';
$bodyLines[] = 'Sent from romerodigitallabs.com website services form';

$body = implode("\n", $bodyLines);
$replyTo = format_reply_to($name, $email);

$sent = send_contact_email($config, $to, $subject, $body, $replyTo);

if (!$sent) {
    respond(false, 'Unable to send your message right now. Please email contact@romerodigitallabs.com directly.', 500, $returnPath);
    exit;
}

respond(true, '', 200, $returnPath);
