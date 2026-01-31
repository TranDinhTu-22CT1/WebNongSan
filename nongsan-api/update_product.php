<?php
include_once './config/database.php';

$base_url = "http://localhost/nongsan-api/uploads/";
$target_dir = "./uploads/";

$final_images = [];

// 1. Giữ lại ảnh cũ (được gửi lên dạng string URL)
if (isset($_POST['existing_images'])) {
    // existing_images gửi lên là array string
    $final_images = $_POST['existing_images']; 
}

// 2. Upload ảnh mới (nếu có)
if (isset($_FILES['new_images'])) {
    $total = count($_FILES['new_images']['name']);
    for ($i = 0; $i < $total; $i++) {
        $filename = time() . "_" . basename($_FILES['new_images']['name'][$i]);
        $target_file = $target_dir . $filename;
        if (move_uploaded_file($_FILES['new_images']['tmp_name'][$i], $target_file)) {
            $final_images[] = $base_url . $filename;
        }
    }
}

// 3. Lấy thông tin
$id = $_POST['id'];
$vendor_id = $_POST['vendor_id']; // Để check quyền sở hữu
$name = $_POST['name'];
$category = $_POST['category'];
$price = $_POST['price'];
$stock = $_POST['stock'];
$unit = $_POST['unit'];
$origin = $_POST['origin'];
$description = $_POST['description'];
$status = $_POST['status'];

$images_json = json_encode($final_images);

try {
    // Logic: Khi sửa sản phẩm -> Reset trạng thái về 'pending' (chờ duyệt) 
    // và xóa cờ 'is_banned' (để Admin duyệt lại từ đầu)
    $query = "UPDATE products SET 
                name = :name, 
                category = :cat, 
                price = :price, 
                stock = :stock, 
                unit = :unit, 
                origin = :origin, 
                description = :desc, 
                status = :status, 
                images = :imgs,
                approval_status = 'pending', 
                is_banned = 0,
                ban_reason = NULL
              WHERE id = :id AND vendor_id = :vid";

    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':name' => $name,
        ':cat' => $category,
        ':price' => $price,
        ':stock' => $stock,
        ':unit' => $unit,
        ':origin' => $origin,
        ':desc' => $description,
        ':status' => $status,
        ':imgs' => $images_json,
        ':id' => $id,
        ':vid' => $vendor_id
    ]);

    echo json_encode(["status" => "success", "message" => "Cập nhật thành công. Đang chờ duyệt lại."]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
}
?>