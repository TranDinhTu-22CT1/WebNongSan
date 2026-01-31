<?php
include_once './config/database.php';

$data = json_decode(file_get_contents("php://input"));
$conversation_id = $data->conversation_id;
$reader_id = $data->user_id; // ID người đang đọc tin

// Check xem reader là user_1 hay user_2 để reset cột tương ứng
$check = $conn->prepare("SELECT user_1_id FROM conversations WHERE id = :id");
$check->execute([':id' => $conversation_id]);
$row = $check->fetch(PDO::FETCH_ASSOC);

$unread_col = ($row['user_1_id'] == $reader_id) ? "unread_count_1" : "unread_count_2";

$sql = "UPDATE conversations SET $unread_col = 0 WHERE id = :cid";
$stmt = $conn->prepare($sql);
$stmt->execute([':cid' => $conversation_id]);

echo json_encode(["status" => "read"]);
?>