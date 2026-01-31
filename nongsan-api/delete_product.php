<?php
include_once './config/database.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id) && isset($data->vendor_id)) {
    try {
        // Chỉ xóa nếu đúng là sản phẩm của Vendor đó
        $query = "DELETE FROM products WHERE id = :id AND vendor_id = :vid";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":vid", $data->vendor_id);
        
        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Đã xóa sản phẩm"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không thể xóa"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu dữ liệu"]);
}
?>