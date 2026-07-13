<?php
/**
 * Copy to contact-config.php and add your Hostinger mailbox password.
 * Authenticated SMTP greatly improves deliverability vs PHP mail().
 */
return [
    'to' => 'contact@romerodigitallabs.com',
    'from_email' => 'contact@romerodigitallabs.com',
    'from_name' => 'Romero Digital Labs Website',

    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 587,
        'username' => 'contact@romerodigitallabs.com',
        'password' => '', // Hostinger mailbox password for contact@
        'encryption' => 'tls', // tls or ssl (use port 465 for ssl)
    ],
];
