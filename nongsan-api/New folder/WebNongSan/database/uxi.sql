-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 14, 2026 lúc 03:51 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `uxi`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin_notifications`
--

CREATE TABLE `admin_notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `target_group` enum('ALL','VENDOR','USER') NOT NULL DEFAULT 'ALL',
  `type` enum('GENERAL','PROMOTION','HOLIDAYS','SYSTEM') NOT NULL DEFAULT 'GENERAL',
  `status` enum('DRAFT','ACTIVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  `admin_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `end_time` datetime DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','hidden') DEFAULT 'active',
  `display_order` int(11) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(255) DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `parent_id`, `description`, `status`, `display_order`, `meta_title`, `meta_description`, `meta_keywords`, `thumbnail`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Rau Củ', 'rau-cu', NULL, 'Rau cu tuoi sach, thu hoach moi moi ngay.', 'active', 1, NULL, NULL, NULL, NULL, '2026-03-02 06:51:52', '2026-03-08 08:53:47', NULL),
(2, 'Trái Cây', 'trai-cay', NULL, 'Trai cay theo mua, ngot tu nhien.', 'active', 2, NULL, NULL, NULL, NULL, '2026-03-08 08:45:23', '2026-03-08 08:53:47', NULL),
(3, 'Ngũ Cốc', 'ngu-coc', NULL, 'Ngu coc dinh duong cho bua an lanh manh.', 'active', 3, NULL, NULL, NULL, NULL, '2026-03-08 08:45:23', '2026-03-31 04:26:37', '2026-03-31 04:26:37'),
(4, 'Đồ Uống Tự Nhiên', 'do-uong-tu-nhien', NULL, 'Do uong lanh manh tu trai cay va hat.', 'active', 4, NULL, NULL, NULL, NULL, '2026-03-08 08:45:23', '2026-03-31 04:25:49', '2026-03-31 04:25:49'),
(5, 'Gia Vị', 'gia-vi', NULL, 'Gia vi tu nhien cho mon an dam da.', 'active', 5, NULL, NULL, NULL, NULL, '2026-03-08 08:45:23', '2026-03-08 08:53:47', NULL),
(6, 'Tươi Sống', 'tuoi-song', NULL, '', 'active', 0, NULL, NULL, NULL, NULL, '2026-03-31 04:26:27', '2026-03-31 04:26:27', NULL),
(7, 'Đồ uống tốt cho sức khỏe', 'do-uong-tot-cho-suc-khoe', NULL, '', 'active', 0, NULL, NULL, NULL, NULL, '2026-03-31 04:27:22', '2026-03-31 04:27:22', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `user_one` int(11) NOT NULL,
  `user_two` int(11) NOT NULL,
  `last_message` text DEFAULT NULL,
  `last_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `conversations`
--

INSERT INTO `conversations` (`id`, `user_one`, `user_two`, `last_message`, `last_time`, `created_at`) VALUES
(20, 6, 9, 'ditme', '2026-01-29 09:44:10', '2026-01-29 07:23:14'),
(21, 8, 6, '0', '2026-03-02 09:56:14', '2026-01-29 07:23:14'),
(22, 8, 26, 'a', '2026-03-05 05:00:35', '2026-03-05 05:00:35'),
(23, 8, 8, 'help', '2026-03-06 08:31:20', '2026-03-06 08:12:27'),
(24, 31, 8, 'okay', '2026-03-06 09:14:41', '2026-03-06 08:31:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text DEFAULT NULL,
  `media_url` text DEFAULT NULL,
  `message_type` enum('text','image','video') DEFAULT 'text',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `receiver_id`, `message_text`, `media_url`, `message_type`, `is_read`, `created_at`) VALUES
(1, 22, 8, 26, 'a', NULL, 'text', 1, '2026-03-05 05:00:35'),
(2, 23, 8, 8, '[CONTACT] Test User <test.user@example.com>: Xin chao tu form lien he', NULL, 'text', 0, '2026-03-06 08:12:27'),
(3, 23, 8, 8, 'lkjsdjhkf', NULL, 'text', 0, '2026-03-06 08:21:39'),
(4, 23, 8, 8, 'ljsdhgfjlasdhlfjads', NULL, 'text', 0, '2026-03-06 08:21:42'),
(5, 23, 8, 8, 'sfadj;klpfsdajl;kfasdjl;kfasdjkl;fasdjk;l', NULL, 'text', 0, '2026-03-06 08:21:48'),
(6, 23, 8, 8, 'dsf;lkj hjglj;kdsfhjgl;jdfsg', NULL, 'text', 0, '2026-03-06 08:21:54'),
(7, 23, 8, 8, 'help', NULL, 'text', 0, '2026-03-06 08:31:20'),
(8, 24, 31, 8, 'a', NULL, 'text', 1, '2026-03-06 08:31:50'),
(9, 24, 31, 8, '[CONTACT] Known User <huutinh582@gmail.com>: hello from known email', NULL, 'text', 1, '2026-03-06 08:57:31'),
(10, 24, 8, 31, 'aaa', NULL, 'text', 0, '2026-03-06 09:10:06'),
(11, 24, 8, 31, 'asdasdasd', NULL, 'text', 0, '2026-03-06 09:10:09'),
(12, 24, 8, 31, 'asd', NULL, 'text', 0, '2026-03-06 09:10:09'),
(13, 24, 8, 31, 'asd', NULL, 'text', 0, '2026-03-06 09:10:09'),
(14, 24, 8, 31, 'asd', NULL, 'text', 0, '2026-03-06 09:10:09'),
(15, 24, 8, 31, 'asd', NULL, 'text', 0, '2026-03-06 09:10:10'),
(16, 24, 31, 8, 'asdasd', NULL, 'text', 1, '2026-03-06 09:10:27'),
(17, 24, 8, 31, 'a', NULL, 'text', 0, '2026-03-06 09:14:39'),
(18, 24, 8, 31, 'okay', NULL, 'text', 0, '2026-03-06 09:14:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_code` varchar(20) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `vendor_id` int(11) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `payment_method` enum('Tiền mặt','Chuyển khoản') DEFAULT 'Tiền mặt',
  `payment_status` enum('Chờ thanh toán','Đã thanh toán','Hủy') DEFAULT 'Chờ thanh toán',
  `delivery_status` enum('Chờ lấy hàng','Đang giao hàng','Đã giao hàng','Đã hủy') DEFAULT 'Chờ lấy hàng',
  `shipping_address` text NOT NULL,
  `customer_phone` varchar(15) NOT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `customer_id`, `customer_name`, `vendor_id`, `total_amount`, `payment_method`, `payment_status`, `delivery_status`, `shipping_address`, `customer_phone`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(1, '#INV-001', 10, NULL, 6, 350000.00, 'Chuyển khoản', 'Đã thanh toán', 'Đã giao hàng', '123 Đường Lê Lợi, Đà Nẵng', '0905123456', NULL, '2026-01-28 07:42:51', '2026-01-28 08:56:57'),
(2, '#INV-002', 10, NULL, 6, 120000.00, 'Tiền mặt', 'Chờ thanh toán', 'Đã giao hàng', '456 Đường Hùng Vương, Quảng Nam', '0905123456', NULL, '2026-01-28 07:42:51', '2026-03-05 00:53:40'),
(3, '#INV-003', 10, NULL, 6, 500000.00, 'Tiền mặt', 'Hủy', 'Đã hủy', '789 Đường CMT8, TP.HCM', '0905123456', 'Khách hàng không còn nhu cầu mua nữa', '2026-01-28 07:42:51', '2026-01-28 07:42:51'),
(8, '#ORD-1772623804753', 31, NULL, 6, 1107.00, 'Tiền mặt', 'Chờ thanh toán', 'Đang giao hàng', '123123', '012398123', NULL, '2026-03-04 11:30:04', '2026-03-05 00:53:48'),
(10, '#ORD-1772697014929', 31, 'tinh', 6, 2583.00, 'Tiền mặt', 'Chờ thanh toán', 'Đang giao hàng', 'aaaaaa', '0398729285', NULL, '2026-03-05 07:50:14', '2026-03-08 09:50:55'),
(11, '#ORD-1772789829131', 9, 'E2E Customer', 6, 0.00, 'Tiền mặt', 'Chờ thanh toán', 'Chờ lấy hàng', '123 Test Street', '0900000000', NULL, '2026-03-06 09:37:09', '2026-03-06 09:37:09'),
(12, '#ORD-1772790264106', 31, 'tinh', 6, 491877.00, 'Chuyển khoản', 'Đã thanh toán', 'Đã giao hàng', 'aaaaaa', '0398729285', NULL, '2026-03-06 09:44:24', '2026-03-08 09:51:16'),
(13, '#ORD-1772790992027', 9, 'Stock Test', 6, 123.00, 'Tiền mặt', 'Chờ thanh toán', 'Đã giao hàng', 'Test Addr', '0900000000', NULL, '2026-03-06 09:56:32', '2026-03-08 09:51:14'),
(14, '#ORD-1772791014752', 9, 'Stock Test', 6, 123.00, 'Tiền mặt', 'Chờ thanh toán', 'Đã giao hàng', 'Test Addr', '0900000000', NULL, '2026-03-06 09:56:54', '2026-03-08 09:51:12'),
(15, '#ORD-1772963341107', 31, 'tinh', 41, 1118000.00, 'Tiền mặt', 'Chờ thanh toán', 'Đã giao hàng', 'aaaaaa', '0398729285', NULL, '2026-03-08 09:49:01', '2026-03-08 09:51:10'),
(16, '#ORD-1772963372172', 37, 'tinh', 41, 176000.00, 'Tiền mặt', 'Chờ thanh toán', 'Đã giao hàng', 'eslkrthghersdtfhglj;', '0398729285', NULL, '2026-03-08 09:49:32', '2026-03-08 09:51:08'),
(17, '#ORD-1774935313734', 31, 'tinh', 41, 217500.00, 'Tiền mặt', 'Chờ thanh toán', 'Chờ lấy hàng', 'XXXXXXXXXX', 'XXXXXXXXXX', NULL, '2026-03-31 05:35:13', '2026-03-31 05:35:13'),
(18, '#ORD-1774958425104', 9, 'Khách hàng', 41, 72000.00, 'Tiền mặt', 'Chờ thanh toán', 'Chờ lấy hàng', 'xxxxxxxxx', 'xxxxxxxxxx', NULL, '2026-03-31 12:00:25', '2026-03-31 12:00:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit`, `quantity`, `price`) VALUES
(1, 1, 101, 'Gạo ST25', 'kg', 5, 30000.00),
(2, 1, 102, 'Sầu riêng Ri6', 'kg', 2, 100000.00),
(3, 2, 103, 'Cà chua bi', 'Hộp', 4, 30000.00),
(4, 3, 104, 'Dâu tây Đà Lạt', 'Hộp', 2, 250000.00),
(6, 8, 6, '123', 'kg', 6, 123.00),
(7, 8, 7, '1234', 'kg', 3, 123.00),
(9, 10, 7, '1234', 'kg', 21, 123.00),
(10, 11, 6, '123', NULL, 1, 123.00),
(11, 12, 7, '1234', 'kg', 3999, 123.00),
(12, 13, 6, '123', 'kg', 1, 123.00),
(13, 14, 6, '123', 'kg', 1, 123.00),
(14, 15, 77, 'Quế thanh', 'gói', 8, 65000.00),
(15, 15, 74, 'Hành tím', 'kg', 8, 36000.00),
(16, 15, 75, 'Lá chanh', 'bó', 9, 18000.00),
(17, 15, 72, 'Nước chanh dây', 'chai', 4, 37000.00),
(18, 16, 47, 'Sả cây', 'bó', 8, 22000.00),
(19, 17, 106, 'Ba rọi rút sườn heo organic - 500g', 'g', 1, 217500.00),
(20, 18, 113, 'Trà sen hữu cơ Fito 20 túi lọc', 'hộp', 1, 72000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_tracking`
--

CREATE TABLE `order_tracking` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `status_title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `order_tracking`
--

INSERT INTO `order_tracking` (`id`, `order_id`, `status_title`, `description`, `created_at`) VALUES
(1, 1, 'Vendor đã giao hàng', 'Đã lấy hàng từ Nông trại.', '2026-02-05 03:00:00'),
(2, 1, 'Đã nhập kho trung chuyển', 'Kho trung tâm TP.HCM', '2026-02-05 09:00:00'),
(3, 1, 'Đang giao hàng', 'Shipper đang trên đường giao đến bạn.', '2026-02-06 02:30:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payout_requests`
--

CREATE TABLE `payout_requests` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `balance_available` decimal(15,2) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `bank_account` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payout_requests`
--

INSERT INTO `payout_requests` (`id`, `code`, `vendor_id`, `balance_available`, `amount`, `bank_name`, `bank_account`, `status`, `notes`, `admin_note`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(4, 'PAY-1001', 27, 15000000.00, 5000000.00, 'Vietcombank', '0123456789', 'approved', 'Yêu cầu rút định kỳ tuần 1 tháng 3.', NULL, NULL, '2026-03-08 09:50:47', '2026-03-01 01:30:00', '2026-03-08 09:50:47', NULL),
(5, 'PAY-1002', 28, 25000000.00, 15450000.00, 'MB Bank', '9876543210', 'approved', 'Rút doanh thu tháng 2.', NULL, NULL, NULL, '2026-02-28 08:00:00', '2026-03-02 08:30:01', NULL),
(6, 'PAY-1003', 27, 8000000.00, 8000000.00, 'Techcombank', '190333444555', 'pending', 'Rút toàn bộ số dư khả dụng.', NULL, NULL, NULL, '2026-03-02 02:15:00', '2026-03-02 08:30:01', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `unit` varchar(50) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Còn hàng','Hết hàng','Sắp có hàng') DEFAULT 'Còn hàng',
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_banned` tinyint(1) DEFAULT 0,
  `ban_reason` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `vendor_id`, `name`, `category`, `price`, `stock`, `unit`, `origin`, `description`, `status`, `approval_status`, `is_banned`, `ban_reason`, `images`, `created_at`, `updated_at`) VALUES
(51, 41, 'Củ dền', 'Rau Củ', 39000.00, 120, 'kg', 'Đà Lạt', 'Mau dep, nhieu chat chong oxy hoa.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/rau-cu-cu-den.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(53, 41, 'Măng tây xanh', 'Rau Củ', 79000.00, 95, 'kg', 'Ninh Thuận', 'Mang tay gion, giau chat xo.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/rau-cu-mang-tay.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(54, 41, 'Bắp cải tím', 'Rau Củ', 32000.00, 130, 'kg', 'Đà Lạt', 'Bap cai tim ngon cho salad.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/rau-cu-bap-cai-tim.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(56, 41, 'Xoài cát Hòa Lộc', 'Trái Cây', 85000.00, 100, 'kg', 'Tiền Giang', 'Xoai cat thom, it xo.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/trai-cay-xoai.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(57, 41, 'Bưởi da xanh', 'Trái Cây', 62000.00, 105, 'kg', 'Bến Tre', 'Buoi tep hong, vi ngot thanh.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/trai-cay-buoi.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(58, 41, 'Lê Nam Phi', 'Trái Cây', 92000.00, 80, 'kg', 'Nam Phi', 'Le gion, ngot mat.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/trai-cay-le.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(59, 41, 'Dứa mật', 'Trái Cây', 36000.00, 135, 'kg', 'Tiền Giang', 'Dua mat huong thom dam.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/seed-products/trai-cay-dua.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 08:59:13'),
(73, 41, 'Nghệ tươi', 'Gia Vị', 30000.00, 180, 'kg', 'Nghệ An', 'Nghe tuoi vang dam, mui thom.', '', 'approved', 0, NULL, '[\"http://localhost/nongsan-api/uploads/curated-products/top10-nghe-tuoi.jpg\"]', '2026-03-08 08:59:13', '2026-03-08 09:13:06'),
(78, 41, 'Hồi khô', 'Gia Vị', 82000.00, 90, 'gói', 'Lạng Sơn', 'Hoi kho tao mui thom cho pho.', '', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/curated-products\\/top10-hoi-kho.jpg\"]', '2026-03-08 08:59:13', '2026-03-31 04:54:52'),
(79, 41, 'Thanh long trắng hữu cơ', 'Trái Cây', 80000.00, 99999, 'kg', 'Đà Lạt', 'Thanh Long chuẩn Hữu Cơ tại Việt Nam - Tiêu Chuẩn USDA được trồng tại Bình Thuận. Đây là chứng nhận USDA mới nhất tại Việt Nam hiện tại. Với màu sắc bắt mắt, hương vị ngọt ngào, thanh long đỏ từ vỏ đến ruột, tươi ngon mát lành.\r\n\r\nHiện tại trang trại thanh long Kim Hải đã và đang xuất khẩu ra thị trường các nước trong khu vực vùng các thị trường khó tính như Châu Âu, Hoa Kỳ và Nhật Bản.\r\n\r\n\r\n\r\nQuy trình canh tác hữu cơ USDA Organic của Bộ Nông Nghiệp Hoa Kỳ\r\n\r\n+ Các mẫu nước, đất, khu vực trồng… được khảo sát, kiểm tra các chỉ tiêu về an toàn như các chỉ số về hóa học, sinh học cũng như vùng cách ly an toàn.\r\n+ Thực hiện chọn giống để trồng.\r\n+ Quy trình chăm sóc cây : Quy trình bón phân các giai đoạn, tưới, cắt tỉa cành, cắt tỉa trái, cắt cỏ, vệ sinh vườn…\r\n+ Lấy mẫu kiểu tra, phân tích thành phẩm trái tươi trước khi thu hoạch.\r\n+ Thu hoạch và đóng gói…\r\n\r\n\r\n\r\n \r\n\r\nSản phẩm đạt các tiêu chí:\r\n\r\n– Không thuốc diệt cỏ\r\n– Không sử dụng giống biến đổi Gens\r\n– Không sử dụng thuốc BVTV hóa học\r\n– Không phân bón hóa học\r\n– Không chất kích thích tăng trường \r\n\r\nVề Nông trại thanh long hữu cơ Kim Hải:\r\n\r\nThành lập từ năm 2007  \r\n\r\nQuy mô: 80 hecta \r\n\r\nĐịa điểm: Xã Tà Mon, Huyện Hàm Thuận Nam, Tỉnh Bình Thuận \r\n\r\nTrang trai mô hình kiểu mẩu của tỉnh Bình Thuận \r\n\r\nChứng nhận: USDA Organic ( 2022)\r\n\r\nSản lượng: 1000 tấn thanh long ruột đỏ và ruột trắng \r\n\r\nThị trượng xuất khẩu trái tươi: Trung Quốc, Mỹ và Châu Âu \r\n\r\nNhà máy chế biến các sản phẩm từ thanh long xây dựng theo tiêu chuẩn HACCP và đặt tại trang trại', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931534_0.jpg\"]', '2026-03-31 04:32:14', '2026-03-31 04:54:51'),
(80, 41, 'Cam vàng úc', 'Trái Cây', 159000.00, 99999, 'kg', 'Úc', 'Điểm nổi bật Cam vàng không hạt nhập khẩu từ Úc có vỏ màu vàng, ruột màu vàng đậm, vị ngọt thanh, không hạt, mọng nước, thường dùng để ăn chứ không ép nước. Cam chứa nhiều Vitamin C, tốt cho da, chống lão hóa, có tác dụng hồi phục sức khỏe nhanh, tốt cho người ốm. Sử dụng cam thường xuyên sẽ tăng sức đề kháng, giảm đáng kể nguy cơ mắc bệnh sỏi thận, tránh lượng calo dư thừa. \r\nBảo quản: Nơi khô ráo, thoáng mát Sản phẩm được cấp giấy chứng nhận kiểm dịch và kiểm tra an toàn thực phẩm nhập khẩu. Cam kết hoàn toàn không sử dụng hóa chất bảo quản đối với tất cả các loại trái cây đảm bảo mang, đảm bảo an toàn sức khỏe cho người sử dụng Điều kiện sử dụng Thông tin chi tiết Cam là một trong những loại hoa quả được các bà nội trợ tin dùng bởi nó rất tốt cho sức khỏe của mọi lứa tuổi. Nhưng hiện nay, những loại hoa quả này đang bị cảnh báo về chất bảo quản ảnh hưởng không tốt đến sức khỏe con người. Cam ruột vàng không hạt nhập khẩu từ Úc đảm bảo uy tín chất lượng và không có chất bảo quản. Cam có vỏ màu vàng, ruột màu vàng đậm, vị ngọt thanh, không hạt, mọng nước, thường dùng để ăn chứ không ép nước. Trái cam chín mọng được tuyển lựa kỹ lưỡng Cam chứa nhiều vitamin C tốt cho sức khỏe cả nhà Cam chứa nhiều Vitamin C tốt cho da, chống lão hóa, có tác dụng hồi phục sức khỏe nhanh, tốt cho người ốm. \r\nSử dụng cam Úc thường xuyên sẽ giúp bảo vệ bạn khỏi nguy cơ mắc các bệnh truyền nhiễm do virus', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931595_0.jpg\"]', '2026-03-31 04:33:15', '2026-03-31 04:54:49'),
(81, 41, 'Dưa hấu không hạt organicfood 3kg', 'Trái Cây', 162000.00, 999999, 'kg', 'Hà Nội', 'Dưa hấu (tên khoa học: Citrullus lanatus) là một loài thực vật trong họ Bầu bí (Cucurbitaceae), một loại trái cây có vỏ cứng, chứa nhiều nước, có nguồn gốc từ miền nam châu Phi và là loại quả phổ biến nhất trong họ Bầu bí. \r\nDưa hấu có tính hàn có thể dùng làm thức ăn giải nhiệt trong những ngày hè nóng nực. \r\nDưa hấu rất đa dạng về hình dạng và màu sắc. có màu xanh nhạt và có những đường kẻ từ trên xuống dưới Hình dạng được xem xét với mặt phẳng cắt ngang từ cuống trái đến đuôi trái dưa. \r\nCó các dạng chính sau: dạng thuôn dài, dạng trái oval, dạng trái tròn. Hạt dưa cũng rất đa dạng về kích cỡ (lớn, trung bình, nhỏ). Màu hạt có màu đen. Dưa hấu không thể thiếu trên bàn thờ tổ tiên ông bà trong những ngày Tết. Là vật liệu cho các tài nhân khắc hình họa lên vỏ của dưa hấu. \r\nThành phần dinh dưỡng\r\n\r\nCũng như dưa hấu thường, dưa hấu không hạt là loại  trái cây tươi có gía trị dinh dưỡng cao, trong 100g phần ăn được có chứa:\r\n \r\n\r\nNăng lượng	127 kJ (30 kcal)          	Carbohydrat	7.55 g\r\nĐường	6.2 g	Chất xơ thực phẩm	0.4 g\r\nChất béo	0.15 g	Protein	0.61 g\r\nNước	91.45 g	Vitamin A equiv.	28 μg (3%)\r\nThiamin (Vit. B1)	0.033 mg (3%)	Riboflavin (Vit. B2)	0.021 mg (1%)\r\nNiacin (Vit. B3)	0.178 mg (1%)	Axit pantothenic (Vit. B5)	0.221 mg (4%)\r\nVitamin B6	0.045 mg (3%)	Axit folic (Vit. B9)	3 μg (1%)\r\nVitamin C	8.1 mg (14%)	Canxi	7 mg (1%)\r\nSắt	0.24 mg (2%)	Magie	10 mg (3%)\r\nPhospho	11 mg (2%)	Kali	112 mg (2%)\r\n \r\nCông dụng\r\n\r\nDưa hấu chứa nhiều lycopene-chất chống oxy hóa có tác dụng chống lại ung thư ngực ở phụ nữ và ung thư tuyến tiền liệt ở nam giới. Ngoài ra còn là nguồn cung cấp các chất dinh dưỡng như các sinh tố A, B1 (Tbiamin), B6 (Pyridoxine), C, E, Magnesium và Potassium.\r\nVới cơ thể yếu, ăn dưa hấu sẽ giúp cơ thể đề kháng được virus xâm nhập, tăng cường miễn dích, nâng cao thị lực. Dưa hấu còn là một trong những loại thực phẩm hiếm hoi cung cấp chất citrulin, loại chất axit-amin có tác dụng làm lành vết thươn\r\nCác bệnh nhân mắc bệnh về gan, thận, xơ vữa động mạch, tăng huyết áp, rối loạn tiêu hoá nên ăn dưa hấu vì loại quả này có khả năng thanh lọc các chất độc khỏi cơ thể, rất tốt cho những người làm việc ở nơi độc hại hay say rượu.\r\nDưa hấu cung cấp đủ các dưỡng chất cho phụ nữ, giúp họ có làn da mịn màng hơn, dùng dưa hấu ăn kiêng, không những giúp giảm cân mà còn đào thải các chất độc ra khỏi cơ thể vì loại quả này có khả năng nhanh làm no mà lại cung cấp rất ít năng lượng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931685_0.jpg\"]', '2026-03-31 04:34:45', '2026-03-31 04:54:47'),
(82, 41, 'Thanh long tím hồng hữu cơ USDA', 'Trái Cây', 57500.00, 99999, 'kg', 'USDA', 'Tác dụng của thanh long đỏ đối với sức khỏe\r\nGiúp tiêu hóa tốt\r\n\r\nThành phần chất xơ chứa trong trái thanh long ruột đỏ cũng rất cao so với các loại trái cây khác, bao gồm cả 2 loại chất xơ không hòa tan (cellulose) và chất xơ hòa tan (pectin) giúp điều hòa hoạt động của hệ tiêu hóa, làm giảm các chất nguy hiểm đối với cơ thể như: các chất béo, cholesterol, các độc chất… làm giảm nguy cơ bị mụn, nhọt trên da.\r\n\r\nTốt cho tim, người mắc chứng tiểu đường\r\n\r\nLượng chất xơ cao trong thanh long tốt cho nghững người mắc bệnh tiểu đường. Ngoài ra, thanh long còn có tác dụng tuyệt vời trong việc làm giảm lượng cholesterol xấu và tăng mức cholesterol tốt trong cơ thể. Thanh long là một nguồn tuyệt vời chất béo không bão hòa đơn, giúp cho trái tim bạn nghỉ ngơi trong tình trạng thái tốt.\r\n\r\nLà loại quả giàu vitamin C\r\nThanh long tươi hoặc sấy khô là nguồn giàu vitamin C, rất cần thiết cho cơ thể trong việc giúp cải thiện hệ miễn dịch và tăng cường sức khỏe.\r\n\r\nPhong phú vitamin nhóm B\r\nTrái thanh long có chứa các loại vitamin nhóm B, như vitamin B1 (thiamine), có tác dụng xử lý carbohydrate (bao gồm chất xơ, tinh bột và đường) một cách nhanh chóng, giúp tạo ra năng lượng cho cơ thể; vitamin B3 (niacien) giúp làn da sáng bóng, mịn màng; vitamin B12 giúp tạo cảm giác ngon miệng, đặc biệt tốt đối với người bệnh trong quá trình điều dưỡng.\r\n\r\nLoại quả giàu protein\r\nThanh long là nguồn phong phú protein – một chất dinh dưỡng thiết yếu giúp cơ thể hình thành các kích thích tố, men tiêu hóa và hóa chất, có tác dụng giúp tăng cường sức khỏe.\r\n\r\nThanh long có nhiều hạt nhỏ chứa chất béo không bão hòa, rất tốt cho sức khỏe, bởi vì nó giúp làm tăng cholesterol tốt và loại bỏ cholesterol xấu. Nhiều khoáng chất có ích: Các khoáng chất chứa trong trái thanh long bao gồm phốt pho và canxi. Cả hai khoáng chất này đóng vai trò thiết yếu trong quá trình hình thành của xương, răng và phát triển các tế bào.\r\n\r\nLoại quả chống oxy hóa cực kỳ tốt\r\nThanh long cũng là nguồn phong phú chất chống oxy hóa, có chức năng ngăn chặn sự tấn công của các gốc tự do gây hại, vốn là tác nhân gây ung thư và các vấn đề sức khỏe khác.\r\n\r\nNgừa táo bón\r\nKhi bị táo bón, bạn có thể cải thiện tình hình nhanh chóng bằng cách ăn thanh long, vì đây là trái chứa nhiều chất xơ.\r\n\r\nKiểm soát đường huyết\r\nCác thành phần chứa trong trái thanh long đã được chứng minh có tác dụng giúp ổn định mức đường huyết, đặc biệt tốt cho những người mắc bệnh tiểu đường típ 2.\r\n\r\nỔn định huyết áp\r\nĂn thanh long có thể giúp ổn định huyết áp, mang lại nhiều lợi ích cho những người có nguy cơ bị nhồi máu cơ tim hoặc đột quỵ.\r\n\r\nTrung hoà độc tố\r\nĐể giúp vô hiệu hóa các loại độc tố trong cơ thể như thủy ngân, thạch tín và những chất khác gây nguy hiểm cho sức khỏe, bạn nên thường xuyên ăn thanh long.\r\n\r\nCải thiện thị lực\r\nCũng như cà rốt, thanh long có chứa nhiều carotene, có tác dụng duy trì và cải thiện thị lực.\r\n\r\nGiảm ho và suyễn\r\nHo và hen suyễn là một số rối loạn hô hấp thường ảnh hưởng đến cả trẻ em và người lớn. Để giảm các triệu chứng khó chịu này, bạn chỉ cần siêng ăn thanh long.\r\n\r\n \r\n\r\nTác dụng của thanh long đỏ trong làm đẹp\r\nLàm đẹp da, giữ gìn vóc dáng\r\nQuả thanh long ruột đỏ có đặc tính hoàn toàn khác so với loại. Thành phần dinh dưỡng của thanh long ruột đỏ được đánh giá là gấp đôi thanh long ruột trắng.\r\n\r\nGiúp giảm béo\r\nThành phần của thanh long ruột đỏ hoàn toàn không chứa chất béo, cùng với mức năng lượng thấp và giàu chất xơ giúp giữ gìn cơ thể tránh khỏi hiện tượng béo phì, kẻ thù nguy hiểm nhất cho sắc đẹp và sức khỏe của phụ nữ.\r\n\r\nBảo vệ tóc khi làm hóa chất\r\nNước trái cây thanh long là một dưỡng chất tuyệt vời cho tóc nhuộm hoặc tóc đã qua xử lý hóa học. Bằng cách thoa nước ép thanh long hoặc một sản phẩm chiết xuất từ quả thanh long lên da đầu của bạn, bạn có thể bảo vệ mái tóc đã nhuộm hoặc đã qua xử lý hóa học của bạn.\r\n\r\nNước ép thanh long giữ cho các nang lông mở, giúp cho mái tóc của bạn khỏe mạnh và mềm mượt.\r\n\r\nNgoài việc dùng làm nước ép, sinh tố, thanh long ruột đỏ còn được chế biến thành nhiều món tráng miệng thú vị: rau câu thanh long, chè thanh long hoặc các món mặn: salad thanh long, gà tiềm thanh long…\r\n\r\nCách bảo quản thanh long\r\nNên rửa sạch vỏ ngoài trái thanh long trước khi ăn, mặc dù chúng ta ăn ở bên trong vỏ. Nhưng để tránh vi khuẩn gây bệnh lây nhiễm khi cắt thanh long, tốt nhất chúng ta vẫn nên rửa sạch.\r\n\r\nTốt nhất chúng ta nên ăn ngay khi mới mua thanh long về, nếu như cần cất giữ thì nên để chỗ thoáng mát.\r\n\r\nKhông nên bảo quản thanh long trong tủ lạnh, để tránh nhiệt độ lạnh làm hư hại dẫn đến biến chất.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931779_0.jpg\"]', '2026-03-31 04:36:19', '2026-03-31 04:54:46'),
(83, 41, 'Nho xanh không hạt Mỹ (non-gmo)', 'Trái Cây', 182500.00, 99999, 'kg', 'Úc', 'Nho được trồng tại các vùng thung lũng màu mỡ và khí hậu ôn đới với đặc điểm ngày nóng, đêm lạnh. Sau khi ngủ đông 3 tháng trong thời tiết lạnh, nho sẽ chồi lộc, ra hoa và kết trái vào mùa xuân. Nho xanh không hạt Úc quả to, thuôn dài, màu xanh hổ phách, vị ngọt mát, rất giòn, không hạt. Nho xanh không hạt Úc chứa hợp chất chống oxi hóa tự nhiên giúp cho tim khỏe mạnh, nho còn có khả năng chống ung thư và duy trì sức khỏe của não. Ngoài ra nho xanh còn có một loại enzim rất tốt cho đường tiêu hóa. \r\nGiống nho xanh không hạt Úc/Mỹ vào mùa từ tháng 1 đến tháng 5 Nho xanh là loại yếu hơn nho đen và nho đỏ, nho xanh không hạt Úc rất nhạy cảm, khi vận chuyển đi xa nên để vào hộp cẩn thận để nho không bị rụng. \r\nLuôn luôn để nho chưa rửa trong hộp kín vào tủ lạnh với nhiệt độ khoảng 0 - 4 độ C, chỉ nên rửa trước khi ăn hoặc chế biến để không làm mất đi lớp phấn phủ tự nhiên của quả Nho. \r\nNho thường dùng để ăn tươi hoặc ép nước. \r\nTại Úc, các trang trại trồng nho có diện tích từ hàng trăm đến hàng ngàn hecta, chủ yếu là các trang trại do tư nhân sở hữu với quy mô lớn, trang thiết bị hiện đại, chuyên nghiệp.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931846_0.png\"]', '2026-03-31 04:37:26', '2026-03-31 04:54:46'),
(84, 41, 'Lê má hồng Nam Phi', 'Trái Cây', 165000.00, 99999, 'kg', 'Nam Phi', 'Lê Nam Phi là loại lê có 3 màu đặc trưng là Xanh – Đỏ - Vàng xen kẽ nhau rất đẹp. Hình dáng phía trên thì thon dài, phía dưới hơi bầu tròn giống giọt nước, nhìn qua trông giống như trái hồ lô của Việt Nam. Trọng lượng trung bình mỗi quả từ 200g đến 300g. \r\nLê Nam Phi có vị ngọt dịu, rất giòn và thơm, ngon hơn khi ăn lạnh vào thời tiết nóng bức, được người tiêu dùng trên toàn thế giới ưa chuộng, xuất nhiều nhất sang châu Âu thị trường cực kỳ khó tính về chất lượng và an toàn thực phẩm. Và với chất lượng tuyệt vời, giá thành hợp lý nên  lê Nam Phi cũng được người tiêu dùng Việt Nam tiêu thụ rất nhiều. \r\n- Lê Nam Phi có nhiều chất xơ nên rất tốt cho sức khỏe giảm cholesterol trong cơ thể, ngăn ngừa các bệnh ung thư và tim mạch \r\n- Có nguồn Vitamin C tốt tăng cường hệ miễn dịch cho cơ thể đồng thời tham gia sản xuất nhiều tế bào hồng cầu, tạo nhiều máu đỏ \r\n- Hàm lượng Vitamin E cũng tốt rất tốt cho da \r\n- Hàm lượng Kali cao (50mg trong 100g)  \r\n- Ít chất béo và Calo phù hợp với những người đang trong chế độ giảm cân Đặc biệt, thường xuyên ăn lê nam phi sẽ tăng được khả năng phòng chống chứng hay mệt, đồng thời tăng khả năng phòng chống được bệnh tăng huyết áp, sung đau họng. Lê Nam Phi bảo quản tốt nhất ở nhiệt độ từ 0 độ C đến 4 độ C , để ở nhiệt độ thường 25 độ C Lê sẽ chín sau 1 đến 3 ngày. Vỏ lê rất dễ bị bầm dập, nên quý khách cần nhẹ tay, tránh làm rơi, va đập để giữ quả lê được đẹp.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931889_0.jpg\"]', '2026-03-31 04:38:09', '2026-03-31 04:54:45'),
(85, 41, 'Táo Pixie hữu cơ Pháp', 'Trái Cây', 62000.00, 99999, 'kg', 'Pháp', 'Vi vu nửa vòng trái đất để \'hạ cánh\' - Táo Pixie Organic vẫn giữ trọn trong mình hương vị tinh tế của ẩm thực Pháp cùng một nguồn dinh dưỡng đặc trưng giúp đem đến một sức khỏe vững vàng cho tim mạch, hệ tiêu hóa...\r\n \r\n\r\n \r\nẨn chứa sau mỗi những quả táo đỏ bắt mắt, giòn ngọt, mọng nước chính là kinh nghiệm trồng trồng táo lâu đời của những người nông dân Pháp cùng tiêu chuẩn hữu cơ hàng đầu thế giới và quy trình phân phối nghiêm ngặt đảm bảo táo luôn ở chất lượng TỐT NHẤT!\r\n \r\n* Được nuôi trồng 100% tại nông trại hữu cơ với quy trình chăm sóc chặt chẽ.\r\n* Thu hoạch hoàn toàn thủ công bởi đôi tay lành nghề của những người nông dân Pháp. \r\n* Điều kiện kiểm định nghiêm ngặt để đảm bảo chất lượng trước khi đến tay người dùng.  \r\nSắm ngay loại thực phẩm giàu dưỡng chất này về gia đinh ngay tại Organicfood.vn hoặc tìm hiểu thêm về táo Pixie Organic tại đây', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774931950_0.jpg\"]', '2026-03-31 04:39:10', '2026-03-31 04:54:45'),
(86, 41, ' Lựu Thái Lan', 'Trái Cây', 92500.00, 99999, 'kg', 'Thái Lan', 'Nguồn gốc:\r\n\r\nLựu Thái Lan là một loại trái cây được trồng tại Thái Lan theo quy trình hoàn toàn hữu cơ, được xuất khẩu đi nhiều nước trên trên thế giới. Cây lựu cần nhiều ánh nắng trực tiếp, ít nhất 8 giờ mỗi ngày, nên mùa vụ của loại lựu đỏ Thái này rơi vào khoảng tháng 9 đến tháng 3 năm sau vì thời điểm này ở Thái là mùa khô, có nhiều nắng. Đây cũng là loại trái cây nhập khẩu được các mẹ săn đón bởi lời truyền “ăn lựu con sẽ có má lúm đồng tiền”.\r\n\r\nVì là sản phẩm hữu cơ, nên chúng ta hoàn toàn yên tâm khi sử dụng, an toàn và phù hợp cho cả những mẹ bầu và trẻ nhỏ.\r\n\r\nMô tả sản phẩm:\r\n\r\nLựu Thái là một loại quả giàu chất chống oxi hóa, lại có hương vị thơm ngon nên rất được yêu thích trên thị trường trái cây nhập khẩu. Lựu Thái có vị ngọt đậm, hạt mềm có thể ăn được, không đắng, mọng nước. Một trái lựu thường có trọng lượng khoảng 400 – 600g/ trái, vỏ màu vàng có chổ ửng hồng.\r\n\r\nGiá trị dinh dưỡng trong một quả lựu:\r\n\r\nLựu Thái chứa nhiều chất dinh dưỡng, đặc biệt là hàm lượng chất xơ cao tốt cho hệ tiêu hóa. Phần vỏ hạt của quả lựu rất ngọt, 100g vỏ hạt lựu cung cấp khoảng 83 kcal và 13,7g đường.\r\n\r\nCác thành phần Natri, Vitamin B2, Niacin, Canxi, Photpho và Vitamin C trong nước ép trái Lựu rất tốt cho thai phụ và sự phát triển trí não của thai nhi, giúp trẻ khi được sinh ra giảm nguy cơ tổn thương ở não và tim mạch.\r\n\r\nCanxi, magie, sắt, phốt pho có trong quả lựu Thái cũng rất tốt cho xương, tránh hiện tượng loãng xương, đồng thời tăng cường chức năng khớp có tác dụng chống viêm, ngăn ngừa các yếu tố gây nên viêm, đau ở các đầu xương khớp.\r\n\r\nLựu chứa rất nhiều vitamin, nhất là vitamin C và các loại khoáng chất khác. Nước ép lựu có tác dụng hạ cholesterol và có thể làm giảm quá trình lão hóa.\r\n\r\nLựu chứa nhiều polyphenol có khả năng giảm độ dày thành động mạch, giảm việc hình thành mảng bám và cholesterol xấu, là nhân tố nguy hiểm của bệnh tim.\r\n\r\nCách bảo quản lựu Thái:\r\n\r\nBảo quản lựu trong tủ lạnh từ 0-4 độ C, có thể giữ lựu tươi được khoảng 2 tuần.\r\n\r\nTránh để lựu cùng các thực phẩm có mùi tanh như tỏi, hành.\r\n\r\nCó thể dùng ăn trực tiếp làm món tráng miệng, lựu Thái còn được làm nước ép, sinh tố, chè hay được dùng làm nguyên liệu trong các món ăn như salad, đùi gà sốt lựu thơm ngon, hấp dẫn.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932000_0.jpeg\"]', '2026-03-31 04:40:00', '2026-03-31 04:54:44'),
(87, 41, 'Xuân Đào Úc', 'Trái Cây', 174500.00, 99999, 'kg', 'Úc', 'Qủa Xuân đào tươi nhập khẩu từ Úc\r\nĐặc điểm: vỏ màu đỏ thẫm xen lẫn màu vàng, vỏ trơn không có lông. Thịt màu trắng hoặc vàng, ăn giòn, chắc, vị rất thơm và ngọt\r\nGiá trị dinh dưỡng: Đào có chứa protein, lipit, gluxit, vitamin B1, B2, vitamin C, cùng một số loại axit hữu cơ, đường gluco. Thịt quả Đào chứa nhiều sắt thúc đẩy việc tạo máu, ngăn ngừa thiếu máu.... Ngoài ra quả Đào có tác dụng nhuận tràng, hoạt huyết, hạ huyết áp, chữa chứng khó thở, ho ra đờm, tiêu ứ. Chủ yếu dùng điều trị chứng táo bón, ho, khô miệng, khô lưỡi...\r\nBảo Quản: nhiệt độ để bảo quản quả Đào lâu hơn khoảng 0- 4 độ C, hãy trữ xuân đào trong túi nilon kín và để vào ngăn mát trong tủ lạnh của bạn, nhiệt độ quá thấp hoặc quá cao cũng làm quả Đào nhanh hỏng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932053_0.jpeg\"]', '2026-03-31 04:40:53', '2026-03-31 04:54:43'),
(88, 41, 'Bông cải xanh baby hữu cơ 250g', 'Rau Củ', 58500.00, 99999, 'g', 'Hà Nội', 'Bông cải xanh hoặc súp lơ xanh, là một loại cây thuộc họ cải, có hoa lớn ở đầu, thường được dùng như rau. Bông cải xanh thường được chế biến bằng cách luộc hoặc hấp, nhưng cũng có thể được ăn sống như là rau sống trong những đĩa đồ nguội khai vị. \r\n \r\nCÁCH SỬ DỤNG \r\nCó rất nhiều món ăn được chế biến từ bông cải xanh chẳng hạn như pasta với bông cải xanh, súp bông cải xanh, bông cải xanh xào tôm... \r\nTa có bông cải xanh trộn dầu hàu, một món ăn giàu đạm và rất ngon hay gà xào bông cải xanh món ăn âm dương kết hợp hài hòa .... \r\nNgoài ra bông cải xanh được dùng để làm các món salad, xào thịt, xào hải sản, giúp món ăn hạ bớt lượng nhiệt từ dầu mỡ, thịt, đảm bảo hài hòa, cân bằng cho bữa ăn...\r\n   \r\nCÁCH BẢO QUẢN \r\nKhông nên để bông cải xanh chung với các loại trái cây vì đây là loại rau rất nhạy cảm với khí ethylen sinh ra từ một số loại trái cây.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932183_0.jpeg\"]', '2026-03-31 04:43:03', '2026-03-31 04:54:43'),
(89, 41, 'Khổ qua hữu cơ - 300g', 'Rau Củ', 56000.00, 99999, 'g', 'Gia Lai', 'Trên lâm sàng, khổ qua thường dùng chữa các chứng do bệnh nhiệt gây thử nhiệt phiền khát, trúng thử (say nóng), ung sưng, mắt đỏ đau nhức, kiết lỵ, viêm quầng, nhọt độc, tiểu ít…   \r\nKhổ qua (mướp đắng) – Momordia charantia L. thuộc họ Hồ lô (Cucurbitaceae). Vị đắng, tính mát, không độc. Vào kinh tâm, can, tỳ và vị.   \r\nĐiều trị tăng huyết áp: khổ qua tươi 250g, hành hoa, gừng băm, muối, bột nêm, nước tương (mắm), dầu mè với mỗi thứ vừa đủ. Khổ qua bổ hột, rửa sạch, trụng nước sôi 3 phút, thái sợi, trộn vào hành hoa, gừng băm, muối, bột nêm, nước tương (mắm), dầu mè, trộn đều thì dùng.   \r\nĐiều trị xơ vữa động mạch: khổ qua tươi 250g, dầu ăn, gừng sợi, hành hoa, muối, bột nêm với mỗi thứ vừa đủ. Khổ qua tươi móc bỏ ruột, rửa sạch, thái sợi, đổ dầu ăn vào chảo, thêm gừng sợi, hành hoa phi thơm, bỏ khổ qua sợi xào nhanh trong giây lát, nêm muối, bột nêm xào sơ thì dùng.   \r\nĐiều trị cao mỡ máu: khổ qua 1 quả, mật ong 20ml, sữa bò 200ml. Khổ qua bỏ hột, rửa sạch, thái lát hoặc thái nhuyễn, cùng sữa bò xay lấy nước, đổ vào ly, thêm mật ong trộn đều. Mỗi sáng và chiều chia uống 2 lần.   \r\nĐiều trị nhiệt độc tả lỵ: dây khổ qua 60g, đường đỏ vừa đủ. Dây khổ qua rửa sạch, cho vào nồi đất, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa nhỏ ninh lấy nước cốt, bỏ bã, lấy nước, thêm đường đỏ thì dùng. Ngày 3 – 4 lần.   Điều trị vị khí thống: khổ qua vừa đủ rửa sạch, giã nhuyễn, uống với nước ấm.   \r\nĐiều trị cảm cúm: ruột khổ qua vừa đủ rửa sạch, cho vào nồi đất, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa nhỏ ninh lấy nước cốt, bỏ bã, lấy nước thì dùng.   \r\nĐiều trị thấp chẩn (chàm): lá khổ qua vừa đủ rửa sạch, giã nhuyễn, đắp tại chỗ.   Điều trị trẻ tiêu chảy: dây khổ qua vừa đủ rửa sạch, cho vào nồi đất, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa nhỏ ninh lấy nước cốt, bỏ bã lấy nước thì dùng.   \r\nĐiều trị trẻ em kiết lỵ: khổ qua vừa đủ, mật ong vừa đủ. Khổ qua rửa sạch, giã vắt lấy nước, pha với mật ong, ngày 1 – 2 lần.     \r\nĐiều trị trẻ nôn ói: rễ khổ qua 6g rửa sạch, cho vào nồi đất, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa nhỏ ninh lấy nước cốt, bỏ bã, lấy nước thì dùng.   \r\nĐiều trị đại tiện ra máu: rễ khổ qua 200g rửa sạch, cho vào nồi đất, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa nhỏ ninh lấy nước cốt, bỏ bã lấy nước thì dùng.   \r\nĐiều trị đinh nhọt đau không chịu được: lá khổ qua rửa sạch, phơi khô, tán mịn, uống với rượu trắng 15g.   \r\nĐiều trị nhọt lâu ngày không vỡ: khổ qua 1 quả rửa sạch, vắt nước, thoa lên nhọt, ngày 3 lần.   \r\nĐiều trị nhiệt độc nhọt sưng: lá khổ qua vừa đủ rửa sạch, giã nhuyễn, vắt nước, thoa tại chỗ.   \r\nĐiều trị tiêu khát (bệnh đái tháo đường): khổ qua 250g rửa sạch, cho vào nồi, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa nhỏ ninh lấy nước cốt, bỏ bã lấy nước thì dùng. Ngày vài lần, mỗi lần 1 chén.   \r\nĐiều trị bệnh nhọt, người cao tuổi bị đái tháo đường biến chứng võng mạc: khổ qua 100g, bắp 100g, đường phèn 10g. Khổ qua và bắp lần lượt rửa sạch, hai thứ cùng cho vào nồi, đổ nước vừa đủ, bắc lên bếp, đun sôi bằng lửa mạnh, chuyển lửa ninh chè, khi chín, nêm đường phèn cho tan đều. Mỗi ngày chia dùng sáng và chiều.   \r\nĐiều trị rết cắn: lá khổ qua 50g, vắt nước, thoa tại chỗ.   Điều trị hôi miệng: khổ qua rửa sạch, thái sợi, ướp muối, thêm dầu mè một ít, làm gỏi.   \r\nĐiều trị béo phì thể nhẹ: khổ qua tươi 250g, đậu xị, ớt sợi, đậu tương, dầu ăn, gừng băm, hành hoa, muối, bột nêm với mỗi thứ vừa đủ. Khổ qua móc bỏ ruột, rửa sạch, thái lát mỏng. Đổ dầu vào chảo cho nóng, thêm khổ qua, đậu xị, ớt sợi, đậu tương, hành, gừng băm cùng vào chảo xào sơ, sau cùng nêm muối, bột nêm xào sơ thì dùng.   \r\nĐiều trị viêm gan mạn tính, gan nhiễm mỡ: khổ qua tươi 250g, rau sam tươi 250g, đường trắng 30g. Khổ qua và rau sam lần lượt loại bỏ tạp chất, rửa sạch, mát khô, khổ qua thái lát, rau sam thái nhuyễn, hai thứ cùng xay nhuyễn, cho vào tô, nêm đường trắng trộn đều, sau 2 giờ chắt ra nước cốt. Chia dùng mỗi sáng và chiều.   \r\nĐiều trị hội chứng mỏi mệt: khổ qua 1 kg, rửa sạch, phơi sấy khô, tán bột, chứa trong lọ hoặc trong túi lọc, mỗi gói 10g, miệng túi đính sợi dây, dán kín miệng. Cho vào ly hãm với nước sôi, ngày 3 lần, mỗi lần 1 gói.   \r\nĐiều trị sưng tuyến mang tai: khổ qua 1 quả, rong biển, muối, bột nêm, dầu mè với mỗi thứ vừa đủ. Khổ qua móc bỏ ruột, rửa sạch, thái lát, cho vào nồi có nước dùng, đun sôi, vớt váng, sau khi khổ qua nhừ, thêm rong biển, muối, bột nêm, dầu mè thì dùng.     \r\nĐiều trị loãng xương: khổ qua tươi 200g, đậu phụ non 2 lát, hành hoa, gừng băm, muối, bột nêm với mỗi thứ vừa đủ. Khổ qua bỏ hột, rửa sạch, thái lát mỏng, trụng qua nước sôi, vớt ra, đậu phụ cho vào nồi nóng có dầu mè chiên sơ, thêm nước dùng, khổ qua lát, hành hoa, gừng băm, hầm với lửa vừa 10 phút, nêm muối, bột nêm thì dùng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932234_0.jpg\"]', '2026-03-31 04:43:54', '2026-03-31 04:54:42'),
(90, 41, 'Đọt rau lang hữu cơ - 300g', 'Rau Củ', 38000.00, 99999, 'g', 'Đà Nẵng', 'Rau khoai lang là thứ rau dân dã trước đây chỉ dành cho nhà nghèo. Ngày nay, người ta đã \"phát hiện\" ra rằng thứ rau này cũng rất ngon và có nhiều tác dụng đối với sức khỏe. Ở một số nước như châu Âu, Hồng Kông, Nhật Bản... rau khoai lang không còn là loại rau dân dã mà đã trở thành một loại thực phẩm cao cấp có mặt trong những nhà hàng sang trọng. Đây là một loại thực phẩm bổ dưỡng hơn nhiều lần so với những gì người ta vẫn nghĩ về loại rau này. Trong y học cổ truyền, rau khoai lang đã được coi là một vị thuốc với nhiều tên gọi khác nhau như cam thử, phiên chử, là một loại rau có tính bình, vị ngột, ích khí hư... Rau khoai lang không độc, tư thận âm, chữa tỳ hư, tác dụng bồi bổ sức khỏe, thanh can, lợi mật, giúp tăng cường thị lực, chữa bệnh vàng da, phụ nữ kinh nguyệt không đều, nam giới di tinh... Các nhà khoa học phát hiện ra rằng dinh dưỡng trong rau khoai lang còn tốt hơn trong củ khoai lang rất nhiều. Ví dụ: Vitamin B6 trong lá khoai lang cao gấp 3 lần trong củ khoai, vitamin C cao gấp 5 lần, viboflavin cao gấp 10 lần. Dinh dưỡng trong lá khoai lang tương đương với một loại \"siêu\" thực phẩm là rau chân vịt, nhưng lượng axit axalic trong rau khoai lang ít hơn rất nhiều lần so với rau chân vịt, vì thế nguy cơ gây bệnh sỏi thận của rau khoai lang cũng ít hơn.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932271_0.jpeg\"]', '2026-03-31 04:44:31', '2026-03-31 04:54:42'),
(91, 41, 'Giá đỗ đậu xanh - bịch 500g', 'Rau Củ', 59500.00, 99999, 'g', 'TP. Hồ Chí Minh', 'Giá đỗ nhà O được làm từ đậu xanh Non-GMO, được trồng hoàn toàn tự nhiên, không sử dụng hóa chất.\r\n\r\nNhận diện bằng các đặc điểm:\r\n\r\n✔ Kích thước: Thân giá nhỏ gọn, dài vừa phải (5-7cm).\r\n\r\n✔ Màu sắc: Trắng ngà tự nhiên, không trắng tinh.\r\n\r\n✔ Đầu rễ: Có rễ tơ dài, mảnh, không bị đứt hoặc rụng.\r\n\r\n✔ Thân giá: Giòn, chắc, để lâu không mềm nhũn.\r\n\r\n✔ Hương vị: Ngọt nhẹ tự nhiên, thanh mát.\r\n\r\n???? Lợi ích: An toàn, giàu dinh dưỡng (vitamin C, E, chất xơ), phù hợp với mọi lứa tuổi, đặc biệt trẻ nhỏ và người ăn kiêng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932324_0.png\"]', '2026-03-31 04:45:24', '2026-03-31 04:54:41'),
(92, 41, 'Cà chua beef hữu cơ - 300g', 'Rau Củ', 41400.00, 99999, 'g', 'Hải Phòng', 'Cà chua beef hướng hữu cơ là giống cà chua cao cấp khác hẳn cà chua thông thường ở điểm quả cà chua to, chắc, ít hạt, cơm dày.  Cà chua beef cung cấp một lượng Vitamin A, C, K tuyệt vời. Những chất này có tác dụng giúp tăng cường thị lực, phòng bệnh quáng gà. Ngoài ra, cà chua beef hữu cơ còn là loại thực phẩm giúp kiểm soát lượng đường trong máu, có canxi hỗ trợ cho xương chắc khỏe. Cà chua là loại thực phẩm được sử dụng phổ biến trong mỗi bữa ăn cũng như trong làm đẹp của chị em phụ nữ. Tuy nhiên để đảm bảo an toàn thì chúng ta nên chọn cà chua beef hướng hữu cơ hoặc cà chua bi hướng hữu cơ. Thành phần dinh dưỡng của cà chua beef hướng hữu cơ: Cà chua beef là nguồn cung cấp vitamin A, C, K, Các chất carotenoid và bioflavonoid, chất xơ... Quy trình sản xuất cà chua beef hướng hữu cơ: Cà chua beef hướng hữu cơ được trồng bởi trang trại rau organicfood.vn theo phương pháp hữu cơ, đảm bảo không sử dụng thuốc trừ sâu, thuốc kích thích, phân bón hóa học hay bất kì chất độc hại nào.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932362_0.jpg\"]', '2026-03-31 04:46:02', '2026-03-31 04:54:40'),
(93, 41, 'Hành tím hữu cơ 200g', 'Rau Củ', 99999.00, 9999, 'g', 'Lạng Sơn', 'Thông tin sản phẩm đang được cập nhật', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932406_0.jpg\"]', '2026-03-31 04:46:46', '2026-03-31 04:54:39'),
(94, 41, 'Bắp ngọt hữu cơ 500gr', 'Rau Củ', 46000.00, 99999, 'gr', 'Việt Nam', 'Bắp Ngô Ngọt\r\n- Xuất Xứ: Việt Nam\r\n- Màu sắc: Vỏ xanh trong màu vàng\r\n- Ngô ngọt (hay ngô đường, bắp ngọt, bắp đường) là giống ngô có hàm lượng đường cao, hương vị dân dã, quen thuộc với nhiều người.\r\n- Ngô ngọt là kết quả xuất hiện tự nhiên của đặc tính lặn của gen điều khiển việc chuyển đường thành tinh bột bên trong nội nhũ của hạt ngô. Trong khi các giống ngô thông thường được thu hoạch khi hạt đã chín thì ngô ngọt thường được thu hoạch khi bắp chưa chín (ở giai đoạn \"sữa\"), và thường dùng như một loại rau hơn là ngũ cốc. Đây là thực phẩm giàu năng lượng, chứa nhiều chất dinh dưỡng và vitamin, giúp tăng cường sức khỏe cho mắt, tăng cường trí nhớ, tăng cường hệ thống miễn dịch...\r\n+ Giàu calo Nếu trẻ bị suy dinh dưỡng hoặc bạn đang cần tăng cân gấp, hãy đưa ngô ngọt vào chế độ ăn uống thường ngày ngô ngọt cũng cung cấp nguồn năng lượng dồi dào cho sức khỏe\r\n+ Phòng ngừa bệnh trĩ và ung thư là loại thực phẩm giàu chất xơ, vì vậy nó rất có lợi cho tiêu hóa\r\n+ Nguồn vitamin dồi dào , giàu khoáng chất\r\n+ Chất chống oxi hóa ,bảo vệ tim\r\n+ Cải thiện tình trạng thiếu máu,Giảm mức cholesterol\r\n+ Giảm đau khớp, xương\r\n+ Tác dụng tốt cho bệnh nhân Alzheimer', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932441_0.jpg\"]', '2026-03-31 04:47:21', '2026-03-31 04:54:39'),
(95, 41, 'Bí đao hữu cơ - 500g', 'Rau Củ', 85000.00, 99999, 'g', 'Hà Nội', 'Đặc điểm: Cây bí đao thuộc họ bầu bí nó thích hợp với khí hậu nóng ẩm và có tốc độ phát triển khá nhanh dễ dàng thích ứng với nhiều điều kiện khí hậu thời tiết khác nhau đặc biệt là sức đề kháng khả năng chống chịu sâu bệnh cực tốt. Bởi thế mà khi trồng loại cây này ta không cần sử dụng quá nhiều thuốc bảo vệ thực phẩm chính vì thế mà loại quả này được cho là khá an toàn, một loại thực phẩm sạch.\r\n\r\nĐặc điểm dinh dưỡng: Bí xanh (bí đao) có vị ngọt mát thường được nấu chung với tôm khô tạo thành món canh ngon quen thuộc vào mùa hè. Trong mình bí xanh có chứa rất nhiều các chất như đường, protit, vitamin E, PP, B1, B2, C đồng thời còn có sắt bổ máu, canxi bổ xương,… Sử dụng bí xanh như một loại mặt nạ sẽ cực kỳ hữu dụng trong việc nâng tông độ sáng của làn da, tăng cường độ ẩm giúp da mềm mại. Bí xanh cũng được sử dụng như một cách trị nám da mặt hiệu quả và vô cùng an toàn. Trước khi làm mặt nạ bí xanh, bạn cần chuẩn bị một miếng bí vừa tầm, tiết kiệm khoảng 50g, 500g đường phèn. \r\n\r\nCách thực hiện: rửa sạch bí xanh, thái hạt lưu và hầm nhừ cùng đường. Khi thấy hỗn hợp đã đặc lại, bạn hãy xay mịn rồi lọc bỏ phần bã, chỉ lấy phần nước cất của hỗn hợp rồi bảo quản trong tủ lạnh để sử dụng dần dần. Mỗi ngày bạn có thể uống 1 thìa nước cốt trên, hòa chung với 200-300ml nước lọc ấm sẽ giúp thanh lọc các độc tố có trong cơ thể, điều tiết lại tuyến nội tiết đang bị giới hạn. Bên cạnh đó, đắp trực tiếp phần nước cốt lên vùng bị nám cũng sẽ nhanh chóng xóa bỏ dấu tích của các nốt nâu nám da mất thẩm mỹ. uy trì việc sử dụng hỗn hợp bí xanh và đường trong một thời gian dài, không chỉ giúp làn da đánh bật những vết nám, mà cơ thể của bạn cũng sẽ dẻo dai, khỏe mạnh hơn nhiều.\r\n\r\nCông dụng: tác dụng trị liệu cho những người mắc các chứng bệnh như: xơ cứng động mạch, đái tháo đường, bệnh động mạch vành tim, viêm thận, phù thũng, bệnh cao huyết áp và béo phì.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932478_0.png\"]', '2026-03-31 04:47:58', '2026-03-31 04:54:38'),
(96, 41, 'Cải rổ hữu cơ - 250g', 'Rau Củ', 32000.00, 9999, 'kg', '', 'Cải rổ thuộc họ rau cải, tên khoa học là Collard greens. Rau thường có màu xanh sẫm.\r\n\r\nTrong 100 gram rau cải rổ có chứa:\r\n\r\nProtein 3gr; chất béo 0,6gr; chất xơ 4gr; carbohydrate 10,73gr\r\nCác chất khoáng bao gồm: Sắt 0,5mg; canxi 232mg; magie 40mg; photpho 61mg; kali 222mg; natri 28mg; kẽm 0,44mg.\r\nCác Vitamin bao gồm: Vitamin C 34,6mg; Vitamin A 722 mg; Vitamin E 1,67 mg; Vitamin K 722,5 mg; folate 30mcg. Ngoài ra, trong thành phần rau cải rổ cũng chứa các thiamin, acid pantothenic, niacin và choline.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932518_0.png\"]', '2026-03-31 04:48:38', '2026-03-31 04:54:37'),
(97, 41, 'Tỏi tép hữu cơ - 250g', 'Rau Củ', 80000.00, 9999, 'g', 'Việt Nam', 'dân trồng măng tây và đan xen 2 vụ đậu phộng và 1 vụ tỏi. Việc đan xen này cũng giúp cho đất tốt hơn, đỡ bệnh cho cây. Trang trại sử dụng năng lượng mặt trời toàn bộ cho hệ thống farm, đã được chứng nhận hữu cơ theo tiêu chuẩn USDA organic.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774932556_0.jpg\"]', '2026-03-31 04:49:16', '2026-03-31 04:54:34'),
(98, 41, 'Trứng Gà Ta nuôi thả hữu cơ Qus Farm hộp 10 trứng', 'Tươi Sống', 100000.00, 9999, 'Vỉ', '', 'Thông tin sản phẩm đang được cập nhật', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933408_0.jpg\"]', '2026-03-31 05:03:28', '2026-03-31 05:25:47'),
(99, 41, 'Mỡ heo trưng sẵn hộp 600ml', 'Tươi Sống', 185000.00, 9999, 'ml', '', 'NẤU ĂN BẰNG MỠ HEO – CÂN BẰNG DINH DƯỠNG CHO BỮA ĂN GIA ĐÌNH\r\n\r\nTrong bếp hiện đại, mỡ heo là lựa chọn tuyệt vời cho món ăn thơm ngon và bổ dưỡng. Hãy cùng khám phá lý do nên dùng mỡ heo!\r\n\r\n???? Tại sao chọn mỡ heo?\r\n\r\n✔️ Hương vị đậm đà– Tăng cường hương vị mà không cần nhiều gia vị.\r\n\r\n✔️ Ổn định ở nhiệt độ cao– Hạn chế hợp chất có hại khi chiên xào.\r\n\r\n✔️ Dinh dưỡng tự nhiên– Chứa vitamin D, E và choline, tốt cho tim mạch và não bộ.\r\n\r\n✔️ Lành mạnh hơn dầu tinh luyện– Không chất phụ gia, an toàn cho sức khỏe.\r\n\r\n???? Cách sử dụng\r\n\r\n✅ Chiên, xào – Giòn rụm, béo thơm.\r\n\r\n✅ Kho thịt, nấu canh – Đậm đà hương vị.\r\n\r\n✅ Làm bánh– Bánh mềm xốp.\r\n\r\n✅ Thắng tóp mỡ– Thêm hương vị cho cơm rang.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933451_0.png\"]', '2026-03-31 05:04:11', '2026-03-31 05:25:45'),
(100, 41, 'Mỡ heo hữu cơ Qus farm 500gram', 'Tươi Sống', 120000.00, 99999, 'gr', '', 'NẤU ĂN BẰNG MỠ HEO – CÂN BẰNG DINH DƯỠNG CHO BỮA ĂN GIA ĐÌNH\r\n\r\nTrong bếp hiện đại, mỡ heo là lựa chọn tuyệt vời cho món ăn thơm ngon và bổ dưỡng. Hãy cùng khám phá lý do nên dùng mỡ heo!\r\n\r\n???? Tại sao chọn mỡ heo?\r\n\r\n✔️ Hương vị đậm đà– Tăng cường hương vị mà không cần nhiều gia vị.\r\n\r\n✔️ Ổn định ở nhiệt độ cao– Hạn chế hợp chất có hại khi chiên xào.\r\n\r\n✔️ Dinh dưỡng tự nhiên– Chứa vitamin D, E và choline, tốt cho tim mạch và não bộ.\r\n\r\n✔️ Lành mạnh hơn dầu tinh luyện– Không chất phụ gia, an toàn cho sức khỏe.\r\n\r\n???? Cách sử dụng\r\n\r\n✅ Chiên, xào – Giòn rụm, béo thơm.\r\n\r\n✅ Kho thịt, nấu canh – Đậm đà hương vị.\r\n\r\n✅ Làm bánh– Bánh mềm xốp.\r\n\r\n✅ Thắng tóp mỡ– Thêm hương vị cho cơm rang.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933511_0.png\"]', '2026-03-31 05:05:11', '2026-03-31 05:25:44'),
(101, 41, 'Cá diêu hồng phile 500g', 'Tươi Sống', 175000.00, 9999, 'kg', '', 'Cá diêu hồng còn được gọi là cá rô phi đỏ, một loài cá nước ngọt, bên ngoài phủ vảy màu đỏ hồng hoặc vàng đậm, có thịt dày và ngọt.\r\n\r\nCá diêu hồng nhận sự quan tâm, yêu thích của nhiều người bởi cá không quá nhiều xương, độ tươi ngon của phần thịt khi chế biến món ăn và giá trị dinh dưỡng mà nó đem lại.\r\n\r\nCá diêu hồng tại Organicfood.vn được nuôi tự nhiên tại hồ Trị An, Đồng Nai.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933543_0.jpeg\"]', '2026-03-31 05:05:43', '2026-03-31 05:25:44'),
(102, 41, 'Gầu bò Úc tươi hữu cơ Obe 300g', 'Tươi Sống', 204000.00, 9999, 'g', '', 'Nhãn hiệu: Obe Organic\r\n\r\nXuất xứ: Australia\r\n\r\nChứng nhận: Chương trình Hữu cơ Quốc gia của Bộ Nông nghiệp Hoa Kỳ (USDA NOP)\r\n\r\nCắt thái: Thái miếng theo yêu cầu\r\n\r\nBảo quản: Từ -2 đến 0 độ C (Chilled).\r\n\r\nChế biến: Dễ dàng dùng nhúng lẩu, xào nấu các món ăn đa dạng\r\n\r\nGầu bò Úc tươi hữu cơ Obe mềm mọng, được cắt thái theo yêu cầu của khách hàng, dễ dàng chế biến thành nhiều món ăn hấp dẫn', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933571_0.jpeg\"]', '2026-03-31 05:06:11', '2026-03-31 05:25:43'),
(103, 41, 'Cá Hồi Tự Nhiên Nauy Phile 200g', 'Tươi Sống', 178000.00, 9999, 'g', 'Na Uy', 'Cá hồi Nauy được nuôi trong môi trường biển tự nhiên của Nauy nằm ở Bắc Đại Tây Dương. Quá trình chăn nuôi được quản lý nghiêm ngặt từ khi chúng còn trong trứng tới khi trưởng thành, nguồn Protein cung cấp từ thức ăn cho cá đảm bảo an toàn và lành mạnh giữ cho cá hồi sạch cũng như tác động tới môi trường biển là nhỏ nhất.\r\nNhững farm nuôi cá hồi Nauy của Salmar được đặt tại vùng biển phía Bắc Đại Tây Dương có khí hậu lạnh quanh năm, nằm giữa các dãy núi tuyết, có nguồn nước trong và sạch cùng môi trường tự nhiên lý tưởng tạo nên điều kiện sống thuận lợi cho cá hồi phát triển với chất lượng cao nhất.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933606_0.jpeg\"]', '2026-03-31 05:06:46', '2026-03-31 05:25:42'),
(104, 41, 'Cá Tuyết Alaska Fillet 300g', 'Tươi Sống', 276000.00, 9999, 'g', 'Alaska', 'Cá Tuyết là dòng cá biển thịt trắng rất được ưa chuộng ở thị trường Bắc Mỹ, Châu Âu và ngày càng trở nên nổi tiếng ở Châu Á vì hương vị đặc trưng đậm đà, tươi ngon và dinh dưỡng cao, phù hợp để chế biến tất cả món ăn ngon từ phong cách Âu sang Á. Quý khách có thể tham khảo 1 số món ngon từ Cá Tuyết Alaska dưới đây để bữa ăn thêm dinh dưỡng và đặc sắc.\r\n\r\nCá Tuyết của vùng biển Alaska được đánh giá là dòng cá chất lượng cao nhất hiện này nhờ môi trường biển thiên nhiên trong lành và thuần khiết lạnh giá của nơi cực Bắc.\r\n\r\nCá Tuyết Alaska được sống tự do trong vùng nước sâu, lạnh giá của Biển Bering và Vịnh Alaska, tạo điều kiện cho loài cá tuyết than cao cấp này phát triển hàm lượng dầu dồi dào nên chúng có hương vị đặc trưng béo đậm đà và mềm mại.\r\n\r\nTrong thịt Cá Tuyết Alaska có chứa nguồn Protein, Omega 3 cao đáng kể hơn so với các loài cá biển khác cùng nhiều vitamin A, vitamin D , khoáng chất rất cần thiết cho sự phát triển của trí não của trẻ nhỏ cũng như bồi bổ cơ thể, tăng cường sức khỏe.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933816_0.jpeg\"]', '2026-03-31 05:10:16', '2026-03-31 05:25:41'),
(105, 41, 'Thịt thăn iberico organic không xương - 450g', 'Tươi Sống', 326300.00, 9999, 'g', '', 'Heo IBerico là giống heo gì?\r\nHeo Iberico là một giống heo bản địa của Tây Ban Nha, màu đen mặt nhọn. Giống heo này có cấu tạo gen cho phép tích mỡ đến 49% trọng lượng cơ thể khi được vỗ béo. Có 4 điều mơ ước trong thế giới ẩm thực – đó là socola Trufles, trứng cá Caviar, gan ngỗng béo và thịt heo Iberico.\r\nThức ăn chính của heo Iberico là hạt dẻ sồi, cỏ, đậu và ngũ cốc. Những hạt này có tỉ lệ chất béo lớn, một trong số đó là axit béo không bão hoà oleic (một loại cholesteron tốt cho cơ thể con người).\r\nQuy trình nuôi heo Iberico ra sao?\r\nNgay sau khi cai sữa, heo con được nuôi bằng lúa mạch và ngô trong vài tuần.\r\nSau đó heo được chăn thả tự nhiên để ăn hạt dẻ sồi, các loại đậu, ngũ cốc, cỏ, thảo mộc (chỉ có ở vùng Địa Trung Hải) cho tới khi giết mổ. Thời gian nuôi ít nhất 12 tháng, trọng lượng đạt từ 100 – 115 kg.\r\nHeo iberian Tây Ban Nha chăn thả tự nhiên để ăn\r\n\r\nHeo iberian Tây Ban Nha chăn thả tự nhiên để ăn hạt dẻ sồi, các loại đậu, ngũ cốc, cỏ, thảo mộc\r\n\r\n \r\n\r\nĐặc điểm nổi bật của thịt heo Iberico để bạn lựa chọn?\r\nThịt heo chất lượng nhất thế giới\r\nNhờ việc thường xuyên di chuyển, ăn tự nhiên hạt dẻ sồi mà thịt có kết cấu mịn, nhiều vân thớ, cấu trúc thịt chắc, không có nhiều mỡ tích tụ, hương vị thơm ngon đặc biệt.\r\nKhông dùng chất tăng trọng, không dùng thuốc kháng sinh nên rất tốt cho trẻ em.\r\nQuy trình sản xuất, giết mổ và đóng gói tại Tây Ban Nha theo tiêu chuẩn nghiêm ngặt của Châu Âu, đạt chất lượng quốc tế: Calier, IFS, ISO…\r\nAn toàn và giàu chất dinh dưỡng cho sức khỏe.\r\nThịt Iberico có gì khác biệt?\r\nThịt Iberico khác biệt rõ ràng so với thịt heo thông thường. Khi bạn nhìn thấy nó sống, nó gần giống như thịt bò. Thịt có màu đỏ đến đỏ tươi so với thịt heo thường có màu trắng.\r\n\r\nYếu tố khác biệt cho món thịt heo Iberico là chất béo. Do chế độ ăn chủ yếu là hoa quả và di truyền của nó, heo Iberia có nhiều chất béo vào cơ bắp của chúng, dẫn đến thịt heo có hương vị thơm ngon hơn. Ngoài việc giàu chất béo, một lượng heo trong số đó là chất béo oleic không bão hòa, chất béo tương tự được tìm thấy trong dầu ô liu, được cho là có tác dụng giảm cholesterol, và là một phần quan trọng của chế độ ăn Địa Trung Hải.\r\n\r\nKhi bạn ăn thịt heo Iberico, lớp mỡ màu cẩm thạch trong nó khiến nó trở nên siêu ngon và hấp dẫn. Thịt có hương vị đậm đà hơn, ngon ngọt hơn và rất đặc trưng.\r\n\r\nHơn nữa, chế độ ăn chủ yếu là hoa quả của heo mang lại một hương vị rất riêng cho thịt heo. Bạn có thể nếm thử một hương vị hấp dẫn độc đáo trong thịt heo Iberico, điều này làm cho thịt trở nên rất đặc biệt. Thịt heo Iberico là loại thịt heo phong phú nhất mà bạn có thể tìm thấy. Bạn sẽ không thể tìm thấy hương vị và độ mọng nước của nó ở bất kỳ nơi nào khác.\r\n\r\nThịt đùi heo iberico có vân mỡ xen kẽ cho\r\n\r\nThịt đùi heo iberico có vân mỡ xen kẽ cho miếng thịt mềm như bò waguy\r\n\r\nCông dụng và giá trị dinh dưỡng của thịt heo\r\nĂn thịt heo không những là món ăn thường gặp trong mỗi gia đình ở Việt Nam mà giá trị dinh dưỡng trong thịt cũng rất phong phú. Trong thịt heo có hầu như đầy đủ các nhóm dưỡng chất cần cho cơ thể chính vì vậy thức ăn chế biến từ thịt heo thường được ưu tiên trong nhiều gia đình.\r\n\r\nĂn thịt heo giúp cung cấp protein chất lượng cao\r\nTrong thịt heo có đầy đủ các axit amin thiết yếu cho hoạt động sống, trong 100g thịt heo sẽ có 5.751mg histidine, 6.189mg isoleucine, 10.387mg leucine, 3.469mg methionine, 5.122mg phenylalanine, 5.171mg threonine, 1.212mg tryptophan, 11.482mg lysine.\r\n\r\nĂn thịt heo giúp cung cấp vitamin và khoáng chất cần thiết cho người lớn\r\nThịt heo giúp đóng góp vào cơ thể rất nhiều loại vitamin và khoáng chất khác nhau như photpho, kali, nicaxin, vitamin B6, vitamin B12, kẽm... Trong đó hàm lượng vitamin B có trong thịt heo là nguồn vitamin chính mà con người nhận từ thực phẩm. Vitamin B có nhiều chức năng quan trọng trong cơ thể như giúp tạo hồng cầu, duy trì chức năng thận lành mạnh, tổng hợp các axit béo, có vai trò trong chuyển hóa năng lượng...\r\n\r\nThịt heo cung cấp vitamin và khoáng chất cần thiết\r\n\r\nThịt heo cung cấp vitamin và khoáng chất cần thiết\r\n\r\nĂn thịt heo giúp cung cấp glycine và collagen\r\nTrong da heo có chứa một lượng glycine đáng kể giúp cơ thể tổng hợp nhiều collagen hơn. Collagen là chất rất quan trọng giúp tóc, da và khớp xương khỏe mạnh. Đặc biệt collagen có vai trò giúp làn da luôn căng bóng, đàn hồi và mịn màng hơn. Trong 100g da heo có chứa khoảng 11,919 mg glycine cần thiết cho cho cơ thể.\r\n\r\nĂn thịt heo giúp cung cấp selenium\r\nSelenium là chất quan trọng giúp tuyến giáp của con người hoạt động hiệu quả, chỉ với 170g thịt heo bạn đã cung cấp đủ 100% lượng selenium cần thiết mỗi ngày.\r\n\r\nThịt heo giàu Protein và tốt cho tuyến giáp\r\n\r\nThịt heo giàu Protein và tốt cho tuyến giáp', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933866_0.png\"]', '2026-03-31 05:11:06', '2026-03-31 05:25:40'),
(106, 41, 'Ba rọi rút sườn heo organic - 500g', 'Tươi Sống', 217500.00, 9998, 'g', '', 'Các sản phẩm thịt tại Organicfood.vn là dòng sản phẩm chế biến từ nông sản chất lượng cao trong và ngoài nước. Mỗi sản phẩm được lựa chọn phải trải qua quá trình nghiên cứu kỹ lưỡng về nguồn gốc xuất xứ, đặc điểm sinh thái để chọn ra các nông sản chất lượng cao nhất. Qua quá trình chế biến bằng công nghệ hiện đại với các quy trình sản xuất khép kín được kiểm soát chặt chẽ đã cho ra đời các sản phẩm cao cấp nhưng vẫn mang đậm truyền thống địa phương.\r\n    \r\nThức ăn của heo, gà là cám gạo, bột cá biển trộn với rau cắt nhỏ (rau lang, rau muống, chuối tự trồng và đặc biệt bổ sung tảo xoắn). Tất cả nguyên liệu được ủ cùng men vi sinh Probiotic trong 24 giờ. Hằng ngày, heo và gà trong chăn trại được chăn thả tự do với nguồn thức ăn khép kín và đồng thời được uống bổ sung men vi sinh Probiotic để tăng cường đề kháng và phòng dịch bệnh triệt để.\r\n\r\nXuất xứ: Trang trại chăn nuôi heo nằm tại Đồng Nai và huyện Bình Long, tỉnh Bình Phước, Việt Nam - Trang trại áp dụng men vi sinh trong chăn nuôi.\r\n\r\nThành phần: Thịt heo (100%).\r\n\r\nKhối lượng tịnh/ quy cách: Xem trên bao bì.\r\n\r\nHướng dẫn sử dụng/ Gợi ý sử dụng: Dùng tươi hoặc rã đông trước khi sử dụng, dùng chế biến các món ăn.\r\n\r\nHướng dẫn bảo quản: Trữ đông ở -18 độ C\r\nNgày sản xuất và Hạn sử dụng : Xem trên bao bì', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933899_0.jpg\"]', '2026-03-31 05:11:39', '2026-03-31 05:35:13'),
(107, 41, 'Ghẹ tách thịt Người Giữ Rừng 300gr', 'Tươi Sống', 340000.00, 9999, 'gr', '', 'Là sản phẩm được chọn lọc từ những con cua chuẩn chắc thịt, khoẻ tươi, được nuôi trồng đúng tiêu chuẩn thực phẩm sạch.\r\nThịt cua mềm, ngọt, dễ ăn lại chứa nhiều dưỡng chất tốt cho sức khỏe, nhất là đối với phụ nữ mang thai và trẻ nhỏ.\r\nHướng dẫn sử dụng: Rã đông trước khi chế biến, gợi ý một số món ăn ngon từ thịt cua:\r\n-Súp cua nấu ngô và nấm tuyết\r\n-Cua trộn gỏi rau càng cua\r\n-Canh rau đay thịt cua', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774933924_0.jpg\"]', '2026-03-31 05:12:04', '2026-03-31 05:25:39'),
(108, 41, 'Phile đuôi cá hồi hữu cơ 200g', 'Tươi Sống', 140000.00, 9999, 'g', '', '', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774934325_0.png\"]', '2026-03-31 05:18:45', '2026-03-31 05:25:38');
INSERT INTO `products` (`id`, `vendor_id`, `name`, `category`, `price`, `stock`, `unit`, `origin`, `description`, `status`, `approval_status`, `is_banned`, `ban_reason`, `images`, `created_at`, `updated_at`) VALUES
(109, 41, 'Nước ép Cam tươi, táo hữu cơ - Aloha', 'Đồ uống tốt cho sức khỏe', 85000.00, 9999, 'Chai', 'Đà Lạt', 'Nước ép nguyên chất tuyệt vời. Với thành phần chính là cam tươi, táo hữu cơ tươi, sản phẩm này mang đến cho bạn hương vị tươi ngon và hấp dẫn cùng lợi ích dinh dưỡng vượt trội.\r\n\r\n\r\n\r\nNước ép nguyên chất từ cam tươi, táo hữu cơ tươi tự nhiên\r\n\r\n• Thành phần: Chỉ sử dụng cam tươi, táo hữu cơ tươi ngon, không chất bảo quản hay phụ gia.\r\n\r\n• Hương vị tuyệt vời: Hòa quyện giữa vị ngọt của táo và hương thơm tự nhiên của  ổi, táo, chanh, bạc hà hữu cơ mang đến cho bạn trải nghiệm thú vị và sảng khoái mỗi lần thưởng thức.\r\n\r\n• Lợi ích dinh dưỡng: Táo chứa nhiều chất chống oxy hóa và chất xơ, giúp tăng cường hệ miễn dịch và duy trì sức khỏe tim mạch. \r\n\r\n• Tự nhiên và tươi ngon: Org cam kết mang đến cho bạn nước ép nguyên chất, không chất bảo quản và không đường thêm. Đảm bảo bạn được thưởng thức một loại nước ép tươi ngon, tinh khiết và giàu dinh dưỡng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774934495_0.png\"]', '2026-03-31 05:21:35', '2026-03-31 05:25:37'),
(110, 41, 'Nước ép ổi, táo, chanh, bạc hà hữu cơ - Greentox Juice', 'Đồ uống tốt cho sức khỏe', 85000.00, 9999, 'Chai', '', 'Nước ép nguyên chất tuyệt vời. Với thành phần chính là  ổi, táo, chanh, bạc hà hữu cơ tươi, sản phẩm này mang đến cho bạn hương vị tươi ngon và hấp dẫn cùng lợi ích dinh dưỡng vượt trội.\r\n\r\n\r\n\r\nNước ép nguyên chất từ  ổi, táo, chanh, bạc hà hữu cơ tự nhiên\r\n\r\n• Thành phần: Chỉ sử dụng  ổi, táo, chanh, bạc hà hữu cơ tươi ngon, không chất bảo quản hay phụ gia.\r\n\r\n• Hương vị tuyệt vời: Hòa quyện giữa vị ngọt của táo và hương thơm tự nhiên của  ổi, táo, chanh, bạc hà hữu cơ mang đến cho bạn trải nghiệm thú vị và sảng khoái mỗi lần thưởng thức.\r\n\r\n• Lợi ích dinh dưỡng: Táo chứa nhiều chất chống oxy hóa và chất xơ, giúp tăng cường hệ miễn dịch và duy trì sức khỏe tim mạch. \r\n\r\n• Tự nhiên và tươi ngon: Org cam kết mang đến cho bạn nước ép nguyên chất, không chất bảo quản và không đường thêm. Đảm bảo bạn được thưởng thức một loại nước ép tươi ngon, tinh khiết và giàu dinh dưỡng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774934565_0.png\"]', '2026-03-31 05:22:45', '2026-03-31 05:25:37'),
(111, 41, 'Nước ép táo, củ dền, dưa leo, cam, gừng hữu cơ- Red Juice', 'Đồ uống tốt cho sức khỏe', 85000.00, 9999, 'Chai', '', 'Nước ép nguyên chất tuyệt vời. Với thành phần chính là  táo, củ dền, dưa leo, cam, gừng hữu cơ, sản phẩm này mang đến cho bạn hương vị tươi ngon và hấp dẫn cùng lợi ích dinh dưỡng vượt trội.\r\n\r\n\r\n\r\nNước ép nguyên chất từ táo và cà rốt hữu cơ tự nhiên\r\n\r\n• Thành phần: Chỉ sử dụng  táo, củ dền, dưa leo, cam, gừng hữu cơ tươi ngon, không chất bảo quản hay phụ gia.\r\n\r\n• Hương vị tuyệt vời: Hòa quyện giữa vị ngọt của táo và hương thơm tự nhiên của cà rốt, Sweet Apple mang đến cho bạn trải nghiệm thú vị và sảng khoái mỗi lần thưởng thức.\r\n\r\n• Lợi ích dinh dưỡng: Táo chứa nhiều chất chống oxy hóa và chất xơ, giúp tăng cường hệ miễn dịch và duy trì sức khỏe tim mạch. Cà rốt giàu vitamin A, beta-caroten và chất chống oxy hóa, hỗ trợ sức khỏe da và tầm nhìn.\r\n\r\n• Tự nhiên và tươi ngon: Org cam kết mang đến cho bạn nước ép nguyên chất, không chất bảo quản và không đường thêm. Đảm bảo bạn được thưởng thức một loại nước ép tươi ngon, tinh khiết và giàu dinh dưỡng.', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774934602_0.png\"]', '2026-03-31 05:23:22', '2026-03-31 05:25:36'),
(112, 41, 'Trà lài hữu cơ Fito 20 túi lọc', 'Đồ uống tốt cho sức khỏe', 82000.00, 9999, 'hộp', '', 'Thành phần: Trà lài hữu cơ 100%\r\n- Không chất bảo quản và các chất phụ gia khác\r\n- Không biến đổi gien.\r\n- Hương vị thơm ngon, giúp thư giãn.\r\n- Chỗng oxy hóa, ngăn ngừa lão hóa.\r\n- Ngăn ngừa ung thư.\r\n- Giảm cholesterol xấu.\r\n- Giúp ích cho sức khỏe, tim mạch.\r\nChỉ tiêu chất lượng chủ yếu: Độ ẩm <=10%\r\nHướng dẫn sử dụng:\r\n- Mỗi lần 1-2 túi, ngày 2-3 lần\r\n- Đặt túi trà vào ly, thêm khoảng 150 -200ml nước sôi, để 3-5 phút rồi uống.\r\n- Có thể sử dụng lâu dài và thường xuyên\r\nHướng dẫn bảo quàn: Nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp \r\nĐóng gói: 20 túi lọc - thuận tiện khi sử dụng hàng ngày.\r\nThời hạn sử dụng: 36 tháng từ ngày sản xuất.\r\nXuất xứ: Việt Nam \r\n\r\nChứng nhận hữu cơ tiêu chuẩn EU do tổ chức ECOCERT SA Cộng Hòa Pháp cấp', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774934643_0.jpeg\"]', '2026-03-31 05:24:03', '2026-03-31 05:25:35'),
(113, 41, 'Trà sen hữu cơ Fito 20 túi lọc', 'Đồ uống tốt cho sức khỏe', 72000.00, 9998, 'hộp', '', 'Trà túi lọc: Trà sen\r\nCÔNG THỨC\r\nLiên tâm 30%\r\nNgoài ra còn có Lá dâu, Lạc tiên, Lá vông, Cam thảo.\r\nHƯỚNG DẪN SỬ DỤNG\r\nMỗi lần 1-2 túi, ngày 2-3 lần.\r\nĐặt túi trà vào ly, thêm khoảng 150-200ml nước sôi, để 3-5 phút rồi uống.\r\nCó thể sử dụng lâu dài và thường xuyên.\r\nKHUYẾN CÁO\r\nKhông sử dụng nếu sản phẩm có dấu hiệu hư hỏng.\r\nBẢO QUẢN\r\nNơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.\r\nHẠN DÙNG\r\n36 tháng kể từ ngày sản xuất.\r\nQUY CÁCH\r\n30 g (20 túi x 1.5 g)', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1774934677_0.png\"]', '2026-03-31 05:24:37', '2026-03-31 12:00:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text NOT NULL,
  `review_img` varchar(500) DEFAULT NULL,
  `status` enum('Pending','Approved','Flagged') DEFAULT 'Pending',
  `review_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `customer_name`, `product_name`, `vendor_name`, `rating`, `comment`, `review_img`, `status`, `review_date`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Minh', 'Sầu riêng Ri6', 'Nông trại Xanh', 5, 'Trái rất ngon, cơm vàng hạt lép đúng như mô tả!', 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800', 'Approved', '2026-02-06', '2026-03-02 10:57:27', '2026-03-02 10:57:27'),
(2, 'Trần Hùng', 'Cà chua Beef', 'Vườn Đà Lạt', 1, 'Hàng giao đến bị dập nát hết rồi, yêu cầu hoàn tiền ngay lập tức!!!', 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=800', 'Pending', '2026-02-05', '2026-03-02 10:57:27', '2026-03-02 10:57:27'),
(3, 'SpamBot_99', 'Măng cụt', 'Sạch Toàn Diện', 5, 'Bấm vào link này để nhận quà miễn phí: bit.ly/xxx', NULL, 'Flagged', '2026-02-04', '2026-03-02 10:57:27', '2026-03-02 10:57:27');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `value` decimal(15,2) NOT NULL,
  `min_order_value` decimal(15,2) DEFAULT 0.00,
  `max_discount_value` decimal(15,2) DEFAULT NULL,
  `scope` enum('order','product') NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `usage_limit` int(11) DEFAULT 100,
  `used_count` int(11) DEFAULT 0,
  `limit_per_user` int(11) DEFAULT 1,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `promotions`
--

INSERT INTO `promotions` (`id`, `code`, `name`, `description`, `type`, `value`, `min_order_value`, `max_discount_value`, `scope`, `product_id`, `vendor_id`, `start_date`, `end_date`, `usage_limit`, `used_count`, `limit_per_user`, `status`, `created_at`) VALUES
(4, '12', '3123', NULL, 'percent', 123.00, 0.00, NULL, 'order', NULL, 6, '2026-01-29', '2026-05-30', 100, 0, 1, 1, '2026-01-29 10:17:56'),
(5, '124', '123', NULL, 'percent', 12.00, 0.00, NULL, 'product', 6, 6, '2026-01-29', '2026-05-31', 100, 0, 1, 0, '2026-01-29 10:27:43'),
(6, 'E2E0306103653', 'E2E Voucher', 'Automated E2E voucher', 'fixed', 10000.00, 0.00, NULL, 'order', NULL, 6, '2026-03-05', '2026-03-13', 5, 1, 1, 1, '2026-03-06 09:36:53'),
(7, 'SALE2', 'Voucher Người Mới', NULL, 'fixed', 20000.00, 0.00, NULL, 'order', NULL, NULL, '2026-01-01', '2026-12-31', 0, 0, 1, 1, '2026-03-31 02:27:14'),
(8, 'SASALELE', 'Test 14/4/2026', NULL, 'percent', 50.00, 0.00, NULL, 'product', 106, 41, '2026-04-14', '2026-04-17', 100, 0, 1, 1, '2026-04-14 01:29:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion_products`
--

CREATE TABLE `promotion_products` (
  `promotion_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion_usages`
--

CREATE TABLE `promotion_usages` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `promotion_usages`
--

INSERT INTO `promotion_usages` (`id`, `promotion_id`, `customer_id`, `order_id`, `used_at`) VALUES
(1, 6, 9, 11, '2026-03-06 09:37:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promo_banners`
--

CREATE TABLE `promo_banners` (
  `id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `image_path` text NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promo_banners`
--

INSERT INTO `promo_banners` (`id`, `position`, `image_path`, `note`, `updated_at`) VALUES
(1, 1, 'uploads/banners/promo_1775032065_4557.avif', '{\"note\":\"\",\"title\":\"AgriMarket - Tươi Sạch 100%\",\"subtitle\":\"Mang hương vị thiên nhiên từ nông trại đến bàn ăn gia đình bạn.\"}', '2026-04-01 08:40:41'),
(2, 2, 'uploads/banners/promo_1775032065_3697.avif', '{\"note\":\"\",\"title\":\"Trái Cây Theo Mùa\",\"subtitle\":\"Thưởng thức vị ngọt tự nhiên, giàu vitamin mỗi ngày.\"}', '2026-04-01 08:40:41'),
(3, 3, 'uploads/banners/promo_1775032065_9451.avif', '{\"note\":\"\",\"title\":\"Thực Phẩm Hữu Cơ\",\"subtitle\":\"Bảo vệ sức khỏe gia đình với nguồn thực phẩm an toàn.\"}', '2026-04-01 08:40:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchased_vouchers`
--

CREATE TABLE `purchased_vouchers` (
  `id` int(11) NOT NULL,
  `code` varchar(40) NOT NULL,
  `purchased_by_customer_id` int(11) NOT NULL,
  `recipient_note` varchar(255) DEFAULT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `voucher_type` enum('fixed','percent') NOT NULL DEFAULT 'fixed',
  `voucher_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `max_discount_value` decimal(15,2) DEFAULT NULL,
  `status` enum('active','redeemed','expired','cancelled') NOT NULL DEFAULT 'active',
  `redeemed_by_customer_id` int(11) DEFAULT NULL,
  `redeemed_order_id` int(11) DEFAULT NULL,
  `redeemed_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refund_requests`
--

CREATE TABLE `refund_requests` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `order_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `reason` text NOT NULL,
  `notes` text DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `status` enum('pending','dispute','approved','rejected') DEFAULT 'pending',
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `refund_requests`
--

INSERT INTO `refund_requests` (`id`, `code`, `order_id`, `customer_id`, `vendor_id`, `amount`, `reason`, `notes`, `admin_note`, `status`, `resolved_by`, `resolved_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'REF-2001', 4410, 9, 27, 450000.00, 'Hàng dập nát khi vận chuyển', 'Khách đã gửi video khui hàng.', NULL, 'dispute', NULL, NULL, '2026-03-01 03:20:00', '2026-03-02 08:30:01', NULL),
(2, 'REF-2002', 5520, 9, 28, 220000.00, 'Giao thiếu số lượng', 'Thiếu 2kg cam.', NULL, 'pending', NULL, NULL, '2026-03-02 07:05:00', '2026-03-02 08:30:01', NULL),
(3, 'REF-2003', 4088, 9, 27, 150000.00, 'Sản phẩm hết hạn sử dụng', 'Sữa tươi hết hạn.', NULL, 'approved', NULL, NULL, '2026-02-25 02:00:00', '2026-03-02 08:30:01', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `target_type` enum('product','vendor') NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text NOT NULL,
  `reply` text DEFAULT NULL,
  `status` enum('visible','pending','reported') DEFAULT 'visible',
  `report_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `customer_id`, `vendor_id`, `product_id`, `target_type`, `rating`, `comment`, `reply`, `status`, `report_reason`, `created_at`) VALUES
(1, 9, 6, NULL, 'product', 5, 'Sản phẩm rất tuyệt vời, giao hàng nhanh!', NULL, 'visible', NULL, '2026-01-29 06:42:26'),
(2, 9, 6, NULL, 'vendor', 4, 'Gian hàng phục vụ tốt, đóng gói kỹ.', 'cam ơn bạn', 'visible', 'spam', '2026-01-29 06:43:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sale`
--

CREATE TABLE `sale` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('Flash Sale','Voucher','Discount') NOT NULL DEFAULT 'Flash Sale',
  `discount_value` decimal(15,2) NOT NULL,
  `status` enum('Active','Expired','Hidden') NOT NULL DEFAULT 'Active',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `usage_count` int(11) NOT NULL DEFAULT 0,
  `usage_limit` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sale`
--

INSERT INTO `sale` (`id`, `name`, `type`, `discount_value`, `status`, `start_date`, `end_date`, `usage_count`, `usage_limit`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Flash Sale Tết Nguyên Đán', 'Flash Sale', 40.00, 'Active', '2026-01-25', '2026-09-10', 450, 500, '2026-03-02 08:13:37', '2026-04-07 00:29:41', NULL),
(2, 'Voucher Người Mới', 'Voucher', 20000.00, 'Active', '2026-01-01', '2026-12-31', 1200, NULL, '2026-03-02 08:13:37', '2026-03-02 08:13:37', NULL),
(3, 'Xả Kho Rau Củ Đà Lạt', 'Discount', 50.00, 'Active', '2026-01-10', '2026-06-20', 300, 300, '2026-03-02 08:13:37', '2026-04-07 00:29:52', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping`
--

CREATE TABLE `shipping` (
  `id` int(11) NOT NULL,
  `shipping_code` varchar(20) NOT NULL,
  `order_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `method` enum('Giao nhanh','Giao nội thành','Tự giao') DEFAULT 'Giao nội thành',
  `status` enum('Chờ lấy hàng','Đang giao hàng','Giao thành công','Giao thất bại','Đã hủy') DEFAULT 'Chờ lấy hàng',
  `estimated_time` datetime DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shipping`
--

INSERT INTO `shipping` (`id`, `shipping_code`, `order_id`, `vendor_id`, `customer_id`, `method`, `status`, `estimated_time`, `note`, `created_at`, `updated_at`) VALUES
(3, 'VD-#INV-001', 1, 6, 10, 'Giao nội thành', 'Giao thành công', '2026-01-31 13:35:00', 'Hàng nông sản tươi, giao nhanh', '2026-01-29 06:35:58', '2026-01-29 06:36:19'),
(4, 'VD-#INV-002', 2, 6, 10, 'Giao nội thành', 'Đang giao hàng', '2026-01-31 13:35:58', 'Hàng nông sản tươi, giao nhanh', '2026-01-29 06:35:58', '2026-01-29 06:35:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping_carriers`
--

CREATE TABLE `shipping_carriers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `contact_phone` varchar(50) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shipping_carriers`
--

INSERT INTO `shipping_carriers` (`id`, `name`, `type`, `is_active`, `contact_phone`, `logo_url`, `created_at`) VALUES
(1, 'Giao Hàng Nhanh (GHN)', 'Bên thứ 3', 1, '1900 636683', 'https://api.dicebear.com/7.x/initials/svg?seed=GHN', '2026-03-02 08:53:50'),
(2, 'Đội Ship Nội Bộ', 'Nội bộ', 1, '0901 222 333', 'https://api.dicebear.com/7.x/initials/svg?seed=NB', '2026-03-02 08:53:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping_rates`
--

CREATE TABLE `shipping_rates` (
  `id` int(11) NOT NULL,
  `zone_name` varchar(255) NOT NULL,
  `product_type` varchar(255) NOT NULL,
  `base_price` decimal(15,2) NOT NULL,
  `price_per_kg` decimal(15,2) NOT NULL,
  `express_surcharge` decimal(15,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `shipping_rates`
--

INSERT INTO `shipping_rates` (`id`, `zone_name`, `product_type`, `base_price`, `price_per_kg`, `express_surcharge`, `is_active`, `created_at`) VALUES
(1, 'Nội thành TP.HCM', 'Rau củ', 15000.00, 6000.00, 10000.00, 1, '2026-03-02 08:53:50'),
(2, 'Liên tỉnh', 'Đông lạnh', 45000.00, 12000.00, 25000.00, 1, '2026-03-02 08:53:50');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_banners`
--

CREATE TABLE `system_banners` (
  `id` int(11) NOT NULL,
  `banner_key` varchar(50) NOT NULL,
  `image_path` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `system_banners`
--

INSERT INTO `system_banners` (`id`, `banner_key`, `image_path`, `updated_at`) VALUES
(1, 'login', 'uploads/banners/sys_login_1772453728.jpg', '2026-03-02 12:15:28'),
(2, 'register', 'uploads/banners/sys_register_1772454831.jpg', '2026-03-02 12:33:51'),
(7, 'user_hero', 'uploads/banners/sys_user_hero_1775032065.avif', '2026-04-01 08:27:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tickets`
--

CREATE TABLE `tickets` (
  `id` varchar(20) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `priority` enum('Thấp','Thường','Cao') DEFAULT 'Thường',
  `status` enum('Mới','Đang xử lý','Đã đóng') DEFAULT 'Mới',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ticket_messages`
--

CREATE TABLE `ticket_messages` (
  `id` int(11) NOT NULL,
  `ticket_id` varchar(20) DEFAULT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `message_text` text DEFAULT NULL,
  `image_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`image_urls`)),
  `is_admin_reply` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `role` enum('admin','customer','vendor') NOT NULL DEFAULT 'customer',
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `address` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `shop_name`, `avatar`, `role`, `email`, `phone`, `password`, `is_online`, `address`, `description`, `is_approved`, `created_at`, `updated_at`) VALUES
(6, 'mặt hàng xanh', 'Cửa hàng bán Táo', 'http://localhost/nongsan-api/uploads/avatars/1770532030_Screenshot 2025-02-27 174835.png', 'vendor', '1@gmail.com', '0816931074', '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 1, 'Quảng Trị', 'Toàn đồ sạch', 1, '2026-01-28 04:50:55', '2026-03-04 07:58:33'),
(7, ' mathangdo', '', 'http://localhost/nongsan-api/uploads/avatars/1770564561_Screenshot 2025-11-13 104240.png', 'vendor', 'trandinhtu1705@gmail.com', '', '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, '', '', 1, '2026-01-28 05:13:08', '2026-03-31 03:10:51'),
(8, 'Tran Dinh Tu', NULL, 'http://localhost/nongsan-api/uploads/avatars/1772963221_admin_avt.jpg', 'admin', 'admin@gmail.com', '0816931074', '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, 'Da Nang', 'Hệ thống quản lý nông sản.', 0, '2026-01-28 05:32:19', '2026-04-14 01:12:27'),
(9, 'Khách hàng', NULL, NULL, 'customer', 'customer@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 1, NULL, NULL, 0, '2026-01-28 05:32:19', '2026-03-31 10:24:09'),
(10, '12312312', NULL, NULL, 'vendor', 'trandinhtu17052004@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, NULL, NULL, 1, '2026-01-28 05:38:37', '2026-03-31 03:11:06'),
(26, 'admin123124', NULL, NULL, 'vendor', 'tutran0786@gmail.com', NULL, '$2y$10$WsyHWICllDZDJm/yWG8WpuzBUzFDTccpj0sdV/1uU0HEuovgMvaw2', 0, NULL, NULL, 1, '2026-01-28 07:03:00', '2026-03-31 03:11:23'),
(27, 'Nguyễn Văn A', 'Nông Trại Xanh', NULL, 'vendor', 'nongtrai@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6N...', 0, NULL, NULL, 0, '2026-02-01 01:00:00', '2026-03-04 07:58:33'),
(28, 'Trần Thị B', 'Đà Lạt Farm', NULL, 'vendor', 'dalatfarm@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6N...', 0, NULL, NULL, 0, '2026-02-05 02:30:00', '2026-03-04 07:58:33'),
(31, 'tinh', '', 'http://localhost/nongsan-api/uploads/avatars/1772695222_12.jpg', 'customer', 'huutinh582@gmail.com', '0398729285', '$2y$10$U6/wZeIg3EehzKZg46hBMuCMwu4E0.FGlkUIGyoHrkkOZ1X4g4Utu', 1, 'aaaaaa', '', 0, '2026-03-04 08:51:39', '2026-03-06 08:07:06'),
(37, 'tinh', '', NULL, 'customer', 'huutinh583@gmail.com', '', '$2y$10$T1qgLPkBkKBXb/qzsxvr2OnXA3mNIuwMXgDYhJzynBRhf36EE3.EO', 1, '', '', 0, '2026-03-05 08:16:31', '2026-03-08 09:50:21'),
(41, 'Vendor Test', 'Nong San Sach', NULL, 'vendor', 'vendor@gmail.com', '', '$2y$10$61xNIUkUgv0ZdhgLnWmO5..ZwHaL9pp4ktbrgxT.9MsdNaOtdGrEq', 0, '', '', 1, '2026-03-08 08:38:57', '2026-04-14 01:29:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_notifications`
--

CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'SYSTEM',
  `metadata` longtext DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_notifications`
--

INSERT INTO `user_notifications` (`id`, `user_id`, `title`, `content`, `type`, `metadata`, `is_read`, `created_at`) VALUES
(1, 9, 'Dat hang thanh cong', 'Don hang #ORD-1772790992027 da duoc tao thanh cong va dang cho xu ly.', 'SYSTEM', '{\"order_id\":13,\"order_code\":\"#ORD-1772790992027\"}', 1, '2026-03-06 16:56:32'),
(2, 9, 'Dat hang thanh cong', 'Don hang #ORD-1772791014752 da duoc tao thanh cong va dang cho xu ly.', 'SYSTEM', '{\"order_id\":14,\"order_code\":\"#ORD-1772791014752\"}', 1, '2026-03-06 16:56:54'),
(3, 9, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772791014752 dang duoc giao den ban.', 'SYSTEM', '{\"order_id\":14,\"order_code\":\"#ORD-1772791014752\"}', 1, '2026-03-06 16:57:03'),
(4, 31, 'Dat hang thanh cong', 'Don hang #ORD-1772963341107 da duoc tao thanh cong va dang cho xu ly.', 'SYSTEM', '{\"order_id\":15,\"order_code\":\"#ORD-1772963341107\"}', 1, '2026-03-08 16:49:01'),
(5, 37, 'Dat hang thanh cong', 'Don hang #ORD-1772963372172 da duoc tao thanh cong va dang cho xu ly.', 'SYSTEM', '{\"order_id\":16,\"order_code\":\"#ORD-1772963372172\"}', 0, '2026-03-08 16:49:32'),
(6, 31, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772697014929 dang duoc giao den ban.', 'SYSTEM', '{\"order_id\":10,\"order_code\":\"#ORD-1772697014929\"}', 1, '2026-03-08 16:50:55'),
(7, 31, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772790264106 dang duoc giao den ban.', 'SYSTEM', '{\"order_id\":12,\"order_code\":\"#ORD-1772790264106\"}', 1, '2026-03-08 16:50:57'),
(8, 31, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772963341107 dang duoc giao den ban.', 'SYSTEM', '{\"order_id\":15,\"order_code\":\"#ORD-1772963341107\"}', 1, '2026-03-08 16:50:59'),
(9, 37, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772963372172 dang duoc giao den ban.', 'SYSTEM', '{\"order_id\":16,\"order_code\":\"#ORD-1772963372172\"}', 0, '2026-03-08 16:51:00'),
(10, 9, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772790992027 dang duoc giao den ban.', 'SYSTEM', '{\"order_id\":13,\"order_code\":\"#ORD-1772790992027\"}', 1, '2026-03-08 16:51:03'),
(11, 37, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772963372172 da giao thanh cong.', 'SYSTEM', '{\"order_id\":16,\"order_code\":\"#ORD-1772963372172\"}', 0, '2026-03-08 16:51:08'),
(12, 31, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772963341107 da giao thanh cong.', 'SYSTEM', '{\"order_id\":15,\"order_code\":\"#ORD-1772963341107\"}', 1, '2026-03-08 16:51:10'),
(13, 9, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772791014752 da giao thanh cong.', 'SYSTEM', '{\"order_id\":14,\"order_code\":\"#ORD-1772791014752\"}', 1, '2026-03-08 16:51:12'),
(14, 9, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772790992027 da giao thanh cong.', 'SYSTEM', '{\"order_id\":13,\"order_code\":\"#ORD-1772790992027\"}', 1, '2026-03-08 16:51:14'),
(15, 31, 'Cap nhat trang thai don hang', 'Don hang #ORD-1772790264106 da giao thanh cong.', 'SYSTEM', '{\"order_id\":12,\"order_code\":\"#ORD-1772790264106\"}', 1, '2026-03-08 16:51:16'),
(16, 31, 'Dat hang thanh cong', 'Don hang #ORD-1774935313734 da duoc tao thanh cong va dang cho xu ly.', 'SYSTEM', '{\"order_id\":17,\"order_code\":\"#ORD-1774935313734\"}', 1, '2026-03-31 12:35:13'),
(17, 9, 'Dat hang thanh cong', 'Don hang #ORD-1774958425104 da duoc tao thanh cong va dang cho xu ly.', 'SYSTEM', '{\"order_id\":18,\"order_code\":\"#ORD-1774958425104\"}', 1, '2026-03-31 19:00:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_notification_reads`
--

CREATE TABLE `user_notification_reads` (
  `user_id` int(11) NOT NULL,
  `notification_id` int(11) NOT NULL,
  `read_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vendor_wallets`
--

CREATE TABLE `vendor_wallets` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `total_withdrawn` decimal(15,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `vendor_wallets`
--

INSERT INTO `vendor_wallets` (`id`, `vendor_id`, `balance`, `total_withdrawn`, `updated_at`) VALUES
(1, 6, 322000.00, 0.00, '2026-01-28 08:42:31'),
(2, 26, 0.00, 0.00, '2026-03-05 07:07:01'),
(12, 41, 1190480.00, 0.00, '2026-03-08 09:53:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `warnings`
--

CREATE TABLE `warnings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_holder` varchar(100) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `withdrawals`
--

INSERT INTO `withdrawals` (`id`, `vendor_id`, `amount`, `bank_name`, `account_number`, `account_holder`, `status`, `note`, `created_at`) VALUES
(1, 6, 123.00, '123', '123', '13', 'pending', NULL, '2026-01-28 08:49:37'),
(2, 41, 300000.00, 'BIDV', '6261378544', 'T', 'pending', NULL, '2026-03-08 09:53:48');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin_notifications`
--
ALTER TABLE `admin_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_parent` (`parent_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_display_order` (`display_order`);

--
-- Chỉ mục cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_one` (`user_one`,`user_two`),
  ADD KEY `user_two` (`user_two`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Chỉ mục cho bảng `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_id` (`message_id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`);

--
-- Chỉ mục cho bảng `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_vendor` (`vendor_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Chỉ mục cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD PRIMARY KEY (`promotion_id`,`product_id`);

--
-- Chỉ mục cho bảng `promotion_usages`
--
ALTER TABLE `promotion_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_id` (`promotion_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Chỉ mục cho bảng `promo_banners`
--
ALTER TABLE `promo_banners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `position` (`position`);

--
-- Chỉ mục cho bảng `purchased_vouchers`
--
ALTER TABLE `purchased_vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_purchased_voucher_code` (`code`),
  ADD KEY `idx_purchased_by_customer` (`purchased_by_customer_id`),
  ADD KEY `idx_purchased_voucher_status` (`status`);

--
-- Chỉ mục cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `resolved_by` (`resolved_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_order` (`order_id`),
  ADD KEY `idx_vendor` (`vendor_id`),
  ADD KEY `idx_customer` (`customer_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_vendor` (`vendor_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Chỉ mục cho bảng `sale`
--
ALTER TABLE `sale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status_deleted` (`status`,`deleted_at`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Chỉ mục cho bảng `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shipping_code` (`shipping_code`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `vendor_id` (`vendor_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Chỉ mục cho bảng `shipping_carriers`
--
ALTER TABLE `shipping_carriers`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `shipping_rates`
--
ALTER TABLE `shipping_rates`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `system_banners`
--
ALTER TABLE `system_banners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `banner_key` (`banner_key`);

--
-- Chỉ mục cho bảng `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- Chỉ mục cho bảng `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_notifications_user` (`user_id`),
  ADD KEY `idx_user_notifications_created` (`created_at`);

--
-- Chỉ mục cho bảng `user_notification_reads`
--
ALTER TABLE `user_notification_reads`
  ADD PRIMARY KEY (`user_id`,`notification_id`);

--
-- Chỉ mục cho bảng `vendor_wallets`
--
ALTER TABLE `vendor_wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_id` (`vendor_id`),
  ADD UNIQUE KEY `uniq_vendor` (`vendor_id`);

--
-- Chỉ mục cho bảng `warnings`
--
ALTER TABLE `warnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Chỉ mục cho bảng `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin_notifications`
--
ALTER TABLE `admin_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `order_tracking`
--
ALTER TABLE `order_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `payout_requests`
--
ALTER TABLE `payout_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT cho bảng `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `promotion_usages`
--
ALTER TABLE `promotion_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `promo_banners`
--
ALTER TABLE `promo_banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `purchased_vouchers`
--
ALTER TABLE `purchased_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `sale`
--
ALTER TABLE `sale`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `shipping_carriers`
--
ALTER TABLE `shipping_carriers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `shipping_rates`
--
ALTER TABLE `shipping_rates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `system_banners`
--
ALTER TABLE `system_banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `ticket_messages`
--
ALTER TABLE `ticket_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT cho bảng `user_notifications`
--
ALTER TABLE `user_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `vendor_wallets`
--
ALTER TABLE `vendor_wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT cho bảng `warnings`
--
ALTER TABLE `warnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `withdrawals`
--
ALTER TABLE `withdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_parent_category` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_one`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user_two`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `order_tracking`
--
ALTER TABLE `order_tracking`
  ADD CONSTRAINT `order_tracking_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payout_requests`
--
ALTER TABLE `payout_requests`
  ADD CONSTRAINT `payout_requests_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payout_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD CONSTRAINT `promotion_products_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `promotion_usages`
--
ALTER TABLE `promotion_usages`
  ADD CONSTRAINT `promotion_usages_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`),
  ADD CONSTRAINT `promotion_usages_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `refund_requests`
--
ALTER TABLE `refund_requests`
  ADD CONSTRAINT `refund_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refund_requests_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `refund_requests_ibfk_3` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_review_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `shipping`
--
ALTER TABLE `shipping`
  ADD CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipping_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `shipping_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `ticket_messages`
--
ALTER TABLE `ticket_messages`
  ADD CONSTRAINT `ticket_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`);

--
-- Các ràng buộc cho bảng `vendor_wallets`
--
ALTER TABLE `vendor_wallets`
  ADD CONSTRAINT `vendor_wallets_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `warnings`
--
ALTER TABLE `warnings`
  ADD CONSTRAINT `warnings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `warnings_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
