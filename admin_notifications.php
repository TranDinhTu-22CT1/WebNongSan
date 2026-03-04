<?php
// Cho phép CORS để React có thể gọi API từ port khác
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý preflight request của CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. KẾT NỐI DATABASE (Sử dụng PDO)
$host = "localhost";
$dbname = "uxi";                // Thay bằng tên database của bạn
$username = "root";             // Thay bằng username của bạn
$password = "";                 // Thay bằng password của bạn

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Lỗi kết nối CSDL: " . $e->getMessage()]);
    exit();
}

/**
 * HÀM TRA CỨU ID DỰA TRÊN TÊN (Dùng khi Front-end không gửi ID)
 */
function getUserIdByName($conn, $adminName) {
    if (empty($adminName)) return null;

    // Bảng users của bạn có cột 'name', không có 'username'
    $stmt = $conn->prepare("SELECT id FROM users WHERE name = :name LIMIT 1");
    $stmt->bindParam(':name', $adminName);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user ? (int)$user['id'] : null;
}

// 2. ĐỊNH TUYẾN CHỨC NĂNG (ROUTING)
$action = isset($_GET['action']) ? $_GET['action'] : 'list';

try {
    switch ($action) {
        case 'list':
            $sql = "SELECT * FROM admin_notifications ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'create':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception("Yêu cầu phương thức POST.");
            
            $data = json_decode(file_get_contents("php://input"));
            if (empty($data->title) || empty($data->content)) {
                throw new Exception("Tiêu đề và nội dung không được để trống.");
            }

            // --- XỬ LÝ LẤY ID ADMIN ---
            $admin_id = null;
            // 1. Ưu tiên lấy adminId trực tiếp (nếu React gửi payload.adminId)
            if (isset($data->adminId) && !empty($data->adminId)) {
                $admin_id = (int)$data->adminId;
            } 
            // 2. Nếu không có adminId, tra cứu bằng adminName (React gửi payload.adminName)
            else if (isset($data->adminName) && !empty($data->adminName)) {
                $admin_id = getUserIdByName($conn, $data->adminName);
            }

            $target_group = $data->targetGroup ?? 'ALL';
            $type = $data->notiType ?? 'GENERAL';
            $status = 'ACTIVE';
            $end_time = !empty($data->endTime) ? $data->endTime : null;
            
            // Câu lệnh SQL khớp với bảng 11 cột của bạn
            $sql = "INSERT INTO admin_notifications (title, content, target_group, type, status, end_time, admin_id) 
                    VALUES (:title, :content, :target_group, :type, :status, :end_time, :admin_id)";
                    
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':title', $data->title);
            $stmt->bindParam(':content', $data->content);
            $stmt->bindParam(':target_group', $target_group);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':end_time', $end_time);
            $stmt->bindParam(':admin_id', $admin_id); 
            
            $stmt->execute();
            
            echo json_encode([
                "status" => "success", 
                "message" => "Đã phát thông báo thành công!",
                "debug_received_id" => $admin_id
            ]);
            break;

        case 'cancel':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception("Yêu cầu phương thức POST.");
            $data = json_decode(file_get_contents("php://input"));
            
            if (empty($data->id)) throw new Exception("Thiếu ID thông báo.");
            
            $cancel_reason = !empty($data->cancelReason) ? $data->cancelReason : "Hủy bởi Admin";
            
            $sql = "UPDATE admin_notifications 
                    SET status = 'CANCELLED', 
                        cancel_reason = :cancel_reason, 
                        cancelled_at = NOW() 
                    WHERE id = :id";
                    
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':cancel_reason', $cancel_reason);
            $stmt->bindParam(':id', $data->id);
            $stmt->execute();
            
            echo json_encode(["status" => "success", "message" => "Đã hủy thành công!"]);
            break;

        case 'delete':
            $data = json_decode(file_get_contents("php://input"));
            $id = $data->id ?? ($_GET['id'] ?? null);
            if (!$id) throw new Exception("Thiếu ID.");
            
            $stmt = $conn->prepare("DELETE FROM admin_notifications WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            echo json_encode(["status" => "success", "message" => "Đã xóa vĩnh viễn!"]);
            break;

        default:
            throw new Exception("Hành động không hợp lệ.");
    }
} catch(Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>