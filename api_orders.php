<?php
// Cho phép CORS để React gọi API
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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$postData = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST' && isset($postData['action'])) {
    $action = $postData['action'];
}

// Map trạng thái DB (Tiếng Việt) sang Trạng thái React (Tiếng Anh)
$statusToReact = [
    'Chờ lấy hàng'   => 'Pending',
    'Đang giao hàng' => 'Shipping',
    'Đã giao hàng'   => 'Completed',
    'Đã hủy'         => 'Cancelled'
];

$reactToStatus = [
    'Pending'   => 'Chờ lấy hàng',
    'Shipping'  => 'Đang giao hàng',
    'Completed' => 'Đã giao hàng',
    'Cancelled' => 'Đã hủy'
];

// ==========================================
// 2. XỬ LÝ CÁC ROUTE (ACTIONS)
// ==========================================

switch ($action) {

    // --- LẤY DANH SÁCH ĐƠN HÀNG ---
    case 'list_orders':
        try {
            // JOIN với bảng users để lấy tên khách hàng và tên shop (vendor)
            $sql = "SELECT o.*, 
                           cu.name as customer_real_name, 
                           vu.shop_name, 
                           vu.name as vendor_name 
                    FROM orders o
                    LEFT JOIN users cu ON o.customer_id = cu.id
                    LEFT JOIN users vu ON o.vendor_id = vu.id
                    ORDER BY o.created_at DESC";
                    
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $rawOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $orders = array_map(function($o) use ($statusToReact) {
                // Ưu tiên tên nhập trong bảng order, nếu không có lấy từ bảng users
                $customerName = !empty($o['customer_name']) ? $o['customer_name'] : ($o['customer_real_name'] ?? "Khách #".$o['customer_id']);
                // Ưu tiên tên shop, nếu không có lấy tên của user vendor
                $vendorName = !empty($o['shop_name']) ? $o['shop_name'] : ($o['vendor_name'] ?? "Vendor #".$o['vendor_id']);
                
                return [
                    'db_id'    => $o['id'],
                    'id'       => $o['order_code'],
                    'customer' => $customerName,
                    'vendor'   => $vendorName,
                    'total'    => (float)$o['total_amount'],
                    'shipFee'  => 30000, // Giả lập phí ship (Vì database chưa có cột ship_fee)
                    'status'   => $statusToReact[$o['delivery_status']] ?? 'Pending',
                    'date'     => date('Y-m-d H:i', strtotime($o['created_at'])),
                    'payment'  => $o['payment_method'],
                    'address'  => $o['shipping_address']
                ];
            }, $rawOrders);
            
            echo json_encode(['status' => 'success', 'data' => $orders]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
        }
        break;

    // --- CẬP NHẬT TRẠNG THÁI GIAO HÀNG ---
    case 'update_status':
        $db_id = $postData['db_id'] ?? null;
        $new_status = $postData['status'] ?? null; // Trạng thái React (vd: Shipping, Completed)
        
        if (!$db_id || !$new_status) {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu thông tin bắt buộc!']);
            exit;
        }

        $db_status = $reactToStatus[$new_status] ?? null;
        if (!$db_status) {
            echo json_encode(['status' => 'error', 'message' => 'Trạng thái không hợp lệ!']);
            exit;
        }

        try {
            $sql = "UPDATE orders SET delivery_status = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$db_status, $db_id]);
            
            echo json_encode(['status' => 'success', 'message' => 'Cập nhật trạng thái thành công!']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
        }
        break;

    // --- HỦY ĐƠN HÀNG (CƯỠNG CHẾ BỞI ADMIN) ---
    case 'cancel_order':
        $db_id = $postData['db_id'] ?? null;
        $reason = $postData['reason'] ?? '';
        
        if (!$db_id) {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu ID đơn hàng!']);
            exit;
        }

        try {
            // Hủy đơn hàng: Cập nhật delivery_status = 'Đã hủy', payment_status = 'Hủy', và lưu lý do hủy
            $sql = "UPDATE orders 
                    SET delivery_status = 'Đã hủy', 
                        payment_status = 'Hủy', 
                        cancel_reason = ? 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$reason, $db_id]);
            
            echo json_encode(['status' => 'success', 'message' => 'Đã hủy đơn hàng thành công!']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
        }
        break;

    // --- MẶC ĐỊNH ---
    default:
        echo json_encode(['status' => 'error', 'message' => 'Action không hợp lệ']);
        break;
}
?>