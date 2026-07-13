<?php

declare(strict_types=1);

/**
 * Minimal SMTP client for transactional form mail (AUTH LOGIN + STARTTLS).
 */
final class SmtpMailer
{
    private $socket;

    public function __construct(
        private readonly string $host,
        private readonly int $port,
        private readonly string $username,
        private readonly string $password,
        private readonly string $encryption = 'tls',
    ) {}

    public function send(
        string $to,
        string $subject,
        string $body,
        string $fromEmail,
        string $fromName,
        ?string $replyTo = null,
    ): bool {
        $this->connect();
        $this->expect(220);

        $this->command('EHLO ' . $this->clientHost(), [250]);
        $this->startTlsIfNeeded();
        $this->command('EHLO ' . $this->clientHost(), [250]);
        $this->authenticate();

        $fromEmail = $this->sanitizeEmail($fromEmail);
        $to = $this->sanitizeEmail($to);

        $this->command('MAIL FROM:<' . $fromEmail . '>', [250]);
        $this->command('RCPT TO:<' . $to . '>', [250, 251]);
        $this->command('DATA', [354]);

        $encodedSubject = $this->encodeHeader($subject);
        $fromHeader = $this->formatAddress($fromEmail, $fromName);

        $headers = [
            'Date: ' . gmdate('D, d M Y H:i:s') . ' +0000',
            'From: ' . $fromHeader,
            'To: <' . $to . '>',
            'Subject: ' . $encodedSubject,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            'Message-ID: <' . bin2hex(random_bytes(16)) . '@romerodigitallabs.com>',
            'X-Auto-Response-Suppress: All',
        ];

        if ($replyTo) {
            $headers[] = 'Reply-To: ' . $replyTo;
        }

        $message = implode("\r\n", $headers) . "\r\n\r\n" . $this->normalizeBody($body) . "\r\n.";
        $this->write($message . "\r\n");
        $this->expect(250);
        $this->command('QUIT', [221]);
        $this->disconnect();

        return true;
    }

    private function connect(): void
    {
        $remote = $this->encryption === 'ssl'
            ? 'ssl://' . $this->host . ':' . $this->port
            : $this->host . ':' . $this->port;

        $this->socket = @stream_socket_client(
            $remote,
            $errno,
            $errstr,
            20,
            STREAM_CLIENT_CONNECT,
        );

        if (!$this->socket) {
            throw new RuntimeException('SMTP connection failed: ' . $errstr);
        }

        stream_set_timeout($this->socket, 20);
    }

    private function startTlsIfNeeded(): void
    {
        if ($this->encryption !== 'tls') {
            return;
        }

        $this->command('STARTTLS', [220]);
        $crypto = stream_socket_enable_crypto(
            $this->socket,
            true,
            STREAM_CRYPTO_METHOD_TLS_CLIENT,
        );

        if ($crypto !== true) {
            throw new RuntimeException('SMTP STARTTLS failed.');
        }
    }

    private function authenticate(): void
    {
        $this->command('AUTH LOGIN', [334]);
        $this->command(base64_encode($this->username), [334]);
        $this->command(base64_encode($this->password), [235]);
    }

    private function command(string $command, array $expectedCodes): void
    {
        $this->write($command . "\r\n");
        $this->expect($expectedCodes);
    }

    private function write(string $data): void
    {
        if (@fwrite($this->socket, $data) === false) {
            throw new RuntimeException('SMTP write failed.');
        }
    }

    private function expect(int|array $codes): void
    {
        $expected = is_array($codes) ? $codes : [$codes];
        $response = '';

        while (($line = fgets($this->socket, 515)) !== false) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        if ($response === '') {
            throw new RuntimeException('SMTP empty response.');
        }

        $code = (int) substr($response, 0, 3);
        if (!in_array($code, $expected, true)) {
            throw new RuntimeException('SMTP error ' . $code . ': ' . trim($response));
        }
    }

    private function disconnect(): void
    {
        if (is_resource($this->socket)) {
            fclose($this->socket);
        }
        $this->socket = null;
    }

    private function clientHost(): string
    {
        return preg_replace('/[^a-zA-Z0-9.-]/', '', $_SERVER['SERVER_NAME'] ?? 'romerodigitallabs.com') ?: 'romerodigitallabs.com';
    }

    private function sanitizeEmail(string $email): string
    {
        $email = trim($email);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email address.');
        }
        return $email;
    }

    private function formatAddress(string $email, string $name): string
    {
        $name = trim(str_replace(["\r", "\n"], '', $name));
        if ($name === '') {
            return '<' . $email . '>';
        }
        return $this->encodeHeader($name) . ' <' . $email . '>';
    }

    private function encodeHeader(string $value): string
    {
        if (preg_match('/[^\x20-\x7E]/', $value)) {
            return '=?UTF-8?B?' . base64_encode($value) . '?=';
        }
        return $value;
    }

    private function normalizeBody(string $body): string
    {
        $body = str_replace(["\r\n", "\r"], "\n", $body);
        $body = preg_replace("/\n\./", "\n..", $body) ?? $body;
        return str_replace("\n", "\r\n", $body);
    }
}
