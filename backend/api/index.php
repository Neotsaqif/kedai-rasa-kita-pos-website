<?php
/**
 * Kedai Rasa Kita POS — MySQL REST API (single entry point).
 *
 * All requests are POSTed to this file with ?action=<name>. The JSON request
 * body carries the parameters. Shared helpers live in ../config.php.
 *
 * Examples:
 *   POST backend/api/index.php?action=login
 *   POST backend/api/index.php?action=get_products
 *   POST backend/api/index.php?action=process_checkout
 */

require_once __DIR__ . '/../config.php';

$pdo = db();
$action = isset($_GET['action']) ? $_GET['action'] : '';
$in = body();

// =====================================================================
// AUTH GATE
// ---------------------------------------------------------------------
// `login` is the only public action. Every other action requires a valid
// bearer token (server-side session). Admin-only actions additionally
// require an `admin` role. The gate runs BEFORE the switch so no protected
// action can be reached without authentication.
// =====================================================================
$publicActions = ['login'];
$adminOnlyActions = [
    'get_profiles',           // staff list (admin UI)
    'create_cashier',
    'toggle_user_active',
    'create_category',
    'update_category',
    'delete_category',
    'create_product',
    'update_product',
    'delete_product',
    'toggle_product_active',
    'adjust_stock',
    'upload_image',
    'approve_refund',
    'get_stock_logs',
];

$authUser = null;
if (!in_array($action, $publicActions, true)) {
    $authUser = require_auth($pdo);
}
if (in_array($action, $adminOnlyActions, true)) {
    require_admin($pdo);
}

switch ($action) {

    // =================================================================
    // AUTH
    // =================================================================

    case 'login': {
        $email    = isset($in['email']) ? trim($in['email']) : '';
        $password = isset($in['password']) ? $in['password'] : '';

        if ($email === '' || $password === '') {
            fail('Email dan password wajib diisi.');
        }

        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            fail('Email atau password salah.', 401);
        }

        if ((int) $user['is_active'] !== 1) {
            fail('Akun ini nonaktif. Hubungi admin.', 403);
        }

        // Issue a server-side session token (64 hex chars) so subsequent calls
        // can be authenticated and the role cannot be forged on the client.
        $token = create_session($pdo, $user['id']);

        unset($user['password_hash']);
        respond(['user' => normalizeUser($user), 'token' => $token, 'success' => true]);
    }

    case 'logout': {
        // Revoke the current server-side session.
        $auth = bearer_token();
        if ($auth) {
            $stmt = $pdo->prepare('DELETE FROM sessions WHERE token = :token');
            $stmt->execute([':token' => $auth]);
        }
        respond(['success' => true]);
    }

    // =================================================================
    // STAFF / USERS (admin)
    // =================================================================

    case 'get_profiles': {
        $rows = $pdo->query(
            'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        )->fetchAll();
        respond(array_map('normalizeUser', $rows));
    }

    case 'create_cashier': {
        $name     = isset($in['name']) ? trim($in['name']) : '';
        $email    = isset($in['email']) ? trim($in['email']) : '';
        $password = isset($in['password']) ? $in['password'] : '';

        if ($name === '' || $email === '' || $password === '') {
            fail('Nama, email, dan password wajib diisi.');
        }
        if (strlen($password) < 6) {
            fail('Password minimal 6 karakter.');
        }

        $id = uuid();
        $hash = password_hash($password, PASSWORD_BCRYPT);

        try {
            $stmt = $pdo->prepare(
                'INSERT INTO users (id, email, password_hash, name, role, is_active)
                 VALUES (:id, :email, :hash, :name, :role, 1)'
            );
            $stmt->execute([
                ':id'    => $id,
                ':email' => $email,
                ':hash'  => $hash,
                ':name'  => $name,
                ':role'  => 'cashier',
            ]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                fail('Email sudah terdaftar.');
            }
            throw $e;
        }

        respond(['success' => true, 'id' => $id, 'user' => [
            'id' => $id, 'email' => $email, 'name' => $name, 'role' => 'cashier', 'is_active' => true,
        ]]);
    }

    case 'toggle_user_active': {
        $id       = isset($in['id']) ? $in['id'] : '';
        $isActive = !empty($in['is_active']) ? 1 : 0;
        if ($id === '') fail('ID user wajib diisi.');

        $stmt = $pdo->prepare('UPDATE users SET is_active = :active WHERE id = :id');
        $stmt->execute([':active' => $isActive, ':id' => $id]);
        respond(['success' => true]);
    }

    // =================================================================
    // CATEGORIES
    // =================================================================

    case 'get_categories': {
        $rows = $pdo->query('SELECT id, name, created_at FROM categories ORDER BY name ASC')->fetchAll();
        respond($rows);
    }

    case 'create_category': {
        $name = isset($in['name']) ? trim($in['name']) : '';
        if ($name === '') fail('Nama kategori wajib diisi.');
        if (categoryExists($pdo, $name)) fail('Kategori dengan nama tersebut sudah ada.');

        $stmt = $pdo->prepare('INSERT INTO categories (name) VALUES (:name)');
        $stmt->execute([':name' => $name]);
        respond(['success' => true, 'id' => (int) $pdo->lastInsertId()]);
    }

    case 'update_category': {
        $id   = isset($in['id']) ? (int) $in['id'] : 0;
        $name = isset($in['name']) ? trim($in['name']) : '';
        if ($id <= 0 || $name === '') fail('Data kategori tidak valid.');
        if (categoryExists($pdo, $name, $id)) fail('Kategori dengan nama tersebut sudah ada.');

        $stmt = $pdo->prepare('UPDATE categories SET name = :name WHERE id = :id');
        $stmt->execute([':name' => $name, ':id' => $id]);
        respond(['success' => true]);
    }

    case 'delete_category': {
        $id = isset($in['id']) ? (int) $in['id'] : 0;
        if ($id <= 0) fail('ID kategori tidak valid.');
        $stmt = $pdo->prepare('DELETE FROM categories WHERE id = :id');
        $stmt->execute([':id' => $id]);
        respond(['success' => true]);
    }

    // =================================================================
    // PRODUCTS
    // =================================================================

    case 'get_products': {
        $rows = $pdo->query(
            'SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             ORDER BY p.name ASC'
        )->fetchAll();

        $products = array_map(function ($p) {
            $p['category_id'] = $p['category_id'] !== null ? (int) $p['category_id'] : null;
            $p['price']       = (float) $p['price'];
            $p['stock_qty']   = (int) $p['stock_qty'];
            $p['is_active']   = (int) $p['is_active'] === 1;
            $p['categories']  = $p['category_name'] !== null ? ['name' => $p['category_name']] : null;
            unset($p['category_name']);
            return $p;
        }, $rows);

        respond($products);
    }

    case 'create_product':
    case 'update_product': {
        $id         = isset($in['id']) ? (int) $in['id'] : 0;
        $name       = isset($in['name']) ? trim($in['name']) : '';
        $sku        = isset($in['sku']) && $in['sku'] !== '' ? $in['sku'] : null;
        $categoryId = isset($in['category_id']) && $in['category_id'] !== '' ? (int) $in['category_id'] : null;
        $price      = isset($in['price']) ? (float) $in['price'] : 0;
        $stockQty   = isset($in['stock_qty']) ? (int) $in['stock_qty'] : 0;
        $imageUrl   = isset($in['image_url']) && $in['image_url'] !== '' ? $in['image_url'] : null;
        $isActive   = isset($in['is_active']) ? ((int) $in['is_active'] === 1 ? 1 : 0) : 1;

        if ($name === '') fail('Nama produk wajib diisi.');
        if ($price < 0) fail('Harga produk tidak boleh negatif.');
        if ($stockQty < 0) fail('Stok produk tidak boleh negatif.');
        if ($categoryId === 0) $categoryId = null;

        if ($action === 'create_product') {
            $stmt = $pdo->prepare(
                'INSERT INTO products (sku, name, category_id, price, stock_qty, image_url, is_active)
                 VALUES (:sku, :name, :category, :price, :stock, :image, :active)'
            );
            $stmt->execute([
                ':sku' => $sku, ':name' => $name, ':category' => $categoryId,
                ':price' => $price, ':stock' => $stockQty, ':image' => $imageUrl, ':active' => $isActive,
            ]);
            respond(['success' => true, 'id' => (int) $pdo->lastInsertId()]);
        }

        if ($id <= 0) fail('ID produk tidak valid.');
        $stmt = $pdo->prepare(
            'UPDATE products
             SET sku = :sku, name = :name, category_id = :category, price = :price,
                 stock_qty = :stock, image_url = :image, is_active = :active
             WHERE id = :id'
        );
        $stmt->execute([
            ':sku' => $sku, ':name' => $name, ':category' => $categoryId,
            ':price' => $price, ':stock' => $stockQty, ':image' => $imageUrl, ':active' => $isActive,
            ':id' => $id,
        ]);
        respond(['success' => true]);
    }

    case 'toggle_product_active': {
        $id     = isset($in['id']) ? (int) $in['id'] : 0;
        $active = !empty($in['is_active']) ? 1 : 0;
        if ($id <= 0) fail('ID produk tidak valid.');

        $stmt = $pdo->prepare('UPDATE products SET is_active = :active WHERE id = :id');
        $stmt->execute([':active' => $active, ':id' => $id]);
        respond(['success' => true]);
    }

    case 'delete_product': {
        $id = isset($in['id']) ? (int) $in['id'] : 0;
        if ($id <= 0) fail('ID produk tidak valid.');

        // Grab the image URL before the row is removed so we can delete the file.
        $stmt = $pdo->prepare('SELECT image_url FROM products WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch();
        if (!$product) fail('Produk tidak ditemukan.', 404);

        $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute([':id' => $id]);

        // Remove the uploaded image file (if any) when it lives in the uploads dir.
        if (!empty($product['image_url'])) {
            $fileName = basename(parse_url($product['image_url'], PHP_URL_PATH));
            $uploadPath = realpath(__DIR__ . '/../uploads/') . DIRECTORY_SEPARATOR . $fileName;
            $uploadsDir = realpath(__DIR__ . '/../uploads/');

            if (
                $fileName !== ''
                && $uploadsDir !== false
                && strpos(realpath($uploadPath) ?: '', $uploadsDir . DIRECTORY_SEPARATOR) === 0
                && is_file($uploadPath)
            ) {
                @unlink($uploadPath);
            }
        }

        respond(['success' => true]);
    }

    case 'upload_image': {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            fail('Gagal mengunggah file.');
        }

        $file = $_FILES['image'];

        // Strict File Content Validation: Magic Bytes
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        // Map the *verified* MIME type to a safe extension. The extension is
        // NEVER taken from the client filename, so a renamed polyglot cannot
        // be saved as .php/.phtml and executed.
        $extByMime = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/gif'  => 'gif',
        ];
        if (!isset($extByMime[$mime])) {
            fail('Format file tidak didukung (invalid magic bytes).');
        }
        $extension = $extByMime[$mime];

        $newFilename = uniqid('prod_', true) . '.' . $extension;
        $uploadDir = __DIR__ . '/../uploads/';
        $uploadPath = $uploadDir . $newFilename;

        if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
            fail('Gagal menyimpan file.');
        }

        // Build a scheme-aware URL so it works over both HTTP and HTTPS.
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            ? 'https'
            : 'http';
        $imageUrl = $scheme . '://' . $_SERVER['HTTP_HOST'] . '/kedai-rasa-kita-pos-website/backend/uploads/' . $newFilename;
        respond(['success' => true, 'image_url' => $imageUrl]);
    }

    case 'adjust_stock': {
        // `change_qty` is the authoritative delta. Accept `new_stock` (absolute
        // target) if provided, but recompute it from the delta so a missing/
        // inconsistent value can never silently zero or corrupt stock.
        $id        = isset($in['product_id']) ? (int) $in['product_id'] : 0;
        $name      = isset($in['product_name']) ? $in['product_name'] : '';
        $changeQty = isset($in['change_qty']) ? (int) $in['change_qty'] : 0;
        $reason    = isset($in['reason']) ? trim($in['reason']) : '';
        $userName  = isset($in['user_name']) ? $in['user_name'] : '';
        $note      = isset($in['note']) ? $in['note'] : '';

        if ($id <= 0 || $changeQty === 0) fail('Data penyesuaian stok tidak valid.');
        if ($reason === '') fail('Alasan penyesuaian stok wajib diisi.');

        $pdo->beginTransaction();
        try {
            $prodStmt = $pdo->prepare('SELECT stock_qty, name FROM products WHERE id = :id FOR UPDATE');
            $prodStmt->execute([':id' => $id]);
            $prod = $prodStmt->fetch();
            if (!$prod) {
                $pdo->rollBack();
                fail('Produk tidak ditemukan.', 404);
            }

            $newStock = (int) $prod['stock_qty'] + $changeQty;
            if ($newStock < 0) {
                $pdo->rollBack();
                fail('Stok tidak dapat menjadi negatif. Stok saat ini: ' . (int) $prod['stock_qty'], 400);
            }

            $stmt = $pdo->prepare('UPDATE products SET stock_qty = :stock WHERE id = :id');
            $stmt->execute([':stock' => $newStock, ':id' => $id]);

            $stmt = $pdo->prepare(
                'INSERT INTO stock_logs (product_id, product_name, change_qty, reason, user_name, note)
                 VALUES (:pid, :pname, :change, :reason, :user, :note)'
            );
            $stmt->execute([
                ':pid' => $id, ':pname' => $name !== '' ? $name : (isset($prod['name']) ? $prod['name'] : ''),
                ':change' => $changeQty,
                ':reason' => $reason, ':user' => $userName, ':note' => $note,
            ]);

            $pdo->commit();
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
        respond(['success' => true, 'stock_qty' => $newStock]);
    }

    // =================================================================
    // SALES / TRANSACTIONS
    // =================================================================

    case 'get_sales': {
        // Non-admins are always restricted to their own sales (server-enforced,
        // regardless of any client-supplied cashier_id). Admins may filter.
        $requestedCashier = isset($in['cashier_id']) && $in['cashier_id'] !== '' ? $in['cashier_id'] : null;
        $cashierId = ($authUser['role'] === 'admin') ? $requestedCashier : $authUser['id'];

        $sql = 'SELECT s.*, u.name AS cashier_name
                FROM sales s
                LEFT JOIN users u ON u.id = s.cashier_id';
        if ($cashierId) {
            $sql .= ' WHERE s.cashier_id = :cashier';
        }
        $sql .= ' ORDER BY s.created_at DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($cashierId ? [':cashier' => $cashierId] : []);
        $sales = $stmt->fetchAll();

        foreach ($sales as &$sale) {
            $sale['cashier_name'] = $sale['cashier_name'] ?: 'Kasir POS';
            $sale['total_amount'] = (float) $sale['total_amount'];
            $items = $pdo->prepare(
                'SELECT id, product_id, product_name, qty AS quantity, price_at_sale
                 FROM sale_items WHERE sale_id = :sale_id'
            );
            $items->execute([':sale_id' => $sale['id']]);
            $rows = $items->fetchAll();
            foreach ($rows as &$row) {
                $row['price_at_sale'] = (float) $row['price_at_sale'];
                $row['subtotal']      = $row['price_at_sale'] * (int) $row['quantity'];
                $row['product_id']    = (int) $row['product_id'];
            }
            unset($row);
            $sale['transaction_items'] = $rows;
        }
        unset($sale);

        respond($sales);
    }

    case 'request_refund': {
        $id     = isset($in['id']) ? (int) $in['id'] : 0;
        $reason = isset($in['reason']) ? trim($in['reason']) : '';
        if ($id <= 0 || $reason === '') fail('Data refund tidak valid.');

        // Only the cashier who processed the sale (or an admin) may request a refund.
        $check = $pdo->prepare('SELECT cashier_id, status FROM sales WHERE id = :id FOR UPDATE');
        $check->execute([':id' => $id]);
        $sale = $check->fetch();
        if (!$sale) fail('Transaksi tidak ditemukan.', 404);
        if ($authUser['role'] !== 'admin' && $sale['cashier_id'] !== $authUser['id']) {
            fail('Anda tidak berhak mengajukan refund untuk transaksi ini.', 403);
        }
        if ($sale['status'] !== 'completed') {
            fail('Refund hanya dapat diajukan untuk transaksi selesai (completed).', 400);
        }

        $stmt = $pdo->prepare('UPDATE sales SET status = :status, notes = :note WHERE id = :id');
        $stmt->execute([
            ':status' => 'refund_requested',
            ':note'   => 'Refund Request: ' . $reason,
            ':id'     => $id,
        ]);
        respond(['success' => true]);
    }

    case 'approve_refund': {
        $id = isset($in['id']) ? (int) $in['id'] : 0;
        if ($id <= 0) fail('ID transaksi tidak valid.');

        // Restore sold quantities to stock and log them, atomically with the
        // status change. Only a sale in `refund_requested` state can be approved.
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                'SELECT id, status, cashier_id FROM sales WHERE id = :id FOR UPDATE'
            );
            $stmt->execute([':id' => $id]);
            $sale = $stmt->fetch();
            if (!$sale) {
                $pdo->rollBack();
                fail('Transaksi tidak ditemukan.', 404);
            }
            if ($sale['status'] !== 'refund_requested') {
                $pdo->rollBack();
                fail('Refund hanya dapat disetujui untuk transaksi berstatus refund_requested.', 400);
            }

            // Fetch line items to know what to restock.
            $itemStmt = $pdo->prepare(
                'SELECT product_id, product_name, qty FROM sale_items WHERE sale_id = :sale'
            );
            $itemStmt->execute([':sale' => $id]);
            $items = $itemStmt->fetchAll();

            $updStmt = $pdo->prepare('UPDATE products SET stock_qty = stock_qty + :qty WHERE id = :pid');
            $logStmt = $pdo->prepare(
                'INSERT INTO stock_logs (product_id, product_name, change_qty, reason, user_name, note)
                 VALUES (:pid, :pname, :cq, :reason, :user, :note)'
            );
            foreach ($items as $it) {
                if (!$it['product_id']) continue;
                $updStmt->execute([':qty' => (int) $it['qty'], ':pid' => (int) $it['product_id']]);
                $logStmt->execute([
                    ':pid'    => (int) $it['product_id'],
                    ':pname'  => $it['product_name'],
                    ':cq'     => (int) $it['qty'],
                    ':reason' => 'refund',
                    ':user'   => $authUser['name'] ?? '',
                    ':note'   => 'Refund transaksi #' . $sale['id'],
                ]);
            }

            $updSale = $pdo->prepare('UPDATE sales SET status = :status WHERE id = :id');
            $updSale->execute([':status' => 'refunded', ':id' => $id]);

            $pdo->commit();
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
        respond(['success' => true]);
    }

    case 'process_checkout': {
        $receiptNumber = isset($in['p_receipt_number']) ? (string) $in['p_receipt_number'] : '';
        $paymentMethod = isset($in['p_payment_method']) ? $in['p_payment_method'] : 'cash';
        $items         = isset($in['p_items']) && is_array($in['p_items']) ? $in['p_items'] : [];

        // Cashier is always the authenticated user — never trusted from the client.
        $cashierId = $authUser['id'];

        if ($receiptNumber === '' || count($items) === 0) {
            fail('Data checkout tidak valid.');
        }
        $allowedPay = ['cash', 'qris', 'debit', 'transfer'];
        if (!in_array($paymentMethod, $allowedPay, true)) {
            fail('Metode pembayaran tidak dikenali.');
        }

        // ------------------------------------------------------------------
        // Resolve authoritative product data from the DB. Prices, names and
        // stock are taken from the server, not the client, so a forged request
        // cannot set its own price or total.
        // ------------------------------------------------------------------
        $ids = [];
        foreach ($items as $item) {
            $pid = (int) ($item['product_id'] ?? 0);
            $qty = (int) ($item['qty'] ?? 0);
            if ($pid <= 0 || $qty <= 0) {
                fail('Jumlah item tidak valid.');
            }
            $ids[$pid] = $pid;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $lookup = $pdo->prepare(
            'SELECT id, name, price, stock_qty, is_active FROM products WHERE id IN (' . $placeholders . ')'
        );
        $lookup->execute(array_values($ids));
        $map = [];
        foreach ($lookup->fetchAll() as $row) {
            $map[(int) $row['id']] = $row;
        }

        $resolved = [];
        foreach ($items as $item) {
            $pid = (int) ($item['product_id'] ?? 0);
            $qty = (int) ($item['qty'] ?? 0);

            if (!isset($map[$pid])) {
                fail('Produk tidak ditemukan (ID ' . $pid . ').', 404);
            }
            $prod = $map[$pid];
            if ((int) $prod['is_active'] !== 1) {
                fail('Produk "' . $prod['name'] . '" sedang tidak aktif.');
            }
            if ((int) $prod['stock_qty'] < $qty) {
                fail('Stok tidak mencukupi untuk produk: ' . $prod['name']);
            }
            $resolved[] = [
                'product_id' => $pid,
                'name'       => $prod['name'],
                'price'      => (float) $prod['price'],
                'qty'        => $qty,
            ];
        }

        // Total is computed server-side from authoritative prices.
        $totalAmount = array_sum(array_map(fn($r) => $r['price'] * $r['qty'], $resolved));

        // ------------------------------------------------------------------
        // Execute with receipt-collision retry. `receipt_number` is UNIQUE, so
        // on a duplicate we regenerate the number and retry (a few times).
        // ------------------------------------------------------------------
        $attempts = 0;
        $saleId = null;
        while ($attempts < 5) {
            $pdo->beginTransaction();
            try {
                $saleId = attempt_checkout($pdo, $receiptNumber, $cashierId, $paymentMethod, $totalAmount, $resolved);
                $pdo->commit();
                break;
            } catch (PDOException $e) {
                $pdo->rollBack();
                if ($e->getCode() === '23000' && stripos($e->getMessage(), 'receipt_number') !== false) {
                    // Duplicate receipt number — generate a fresh one and retry.
                    $receiptNumber = server_receipt_number();
                    $attempts++;
                    continue;
                }
                fail('Gagal menyimpan transaksi.', 500);
            } catch (Exception $e) {
                $pdo->rollBack();
                fail($e->getMessage(), 400);
            }
        }

        if ($saleId === null) {
            fail('Gagal membuat nomor struk unik. Silakan coba lagi.', 500);
        }

        respond(['sale_id' => $saleId, 'success' => true, 'receipt_number' => $receiptNumber]);
    }

    // =================================================================
    // STOCK LOGS
    // =================================================================

    case 'get_stock_logs': {
        $rows = $pdo->query(
            'SELECT id, product_id, product_name, change_qty AS quantity_change, reason, user_name, note, created_at
             FROM stock_logs ORDER BY created_at DESC'
        )->fetchAll();
        respond($rows);
    }

    default:
        fail('Aksi tidak dikenali: ' . $action, 404);
}

// =================================================================
// HELPERS (top-level function declarations are hoisted in PHP)
// =================================================================

/**
 * Normalise a user row to the shape components expect.
 *
 * @param array $u
 * @return array
 */
function normalizeUser($u)
{
    return [
        'id'        => $u['id'],
        'email'     => $u['email'],
        'name'      => $u['name'],
        'role'      => $u['role'],
        'is_active' => (int) $u['is_active'] === 1,
        'created_at' => isset($u['created_at']) ? $u['created_at'] : null,
    ];
}

/**
 * Return true when a category name already exists (optionally excluding an id).
 *
 * @param PDO    $pdo
 * @param string $name
 * @param int    $excludeId
 * @return bool
 */
function categoryExists($pdo, $name, $excludeId = 0)
{
    $sql = 'SELECT id FROM categories WHERE name = :name';
    $params = [':name' => $name];
    if ($excludeId > 0) {
        $sql .= ' AND id <> :id';
        $params[':id'] = $excludeId;
    }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return (bool) $stmt->fetch();
}

/**
 * Generate a UUID v4 string.
 *
 * @return string
 */
function uuid()
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

/**
 * Extract a bearer token from the Authorization header, or null.
 *
 * @return string|null
 */
function bearer_token()
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $header  = $headers['Authorization'] ?? '';
    if (preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($header), $m)) {
        return strtolower($m[1]);
    }
    return null;
}

/**
 * Resolve the authenticated user (id, role, name, is_active) from the bearer
 * token, or null when the token is missing/invalid/expired.
 *
 * @param PDO $pdo
 * @return array|null
 */
function current_user(PDO $pdo)
{
    $token = bearer_token();
    if (!$token) return null;

    $stmt = $pdo->prepare(
        'SELECT user_id FROM sessions WHERE token = :token AND expires_at > NOW()'
    );
    $stmt->execute([':token' => $token]);
    $row = $stmt->fetch();
    if (!$row) return null;

    $stmt = $pdo->prepare(
        'SELECT id, email, name, role, is_active FROM users WHERE id = :id'
    );
    $stmt->execute([':id' => $row['user_id']]);
    $user = $stmt->fetch();
    if (!$user || (int) $user['is_active'] !== 1) return null;

    return $user;
}

/**
 * Require a valid authenticated user or fail with 401.
 *
 * @param PDO $pdo
 * @return array
 */
function require_auth(PDO $pdo)
{
    $user = current_user($pdo);
    if (!$user) {
        fail('Sesi tidak valid atau sudah berakhir. Silakan login kembali.', 401);
    }
    return $user;
}

/**
 * Require the authenticated user to be an admin or fail with 403.
 *
 * @param PDO $pdo
 * @return array
 */
function require_admin(PDO $pdo)
{
    $user = require_auth($pdo);
    if ($user['role'] !== 'admin') {
        fail('Aksi ini hanya dapat dilakukan oleh admin.', 403);
    }
    return $user;
}

/**
 * Create a server-side session token for a user and return it.
 *
 * @param PDO    $pdo
 * @param string $userId
 * @return string
 */
function create_session(PDO $pdo, $userId)
{
    // Clean up any expired sessions opportunistically.
    $pdo->exec('DELETE FROM sessions WHERE expires_at <= NOW()');

    $token     = bin2hex(random_bytes(32)); // 64 hex chars
    $expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');

    $stmt = $pdo->prepare(
        'INSERT INTO sessions (token, user_id, expires_at) VALUES (:token, :user, :expires)'
    );
    $stmt->execute([':token' => $token, ':user' => $userId, ':expires' => $expiresAt]);
    return $token;
}

/**
 * Generate a receipt number with the KRK-YYYYMMDD-XXXX shape.
 *
 * @return string
 */
function server_receipt_number()
{
    $datePart = (new DateTime())->format('Ymd');
    $seq      = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    return 'KRK-' . $datePart . '-' . $seq;
}

/**
 * Insert a sale, its line items, decrement stock and log each change.
 * Must be called inside an active transaction.
 *
 * @param PDO      $pdo
 * @param string   $receiptNumber
 * @param string   $cashierId
 * @param string   $paymentMethod
 * @param float    $totalAmount
 * @param array    $resolved  Each: { product_id, name, price (float), qty }
 * @return int sale id
 * @throws Exception On stock shortage or invalid data (rolls back at caller).
 */
function attempt_checkout(PDO $pdo, $receiptNumber, $cashierId, $paymentMethod, $totalAmount, array $resolved)
{
    $stmt = $pdo->prepare(
        'INSERT INTO sales (receipt_number, cashier_id, total_amount, payment_method, status)
         VALUES (:receipt, :cashier, :total, :pay, :status)'
    );
    $stmt->execute([
        ':receipt' => $receiptNumber,
        ':cashier' => $cashierId,
        ':total'   => $totalAmount,
        ':pay'     => $paymentMethod,
        ':status'  => 'completed',
    ]);
    $saleId = (int) $pdo->lastInsertId();

    $itemStmt = $pdo->prepare(
        'INSERT INTO sale_items (sale_id, product_id, product_name, qty, price_at_sale)
         VALUES (:sale, :pid, :pname, :qty, :price)'
    );
    $decStmt = $pdo->prepare(
        'UPDATE products SET stock_qty = stock_qty - :qty WHERE id = :id AND stock_qty >= :qty'
    );
    $logStmt = $pdo->prepare(
        'INSERT INTO stock_logs (product_id, product_name, change_qty, reason, user_name)
         VALUES (:pid, :pname, :change, :reason, :user)'
    );

    foreach ($resolved as $r) {
        $pid  = (int) $r['product_id'];
        $qty  = (int) $r['qty'];
        $name = $r['name'];
        $price = (float) $r['price'];

        // Guard against stock changing between our read and now. A concurrent
        // checkout could have reduced stock; re-check before decrementing.
        // Pre-validated server-side, but keep the conditional update as a
        // last line of defence against race conditions.
        $decStmt->execute([':qty' => $qty, ':id' => $pid]);
        if ($decStmt->rowCount() === 0) {
            throw new Exception('Stok tidak mencukupi untuk produk: ' . $name);
        }

        $itemStmt->execute([
            ':sale' => $saleId, ':pid' => $pid, ':pname' => $name,
            ':qty' => $qty, ':price' => $price,
        ]);

        $logStmt->execute([
            ':pid' => $pid, ':pname' => $name, ':change' => -$qty,
            ':reason' => 'sale', ':user' => $cashierId,
        ]);
    }

    return $saleId;
}