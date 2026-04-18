<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
<<<<<<< HEAD
header("Access-Control-Allow-Headers: Content-Type, Authorization");
=======
header("Access-Control-Allow-Headers: Content-Type");
>>>>>>> DaiVan
header("Content-Type: application/json; charset=UTF-8");

include_once './config/database.php'; 

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

<<<<<<< HEAD
function ensurePurchasedVouchersTable($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS purchased_vouchers (
        id INT NOT NULL AUTO_INCREMENT,
        code VARCHAR(40) NOT NULL,
        purchased_by_customer_id INT NOT NULL,
        recipient_note VARCHAR(255) DEFAULT NULL,
        amount_paid DECIMAL(15,2) NOT NULL,
        voucher_type ENUM('fixed','percent') NOT NULL DEFAULT 'fixed',
        voucher_value DECIMAL(10,2) NOT NULL,
        min_order_value DECIMAL(15,2) NOT NULL DEFAULT 0,
        max_discount_value DECIMAL(15,2) DEFAULT NULL,
        status ENUM('active','redeemed','expired','cancelled') NOT NULL DEFAULT 'active',
        redeemed_by_customer_id INT DEFAULT NULL,
        redeemed_order_id INT DEFAULT NULL,
        redeemed_at DATETIME DEFAULT NULL,
        expires_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_purchased_voucher_code (code),
        KEY idx_purchased_by_customer (purchased_by_customer_id),
        KEY idx_purchased_voucher_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $conn->exec($sql);
}

function generateGiftVoucherCode($conn) {
    for ($i = 0; $i < 6; $i++) {
        $code = 'GV' . strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));
        $stmt = $conn->prepare("SELECT id FROM purchased_vouchers WHERE code = :code LIMIT 1");
        $stmt->execute([':code' => $code]);
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            return $code;
        }
    }

    return 'GV' . strtoupper(substr(sha1(uniqid((string)mt_rand(), true)), 0, 10));
}

function computeGiftVoucherDiscount($voucher, $orderTotal) {
    $isPercent = strtolower((string)($voucher['voucher_type'] ?? 'fixed')) === 'percent';
    $value = (float)($voucher['voucher_value'] ?? 0);
    $discount = $isPercent ? ($orderTotal * $value / 100) : $value;
    $maxDiscount = isset($voucher['max_discount_value']) && $voucher['max_discount_value'] !== null
        ? (float)$voucher['max_discount_value']
        : null;

    if ($maxDiscount !== null && $maxDiscount > 0 && $discount > $maxDiscount) {
        $discount = $maxDiscount;
    }

    if ($discount < 0) {
        $discount = 0;
    }

    if ($discount > $orderTotal) {
        $discount = $orderTotal;
    }

    return round($discount, 2);
}

$getAuthUser = function() {
    if (!class_exists('JWT_Helper')) {
        $jwtPath = __DIR__ . '/utils/jwt_helper.php';
        if (file_exists($jwtPath)) {
            require_once $jwtPath;
        }
    }

    if (!class_exists('JWT_Helper')) {
        return null;
    }

    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = '';

    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    } elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }

    $token = trim(preg_replace('/^Bearer\s+/i', '', (string)$authHeader));
    if ($token === '') {
        return null;
    }

    return JWT_Helper::validate($token);
};

=======
>>>>>>> DaiVan
if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
<<<<<<< HEAD
    ensurePurchasedVouchersTable($conn);

    $normalizeDate = static function($value) {
        $value = trim((string)$value);
        if ($value === '') {
            return null;
        }

        $dt = DateTime::createFromFormat('Y-m-d', $value);
        if (!$dt || $dt->format('Y-m-d') !== $value) {
            return null;
        }

        return $value;
    };

    switch ($action) {
        // Danh sach voucher cho user app
        case 'get_user_vouchers':
            $today = date('Y-m-d');
                        $sql = "SELECT pr.id, pr.code, pr.name, pr.description, pr.type, pr.value, pr.min_order_value, pr.max_discount_value,
                                                     pr.scope, pr.product_id, pr.vendor_id, pr.start_date, pr.end_date,
                                                     p.name AS product_name, p.images AS product_images
                                FROM promotions pr
                                LEFT JOIN products p ON pr.product_id = p.id
                                WHERE pr.status = 1
                                    AND pr.start_date <= :today
                                    AND pr.end_date >= :today
                                ORDER BY pr.id DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':today' => $today]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'validate_code':
            if ($method !== 'POST') {
                throw new Exception('Yeu cau phuong thuc POST.');
            }

            $payload = json_decode(file_get_contents("php://input"), true);
            $code = strtoupper(trim((string)($payload['code'] ?? '')));
            $orderTotal = (float)($payload['order_total'] ?? 0);
            $cartItems = is_array($payload['cart_items'] ?? null) ? $payload['cart_items'] : [];

            if ($code === '') {
                echo json_encode(["status" => "error", "message" => "Vui long nhap ma voucher."]);
                break;
            }

            if ($orderTotal <= 0) {
                echo json_encode(["status" => "error", "message" => "Tong tien don hang khong hop le."]);
                break;
            }

            $today = date('Y-m-d');
            $now = date('Y-m-d H:i:s');

            $giftStmt = $conn->prepare("SELECT id, code, voucher_type, voucher_value, min_order_value, max_discount_value, status, expires_at
                                        FROM purchased_vouchers
                                        WHERE UPPER(code) = :code
                                        LIMIT 1");
            $giftStmt->execute([':code' => $code]);
            $giftVoucher = $giftStmt->fetch(PDO::FETCH_ASSOC);

            if ($giftVoucher) {
                if (($giftVoucher['status'] ?? 'active') !== 'active') {
                    echo json_encode(["status" => "error", "message" => "Voucher da duoc su dung hoac khong con hieu luc."]);
                    break;
                }

                if (!empty($giftVoucher['expires_at']) && $giftVoucher['expires_at'] < $now) {
                    echo json_encode(["status" => "error", "message" => "Voucher da het han."]);
                    break;
                }

                $giftMinOrder = (float)($giftVoucher['min_order_value'] ?? 0);
                if ($orderTotal < $giftMinOrder) {
                    echo json_encode([
                        "status" => "error",
                        "message" => "Don hang chua dat gia tri toi thieu de dung voucher nay.",
                        "min_order_value" => $giftMinOrder,
                    ]);
                    break;
                }

                $giftDiscount = computeGiftVoucherDiscount($giftVoucher, $orderTotal);
                $finalTotal = max(0, $orderTotal - $giftDiscount);

                echo json_encode([
                    "status" => "success",
                    "data" => [
                        "promotion_id" => 0,
                        "gift_voucher_id" => (int)$giftVoucher['id'],
                        "source" => "gift_voucher",
                        "code" => (string)$giftVoucher['code'],
                        "name" => 'Gift Voucher',
                        "type" => (string)$giftVoucher['voucher_type'],
                        "value" => (float)($giftVoucher['voucher_value'] ?? 0),
                        "discount_amount" => round($giftDiscount, 2),
                        "order_total" => round($orderTotal, 2),
                        "final_total" => round($finalTotal, 2),
                    ],
                ]);
                break;
            }

                $sql = "SELECT id, code, name, type, value, min_order_value, max_discount_value, usage_limit, used_count, limit_per_user, status, start_date, end_date, scope, product_id
                    FROM promotions
                    WHERE UPPER(code) = :code
                    LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':code' => $code]);
            $promo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$promo) {
                echo json_encode(["status" => "error", "message" => "Ma voucher khong ton tai."]);
                break;
            }

            if ((int)$promo['status'] !== 1) {
                echo json_encode(["status" => "error", "message" => "Voucher da bi khoa."]);
                break;
            }

            if ($promo['start_date'] > $today || $promo['end_date'] < $today) {
                echo json_encode(["status" => "error", "message" => "Voucher da het han hoac chua den ngay ap dung."]);
                break;
            }

            $minOrder = (float)($promo['min_order_value'] ?? 0);
            if ($orderTotal < $minOrder) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Don hang chua dat gia tri toi thieu de dung voucher.",
                    "min_order_value" => $minOrder,
                ]);
                break;
            }

            $usageLimit = (int)($promo['usage_limit'] ?? 0);
            $usedCount = (int)($promo['used_count'] ?? 0);
            if ($usageLimit > 0 && $usedCount >= $usageLimit) {
                echo json_encode(["status" => "error", "message" => "Voucher da het luot su dung."]);
                break;
            }

            $authUser = $getAuthUser();
            if ($authUser && !empty($authUser->id)) {
                $limitPerUser = (int)($promo['limit_per_user'] ?? 0);
                if ($limitPerUser > 0) {
                    $usageStmt = $conn->prepare("SELECT COUNT(*) FROM promotion_usages WHERE promotion_id = :pid AND customer_id = :uid");
                    $usageStmt->execute([
                        ':pid' => (int)$promo['id'],
                        ':uid' => (int)$authUser->id,
                    ]);
                    $userUsage = (int)($usageStmt->fetchColumn() ?: 0);
                    if ($userUsage >= $limitPerUser) {
                        echo json_encode(["status" => "error", "message" => "Ban da dung het so lan ap dung voucher nay."]);
                        break;
                    }
                }
            }

            $value = (float)($promo['value'] ?? 0);
            $isPercent = strtolower((string)$promo['type']) === 'percent';
            $scope = strtolower((string)($promo['scope'] ?? 'order'));
            $targetProductId = (int)($promo['product_id'] ?? 0);
            $eligibleAmount = $orderTotal;

            if ($scope === 'product') {
                if ($targetProductId <= 0) {
                    echo json_encode(["status" => "error", "message" => "Voucher theo san pham khong hop le."]);
                    break;
                }

                $eligibleAmount = 0;
                foreach ($cartItems as $item) {
                    $pid = (int)($item['id'] ?? $item['product_id'] ?? 0);
                    if ($pid !== $targetProductId) continue;

                    $qty = (int)($item['quantity'] ?? $item['amount'] ?? $item['qty'] ?? 1);
                    if ($qty < 1) $qty = 1;
                    $price = (float)($item['price'] ?? 0);
                    if ($price <= 0) continue;

                    $eligibleAmount += ($price * $qty);
                }

                if ($eligibleAmount <= 0) {
                    echo json_encode(["status" => "error", "message" => "Voucher nay chi ap dung cho mot san pham cu the trong gio hang."]);
                    break;
                }
            }

            $discount = $isPercent ? ($eligibleAmount * $value / 100) : $value;

            $maxDiscount = $promo['max_discount_value'] !== null ? (float)$promo['max_discount_value'] : null;
            if ($maxDiscount !== null && $maxDiscount > 0 && $discount > $maxDiscount) {
                $discount = $maxDiscount;
            }

            if ($discount < 0) {
                $discount = 0;
            }

            if ($discount > $orderTotal) {
                $discount = $orderTotal;
            }

            $finalTotal = max(0, $orderTotal - $discount);

            echo json_encode([
                "status" => "success",
                "data" => [
                    "promotion_id" => (int)$promo['id'],
                    "gift_voucher_id" => 0,
                    "source" => "promotion",
                    "code" => (string)$promo['code'],
                    "name" => (string)$promo['name'],
                    "scope" => $scope,
                    "product_id" => $targetProductId,
                    "type" => (string)$promo['type'],
                    "value" => $value,
                    "eligible_amount" => round($eligibleAmount, 2),
                    "discount_amount" => round($discount, 2),
                    "order_total" => round($orderTotal, 2),
                    "final_total" => round($finalTotal, 2),
                ],
            ]);
            break;

        case 'purchase_gift_voucher':
            if ($method !== 'POST') {
                throw new Exception('Yeu cau phuong thuc POST.');
            }

            $authUser = $getAuthUser();
            if (!$authUser || empty($authUser->id)) {
                echo json_encode(["status" => "error", "message" => "Unauthorized"]);
                break;
            }

            $payload = json_decode(file_get_contents("php://input"), true);
            $buyerId = (int)$authUser->id;
            $amountPaid = (float)($payload['amount_paid'] ?? 0);
            $voucherMode = strtolower(trim((string)($payload['voucher_mode'] ?? 'fixed')));
            $percentRate = (float)($payload['percent_rate'] ?? 50);
            $customMinOrder = (float)($payload['min_order_value'] ?? 0);
            $expiresInDays = (int)($payload['expires_in_days'] ?? 90);
            $recipientNote = trim((string)($payload['recipient_note'] ?? ''));

            if ($amountPaid < 10000) {
                echo json_encode(["status" => "error", "message" => "Gia tri mua voucher toi thieu la 10,000d."]);
                break;
            }

            if (!in_array($voucherMode, ['fixed', 'percent'], true)) {
                echo json_encode(["status" => "error", "message" => "Loai voucher khong hop le."]);
                break;
            }

            if ($expiresInDays < 7) {
                $expiresInDays = 7;
            }
            if ($expiresInDays > 365) {
                $expiresInDays = 365;
            }

            $voucherValue = $amountPaid;
            $maxDiscountValue = $amountPaid;
            $minOrderValue = max($customMinOrder, $amountPaid + 1);

            if ($voucherMode === 'percent') {
                if ($percentRate < 5 || $percentRate > 90) {
                    echo json_encode(["status" => "error", "message" => "Phan tram giam phai trong khoang 5% den 90%."]);
                    break;
                }

                $voucherValue = $percentRate;
                $requiredMinForCap = (float)ceil(($amountPaid * 100) / $percentRate);
                $minOrderValue = max($minOrderValue, $requiredMinForCap);
            }

            $expiresAt = date('Y-m-d H:i:s', strtotime('+' . $expiresInDays . ' days'));
            $voucherCode = generateGiftVoucherCode($conn);

            $insertStmt = $conn->prepare("INSERT INTO purchased_vouchers
                (code, purchased_by_customer_id, recipient_note, amount_paid, voucher_type, voucher_value, min_order_value, max_discount_value, status, expires_at)
                VALUES
                (:code, :buyer_id, :recipient_note, :amount_paid, :voucher_type, :voucher_value, :min_order_value, :max_discount_value, 'active', :expires_at)");

            $insertStmt->execute([
                ':code' => $voucherCode,
                ':buyer_id' => $buyerId,
                ':recipient_note' => $recipientNote !== '' ? $recipientNote : null,
                ':amount_paid' => round($amountPaid, 2),
                ':voucher_type' => $voucherMode,
                ':voucher_value' => round($voucherValue, 2),
                ':min_order_value' => round($minOrderValue, 2),
                ':max_discount_value' => round($maxDiscountValue, 2),
                ':expires_at' => $expiresAt,
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Mua voucher thanh cong.",
                "data" => [
                    "id" => (int)$conn->lastInsertId(),
                    "code" => $voucherCode,
                    "voucher_type" => $voucherMode,
                    "voucher_value" => round($voucherValue, 2),
                    "min_order_value" => round($minOrderValue, 2),
                    "max_discount_value" => round($maxDiscountValue, 2),
                    "amount_paid" => round($amountPaid, 2),
                    "expires_at" => $expiresAt,
                ],
            ]);
            break;

        case 'get_my_purchased_vouchers':
            $authUser = $getAuthUser();
            if (!$authUser || empty($authUser->id)) {
                echo json_encode(["status" => "error", "message" => "Unauthorized"]);
                break;
            }

            $buyerId = (int)$authUser->id;
            $stmt = $conn->prepare("SELECT id, code, recipient_note, amount_paid, voucher_type, voucher_value, min_order_value, max_discount_value, status, redeemed_at, expires_at, created_at
                                    FROM purchased_vouchers
                                    WHERE purchased_by_customer_id = :buyer_id
                                    ORDER BY id DESC");
            $stmt->execute([':buyer_id' => $buyerId]);
            echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

=======
    switch ($action) {
>>>>>>> DaiVan
        // 1. Lấy danh sách khuyến mãi kèm tên sản phẩm
        case 'get_all':
            $vendor_id = $_GET['vendor_id'] ?? null;
            // Join với bảng products để lấy tên sản phẩm nếu scope là 'product'
            $sql = "SELECT pr.*, p.name as product_name 
                    FROM promotions pr
                    LEFT JOIN products p ON pr.product_id = p.id";
            
            if ($vendor_id) {
                $sql .= " WHERE pr.vendor_id = :vendor_id";
            }
            $sql .= " ORDER BY pr.id DESC";
            
            $stmt = $conn->prepare($sql);
            if ($vendor_id) $stmt->bindParam(':vendor_id', $vendor_id);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        // 2. Lấy danh sách sản phẩm của Vendor để hiển thị trong ô chọn (Select Box)
        case 'get_vendor_products':
            $vendor_id = $_GET['vendor_id'] ?? null;
            if (!$vendor_id) {
                echo json_encode(["status" => "error", "message" => "Thiếu ID người bán"]);
                exit;
            }
            $stmt = $conn->prepare("SELECT id, name, price FROM products WHERE vendor_id = ? AND is_banned = 0");
            $stmt->execute([$vendor_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

<<<<<<< HEAD
        case 'toggle_status':
            if ($method !== 'POST') {
                throw new Exception('Yeu cau phuong thuc POST.');
            }

            $data = json_decode(file_get_contents("php://input"), true);
            $id = isset($data['id']) ? (int)$data['id'] : 0;
            $new_status = isset($data['status']) ? (int)$data['status'] : -1;

            if ($id <= 0 || !in_array($new_status, [0, 1], true)) {
                echo json_encode(["status" => "error", "message" => "Du lieu cap nhat trang thai khong hop le."]);
                break;
            }

            $stmt = $conn->prepare("UPDATE promotions SET status = ? WHERE id = ?");
            if ($stmt->execute([$new_status, $id])) {
                echo json_encode(["status" => "success"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Khong the cap nhat trang thai"]);
            }
            break;

        // 3. Tạo mới hoặc Cập nhật
        case 'create':
        case 'update':
            if ($method !== 'POST') {
                throw new Exception('Yeu cau phuong thuc POST.');
            }

=======
        // 3. Tạo mới hoặc Cập nhật
        case 'create':
            // Thêm vào trong switch ($action) của file promotions.php
case 'toggle_status':
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'];
    $new_status = $data['status']; // 1 hoặc 0

    $stmt = $conn->prepare("UPDATE promotions SET status = ? WHERE id = ?");
    if ($stmt->execute([$new_status, $id])) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Không thể cập nhật trạng thái"]);
    }
    break;
        case 'update':
>>>>>>> DaiVan
            $data = json_decode(file_get_contents("php://input"), true);
            if (!$data) {
                echo json_encode(["status" => "error", "message" => "Không nhận được dữ liệu"]);
                exit;
            }

<<<<<<< HEAD
            $code = strtoupper(trim((string)($data['code'] ?? '')));
            $name = trim((string)($data['name'] ?? ''));
            $type = strtolower(trim((string)($data['type'] ?? 'percent')));
            $scope = trim((string)($data['scope'] ?? 'order'));
            $value = isset($data['value']) ? (float)$data['value'] : 0;
            $startDate = $normalizeDate($data['startDate'] ?? '');
            $endDate = $normalizeDate($data['endDate'] ?? '');
            $usageLimit = isset($data['limit']) && $data['limit'] !== '' ? (int)$data['limit'] : 100;

            if ($code === '' || $name === '') {
                echo json_encode(["status" => "error", "message" => "Ma voucher va ten chuong trinh khong duoc de trong."]);
                break;
            }

            if (!in_array($type, ['percent', 'fixed'], true)) {
                echo json_encode(["status" => "error", "message" => "Loai voucher khong hop le."]);
                break;
            }

            if (!in_array($scope, ['order', 'product'], true)) {
                echo json_encode(["status" => "error", "message" => "Pham vi ap dung khong hop le."]);
                break;
            }

            if ($value <= 0) {
                echo json_encode(["status" => "error", "message" => "Gia tri giam phai lon hon 0."]);
                break;
            }

            if ($startDate === null || $endDate === null) {
                echo json_encode(["status" => "error", "message" => "Ngay bat dau va ngay ket thuc khong hop le."]);
                break;
            }

            if ($startDate > $endDate) {
                echo json_encode(["status" => "error", "message" => "Ngay ket thuc phai lon hon hoac bang ngay bat dau."]);
                break;
            }

            // Xử lý giá trị productId (Nếu chọn toàn cửa hàng thì productId là NULL)
            $product_id = ($scope === 'product' && !empty($data['productId'])) ? (int)$data['productId'] : null;

            if ($scope === 'product' && empty($product_id)) {
                echo json_encode(["status" => "error", "message" => "Vui long chon san pham cho voucher theo san pham."]);
                break;
            }

            if ($action == 'create') {
                $sql = "INSERT INTO promotions (code, name, type, value, scope, product_id, vendor_id, start_date, end_date, usage_limit, status) 
                        VALUES (:code, :name, :type, :value, :scope, :product_id, :vendor_id, :start_date, :end_date, :usage_limit, 1)";
            } else {
                $updateId = isset($data['id']) ? (int)$data['id'] : 0;
                if ($updateId <= 0) {
                    echo json_encode(["status" => "error", "message" => "ID voucher khong hop le."]);
                    break;
                }

=======
            // Xử lý giá trị productId (Nếu chọn toàn cửa hàng thì productId là NULL)
            $product_id = ($data['scope'] === 'product' && !empty($data['productId'])) ? $data['productId'] : null;

            if ($action == 'create') {
                $sql = "INSERT INTO promotions (code, name, type, value, scope, product_id, vendor_id, start_date, end_date, usage_limit) 
                        VALUES (:code, :name, :type, :value, :scope, :product_id, :vendor_id, :start_date, :end_date, :usage_limit)";
            } else {
>>>>>>> DaiVan
                $sql = "UPDATE promotions SET code=:code, name=:name, type=:type, value=:value, scope=:scope, 
                        product_id=:product_id, start_date=:start_date, end_date=:end_date, usage_limit=:usage_limit 
                        WHERE id=:id";
            }
            
            $stmt = $conn->prepare($sql);
            $params = [
<<<<<<< HEAD
                ':code' => $code,
                ':name' => $name,
                ':type' => $type,
                ':value' => $value,
                ':scope' => $scope,
                ':product_id' => $product_id,
                ':start_date' => $startDate,
                ':end_date' => $endDate,
                ':usage_limit' => $usageLimit
            ];

            if ($action == 'create') {
                $params[':vendor_id'] = isset($data['vendor_id']) ? (int)$data['vendor_id'] : null;
            } else {
                $params[':id'] = $updateId;
=======
                ':code' => $data['code'],
                ':name' => $data['name'],
                ':type' => $data['type'],
                ':value' => $data['value'],
                ':scope' => $data['scope'],
                ':product_id' => $product_id,
                ':start_date' => $data['startDate'],
                ':end_date' => $data['endDate'],
                ':usage_limit' => $data['limit']
            ];

            if ($action == 'create') {
                $params[':vendor_id'] = $data['vendor_id'] ?? null;
            } else {
                $params[':id'] = $data['id'];
>>>>>>> DaiVan
            }

            if ($stmt->execute($params)) {
                echo json_encode(["status" => "success", "message" => "Thành công"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Lỗi thực thi SQL"]);
            }
            break;

        case 'delete':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $conn->prepare("DELETE FROM promotions WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(["status" => "success"]);
            }
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ"]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>