<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once './config/database.php';
include_once './utils/jwt_helper.php';

$action = $_GET['action'] ?? 'list';

function get_bearer_token() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!$authHeader) return '';
    return str_replace('Bearer ', '', $authHeader);
}

function get_authenticated_user() {
    $token = get_bearer_token();
    if (!$token) return null;
    return JWT_Helper::validate($token);
}

function ensure_customer_user($conn) {
    $user = get_authenticated_user();
    if (!$user || empty($user->id)) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, name, role FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $user->id]);
    $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$dbUser) {
        echo json_encode(["status" => "error", "message" => "User không tồn tại"]);
        exit();
    }

    if (strtolower((string)$dbUser['role']) !== 'customer') {
        echo json_encode(["status" => "error", "message" => "Chỉ khách hàng mới có thể đánh giá sản phẩm"]);
        exit();
    }

    return $dbUser;
}

function has_customer_purchased_product($conn, $customerId, $productId) {
    $sql = "SELECT 1
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.customer_id = :cid
              AND oi.product_id = :pid
              AND o.delivery_status = 'Đã giao hàng'
              AND o.payment_status != 'Hủy'
            LIMIT 1";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':cid' => $customerId,
        ':pid' => $productId,
    ]);

    return (bool)$stmt->fetchColumn();
}

function parse_json_body() {
    $raw = file_get_contents("php://input");
    if (!$raw) return null;
    $decoded = json_decode($raw);
    return $decoded ?: null;
}

try {
    switch ($action) {
        case 'list': {
            $sql = "SELECT * FROM product_reviews ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $rows]);
            break;
        }

        case 'update_status': {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Yêu cầu phương thức POST');
            }

            $data = parse_json_body();
            if (empty($data->id) || empty($data->status)) {
                throw new Exception('Thiếu ID hoặc trạng thái mới');
            }

            $sql = "UPDATE product_reviews SET status = :status WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':status' => $data->status,
                ':id' => $data->id,
            ]);

            echo json_encode(["status" => "success", "message" => "Đã cập nhật trạng thái thành công"]);
            break;
        }

        case 'delete': {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Yêu cầu phương thức POST');
            }

            $data = parse_json_body();
            if (empty($data->id)) {
                throw new Exception('Thiếu ID đánh giá cần xóa');
            }

            $sql = "DELETE FROM product_reviews WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':id' => $data->id]);

            echo json_encode(["status" => "success", "message" => "Đã xóa đánh giá"]);
            break;
        }

        case 'list_product': {
            $productId = (int)($_GET['product_id'] ?? 0);
            if ($productId <= 0) {
                throw new Exception('Thiếu product_id hợp lệ');
            }

            $productStmt = $conn->prepare("SELECT name FROM products WHERE id = :pid LIMIT 1");
            $productStmt->execute([':pid' => $productId]);
            $productName = $productStmt->fetchColumn();

            if (!$productName) {
                echo json_encode(["status" => "success", "data" => []]);
                break;
            }

            $sql = "SELECT id, customer_name, rating, comment, review_img, review_date, created_at
                    FROM product_reviews
                    WHERE product_name = :pname AND status = 'Approved'
                    ORDER BY created_at DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':pname' => $productName]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($rows as &$row) {
                $row['rating'] = (int)$row['rating'];
            }

            echo json_encode(["status" => "success", "data" => $rows]);
            break;
        }

        case 'can_rate': {
            $productId = (int)($_GET['product_id'] ?? 0);
            if ($productId <= 0) {
                throw new Exception('Thiếu product_id hợp lệ');
            }

            $user = get_authenticated_user();
            if (!$user || empty($user->id)) {
                echo json_encode([
                    "status" => "success",
                    "can_rate" => false,
                    "reason" => "Vui lòng đăng nhập để đánh giá"
                ]);
                break;
            }

            $stmt = $conn->prepare("SELECT role FROM users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $user->id]);
            $role = strtolower((string)$stmt->fetchColumn());

            if ($role !== 'customer') {
                echo json_encode([
                    "status" => "success",
                    "can_rate" => false,
                    "reason" => "Chỉ tài khoản khách hàng có thể đánh giá"
                ]);
                break;
            }

            $eligible = has_customer_purchased_product($conn, (int)$user->id, $productId);
            echo json_encode([
                "status" => "success",
                "can_rate" => $eligible,
                "reason" => $eligible ? "" : "Bạn chỉ có thể đánh giá sau khi đã mua sản phẩm này"
            ]);
            break;
        }

        case 'create': {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('Yêu cầu phương thức POST');
            }

            $dbUser = ensure_customer_user($conn);

            $productId = (int)($_POST['product_id'] ?? 0);
            $rating = (int)($_POST['rating'] ?? 0);
            $comment = trim((string)($_POST['comment'] ?? ''));

            if ($productId <= 0) throw new Exception('Thiếu product_id hợp lệ');
            if ($rating < 1 || $rating > 5) throw new Exception('Điểm đánh giá phải từ 1 đến 5');
            if ($comment === '') throw new Exception('Vui lòng nhập nội dung đánh giá');

            if (!has_customer_purchased_product($conn, (int)$dbUser['id'], $productId)) {
                throw new Exception('Bạn chỉ có thể đánh giá sản phẩm đã mua');
            }

            $productStmt = $conn->prepare("SELECT p.name AS product_name, u.name AS vendor_name
                                           FROM products p
                                           JOIN users u ON p.vendor_id = u.id
                                           WHERE p.id = :pid
                                           LIMIT 1");
            $productStmt->execute([':pid' => $productId]);
            $productInfo = $productStmt->fetch(PDO::FETCH_ASSOC);

            if (!$productInfo) {
                throw new Exception('Sản phẩm không tồn tại');
            }

            $reviewImage = null;
            if (isset($_FILES['image']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
                $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                $mime = mime_content_type($_FILES['image']['tmp_name']);
                if (!in_array($mime, $allowed, true)) {
                    throw new Exception('Định dạng ảnh không hợp lệ');
                }

                if ((int)$_FILES['image']['size'] > 5 * 1024 * 1024) {
                    throw new Exception('Ảnh đánh giá vượt quá 5MB');
                }

                $uploadDir = './uploads/reviews/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $filename = 'review_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext ?: 'jpg');
                $target = $uploadDir . $filename;

                if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
                    throw new Exception('Upload ảnh đánh giá thất bại');
                }

                $reviewImage = 'http://localhost/nongsan-api/uploads/reviews/' . $filename;
            }

            $insertSql = "INSERT INTO product_reviews
                          (customer_name, product_name, vendor_name, rating, comment, review_img, status, review_date)
                          VALUES (:customer_name, :product_name, :vendor_name, :rating, :comment, :review_img, 'Pending', CURDATE())";
            $stmt = $conn->prepare($insertSql);
            $stmt->execute([
                ':customer_name' => $dbUser['name'],
                ':product_name' => $productInfo['product_name'],
                ':vendor_name' => $productInfo['vendor_name'],
                ':rating' => $rating,
                ':comment' => $comment,
                ':review_img' => $reviewImage,
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Đánh giá đã được gửi, vui lòng chờ duyệt",
            ]);
            break;
        }

        default:
            throw new Exception('Hành động không hợp lệ');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>