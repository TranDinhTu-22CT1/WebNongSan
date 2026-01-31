<?php
include_once './config/database.php';
include_once './utils/jwt_helper.php';

// 1. Lấy Token từ Header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token || !JWT_Helper::validate($token)) {
    echo json_encode(["status" => "error", "message" => "Lỗi xác thực Token!"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (isset($data->product_id) && isset($data->quantity_added)) {
    $product_id = $data->product_id;
    $added = intval($data->quantity_added);

    try {
        // Logic 1 + 1 = 2 (Dùng SQL: stock = stock + :added)
        $query = "UPDATE products SET stock = stock + :added WHERE id = :pid";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':added', $added);
        $stmt->bindParam(':pid', $product_id);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Đã nhập kho thành công!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Lỗi cập nhật SQL"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu"]);
}
?>