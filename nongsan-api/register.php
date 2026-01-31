<?php
// File: register.php
include_once './config/database.php';

// Nhận dữ liệu JSON gửi lên
$data = json_decode(file_get_contents("php://input"));

// Kiểm tra dữ liệu đầu vào
if(
    isset($data->name) && 
    isset($data->email) && 
    isset($data->password)
) {
    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = $data->password;
    // Mặc định là 'vendor' nếu client không gửi, hoặc lấy từ client
    $role = isset($data->role) ? $data->role : 'vendor'; 

    try {
        // 1. Kiểm tra Email đã tồn tại chưa
        $check_query = "SELECT id FROM users WHERE email = :email LIMIT 1";
        $stmt_check = $conn->prepare($check_query);
        $stmt_check->bindParam(':email', $email);
        $stmt_check->execute();

        if($stmt_check->rowCount() > 0){
            echo json_encode(["status" => "error", "message" => "Email này đã được sử dụng!"]);
        } else {
            // 2. Mã hóa mật khẩu (Bcrypt)
            $password_hash = password_hash($password, PASSWORD_BCRYPT);

            // 3. Thêm vào CSDL
            $query = "INSERT INTO users (name, email, password, role, is_online) VALUES (:name, :email, :password, :role, 1)";
            $stmt = $conn->prepare($query);

            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password_hash);
            $stmt->bindParam(':role', $role);

            if($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Đăng ký tài khoản Vendor thành công!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Không thể tạo tài khoản."]);
            }
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi Server: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Thiếu thông tin đăng ký."]);
}
?>