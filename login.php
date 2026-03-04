<?php
include_once './config/database.php';
include_once './utils/jwt_helper.php';
require_once './helpers/audit_log.php';

header('Content-Type: application/json');
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode([
        "status" => "error",
        "message" => "Vui lòng nhập Email và Mật khẩu."
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => trim($data->email)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($data->password, $user['password'])) {
        echo json_encode([
            "status" => "error",
            "message" => "Email hoặc mật khẩu không chính xác."
        ]);
        exit;
    }

    $role = $user['role'];

    // CHỈ CHO PHÉP ADMIN & VENDOR
    if (!in_array($role, ['admin', 'vendor'])) {
        echo json_encode([
            "status" => "error",
            "message" => "Tài khoản không có quyền truy cập quản trị."
        ]);
        exit;
    }

    $user_id = (int)$user['id'];

    // ========================================================
    // BƯỚC THÊM MỚI: CẬP NHẬT TRẠNG THÁI IS_ONLINE THÀNH 1
    // ========================================================
    $updateOnline = $conn->prepare("UPDATE users SET is_online = 1 WHERE id = :id");
    $updateOnline->execute([':id' => $user_id]);
    // Cập nhật lại biến $user để trả về React có is_online = 1 luôn
    $user['is_online'] = 1; 
    // ========================================================

    $is_approved = isset($user['is_approved']) ? (int)$user['is_approved'] : 0;

    // Tạo JWT
    $token_payload = [
        'id'   => $user_id,
        'role' => $role,
        'exp'  => time() + (60 * 60 * 24)
    ];

    $token = JWT_Helper::create($token_payload);
    unset($user['password']);

    // 📝 GHI AUDIT LOG ĐĂNG NHẬP
    write_audit_log(
        strtoupper($role) . " {$user['name']} (id {$user_id}) đã đăng nhập"
    );

    echo json_encode([
        "status" => "success",
        "token"  => $token,
        "user"   => $user
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Lỗi: " . $e->getMessage()
    ]);
}