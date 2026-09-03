<?php
/**
 * Demo seed: products + stock logs + 20 sales spread across 7 days (ending today).
 * Run:  php backend/sql/seed_demo.php   (or via browser)
 *
 * Safe to run once. Uses DEMO- SKU prefix so it can be detected/re-seeded.
 */
require_once __DIR__ . '/../config.php';

$pdo = db();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Guard: only seed once
$already = (int) $pdo->query("SELECT COUNT(*) FROM products WHERE sku LIKE 'DEMO-%'")->fetchColumn();
if ($already > 0) {
    respond(['error' => 'Demo data already exists. Delete products with DEMO- SKUs first to reseed.']);
}

// ---- 1. Ensure the standard categories exist ----
function ensureCat($pdo, $name) {
    $s = $pdo->prepare('SELECT id FROM categories WHERE name = :n');
    $s->execute([':n' => $name]);
    $id = $s->fetchColumn();
    if (!$id) {
        $s = $pdo->prepare('INSERT INTO categories (name) VALUES (:n)');
        $s->execute([':n' => $name]);
        $id = (int) $pdo->lastInsertId();
    }
    return (int) $id;
}
$catMakanan = ensureCat($pdo, 'Makanan');
$catMinuman = ensureCat($pdo, 'Minuman');
$catSnack   = ensureCat($pdo, 'Snack');

// ---- 2. Products (initial stock high enough to never go negative) ----
$products = [
    ['sku' => 'DEMO-FD-001', 'name' => 'Nasi Goreng Spesial KRK', 'cat' => $catMakanan, 'price' => 25000, 'stock' => 80],
    ['sku' => 'DEMO-FD-002', 'name' => 'Ayam Geprek Sambal Bawang', 'cat' => $catMakanan, 'price' => 20000, 'stock' => 60],
    ['sku' => 'DEMO-FD-003', 'name' => 'Mie Goreng Jawa', 'cat' => $catMakanan, 'price' => 18000, 'stock' => 55],
    ['sku' => 'DEMO-FD-004', 'name' => 'Roti Bakar Coklat Keju', 'cat' => $catMakanan, 'price' => 15000, 'stock' => 45],
    ['sku' => 'DEMO-DR-001', 'name' => 'Kopi Susu Gula Aren', 'cat' => $catMinuman, 'price' => 18000, 'stock' => 120],
    ['sku' => 'DEMO-DR-002', 'name' => 'Americano', 'cat' => $catMinuman, 'price' => 15000, 'stock' => 100],
    ['sku' => 'DEMO-DR-003', 'name' => 'Matcha Latte', 'cat' => $catMinuman, 'price' => 22000, 'stock' => 70],
    ['sku' => 'DEMO-DR-004', 'name' => 'Es Teh Manis', 'cat' => $catMinuman, 'price' => 6000, 'stock' => 150],
    ['sku' => 'DEMO-DR-005', 'name' => 'Jeruk Peras', 'cat' => $catMinuman, 'price' => 12000, 'stock' => 90],
    ['sku' => 'DEMO-SN-001', 'name' => 'Pisang Goreng Keju', 'cat' => $catSnack, 'price' => 12000, 'stock' => 65],
    ['sku' => 'DEMO-SN-002', 'name' => 'Kentang Goreng', 'cat' => $catSnack, 'price' => 15000, 'stock' => 60],
    ['sku' => 'DEMO-SN-003', 'name' => 'Kroket Keju', 'cat' => $catSnack, 'price' => 13000, 'stock' => 50],
];

// Product stock_logs are inserted relative to a few days back
$now = new DateTime();
$productStart = (clone $now)->modify('-3 days');

$running = [];          // product_id -> current running stock
$insProd = $pdo->prepare(
    'INSERT INTO products (sku, name, category_id, price, stock_qty, image_url, is_active, created_at)
     VALUES (:sku, :name, :cat, :price, :stock, NULL, 1, :created)'
);
$insLog = $pdo->prepare(
    'INSERT INTO stock_logs (product_id, product_name, change_qty, reason, user_name, note, created_at)
     VALUES (:pid, :pname, :cq, :reason, :user, :note, :created)'
);
$adminUser = '10000000-0000-0000-0000-000000000001';

foreach ($products as $p) {
    // Spread product creation timestamps
    $created = (clone $productStart)->modify('+' . rand(0, 40) . ' hours')->format('Y-m-d H:i:s');

    $insProd->execute([
        ':sku' => $p['sku'], ':name' => $p['name'], ':cat' => $p['cat'],
        ':price' => $p['price'], ':stock' => $p['stock'], ':created' => $created,
    ]);
    $pid = (int) $pdo->lastInsertId();
    $running[$pid] = $p['stock'];

    // Initial stock-entry log (restock)
    $insLog->execute([
        ':pid' => $pid, ':pname' => $p['name'], ':cq' => $p['stock'],
        ':reason' => 'adjustment', ':user' => 'Owner / Manager Admin',
        ':note' => 'Stok awal (demo)', ':created' => $created,
    ]);
}

// ---- 3. Sales spread across the last 7 days (ending today) ----
$userIds = $pdo->query('SELECT id FROM users')->fetchAll(PDO::FETCH_COLUMN);
$payMethods = ['cash', 'cash', 'cash', 'qris', 'qris', 'debit', 'transfer'];

// Day offset (0=today ... 6) => number of sales that day
$dayPlan = [4, 3, 3, 2, 2, 3, 3]; // total = 20
$prodIds = array_keys($running);

$insSale = $pdo->prepare(
    'INSERT INTO sales (receipt_number, cashier_id, total_amount, payment_method, status, created_at)
     VALUES (:rc, :cid, :total, :pay, :status, :created)'
);
$insItem = $pdo->prepare(
    'INSERT INTO sale_items (sale_id, product_id, product_name, qty, price_at_sale)
     VALUES (:sid, :pid, :pname, :qty, :price)'
);

$saleCount = 0;
foreach ($dayPlan as $offset => $salesOnDay) {
    $day = (clone $now)->modify("-{$offset} days");
    $datePart = $day->format('Ymd');

    for ($i = 0; $i < $salesOnDay; $i++) {
        // Time of day 08:00–21:30, skew toward midday
        $hour = rand(8, 21);
        $minute = rand(0, 59);
        $created = (clone $day)->setTime($hour, $minute)->format('Y-m-d H:i:s');

        // Build the sale: 1–3 items
        $items = [];
        $lineCount = rand(1, 3);
        $shuffled = $prodIds;
        shuffle($shuffled);
        $picked = array_slice($shuffled, 0, $lineCount);

        foreach ($picked as $pid) {
            $maxCanSell = min(3, $running[$pid]);       // never exceed available stock
            if ($maxCanSell <= 0) continue;
            $qty = rand(1, $maxCanSell);
            $price = (int) $pdo->query("SELECT price FROM products WHERE id={$pid}")->fetchColumn();
            $running[$pid] -= $qty;
            $items[] = ['pid' => $pid, 'qty' => $qty, 'price' => $price];
        }
        if (empty($items)) continue;

        $total = array_sum(array_map(fn($it) => $it['qty'] * $it['price'], $items));

        // Unique receipt number
        do {
            $rc = 'KRK-' . $datePart . '-' . str_pad((string) rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $dup = $pdo->prepare('SELECT COUNT(*) FROM sales WHERE receipt_number = :rc');
            $dup->execute([':rc' => $rc]);
        } while ((int) $dup->fetchColumn() > 0);

        $pay   = $payMethods[array_rand($payMethods)];
        $cashier = $userIds[array_rand($userIds)];

        $insSale->execute([
            ':rc' => $rc, ':cid' => $cashier, ':total' => $total,
            ':pay' => $pay, ':status' => 'completed', ':created' => $created,
        ]);
        $saleId = (int) $pdo->lastInsertId();

        foreach ($items as $it) {
            $insItem->execute([
                ':sid' => $saleId, ':pid' => $it['pid'],
                ':pname' => $pdo->query("SELECT name FROM products WHERE id={$it['pid']}")->fetchColumn(),
                ':qty' => $it['qty'], ':price' => $it['price'],
            ]);
            // Sale stock log (negative)
            $insLog->execute([
                ':pid' => $it['pid'],
                ':pname' => $pdo->query("SELECT name FROM products WHERE id={$it['pid']}")->fetchColumn(),
                ':cq' => -$it['qty'], ':reason' => 'sale', ':user' => '',
                ':note' => 'Penjualan POS ' . $rc, ':created' => $created,
            ]);
        }

        $saleCount++;
    }
}

// ---- 4. Persist final running stock to product rows ----
$updStock = $pdo->prepare('UPDATE products SET stock_qty = :stock WHERE id = :id');
foreach ($products as $p) {
    $pid = (int) $pdo->query("SELECT id FROM products WHERE sku = '{$p['sku']}'")->fetchColumn();
    $updStock->execute([':stock' => $running[$pid], ':id' => $pid]);
}

echo "Inserted $saleCount sales across 7 days.\n";
echo "Final product stock updated.\n";

respond(['success' => true, 'products' => count($products), 'sales' => $saleCount]);