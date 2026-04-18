<?php
// Cho phép CORS để React có thể gọi API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. KẾT NỐI DATABASE
$host = "localhost";
$dbname = "uxi";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Lỗi kết nối CSDL: " . $e->getMessage()]);
    exit();
}

// Thư mục lưu trữ ảnh trên server
$uploadDir = 'uploads/banners/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

function removeLocalFileIfExists($path) {
    $path = trim((string)$path);
    if ($path === '') {
        return;
    }

    if (stripos($path, 'http://') === 0 || stripos($path, 'https://') === 0) {
        return;
    }

    if (file_exists($path)) {
        @unlink($path);
    }
}

function moveUploadedBanner($file, $prefix, $uploadDir) {
    if (!isset($file) || (int)($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new Exception("Tep tin khong hop le hoac chua duoc tai len.");
    }

    $ext = strtolower((string)pathinfo((string)$file['name'], PATHINFO_EXTENSION));
    if ($ext === '') {
        $ext = 'jpg';
    }

    $newFileName = $prefix . '_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $targetPath = $uploadDir . $newFileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Loi khi luu tep tin.");
    }

    return $targetPath;
}

function reindexPromoPositions($conn) {
    $rows = $conn->query("SELECT id FROM promo_banners ORDER BY position ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) {
        return;
    }

    $conn->beginTransaction();
    try {
        $tmpStmt = $conn->prepare("UPDATE promo_banners SET position = :tmp_pos WHERE id = :id");
        foreach ($rows as $index => $row) {
            $tmpStmt->execute([
                ':tmp_pos' => 100000 + $index,
                ':id' => (int)$row['id'],
            ]);
        }

        $finalStmt = $conn->prepare("UPDATE promo_banners SET position = :pos WHERE id = :id");
        foreach ($rows as $index => $row) {
            $finalStmt->execute([
                ':pos' => $index + 1,
                ':id' => (int)$row['id'],
            ]);
        }

        $conn->commit();
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        throw $e;
    }
}

function parsePromoMetaFromNote($rawNote) {
    $raw = trim((string)$rawNote);
    if ($raw === '') {
        return [
            'note' => '',
            'title' => '',
            'subtitle' => '',
        ];
    }

    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        return [
            'note' => (string)($decoded['note'] ?? ''),
            'title' => (string)($decoded['title'] ?? ''),
            'subtitle' => (string)($decoded['subtitle'] ?? ''),
        ];
    }

    return [
        'note' => $raw,
        'title' => '',
        'subtitle' => '',
    ];
}

function buildPromoStoredNote($note, $title, $subtitle) {
    $plainNote = trim((string)$note);
    $plainTitle = trim((string)$title);
    $plainSubtitle = trim((string)$subtitle);

    if ($plainTitle === '' && $plainSubtitle === '') {
        return $plainNote;
    }

    return json_encode([
        'note' => $plainNote,
        'title' => $plainTitle,
        'subtitle' => $plainSubtitle,
    ], JSON_UNESCAPED_UNICODE);
}

$action = $_GET['action'] ?? 'list';

try {
    switch ($action) {
        // ==========================================
        // LẤY DANH SÁCH BANNER HIỆN TẠI
        // ==========================================
        case 'list':
            // Lấy banner hệ thống
            $stmtSys = $conn->query("SELECT * FROM system_banners");
            $system = $stmtSys->fetchAll(PDO::FETCH_ASSOC);

            // Lấy banner quảng bá
            $stmtPromo = $conn->query("SELECT * FROM promo_banners ORDER BY position ASC, id ASC");
            $promo = $stmtPromo->fetchAll(PDO::FETCH_ASSOC);
            $promo = array_map(function($item) {
                $meta = parsePromoMetaFromNote($item['note'] ?? '');
                $item['note'] = $meta['note'];
                $item['title'] = $meta['title'];
                $item['subtitle'] = $meta['subtitle'];
                return $item;
            }, $promo);

            echo json_encode([
                "status" => "success",
                "data" => [
                    "system" => $system,
                    "promo" => $promo
                ]
            ]);
            break;

        // ==========================================
        // CẬP NHẬT BANNER HỆ THỐNG (Login, Register, Hero)
        // ==========================================
        case 'update_system':
            $banner_key = $_POST['banner_key'] ?? ''; // 'login', 'register', 'user_hero'
            if (empty($banner_key) || !isset($_FILES['image'])) {
                throw new Exception("Thiếu thông tin banner hoặc tệp tin.");
            }

            // 1. Tìm thông tin ảnh cũ để xóa
            $stmt = $conn->prepare("SELECT image_path FROM system_banners WHERE banner_key = :key");
            $stmt->execute([':key' => $banner_key]);
            $oldData = $stmt->fetch(PDO::FETCH_ASSOC);

            // 2. Xử lý tải lên ảnh mới
            $file = $_FILES['image'];
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $newFileName = "sys_" . $banner_key . "_" . time() . "." . $ext;
            $targetPath = $uploadDir . $newFileName;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // 3. Xóa tệp tin cũ nếu tồn tại
                if ($oldData && !empty($oldData['image_path'])) {
                    if (file_exists($oldData['image_path']) && !strpos($oldData['image_path'], 'unsplash.com')) {
                        unlink($oldData['image_path']);
                    }
                }

                // 4. Cập nhật Database (Dùng INSERT ON DUPLICATE KEY UPDATE)
                $sql = "INSERT INTO system_banners (banner_key, image_path) 
                        VALUES (:key, :path) 
                        ON DUPLICATE KEY UPDATE image_path = :path";
                $stmtUpdate = $conn->prepare($sql);
                $stmtUpdate->execute([':key' => $banner_key, ':path' => $targetPath]);

                echo json_encode(["status" => "success", "message" => "Đã thay đổi banner hệ thống!", "path" => $targetPath]);
            } else {
                throw new Exception("Lỗi khi lưu tệp tin.");
            }
            break;

        // ==========================================
        // TẠO MỚI BANNER QUẢNG BÁ
        // ==========================================
        case 'create_promo':
            $note = $_POST['note'] ?? '';
            $title = $_POST['title'] ?? '';
            $subtitle = $_POST['subtitle'] ?? '';
            $imagePath = '';

            if (isset($_FILES['image'])) {
                $imagePath = moveUploadedBanner($_FILES['image'], 'promo', $uploadDir);
            }

            if ($imagePath === '') {
                throw new Exception("Vui long tai len anh banner moi.");
            }

            $nextPosStmt = $conn->query("SELECT COALESCE(MAX(position), 0) + 1 FROM promo_banners");
            $nextPosition = (int)$nextPosStmt->fetchColumn();
            if ($nextPosition <= 0) {
                $nextPosition = 1;
            }

            $storedNote = buildPromoStoredNote($note, $title, $subtitle);

            $insertStmt = $conn->prepare("INSERT INTO promo_banners (position, image_path, note) VALUES (:pos, :path, :note)");
            $insertStmt->execute([
                ':pos' => $nextPosition,
                ':path' => $imagePath,
                ':note' => $storedNote,
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Da tao banner quang ba moi.",
                "id" => (int)$conn->lastInsertId(),
            ]);
            break;

        // ==========================================
        // CẬP NHẬT BANNER QUẢNG BÁ
        // ==========================================
        case 'update_promo':
            $id = (int)($_POST['id'] ?? 0);
            $position = (int)($_POST['position'] ?? 0);
            $note = $_POST['note'] ?? '';
            $title = $_POST['title'] ?? '';
            $subtitle = $_POST['subtitle'] ?? '';

            if ($id <= 0 && $position <= 0) {
                throw new Exception("Thieu ID hoac vi tri banner de cap nhat.");
            }

            if ($id > 0) {
                $stmt = $conn->prepare("SELECT id, position, image_path FROM promo_banners WHERE id = :id LIMIT 1");
                $stmt->execute([':id' => $id]);
            } else {
                $stmt = $conn->prepare("SELECT id, position, image_path FROM promo_banners WHERE position = :pos LIMIT 1");
                $stmt->execute([':pos' => $position]);
            }

            $oldData = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$oldData) {
                throw new Exception("Khong tim thay banner can cap nhat.");
            }

            $targetPath = $oldData['image_path'] ?? '';

            if (isset($_FILES['image']) && (int)($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK) {
                $newPath = moveUploadedBanner($_FILES['image'], 'promo_pos' . (int)$oldData['position'], $uploadDir);
                removeLocalFileIfExists($targetPath);
                $targetPath = $newPath;
            }

            $storedNote = buildPromoStoredNote($note, $title, $subtitle);

            $stmtUpdate = $conn->prepare("UPDATE promo_banners SET image_path = :path, note = :note WHERE id = :id");
            $stmtUpdate->execute([
                ':path' => $targetPath,
                ':note' => $storedNote,
                ':id' => (int)$oldData['id'],
            ]);

            echo json_encode(["status" => "success", "message" => "Da cap nhat banner quang ba!", "path" => $targetPath]);
            break;

        // ==========================================
        // XÓA BANNER QUẢNG BÁ
        // ==========================================
        case 'delete_promo':
            $rawBody = json_decode(file_get_contents('php://input'), true);
            $id = (int)($_POST['id'] ?? ($rawBody['id'] ?? 0));

            if ($id <= 0) {
                throw new Exception("Thieu ID banner can xoa.");
            }

            $findStmt = $conn->prepare("SELECT id, image_path FROM promo_banners WHERE id = :id LIMIT 1");
            $findStmt->execute([':id' => $id]);
            $row = $findStmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                throw new Exception("Khong tim thay banner can xoa.");
            }

            $delStmt = $conn->prepare("DELETE FROM promo_banners WHERE id = :id");
            $delStmt->execute([':id' => $id]);

            removeLocalFileIfExists((string)($row['image_path'] ?? ''));
            reindexPromoPositions($conn);

            echo json_encode(["status" => "success", "message" => "Da xoa banner quang ba."]);
            break;

        default:
            throw new Exception("Hành động không hợp lệ.");
    }
} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>