<?php
include_once './config/database.php';
include_once './utils/jwt_helper.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->token) && isset($data->otp_input)) {
    
    // 1. Giải mã Token (Kết quả trả về là một Object)
    $payload = JWT_Helper::validate($data->token);

    if(!$payload) {
        echo json_encode(["status" => "error", "message" => "Phiên đăng ký hết hạn, vui lòng thử lại."]);
        exit();
    }

    // 2. Lấy giá trị và so sánh tuyệt đối kiểu chuỗi
    // Truy cập theo kiểu Object ($payload->otp)
    $otpInToken = isset($payload->otp) ? trim((string)$payload->otp) : '';
    $otpFromUser = trim((string)$data->otp_input);

    if($otpInToken === '' || $otpInToken !== $otpFromUser) {
        echo json_encode([
            "status" => "error", 
            "message" => "Mã xác nhận không chính xác!"
        ]);
        exit();
    }

    // 3. Kiểm tra thời hạn
    if (isset($payload->exp) && time() > $payload->exp) {
        echo json_encode(["status" => "error", "message" => "Mã OTP đã hết hạn."]);
        exit();
    }

    // 4. Lưu User
    try {
        $query = "INSERT INTO users (name, email, password, role, is_online, is_approved) 
                  VALUES (:name, :email, :pass, :role, 1, 0)";
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':name'  => $payload->name,
            ':email' => $payload->email,
            ':pass'  => $payload->password_hash,
            ':role'  => $payload->role
        ]);

        echo json_encode(["status" => "success", "message" => "Đăng ký thành công!"]);

    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi hệ thống: " . $e->getMessage()]);
    }

} else {
    echo json_encode(["status" => "error", "message" => "Dữ liệu không đầy đủ."]);
}
?>