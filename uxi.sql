-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2026 at 08:50 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uxi`
--

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
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
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `user_one`, `user_two`, `last_message`, `last_time`, `created_at`) VALUES
(20, 6, 9, 'ditme', '2026-01-29 09:44:10', '2026-01-29 07:23:14'),
(21, 8, 6, '[Video]', '2026-01-29 09:57:18', '2026-01-29 07:23:14');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
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
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `receiver_id`, `message_text`, `media_url`, `message_type`, `is_read`, `created_at`) VALUES
(37, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679357_697b29fd6391f.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679357_697b29fd63dd0.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679357_697b29fd6431f.png\"]', 'image', 0, '2026-01-29 09:35:57'),
(38, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679362_697b2a026422a.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679362_697b2a0264582.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679362_697b2a0264b1e.png\",\"http:\\/\\/localhost\\/nongsan-api\\/u', 'image', 0, '2026-01-29 09:36:02'),
(39, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad81ea91.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad81eedd.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad81f366.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad81f6b8.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad81fa41.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad81fda4.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad8201b3.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad8205bc.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad8209db.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad820d98.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679576_697b2ad821110.png\"]', 'image', 0, '2026-01-29 09:39:36'),
(40, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679582_697b2ade291da.png\"]', 'image', 0, '2026-01-29 09:39:42'),
(41, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679587_697b2ae3226e1.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679587_697b2ae322bb7.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679587_697b2ae32314b.png\"]', 'image', 0, '2026-01-29 09:39:47'),
(42, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679592_697b2ae8ca718.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769679592_697b2ae8caac7.png\"]', 'image', 0, '2026-01-29 09:39:52'),
(43, 21, 6, 8, 'má nó', NULL, 'text', 0, '2026-01-29 09:40:41'),
(44, 21, 6, 8, 'cái đéo gì đấy', NULL, 'text', 0, '2026-01-29 09:40:54'),
(45, 20, 6, 9, 'ditme', NULL, 'text', 0, '2026-01-29 09:44:10'),
(46, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680123_697b2cfbd75a6.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680123_697b2cfbd7938.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680123_697b2cfbd7d32.png\"]', 'image', 0, '2026-01-29 09:48:43'),
(47, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0567b6f.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0567eed.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d05682c6.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d05686e3.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0568a1b.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0568d27.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0569043.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d05693fc.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0569773.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0569b63.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d0569f10.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056a24f.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056a5c2.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056a8c1.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056ac3a.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056b00b.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056b3d0.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056b6fd.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056ba07.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680133_697b2d056bce6.png\"]', 'image', 0, '2026-01-29 09:48:53'),
(48, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075a46e.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075aba8.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075b292.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075b958.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075bff6.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075c568.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075c9c8.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075cdae.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075d1db.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075d66a.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075db60.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075e1df.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075e6f2.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075ed6d.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075f454.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075f8e4.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075fc3c.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d075ff9a.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d0760458.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680135_697b2d0760984.png\"]', 'image', 0, '2026-01-29 09:48:55'),
(49, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d36674bd.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d36678ae.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3667c52.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3667fc1.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3668351.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d36686a4.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3668a93.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3668e1b.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d36691a8.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3669525.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d36698b2.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d3669c22.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366a0ab.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366a458.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366a783.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366aaa1.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366adb4.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366b222.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366b61c.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680182_697b2d366b9fe.png\"]', 'image', 0, '2026-01-29 09:49:42'),
(50, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68bf455.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68bf821.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68bfc4a.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68bffe1.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c04e8.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c08b7.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c0c68.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c0fae.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c1432.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c1774.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c1ab3.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c1db5.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c20e3.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c240e.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c2752.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c2af7.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c2eff.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c3288.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c35b2.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c39b7.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c3d0d.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c401d.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c435c.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c46ac.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c49c0.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c4cbd.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c500d.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c5371.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c5844.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680488_697b2e68c5b7a.png\"]', 'image', 0, '2026-01-29 09:54:48'),
(51, 21, 6, 8, '', '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769680638_697b2efe8a871.mp4\"]', 'video', 0, '2026-01-29 09:57:18');

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
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
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `customer_id`, `customer_name`, `vendor_id`, `total_amount`, `payment_method`, `payment_status`, `delivery_status`, `shipping_address`, `customer_phone`, `cancel_reason`, `created_at`, `updated_at`) VALUES
(1, '#INV-001', 10, NULL, 6, 350000.00, 'Chuyển khoản', 'Đã thanh toán', 'Đã giao hàng', '123 Đường Lê Lợi, Đà Nẵng', '0905123456', NULL, '2026-01-28 07:42:51', '2026-01-28 08:56:57'),
(2, '#INV-002', 10, NULL, 6, 120000.00, 'Tiền mặt', 'Chờ thanh toán', 'Chờ lấy hàng', '456 Đường Hùng Vương, Quảng Nam', '0905123456', NULL, '2026-01-28 07:42:51', '2026-01-28 07:42:51'),
(3, '#INV-003', 10, NULL, 6, 500000.00, 'Tiền mặt', 'Hủy', 'Đã hủy', '789 Đường CMT8, TP.HCM', '0905123456', 'Khách hàng không còn nhu cầu mua nữa', '2026-01-28 07:42:51', '2026-01-28 07:42:51');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
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
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit`, `quantity`, `price`) VALUES
(1, 1, 101, 'Gạo ST25', 'kg', 5, 30000.00),
(2, 1, 102, 'Sầu riêng Ri6', 'kg', 2, 100000.00),
(3, 2, 103, 'Cà chua bi', 'Hộp', 4, 30000.00),
(4, 3, 104, 'Dâu tây Đà Lạt', 'Hộp', 2, 250000.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
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
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `vendor_id`, `name`, `category`, `price`, `stock`, `unit`, `origin`, `description`, `status`, `approval_status`, `is_banned`, `ban_reason`, `images`, `created_at`, `updated_at`) VALUES
(6, 6, '123', 'Rau Củ', 123.00, 135, 'kg', '', '123', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769584644_0_Screenshot 2026-01-17 111936.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769584757_Screenshot 2026-01-16 212515.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769584757_Screenshot 2026-01-17 111936.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769584757_Screenshot 2026-01-17 112010.png\",\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769584757_Screenshot 2026-01-17 113751.png\"]', '2026-01-28 07:17:24', '2026-01-29 06:34:07'),
(7, 6, '1234', 'Rau Củ', 123.00, 13, 'kg', '', '123', 'Còn hàng', 'approved', 0, NULL, '[\"http:\\/\\/localhost\\/nongsan-api\\/uploads\\/1769682242_0_Screenshot 2026-01-17 113751.png\"]', '2026-01-29 10:24:02', '2026-01-29 10:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
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
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `code`, `name`, `description`, `type`, `value`, `min_order_value`, `max_discount_value`, `scope`, `product_id`, `vendor_id`, `start_date`, `end_date`, `usage_limit`, `used_count`, `limit_per_user`, `status`, `created_at`) VALUES
(4, '12', '3123', NULL, 'percent', 123.00, 0.00, NULL, 'order', NULL, 6, '2026-01-29', '2026-01-30', 100, 0, 1, 1, '2026-01-29 10:17:56'),
(5, '124', '123', NULL, 'percent', 12.00, 0.00, NULL, 'product', 6, 6, '2026-01-29', '2026-01-31', 100, 0, 1, 0, '2026-01-29 10:27:43');

-- --------------------------------------------------------

--
-- Table structure for table `promotion_products`
--

CREATE TABLE `promotion_products` (
  `promotion_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotion_usages`
--

CREATE TABLE `promotion_usages` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
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
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `customer_id`, `vendor_id`, `product_id`, `target_type`, `rating`, `comment`, `reply`, `status`, `report_reason`, `created_at`) VALUES
(1, 9, 6, 6, 'product', 5, 'Sản phẩm rất tuyệt vời, giao hàng nhanh!', NULL, 'visible', NULL, '2026-01-29 06:42:26'),
(2, 9, 6, NULL, 'vendor', 4, 'Gian hàng phục vụ tốt, đóng gói kỹ.', 'cam ơn bạn', '', 'spam', '2026-01-29 06:43:42');

-- --------------------------------------------------------

--
-- Table structure for table `shipping`
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
-- Dumping data for table `shipping`
--

INSERT INTO `shipping` (`id`, `shipping_code`, `order_id`, `vendor_id`, `customer_id`, `method`, `status`, `estimated_time`, `note`, `created_at`, `updated_at`) VALUES
(3, 'VD-#INV-001', 1, 6, 10, 'Giao nội thành', 'Giao thành công', '2026-01-31 13:35:00', 'Hàng nông sản tươi, giao nhanh', '2026-01-29 06:35:58', '2026-01-29 06:36:19'),
(4, 'VD-#INV-002', 2, 6, 10, 'Giao nội thành', 'Đang giao hàng', '2026-01-31 13:35:58', 'Hàng nông sản tươi, giao nhanh', '2026-01-29 06:35:58', '2026-01-29 06:35:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `address` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `shop_name`, `avatar`, `role`, `email`, `phone`, `password`, `is_online`, `created_at`, `address`, `description`, `is_approved`) VALUES
(1, 'Vendor Demo', NULL, NULL, 'vendor', 'vendor2@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, '2026-01-28 04:23:25', NULL, NULL, 0),
(2, 'Vendor Demo1', NULL, NULL, 'vendor', 'vendor1@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, '2026-01-28 04:23:41', NULL, NULL, 0),
(4, 'Nông Trại Xanh', NULL, NULL, 'vendor', 'vendor@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, '2026-01-28 04:45:45', NULL, NULL, 0),
(6, 'mặt hàng xanh', 'Cửa hàng bán Táo', 'http://localhost/nongsan-api/uploads/avatars/1769579864_Screenshot 2026-01-08 085240.png', 'vendor', '1@gmail.com', '0816931074', '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 1, '2026-01-28 04:50:55', 'Quảng Trị', 'Toàn đồ sạch', 1),
(7, ' mathangdo', NULL, NULL, 'vendor', 'trandinhtu1705@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 1, '2026-01-28 05:13:08', NULL, NULL, 0),
(8, 'Admin', NULL, NULL, 'admin', 'admin@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, '2026-01-28 05:32:19', NULL, NULL, 0),
(9, 'Khách hàng', NULL, NULL, 'customer', 'customer@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 0, '2026-01-28 05:32:19', NULL, NULL, 0),
(10, '12312312', NULL, NULL, 'vendor', 'trandinhtu17052004@gmail.com', NULL, '$2y$10$yF/muXJytBQShafJTTsQO.o.aO3OSFBYkkFwLBefN6NNJifEPpA8i', 1, '2026-01-28 05:38:37', NULL, NULL, 0),
(26, 'admin123124', NULL, NULL, 'vendor', 'tutran0786@gmail.com', NULL, '$2y$10$WsyHWICllDZDJm/yWG8WpuzBUzFDTccpj0sdV/1uU0HEuovgMvaw2', 1, '2026-01-28 07:03:00', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `vendor_wallets`
--

CREATE TABLE `vendor_wallets` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `total_withdrawn` decimal(15,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendor_wallets`
--

INSERT INTO `vendor_wallets` (`id`, `vendor_id`, `balance`, `total_withdrawn`, `updated_at`) VALUES
(1, 6, 322000.00, 0.00, '2026-01-28 08:42:31');

-- --------------------------------------------------------

--
-- Table structure for table `withdrawals`
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
-- Dumping data for table `withdrawals`
--

INSERT INTO `withdrawals` (`id`, `vendor_id`, `amount`, `bank_name`, `account_number`, `account_holder`, `status`, `note`, `created_at`) VALUES
(1, 6, 123.00, '123', '123', '13', 'pending', NULL, '2026-01-28 08:49:37');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_one` (`user_one`,`user_two`),
  ADD KEY `user_two` (`user_two`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_id` (`message_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD PRIMARY KEY (`promotion_id`,`product_id`);

--
-- Indexes for table `promotion_usages`
--
ALTER TABLE `promotion_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotion_id` (`promotion_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_vendor` (`vendor_id`),
  ADD KEY `idx_product` (`product_id`);

--
-- Indexes for table `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shipping_code` (`shipping_code`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `vendor_id` (`vendor_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD UNIQUE KEY `unique_username` (`name`);

--
-- Indexes for table `vendor_wallets`
--
ALTER TABLE `vendor_wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_id` (`vendor_id`),
  ADD UNIQUE KEY `uniq_vendor` (`vendor_id`);

--
-- Indexes for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `promotion_usages`
--
ALTER TABLE `promotion_usages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `vendor_wallets`
--
ALTER TABLE `vendor_wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `withdrawals`
--
ALTER TABLE `withdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_one`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`user_two`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_products`
--
ALTER TABLE `promotion_products`
  ADD CONSTRAINT `promotion_products_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `promotion_usages`
--
ALTER TABLE `promotion_usages`
  ADD CONSTRAINT `promotion_usages_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`),
  ADD CONSTRAINT `promotion_usages_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_review_vendor` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping`
--
ALTER TABLE `shipping`
  ADD CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipping_ibfk_2` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `shipping_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `vendor_wallets`
--
ALTER TABLE `vendor_wallets`
  ADD CONSTRAINT `vendor_wallets_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
