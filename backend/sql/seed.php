<?php
/**
 * Kedai Rasa Kita POS — MySQL seed script.
 *
 * Inserts the two default testing accounts (admin + cashier) with properly
 * bcrypt-hashed passwords (via PHP password_hash). Run from the browser or CLI:
 *
 *   http://localhost/kedai-rasa-kita-pos-website/backend/sql/seed.php
 *   php backend/sql/seed.php
 *
 * The schema (backend/sql/schema.sql) must be imported first.
 */

require_once __DIR__ . '/../config.php';

$pdo = db();

$accounts = [
    [
        'email'    => 'admin@rasakita.id',
        'password' => 'password123',
        'name'     => 'Owner / Manager Admin',
        'role'     => 'admin',
        'id'       => '10000000-0000-0000-0000-000000000001',
    ],
    [
        'email'    => 'kasir@rasakita.id',
        'password' => 'password123',
        'name'     => 'Kasir Utama',
        'role'     => 'cashier',
        'id'       => '20000000-0000-0000-0000-000000000002',
    ],
];

$inserted = 0;
$updated  = 0;

foreach ($accounts as $acc) {
    $hash = password_hash($acc['password'], PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        'INSERT INTO users (id, email, password_hash, name, role, is_active)
         VALUES (:id, :email, :hash, :name, :role, 1)
         ON DUPLICATE KEY UPDATE
           -- Do NOT overwrite password_hash: a changed password is preserved.
           name          = VALUES(name),
           role          = VALUES(role),
           is_active     = 1'
    );
    $stmt->execute([
        ':id'    => $acc['id'],
        ':email' => $acc['email'],
        ':hash'  => $hash,
        ':name'  => $acc['name'],
        ':role'  => $acc['role'],
    ]);

    if ($stmt->rowCount() === 1) {
        $inserted++;
    } else {
        $updated++;
    }
}

echo json_encode([
    'success' => true,
    'inserted' => $inserted,
    'updated'  => $updated,
    'accounts' => array_map(function ($a) {
        return ['email' => $a['email'], 'role' => $a['role']];
    }, $accounts),
    'note' => 'Admin: admin@rasakita.id / password123 | Cashier: kasir@rasakita.id / password123',
], JSON_PRETTY_PRINT);