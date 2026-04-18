<?php
include_once './config/database.php';
include_once './utils/jwt_helper.php';
<<<<<<< HEAD
require_once './config/mail.php';
=======
>>>>>>> DaiVan

// Import PHPMailer thủ công
require './PHPMailer/Exception.php';
require './PHPMailer/PHPMailer.php';
require './PHPMailer/SMTP.php';
require_once './helpers/audit_log.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents("php://input"));

if(isset($data->name) && isset($data->email) && isset($data->password)) {
    $name = trim($data->name);
    $email = trim($data->email);
<<<<<<< HEAD
    $requestedRole = strtolower(trim((string)($data->role ?? 'vendor')));
    $role = in_array($requestedRole, ['vendor', 'customer', 'user'], true) ? ($requestedRole === 'user' ? 'customer' : $requestedRole) : 'vendor';

    // 1. KIỂM TRA TRÙNG LẶP
    // Vendor: kiểm tra cả tên + email; Customer: chỉ kiểm tra email.
    if ($role === 'vendor') {
        $check = $conn->prepare("SELECT name, email FROM users WHERE name = :name OR email = :email LIMIT 1");
        $check->execute([':name' => $name, ':email' => $email]);
    } else {
        $check = $conn->prepare("SELECT name, email FROM users WHERE email = :email LIMIT 1");
        $check->execute([':email' => $email]);
    }
    $existingUser = $check->fetch(PDO::FETCH_ASSOC);

    if($existingUser) {
        if ($role === 'vendor' && strcasecmp($existingUser['name'], $name) == 0 && $existingUser['name'] == $name) {
=======

    // 1. KIỂM TRA TRÙNG LẶP (CẢ TÊN VÀ EMAIL)
    // Sử dụng BINARY nếu muốn 'Admin' khác 'admin' hoàn toàn trong MySQL
    $check = $conn->prepare("SELECT name, email FROM users WHERE name = :name OR email = :email LIMIT 1");
    $check->execute([':name' => $name, ':email' => $email]);
    $existingUser = $check->fetch(PDO::FETCH_ASSOC);

    if($existingUser) {
        if (strcasecmp($existingUser['name'], $name) == 0 && $existingUser['name'] == $name) {
>>>>>>> DaiVan
             // Nếu database của bạn là Case-Insensitive, admin và admin sẽ lọt vào đây
             echo json_encode(["status" => "error", "message" => "Tên người dùng '$name' này đã tồn tại, vui lòng chọn tên khác!"]);
             exit();
        }
        if ($existingUser['email'] == $email) {
            echo json_encode(["status" => "error", "message" => "Email này đã được sử dụng!"]);
            exit();
        }
    }
    // 2. Tạo OTP - Luôn giữ định dạng Chuỗi 6 số
    $otp = (string)rand(100000, 999999);

    // 3. Gửi Email
    $mail = new PHPMailer(true);
<<<<<<< HEAD
    $mailConfig = get_mail_config();
    try {
        $mail->isSMTP();
        $mail->Host       = $mailConfig['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $mailConfig['username'];
        $mail->Password   = $mailConfig['password'];
        $mail->SMTPSecure = ($mailConfig['encryption'] === 'ssl')
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)$mailConfig['port'];
        $mail->CharSet    = 'UTF-8'; // Đảm bảo tiếng Việt không lỗi

        $mail->setFrom($mailConfig['from_email'], $mailConfig['from_name']);
        $mail->addAddress($email);

        $mail->isHTML(true);
        $roleLabel = $role === 'vendor' ? 'Vendor' : 'Khách hàng';
        $mail->Subject = "Mã xác nhận đăng ký {$roleLabel}";
=======
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; 
        $mail->SMTPAuth   = true;
        $mail->Username   = 'tu0147258369@gmail.com'; 
        $mail->Password   = 'tmmu yrcb fesb mtvq'; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8'; // Đảm bảo tiếng Việt không lỗi

        $mail->setFrom('no-reply@nongsan.com', 'Hệ Thống Nông Sản');
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->Subject = 'Mã xác nhận đăng ký Vendor';
>>>>>>> DaiVan
        $mail->Body    = "
            <div style='font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                <h2 style='color: #2eb85c;'>Xác thực đăng ký</h2>
                <p>Chào <b>{$data->name}</b>, mã OTP của bạn là:</p>
                <div style='background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #333;'>
                    $otp
                </div>
                <p style='color: #666; font-size: 12px; margin-top: 20px;'>Mã này có hiệu lực trong 10 phút. Không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
        ";

        $mail->send();
        write_audit_log(
<<<<<<< HEAD
    strtoupper($role) . " {$name} ({$email}) đã yêu cầu đăng ký – gửi OTP"
=======
    "VENDOR {$name} ({$email}) đã yêu cầu đăng ký – gửi OTP"
>>>>>>> DaiVan
);
        // 4. Tạo JWT - Ép kiểu STRING toàn bộ các trường quan trọng
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
        
        $temp_data = [
            'name'          => (string)$data->name,
            'email'         => (string)$email,
            'password_hash' => (string)$password_hash,
<<<<<<< HEAD
            'role'          => $role,
=======
            'role'          => 'vendor',
>>>>>>> DaiVan
            'otp'           => (string)$otp, // Ép kiểu chuỗi cực kỳ quan trọng
            'exp'           => time() + (60 * 10) // 10 phút
        ];

        $token = JWT_Helper::create($temp_data);

        echo json_encode([
            "status" => "success", 
            "message" => "Mã OTP đã được gửi, vui lòng kiểm tra email!",
            "temp_token" => $token 
        ]);

    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Gửi mail thất bại: {$mail->ErrorInfo}"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ thông tin."]);
}
?>