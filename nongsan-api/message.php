<?php
include_once './config/database.php';
header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

if (empty($action)) {
    echo json_encode(["status" => "error", "message" => "Thiếu tham số action"]);
    exit;
}

try {
    switch ($action) {
        case 'get_conversations':
            $user_id = $_GET['user_id'];
            $sql = "SELECT c.id, u.id as partner_id, u.name, u.avatar, c.last_message as lastMessage, c.last_time as time,
                    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.receiver_id = :uid AND m.is_read = 0) as unread
                    FROM conversations c
                    JOIN users u ON (u.id = c.user_one OR u.id = c.user_two) AND u.id != :uid
                    WHERE c.user_one = :uid OR c.user_two = :uid ORDER BY c.last_time DESC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':uid' => $user_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'get_messages':
            $cid = $_GET['conversation_id'];
            $uid = $_GET['user_id'];
            $sql = "SELECT id, sender_id, CASE WHEN sender_id = :uid THEN 'admin' ELSE 'customer' END as sender,
                    message_text as text, message_type as type, media_url, created_at as time
                    FROM messages WHERE conversation_id = :cid ORDER BY created_at ASC";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':cid' => $cid, ':uid' => $uid]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($messages as &$m) {
                $m['images'] = !empty($m['media_url']) ? json_decode($m['media_url'], true) : [];
                $m['time'] = date('H:i', strtotime($m['time']));
            }
            echo json_encode($messages);
            break;

        case 'send_message':
            $cid = $_POST['conversation_id'];
            $sid = $_POST['sender_id'];
            $rid = $_POST['receiver_id'];
            $text = isset($_POST['text']) ? $_POST['text'] : '';
            $uploaded_files = [];
            $final_type = 'text';

            if (isset($_FILES['images'])) {
                // KIỂM TRA GIỚI HẠN 40 FILE
                $file_count = count($_FILES['images']['tmp_name']);
                if ($file_count > 40) {
                    echo json_encode(["status" => "error", "message" => "Chỉ được phép gửi tối đa 40 ảnh/video một lần."]);
                    exit;
                }

                $upload_dir = "./uploads/";
                if (!file_exists($upload_dir)) mkdir($upload_dir, 0777, true);

                foreach ($_FILES['images']['tmp_name'] as $key => $tmp_name) {
                    if (empty($tmp_name)) continue;

                    $ext = strtolower(pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION));
                    $filename = time() . "_" . uniqid() . "." . $ext;

                    if (move_uploaded_file($tmp_name, $upload_dir . $filename)) {
                        $uploaded_files[] = "http://localhost/nongsan-api/uploads/" . $filename;
                        
                        // Xác định loại tin nhắn (Ưu tiên video nếu có trong danh sách file)
                        if (in_array($ext, ['mp4', 'webm', 'mov', 'avi'])) {
                            $final_type = 'video';
                        } else if ($final_type !== 'video') {
                            $final_type = 'image';
                        }
                    }
                }
            }

            $conn->beginTransaction();
            $media_json = !empty($uploaded_files) ? json_encode($uploaded_files) : null;
            
            // Lưu vào bảng messages
            $stmt = $conn->prepare("INSERT INTO messages (conversation_id, sender_id, receiver_id, message_text, media_url, message_type, is_read) VALUES (?, ?, ?, ?, ?, ?, 0)");
            $stmt->execute([$cid, $sid, $rid, $text, $media_json, $final_type]);

            // Cập nhật last_message để hiển thị ở danh sách bên trái
            $last_msg = !empty($uploaded_files) ? ($final_type === 'video' ? "[Video]" : "[Hình ảnh]") : $text;
            $stmt = $conn->prepare("UPDATE conversations SET last_message = ?, last_time = NOW() WHERE id = ?");
            $stmt->execute([$last_msg, $cid]);
            
            $conn->commit();
            echo json_encode(["status" => "success"]);
            break;

        default:
            echo json_encode(["status" => "error", "message" => "Hành động không hợp lệ"]);
            break;
    }
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) $conn->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}