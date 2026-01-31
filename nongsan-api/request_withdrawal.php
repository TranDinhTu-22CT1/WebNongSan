<?php
// Cho phép truy cập từ mọi nguồn (CORS) - Cần thiết cho React
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý request Preflight (OPTIONS) cho trình duyệt
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once './config/database.php';

// Đọc dữ liệu JSON gửi từ React
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->vendor_id) &&
    !empty($data->amount) &&
    !empty($data->bank_name) &&
    !empty($data->account_number) &&
    !empty($data->account_holder)
) {
    try {
        // --- BƯỚC 1: TÍNH TOÁN LẠI SỐ DƯ THỰC TẾ (CHỐNG GIAN LẬN) ---
        // Tổng tiền thực nhận từ orders (92%)
        $sqlRev = "SELECT SUM(total_amount * 0.92) as total_earned 
                   FROM orders 
                   WHERE vendor_id = :vid AND delivery_status = 'Đã giao hàng'";
        $stmtRev = $conn->prepare($sqlRev);
        $stmtRev->execute([':vid' => $data->vendor_id]);
        $total_earned = (float)($stmtRev->fetch(PDO::FETCH_ASSOC)['total_earned'] ?? 0);

        // Tổng tiền đã rút thành công (approved)
        $sqlWith = "SELECT SUM(amount) as total_out 
                    FROM withdrawals 
                    WHERE vendor_id = :vid AND status = 'approved'";
        $stmtWith = $conn->prepare($sqlWith);
        $stmtWith->execute([':vid' => $data->vendor_id]);
        $total_out = (float)($stmtWith->fetch(PDO::FETCH_ASSOC)['total_out'] ?? 0);

        $current_balance = $total_earned - $total_out;

        // --- BƯỚC 2: KIỂM TRA ĐIỀU KIỆN RÚT ---
        if ($data->amount > $current_balance) {
            echo json_encode([
                "status" => "error", 
                "message" => "Số dư không đủ! Số dư khả dụng hiện tại là: " . number_format($current_balance, 0, ',', '.') . " VNĐ"
            ]);
            exit;
        }

        // --- BƯỚC 3: LƯU LỆNH RÚT TIỀN VÀO DATABASE ---
        $query = "INSERT INTO withdrawals (vendor_id, amount, bank_name, account_number, account_holder, status, created_at) 
                  VALUES (:vid, :amount, :bank, :acc_num, :acc_holder, 'pending', NOW())";
        
        $stmt = $conn->prepare($query);
        $success = $stmt->execute([
            ':vid'      => $data->vendor_id,
            ':amount'   => $data->amount,
            ':bank'     => $data->bank_name,
            ':acc_num'  => $data->account_number,
            ':acc_holder' => $data->account_holder
        ]);

        if ($success) {
            echo json_encode([
                "status" => "success", 
                "message" => "Yêu cầu rút tiền đã được gửi thành công. Vui lòng chờ Admin phê duyệt!"
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Không thể lưu yêu cầu vào hệ thống."]);
        }

    } catch (PDOException $e) {
        // Trả về lỗi database cụ thể để dễ debug
        echo json_encode(["status" => "error", "message" => "Lỗi Database: " . $e->getMessage()]);
    }
} else {
    // Trường hợp thiếu dữ liệu từ form
    echo json_encode(["status" => "error", "message" => "Vui lòng điền đầy đủ thông tin rút tiền."]);
}
?>