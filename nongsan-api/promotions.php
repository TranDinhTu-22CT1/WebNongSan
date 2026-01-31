<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once './config/database.php'; 

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    switch ($action) {
        // 1. Lấy danh sách khuyến mãi kèm tên sản phẩm
        case 'get_all':
            $vendor_id = $_GET['vendor_id'] ?? null;
            // Join với bảng products để lấy tên sản phẩm nếu scope là 'product'
            $sql = "SELECT pr.*, p.name as product_name 
                    FROM promotions pr
                    LEFT JOIN products p ON pr.product_id = p.id";
            
            if ($vendor_id) {
                $sql .= " WHERE pr.vendor_id = :vendor_id";
            }
            $sql .= " ORDER BY pr.id DESC";
            
            $stmt = $conn->prepare($sql);
            if ($vendor_id) $stmt->bindParam(':vendor_id', $vendor_id);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        // 2. Lấy danh sách sản phẩm của Vendor để hiển thị trong ô chọn (Select Box)
        case 'get_vendor_products':
            $vendor_id = $_GET['vendor_id'] ?? null;
            if (!$vendor_id) {
                echo json_encode(["status" => "error", "message" => "Thiếu ID người bán"]);
                exit;
            }
            $stmt = $conn->prepare("SELECT id, name, price FROM products WHERE vendor_id = ? AND is_banned = 0");
            $stmt->execute([$vendor_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        // 3. Tạo mới hoặc Cập nhật
        case 'create':
            // Thêm vào trong switch ($action) của file promotions.php
case 'toggle_status':
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'];
    $new_status = $data['status']; // 1 hoặc 0

    $stmt = $conn->prepare("UPDATE promotions SET status = ? WHERE id = ?");
    if ($stmt->execute([$new_status, $id])) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể cập nhật trạng thái"]);
    }
    break;
        case 'update':
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data) {
                echo json_encode(["status" => "error", "message" => "Không nhận được dữ liệu"]);
                exit;
            }

            // Xử lý giá trị productId (Nếu chọn toàn cửa hàng thì productId là NULL)
            $product_id = ($data['scope'] === 'product' && !empty($data['productId'])) ? $data['productId'] : null;

            if ($action == 'create') {
                $sql = "INSERT INTO promotions (code, name, type, value, scope, product_id, vendor_id, start_date, end_date, usage_limit) 
                        VALUES (:code, :name, :type, :value, :scope, :product_id, :vendor_id, :start_date, :end_date, :usage_limit)";
            } else {
                $sql = "UPDATE promotions SET code=:code, name=:name, type=:type, value=:value, scope=:scope, 
                        product_id=:product_id, start_date=:start_date, end_date=:end_date, usage_limit=:usage_limit 
                        WHERE id=:id";
            }
            
            $stmt = $conn->prepare($sql);
            $params = [
                ':code' => $data['code'],
                ':name' => $data['name'],
                ':type' => $data['type'],
                ':value' => $data['value'],
                ':scope' => $data['scope'],
                ':product_id' => $product_id,
                ':start_date' => $data['startDate'],
                ':end_date' => $data['endDate'],
                ':usage_limit' => $data['limit']
            ];

            if ($action == 'create') {
                $params[':vendor_id'] = $data['vendor_id'] ?? null;
            } else {
                $params[':id'] = $data['id'];
            }

            if ($stmt->execute($params)) {
                echo json_encode(["status" => "success", "message" => "Thành công"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Lỗi thực thi SQL"]);
            }
            break;

        case 'delete':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $conn->prepare("DELETE FROM promotions WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(["status" => "success"]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ"]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>