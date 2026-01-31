<?php
// login.php
include_once './config/database.php';
include_once './utils/jwt_helper.php';

// Đảm bảo trả về đúng định dạng JSON
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = trim($data->email);
    $password = $data->password;

    try {
        // 1. Tìm user theo email
        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // 2. Kiểm tra mật khẩu
            if(password_verify($password, $user['password'])) {
                $role = $user['role'];

                if ($role === 'vendor') {
                    // Cập nhật trạng thái online
                    $update = $conn->prepare("UPDATE users SET is_online = 1 WHERE id = :id");
                    $update->execute([':id' => $user['id']]);

                    // ÉP KIỂU DỮ LIỆU CỰC KỲ QUAN TRỌNG ĐỂ PHÍA REACT KHÔNG BỊ SAI BIẾN
                    $user_id = (int)$user['id'];
                    $is_approved = (int)$user['is_approved'];

                    // 3. Tạo Token Payload
                    $token_payload = [
                        'id' => $user_id,
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                        'is_approved' => $is_approved,
                        'exp' => time() + (60 * 60 * 24) // 24h
                    ];
                    $token = JWT_Helper::create($token_payload);

                    // 4. Chuẩn bị dữ liệu user trả về (Xóa các trường nhạy cảm)
                    unset($user['password']);
                    $user['id'] = $user_id; // Đảm bảo là Number
                    $user['is_approved'] = $is_approved; // Đảm bảo là Number
                    $user['is_online'] = 1;

                    echo json_encode([
                        "status" => "success",
                        "message" => "Đăng nhập thành công.",
                        "token" => $token,
                        "user" => $user
                    ]);
                    exit;

                } elseif ($role === 'admin') {
                    echo json_encode([
                        "status" => "error", 
                        "message" => "Bạn là Admin hãy truy cập trang Admin, ở đây không có việc của bạn!!!"
                    ]);
                } elseif ($role === 'customer') {
                    echo json_encode([
                        "status" => "error", 
                        "message" => "Nếu bạn muốn trở thành đối tác của chúng tôi thì hãy đăng ký nha!!"
                    ]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Tài khoản không được hỗ trợ trên trang này."]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "Mật khẩu không chính xác."]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Email không tồn tại trên hệ thống."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Lỗi Server: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ Email và Mật khẩu."]);
}