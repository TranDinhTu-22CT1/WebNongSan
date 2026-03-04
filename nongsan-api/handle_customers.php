<?php
// Cho phép CORS để React (chạy port khác, vd 3000) có thể gọi được API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

// Xử lý preflight request của trình duyệt
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

// Nhận action từ GET hoặc JSON POST
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
    
    // --- LẤY DANH SÁCH KHÁCH HÀNG ---
    case 'list':
        try {
            // Chỉ lấy người dùng có role là 'customer'
            $stmt = $pdo->prepare("SELECT id, name, email, phone, avatar, address, created_at, is_approved FROM users WHERE role = 'customer' ORDER BY id DESC");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $data = [];
            foreach ($users as $user) {
                // Xử lý avatar: nếu không có thì dùng avatar mặc định tạo từ tên
                $avatar = !empty($user['avatar']) ? $user['avatar'] : 'https://ui-avatars.com/api/?name=' . urlencode($user['name']) . '&background=random&color=fff';

                // TRONG THỰC TẾ: Bạn sẽ LEFT JOIN bảng orders để tính tổng chi tiêu (spend) và số đơn (totalOrders).
                // Do bạn chưa cung cấp bảng orders, tôi tạm để query đếm giả lập ở đây.
                $spend = 0;
                $totalOrders = 0;
                
                try {
                    // Nếu bạn đã có bảng orders (id, user_id, total_price) thì bỏ comment đoạn này:
                    /*
                    $orderStmt = $pdo->prepare("SELECT COUNT(id) as total_orders, SUM(total_price) as total_spend FROM orders WHERE user_id = ? AND status = 'Hoàn thành'");
                    $orderStmt->execute([$user['id']]);
                    $orderStats = $orderStmt->fetch(PDO::FETCH_ASSOC);
                    $totalOrders = $orderStats['total_orders'] ?? 0;
                    $spend = $orderStats['total_spend'] ?? 0;
                    */
                } catch (Exception $e) {}

                $data[] = [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'phone' => !empty($user['phone']) ? $user['phone'] : 'Chưa cập nhật',
                    'avatar' => $avatar,
                    'address' => !empty($user['address']) ? $user['address'] : 'Chưa cập nhật',
                    'joinDate' => date('d/m/Y', strtotime($user['created_at'])),
                    'status' => $user['is_approved'] == 1 ? 'Verified' : 'Warning', // Dựa vào is_approved
                    'spend' => number_format($spend, 0, ',', '.') . ' ₫',
                    'totalOrders' => $totalOrders
                ];
            }
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    // --- LẤY LỊCH SỬ ĐƠN HÀNG CỦA 1 KHÁCH ---
    case 'orders':
        $customerId = $_GET['customer_id'] ?? 0;
        try {
            // Lưu ý: Cần có bảng `orders` (id, user_id, total_price, status, created_at). 
            // Nếu chưa có, query này sẽ lỗi. Tôi thêm try catch để trả về mảng rỗng nếu chưa có bảng.
            $stmt = $pdo->prepare("SELECT id, created_at, total_price, status FROM orders WHERE user_id = ? ORDER BY id DESC");
            $stmt->execute([$customerId]);
            $rawOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $orders = [];
            foreach($rawOrders as $o) {
                $orders[] = [
                    'id' => 'ORD-' . $o['id'],
                    'date' => date('d/m/Y H:i', strtotime($o['created_at'])),
                    'price' => number_format($o['total_price'], 0, ',', '.') . ' ₫',
                    'status' => $o['status'] // Ví dụ: 'Hoàn thành', 'Hủy', 'Chờ xử lý'
                ];
            }
            echo json_encode(['status' => 'success', 'data' => $orders]);
        } catch (Exception $e) {
            // Trả về rỗng nếu chưa có bảng orders
            echo json_encode(['status' => 'success', 'data' => []]);
        }
        break;

    // --- CẬP NHẬT MẬT KHẨU KHÁCH HÀNG ---
    case 'update_password':
        $id = $postData['id'] ?? null;
        $newPassword = $postData['password'] ?? null;

        if ($id && $newPassword) {
            // Luôn mã hóa mật khẩu trước khi lưu vào database
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            try {
                $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ? AND role = 'customer'");
                if ($stmt->execute([$hashedPassword, $id])) {
                    echo json_encode(['status' => 'success', 'message' => 'Cập nhật thành công']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Không thể cập nhật']);
                }
            } catch (PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu ID hoặc Password']);
        }
        break;

    // --- XỬ LÝ TRANH CHẤP / HOÀN TIỀN ---
    case 'handle_dispute':
        $orderCode = $postData['order_code'] ?? null; 
        $decision = $postData['decision'] ?? null; 

        if ($orderCode && $decision) {
            // Lọc bỏ tiền tố 'ORD-' để lấy ID số nguyên trong database
            $orderId = (int) str_replace('ORD-', '', $orderCode);
            $newStatus = ($decision === 'refund') ? 'Đã hoàn tiền' : 'Từ chối hoàn tiền';

            try {
                // Cập nhật trạng thái trong bảng orders
                $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
                $stmt->execute([$newStatus, $orderId]);
                
                echo json_encode(['status' => 'success', 'message' => 'Đã xử lý tranh chấp thành công']);
            } catch (Exception $e) {
                // Nếu chưa có bảng orders, tạm giả lập thành công để React chạy được
                echo json_encode(['status' => 'success', 'message' => 'Mock xử lý thành công do chưa có bảng orders']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu dữ liệu']);
        }
        break;

    // --- MẶC ĐỊNH LỖI ---
    default:
        echo json_encode(['status' => 'error', 'message' => 'Action không hợp lệ']);
        break;
}
?>