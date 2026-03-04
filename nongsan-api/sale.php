<?php
// Cho phép CORS để React/Vue/Angular có thể gọi API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=utf-8');

// Xử lý preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// 1. CẤU HÌNH DATABASE
// ==========================================
$host = 'localhost';
$db   = 'uxi'; // ĐIỀN TÊN DATABASE CỦA BẠN VÀO ĐÂY
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL: ' . $e->getMessage()]);
    exit;
}

// Nhận action từ GET hoặc POST JSON
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$postData = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST' && isset($postData['action'])) {
    $action = $postData['action'];
}

// ==========================================
// 2. XỬ LÝ CÁC ROUTE (ACTIONS)
// ==========================================

switch ($action) {

    // --- LẤY DANH SÁCH CHIẾN DỊCH KHUYẾN MÃI ---
    case 'list':
        try {
            // Tự động cập nhật trạng thái 'Expired' nếu ngày hiện tại đã vượt qua end_date
            $updateSql = "UPDATE sale SET status = 'Expired' WHERE end_date < CURDATE() AND status = 'Active' AND deleted_at IS NULL";
            $pdo->exec($updateSql);

            // Lấy danh sách
            $sql = "SELECT * FROM sale WHERE deleted_at IS NULL ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $rawPromos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format lại dữ liệu cho giống với state initialsale trong React
            $promos = array_map(function($p) {
                // Nối usage_count và usage_limit thành dạng chuỗi (vd: "450/500" hoặc "1200")
                $usageStr = (string)$p['usage_count'];
                if ($p['usage_limit'] !== null) {
                    $usageStr .= '/' . $p['usage_limit'];
                }

                return [
                    'id' => $p['id'],
                    'name' => $p['name'],
                    'type' => $p['type'],
                    'discount' => $p['discount_value'], // Đổi tên key cho khớp React
                    'status' => $p['status'],
                    'start' => $p['start_date'],
                    'end' => $p['end_date'],
                    'usage' => $usageStr
                ];
            }, $rawPromos);
            
            echo json_encode(['status' => 'success', 'data' => $promos]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi lấy dữ liệu: ' . $e->getMessage()]);
        }
        break;

    // --- TẠO MỚI CHIẾN DỊCH ---
    case 'create':
        $name = $postData['name'] ?? '';
        $type = $postData['type'] ?? 'Flash Sale';
        $discountValue = isset($postData['discount']) ? (float)$postData['discount'] : 0;
        $status = $postData['status'] ?? 'Active';
        $startDate = !empty($postData['start']) ? $postData['start'] : null;
        $endDate = !empty($postData['end']) ? $postData['end'] : null;
        
        // Mặc định tạo mới sẽ có lượt dùng bằng 0. usage_limit có thể thêm vào React form sau này, tạm thời để NULL
        $usageLimit = isset($postData['usageLimit']) && $postData['usageLimit'] !== '' ? (int)$postData['usageLimit'] : null;

        if (empty($name) || empty($discountValue)) {
            echo json_encode(['status' => 'error', 'message' => 'Tên chương trình và mức giảm không được để trống!']);
            exit;
        }

        try {
            $sql = "INSERT INTO sale (name, type, discount_value, status, start_date, end_date, usage_count, usage_limit) 
                    VALUES (?, ?, ?, ?, ?, ?, 0, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$name, $type, $discountValue, $status, $startDate, $endDate, $usageLimit]);
            
            echo json_encode(['status' => 'success', 'message' => 'Tạo chiến dịch thành công!']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
        }
        break;

    // --- CẬP NHẬT CHIẾN DỊCH ---
    case 'update':
        $id = $postData['id'] ?? null;
        $name = $postData['name'] ?? '';
        $type = $postData['type'] ?? 'Flash Sale';
        $discountValue = isset($postData['discount']) ? (float)$postData['discount'] : 0;
        $status = $postData['status'] ?? 'Active';
        $startDate = !empty($postData['start']) ? $postData['start'] : null;
        $endDate = !empty($postData['end']) ? $postData['end'] : null;

        if (!$id || empty($name) || empty($discountValue)) {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin bắt buộc (ID, Tên hoặc Mức giảm)!']);
            exit;
        }

        try {
            $sql = "UPDATE sale 
                    SET name=?, type=?, discount_value=?, status=?, start_date=?, end_date=? 
                    WHERE id=? AND deleted_at IS NULL";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$name, $type, $discountValue, $status, $startDate, $endDate, $id]);
            
            echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công!']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
        }
        break;

    // --- XÓA CHIẾN DỊCH (XÓA MỀM) ---
    case 'delete':
        $id = $postData['id'] ?? null;
        if ($id) {
            try {
                // Thực hiện XÓA MỀM
                $stmt = $pdo->prepare("UPDATE sale SET deleted_at = CURRENT_TIMESTAMP() WHERE id = ?");
                $stmt->execute([$id]);
                
                echo json_encode(['status' => 'success', 'message' => 'Đã đưa chiến dịch vào thùng rác!']);
            } catch (PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu ID để xóa']);
        }
        break;

    // --- MẶC ĐỊNH LỖI ---
    default:
        echo json_encode(['status' => 'error', 'message' => 'Action không hợp lệ']);
        break;
}
?>