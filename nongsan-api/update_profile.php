<?php
// File: update_profile.php
include_once './config/database.php';

// --- CẤU HÌNH ĐƯỜNG DẪN LƯU ẢNH ---
// Đường dẫn thư mục vật lý để lưu file
$target_dir = "uploads/avatars/";
// Đường dẫn URL để lưu vào Database (Client truy cập)
$base_url = "http://localhost/nongsan-api/uploads/avatars/";

// Tạo thư mục nếu chưa có
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

// Kiểm tra method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

// Lấy dữ liệu Text từ FormData
$id = isset($_POST['id']) ? $_POST['id'] : null;
$name = isset($_POST['name']) ? $_POST['name'] : '';
$shop_name = isset($_POST['shop_name']) ? $_POST['shop_name'] : '';
$phone = isset($_POST['phone']) ? $_POST['phone'] : '';
$address = isset($_POST['address']) ? $_POST['address'] : '';
$description = isset($_POST['description']) ? $_POST['description'] : '';

if (!$id) {
    echo json_encode(["status" => "error", "message" => "Thiếu ID người dùng"]);
    exit();
}

try {
    // --- XỬ LÝ UPLOAD ẢNH (NẾU CÓ) ---
    $avatar_sql_part = ""; 
    $params = [
        ':name' => $name,
        ':shop' => $shop_name,
        ':phone' => $phone,
        ':addr' => $address,
        ':desc' => $description,
        ':id' => $id
    ];

    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === 0) {
        $file_name = time() . "_" . basename($_FILES['avatar']['name']);
        $target_file = $target_dir . $file_name;
        $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

        // Kiểm tra định dạng ảnh
        $valid_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (in_array($imageFileType, $valid_extensions)) {
            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $target_file)) {
                // Upload thành công -> Thêm vào câu lệnh SQL
                $new_avatar_url = $base_url . $file_name;
                $avatar_sql_part = ", avatar = :avatar";
                $params[':avatar'] = $new_avatar_url;
            } else {
                echo json_encode(["status" => "error", "message" => "Lỗi khi lưu file ảnh."]);
                exit();
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Chỉ chấp nhận file ảnh (JPG, PNG, GIF)."]);
            exit();
        }
    }

    // --- CẬP NHẬT CSDL ---
    // Chỉ cập nhật avatar nếu có file mới ($avatar_sql_part)
    $query = "UPDATE users SET 
                name = :name, 
                shop_name = :shop, 
                phone = :phone, 
                address = :addr, 
                description = :desc
                $avatar_sql_part
              WHERE id = :id";

    $stmt = $conn->prepare($query);
    
    if ($stmt->execute($params)) {
        // Trả về URL ảnh mới để React hiển thị ngay lập tức
        $response = [
            "status" => "success", 
            "message" => "Cập nhật hồ sơ thành công!",
        ];
        if (isset($new_avatar_url)) {
            $response['new_avatar'] = $new_avatar_url;
        }
        echo json_encode($response);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể cập nhật Database."]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Lỗi Server: " . $e->getMessage()]);
}
?>