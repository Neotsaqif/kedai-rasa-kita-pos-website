<?php
/**
 * Kedai Rasa Kita POS — MySQL (XAMPP) backend configuration.
 *
 * This file centralises the DB credentials and shared JSON/CORS helpers used by
 * backend/api/index.php. To hit a different MySQL database, edit the DB_* values
 * below (or via environment variables where available).
 */

// --- Database credentials (local XAMPP defaults) ---
define('DB_HOST', getenv('KRK_DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('KRK_DB_PORT') ?: '3306');
define('DB_NAME', getenv('KRK_DB_NAME') ?: 'kedai_rasa_kita');
define('DB_USER', getenv('KRK_DB_USER') ?: 'root');
define('DB_PASS', getenv('KRK_DB_PASS') ?: '');

// --- Always respond as JSON ---
header('Content-Type: application/json; charset=utf-8');

// --- CORS: only allow configured origins. Bearer tokens live in localStorage
// (never cookies) so they aren't auto-sent cross-origin, but we still restrict
// the allow-list for defense in depth. Configure via KRK_ALLOWED_ORIGINS (comma
// separated). The defaults cover the Vite dev server + same-origin XAMPP calls.
$allowedOrigins = array_filter(array_map('trim', explode(',',
    getenv('KRK_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://localhost,http://127.0.0.1:5173'
)));
$origin = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Return a shared PDO connection (singleton).
 *
 * @return PDO
 */
function db()
{
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Koneksi database gagal. Pastikan MySQL (XAMPP) berjalan dan database "' . DB_NAME . '" sudah dibuat.',
            ]);
            exit;
        }
    }
    return $pdo;
}

/**
 * Send a JSON success response and stop.
 *
 * @param mixed $data
 * @param int   $code
 */
function respond($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

/**
 * Send a JSON error response and stop.
 *
 * @param string $message
 * @param int    $code
 */
function fail($message, $code = 400)
{
    respond(['error' => $message], $code);
}

/**
 * Read the JSON request body into an array.
 *
 * @return array
 */
function body()
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $data = [];
    }
    return $data;
}