<?php
include_once './config/database.php';

header('Content-Type: application/json');

$vendor_id = $_GET['vendor_id'] ?? null;

if (!$vendor_id) {
    echo json_encode(["status" => "error", "message" => "Missing vendor_id"]);
    exit;
}

try {
    $query = "SELECT 
                oi.product_id,
                oi.product_name as name, 
                SUM(oi.quantity) as sold, 
                SUM(oi.quantity * oi.price) as revenue
              FROM order_items oi
              JOIN orders o ON oi.order_id = o.id
              WHERE o.vendor_id = :vid
                AND o.delivery_status = 'Đã giao hàng'
                AND o.payment_status != 'Hủy'
              GROUP BY oi.product_id, oi.product_name
              ORDER BY revenue DESC, sold DESC
              LIMIT 10";

    $stmt = $conn->prepare($query);
    $stmt->execute([':vid' => $vendor_id]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $data]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>