-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2019 at 08:32 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `testdb`
--
CREATE DATABASE testdb;

use testdb;

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `menuId` int(11) NOT NULL,
  `restaurantId` int(11) NOT NULL,
  `itemCategory` varchar(128) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'food',
  `itemName` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `itemPrice` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
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
  `delivery_fee` double DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `restaurant_id`, `order_date`, `customer_name`, `customer_address`, `customer_phone`, `items`, `driver_id`, `delivery_status`, `delivery_fee`) VALUES
(1, 1, '2019-04-25 03:43:26', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"5\"}]', 1, 0, 0),
(2, 1, '2019-04-25 03:43:26', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"5\"}]', 1, 0, 0),
(3, 1, '2019-04-25 03:44:10', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"5\"}]', NULL, 0, 0),
(4, 1, '2019-04-25 03:44:10', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"6\"}]', NULL, 0, 0),
(5, 1, '2019-04-27 14:24:54', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"5\"}]', NULL, 0, 0),
(6, 1, '2019-04-27 14:41:51', 'LE HOANG THONG', '38b/2 Hoc Lac, P14 Q5', '4084428953', '[{\"category\":\"Hot food\",\"id\":2,\"name\":\"Hot Food 2\",\"price\":\"21.99\",\"amount\":\"6\"}]', NULL, 0, 0),
(7, 1, '2019-04-27 17:17:42', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"3\"}]', NULL, 0, 0),
(8, 1, '2019-04-27 17:18:30', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"1\"}]', NULL, 0, 0),
(9, 1, '2019-04-27 23:48:43', 'THONG HOANG LE', '2957 Bowery Lane', '4084428953', '[{\"category\":\"Hot food\",\"id\":1,\"name\":\"Hot Food 1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaannnnnbaswweertt\",\"price\":\"1.99\",\"amount\":\"5\"}]', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `restaurant`
--

CREATE TABLE `restaurant` (
  `restaurantId` int(11) NOT NULL,
  `users_id` int(11) NOT NULL,
  `restaurantDescription` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `address` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `logoUrl` varchar(120) COLLATE utf8_unicode_ci DEFAULT 'restaurant-logo.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `restaurant`
--

INSERT INTO `restaurant` (`restaurantId`, `users_id`, `restaurantDescription`, `address`, `logoUrl`) VALUES
(1, 1, NULL, '', 'restaurant-logo.jpg'),
(2, 3, NULL, '39111 Cedar Blvd, Newark, CA 94560', '/media/stock-photo.jpg'),
(3, 4, NULL, '2957 Bowery Lane', '/media/stock-photo.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userId`, `password`, `userName`, `userType`, `phoneNumber`, `email`, `submittedDate`, `approved`, `approvedDate`) VALUES
(1, 'tester1', '84561379', 'a restaurant', 'restaurant', '1233333333', 'thongle7592@gmail.com', '2019-04-23 21:24:27', 1, '2019-04-27 22:58:13'),
(2, 'tester2', '123', 'a driver', 'driver', '123', 'bahahaha@gmail.com', '2019-04-23 21:24:34', 1, '2019-04-27 23:56:57'),
(3, 'tester3', '84561379', 'A RESTAURANT 2', 'restaurant', '4084428953', 'thongle7592@gmail.com', '2019-04-27 22:50:09', 0, NULL),
(4, 'tester22', '456987123', 'asdf', 'restaurant', '4084428953', 'thongle7592@gmail.com', '2019-04-27 22:56:53', 0, NULL),
(5, 'thongle', '654789321', 'THONG LE', 'driver', '4084428953', 'thongle7592@gmail.com', '2019-04-27 22:57:14', 1, '2019-04-27 22:57:36'),
(6, 'thongle222', '*B34956D1FD49F0D180D16E232D69316', 'THONG LE', 'driver', '4084428953', 'thongle7592@gmail.com', '2019-04-27 23:24:35', 1, '2019-04-27 23:25:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`menuId`),
  ADD KEY `fk_menu_restaurant_idx` (`restaurantId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk-orders-restaurant_idx` (`restaurant_id`),
  ADD KEY `fk-driver-users_idx` (`driver_id`);

--
-- Indexes for table `restaurant`
--
ALTER TABLE `restaurant`
  ADD PRIMARY KEY (`restaurantId`),
  ADD KEY `fk-restaurant-users_idx` (`users_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId_UNIQUE` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `menuId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `restaurant`
--
ALTER TABLE `restaurant`
  MODIFY `restaurantId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `fk_menu_restaurant` FOREIGN KEY (`restaurantId`) REFERENCES `restaurant` (`restaurantId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk-driver-users` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk-orders-restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`restaurantId`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `restaurant`
--
ALTER TABLE `restaurant`
  ADD CONSTRAINT `fk-restaurant-users` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
