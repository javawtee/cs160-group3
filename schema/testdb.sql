-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 08, 2019 lúc 10:41 AM
-- Phiên bản máy phục vụ: 10.1.38-MariaDB
-- Phiên bản PHP: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `testdb`
--

CREATE DATABASE testdb;

use testdb;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `customer_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `customer_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `customer_phone` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `items` longtext COLLATE utf8_unicode_ci NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `delivery_status` int(11) NOT NULL DEFAULT '0',
  `delivery_fee` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `driver_location` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `restaurant`
--

CREATE TABLE `restaurant` (
  `restaurantId` int(11) NOT NULL,
  `users_id` int(11) NOT NULL,
  `restaurantDescription` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `address` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `logoUrl` varchar(120) COLLATE utf8_unicode_ci DEFAULT 'restaurant-logo.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `restaurant`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userId` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `userName` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  `userType` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `phoneNumber` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `submittedDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved` tinyint(4) DEFAULT '0',
  `approvedDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `restaurant`
--
ALTER TABLE `restaurant`
  ADD PRIMARY KEY (`restaurantId`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId_UNIQUE` (`userId`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT cho bảng `restaurant`
--
ALTER TABLE `restaurant`
  MODIFY `restaurantId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
