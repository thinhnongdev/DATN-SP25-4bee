-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: datn_4bee
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anh_san_pham`
--

DROP TABLE IF EXISTS `anh_san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anh_san_pham` (
  `id` varchar(255) NOT NULL,
  `ma_anh` varchar(45) DEFAULT NULL,
  `anh_url` varchar(255) DEFAULT NULL,
  `mo_ta` text,
  `trang_thai` bit(1) DEFAULT NULL,
  `id_san_pham_chi_tiet` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_anh_UNIQUE` (`ma_anh`),
  KEY `id_san_pham_chi_tiet_idx` (`id_san_pham_chi_tiet`),
  CONSTRAINT `id_san_pham_chi_tiet` FOREIGN KEY (`id_san_pham_chi_tiet`) REFERENCES `san_pham_chi_tiet` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anh_san_pham`
--

LOCK TABLES `anh_san_pham` WRITE;
/*!40000 ALTER TABLE `anh_san_pham` DISABLE KEYS */;
INSERT INTO `anh_san_pham` VALUES ('0fbb8fea-ce5a-4ef5-af91-db7b194948a2','IMG1739899844856','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','d1d9a7ad-a833-4347-9a7c-0544aad45374'),('10a15949-5e8c-435e-a6a4-324765fd7152','IMG1739899844823','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','12a77fc0-f2dd-4fb5-8fa6-4debddb62249'),('14233226-0a5b-4157-a5cd-ba838f129db6','IMG1739521956639','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739347650/Screenshot_2024-10-13_113138_dkcbvo.png','',_binary '','4610617a-7c4c-4b55-98d8-3d7b617a7a7b'),('1bc08e48-69c3-433b-bbfd-17c45f174697','IMG1739523889423','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391314/Screenshot_2024-11-06_094821_s86iqu.png','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('2149b43c-2b12-47d5-96b4-5057ee1d4a94','IMG1739523889329','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('214c3af5-c489-4159-afd8-3502eb15f3df','IMG1739519763103','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('279dbc48-7297-459c-8c38-3cbbf0920e19','IMG1739523889373','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391314/Screenshot_2024-11-06_094821_s86iqu.png','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('2e241a76-3d2b-4e35-a4df-8af27aef0faa','IMG1739899844966','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','70835a28-7019-4c1c-a2ed-f2a009b4ece9'),('3a1f5819-0eef-45be-aa9f-c38d07c6ad1b','IMG1739899844929','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','b7253bf1-88d0-4110-81a2-a52ef6022307'),('49495b21-91b1-4394-823c-d4026f62d7aa','IMG1739523889379','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('4aa42a8d-174c-4950-8aba-3025b15f0ff2','IMG1739523934905','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('510c5538-609c-4090-90db-73ed964bfe96','IMG1739523889386','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739523857/sp4_tr2t99.jpg','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('572f4301-3313-4c20-970f-787cd0966153','IMG1739519763308','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739347650/Screenshot_2024-10-13_113138_dkcbvo.png','',_binary '','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18'),('60d7325f-1513-45ad-b790-0d8c1c9a32e7','IMG1739899844890','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','061840ea-05d1-489a-af6c-291003491202'),('629c6f11-9645-47b6-9635-bd77b7d50e42','IMG1739519762948','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('6e18e4c0-5b56-4f46-b998-9de79640b1cc','IMG1739519762815','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('6fa9277b-4df8-4c9b-8dc2-d9b375663032','IMG1739899844960','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','70835a28-7019-4c1c-a2ed-f2a009b4ece9'),('762976c7-517b-4f4e-a1d3-a5ee7aa0810e','IMG1739519763271','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18'),('86339393-922d-4fca-9abd-9ec2079a5462','IMG1739899844883','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','061840ea-05d1-489a-af6c-291003491202'),('8ea47963-6f99-4d8c-8fc4-510352309545','IMG1739899844922','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','b7253bf1-88d0-4110-81a2-a52ef6022307'),('957d48c1-546f-4682-9bb4-ac89c15e6828','IMG1739519763119','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('98cfd389-2256-4730-afcd-d7700a738857','IMG1739523889429','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('a207c3d9-a2c9-4d85-a191-3ae21538c8b7','IMG1739523889334','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('a7da2332-c887-46dc-8f10-84268973dc65','IMG1739899844753','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3f92826e-0eea-44f2-ada6-1c581c54694d'),('a9af99d9-9441-4cfe-ac56-52c1f6f2038c','IMG1739523934898','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('b6751d25-cc1f-46cb-9224-40b5dbf80330','IMG1739523889437','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739523857/sp4_tr2t99.jpg','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('b8684b31-95a6-4bc7-b300-73fd85ad6724','IMG1739521956569','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','4610617a-7c4c-4b55-98d8-3d7b617a7a7b'),('ce667b1b-aa55-4a1b-9292-7aa08df45b0e','IMG1739519762930','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('d514e51c-256a-4dae-8198-e0fac3d8dc55','IMG1739523889318','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('d93b2439-c14d-4096-91bb-b8db4d7b44fb','IMG1739519763145','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('f8ed28f1-939b-4b60-b63a-f75f014eb97f','IMG1739523934910','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac');
/*!40000 ALTER TABLE `anh_san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_lieu`
--

DROP TABLE IF EXISTS `chat_lieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_lieu` (
  `id` varchar(255) NOT NULL,
  `ma_chat_lieu` varchar(50) DEFAULT NULL,
  `ten_chat_lieu` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_chat_lieu` (`ma_chat_lieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_lieu`
--

LOCK TABLES `chat_lieu` WRITE;
/*!40000 ALTER TABLE `chat_lieu` DISABLE KEYS */;
INSERT INTO `chat_lieu` VALUES ('307ff145-d0e5-460a-afd9-d8b606c23c18','CL1739505981393','sat','sat',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `chat_lieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danh_muc`
--

DROP TABLE IF EXISTS `danh_muc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danh_muc` (
  `id` varchar(255) NOT NULL,
  `ma_danh_muc` varchar(50) DEFAULT NULL,
  `ten_danh_muc` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_danh_muc` (`ma_danh_muc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danh_muc`
--

LOCK TABLES `danh_muc` WRITE;
/*!40000 ALTER TABLE `danh_muc` DISABLE KEYS */;
INSERT INTO `danh_muc` VALUES ('dm01','dm1','dm1','mô tả cho danh mục 1 ',_binary '','2025-02-18 17:25:13');
/*!40000 ALTER TABLE `danh_muc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dia_chi`
--

DROP TABLE IF EXISTS `dia_chi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dia_chi` (
  `id` varchar(255) NOT NULL,
  `id_khach_hang` varchar(255) DEFAULT NULL,
  `xa` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `huyen` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `tinh` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `mo_ta` text,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_khach_hang` (`id_khach_hang`),
  CONSTRAINT `dia_chi_ibfk_1` FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dia_chi`
--

LOCK TABLES `dia_chi` WRITE;
/*!40000 ALTER TABLE `dia_chi` DISABLE KEYS */;
INSERT INTO `dia_chi` VALUES ('dc0001','39e1768c-dddd-44f8-988a-1e4982ac72d8','Phường Trần Phú','Thành phố Hà Giang','Tỉnh Hà Giang','123 Le Loi',NULL,'2025-02-22 10:28:32','2025-02-22 10:28:32',NULL,NULL);
/*!40000 ALTER TABLE `dia_chi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `id` varchar(255) NOT NULL,
  `ma_hoa_don` varchar(50) DEFAULT NULL,
  `id_phieu_giam_gia` varchar(255) DEFAULT NULL,
  `id_khach_hang` varchar(255) DEFAULT NULL,
  `id_nhan_vien` varchar(255) DEFAULT NULL,
  `loai_hoa_don` int DEFAULT NULL,
  `ten_nguoi_nhan` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `so_dien_thoai` varchar(10) DEFAULT NULL,
  `email_nguoi_nhan` varchar(255) DEFAULT NULL,
  `dia_chi` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `trang_thai_giao_hang` int DEFAULT NULL,
  `thoi_gian_giao_hang` datetime DEFAULT NULL,
  `thoi_gian_nhan_hang` datetime DEFAULT NULL,
  `tong_tien` decimal(15,0) DEFAULT NULL,
  `ghi_chu` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_hoa_don` (`ma_hoa_don`),
  KEY `id_phieu_giam_gia` (`id_phieu_giam_gia`),
  KEY `id_khach_hang` (`id_khach_hang`),
  KEY `id_nhan_vien` (`id_nhan_vien`),
  CONSTRAINT `hoa_don_ibfk_1` FOREIGN KEY (`id_phieu_giam_gia`) REFERENCES `phieu_giam_gia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hoa_don_ibfk_2` FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hoa_don_ibfk_3` FOREIGN KEY (`id_nhan_vien`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don`
--

LOCK TABLES `hoa_don` WRITE;
/*!40000 ALTER TABLE `hoa_don` DISABLE KEYS */;
INSERT INTO `hoa_don` VALUES ('HD002','HD002','13138841-adf4-4eea-8ed0-15fbd2c62bf6','39e1768c-dddd-44f8-988a-1e4982ac72d8','1',1,'Nguyễn Văn Nam','0901234567','nguyenvana@example.com','123 Le Loi, Thị trấn Pác Miầu, Huyện Bảo Lâm, Tỉnh Cao Bằng',0,'2025-02-22 15:01:41','2025-02-22 15:01:41',1900066,'Giao nhanh',1,'2025-02-21 15:33:14','2025-02-22 10:54:01',NULL,'anonymousUser'),('HD062458','HD062458','3f68e668-d340-4e86-9132-7b415a19bf69',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,399878,NULL,1,'2025-02-19 12:01:41','2025-02-21 13:09:06',NULL,NULL),('HD2344049d','HD309363','12687483-6de7-4370-8459-282b0ee8fda3',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,498854,NULL,1,'2025-02-19 16:32:38',NULL,NULL,NULL),('HD41acc685','HD303078',NULL,'39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-02-22 10:10:40',NULL,NULL,NULL),('HD45fb10bf','HD672288','pg004',NULL,NULL,2,'Hà Nhi',NULL,NULL,NULL,NULL,NULL,NULL,2400000,NULL,1,'2025-02-19 15:22:44',NULL,NULL,NULL),('HD664a9695','HD954607','12687483-6de7-4370-8459-282b0ee8fda3',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,1598788,NULL,5,'2025-02-19 15:21:56','2025-02-21 16:47:26',NULL,NULL),('HD73e0c1bf','HD828803',NULL,NULL,NULL,1,'Địa chỉ ','0123456789','','đồng ý',NULL,NULL,'2025-02-04 16:57:38',1200000,'',5,'2025-01-31 13:57:18','2025-02-04 09:57:38','anonymousUser','anonymousUser'),('HDbc1be37e','HD803580',NULL,NULL,NULL,1,'Dương Dương','0123456789',NULL,'Số 232, Phường Phúc Tân, Quận Hoàn Kiếm, Thành phố Hà Nội',NULL,'2025-02-04 17:05:47','2025-02-04 17:05:58',6500000,'Giao nhanh',2,'2025-01-31 06:21:23','2025-02-13 15:53:28','anonymousUser','anonymousUser'),('HDe7418078','HD414830','pg004',NULL,NULL,1,'huy','0123456678',NULL,'Địa chỉ 2, Phường Phường Văn Miếu - Quốc Tử Giám, Quận Quận Đống Đa, Thành phố Hà Nội',NULL,'2025-02-04 16:41:55',NULL,3500000,'',2,'2025-01-31 03:05:51','2025-02-13 16:46:43','anonymousUser','anonymousUser');
/*!40000 ALTER TABLE `hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don_chi_tiet`
--

DROP TABLE IF EXISTS `hoa_don_chi_tiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don_chi_tiet` (
  `id` varchar(255) NOT NULL,
  `id_hoa_don` varchar(255) DEFAULT NULL,
  `id_san_pham_chi_tiet` varchar(255) DEFAULT NULL,
  `so_luong` int DEFAULT NULL,
  `mo_ta` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_hoa_don` (`id_hoa_don`),
  KEY `id_san_pham_chi_tiet` (`id_san_pham_chi_tiet`),
  CONSTRAINT `hoa_don_chi_tiet_ibfk_1` FOREIGN KEY (`id_hoa_don`) REFERENCES `hoa_don` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hoa_don_chi_tiet_ibfk_2` FOREIGN KEY (`id_san_pham_chi_tiet`) REFERENCES `san_pham_chi_tiet` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don_chi_tiet`
--

LOCK TABLES `hoa_don_chi_tiet` WRITE;
/*!40000 ALTER TABLE `hoa_don_chi_tiet` DISABLE KEYS */;
INSERT INTO `hoa_don_chi_tiet` VALUES ('03a6b98e-e13a-4b08-a852-c26576e94e13','HD002','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-21 07:50:25','2025-02-21 18:06:02',NULL,NULL),('23a75fe5-7483-491f-9fda-856d7c6f16d5','HD2344049d','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-19 16:33:00',NULL,NULL,NULL),('2976faf5-feb2-4c57-b43c-417553590255','HD062458','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-22 07:54:56',NULL,NULL,NULL),('2b12437d-0d79-41c2-980f-cfe810aaf31b','HD002','061840ea-05d1-489a-af6c-291003491202',6,NULL,1,'2025-02-21 09:43:58','2025-02-22 07:54:08',NULL,NULL),('4c8536a4-faa8-4ba4-94da-57a1fcd78b30','HD002','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',2,NULL,1,'2025-02-21 16:37:29','2025-02-21 18:05:55',NULL,NULL),('657281c4-e73a-42ab-a3c2-fc0a2ad0b2af','HD2344049d','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-19 16:32:52','2025-02-21 09:24:41',NULL,NULL),('6b1ddef9-4795-4389-b988-db7146f43a38','HD73e0c1bf','spct001',1,NULL,1,'2025-01-31 13:57:31',NULL,NULL,NULL),('6f326746-ba1e-4891-b8e6-cdab582135b5','HDe7418078','spct001',8,NULL,1,'2025-02-04 08:10:15','2025-02-04 13:25:08',NULL,NULL),('99c18f8d-5383-486e-aafc-b92e8c966c80','HD002','3f92826e-0eea-44f2-ada6-1c581c54694d',4,NULL,1,'2025-02-21 16:52:44','2025-02-22 07:54:20',NULL,NULL),('9ab335e2-556f-4bd5-be4b-e44ffe5c8c93','HDbc1be37e','spct001',6,NULL,1,'2025-02-08 14:49:24','2025-02-12 09:39:01',NULL,NULL),('a4cb9daa-8473-4ebc-8db0-8d740065f703','HD062458','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-22 07:54:57',NULL,NULL,NULL),('ac4773cf-82a0-43fe-b1d3-93aa62f1fe47','HD664a9695','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',8,NULL,1,'2025-02-19 16:33:49','2025-02-21 16:47:07',NULL,NULL),('c891d8c5-750b-4094-8b42-a08b2c660dcf','HDbc1be37e','spct002',5,NULL,1,'2025-02-09 08:35:25','2025-02-12 09:39:22',NULL,NULL),('e253459d-9efb-4dfd-a494-bd624f62a884','HD73e0c1bf','spct002',1,NULL,1,'2025-01-31 13:57:32',NULL,NULL,NULL),('f3ee9265-9c12-4837-8190-4dec4944d648','HD2344049d','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',2,NULL,1,'2025-02-19 16:33:01','2025-02-21 09:25:12',NULL,NULL),('ff51b723-4c1a-4764-acc7-0a9ec76ea9ad','HD45fb10bf','061840ea-05d1-489a-af6c-291003491202',14,NULL,1,'2025-02-19 16:33:45','2025-02-21 09:11:41',NULL,NULL);
/*!40000 ALTER TABLE `hoa_don_chi_tiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_tiet`
--

DROP TABLE IF EXISTS `hoa_tiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_tiet` (
  `id` varchar(255) NOT NULL,
  `ma_hoa_tiet` varchar(50) DEFAULT NULL,
  `ten_hoa_tiet` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_hoa_tiet` (`ma_hoa_tiet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_tiet`
--

LOCK TABLES `hoa_tiet` WRITE;
/*!40000 ALTER TABLE `hoa_tiet` DISABLE KEYS */;
INSERT INTO `hoa_tiet` VALUES ('ht01','ht1','hoa hòe','Mô tả cho hoa hòe',_binary '','2025-02-18 19:44:21');
/*!40000 ALTER TABLE `hoa_tiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khach_hang`
--

DROP TABLE IF EXISTS `khach_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khach_hang` (
  `id` varchar(255) NOT NULL,
  `ma_khach_hang` varchar(50) DEFAULT NULL,
  `ten_khach_hang` varchar(255) DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `gioi_tinh` bit(1) DEFAULT NULL,
  `so_dien_thoai` varchar(10) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `id_tai_khoan` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_tai_khoan_khach_hang` (`id_tai_khoan`),
  CONSTRAINT `fk_id_tai_khoan_khach_hang` FOREIGN KEY (`id_tai_khoan`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khach_hang`
--

LOCK TABLES `khach_hang` WRITE;
/*!40000 ALTER TABLE `khach_hang` DISABLE KEYS */;
INSERT INTO `khach_hang` VALUES ('14ec0e49-2bc4-4e85-92c7-e49b8d6591b8','KH05','Hà Nhi','2000-05-08',NULL,_binary '',_binary '\0','0931713354','han@gmail.com','2025-02-16 12:41:04',NULL,NULL,NULL,NULL),('39e1768c-dddd-44f8-988a-1e4982ac72d8','KH01','Nguyễn Văn Nam','2004-02-02',NULL,_binary '',_binary '','0931713350','namnv@gmail.com','2025-02-16 12:38:40',NULL,NULL,NULL,NULL),('6b2f3473-38f3-4244-ae7a-bd49727fb559','KH04','Hiền Hồ','2000-04-03',NULL,_binary '',_binary '\0','0931713353','hienh@gmail.com','2025-02-16 12:40:28',NULL,NULL,NULL,NULL),('9a092288-de98-4adf-8c4d-c3e2eda0742d','KH06','Nguyễn Trần Trung Quân','2000-07-06',NULL,_binary '',_binary '','0931713355','quanntt@gmail.com','2025-02-16 12:41:46',NULL,NULL,NULL,NULL),('cd1c9198-b1ef-47c4-94db-9c0a47da43da','KH02','Nguyễn Duy Khánh','2004-03-04',NULL,_binary '',_binary '','0931713351','khanhnd@gmail.com','2025-02-16 12:39:13',NULL,NULL,NULL,NULL),('f7d9e619-4cbe-4f64-b160-59a7fc305cb3','KH03','Nông Tiến Thịnh','2004-03-02',NULL,_binary '',_binary '','0931713352','thinhnt@gmail.com','2025-02-16 12:39:48',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `khach_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kich_thuoc`
--

DROP TABLE IF EXISTS `kich_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kich_thuoc` (
  `id` varchar(255) NOT NULL,
  `ma_kich_thuoc` varchar(50) DEFAULT NULL,
  `ten_kich_thuoc` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kich_thuoc` (`ma_kich_thuoc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kich_thuoc`
--

LOCK TABLES `kich_thuoc` WRITE;
/*!40000 ALTER TABLE `kich_thuoc` DISABLE KEYS */;
INSERT INTO `kich_thuoc` VALUES ('9c2aecc2-1ef4-47f7-8de4-461be6a57661','KT1739519142819','L','ok',_binary '','2025-02-18 17:11:45'),('a75166f5-6bbd-463c-a605-d5407363307f','KT1739519170787','XXL','ok',_binary '','2025-02-18 17:11:45'),('c79efdc3-a52a-434e-b342-8aa0824bae1b','KT1739519150585','S','ok',_binary '','2025-02-18 17:11:45'),('eb6dcc6c-671c-4c0d-8063-d83008554350','KT1739519162724','XL','ok',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kich_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kieu_co_ao`
--

DROP TABLE IF EXISTS `kieu_co_ao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kieu_co_ao` (
  `id` varchar(255) NOT NULL,
  `ma_kieu_co_ao` varchar(50) DEFAULT NULL,
  `ten_kieu_co_ao` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kieu_co_ao` (`ma_kieu_co_ao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kieu_co_ao`
--

LOCK TABLES `kieu_co_ao` WRITE;
/*!40000 ALTER TABLE `kieu_co_ao` DISABLE KEYS */;
INSERT INTO `kieu_co_ao` VALUES ('c1578e35-2b86-47a8-bf68-06dedda3c59f','KCA1739518890683','cổ tròn','321',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kieu_co_ao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kieu_co_tay_ao`
--

DROP TABLE IF EXISTS `kieu_co_tay_ao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kieu_co_tay_ao` (
  `id` varchar(255) NOT NULL,
  `ma_kieu_co_tay_ao` varchar(50) DEFAULT NULL,
  `ten_kieu_co_tay_ao` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kieu_co_tay_ao` (`ma_kieu_co_tay_ao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kieu_co_tay_ao`
--

LOCK TABLES `kieu_co_tay_ao` WRITE;
/*!40000 ALTER TABLE `kieu_co_tay_ao` DISABLE KEYS */;
INSERT INTO `kieu_co_tay_ao` VALUES ('d392abbb-54ad-4003-8583-255caa8eed1d','CTA1739518916279','cổ tay tròn','3213',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kieu_co_tay_ao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kieu_cuc`
--

DROP TABLE IF EXISTS `kieu_cuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kieu_cuc` (
  `id` varchar(255) NOT NULL,
  `ma_kieu_cuc` varchar(50) DEFAULT NULL,
  `ten_kieu_cuc` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kieu_cuc` (`ma_kieu_cuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kieu_cuc`
--

LOCK TABLES `kieu_cuc` WRITE;
/*!40000 ALTER TABLE `kieu_cuc` DISABLE KEYS */;
INSERT INTO `kieu_cuc` VALUES ('24034b35-b8aa-4882-843a-cb720f608522','KC1739518939102','Cúc kim loại',NULL,_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kieu_cuc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kieu_dang`
--

DROP TABLE IF EXISTS `kieu_dang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kieu_dang` (
  `id` varchar(255) NOT NULL,
  `ma_kieu_dang` varchar(50) DEFAULT NULL,
  `ten_kieu_dang` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kieu_dang` (`ma_kieu_dang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kieu_dang`
--

LOCK TABLES `kieu_dang` WRITE;
/*!40000 ALTER TABLE `kieu_dang` DISABLE KEYS */;
INSERT INTO `kieu_dang` VALUES ('f3685534-8606-491d-868e-30f3a40cd481','KD1739518955289','Dáng ôm','sds',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kieu_dang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kieu_tay_ao`
--

DROP TABLE IF EXISTS `kieu_tay_ao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kieu_tay_ao` (
  `id` varchar(255) NOT NULL,
  `ma_kieu_tay_ao` varchar(50) DEFAULT NULL,
  `ten_kieu_tay_ao` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kieu_tay_ao` (`ma_kieu_tay_ao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kieu_tay_ao`
--

LOCK TABLES `kieu_tay_ao` WRITE;
/*!40000 ALTER TABLE `kieu_tay_ao` DISABLE KEYS */;
INSERT INTO `kieu_tay_ao` VALUES ('213123','KTA123123213213','Kiểu pháp','ok',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kieu_tay_ao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kieu_tui_ao`
--

DROP TABLE IF EXISTS `kieu_tui_ao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kieu_tui_ao` (
  `id` varchar(255) NOT NULL,
  `ma_kieu_tui_ao` varchar(50) DEFAULT NULL,
  `ten_kieu_tui_ao` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_kieu_tui_ao` (`ma_kieu_tui_ao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kieu_tui_ao`
--

LOCK TABLES `kieu_tui_ao` WRITE;
/*!40000 ALTER TABLE `kieu_tui_ao` DISABLE KEYS */;
INSERT INTO `kieu_tui_ao` VALUES ('2bf211bd-c9dd-45f8-97a5-39461da40dda','KTA1739519213101','Túi bên trái','ok',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `kieu_tui_ao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_su_hoa_don`
--

DROP TABLE IF EXISTS `lich_su_hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_su_hoa_don` (
  `id` varchar(255) NOT NULL,
  `id_hoa_don` varchar(255) DEFAULT NULL,
  `id_khach_hang` varchar(255) DEFAULT NULL,
  `id_nhan_vien` varchar(255) DEFAULT NULL,
  `hanh_dong` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `mo_ta` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_hoa_don` (`id_hoa_don`),
  KEY `id_khach_hang` (`id_khach_hang`),
  KEY `id_nhan_vien` (`id_nhan_vien`),
  CONSTRAINT `lich_su_hoa_don_ibfk_1` FOREIGN KEY (`id_hoa_don`) REFERENCES `hoa_don` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lich_su_hoa_don_ibfk_2` FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lich_su_hoa_don_ibfk_3` FOREIGN KEY (`id_nhan_vien`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_su_hoa_don`
--

LOCK TABLES `lich_su_hoa_don` WRITE;
/*!40000 ALTER TABLE `lich_su_hoa_don` DISABLE KEYS */;
INSERT INTO `lich_su_hoa_don` VALUES ('HD3e13bb06','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đang giao',3,'2025-02-04 10:05:47','2025-02-04 10:05:47'),('HD5a2d9f21','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 11:08:57','2025-02-04 11:08:57'),('HD65bdeaae','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Cập nhật trạng thái thành: 2',2,'2025-02-04 09:36:38','2025-02-04 09:36:38'),('HD8a079c19','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 11:08:12','2025-02-04 11:08:12'),('HD8c550bbb','HD73e0c1bf',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã giao',4,'2025-02-04 09:57:38','2025-02-04 09:57:38'),('HD9d7ea8fe','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 09:43:06','2025-02-04 09:43:06'),('HDb0d5cb91','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 10:05:34','2025-02-04 10:05:34'),('HDb370ef7c','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đang giao',3,'2025-02-04 09:41:55','2025-02-04 09:41:55'),('HDf2d69a02','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã giao',4,'2025-02-04 10:05:58','2025-02-04 10:05:58'),('LS00c7dbac','HD73e0c1bf',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã hủy',5,'2025-01-31 13:57:27',NULL),('LS052dee73','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 08:51:24',NULL),('LS34af289c','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-01-25 14:04:37',NULL),('LS38a7447f','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 06:17:44',NULL),('LS412006c4','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 08:56:44',NULL),('LS4304add8','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-01-31 06:18:17',NULL),('LS45bbcb97','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 15:53:28','2025-02-13 15:53:28'),('LS4c3e0215','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 09:15:47',NULL),('LS5d454426','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-05 04:55:23','2025-02-05 04:55:23'),('LS6094f30e','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 06:56:48',NULL),('LS60d1417e','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-01-26 10:22:29',NULL),('LS61d0c76a','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-05 09:22:33','2025-02-05 09:22:33'),('LS6655e9c4','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-05 14:45:32','2025-02-05 14:45:32'),('LS7c9d970a','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 06:17:35',NULL),('LS87d925b1','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 16:46:43','2025-02-13 16:46:43'),('LS8c201139','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 07:36:34',NULL),('LS9a380ffa','HD062458',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-19 14:22:54','2025-02-19 14:22:54'),('LS9f9fb75d','HD664a9695',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã hủy',5,'2025-02-21 16:47:26','2025-02-21 16:47:26'),('LSaa2479dd','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 09:10:37',NULL),('LSae8dd392','HD062458',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-19 15:23:10','2025-02-19 15:23:10'),('LSb02480d9','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 08:51:50',NULL),('LSb3d02c69','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-13 16:46:34','2025-02-13 16:46:34'),('LSc951f059','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 16:42:48','2025-02-13 16:42:48'),('LSd08bbeea','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 16:41:18','2025-02-13 16:41:18'),('LSd0ecff3f','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-13 16:41:08','2025-02-13 16:41:08'),('LSdb146eb0','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-05 05:00:14','2025-02-05 05:00:14'),('LSe8a758c2','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 06:56:40',NULL),('LSe9942917','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 09:35:00',NULL),('LSee39cece','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-13 16:41:44','2025-02-13 16:41:44');
/*!40000 ALTER TABLE `lich_su_hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mau_sac`
--

DROP TABLE IF EXISTS `mau_sac`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mau_sac` (
  `id` varchar(255) NOT NULL,
  `ma_mau` varchar(50) DEFAULT NULL,
  `ten_mau` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_mau` (`ma_mau`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mau_sac`
--

LOCK TABLES `mau_sac` WRITE;
/*!40000 ALTER TABLE `mau_sac` DISABLE KEYS */;
INSERT INTO `mau_sac` VALUES ('7ca6f090-d8d5-4f25-8572-de1ebd29f6da','#f31cdd','Hồng','ok',_binary '','2025-02-18 17:11:45'),('99549c36-8470-4fd0-afdc-7815c13854f8','#70ab2e','Xanh lá','ok',_binary '','2025-02-18 17:11:45'),('f82d423c-5ee3-4b25-b87f-94deb47e4316','#dd2a2a','Đỏ','ok',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `mau_sac` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien`
--

DROP TABLE IF EXISTS `nhan_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien` (
  `id` varchar(255) NOT NULL,
  `ma_nhan_vien` varchar(50) DEFAULT NULL,
  `ten_nhan_vien` varchar(255) DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `gioi_tinh` bit(1) DEFAULT NULL,
  `so_dien_thoai` varchar(10) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) DEFAULT NULL,
  `nguoi_sua` varchar(255) DEFAULT NULL,
  `id_tai_khoan` varchar(255) DEFAULT NULL,
  `anh` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_tai_khoan_nhan_vien` (`id_tai_khoan`),
  CONSTRAINT `fk_id_tai_khoan_nhan_vien` FOREIGN KEY (`id_tai_khoan`) REFERENCES `tai_khoan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien`
--

LOCK TABLES `nhan_vien` WRITE;
/*!40000 ALTER TABLE `nhan_vien` DISABLE KEYS */;
INSERT INTO `nhan_vien` VALUES ('1','NV001','Nguyễn Văn Nam','2004-04-03',NULL,_binary '',_binary '','0931713350','vnv@gmail.com','2025-01-19 14:36:25',NULL,NULL,NULL,NULL,NULL),('5b0b6fa3-b765-4444-aa3e-27fbcab64d32','NV07','Ngô Dương Nghĩa','2004-07-27',NULL,_binary '',_binary '','0931713356','nghiand@gmail.com','2025-02-16 12:45:54',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709911/Banner_faliyk.jpg'),('67d09293-f7ca-43d1-a75e-2f222586c5d8','NV05','Hoàng Ngọc Quân','2000-02-02',NULL,_binary '',_binary '\0','0931713353','quanhn@gmail.com','2025-02-16 12:43:54',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709806/slide3_pjpvuk.webp'),('8c3ede9f-791e-4233-ac60-ac58ef3f6bdf','NV002','Nguyễn Duy Khánh','2000-03-04',NULL,_binary '',_binary '','0368262198','abc@gmail.com','2025-02-14 05:03:57',NULL,NULL,NULL,NULL,NULL),('95e82544-7123-4aa0-934f-403d19cfdd09','NV03','Nguyễn Văn Nam','2004-08-03',NULL,_binary '',_binary '','0931713352','namnv@gmail.com','2025-02-16 12:43:02',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709749/sp4_uyba5l.jpg'),('a9402ffd-8702-4759-9ddf-f8f09af72b9e','NV04','Nguyễn Duy Khánh','2000-02-12',NULL,_binary '',_binary '','0931713351','khanh@gmail.com','2025-02-16 12:29:27',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739708927/sp6_fr3sfc.png'),('eb6db611-d763-438c-9246-7e6c1823fee4','NV06','Lâm Bảo Ngọc','2000-09-08',NULL,_binary '',_binary '\0','0931713354','ngoclb@gmail.com','2025-02-16 12:44:48',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709852/Sale_vg284n.webp');
/*!40000 ALTER TABLE `nhan_vien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_giam_gia`
--

DROP TABLE IF EXISTS `phieu_giam_gia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_giam_gia` (
  `id` varchar(255) NOT NULL,
  `ma_phieu_giam_gia` varchar(50) DEFAULT NULL,
  `ten_phieu_giam_gia` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `loai_phieu_giam_gia` int DEFAULT NULL,
  `kieu_giam_gia` int DEFAULT NULL,
  `gia_tri_giam` decimal(15,0) DEFAULT NULL,
  `gia_tri_toi_thieu` decimal(15,0) DEFAULT NULL,
  `so_tien_giam_toi_da` decimal(15,0) DEFAULT NULL,
  `ngay_bat_dau` datetime DEFAULT NULL,
  `ngay_ket_thuc` datetime DEFAULT NULL,
  `so_luong` int DEFAULT NULL,
  `mo_ta` text,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_phieu_giam_gia` (`ma_phieu_giam_gia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_giam_gia`
--

LOCK TABLES `phieu_giam_gia` WRITE;
/*!40000 ALTER TABLE `phieu_giam_gia` DISABLE KEYS */;
INSERT INTO `phieu_giam_gia` VALUES ('12687483-6de7-4370-8459-282b0ee8fda3','PGG-B5C2DB48','Phiếu giảm giá cho huy',1,1,11,12121,1212,'2025-02-14 10:00:00','2025-03-27 10:00:00',93,'212121',1,'2025-02-14 07:17:02',NULL,NULL,NULL),('13138841-adf4-4eea-8ed0-15fbd2c62bf6','PGG-61577FFC','2',2,1,400000,2000000,500000,'2025-02-10 09:16:53','2025-03-27 17:00:00',325,'Mã giảm giá thứ 4',1,NULL,NULL,NULL,NULL),('2800a5e9-5d1e-455d-9d04-86e07da9093b','PGG-508AF469','12',2,2,50,100000,100000,'2025-02-14 03:00:00','2025-03-27 10:00:00',1,'Mô tả ',1,NULL,NULL,NULL,NULL),('3f68e668-d340-4e86-9132-7b415a19bf69','PGG-F8F6ADDE','Phiếu giảm giá cho thinh',1,1,12,1231,122,'2025-02-14 10:00:00','2025-03-27 10:00:00',5,'213',1,NULL,NULL,NULL,NULL),('b6c16a50-2693-4f96-bf03-05c7b8bc1286','PGG-70F6F0A5','121',1,1,12,2312322,21321,'2025-02-18 10:00:00','2025-03-27 10:00:00',12,'dd',1,NULL,NULL,NULL,NULL),('d488786c-066c-4902-b38d-e28f87d9d680','PGG-030F126D','Phiếu giảm giá cho thinh22',1,1,12,22321,2132,'2025-02-14 10:00:00','2025-03-27 10:00:00',212,'ok',1,'2025-02-14 09:07:05',NULL,NULL,NULL),('fd4c6eb0-79a4-40bb-8a8e-98a1150b70d1','PGG-632602DC','1234',1,1,100,10000,1999,'2025-02-13 10:00:00','2025-03-27 10:00:00',0,'Mô tả danh cho 1234',1,NULL,NULL,NULL,NULL),('pg001','PG001','10',1,1,10,600000,100000,'2025-01-11 16:16:53','2025-03-27 17:00:00',995,'Mã giảm giá cho sản phẩm 1',2,'2025-01-11 09:16:53',NULL,'admin',NULL),('pg002','PG002','15',1,1,50,3000000,150000,'2025-01-11 09:16:53','2025-03-27 10:00:00',959,'Mã giảm giá cho sản phẩm 2',1,'2025-01-11 09:16:53',NULL,'admin',NULL),('pg003','PG003','89',1,1,45,5000000,450000,'2025-01-11 16:16:53','2025-03-27 17:00:00',837,'Mã giảm giá cho sản phẩm 3',1,'2025-01-31 06:30:07',NULL,NULL,NULL),('pg004','PG004','4',2,2,400000,2000000,500000,'2025-02-10 09:16:53','2025-03-27 17:00:00',485,'Mã giảm giá thứ 4',1,'2025-02-12 09:35:46',NULL,NULL,NULL);
/*!40000 ALTER TABLE `phieu_giam_gia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_giam_gia_khach_hang`
--

DROP TABLE IF EXISTS `phieu_giam_gia_khach_hang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_giam_gia_khach_hang` (
  `id` varchar(255) NOT NULL,
  `id_phieu_giam_gia` varchar(255) DEFAULT NULL,
  `id_khach_hang` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_phieu_giam_gia` (`id_phieu_giam_gia`),
  KEY `id_khach_hang` (`id_khach_hang`),
  CONSTRAINT `phieu_giam_gia_khach_hang_ibfk_1` FOREIGN KEY (`id_phieu_giam_gia`) REFERENCES `phieu_giam_gia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `phieu_giam_gia_khach_hang_ibfk_2` FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_giam_gia_khach_hang`
--

LOCK TABLES `phieu_giam_gia_khach_hang` WRITE;
/*!40000 ALTER TABLE `phieu_giam_gia_khach_hang` DISABLE KEYS */;
/*!40000 ALTER TABLE `phieu_giam_gia_khach_hang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phuong_thuc_thanh_toan`
--

DROP TABLE IF EXISTS `phuong_thuc_thanh_toan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phuong_thuc_thanh_toan` (
  `id` varchar(255) NOT NULL,
  `ma_phuong_thuc_thanh_toan` varchar(50) DEFAULT NULL,
  `ten_phuong_thuc_thanh_toan` varchar(255) DEFAULT NULL,
  `tong_tien` decimal(15,0) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_phuong_thuc_thanh_toan` (`ma_phuong_thuc_thanh_toan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phuong_thuc_thanh_toan`
--

LOCK TABLES `phuong_thuc_thanh_toan` WRITE;
/*!40000 ALTER TABLE `phuong_thuc_thanh_toan` DISABLE KEYS */;
INSERT INTO `phuong_thuc_thanh_toan` VALUES ('PTTT001','COD','Thanh toán bằng tiền mặt',NULL,'Thanh toán trực tiếp với nhân viên',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL),('PTTT002','BANK','Chuyển khoản ngân hàng',NULL,'Thanh toán qua tài khoản ngân hàng',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL);
/*!40000 ALTER TABLE `phuong_thuc_thanh_toan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `san_pham`
--

DROP TABLE IF EXISTS `san_pham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `san_pham` (
  `id` varchar(255) NOT NULL,
  `ma_san_pham` varchar(50) DEFAULT NULL,
  `ten_san_pham` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_san_pham` (`ma_san_pham`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `san_pham`
--

LOCK TABLES `san_pham` WRITE;
/*!40000 ALTER TABLE `san_pham` DISABLE KEYS */;
INSERT INTO `san_pham` VALUES ('69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','SP1739506011209','so mi coc tay','abc',_binary '','2025-02-14 04:06:51',NULL,NULL,NULL),('sp001','SP001','Sản phẩm 1','Mô tả sản phẩm 1',_binary '','2025-01-11 09:14:09',NULL,'admin',NULL),('sp002','SP002','Sản phẩm 2','Mô tả sản phẩm 2',_binary '','2025-01-11 09:14:09',NULL,'admin',NULL);
/*!40000 ALTER TABLE `san_pham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `san_pham_chi_tiet`
--

DROP TABLE IF EXISTS `san_pham_chi_tiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `san_pham_chi_tiet` (
  `id` varchar(255) NOT NULL,
  `ma_san_pham_chi_tiet` varchar(45) DEFAULT NULL,
  `so_luong` int DEFAULT NULL,
  `mo_ta` text,
  `trang_thai` bit(1) DEFAULT NULL,
  `gia` decimal(15,0) DEFAULT NULL,
  `id_mau_sac` varchar(255) DEFAULT NULL,
  `id_chat_lieu` varchar(255) DEFAULT NULL,
  `id_danh_muc` varchar(255) DEFAULT NULL,
  `id_san_pham` varchar(255) DEFAULT NULL,
  `id_kich_thuoc` varchar(255) DEFAULT NULL,
  `id_thuong_hieu` varchar(255) DEFAULT NULL,
  `id_kieu_dang` varchar(255) DEFAULT NULL,
  `id_kieu_cuc` varchar(255) DEFAULT NULL,
  `id_kieu_co_ao` varchar(255) DEFAULT NULL,
  `id_kieu_tay_ao` varchar(255) DEFAULT NULL,
  `id_kieu_co_tay_ao` varchar(255) DEFAULT NULL,
  `id_hoa_tiet` varchar(255) DEFAULT NULL,
  `id_tui_ao` varchar(255) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_san_pham_chi_tiet_UNIQUE` (`ma_san_pham_chi_tiet`),
  KEY `id_mau_sac_idx` (`id_mau_sac`),
  KEY `id_chat_lieu_idx` (`id_chat_lieu`),
  KEY `id_danh_muc_idx` (`id_danh_muc`),
  KEY `id_san_pham_idx` (`id_san_pham`),
  KEY `id_kich_thuoc_idx` (`id_kich_thuoc`),
  KEY `id_thuong_hieu_idx` (`id_thuong_hieu`),
  KEY `id_kieu_dang_idx` (`id_kieu_dang`),
  KEY `id_kieu_cuc_idx` (`id_kieu_cuc`),
  KEY `id_kieu_co_ao_idx` (`id_kieu_co_ao`),
  KEY `id_kieu_tay_ao_idx` (`id_kieu_tay_ao`),
  KEY `id_kieu_co_tay_ao_idx` (`id_kieu_co_tay_ao`),
  KEY `id_hoa_tiet_idx` (`id_hoa_tiet`),
  KEY `id_tui_ao_idx` (`id_tui_ao`),
  CONSTRAINT `id_chat_lieu` FOREIGN KEY (`id_chat_lieu`) REFERENCES `chat_lieu` (`id`),
  CONSTRAINT `id_danh_muc` FOREIGN KEY (`id_danh_muc`) REFERENCES `danh_muc` (`id`),
  CONSTRAINT `id_hoa_tiet` FOREIGN KEY (`id_hoa_tiet`) REFERENCES `hoa_tiet` (`id`),
  CONSTRAINT `id_kich_thuoc` FOREIGN KEY (`id_kich_thuoc`) REFERENCES `kich_thuoc` (`id`),
  CONSTRAINT `id_kieu_co_ao` FOREIGN KEY (`id_kieu_co_ao`) REFERENCES `kieu_co_ao` (`id`),
  CONSTRAINT `id_kieu_co_tay_ao` FOREIGN KEY (`id_kieu_co_tay_ao`) REFERENCES `kieu_co_tay_ao` (`id`),
  CONSTRAINT `id_kieu_cuc` FOREIGN KEY (`id_kieu_cuc`) REFERENCES `kieu_cuc` (`id`),
  CONSTRAINT `id_kieu_dang` FOREIGN KEY (`id_kieu_dang`) REFERENCES `kieu_dang` (`id`),
  CONSTRAINT `id_kieu_tay_ao` FOREIGN KEY (`id_kieu_tay_ao`) REFERENCES `kieu_tay_ao` (`id`),
  CONSTRAINT `id_mau_sac` FOREIGN KEY (`id_mau_sac`) REFERENCES `mau_sac` (`id`),
  CONSTRAINT `id_san_pham` FOREIGN KEY (`id_san_pham`) REFERENCES `san_pham` (`id`),
  CONSTRAINT `id_thuong_hieu` FOREIGN KEY (`id_thuong_hieu`) REFERENCES `thuong_hieu` (`id`),
  CONSTRAINT `id_tui_ao` FOREIGN KEY (`id_tui_ao`) REFERENCES `kieu_tui_ao` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `san_pham_chi_tiet`
--

LOCK TABLES `san_pham_chi_tiet` WRITE;
/*!40000 ALTER TABLE `san_pham_chi_tiet` DISABLE KEYS */;
INSERT INTO `san_pham_chi_tiet` VALUES ('061840ea-05d1-489a-af6c-291003491202','SPCT1739899844865',28,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('12a77fc0-f2dd-4fb5-8fa6-4debddb62249','SPCT1739899844807',40,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('3f92826e-0eea-44f2-ada6-1c581c54694d','SPCT1739899844154',46,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('4393ee6d-f0ea-4e1d-a0f0-636c957b8165','SPCT1739523889392',1,'okee',_binary '',100000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('4610617a-7c4c-4b55-98d8-3d7b617a7a7b','SPCT1739519763382',46,'ok',_binary '',100033,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('6639faec-b397-41c3-81fb-783dff594545','SPCT1739523889294',6,'okee',_binary '',1000000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('70835a28-7019-4c1c-a2ed-f2a009b4ece9','SPCT1739899844937',50,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18','SPCT1739519763173',50,'ok',_binary '',100000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('7c4314be-981f-49ff-be52-4989f01dc7ac','SPCT1739523888854',5,'okee22',_binary '',1003330,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('ab5258b5-f94f-4869-a2d0-7cd702e3ef5f','SPCT1739519762969',50,'ok',_binary '',100099,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('b7253bf1-88d0-4110-81a2-a52ef6022307','SPCT1739899844899',50,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('d1d9a7ad-a833-4347-9a7c-0544aad45374','SPCT1739899844829',50,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5','SPCT1739523889343',5,'okee',_binary '',10000000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('f8729c3a-2215-47c2-931e-b177cb871007','SPCT1739519762419',50,'ok',_binary '',100055,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('spct001','SPCT001',84,'Chi tiết sản phẩm 1',_binary '',500000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('spct002','SPCT002',52,'Chi tiết sản phẩm 2',_binary '',700000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp002','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `san_pham_chi_tiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tai_khoan`
--

DROP TABLE IF EXISTS `tai_khoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tai_khoan` (
  `id` varchar(255) NOT NULL,
  `id_vai_tro` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `id_vai_tro` (`id_vai_tro`),
  CONSTRAINT `tai_khoan_ibfk_1` FOREIGN KEY (`id_vai_tro`) REFERENCES `vai_tro` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tai_khoan`
--

LOCK TABLES `tai_khoan` WRITE;
/*!40000 ALTER TABLE `tai_khoan` DISABLE KEYS */;
/*!40000 ALTER TABLE `tai_khoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thanh_toan_hoa_don`
--

DROP TABLE IF EXISTS `thanh_toan_hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thanh_toan_hoa_don` (
  `id` varchar(255) NOT NULL,
  `id_hoa_don` varchar(255) DEFAULT NULL,
  `id_phuong_thuc_thanh_toan` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `trang_thai` int DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_hoa_don` (`id_hoa_don`),
  KEY `id_phuong_thuc_thanh_toan` (`id_phuong_thuc_thanh_toan`),
  CONSTRAINT `thanh_toan_hoa_don_ibfk_1` FOREIGN KEY (`id_hoa_don`) REFERENCES `hoa_don` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `thanh_toan_hoa_don_ibfk_2` FOREIGN KEY (`id_phuong_thuc_thanh_toan`) REFERENCES `phuong_thuc_thanh_toan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thanh_toan_hoa_don`
--

LOCK TABLES `thanh_toan_hoa_don` WRITE;
/*!40000 ALTER TABLE `thanh_toan_hoa_don` DISABLE KEYS */;
INSERT INTO `thanh_toan_hoa_don` VALUES ('TT182b22c0','HD002','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-21 17:38:19','2025-02-21 17:38:19',NULL,NULL),('TT1a18ca89','HDe7418078','PTTT001','Thanh toán trực tiếp với nhân viên giao hàng',1,'2025-01-31 03:05:51',NULL,NULL,NULL),('TT7726260d','HD002','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-21 17:58:50','2025-02-21 17:58:50',NULL,NULL),('TTb460af75','HDbc1be37e','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-01-31 06:21:23',NULL,NULL,NULL),('TTbbc65951','HD002','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-21 17:20:20','2025-02-21 17:20:20',NULL,NULL),('TTc7abc791','HD73e0c1bf','PTTT001','Thanh toán trực tiếp với nhân viên giao hàng',1,'2025-01-31 13:57:18',NULL,NULL,NULL),('TTca2754c4','HD002','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-22 08:01:41','2025-02-22 08:01:41',NULL,NULL);
/*!40000 ALTER TABLE `thanh_toan_hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thuong_hieu`
--

DROP TABLE IF EXISTS `thuong_hieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thuong_hieu` (
  `id` varchar(255) NOT NULL,
  `ma_thuong_hieu` varchar(50) DEFAULT NULL,
  `ten_thuong_hieu` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_thuong_hieu` (`ma_thuong_hieu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuong_hieu`
--

LOCK TABLES `thuong_hieu` WRITE;
/*!40000 ALTER TABLE `thuong_hieu` DISABLE KEYS */;
INSERT INTO `thuong_hieu` VALUES ('b396afb0-f55d-4ce0-80b7-f2f7daf8048c','TH1739519125649','Zara','ok',_binary '','2025-02-18 17:11:45');
/*!40000 ALTER TABLE `thuong_hieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vai_tro`
--

DROP TABLE IF EXISTS `vai_tro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vai_tro` (
  `id` varchar(255) NOT NULL,
  `ma_vai_tro` varchar(50) DEFAULT NULL,
  `ten_vai_tro` varchar(255) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_vai_tro` (`ma_vai_tro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vai_tro`
--

LOCK TABLES `vai_tro` WRITE;
/*!40000 ALTER TABLE `vai_tro` DISABLE KEYS */;
/*!40000 ALTER TABLE `vai_tro` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-22 18:12:33
