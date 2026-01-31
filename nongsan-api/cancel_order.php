<?php
include_once './config/database.php';
include_once './utils/jwt_helper.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$user = JWT_Helper::validate($token);

if (!$user || !isset($data->order_code) || !isset($data->cancel_reason)) {
    echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ"]);
    exit;
}

try {
    // Chỉ cho phép hủy nếu đơn chưa 'Đã giao hàng'
    $query = "UPDATE orders 
              SET payment_status = 'Hủy', 
                  delivery_status = 'Đã hủy', 
                  cancel_reason = :reason 
              WHERE order_code = :code 
              AND delivery_status != 'Đã giao hàng'";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':reason' => $data->cancel_reason,
        ':code' => $data->order_code
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Đã hủy đơn hàng"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể hủy đơn hàng này"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}