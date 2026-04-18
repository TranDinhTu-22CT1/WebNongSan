<?php
<<<<<<< HEAD
// Dev CORS for health check endpoint.
header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
	http_response_code(204);
	exit;
}

echo json_encode(['status' => 'success']);
=======
// Cho phép React truy cập (Sửa lỗi CORS)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Nếu server vẫn đang chạy ổn định, trả về success
echo json_encode(["status" => "success"]);
>>>>>>> DaiVan
exit;