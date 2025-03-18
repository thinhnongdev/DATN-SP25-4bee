CREATE DATABASE  IF NOT EXISTS `datn_4bee` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `datn_4bee`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: datn_4bee
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
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
INSERT INTO `anh_san_pham` VALUES ('0147620f-8adb-483c-9047-2560a97e3649','IMG1740308310484','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739041772/Screenshot_2024-02-28_222303_yeueru.png','',_binary '','6d33cd1f-1498-4d8b-a45f-bada5c19452a'),('0167e420-dd02-4bb0-894a-a6fcfd5b8db3','IMG1740910601854','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3be0daee-846d-473b-9fee-2e7a29e91552'),('0fbb8fea-ce5a-4ef5-af91-db7b194948a2','IMG1739899844856','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','d1d9a7ad-a833-4347-9a7c-0544aad45374'),('10a15949-5e8c-435e-a6a4-324765fd7152','IMG1739899844823','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','12a77fc0-f2dd-4fb5-8fa6-4debddb62249'),('14233226-0a5b-4157-a5cd-ba838f129db6','IMG1739521956639','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739347650/Screenshot_2024-10-13_113138_dkcbvo.png','',_binary '','4610617a-7c4c-4b55-98d8-3d7b617a7a7b'),('14a75c34-3b32-4e09-9896-f2af842a223d','IMG1740910601282','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','4b39ae1a-9379-47e9-8c80-0f5672f46c10'),('1bc08e48-69c3-433b-bbfd-17c45f174697','IMG1739523889423','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391314/Screenshot_2024-11-06_094821_s86iqu.png','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('1c9f1a7a-0296-447c-a030-f0d1095ca564','IMG1740308928941','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','464b2463-2fbe-4207-a7fb-d50357a66174'),('1f703732-334a-446f-9c5c-bf44207f8d3e','IMG1740308310377','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739714347/307375_pkjd7c.jpg','',_binary '','c0bfcac5-08dc-4557-b9ed-1bc45b64be63'),('2149b43c-2b12-47d5-96b4-5057ee1d4a94','IMG1739523889329','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('214c3af5-c489-4159-afd8-3502eb15f3df','IMG1739519763103','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('242e5d28-087b-4f23-b7da-56dd7feb61da','IMG1740910601090','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','3f0a6468-73e0-4f36-b11e-296d7bfaba4d'),('279dbc48-7297-459c-8c38-3cbbf0920e19','IMG1739523889373','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391314/Screenshot_2024-11-06_094821_s86iqu.png','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('2b06c664-cc92-46e4-ae9d-e46a9bf8984d','IMG1742221325969','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','02195fe8-3498-469c-be33-c049732f0727'),('2e241a76-3d2b-4e35-a4df-8af27aef0faa','IMG1739899844966','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','70835a28-7019-4c1c-a2ed-f2a009b4ece9'),('2f25209f-b49d-4ee0-830f-1d5f97f8ecce','IMG1740910601540','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','9a014ee3-43fa-48a5-a758-85b8c45faecb'),('333f71b6-6969-4109-9270-f42065b700fa','IMG1740910601162','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','9484808d-6bf1-43a7-804a-f9987b3b8f7b'),('369b9c8e-48e6-4a77-aae9-7ea9b5eb509a','IMG1740308310502','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739070424/Screenshot_2024-02-22_174526_ftsa45.png','',_binary '','6d33cd1f-1498-4d8b-a45f-bada5c19452a'),('3a1f5819-0eef-45be-aa9f-c38d07c6ad1b','IMG1739899844929','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','b7253bf1-88d0-4110-81a2-a52ef6022307'),('49495b21-91b1-4394-823c-d4026f62d7aa','IMG1739523889379','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('4a826c0f-a693-4361-804b-6f3e0c628ecb','IMG1740910601940','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3ccc7099-66c9-4ee4-ba35-06a25371bde8'),('4aa42a8d-174c-4950-8aba-3025b15f0ff2','IMG1739523934905','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('4dd044d5-ee8b-440c-a2e9-7daf2c1c34bb','IMG1742221325955','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','02195fe8-3498-469c-be33-c049732f0727'),('510c5538-609c-4090-90db-73ed964bfe96','IMG1739523889386','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739523857/sp4_tr2t99.jpg','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('51b8ace4-f172-4809-9d0b-57b733e7c890','IMG1740910601250','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','4b39ae1a-9379-47e9-8c80-0f5672f46c10'),('572f4301-3313-4c20-970f-787cd0966153','IMG1739519763308','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739347650/Screenshot_2024-10-13_113138_dkcbvo.png','',_binary '','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18'),('5e11c6d8-0c19-4eb1-a36b-45d66c641684','IMG1740308928869','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739714347/307375_pkjd7c.jpg','',_binary '','2426993d-01a0-4bdc-9ff5-4995b4f361ea'),('60d7325f-1513-45ad-b790-0d8c1c9a32e7','IMG1739899844890','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','061840ea-05d1-489a-af6c-291003491202'),('629c6f11-9645-47b6-9635-bd77b7d50e42','IMG1739519762948','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('6e18e4c0-5b56-4f46-b998-9de79640b1cc','IMG1739519762815','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('6fa9277b-4df8-4c9b-8dc2-d9b375663032','IMG1739899844960','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','70835a28-7019-4c1c-a2ed-f2a009b4ece9'),('728131c6-8a12-4d38-9174-1f7a91c63719','IMG1740910600996','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','3f0a6468-73e0-4f36-b11e-296d7bfaba4d'),('73689a2a-64b7-4076-926c-2bc1633c18d0','IMG1740308310346','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739714347/307375_pkjd7c.jpg','',_binary '','85a4aefa-83a4-470f-bd2c-fa0545b0adac'),('762976c7-517b-4f4e-a1d3-a5ee7aa0810e','IMG1739519763271','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18'),('7b61857a-279f-415e-b99e-001f624f5af0','IMG1740308310429','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739041772/Screenshot_2024-02-28_222303_yeueru.png','',_binary '','4665b3b1-fe89-4779-be2b-9d05ed246e5b'),('81833837-4587-4f9a-aa0c-5e6a98ac1580','IMG1740308310438','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739070424/Screenshot_2024-02-22_174526_ftsa45.png','',_binary '','4665b3b1-fe89-4779-be2b-9d05ed246e5b'),('86339393-922d-4fca-9abd-9ec2079a5462','IMG1739899844883','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','061840ea-05d1-489a-af6c-291003491202'),('868fa1c6-bc8e-4376-b53a-8c2a8478699d','IMG1740910601073','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3f0a6468-73e0-4f36-b11e-296d7bfaba4d'),('8deff18e-df34-4e80-b8d3-3602d962161d','IMG1740910601200','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','9484808d-6bf1-43a7-804a-f9987b3b8f7b'),('8ea47963-6f99-4d8c-8fc4-510352309545','IMG1739899844922','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','b7253bf1-88d0-4110-81a2-a52ef6022307'),('957d48c1-546f-4682-9bb4-ac89c15e6828','IMG1739519763119','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('96714b3b-8370-45a5-aab1-f3583aab2858','IMG1740910601468','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','8830c9ed-39f8-4241-b548-9de74405deac'),('98cfd389-2256-4730-afcd-d7700a738857','IMG1739523889429','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('9d089b93-c1ea-4f67-8630-61444dd7a61f','IMG1740910601793','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','4d2974ea-b76d-45a5-b52d-5f170e8896aa'),('a207c3d9-a2c9-4d85-a191-3ae21538c8b7','IMG1739523889334','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('a5bfb17c-6c93-4cc6-acc2-356452ef1434','IMG1740910601273','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','4b39ae1a-9379-47e9-8c80-0f5672f46c10'),('a7da2332-c887-46dc-8f10-84268973dc65','IMG1739899844753','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3f92826e-0eea-44f2-ada6-1c581c54694d'),('a9af99d9-9441-4cfe-ac56-52c1f6f2038c','IMG1739523934898','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('b03cc2f9-3244-45c1-82fa-89a1bad0d8a0','IMG1740910601668','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','14e83f96-ee63-4ca6-bd1a-648de9991c47'),('b1255e82-beec-4baf-8a5f-0057c8472669','IMG1740910601183','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','9484808d-6bf1-43a7-804a-f9987b3b8f7b'),('b24813e4-0f95-46c8-9c24-9a5acc446e61','IMG1742221325948','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','02195fe8-3498-469c-be33-c049732f0727'),('b44e8682-6f25-49d3-9d9f-c2b8155cda52','IMG1740308928953','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','464b2463-2fbe-4207-a7fb-d50357a66174'),('b459327c-0b8d-4165-8362-583c62dd9b8a','IMG1740308928891','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1740306147/sp3_bf5qj0.jpg','',_binary '','2426993d-01a0-4bdc-9ff5-4995b4f361ea'),('b569c617-2a70-40c7-b5ca-4a758482e04b','IMG1740910601734','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','197d0db4-9d0e-4708-9610-4d21726cdf05'),('b6751d25-cc1f-46cb-9224-40b5dbf80330','IMG1739523889437','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739523857/sp4_tr2t99.jpg','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('b8684b31-95a6-4bc7-b300-73fd85ad6724','IMG1739521956569','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','4610617a-7c4c-4b55-98d8-3d7b617a7a7b'),('ce667b1b-aa55-4a1b-9292-7aa08df45b0e','IMG1739519762930','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('d514e51c-256a-4dae-8198-e0fac3d8dc55','IMG1739523889318','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('d93b2439-c14d-4096-91bb-b8db4d7b44fb','IMG1739519763145','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('f8ed28f1-939b-4b60-b63a-f75f014eb97f','IMG1739523934910','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('fcdafeec-b6c6-45c7-9a79-13aa025d8356','IMG1740910601615','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','e3fe7452-028c-4dc9-9b27-44a07cb01a1a');
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
INSERT INTO `chat_lieu` VALUES ('2af77f53-a74c-468b-b599-a080a828d253','CL1740308859121','linen','ok',_binary '','2025-02-23 11:07:39'),('307ff145-d0e5-460a-afd9-d8b606c23c18','CL1739505981393','sat','sat',_binary '','2025-02-18 17:11:45');
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
INSERT INTO `danh_muc` VALUES ('350987d0-b0f6-43b4-927a-a5504f82b942','M1740306553160','dm2ư','ok',_binary '','2025-02-23 10:29:13'),('dm01','dm1','dm1','mô tả cho danh mục 1 ',_binary '','2025-02-18 17:25:13');
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
INSERT INTO `dia_chi` VALUES ('21b96719-3adf-4b2c-9e80-b3205f80ef3c','77456e5d-b4a1-4d42-80ea-0dfae9faf04e','Pải Lủng','Mèo Vạc','Hà Giang',NULL,1,'2025-03-14 16:21:31',NULL,NULL,NULL),('259e8a30-8a0c-41a1-9b44-173489bf3488','fe41eeb2-d332-41b3-9e1d-a8beeba88015','13','Gò Vấp','Hồ Chí Minh','Số 122',1,'2025-03-16 01:24:56',NULL,NULL,NULL),('37827129-d27f-4d12-bf6a-09ebcda92ce1','a31fce99-b326-46ec-8475-a6e0b4aeaa4a','Phó Bảng','Đồng Văn','Hà Giang',NULL,1,'2025-03-08 14:59:34',NULL,NULL,NULL),('4638a5da-9094-461d-9af8-032e0b77c444','19bad9bf-3305-4593-9116-a3d0035c7b67','Phúc Xá','Ba Đình','Hà Nội',NULL,1,'2025-03-14 09:58:50',NULL,NULL,NULL),('4ace2ff2-0dc0-4b23-925e-5cef2e14beb7','cda3521e-7274-458a-bda1-7e99e4cba175','Lũng Cú','Đồng Văn','Hà Giang',NULL,1,'2025-03-02 11:02:14',NULL,NULL,NULL),('5da05a0e-2f88-4095-972d-daa4b2c9c28e','fe41eeb2-d332-41b3-9e1d-a8beeba88015','Má Lé','Đồng Văn','Hà Giang','Số 122',1,'2025-03-14 07:09:22',NULL,NULL,NULL),('5f9c8438-5310-4c7b-a1b2-4b9ab09933bc','1206c963-7ae9-4c90-aae4-4e14d697386c','Phúc Xá','Ba Đình','Hà Nội',NULL,1,'2025-03-14 09:58:51',NULL,NULL,NULL),('7cf8be44-12a0-4f10-b147-a95f30bfa792','cd1b6180-ef1c-4e42-a186-5545c476487f','Phúc Tân','Hoàn Kiếm','Hà Nội',NULL,1,'2025-03-02 10:59:55',NULL,NULL,NULL),('89ab94d2-082f-4eee-8182-417b384259ed','9ec56406-f37f-41f4-bd7f-f6a3c9812282','Hàng Đào','Hoàn Kiếm','Hà Nội','Số 112',1,'2025-03-10 15:30:41',NULL,NULL,NULL),('a4f901c2-9518-474a-acdf-adac1ba6f3d8','fe41eeb2-d332-41b3-9e1d-a8beeba88015','Đồng Xuân','Hoàn Kiếm','Hà Nội','Số 122',1,'2025-03-16 01:25:53',NULL,NULL,NULL),('a77dc0e0-b40a-4378-a4ed-9ed21d0d270e','9ec56406-f37f-41f4-bd7f-f6a3c9812282','Hàng Đào','Hoàn Kiếm','Hà Nội',NULL,1,'2025-03-02 11:03:12',NULL,NULL,NULL),('ae89bcc5-4850-42a4-8d13-47831f18c574','39e1768c-dddd-44f8-988a-1e4982ac72d8','Trần Phú','Hà Giang','Tỉnh Hà Giang','112',1,'2025-03-07 09:38:26',NULL,NULL,NULL),('ae916115-3719-49d8-a5e3-0beedda6baa9','9e4de171-34d4-4bec-b0a7-b16039150072','Lũng Cú','Đồng Văn','Hà Giang',NULL,1,'2025-03-08 14:36:24',NULL,NULL,NULL),('b599db6d-519f-4de7-acd0-e14a3f3ceb9e','7fcde7f0-bfae-4720-88ea-8c8476ed84a6','Khương Trung','Thanh Xuân','Hà Nội',NULL,1,'2025-03-02 10:49:30',NULL,NULL,NULL),('c7cc227b-7e8f-4132-9136-19f814e69ab9','e796493d-4e08-4255-9c67-cc6e4cb9fb46','Trần Phú','Hà Giang','Hà Giang',NULL,1,'2025-03-08 14:47:57',NULL,NULL,NULL),('d0ca7242-cf0d-4c24-bd73-a9c5ee13cd77','7d266d03-612c-42fc-b454-ea4b191589d1','Quang Trung','Hà Giang','Hà Giang',NULL,1,'2025-03-02 10:59:12',NULL,NULL,NULL),('dc0001','39e1768c-dddd-44f8-988a-1e4982ac72d8','Phường Trần Phú','Thành phố Hà Giang','Tỉnh Hà Giang','123 Le Loi',1,'2025-02-22 10:28:32','2025-02-22 10:28:32',NULL,NULL),('e30be75e-3e48-4448-9c1c-8e7682bb1ab6','1206c963-7ae9-4c90-aae4-4e14d697386c','Lũng Cú','Đồng Văn','Hà Giang','Số 234',1,'2025-03-18 10:48:28',NULL,NULL,NULL),('e901fb0f-7153-45d1-8f21-205348ea31d9','fe41eeb2-d332-41b3-9e1d-a8beeba88015','Má Lé','Đồng Văn','Hà Giang',NULL,1,'2025-03-08 15:09:16',NULL,NULL,NULL);
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
  `phi_van_chuyen` decimal(15,2) DEFAULT NULL,
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
INSERT INTO `hoa_don` VALUES ('578beb89-652b-443f-8c2d-e158b24c7cf4','HD1742286346978','pg004','1206c963-7ae9-4c90-aae4-4e14d697386c',NULL,2,'Nguyễn Dương','0368521479','huyhiz12www4@gmail.com','Số 234, Lũng Cú, Đồng Văn, Hà Giang',1,NULL,NULL,1701000,'ok',5,'2025-03-18 08:25:47','2025-03-18 11:08:35',NULL,NULL,0.00),('6a62761e-2e52-4a37-b5c0-984cd9bfc966','HD1742273562081',NULL,'fe41eeb2-d332-41b3-9e1d-a8beeba88011',NULL,1,'anh thinh ok','0223232321','tienthinhh3e@gmail.com','số 11',1,NULL,NULL,401000,' ok',5,'2025-03-18 04:52:42','2025-03-18 11:45:46',NULL,NULL,NULL),('cd70d2c1-a6ff-4267-961d-cda03f904de6','HD1742284974576','fd4c6eb0-79a4-40bb-8a8e-98a1150b70d1','fe41eeb2-d332-41b3-9e1d-a8beeba88011',NULL,1,'anh thinh vẫn cứ ok','0355555554','anhthinhchuaok@gmail.com','sô 11',1,NULL,NULL,401000,'ok',1,'2025-03-18 08:02:55',NULL,NULL,NULL,NULL),('HD002','HD002','pg003','39e1768c-dddd-44f8-988a-1e4982ac72d8','1',1,'Nguyễn Văn Nam','0901234567','nguyenvana@example.com','123 Le Loi, Thị trấn Pác Miầu, Huyện Bảo Lâm, Tỉnh Cao Bằng',0,'2025-02-23 23:20:23','2025-02-23 23:20:23',7754198,'Giao nhanh',4,'2025-02-21 15:33:14','2025-02-23 16:20:23',NULL,'anonymousUser',NULL),('HD027c4671','HD550423','12687483-6de7-4370-8459-282b0ee8fda3',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 22:30:17','2025-02-28 22:30:17',298821,NULL,4,'2025-02-28 15:29:19','2025-02-28 15:30:17',NULL,NULL,NULL),('HD135e260b','HD567266',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'2025-03-18 11:49:40','2025-03-18 12:04:58',NULL,NULL,NULL),('HD173d12a5','HD718076','12687483-6de7-4370-8459-282b0ee8fda3',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 22:28:41','2025-02-28 22:28:41',298821,NULL,4,'2025-02-28 15:28:17','2025-02-28 15:28:41',NULL,NULL,NULL),('HD18e23cc8','HD310309',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'2025-03-16 10:49:16','2025-03-16 10:54:53',NULL,NULL,NULL),('HD1a1186b8','HD060962','pg001',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 22:20:15','2025-02-28 22:20:15',1400033,NULL,4,'2025-02-28 15:18:43','2025-02-28 15:20:15',NULL,NULL,NULL),('HD1eec3b4e','HD918168','d488786c-066c-4902-b38d-e28f87d9d680','fe41eeb2-d332-41b3-9e1d-a8beeba88015',NULL,3,'Tôi Vẫn Là Huy','0367894512','huysky124w@gmail.com','null, Má Lé, Đồng Văn, Hà Giang',NULL,NULL,NULL,397868,NULL,3,'2025-03-14 06:25:17','2025-03-14 06:25:17',NULL,NULL,NULL),('HD2344049d','HD309363','pg001','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350',NULL,'123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội',NULL,'2025-02-26 18:44:26','2025-02-26 18:44:26',1500000,NULL,4,'2025-02-19 16:32:38','2025-02-26 11:44:26',NULL,'anonymousUser',NULL),('HD25a3e460','HD149015',NULL,'1206c963-7ae9-4c90-aae4-4e14d697386c',NULL,3,'Nguyễn Dương','0368521479','huyhiz12www4@gmail.com','null, Phúc Xá, Ba Đình, Hà Nội',NULL,NULL,NULL,1000000,NULL,3,'2025-03-15 12:38:45','2025-03-15 12:38:45',NULL,NULL,NULL),('HD28242b11','HD537550',NULL,NULL,NULL,3,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,3,'2025-03-16 09:36:25','2025-03-16 09:41:10',NULL,NULL,36501.00),('HD285f768d','HD849358',NULL,NULL,NULL,3,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,3,'2025-03-16 09:40:12','2025-03-16 09:43:33',NULL,NULL,21001.00),('HD29337792','HD980590','pg004','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-03-01 22:21:37','2025-03-01 22:21:37',4300033,NULL,4,'2025-03-01 11:47:59','2025-03-01 15:21:37',NULL,NULL,NULL),('HD2ac53ac8','HD700130','d488786c-066c-4902-b38d-e28f87d9d680',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-26 19:02:49','2025-02-26 19:02:49',1197868,NULL,4,'2025-02-26 12:02:28','2025-02-26 12:02:49',NULL,NULL,NULL),('HD309ed755','HD702751',NULL,'77456e5d-b4a1-4d42-80ea-0dfae9faf04e',NULL,3,'Huy Nguyễn NN','0369785421','huysky1284@gmail.com','null, Pải Lủng, Mèo Vạc, Hà Giang',NULL,NULL,NULL,0,NULL,3,'2025-03-16 10:55:10','2025-03-16 13:51:36',NULL,NULL,31501.00),('HD393cc498','HD584929',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-03-18 12:22:16',NULL,NULL,NULL,NULL),('HD3b89c1f0','HD803679','pg003',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 20:34:12','2025-02-28 20:34:12',7152033,NULL,4,'2025-02-28 13:33:07','2025-02-28 13:34:12',NULL,NULL,NULL),('HD41acc685','HD303078','13138841-adf4-4eea-8ed0-15fbd2c62bf6','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-28 15:03:27','2025-02-28 15:03:27',1600000,NULL,4,'2025-02-22 10:10:40','2025-02-28 08:03:27',NULL,NULL,NULL),('HD45fb10bf','HD672288','pg004',NULL,NULL,2,'Hà Nhi',NULL,NULL,NULL,NULL,'2025-02-23 22:45:47','2025-02-23 22:45:47',7204000,NULL,4,'2025-02-19 15:22:44','2025-02-23 15:45:47',NULL,NULL,NULL),('HD48547662','HD815819','cd2e955f-fb32-4d6a-bbf8-735ae1f75722',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-03-02 01:22:15','2025-03-02 01:22:15',4576000,NULL,4,'2025-03-01 13:36:07','2025-03-01 18:22:15',NULL,NULL,NULL),('HD4fbec467','HD794266','13138841-adf4-4eea-8ed0-15fbd2c62bf6',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 22:19:21','2025-02-28 22:19:21',2502000,NULL,4,'2025-02-28 15:18:43','2025-02-28 15:19:21',NULL,NULL,NULL),('HD59e9d6b8','HD204708','d488786c-066c-4902-b38d-e28f87d9d680','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-26 19:25:07','2025-02-26 19:25:07',597868,NULL,4,'2025-02-26 12:24:51','2025-02-26 12:25:07',NULL,NULL,NULL),('HD5eb22013','HD338147','d488786c-066c-4902-b38d-e28f87d9d680','19bad9bf-3305-4593-9116-a3d0035c7b67',NULL,3,'Nguyễn Dương','0368521479','huyhiz12www4@gmail.com','null, Phúc Xá, Ba Đình, Hà Nội',NULL,NULL,NULL,397868,NULL,3,'2025-03-17 10:30:38','2025-03-17 16:56:13',NULL,NULL,21001.00),('HD64455cca','HD289648',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-03-02 17:19:22','2025-03-02 17:19:22',3000,NULL,4,'2025-03-02 10:17:06','2025-03-02 10:19:22',NULL,NULL,NULL),('HD664a9695','HD954607','12687483-6de7-4370-8459-282b0ee8fda3',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-23 23:20:54','2025-02-23 23:20:54',1398788,NULL,4,'2025-02-19 15:21:56','2025-02-23 16:20:54',NULL,NULL,NULL),('HD6ab6ed2c','HD647383','13138841-adf4-4eea-8ed0-15fbd2c62bf6','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-28 14:55:55','2025-02-28 14:55:55',1600000,'Không có ghi chú',4,'2025-02-26 12:25:37','2025-02-28 07:55:55',NULL,'anonymousUser',NULL),('HD6bd2ffb9','HD579014',NULL,'1206c963-7ae9-4c90-aae4-4e14d697386c',NULL,3,'Nguyễn Dương','0368521479','huyhiz12www4@gmail.com','null, Phúc Xá, Ba Đình, Hà Nội',NULL,NULL,NULL,1000,NULL,3,'2025-03-14 13:10:37','2025-03-16 09:31:35',NULL,NULL,21001.00),('HD6ff327b1','HD708806','12687483-6de7-4370-8459-282b0ee8fda3','77456e5d-b4a1-4d42-80ea-0dfae9faf04e',NULL,3,'Huy Nguyễn NN','0369785421','huysky1284@gmail.com','null, Pải Lủng, Mèo Vạc, Hà Giang',NULL,NULL,NULL,800788,NULL,3,'2025-03-18 12:05:01','2025-03-18 12:06:48',NULL,NULL,21001.00),('HD73e0c1bf','HD828803',NULL,NULL,NULL,1,'Địa chỉ ','0123456789','','đồng ý',NULL,'2025-02-23 23:20:34','2025-02-23 23:20:34',1200000,'',4,'2025-01-31 13:57:18','2025-02-23 16:20:34','anonymousUser','anonymousUser',NULL),('HD7491b506','HD392138','pg001','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-28 15:04:27','2025-02-28 15:04:27',1700000,'Không có ghi chú',4,'2025-02-26 12:06:34','2025-02-28 08:04:27',NULL,'anonymousUser',NULL),('HD7804df0c','HD135686',NULL,NULL,NULL,3,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'2025-03-06 09:05:45','2025-03-07 08:26:52',NULL,NULL,NULL),('HD7be78062','HD141036','d488786c-066c-4902-b38d-e28f87d9d680','fe41eeb2-d332-41b3-9e1d-a8beeba88015',NULL,3,'Tôi Vẫn Là Huy','0367894512','huysky124w@gmail.com','Số 122, 13, Gò Vấp, Hồ Chí Minh',NULL,NULL,NULL,197868,NULL,3,'2025-03-14 13:10:48','2025-03-16 09:33:13',NULL,NULL,34000.00),('HD7e191e53','HD092750','pg003',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 20:32:51','2025-02-28 20:32:51',9277265,NULL,4,'2025-02-28 09:53:28','2025-02-28 13:32:51',NULL,NULL,NULL),('HD8071caf0','HD119890','d488786c-066c-4902-b38d-e28f87d9d680','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-26 19:23:12','2025-02-26 19:23:12',397868,NULL,4,'2025-02-26 12:22:47','2025-02-26 12:23:12',NULL,NULL,NULL),('HD853c93ee','HD177772','cd2e955f-fb32-4d6a-bbf8-735ae1f75722',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-03-02 14:30:20','2025-03-02 14:30:20',7927040,NULL,4,'2025-03-01 16:21:39','2025-03-02 07:30:20',NULL,NULL,NULL),('HD882fa672','HD977254',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-03-18 12:04:52',NULL,NULL,NULL,NULL),('HD8a5cf5e8','HD570153','cd2e955f-fb32-4d6a-bbf8-735ae1f75722','9ec56406-f37f-41f4-bd7f-f6a3c9812282',NULL,3,'Nguyễn Thùy Dương','0368262088','abc123a@gmail.com','Số 112, Hàng Đào, Hoàn Kiếm, Hà Nội',NULL,NULL,NULL,4579520,NULL,3,'2025-03-02 07:33:53','2025-03-10 15:33:26',NULL,NULL,NULL),('HD8f29f680','HD258105','pg002',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 21:02:50','2025-02-28 21:02:50',7652033,NULL,4,'2025-02-28 14:01:12','2025-02-28 14:02:50',NULL,NULL,NULL),('HD93d2ec66','HD773372','cd2e955f-fb32-4d6a-bbf8-735ae1f75722','1206c963-7ae9-4c90-aae4-4e14d697386c',NULL,2,'Nguyễn Dương','0368521479','huyhiz12www4@gmail.com','null, Phúc Xá, Ba Đình, Hà Nội',NULL,NULL,NULL,8814660,NULL,1,'2025-03-17 16:56:21',NULL,NULL,NULL,0.00),('HD971ce3c0','HD633695',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'2025-03-18 12:22:09','2025-03-18 12:22:13',NULL,NULL,NULL),('HDa56d3c70','HD910082','12687483-6de7-4370-8459-282b0ee8fda3',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 22:08:17','2025-02-28 22:08:17',398788,NULL,4,'2025-02-28 14:53:41','2025-02-28 15:08:17',NULL,NULL,NULL),('HDa741cc7c','HD523117','13138841-adf4-4eea-8ed0-15fbd2c62bf6',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 15:43:01','2025-02-28 15:43:01',2102000,NULL,4,'2025-02-28 08:08:04','2025-02-28 08:43:01',NULL,NULL,NULL),('HDa84e1fb9','HD186867','pg002',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 20:31:42','2025-02-28 20:31:42',13275320,NULL,4,'2025-02-28 09:53:28','2025-02-28 13:31:42',NULL,NULL,NULL),('HDacbb19d2','HD962520','13138841-adf4-4eea-8ed0-15fbd2c62bf6',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 22:26:47','2025-02-28 22:26:47',2149926,NULL,4,'2025-02-28 15:24:00','2025-02-28 15:26:47',NULL,NULL,NULL),('HDb6f72984','HD168419','pg002',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-03-06 14:39:46','2025-03-06 14:39:46',5054000,NULL,4,'2025-03-02 10:22:32','2025-03-06 07:39:46',NULL,NULL,NULL),('HDbc1be37e','HD803580',NULL,NULL,NULL,1,'Dương Dương','0123456789',NULL,'Số 232, Phường Phúc Tân, Quận Hoàn Kiếm, Thành phố Hà Nội',NULL,'2025-02-04 17:05:47','2025-02-04 17:05:58',6500000,'Giao nhanh',2,'2025-01-31 06:21:23','2025-02-13 15:53:28','anonymousUser','anonymousUser',NULL),('HDbc615e2b','HD957774',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'2025-03-18 12:22:11','2025-03-18 12:22:18',NULL,NULL,NULL),('HDcd6e3cb9','HD204952','d488786c-066c-4902-b38d-e28f87d9d680','fe41eeb2-d332-41b3-9e1d-a8beeba88015',NULL,3,'Tôi Vẫn Là Huy','0367894512','huysky124w@gmail.com','null, Má Lé, Đồng Văn, Hà Giang',NULL,NULL,NULL,397868,NULL,3,'2025-03-06 09:06:05','2025-03-12 18:51:20',NULL,NULL,NULL),('HDd4f57c39','HD175882','d488786c-066c-4902-b38d-e28f87d9d680','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,3,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,NULL,NULL,197868,NULL,3,'2025-03-14 12:39:21','2025-03-14 12:39:21',NULL,NULL,NULL),('HDd8fdb2bd','HD784740','pg003','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-28 20:55:43','2025-02-28 20:55:43',19802080,NULL,4,'2025-02-28 13:40:24','2025-02-28 13:55:43',NULL,NULL,NULL),('HDdb9a12e6','HD773461','d488786c-066c-4902-b38d-e28f87d9d680','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,3,'Nguyễn Văn Nam','0931713350','namnv@gmail.com','112, Trần Phú, Hà Giang, Tỉnh Hà Giang',NULL,NULL,NULL,397868,NULL,3,'2025-03-14 10:02:37','2025-03-16 09:47:53',NULL,NULL,31501.00),('HDdfbfeba9','HD190762',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-03-02 17:24:36','2025-03-02 17:24:36',6000,NULL,4,'2025-03-02 10:22:34','2025-03-02 10:24:36',NULL,NULL,NULL),('HDe1084271','HD991746','13138841-adf4-4eea-8ed0-15fbd2c62bf6',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-02-28 15:06:30','2025-02-28 15:06:30',1600000,NULL,4,'2025-02-22 16:14:04','2025-02-28 08:06:30',NULL,NULL,NULL),('HDe72eb948','HD719701','13138841-adf4-4eea-8ed0-15fbd2c62bf6','39e1768c-dddd-44f8-988a-1e4982ac72d8',NULL,2,'Nguyễn Văn Nam',NULL,NULL,'123 Le Loi, Phường Trần Phú, Thành phố Hà Giang, Tỉnh Hà Giang',NULL,'2025-02-26 19:03:03','2025-02-26 19:03:03',2402000,NULL,4,'2025-02-23 15:12:23','2025-02-26 12:03:03',NULL,NULL,NULL),('HDe7418078','HD414830','pg004',NULL,NULL,1,'huy','0123456678',NULL,'Địa chỉ 2, Phường Phường Văn Miếu - Quốc Tử Giám, Quận Quận Đống Đa, Thành phố Hà Nội',NULL,'2025-02-04 16:41:55',NULL,3500000,'',3,'2025-01-31 03:05:51','2025-03-06 09:13:30','anonymousUser','anonymousUser',NULL),('HDf1933505','HD851023',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,2202000,NULL,1,'2025-03-18 11:49:20',NULL,NULL,NULL,0.00),('HDf26313a7','HD474392','d488786c-066c-4902-b38d-e28f87d9d680','fe41eeb2-d332-41b3-9e1d-a8beeba88015',NULL,3,'Tôi Vẫn Là Huy','0367894512','huysky124w@gmail.com','null, Má Lé, Đồng Văn, Hà Giang',NULL,NULL,NULL,198868,NULL,3,'2025-03-07 08:40:35','2025-03-10 13:27:56',NULL,NULL,NULL),('HDf7e437de','HD971189',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,6,'2025-03-16 10:55:00','2025-03-16 10:55:08',NULL,NULL,NULL),('HDfe093f9f','HD389878','d488786c-066c-4902-b38d-e28f87d9d680',NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,'2025-03-06 14:51:16','2025-03-06 14:51:16',208868,NULL,4,'2025-03-02 10:28:57','2025-03-06 07:51:16',NULL,NULL,NULL);
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
INSERT INTO `hoa_don_chi_tiet` VALUES ('00402df2-78a6-47de-9e48-f1c1451b035e','HDd8fdb2bd','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f',2,NULL,1,'2025-02-28 13:54:34','2025-02-28 13:55:19',NULL,NULL),('034eda44-bbc1-4950-94f8-3d8889b16b0a','HD8f29f680','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 14:02:10',NULL,NULL,NULL),('03a6b98e-e13a-4b08-a852-c26576e94e13','HD002','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',2,NULL,1,'2025-02-21 07:50:25','2025-02-23 11:12:37',NULL,NULL),('08c10344-b263-430b-beac-c245c825669b','HDdfbfeba9','02195fe8-3498-469c-be33-c049732f0727',3,NULL,1,'2025-03-02 10:23:04','2025-03-02 10:23:47',NULL,NULL),('09d1f220-0605-4ade-855a-68f7773daa49','HDa84e1fb9','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-28 13:31:16',NULL,NULL,NULL),('0a7e48c4-493b-4f01-9079-fdcfe41ebdc1','HDb6f72984','4d2974ea-b76d-45a5-b52d-5f170e8896aa',3,NULL,1,'2025-03-02 10:28:34','2025-03-02 10:29:54',NULL,NULL),('0b348d7a-84e4-4c8d-80a5-7d6ca64678b2','HD8f29f680','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 14:01:20',NULL,NULL,NULL),('0bb4ade4-caaa-4e42-9e29-9fbe69a9537f','HD3b89c1f0','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 13:33:29',NULL,NULL,NULL),('0bb9d8a0-dfd3-44e0-a349-28fb260ba258','HD93d2ec66','7c4314be-981f-49ff-be52-4989f01dc7ac',2,NULL,1,'2025-03-17 22:36:38','2025-03-18 00:12:01',NULL,NULL),('0bee60a8-7172-4d0d-9fff-2253c282db1c','HDb6f72984','8830c9ed-39f8-4241-b548-9de74405deac',18,NULL,1,'2025-03-02 10:28:35','2025-03-02 10:30:42',NULL,NULL),('0d3f7397-bcd6-4d0e-a244-94f26ad8e98f','HD1eec3b4e','14e83f96-ee63-4ca6-bd1a-648de9991c47',2,NULL,1,'2025-03-14 06:24:18','2025-03-14 06:24:48',NULL,NULL),('0d6aebb8-c6e0-4bb5-bec7-9630b6d98111','HD28242b11','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-03-16 09:41:00',NULL,NULL,NULL),('0e73a369-16ba-4e9b-b547-bef1b016b532','HDa84e1fb9','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-28 13:31:11',NULL,NULL,NULL),('0ea43875-94f0-4e25-acd2-20ef93c3618c','HD3b89c1f0','spct002',1,NULL,1,'2025-02-28 13:33:16',NULL,NULL,NULL),('0f094cd6-46fe-4a81-8165-56fdd0fd665d','HDd8fdb2bd','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-28 13:53:48',NULL,NULL,NULL),('12ac9720-3f2f-4dc3-9589-b7d564dbf2fa','HDd8fdb2bd','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 13:53:53',NULL,NULL,NULL),('1427e7f9-24fb-4b39-84e1-9f3875a96d07','HD285f768d','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-03-16 09:43:15',NULL,NULL,NULL),('145411ef-1110-43a4-a0b3-283962aaf6e7','HD64455cca','3f0a6468-73e0-4f36-b11e-296d7bfaba4d',2,NULL,1,'2025-03-02 10:18:06',NULL,NULL,NULL),('1560cb1b-fc24-4b9a-8aa3-e4d91c459441','HDb6f72984','14e83f96-ee63-4ca6-bd1a-648de9991c47',2,NULL,1,'2025-03-02 10:28:33','2025-03-05 06:17:00',NULL,NULL),('1591d15a-5d48-4305-93c4-ea718a8f49ab','HDacbb19d2','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 15:24:22',NULL,NULL,NULL),('18f655d6-aaf7-45c0-85f9-c425aba5442d','HDd8fdb2bd','f8729c3a-2215-47c2-931e-b177cb871007',1,NULL,1,'2025-02-28 13:54:30',NULL,NULL,NULL),('1a36315b-9177-4a25-bd45-0aa97dfb0a24','HD64455cca','4b39ae1a-9379-47e9-8c80-0f5672f46c10',2,NULL,1,'2025-03-02 10:18:09',NULL,NULL,NULL),('1a3a5347-ce39-4f23-a1aa-be13d31d724c','HD41acc685','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',10,NULL,1,'2025-02-27 16:04:21','2025-02-28 06:16:05',NULL,NULL),('1f0efc85-3253-453d-9552-64ee52b94d13','HDa84e1fb9','b7253bf1-88d0-4110-81a2-a52ef6022307',1,NULL,1,'2025-02-28 13:29:46',NULL,NULL,NULL),('1f556792-a7ed-4268-8767-e801a8bfe662','HDd8fdb2bd','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 13:54:29',NULL,NULL,NULL),('1fc6a321-0029-4e50-9e1b-3020be221e53','HDf26313a7','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-03-10 13:27:41',NULL,NULL,NULL),('20d27924-67a3-45d2-9051-0bd28e4d799e','HDa84e1fb9','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 13:31:19',NULL,NULL,NULL),('216dece0-dff6-4775-98b5-a0e24c3dfbda','HD7e191e53','6639faec-b397-41c3-81fb-783dff594545',1,NULL,1,'2025-02-28 13:32:39',NULL,NULL,NULL),('22bf173d-21f6-489c-afce-8d93784b6b06','cd70d2c1-a6ff-4267-961d-cda03f904de6','4d2974ea-b76d-45a5-b52d-5f170e8896aa',1,NULL,1,'2025-03-18 08:02:55',NULL,NULL,NULL),('23174d76-6a16-431e-9e76-1009fb3a8287','HDa741cc7c','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 08:42:14',NULL,NULL,NULL),('23629963-9456-400c-b92b-ceb3164c5d8b','578beb89-652b-443f-8c2d-e158b24c7cf4','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',2,NULL,1,'2025-03-18 08:25:48','2025-03-18 10:44:20',NULL,NULL),('237f02c4-141c-41d5-8e60-277b1c9a6aa2','HD3b89c1f0','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 13:33:15',NULL,NULL,NULL),('24b1c553-d17a-498f-b934-1dd0b776d8c7','HDa84e1fb9','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 13:31:17',NULL,NULL,NULL),('25f154f2-eb90-4e8b-bb45-c90c1e00f77f','HD309ed755','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-03-16 13:51:24',NULL,NULL,NULL),('26fee0fe-8125-4da5-9f57-21d338194ac7','HDd8fdb2bd','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5',1,NULL,1,'2025-02-28 13:54:30',NULL,NULL,NULL),('27fa7be2-7425-42a6-9246-1c26af28af69','HD45fb10bf','2426993d-01a0-4bdc-9ff5-4995b4f361ea',2,NULL,1,'2025-02-23 15:02:59','2025-02-23 15:03:09',NULL,NULL),('29bee14e-6c5f-440b-a302-9cd9ad17dd04','HDd8fdb2bd','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 13:53:52',NULL,NULL,NULL),('2adbfbdb-cb4b-49fe-ac64-12dcae5a9929','HDd8fdb2bd','85a4aefa-83a4-470f-bd2c-fa0545b0adac',1,NULL,1,'2025-02-28 13:54:33',NULL,NULL,NULL),('2b12437d-0d79-41c2-980f-cfe810aaf31b','HD002','061840ea-05d1-489a-af6c-291003491202',5,NULL,1,'2025-02-21 09:43:58','2025-02-23 11:12:39',NULL,NULL),('2c151ccd-2650-47d0-b381-0e86c9db6a1b','HD3b89c1f0','4665b3b1-fe89-4779-be2b-9d05ed246e5b',1,NULL,1,'2025-02-28 13:33:27',NULL,NULL,NULL),('2c6ec70b-9d4d-4786-9c33-82748996261a','HD8f29f680','d1d9a7ad-a833-4347-9a7c-0544aad45374',1,NULL,1,'2025-02-28 14:01:46',NULL,NULL,NULL),('2d7ec365-ba3c-4662-ac5c-6c52b3291585','HDa84e1fb9','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 13:31:12',NULL,NULL,NULL),('2e68397f-445f-4668-8ec9-bc2cdd00c0a3','HD7e191e53','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 13:32:38',NULL,NULL,NULL),('2ef0b332-99e3-4c5f-b64b-580bc290760a','HDacbb19d2','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 15:24:52',NULL,NULL,NULL),('2f044ed0-a074-44f8-a5f9-80d84eccf328','HD59e9d6b8','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',3,NULL,1,'2025-02-26 12:25:04',NULL,NULL,NULL),('3002d4b6-ed52-4277-b4bb-b88fe800e3fa','HD7be78062','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-03-16 09:32:59',NULL,NULL,NULL),('303d5186-727d-4b6c-aed6-55f7080df8e1','HD7e191e53','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 10:29:50',NULL,NULL,NULL),('32d1bfd1-5b34-4114-9b84-b1c0e2afe0be','HD25a3e460','061840ea-05d1-489a-af6c-291003491202',5,NULL,1,'2025-03-14 17:02:01','2025-03-15 10:03:37',NULL,NULL),('338beba0-8ebc-4e01-ad85-f0e3bfa3712a','HDb6f72984','3be0daee-846d-473b-9fee-2e7a29e91552',1,NULL,1,'2025-03-02 10:28:32',NULL,NULL,NULL),('35657519-de69-4966-91ec-1816f4c1f51b','HD173d12a5','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 15:28:29',NULL,NULL,NULL),('37291736-efb8-4354-812a-23ce723808ea','HD3b89c1f0','6639faec-b397-41c3-81fb-783dff594545',1,NULL,1,'2025-02-28 13:33:27',NULL,NULL,NULL),('3a4887c1-75c5-40ce-848b-fe950b7c7cbb','HDd4f57c39','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-03-14 12:38:58',NULL,NULL,NULL),('3cbe11f0-346e-4348-8949-8d88c44b6296','HD8f29f680','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 14:02:14',NULL,NULL,NULL),('3efa2db9-43e9-4773-9852-c52db36002f7','HDd8fdb2bd','d1d9a7ad-a833-4347-9a7c-0544aad45374',1,NULL,1,'2025-02-28 13:54:30',NULL,NULL,NULL),('40cba008-0a1b-4aaa-93d1-a256e1a80f6c','HD173d12a5','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 15:28:28',NULL,NULL,NULL),('4329e961-dda9-4d40-8eb8-2c75b5a8a81a','HD7e191e53','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 13:32:38',NULL,NULL,NULL),('455529af-7000-4c1b-9a68-38c5a9319ece','HD6ff327b1','02195fe8-3498-469c-be33-c049732f0727',1,NULL,1,'2025-03-18 12:06:12',NULL,NULL,NULL),('4633ab74-c128-44f3-8d29-edae980fafef','HDa84e1fb9','f8729c3a-2215-47c2-931e-b177cb871007',1,NULL,1,'2025-02-28 13:29:46',NULL,NULL,NULL),('49ab04e0-dd9b-473c-b3b0-0258be8e6024','HDacbb19d2','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f',1,NULL,1,'2025-02-28 15:25:10',NULL,NULL,NULL),('4bf25f25-8fca-4fad-b4bc-4a5c6a682f2d','HD6ff327b1','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-03-18 12:06:12',NULL,NULL,NULL),('4c8536a4-faa8-4ba4-94da-57a1fcd78b30','HD002','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',6,NULL,1,'2025-02-21 16:37:29','2025-02-23 11:12:40',NULL,NULL),('4e25c569-9996-408f-b780-5889ade1c701','HDd8fdb2bd','4665b3b1-fe89-4779-be2b-9d05ed246e5b',1,NULL,1,'2025-02-28 13:54:25',NULL,NULL,NULL),('50182e6c-1630-4386-bc92-0b10046b3ec3','HDb6f72984','197d0db4-9d0e-4708-9610-4d21726cdf05',1,NULL,1,'2025-03-02 10:28:31',NULL,NULL,NULL),('526d9c0a-5d8d-429b-b5c9-5708bacc4516','578beb89-652b-443f-8c2d-e158b24c7cf4','4d2974ea-b76d-45a5-b52d-5f170e8896aa',5,NULL,1,'2025-03-18 08:25:47','2025-03-18 10:52:13',NULL,NULL),('53fdff27-912b-451c-b876-46738acb63f3','HD8f29f680','70835a28-7019-4c1c-a2ed-f2a009b4ece9',1,NULL,1,'2025-02-28 14:01:54',NULL,NULL,NULL),('547f0d9f-6c25-466c-ae62-8364926cde42','HDd8fdb2bd','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18',1,NULL,1,'2025-02-28 13:54:31',NULL,NULL,NULL),('54cc4a54-4363-494c-a6e9-684380482ff3','HDa56d3c70','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 15:08:03',NULL,NULL,NULL),('551eaa9c-d471-496b-94eb-236ba2f56a37','HD6ff327b1','14e83f96-ee63-4ca6-bd1a-648de9991c47',1,NULL,1,'2025-03-18 12:06:12',NULL,NULL,NULL),('55f40095-ef6e-4a2f-82fb-0b1d47f53de4','HDfe093f9f','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-03-06 07:50:55',NULL,NULL,NULL),('575638da-0a4f-42bf-a6db-e02c54e69e44','HDe72eb948','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',2,NULL,1,'2025-02-23 15:18:57','2025-02-23 15:22:14',NULL,NULL),('582dd46c-7dbb-470d-bd10-d04d5eaf8ccf','HD45fb10bf','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',2,NULL,1,'2025-02-23 11:13:00','2025-02-23 15:02:52',NULL,NULL),('5aec8c76-f6db-4d6a-b68b-c1681ce765e8','HD93d2ec66','2426993d-01a0-4bdc-9ff5-4995b4f361ea',4,NULL,1,'2025-03-17 22:40:54','2025-03-17 23:44:13',NULL,NULL),('5b973341-a6ab-44aa-9250-e1e810e62bb8','HD29337792','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-03-01 15:03:50','2025-03-01 15:18:29',NULL,NULL),('5f2ad803-1c8b-45ed-b51b-8ccdcc924905','HDa741cc7c','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 08:42:13',NULL,NULL,NULL),('6056f527-7119-40a1-92fb-95b4afb76009','HD8f29f680','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-28 14:01:16',NULL,NULL,NULL),('63becba4-7268-43aa-80c9-fb01186555dc','HD3b89c1f0','spct001',1,NULL,1,'2025-02-28 13:33:16',NULL,NULL,NULL),('656bf369-fc70-4ae8-8127-68f93fccebd4','HDacbb19d2','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18',1,NULL,1,'2025-02-28 15:24:57',NULL,NULL,NULL),('657281c4-e73a-42ab-a3c2-fc0a2ad0b2af','HD2344049d','3f92826e-0eea-44f2-ada6-1c581c54694d',8,NULL,1,'2025-02-19 16:32:52','2025-02-26 11:42:54',NULL,NULL),('68ed8981-5245-43d3-9085-be2e9875c9f3','HD1a1186b8','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 15:20:01',NULL,NULL,NULL),('6aa280cf-16bc-417b-b545-35db3f738ec8','HD48547662','061840ea-05d1-489a-af6c-291003491202',26,NULL,1,'2025-03-01 17:42:12','2025-03-01 18:22:12',NULL,NULL),('6ae4eb2e-397f-4ce0-966d-f42b7f958c16','cd70d2c1-a6ff-4267-961d-cda03f904de6','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-03-18 08:02:55',NULL,NULL,NULL),('6b1ddef9-4795-4389-b988-db7146f43a38','HD73e0c1bf','spct001',1,NULL,1,'2025-01-31 13:57:31',NULL,NULL,NULL),('6e34de6f-c84b-4df3-87cf-ac37a1e9dd33','HDacbb19d2','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 15:24:26',NULL,NULL,NULL),('6f326746-ba1e-4891-b8e6-cdab582135b5','HDe7418078','spct001',8,NULL,1,'2025-02-04 08:10:15','2025-02-04 13:25:08',NULL,NULL),('70113060-d45b-46de-a697-e9d2bce507fe','HD2ac53ac8','061840ea-05d1-489a-af6c-291003491202',6,NULL,1,'2025-02-26 12:02:32','2025-02-26 12:02:39',NULL,NULL),('705c8596-e1be-4986-8c17-d138b449b025','HDd8fdb2bd','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 13:54:25',NULL,NULL,NULL),('7594e8a6-3fbf-4f40-a993-e485b4c8c880','cd70d2c1-a6ff-4267-961d-cda03f904de6','4b39ae1a-9379-47e9-8c80-0f5672f46c10',1,NULL,1,'2025-03-18 08:02:55',NULL,NULL,NULL),('7759a285-2c3e-4c16-9cf0-8fa042e6c557','HD4fbec467','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 15:18:59',NULL,NULL,NULL),('7c82ced7-4aab-494a-9743-313bebe8bae6','HD6ff327b1','197d0db4-9d0e-4708-9610-4d21726cdf05',1,NULL,1,'2025-03-18 12:06:12',NULL,NULL,NULL),('7f536537-022e-46b4-b224-a014d878586b','HDd8fdb2bd','7c4314be-981f-49ff-be52-4989f01dc7ac',1,NULL,1,'2025-02-28 13:54:32',NULL,NULL,NULL),('7fb36d8d-cde8-4d38-9f18-e242f4fec7c4','HD002','2426993d-01a0-4bdc-9ff5-4995b4f361ea',2,NULL,1,'2025-02-23 15:03:36','2025-02-23 15:03:52',NULL,NULL),('7fff8806-5f26-4d9a-a3f5-74a742d92eab','HD7e191e53','4665b3b1-fe89-4779-be2b-9d05ed246e5b',1,NULL,1,'2025-02-28 13:32:38',NULL,NULL,NULL),('80cff0f3-c4d9-421b-85a4-851c05f06a6b','HDd8fdb2bd','c0bfcac5-08dc-4557-b9ed-1bc45b64be63',1,NULL,1,'2025-02-28 13:54:30',NULL,NULL,NULL),('819cfbe3-490a-4d80-9646-8141606344d2','HDb6f72984','3f0a6468-73e0-4f36-b11e-296d7bfaba4d',1,NULL,1,'2025-03-02 10:28:31',NULL,NULL,NULL),('81e228df-42df-4ab4-92b8-dde6936b07f0','HD4fbec467','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 15:19:00',NULL,NULL,NULL),('83274163-2e0c-43e8-9d88-dae0736e36d4','HD6bd2ffb9','02195fe8-3498-469c-be33-c049732f0727',1,NULL,1,'2025-03-16 01:15:14',NULL,NULL,NULL),('85f4ac54-3c75-4fcb-8a7b-e137467e339b','HDa84e1fb9','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5',1,NULL,1,'2025-02-28 13:29:46',NULL,NULL,NULL),('87705c6b-c6b1-4e37-abd7-3529bbf9648e','HDd8fdb2bd','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 13:53:50',NULL,NULL,NULL),('8955e794-385a-405c-8ef1-3f62794ea0b5','HD002','spct001',2,NULL,1,'2025-02-22 17:09:02','2025-02-23 15:04:29',NULL,NULL),('89cc4013-5496-48d8-8a76-eab8c2d7fa1f','HD8f29f680','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 14:02:12',NULL,NULL,NULL),('8bdd5a58-0a3a-4442-be81-a3a49c54c275','HDacbb19d2','70835a28-7019-4c1c-a2ed-f2a009b4ece9',1,NULL,1,'2025-02-28 15:24:28',NULL,NULL,NULL),('8c30c76e-7c11-4f93-9c7b-4b5a0aa1b5db','HDa84e1fb9','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 13:31:09',NULL,NULL,NULL),('8c7e45af-9777-4338-9475-9a4f11049085','HD3b89c1f0','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 13:33:27',NULL,NULL,NULL),('8ebe5360-1c51-47ee-b07b-5c6e334127f8','HDb6f72984','9484808d-6bf1-43a7-804a-f9987b3b8f7b',1,NULL,1,'2025-03-02 10:28:36',NULL,NULL,NULL),('9083c684-3162-4514-a2e8-3f685cd311ee','HD6ab6ed2c','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',8,NULL,1,'2025-02-26 12:25:46','2025-02-28 07:50:43',NULL,NULL),('928e4823-3f18-4607-90f9-1ca759767461','HD027c4671','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 15:29:43',NULL,NULL,NULL),('940bf56e-8677-4675-a5c6-a92ab621e95e','HD3b89c1f0','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 13:33:16',NULL,NULL,NULL),('94f2fc4b-9189-4437-b253-74d38cb54ca7','HD7491b506','061840ea-05d1-489a-af6c-291003491202',9,NULL,1,'2025-02-26 12:09:56','2025-02-28 07:01:57',NULL,NULL),('9535dd90-326b-49f7-a0d9-193a557f5c10','HDdfbfeba9','4b39ae1a-9379-47e9-8c80-0f5672f46c10',1,NULL,1,'2025-03-02 10:23:07',NULL,NULL,NULL),('96ef0c61-7e39-4aa7-b9e7-8cf73b17feff','HD1a1186b8','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 15:20:00',NULL,NULL,NULL),('97b65738-946d-4b47-b5c7-3ab1c4fc739f','HD7e191e53','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-28 10:29:37',NULL,NULL,NULL),('982e29d9-9b45-4f2c-9e67-0c12c1193331','HD6ff327b1','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-03-18 12:06:12',NULL,NULL,NULL),('99c18f8d-5383-486e-aafc-b92e8c966c80','HD002','3f92826e-0eea-44f2-ada6-1c581c54694d',7,NULL,1,'2025-02-21 16:52:44','2025-02-23 15:03:59',NULL,NULL),('9a24f130-017e-4ba4-842b-6dfed820141e','HD3b89c1f0','464b2463-2fbe-4207-a7fb-d50357a66174',1,NULL,1,'2025-02-28 13:33:28',NULL,NULL,NULL),('9ab335e2-556f-4bd5-be4b-e44ffe5c8c93','HDbc1be37e','spct001',6,NULL,1,'2025-02-08 14:49:24','2025-02-12 09:39:01',NULL,NULL),('9ade1eb7-e318-4164-8846-cf821b0cb87d','HD6ab6ed2c','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',4,NULL,1,'2025-02-27 07:09:55','2025-02-28 07:50:37',NULL,NULL),('9af2fb1a-21b3-41c6-bf19-f811debc6a4f','HD8f29f680','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-28 14:01:18',NULL,NULL,NULL),('9e81e79d-e0f8-42aa-9e98-da21ccbd6a99','HD027c4671','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 15:29:44',NULL,NULL,NULL),('a310cf3d-a91b-4288-a0cd-f3c35e588114','HD853c93ee','061840ea-05d1-489a-af6c-291003491202',5,NULL,1,'2025-03-02 07:10:21','2025-03-02 07:29:51',NULL,NULL),('a32b51ec-9b46-48ae-9ff7-ec043f4f7cc4','HDd8fdb2bd','6639faec-b397-41c3-81fb-783dff594545',1,NULL,1,'2025-02-28 13:54:28',NULL,NULL,NULL),('a652f2e0-2ccc-4982-8869-a813000bf987','HDa741cc7c','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-28 08:32:09',NULL,NULL,NULL),('a87b6e30-5dd5-4c1b-ada9-23145500efc1','HD1a1186b8','6d33cd1f-1498-4d8b-a45f-bada5c19452a',1,NULL,1,'2025-02-28 15:20:02',NULL,NULL,NULL),('a8ab1897-712f-4c59-863c-5c2023374874','HD8f29f680','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 14:01:17',NULL,NULL,NULL),('aa4da727-4810-4edf-b822-d37752c59bdf','HD3b89c1f0','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 13:33:17',NULL,NULL,NULL),('ac4773cf-82a0-43fe-b1d3-93aa62f1fe47','HD664a9695','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',7,NULL,1,'2025-02-19 16:33:49','2025-02-23 16:20:46',NULL,NULL),('ae0e1d37-2106-4a10-97ab-7ba853705886','HDa56d3c70','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-28 15:08:04',NULL,NULL,NULL),('b110b1a9-688b-4a81-ad53-de03c1ac255c','HDdfbfeba9','3f0a6468-73e0-4f36-b11e-296d7bfaba4d',1,NULL,1,'2025-03-02 10:23:10',NULL,NULL,NULL),('b16ec3af-d886-4a92-acb9-5fc04811cea1','HDa84e1fb9','6639faec-b397-41c3-81fb-783dff594545',1,NULL,1,'2025-02-28 13:31:17',NULL,NULL,NULL),('b1a01e48-0921-4d75-9942-45c6bb0b9429','HD7e191e53','spct001',1,NULL,1,'2025-02-28 13:32:38',NULL,NULL,NULL),('b25692ed-49ff-4f21-9fb0-029e0cf2c2ee','HDacbb19d2','7c4314be-981f-49ff-be52-4989f01dc7ac',1,NULL,1,'2025-02-28 15:24:59',NULL,NULL,NULL),('b2dba34a-c908-4c24-afab-fd6676eb2847','HDf26313a7','02195fe8-3498-469c-be33-c049732f0727',1,NULL,1,'2025-03-10 13:27:41',NULL,NULL,NULL),('b4433e04-caf8-47e2-9c93-b9cb35115927','HD29337792','6d33cd1f-1498-4d8b-a45f-bada5c19452a',12,NULL,1,'2025-03-01 15:03:52','2025-03-01 15:20:46',NULL,NULL),('b9688435-d1e5-4bf4-8225-3b333387c6bc','HD4fbec467','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',2,NULL,1,'2025-02-28 15:18:59','2025-02-28 15:19:08',NULL,NULL),('bc2c0a21-7749-4537-979f-c6e84e987d9a','HDcd6e3cb9','061840ea-05d1-489a-af6c-291003491202',2,NULL,1,'2025-03-07 06:30:22','2025-03-12 18:51:13',NULL,NULL),('bc690fe4-dee0-4b75-8b90-59682ed4a176','HD3b89c1f0','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-02-28 13:33:16',NULL,NULL,NULL),('bc999704-24d1-49b2-93b8-5bfd6e1c72d7','HD4fbec467','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 15:18:57',NULL,NULL,NULL),('bd22c113-4d7c-4968-abbb-404ed02b1137','HD1a1186b8','6639faec-b397-41c3-81fb-783dff594545',1,NULL,1,'2025-02-28 15:20:01',NULL,NULL,NULL),('bd9d414b-c7f9-4980-bdaa-8370f0af7ea5','HD8a5cf5e8','2426993d-01a0-4bdc-9ff5-4995b4f361ea',2,NULL,1,'2025-03-02 09:25:42','2025-03-02 10:33:18',NULL,NULL),('bf225713-6762-4b0f-a393-583432f2ae38','HDa84e1fb9','d1d9a7ad-a833-4347-9a7c-0544aad45374',1,NULL,1,'2025-02-28 13:29:46',NULL,NULL,NULL),('c1a5e10a-bd14-4cae-b858-b21fc7123085','HDe72eb948','061840ea-05d1-489a-af6c-291003491202',2,NULL,1,'2025-02-23 15:17:32','2025-02-23 15:22:12',NULL,NULL),('c1a671f3-9d17-4e95-b02c-681d1cb0ce1b','HDb6f72984','3ccc7099-66c9-4ee4-ba35-06a25371bde8',1,NULL,1,'2025-03-02 10:28:33',NULL,NULL,NULL),('c1f66e2e-ff9d-4e66-a82f-9db8842873d3','6a62761e-2e52-4a37-b5c0-984cd9bfc966','4d2974ea-b76d-45a5-b52d-5f170e8896aa',2,NULL,1,'2025-03-18 04:52:44',NULL,NULL,NULL),('c891d8c5-750b-4094-8b42-a08b2c660dcf','HDbc1be37e','spct002',5,NULL,1,'2025-02-09 08:35:25','2025-02-12 09:39:22',NULL,NULL),('c8ba0841-d8a1-48a0-bd64-7587a6afb2d7','HDd8fdb2bd','spct002',1,NULL,1,'2025-02-28 13:54:29',NULL,NULL,NULL),('c8ea34ca-7da5-489b-a78d-85ee3e49cd13','HDd8fdb2bd','b7253bf1-88d0-4110-81a2-a52ef6022307',1,NULL,1,'2025-02-28 13:54:30',NULL,NULL,NULL),('c9296f7f-51ae-436b-a9c1-a2095235cc32','HDf1933505','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',1,NULL,1,'2025-03-18 12:01:44',NULL,NULL,NULL),('c94dcdc0-654f-4593-b5a0-50ada730d650','HD5eb22013','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',2,NULL,1,'2025-03-17 16:04:33','2025-03-17 16:55:47',NULL,NULL),('ca00345b-0c51-4e89-949a-236f8974d624','HD8071caf0','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',2,NULL,1,'2025-02-26 12:22:53','2025-02-26 12:22:56',NULL,NULL),('cab4f9cf-c18b-4a2f-a4bc-f5c790cc5db3','HDfe093f9f','02195fe8-3498-469c-be33-c049732f0727',11,NULL,1,'2025-03-06 04:13:44','2025-03-06 07:50:42',NULL,NULL),('cbc76b33-e836-4b90-a488-278666347005','HDe1084271','061840ea-05d1-489a-af6c-291003491202',10,NULL,1,'2025-02-22 16:56:12','2025-02-27 16:44:48',NULL,NULL),('cd789bc7-da63-4d3a-b16c-768d08d4d745','HDacbb19d2','85a4aefa-83a4-470f-bd2c-fa0545b0adac',2,NULL,1,'2025-02-28 15:25:00','2025-02-28 15:26:27',NULL,NULL),('cdf9f7f6-21e7-43b6-b5ca-734b50835490','HD8f29f680','3f92826e-0eea-44f2-ada6-1c581c54694d',1,NULL,1,'2025-02-28 14:01:16',NULL,NULL,NULL),('cf9c9508-5a23-4d23-9d3a-eca6ffe265ac','HD8f29f680','spct001',1,NULL,1,'2025-02-28 14:01:46',NULL,NULL,NULL),('d0f656ec-79e3-45d3-9124-3312ae053748','HD29337792','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-03-01 14:42:08',NULL,NULL,NULL),('d19331a5-4675-401e-8928-ea89bd64475a','HDb6f72984','4b39ae1a-9379-47e9-8c80-0f5672f46c10',1,NULL,1,'2025-03-02 10:28:34',NULL,NULL,NULL),('d2adf705-5b17-452f-a593-53f649205d5a','HD8f29f680','6639faec-b397-41c3-81fb-783dff594545',1,NULL,1,'2025-02-28 14:02:13',NULL,NULL,NULL),('d2bd0ba4-6eea-4ab3-a1ca-458f0b29fb25','HDd8fdb2bd','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 13:54:23',NULL,NULL,NULL),('d2fc03be-de3c-4bb5-9b1f-096a3ca6b43a','HD853c93ee','2426993d-01a0-4bdc-9ff5-4995b4f361ea',4,NULL,1,'2025-03-02 07:13:33','2025-03-02 07:29:09',NULL,NULL),('d312e322-7888-433e-951f-d9bbbe9b0328','HD7e191e53','4393ee6d-f0ea-4e1d-a0f0-636c957b8165',1,NULL,1,'2025-02-28 10:29:50',NULL,NULL,NULL),('d4913560-4ebc-494c-81b6-02c1f097083c','HD8a5cf5e8','3f92826e-0eea-44f2-ada6-1c581c54694d',6,NULL,1,'2025-03-02 09:25:44','2025-03-10 15:29:57',NULL,NULL),('d4ecf201-af4a-42ad-b4a6-45e0aa51a31e','HDa84e1fb9','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 13:31:14',NULL,NULL,NULL),('d78659e0-50f8-4bf6-b8d1-6bda390c727b','HDa84e1fb9','4665b3b1-fe89-4779-be2b-9d05ed246e5b',1,NULL,1,'2025-02-28 13:31:19',NULL,NULL,NULL),('dac24657-31ea-4cc5-804a-4e0639a87527','HD7e191e53','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 13:32:38',NULL,NULL,NULL),('e253459d-9efb-4dfd-a494-bd624f62a884','HD73e0c1bf','spct002',1,NULL,1,'2025-01-31 13:57:32',NULL,NULL,NULL),('e2a788ce-1fae-412e-a527-b3a24f2a5d9a','HD29337792','12a77fc0-f2dd-4fb5-8fa6-4debddb62249',10,NULL,1,'2025-03-01 14:40:33','2025-03-01 15:03:03',NULL,NULL),('eb1530a7-21d9-4c79-b721-c5c7e23df819','HD4fbec467','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-28 15:19:00',NULL,NULL,NULL),('ec466cda-1581-412b-bf30-e5d382e81959','HD8f29f680','spct002',1,NULL,1,'2025-02-28 14:01:57',NULL,NULL,NULL),('ec78b515-7dd6-4127-8df1-f4421ca8144b','HDa741cc7c','061840ea-05d1-489a-af6c-291003491202',1,NULL,1,'2025-02-28 08:42:08',NULL,NULL,NULL),('ed9b0da4-be8b-4516-ab93-6bc8e2a2a845','HDa84e1fb9','c0bfcac5-08dc-4557-b9ed-1bc45b64be63',1,NULL,1,'2025-02-28 13:29:46',NULL,NULL,NULL),('eeb190db-950b-4915-a3dc-4318338ed1ed','HDa84e1fb9','4610617a-7c4c-4b55-98d8-3d7b617a7a7b',1,NULL,1,'2025-02-28 13:31:10',NULL,NULL,NULL),('ef4e66e0-d4eb-4c5b-93bc-1d276ba2357e','HDf1933505','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-03-18 12:02:16',NULL,NULL,NULL),('efb6906d-6467-469d-a51c-368a827fa55d','HD3b89c1f0','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-28 13:33:16',NULL,NULL,NULL),('f068e385-4bd8-42c5-a64b-55e90184a775','HDdfbfeba9','9484808d-6bf1-43a7-804a-f9987b3b8f7b',1,NULL,1,'2025-03-02 10:23:08',NULL,NULL,NULL),('f1379de9-27e5-401c-9ce8-5a29579de29b','HDe72eb948','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-23 15:22:17',NULL,NULL,NULL),('f2054e16-68c3-470c-9e76-424946da993e','578beb89-652b-443f-8c2d-e158b24c7cf4','spct002',1,NULL,1,'2025-03-18 10:51:17',NULL,NULL,NULL),('f22b20a1-f5de-4555-b56f-628f1d357144','HDd8fdb2bd','spct001',1,NULL,1,'2025-02-28 13:54:29',NULL,NULL,NULL),('f54089b4-c822-4921-b5fc-3d3c858df439','HDb6f72984','02195fe8-3498-469c-be33-c049732f0727',1,NULL,1,'2025-03-02 10:28:34',NULL,NULL,NULL),('f563ae73-5f92-42d1-8073-9bfbd0d0dbf1','6a62761e-2e52-4a37-b5c0-984cd9bfc966','4b39ae1a-9379-47e9-8c80-0f5672f46c10',1,NULL,1,'2025-03-18 04:52:44',NULL,NULL,NULL),('f90ae34c-2769-4d53-bca8-ba5d1bcc6df3','HD7e191e53','2426993d-01a0-4bdc-9ff5-4995b4f361ea',2,NULL,1,'2025-02-28 10:23:17','2025-02-28 10:29:37',NULL,NULL),('f9487c78-9ca0-4018-a9b1-70447ab7b76d','HD7e191e53','85a4aefa-83a4-470f-bd2c-fa0545b0adac',1,NULL,1,'2025-02-28 10:30:26',NULL,NULL,NULL),('f9b06553-9b65-452b-90aa-002e5b23d4aa','HD8f29f680','4665b3b1-fe89-4779-be2b-9d05ed246e5b',1,NULL,1,'2025-02-28 14:02:12',NULL,NULL,NULL),('fd0466f5-cd78-419b-b331-5b7c4a3930be','HDd8fdb2bd','70835a28-7019-4c1c-a2ed-f2a009b4ece9',1,NULL,1,'2025-02-28 13:54:30',NULL,NULL,NULL),('fdb5185e-228d-4a2e-8948-aee0bb6d1b91','HDd8fdb2bd','2426993d-01a0-4bdc-9ff5-4995b4f361ea',1,NULL,1,'2025-02-28 13:53:51',NULL,NULL,NULL),('fdbfb942-ce5e-45b6-8a1c-be034a448342','578beb89-652b-443f-8c2d-e158b24c7cf4','4b39ae1a-9379-47e9-8c80-0f5672f46c10',1,NULL,1,'2025-03-18 08:25:47',NULL,NULL,NULL),('fe79a370-4a55-4b29-9a0e-bf7440c15929','HD7e191e53','spct002',1,NULL,1,'2025-02-28 13:32:39',NULL,NULL,NULL),('ff1908ca-97fe-4b8c-bdcc-09a760f9efe5','HDdb9a12e6','061840ea-05d1-489a-af6c-291003491202',2,NULL,1,'2025-03-16 09:47:44','2025-03-16 09:47:46',NULL,NULL),('ff51b723-4c1a-4764-acc7-0a9ec76ea9ad','HD45fb10bf','061840ea-05d1-489a-af6c-291003491202',16,NULL,1,'2025-02-19 16:33:45','2025-02-23 15:02:32',NULL,NULL),('ff989a51-abd4-490e-acb6-3c5ea0e674b9','HD64455cca','02195fe8-3498-469c-be33-c049732f0727',1,NULL,1,'2025-03-02 10:18:06',NULL,NULL,NULL);
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
INSERT INTO `hoa_tiet` VALUES ('fa9ec930-859c-4739-a1ae-e6feda1f5fdd','HT1740306527632','kẻ sọc','ok',_binary '','2025-02-23 10:28:48'),('ht01','ht1','hoa hòe','Mô tả cho hoa hòe',_binary '','2025-02-18 19:44:21');
/*!40000 ALTER TABLE `hoa_tiet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invalidate_token`
--

DROP TABLE IF EXISTS `invalidate_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalidate_token` (
  `id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `expiry_time` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invalidate_token`
--

LOCK TABLES `invalidate_token` WRITE;
/*!40000 ALTER TABLE `invalidate_token` DISABLE KEYS */;
INSERT INTO `invalidate_token` VALUES ('1471bf87-dc85-4b33-8d91-59ee745ada53','2025-03-18'),('8c2f5419-de80-417d-8d6b-9fc74a0bdbec','2025-03-18');
/*!40000 ALTER TABLE `invalidate_token` ENABLE KEYS */;
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
INSERT INTO `khach_hang` VALUES ('1206c963-7ae9-4c90-aae4-4e14d697386c','duongn0503','Nguyễn Dương','2025-03-05',NULL,_binary '',_binary '','0368521479','huyhiz12www4@gmail.com','2025-03-14 09:58:51',NULL,NULL,NULL,NULL),('14ec0e49-2bc4-4e85-92c7-e49b8d6591b8','KH05','Hà Nhi','2000-05-08',NULL,_binary '',_binary '\0','0931713354','han@gmail.com','2025-02-16 12:41:04',NULL,NULL,NULL,NULL),('19bad9bf-3305-4593-9116-a3d0035c7b67','duongn0503','Nguyễn Dương','2025-03-05',NULL,_binary '',_binary '','0368521479','huyhiz12www4@gmail.com','2025-03-14 09:58:50',NULL,NULL,NULL,NULL),('39e1768c-dddd-44f8-988a-1e4982ac72d8','KH01','Nguyễn Văn Nam','2004-02-02',NULL,_binary '',_binary '','0931713350','namnv@gmail.com','2025-02-16 12:38:40',NULL,NULL,NULL,NULL),('593eea8a-0f5a-42dd-96aa-ee10bd23e53d','khanhnd1502','Nguyễn Duy Khánh','2022-02-15',NULL,_binary '',_binary '','0921345678','kh@gmail.com','2025-02-23 13:17:46',NULL,NULL,NULL,NULL),('6b2f3473-38f3-4244-ae7a-bd49727fb559','KH04','Hiền Hồ','2000-04-03',NULL,_binary '',_binary '\0','0931713353','hienh@gmail.com','2025-02-16 12:40:28',NULL,NULL,NULL,NULL),('77456e5d-b4a1-4d42-80ea-0dfae9faf04e','nnhn2402','Huy Nguyễn NN','2025-02-24',NULL,_binary '',_binary '','0369785421','huysky1284@gmail.com','2025-03-14 16:21:30',NULL,NULL,NULL,NULL),('7d266d03-612c-42fc-b454-ea4b191589d1','huyn0103','Nguyen Huy','2025-03-01',NULL,_binary '',_binary '','0368262198','huyhiz124@gmail.com','2025-03-02 10:59:12',NULL,NULL,NULL,NULL),('7fcde7f0-bfae-4720-88ea-8c8476ed84a6','thuyduong1705','thuyduong','2004-05-17',NULL,_binary '',_binary '\0','0838560488','thuyduong170524@gmail.com','2025-03-02 10:49:30',NULL,NULL,NULL,NULL),('9a092288-de98-4adf-8c4d-c3e2eda0742d','KH06','Nguyễn Trần Trung Quân','2000-07-06',NULL,_binary '',_binary '','0931713355','quanntt@gmail.com','2025-02-16 12:41:46',NULL,NULL,NULL,NULL),('9e4de171-34d4-4bec-b0a7-b16039150072','huy2402','Huy ','2025-02-24',NULL,_binary '',_binary '','0369852147','huysky12w4@gmail.com','2025-03-08 14:36:24',NULL,NULL,NULL,NULL),('9ec56406-f37f-41f4-bd7f-f6a3c9812282','duongnt1305','Nguyễn Thùy Dương','2020-05-13',NULL,_binary '',_binary '\0','0368262088','abc123a@gmail.com','2025-03-02 11:03:12',NULL,NULL,NULL,NULL),('a1cfa3bb-326b-45f6-889f-3733984a78d0','khanhnd1302','Nguyễn Duy Khánh','2019-02-13',NULL,_binary '',_binary '','0931455667','khanh@gmail.com','2025-02-23 13:23:43',NULL,NULL,NULL,NULL),('a31fce99-b326-46ec-8475-a6e0b4aeaa4a','huytl2801','Tôi Là Huy','2024-01-28',NULL,_binary '',_binary '','0369784512','huysky12ww4@gmail.com','2025-03-08 14:59:34',NULL,NULL,NULL,NULL),('cd1b6180-ef1c-4e42-a186-5545c476487f','huyn2802','Nguyễn Huy','2025-02-28',NULL,_binary '',_binary '','0368262195','khanh2232@gmail.com','2025-03-02 10:59:55',NULL,NULL,NULL,NULL),('cd1c9198-b1ef-47c4-94db-9c0a47da43da','KH02','Nguyễn Duy Khánh','2004-03-04',NULL,_binary '',_binary '','0931713351','khanhnd@gmail.com','2025-02-16 12:39:13',NULL,NULL,NULL,NULL),('cda3521e-7274-458a-bda1-7e99e4cba175','duongnt0812','nguyen thuy duong','2024-12-08',NULL,_binary '',_binary '\0','0901713351','duongthuy@gmail.com','2025-03-02 11:02:14',NULL,NULL,NULL,NULL),('e796493d-4e08-4255-9c67-cc6e4cb9fb46','tunn2302','Nhung Tũn','2025-02-23',NULL,_binary '',_binary '\0','0362541789','dtlf123@gmail.com','2025-03-08 14:47:57',NULL,NULL,NULL,NULL),('edee2726-8fa4-41ab-86bf-9aeb568af418','KH1741339260827',NULL,NULL,NULL,_binary '',NULL,NULL,NULL,'2025-03-07 09:21:01',NULL,NULL,NULL,NULL),('f7d9e619-4cbe-4f64-b160-59a7fc305cb3','KH03','Nông Tiến Thịnh','2004-03-02',NULL,_binary '',_binary '','0931713352','thinhnt@gmail.com','2025-02-16 12:39:48',NULL,NULL,NULL,NULL),('fe41eeb2-d332-41b3-9e1d-a8beeba88011','KH000','Khách lẻ thinh tạo ','2025-03-18',NULL,_binary '',NULL,NULL,NULL,'2025-03-18 04:52:22',NULL,NULL,NULL,NULL),('fe41eeb2-d332-41b3-9e1d-a8beeba88015','huytvl2702','Tôi Vẫn Là Huy','2022-02-27',NULL,_binary '',_binary '','0367894512','huysky124w@gmail.com','2025-03-08 15:09:16',NULL,NULL,NULL,NULL);
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
INSERT INTO `lich_su_hoa_don` VALUES ('HD3e13bb06','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đang giao',3,'2025-02-04 10:05:47','2025-02-04 10:05:47'),('HD5a2d9f21','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 11:08:57','2025-02-04 11:08:57'),('HD65bdeaae','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Cập nhật trạng thái thành: 2',2,'2025-02-04 09:36:38','2025-02-04 09:36:38'),('HD8a079c19','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 11:08:12','2025-02-04 11:08:12'),('HD8c550bbb','HD73e0c1bf',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã giao',4,'2025-02-04 09:57:38','2025-02-04 09:57:38'),('HD9d7ea8fe','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 09:43:06','2025-02-04 09:43:06'),('HDb0d5cb91','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 10:05:34','2025-02-04 10:05:34'),('HDb370ef7c','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đang giao',3,'2025-02-04 09:41:55','2025-02-04 09:41:55'),('HDf2d69a02','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã giao',4,'2025-02-04 10:05:58','2025-02-04 10:05:58'),('LS00c7dbac','HD73e0c1bf',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã hủy',5,'2025-01-31 13:57:27',NULL),('LS028a09ae','HD7be78062',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ xác nhận',1,'2025-03-16 09:33:13',NULL),('LS02bee378','578beb89-652b-443f-8c2d-e158b24c7cf4',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-18 11:08:35',NULL),('LS0451d281','6a62761e-2e52-4a37-b5c0-984cd9bfc966',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-18 11:45:46',NULL),('LS052dee73','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 08:51:24',NULL),('LS094d90db','HD5eb22013',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-17 16:56:13',NULL),('LS12ff6cc4','HDbc615e2b',NULL,NULL,'Hủy hóa đơn','Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi',6,'2025-03-18 12:22:18',NULL),('LS28e76a3d','HDdb9a12e6',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-16 09:47:53',NULL),('LS2fe679e4','HD5eb22013',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-17 16:56:13',NULL),('LS30635a56','HDbc615e2b',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 12:22:11',NULL),('LS34af289c','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-01-25 14:04:37',NULL),('LS3609b6ee','HD93d2ec66',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-17 16:56:21',NULL),('LS38a7447f','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 06:17:44',NULL),('LS38ced59a','HD135e260b',NULL,NULL,'Hủy hóa đơn','Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi',6,'2025-03-18 12:04:58',NULL),('LS3eea6230','HD285f768d',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-16 09:40:12',NULL),('LS412006c4','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 08:56:44',NULL),('LS4304add8','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-01-31 06:18:17',NULL),('LS45bbcb97','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 15:53:28','2025-02-13 15:53:28'),('LS4c3e0215','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 09:15:47',NULL),('LS4fef2ef9','HD18e23cc8',NULL,NULL,'Hủy hóa đơn','Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi',6,'2025-03-16 10:54:53',NULL),('LS5aee63e6','HD7be78062',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-16 09:33:13',NULL),('LS5c2c6fd6','HD7804df0c',NULL,NULL,'Hủy hóa đơn','Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi',6,'2025-03-07 08:26:52',NULL),('LS5d454426','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-05 04:55:23','2025-02-05 04:55:23'),('LS5f6ca5f7','HD18e23cc8',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-16 10:49:16',NULL),('LS6061c4e9','HDdb9a12e6',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-16 09:47:53',NULL),('LS6094f30e','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 06:56:48',NULL),('LS60d1417e','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-01-26 10:22:29',NULL),('LS61d0c76a','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-05 09:22:33','2025-02-05 09:22:33'),('LS6655e9c4','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-05 14:45:32','2025-02-05 14:45:32'),('LS74b88c38','HD393cc498',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 12:22:16',NULL),('LS7c9d970a','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 06:17:35',NULL),('LS7d4eb544','HD285f768d',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-16 09:43:33',NULL),('LS829ca8da','HDf1933505',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 11:49:20',NULL),('LS85d7cd1b','HD6ff327b1',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-18 12:06:48',NULL),('LS87d925b1','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 16:46:43','2025-02-13 16:46:43'),('LS8c201139','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 07:36:34',NULL),('LS8f32062e','HD6ff327b1',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 12:05:01',NULL),('LS9f9fb75d','HD664a9695',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã hủy',5,'2025-02-21 16:47:26','2025-02-21 16:47:26'),('LSa03f4ce3','HD7be78062',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-16 09:33:13',NULL),('LSaa2479dd','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 09:10:37',NULL),('LSb02480d9','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-04 08:51:50',NULL),('LSb1946fe5','HD28242b11',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-16 09:41:10',NULL),('LSb3d02c69','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-13 16:46:34','2025-02-13 16:46:34'),('LSb9fdbc14','HD6ff327b1',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-18 12:06:48',NULL),('LSbbb8cdd2','HD309ed755',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-16 13:51:36',NULL),('LSbc5462cc','HD5eb22013',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-17 10:30:38',NULL),('LSc640fa27','HD6bd2ffb9',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-16 09:31:36',NULL),('LSc951f059','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 16:42:48','2025-02-13 16:42:48'),('LSc9d158cf','HD135e260b',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 11:49:40',NULL),('LScc3656f7','HD28242b11',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-16 09:36:25',NULL),('LSd08bbeea','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-13 16:41:18','2025-02-13 16:41:18'),('LSd0ecff3f','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-13 16:41:08','2025-02-13 16:41:08'),('LSd36100f3','HD971ce3c0',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 12:22:09',NULL),('LSd8e87d60','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ giao hàng',3,'2025-03-06 09:13:30','2025-03-06 09:13:30'),('LSdb146eb0','HD002',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-05 05:00:14','2025-02-05 05:00:14'),('LSde96e73a','HD971ce3c0',NULL,NULL,'Hủy hóa đơn','Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi',6,'2025-03-18 12:22:13',NULL),('LSe237645a','HD6bd2ffb9',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ xác nhận',1,'2025-03-16 09:31:35',NULL),('LSe57f82f6','6a62761e-2e52-4a37-b5c0-984cd9bfc966',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Hoàn thành',5,'2025-03-18 11:45:46',NULL),('LSe5b57278','HD882fa672',NULL,NULL,'Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-18 12:04:52',NULL),('LSe8a758c2','HDbc1be37e',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 06:56:40',NULL),('LSe9942917','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-02-04 09:35:00',NULL),('LSebb55288','HD285f768d',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-16 09:43:33',NULL),('LSee39cece','HDe7418078',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-02-13 16:41:44','2025-02-13 16:41:44'),('LSf267da5e','HD28242b11',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-16 09:41:10',NULL),('LSf969e511','578beb89-652b-443f-8c2d-e158b24c7cf4',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Hoàn thành',5,'2025-03-18 11:08:35',NULL),('LSfa765957','HDf7e437de',NULL,NULL,'Hủy hóa đơn','Hóa đơn bị hủy, sản phẩm đã được hoàn lại kho và mã giảm giá đã được phục hồi',6,'2025-03-16 10:55:08',NULL),('LSfb933870','HD309ed755',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Chờ giao hàng',3,'2025-03-16 13:51:36',NULL),('LSfd27b39f','HD6bd2ffb9',NULL,NULL,'Cập nhật trạng thái hóa đơn','Chuyển trạng thái: Đã xác nhận',2,'2025-03-16 09:31:36',NULL);
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
  `can_cuoc_cong_dan` varchar(45) DEFAULT NULL,
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
INSERT INTO `nhan_vien` VALUES ('1','NV001','Nguyễn Văn Nam','2004-04-03',NULL,_binary '',_binary '','0931713350','vnv@gmail.com','2025-01-19 14:36:25',NULL,NULL,NULL,NULL,NULL,NULL),('5b0b6fa3-b765-4444-aa3e-27fbcab64d32','NV07','Ngô Dương Nghĩa','2004-07-27',NULL,_binary '',_binary '','0931713356','nghiand@gmail.com','2025-02-16 12:45:54',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709911/Banner_faliyk.jpg',NULL),('67d09293-f7ca-43d1-a75e-2f222586c5d8','NV05','Hoàng Ngọc Quân','2000-02-02',NULL,_binary '',_binary '\0','0931713353','quanhn@gmail.com','2025-02-16 12:43:54',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709806/slide3_pjpvuk.webp',NULL),('8c3ede9f-791e-4233-ac60-ac58ef3f6bdf','NV002','Nguyễn Duy Khánh','2000-03-04',NULL,_binary '',_binary '','0368262198','abc@gmail.com','2025-02-14 05:03:57',NULL,NULL,NULL,NULL,NULL,NULL),('95e82544-7123-4aa0-934f-403d19cfdd09','NV03','Nguyễn Văn Nam','2004-08-03',NULL,_binary '',_binary '','0931713352','namnv@gmail.com','2025-02-16 12:43:02',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709749/sp4_uyba5l.jpg',NULL),('a9402ffd-8702-4759-9ddf-f8f09af72b9e','NV04','Nguyễn Duy Khánh','2000-02-12',NULL,_binary '',_binary '','0931713351','khanh@gmail.com','2025-02-16 12:29:27',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739708927/sp6_fr3sfc.png',NULL),('eb6db611-d763-438c-9246-7e6c1823f121','NV007','Nông Tiến Thịnh','2002-03-13',NULL,_binary '',_binary '','0356245557','tienthinhkk@gmail.com','2025-03-08 18:00:26',NULL,NULL,NULL,'123123awdasd','https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739708927/sp6_fr3sfc.png',NULL),('eb6db611-d763-438c-9246-7e6c1823fee4','NV06','Lâm Bảo Ngọc','2000-09-08',NULL,_binary '',_binary '\0','0931713354','ngoclb@gmail.com','2025-02-16 12:44:48',NULL,NULL,NULL,NULL,'https://res.cloudinary.com/dhh5mdeqo/image/upload/v1739709852/Sale_vg284n.webp',NULL);
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
INSERT INTO `phieu_giam_gia` VALUES ('0e272caa-4572-4664-8559-833e552039c5','PGG-48F864DC','Phiếu này Free',1,1,100,1000000,10000000,'2025-03-02 19:00:00','2025-03-10 00:00:00',0,NULL,2,'2025-03-02 11:05:31',NULL,NULL,NULL),('12687483-6de7-4370-8459-282b0ee8fda3','PGG-B5C2DB48','Phiếu giảm giá cho huy',1,1,11,12121,1212,'2025-02-14 10:00:00','2025-03-27 10:00:00',496,'212121',1,'2025-02-14 07:17:02',NULL,NULL,NULL),('13138841-adf4-4eea-8ed0-15fbd2c62bf6','PGG-61577FFC','2',2,1,400000,2000000,500000,'2025-02-10 09:16:53','2025-03-27 17:00:00',0,'Mã giảm giá thứ 4',1,NULL,NULL,NULL,NULL),('2800a5e9-5d1e-455d-9d04-86e07da9093b','PGG-508AF469','12',2,2,50,100000,100000,'2025-02-14 03:00:00','2025-03-27 10:00:00',0,'Mô tả ',1,NULL,NULL,NULL,NULL),('3f68e668-d340-4e86-9132-7b415a19bf69','PGG-F8F6ADDE','Phiếu giảm giá cho thinh',1,1,12,1231,122,'2025-02-14 10:00:00','2025-03-27 10:00:00',0,'213',1,NULL,NULL,NULL,NULL),('b6c16a50-2693-4f96-bf03-05c7b8bc1286','PGG-70F6F0A5','121',1,1,12,2312322,21321,'2025-02-18 10:00:00','2025-03-27 10:00:00',12,'dd',1,NULL,NULL,NULL,NULL),('cd2e955f-fb32-4d6a-bbf8-735ae1f75722','PGG-7D8DF4C6','bsbsb',1,1,12,5000000,1200000,'2025-02-22 22:57:17','2025-03-27 10:00:00',119801,'ko',1,'2025-02-22 15:53:36',NULL,NULL,NULL),('d488786c-066c-4902-b38d-e28f87d9d680','PGG-030F126D','Phiếu giảm giá cho thinh22',1,1,12,22321,2132,'2025-02-14 10:00:00','2025-03-27 10:00:00',244,'ok',1,'2025-02-14 09:07:05',NULL,NULL,NULL),('fa37bee0-e9d9-4876-b5fc-5228f6a94c2b','PGG-450F99D5','we',2,2,12,12000,10000,'2025-02-23 00:00:00','2025-02-24 00:00:00',2,'ko',2,'2025-02-22 15:54:25',NULL,NULL,NULL),('fd4c6eb0-79a4-40bb-8a8e-98a1150b70d1','PGG-632602DC','1234',1,1,100,10000,1999,'2025-02-13 10:00:00','2025-03-27 10:00:00',0,'Mô tả danh cho 1234',1,NULL,NULL,NULL,NULL),('pg001','PG001','10',1,1,10,600000,100000,'2025-01-11 16:16:53','2025-03-27 17:00:00',840,'Mã giảm giá cho sản phẩm 1',1,'2025-01-11 09:16:53',NULL,'admin',NULL),('pg002','PG002','15',1,1,50,3000000,150000,'2025-01-11 09:16:53','2025-03-27 10:00:00',628,'Mã giảm giá cho sản phẩm 2',1,'2025-01-11 09:16:53',NULL,'admin',NULL),('pg003','PG003','89',1,1,45,5000000,450000,'2025-01-11 16:16:53','2025-03-27 17:00:00',788,'Mã giảm giá cho sản phẩm 3',1,'2025-01-31 06:30:07',NULL,NULL,NULL),('pg004','PG004','4',2,2,400000,2000000,500000,'2025-02-10 09:16:53','2025-03-27 17:00:00',333,'Mã giảm giá thứ 4',1,'2025-02-12 09:35:46',NULL,NULL,NULL);
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
INSERT INTO `phieu_giam_gia_khach_hang` VALUES ('507f624b-eb62-43f4-a209-5704f0604bbd','fa37bee0-e9d9-4876-b5fc-5228f6a94c2b','6b2f3473-38f3-4244-ae7a-bd49727fb559',_binary '\0','2025-02-22 15:54:47','2025-02-22 15:54:47','admin',NULL),('66a6793e-f52f-4fdd-8460-57a873b0f8c9','fa37bee0-e9d9-4876-b5fc-5228f6a94c2b','6b2f3473-38f3-4244-ae7a-bd49727fb559',_binary '\0','2025-02-22 15:54:49','2025-02-22 15:54:49','admin',NULL),('b6df7d0c-c9ca-474f-bfc5-e8da702db811','fa37bee0-e9d9-4876-b5fc-5228f6a94c2b','39e1768c-dddd-44f8-988a-1e4982ac72d8',_binary '\0','2025-02-22 15:54:21','2025-02-22 15:54:21',NULL,NULL);
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
  `mo_ta` varchar(255) DEFAULT NULL,
  `trang_thai` bit(1) DEFAULT NULL,
  `ngay_tao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ngay_sua` timestamp NULL DEFAULT NULL,
  `nguoi_tao` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nguoi_sua` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `tong_tien` decimal(15,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_phuong_thuc_thanh_toan` (`ma_phuong_thuc_thanh_toan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phuong_thuc_thanh_toan`
--

LOCK TABLES `phuong_thuc_thanh_toan` WRITE;
/*!40000 ALTER TABLE `phuong_thuc_thanh_toan` DISABLE KEYS */;
INSERT INTO `phuong_thuc_thanh_toan` VALUES ('PTTT001','COD','Thanh toán bằng tiền mặt','Thanh toán trực tiếp với nhân viên',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL,NULL),('PTTT002','BANK','Chuyển khoản ngân hàng','Thanh toán qua tài khoản ngân hàng',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL,NULL);
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
INSERT INTO `san_pham` VALUES ('138f596b-da75-4cc9-b7df-858010e2a1b9','SP1740306970717','thinhok','ok',_binary '','2025-02-23 10:36:11',NULL,NULL,NULL),('34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','SP1740910337984','Nghèo','Không có tiền',_binary '','2025-03-02 10:12:18',NULL,NULL,NULL),('3c3f3c1a-a9a2-4c80-be43-89b118445354','SP1740308841466','áo sơ mi trung tuổi','ok\n',_binary '','2025-02-23 11:07:21',NULL,NULL,NULL),('69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','SP1739506011209','so mi coc tay','abc',_binary '','2025-02-14 04:06:51',NULL,NULL,NULL),('sp001','SP001','Sản phẩm 1','Mô tả sản phẩm 1',_binary '','2025-01-11 09:14:09',NULL,'admin',NULL),('sp002','SP002','Sản phẩm 2','Mô tả sản phẩm 2',_binary '','2025-01-11 09:14:09',NULL,'admin',NULL);
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
INSERT INTO `san_pham_chi_tiet` VALUES ('02195fe8-3498-469c-be33-c049732f0727','SPCT1740910601292',409,'Mô tả cho sản phẩm\n',_binary '',2000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('061840ea-05d1-489a-af6c-291003491202','SPCT1739899844865',22,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('12a77fc0-f2dd-4fb5-8fa6-4debddb62249','SPCT1739899844807',50,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('14e83f96-ee63-4ca6-bd1a-648de9991c47','SPCT1740910601629',40,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('197d0db4-9d0e-4708-9610-4d21726cdf05','SPCT1740910601679',43,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('2426993d-01a0-4bdc-9ff5-4995b4f361ea','SPCT1740308928617',16,NULL,_binary '',2002000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','3c3f3c1a-a9a2-4c80-be43-89b118445354','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 11:08:49'),('3be0daee-846d-473b-9fee-2e7a29e91552','SPCT1740910601804',49,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('3ccc7099-66c9-4ee4-ba35-06a25371bde8','SPCT1740910601869',49,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('3f0a6468-73e0-4f36-b11e-296d7bfaba4d','SPCT1740910600480',496,NULL,_binary '',1000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('3f92826e-0eea-44f2-ada6-1c581c54694d','SPCT1739899844154',18,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('4393ee6d-f0ea-4e1d-a0f0-636c957b8165','SPCT1739523889392',87,'okee',_binary '',100000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('4610617a-7c4c-4b55-98d8-3d7b617a7a7b','SPCT1739519763382',33,'ok',_binary '',100033,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('464b2463-2fbe-4207-a7fb-d50357a66174','SPCT1740308928904',0,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','3c3f3c1a-a9a2-4c80-be43-89b118445354','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 11:08:49'),('4665b3b1-fe89-4779-be2b-9d05ed246e5b','SPCT1740308310396',0,NULL,_binary '',2200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('4b39ae1a-9379-47e9-8c80-0f5672f46c10','SPCT1740910601215',493,NULL,_binary '',1000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('4d2974ea-b76d-45a5-b52d-5f170e8896aa','SPCT1740910601746',41,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('6639faec-b397-41c3-81fb-783dff594545','SPCT1739523889294',0,'okee',_binary '',1000000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('6d33cd1f-1498-4d8b-a45f-bada5c19452a','SPCT1740308310448',28,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('70835a28-7019-4c1c-a2ed-f2a009b4ece9','SPCT1739899844937',46,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18','SPCT1739519763173',47,'ok',_binary '',100000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('7c4314be-981f-49ff-be52-4989f01dc7ac','SPCT1739523888854',95,'okee22',_binary '',1003330,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('85a4aefa-83a4-470f-bd2c-fa0545b0adac','SPCT1740308310144',18,NULL,_binary '',323232,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('8830c9ed-39f8-4241-b548-9de74405deac','SPCT1740910601399',31,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('9484808d-6bf1-43a7-804a-f9987b3b8f7b','SPCT1740910601105',497,NULL,_binary '',1000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('9a014ee3-43fa-48a5-a758-85b8c45faecb','SPCT1740910601486',49,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('ab5258b5-f94f-4869-a2d0-7cd702e3ef5f','SPCT1739519762969',47,'ok',_binary '',100099,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('b7253bf1-88d0-4110-81a2-a52ef6022307','SPCT1739899844899',48,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('c0bfcac5-08dc-4557-b9ed-1bc45b64be63','SPCT1740308310361',21,NULL,_binary '',323232,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('d1d9a7ad-a833-4347-9a7c-0544aad45374','SPCT1739899844829',47,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5','SPCT1739523889343',98,'okee',_binary '',10000000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('e3fe7452-028c-4dc9-9b27-44a07cb01a1a','SPCT1740910601553',50,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('f8729c3a-2215-47c2-931e-b177cb871007','SPCT1739519762419',48,'ok',_binary '',100055,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('spct001','SPCT001',78,'Chi tiết sản phẩm 1',_binary '',500000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('spct002','SPCT002',47,'Chi tiết sản phẩm 2',_binary '',700000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp002','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45');
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
INSERT INTO `tai_khoan` VALUES ('123123awdasd','1','tienthinhkk@gmail.com','$2a$10$UfEGKFMQ4Jh.IxD9R5rQGeCLKzX7u3JR/9eJtd5e7FnZ8cnawS/N6',1,'2025-03-04 09:59:24',NULL),('1233132','3','thinhnongdev@gmail.com','$2a$10$Ggl8r7CfvahoXCV.v0N1c.njVk3SXdLKqXF1J8khHm8R.k4FDRwB6',1,'2025-03-06 06:31:28',NULL),('423432','2','thinhntph44983@fpt.edu.vn','$2a$10$Ggl8r7CfvahoXCV.v0N1c.njVk3SXdLKqXF1J8khHm8R.k4FDRwB6',1,'2025-03-06 06:31:28',NULL);
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
  `tong_tien` decimal(15,2) DEFAULT NULL,
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
INSERT INTO `thanh_toan_hoa_don` VALUES ('0c057edc-431d-43b1-b354-b59c2e860217','HD6ff327b1','PTTT001',NULL,1,'2025-03-18 12:06:48','2025-03-18 12:06:48',NULL,NULL,821789.00),('0c509671-3f0d-4ea5-8cf3-b1dcd3fc206f','cd70d2c1-a6ff-4267-961d-cda03f904de6','PTTT002',NULL,2,'2025-03-18 08:02:55',NULL,NULL,NULL,439901.00),('119dcb16-32c5-43ed-a1d6-caf00980b6ac','HD28242b11','PTTT001',NULL,1,'2025-03-16 09:41:10','2025-03-16 09:41:10',NULL,NULL,365010.00),('148accb7-ef2d-445c-ab23-0921a7b3d4cc','HD7be78062','PTTT001',NULL,1,'2025-03-16 09:33:13','2025-03-16 09:33:13',NULL,NULL,231868.00),('353d31e2-65e5-4914-874b-5bc47010fcb2','HDdb9a12e6','PTTT001',NULL,1,'2025-03-16 09:47:53','2025-03-16 09:47:53',NULL,NULL,429369.00),('43cc38b0-6d5a-441e-b2bf-4761c543c5d5','6a62761e-2e52-4a37-b5c0-984cd9bfc966','PTTT002',NULL,2,'2025-03-18 04:52:43',NULL,NULL,NULL,439901.00),('49d36b83-cf89-41cd-b3a4-df93a63e6b84','HD5eb22013','PTTT001',NULL,1,'2025-03-17 16:56:13','2025-03-17 16:56:13',NULL,NULL,418869.00),('4c8a0e8d-7f2d-466b-9df5-db13bf341baa','HD309ed755','PTTT001',NULL,1,'2025-03-16 13:51:36','2025-03-16 13:51:36',NULL,NULL,231501.00),('5113a552-c267-439e-b80b-f9ae9ea8fe7c','HDcd6e3cb9','PTTT001',NULL,NULL,'2025-03-12 18:51:20',NULL,NULL,NULL,397868.00),('5cb035eb-fa12-4265-9c05-ffcd1496e94d','HD285f768d','PTTT001',NULL,1,'2025-03-16 09:43:33','2025-03-16 09:43:34',NULL,NULL,222010.00),('705d21f6-f360-4b50-a436-7d8a9bd70142','HD6bd2ffb9','PTTT001',NULL,1,'2025-03-16 09:31:35','2025-03-16 09:31:37',NULL,NULL,22001.00),('b6d19afa-db8e-4b6a-a368-21e3cddd13e9','578beb89-652b-443f-8c2d-e158b24c7cf4','PTTT002',NULL,2,'2025-03-18 08:25:47',NULL,NULL,NULL,439901.00),('f28e74d3-9350-4d0d-b687-ae26f9017dbb','6a62761e-2e52-4a37-b5c0-984cd9bfc966','PTTT001',NULL,1,'2025-03-18 11:45:46','2025-03-18 11:45:46',NULL,NULL,500000.00),('fdf6f2d7-555f-443f-82a2-450689faa971','578beb89-652b-443f-8c2d-e158b24c7cf4','PTTT001',NULL,1,'2025-03-18 11:08:35','2025-03-18 11:08:36',NULL,NULL,1800000.00),('HD1eec3b4e_COD','HD1eec3b4e','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-14 06:25:17','2025-03-14 06:25:17',NULL,NULL,397868.00),('HD25a3e460_COD','HD25a3e460','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-15 12:38:45','2025-03-15 12:38:45',NULL,NULL,1000000.00),('HDd4f57c39_COD','HDd4f57c39','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-14 12:39:21','2025-03-14 12:39:21',NULL,NULL,197868.00),('TT0c68ee51','HD59e9d6b8','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:25:07','2025-02-26 12:25:07',NULL,NULL,NULL),('TT0d20fa50','HD2344049d','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 11:43:21','2025-02-26 11:43:21',NULL,NULL,NULL),('TT10da9fb2','HD8071caf0','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:23:12','2025-02-26 12:23:12',NULL,NULL,NULL),('TT16537afe','HD002','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:04:47','2025-02-23 15:04:48',NULL,NULL,NULL),('TT1a18ca89','HDe7418078','PTTT001','Thanh toán trực tiếp với nhân viên giao hàng',1,'2025-01-31 03:05:51',NULL,NULL,NULL,NULL),('TT1b1f0aa7','HD45fb10bf','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:38:25','2025-02-23 15:38:25',NULL,NULL,NULL),('TT2897cad4','HD8f29f680','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 14:02:50','2025-02-28 14:02:50',NULL,NULL,NULL),('TT2deb4272','HD2344049d','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:37:33','2025-02-23 15:37:34',NULL,NULL,NULL),('TT3156e590','HD48547662','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-03-01 18:22:15','2025-03-01 18:22:15',NULL,NULL,NULL),('TT351edd95','HD664a9695','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-23 16:20:54','2025-02-23 16:20:54',NULL,NULL,NULL),('TT3951dd09','HD64455cca','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-03-02 10:19:22','2025-03-02 10:19:22',NULL,NULL,NULL),('TT47ef704c','HD59e9d6b8','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:24:59','2025-02-26 12:24:59',NULL,NULL,NULL),('TT4d0e3f11','HD853c93ee','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-02 07:30:20','2025-03-02 07:30:20',NULL,NULL,NULL),('TT4d40fec5','HD2344049d','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 11:44:26','2025-02-26 11:44:26',NULL,NULL,NULL),('TT543b4122','HD002','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 16:20:23','2025-02-23 16:20:23',NULL,NULL,NULL),('TT5e88ce0e','HDa741cc7c','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 08:43:01','2025-02-28 08:43:01',NULL,NULL,NULL),('TT60f4a8db','HD41acc685','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:37:46','2025-02-23 15:37:46',NULL,NULL,NULL),('TT680f881f','HD45fb10bf','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:45:47','2025-02-23 15:45:47',NULL,NULL,NULL),('TT69717cf9','HD8071caf0','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:23:00','2025-02-26 12:23:00',NULL,NULL,NULL),('TT6c3097d1','HDe1084271','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 08:06:30','2025-02-28 08:06:30',NULL,NULL,NULL),('TT6d9acd82','HDe72eb948','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:41:30','2025-02-23 15:41:30',NULL,NULL,NULL),('TT72b113b7','HD41acc685','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:37:53','2025-02-23 15:37:53',NULL,NULL,NULL),('TT72e7e75f','HD173d12a5','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 15:28:41','2025-02-28 15:28:41',NULL,NULL,NULL),('TT7800e996','HDacbb19d2','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 15:26:47','2025-02-28 15:26:48',NULL,NULL,NULL),('TT7a719b08','HDfe093f9f','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-06 07:51:16','2025-03-06 07:51:16',NULL,NULL,NULL),('TT7cca5f9c','HD7491b506','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 08:04:27','2025-02-28 08:04:27',NULL,NULL,NULL),('TT855cc8cb','HD1a1186b8','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 15:20:15','2025-02-28 15:20:15',NULL,NULL,NULL),('TT86b6058f','HD41acc685','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 08:03:27','2025-02-28 08:03:27',NULL,NULL,NULL),('TT90e4883b','HD027c4671','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 15:30:17','2025-02-28 15:30:17',NULL,NULL,NULL),('TT9212e1e0','HD7e191e53','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 13:32:51','2025-02-28 13:32:51',NULL,NULL,NULL),('TT92c795a4','HD41acc685','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 08:02:57','2025-02-28 08:02:58',NULL,NULL,NULL),('TT953ba2f2','HDb6f72984','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-06 07:39:46','2025-03-06 07:39:46',NULL,NULL,NULL),('TT99a80d3d','HDdfbfeba9','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-03-02 10:24:36','2025-03-02 10:24:36',NULL,NULL,NULL),('TT9aca3e12','HD6ab6ed2c','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 07:55:55','2025-02-28 07:55:55',NULL,NULL,NULL),('TTa0206c18','HD3b89c1f0','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 13:34:12','2025-02-28 13:34:12',NULL,NULL,NULL),('TTadc9563e','HD73e0c1bf','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 16:20:34','2025-02-23 16:20:35',NULL,NULL,NULL),('TTb3295b19','HDa56d3c70','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 15:08:17','2025-02-28 15:08:17',NULL,NULL,NULL),('TTb460af75','HDbc1be37e','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-01-31 06:21:23',NULL,NULL,NULL,NULL),('TTb52ddba6','HD4fbec467','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 15:19:21','2025-02-28 15:19:21',NULL,NULL,NULL),('TTbe88705d','HDe1084271','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-23 15:40:56','2025-02-23 15:40:56',NULL,NULL,NULL),('TTbeba035d','HD8a5cf5e8','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-10 15:33:26','2025-03-10 15:33:26',NULL,NULL,NULL),('TTc7abc791','HD73e0c1bf','PTTT001','Thanh toán trực tiếp với nhân viên giao hàng',1,'2025-01-31 13:57:18',NULL,NULL,NULL,NULL),('TTc95eeda6','HDd8fdb2bd','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-28 13:55:43','2025-02-28 13:55:43',NULL,NULL,NULL),('TTcd3ec2a1','HDf26313a7','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-03-10 13:27:56','2025-03-10 13:27:56',NULL,NULL,NULL),('TTd74f4e79','HD29337792','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-03-01 15:21:37','2025-03-01 15:21:37',NULL,NULL,NULL),('TTec3ecc91','HD2ac53ac8','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:02:49','2025-02-26 12:02:49',NULL,NULL,NULL),('TTf205d698','HD8071caf0','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:23:06','2025-02-26 12:23:06',NULL,NULL,NULL),('TTfc8d04df','HDa84e1fb9','PTTT002','Thanh toán qua tài khoản ngân hàng',2,'2025-02-28 13:31:42','2025-02-28 13:31:42',NULL,NULL,NULL),('TTfe53ceb5','HDe72eb948','PTTT001','Thanh toán trực tiếp với nhân viên',1,'2025-02-26 12:03:03','2025-02-26 12:03:03',NULL,NULL,NULL);
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
INSERT INTO `vai_tro` VALUES ('1','VT001','ADMIN','ok',_binary ''),('2','VT002','NHAN_VIEN','ok',_binary ''),('3','VT003','KHACH_HANG','ok',_binary '');
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

-- Dump completed on 2025-03-18 19:38:46
