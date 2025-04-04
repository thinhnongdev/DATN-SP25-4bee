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
INSERT INTO `anh_san_pham` VALUES ('0147620f-8adb-483c-9047-2560a97e3649','IMG1740308310484','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739041772/Screenshot_2024-02-28_222303_yeueru.png','',_binary '','6d33cd1f-1498-4d8b-a45f-bada5c19452a'),('0167e420-dd02-4bb0-894a-a6fcfd5b8db3','IMG1740910601854','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3be0daee-846d-473b-9fee-2e7a29e91552'),('0fbb8fea-ce5a-4ef5-af91-db7b194948a2','IMG1739899844856','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','d1d9a7ad-a833-4347-9a7c-0544aad45374'),('10a15949-5e8c-435e-a6a4-324765fd7152','IMG1739899844823','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','12a77fc0-f2dd-4fb5-8fa6-4debddb62249'),('14233226-0a5b-4157-a5cd-ba838f129db6','IMG1739521956639','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739347650/Screenshot_2024-10-13_113138_dkcbvo.png','',_binary '','4610617a-7c4c-4b55-98d8-3d7b617a7a7b'),('14a75c34-3b32-4e09-9896-f2af842a223d','IMG1740910601282','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','4b39ae1a-9379-47e9-8c80-0f5672f46c10'),('1bc08e48-69c3-433b-bbfd-17c45f174697','IMG1739523889423','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391314/Screenshot_2024-11-06_094821_s86iqu.png','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('1c9f1a7a-0296-447c-a030-f0d1095ca564','IMG1740308928941','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','464b2463-2fbe-4207-a7fb-d50357a66174'),('1f703732-334a-446f-9c5c-bf44207f8d3e','IMG1740308310377','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739714347/307375_pkjd7c.jpg','',_binary '','c0bfcac5-08dc-4557-b9ed-1bc45b64be63'),('2149b43c-2b12-47d5-96b4-5057ee1d4a94','IMG1739523889329','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('214c3af5-c489-4159-afd8-3502eb15f3df','IMG1739519763103','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('242e5d28-087b-4f23-b7da-56dd7feb61da','IMG1740910601090','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','3f0a6468-73e0-4f36-b11e-296d7bfaba4d'),('279dbc48-7297-459c-8c38-3cbbf0920e19','IMG1739523889373','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391314/Screenshot_2024-11-06_094821_s86iqu.png','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('2b06c664-cc92-46e4-ae9d-e46a9bf8984d','IMG1742221325969','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','02195fe8-3498-469c-be33-c049732f0727'),('2e241a76-3d2b-4e35-a4df-8af27aef0faa','IMG1739899844966','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','70835a28-7019-4c1c-a2ed-f2a009b4ece9'),('2f25209f-b49d-4ee0-830f-1d5f97f8ecce','IMG1740910601540','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','9a014ee3-43fa-48a5-a758-85b8c45faecb'),('333f71b6-6969-4109-9270-f42065b700fa','IMG1740910601162','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','9484808d-6bf1-43a7-804a-f9987b3b8f7b'),('369b9c8e-48e6-4a77-aae9-7ea9b5eb509a','IMG1740308310502','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739070424/Screenshot_2024-02-22_174526_ftsa45.png','',_binary '','6d33cd1f-1498-4d8b-a45f-bada5c19452a'),('3a1f5819-0eef-45be-aa9f-c38d07c6ad1b','IMG1739899844929','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','b7253bf1-88d0-4110-81a2-a52ef6022307'),('49495b21-91b1-4394-823c-d4026f62d7aa','IMG1739523889379','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('4a826c0f-a693-4361-804b-6f3e0c628ecb','IMG1740910601940','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3ccc7099-66c9-4ee4-ba35-06a25371bde8'),('4aa42a8d-174c-4950-8aba-3025b15f0ff2','IMG1739523934905','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('4dd044d5-ee8b-440c-a2e9-7daf2c1c34bb','IMG1742221325955','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','02195fe8-3498-469c-be33-c049732f0727'),('510c5538-609c-4090-90db-73ed964bfe96','IMG1739523889386','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739523857/sp4_tr2t99.jpg','',_binary '','de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5'),('51b8ace4-f172-4809-9d0b-57b733e7c890','IMG1740910601250','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','4b39ae1a-9379-47e9-8c80-0f5672f46c10'),('572f4301-3313-4c20-970f-787cd0966153','IMG1739519763308','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739347650/Screenshot_2024-10-13_113138_dkcbvo.png','',_binary '','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18'),('5e11c6d8-0c19-4eb1-a36b-45d66c641684','IMG1740308928869','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739714347/307375_pkjd7c.jpg','',_binary '','2426993d-01a0-4bdc-9ff5-4995b4f361ea'),('60d7325f-1513-45ad-b790-0d8c1c9a32e7','IMG1739899844890','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','061840ea-05d1-489a-af6c-291003491202'),('629c6f11-9645-47b6-9635-bd77b7d50e42','IMG1739519762948','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('65e90be3-b9a4-4755-ae1c-7c89f9bbbc30','IMG1742577017875','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','4bba63de-3521-453f-addc-25160d75cb50'),('6e18e4c0-5b56-4f46-b998-9de79640b1cc','IMG1739519762815','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('6fa9277b-4df8-4c9b-8dc2-d9b375663032','IMG1739899844960','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','70835a28-7019-4c1c-a2ed-f2a009b4ece9'),('728131c6-8a12-4d38-9174-1f7a91c63719','IMG1740910600996','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','3f0a6468-73e0-4f36-b11e-296d7bfaba4d'),('73689a2a-64b7-4076-926c-2bc1633c18d0','IMG1740308310346','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739714347/307375_pkjd7c.jpg','',_binary '','85a4aefa-83a4-470f-bd2c-fa0545b0adac'),('762976c7-517b-4f4e-a1d3-a5ee7aa0810e','IMG1739519763271','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18'),('7b61857a-279f-415e-b99e-001f624f5af0','IMG1740308310429','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739041772/Screenshot_2024-02-28_222303_yeueru.png','',_binary '','4665b3b1-fe89-4779-be2b-9d05ed246e5b'),('81833837-4587-4f9a-aa0c-5e6a98ac1580','IMG1740308310438','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739070424/Screenshot_2024-02-22_174526_ftsa45.png','',_binary '','4665b3b1-fe89-4779-be2b-9d05ed246e5b'),('86339393-922d-4fca-9abd-9ec2079a5462','IMG1739899844883','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','061840ea-05d1-489a-af6c-291003491202'),('868fa1c6-bc8e-4376-b53a-8c2a8478699d','IMG1740910601073','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3f0a6468-73e0-4f36-b11e-296d7bfaba4d'),('8deff18e-df34-4e80-b8d3-3602d962161d','IMG1740910601200','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','9484808d-6bf1-43a7-804a-f9987b3b8f7b'),('8ea47963-6f99-4d8c-8fc4-510352309545','IMG1739899844922','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','b7253bf1-88d0-4110-81a2-a52ef6022307'),('8fe3aff5-5f96-4878-98b3-4519494419e2','IMG1742577017966','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','c3f1d286-002e-4998-998f-55336983cadf'),('957d48c1-546f-4682-9bb4-ac89c15e6828','IMG1739519763119','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('96714b3b-8370-45a5-aab1-f3583aab2858','IMG1740910601468','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','8830c9ed-39f8-4241-b548-9de74405deac'),('9867e444-b2b8-4b04-b7b3-efe9474e0475','IMG1743261603223','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1740306147/sp3_bf5qj0.jpg','',_binary '','01db00ef-5145-4cfa-b736-4255bef939df'),('98cfd389-2256-4730-afcd-d7700a738857','IMG1739523889429','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739391116/newyork_ljbvmm.jpg','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('9996bbb8-4fd3-401a-b907-e334f496458b','IMG1742577017741','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1740306147/sp3_bf5qj0.jpg','',_binary '','61a1277d-6bd0-4596-9fcc-7cf908f04894'),('9d089b93-c1ea-4f67-8630-61444dd7a61f','IMG1740910601793','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','4d2974ea-b76d-45a5-b52d-5f170e8896aa'),('a207c3d9-a2c9-4d85-a191-3ae21538c8b7','IMG1739523889334','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('a5bfb17c-6c93-4cc6-acc2-356452ef1434','IMG1740910601273','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','4b39ae1a-9379-47e9-8c80-0f5672f46c10'),('a7da2332-c887-46dc-8f10-84268973dc65','IMG1739899844753','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','3f92826e-0eea-44f2-ada6-1c581c54694d'),('a9af99d9-9441-4cfe-ac56-52c1f6f2038c','IMG1739523934898','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('ae3ebca5-81e9-4236-9aac-fbb9419d51ec','IMG1743256278334','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1740306147/sp3_bf5qj0.jpg','',_binary '','008bc41c-d7ee-4f1a-97f0-987d102b15ad'),('b03cc2f9-3244-45c1-82fa-89a1bad0d8a0','IMG1740910601668','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','14e83f96-ee63-4ca6-bd1a-648de9991c47'),('b1255e82-beec-4baf-8a5f-0057c8472669','IMG1740910601183','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','9484808d-6bf1-43a7-804a-f9987b3b8f7b'),('b24813e4-0f95-46c8-9c24-9a5acc446e61','IMG1742221325948','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422589/t%E1%BA%A3i_xu%E1%BB%91ng_u00h4n.jpg','',_binary '','02195fe8-3498-469c-be33-c049732f0727'),('b44e8682-6f25-49d3-9d9f-c2b8155cda52','IMG1740308928953','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739390989/2023-07-12_kbrlns.png','',_binary '','464b2463-2fbe-4207-a7fb-d50357a66174'),('b459327c-0b8d-4165-8362-583c62dd9b8a','IMG1740308928891','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1740306147/sp3_bf5qj0.jpg','',_binary '','2426993d-01a0-4bdc-9ff5-4995b4f361ea'),('b569c617-2a70-40c7-b5ca-4a758482e04b','IMG1740910601734','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','197d0db4-9d0e-4708-9610-4d21726cdf05'),('b6751d25-cc1f-46cb-9224-40b5dbf80330','IMG1739523889437','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739523857/sp4_tr2t99.jpg','',_binary '','4393ee6d-f0ea-4e1d-a0f0-636c957b8165'),('b8684b31-95a6-4bc7-b300-73fd85ad6724','IMG1739521956569','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','4610617a-7c4c-4b55-98d8-3d7b617a7a7b'),('c9eaa57f-d2a9-4a02-b9f3-79a00aad82bf','IMG1742577017788','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1740306147/sp3_bf5qj0.jpg','',_binary '','98793d6b-f2a6-4404-af6f-b8438cb4771d'),('ce667b1b-aa55-4a1b-9292-7aa08df45b0e','IMG1739519762930','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739416850/Screenshot_2025-02-11_174152_ghq23c.png','',_binary '','f8729c3a-2215-47c2-931e-b177cb871007'),('d31e3483-b0e3-46b5-bdb3-296745f06afe','IMG1742577017923','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','455aa19f-83da-490d-bef3-40fc95afa1b8'),('d514e51c-256a-4dae-8198-e0fac3d8dc55','IMG1739523889318','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739519503/sp2_ajvxsp.png','',_binary '','6639faec-b397-41c3-81fb-783dff594545'),('d93b2439-c14d-4096-91bb-b8db4d7b44fb','IMG1739519763145','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739422185/Screenshot_2025-02-12_231247_ctscu6.png','',_binary '','ab5258b5-f94f-4869-a2d0-7cd702e3ef5f'),('f8ed28f1-939b-4b60-b63a-f75f014eb97f','IMG1739523934910','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739447590/backgrounddefault_bc3vsi.jpg','',_binary '','7c4314be-981f-49ff-be52-4989f01dc7ac'),('fcdafeec-b6c6-45c7-9a79-13aa025d8356','IMG1740910601615','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','e3fe7452-028c-4dc9-9b27-44a07cb01a1a'),('ffd1707f-0d26-4de5-9d7c-290ac4137186','IMG1742577017996','https://res.cloudinary.com/dl1ahr7s5/image/upload/v1739412310/Screenshot_2025-02-12_234250_ie04wm.png','',_binary '','49c9ea0c-2c96-447e-98fb-2c6b9df591f4');
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
  `dia_chi_cu_the` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
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
INSERT INTO `hoa_don` VALUES ('HD2e448207','HD034329',NULL,NULL,NULL,3,'Khách hàng lẻ',NULL,NULL,'Số 13, Nhà 11, Cao Cao, 231013, 2270, 267',NULL,'2025-03-29 02:17:44',NULL,1302000,'',1,'2025-03-27 18:09:45','2025-03-29 16:00:35','Nông Tiến Thịnh','tienthinhkk@gmail.com',36501.00),('HD8e41158c','HD917647',NULL,NULL,NULL,2,'Khách hàng lẻ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-03-28 10:09:36',NULL,'Nông Tiến Thịnh',NULL,NULL);
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
  `gia_tai_thoi_diem_them` decimal(10,0) DEFAULT NULL,
  `ngay_them_vao_gio` datetime DEFAULT NULL,
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
INSERT INTO `hoa_don_chi_tiet` VALUES ('37bcad8f-6ce1-421c-acfc-700c64de6185','HD2e448207','01db00ef-5145-4cfa-b736-4255bef939df',1,NULL,1,'2025-03-29 15:04:17','2025-03-29 15:20:08',NULL,NULL,200000,'2025-03-29 22:04:17'),('38002c63-b86d-4c36-b3bd-7d1a720dcaa8','HD2e448207','02195fe8-3498-469c-be33-c049732f0727',1,NULL,1,'2025-03-29 16:33:52',NULL,NULL,NULL,2000,'2025-03-29 23:33:51'),('bd591183-e335-49dc-89e8-f6d78e0469ae','HD2e448207','061840ea-05d1-489a-af6c-291003491202',2,NULL,1,'2025-03-29 16:33:36','2025-03-29 16:33:45',NULL,NULL,200000,'2025-03-29 23:33:35'),('c9bde57e-11aa-42d7-8b09-ecf591524758','HD2e448207','spct002',1,NULL,1,'2025-03-29 16:34:06',NULL,NULL,NULL,700000,'2025-03-29 23:34:06');
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
INSERT INTO `invalidate_token` VALUES ('1471bf87-dc85-4b33-8d91-59ee745ada53','2025-03-18'),('8c2f5419-de80-417d-8d6b-9fc74a0bdbec','2025-03-18'),('22158131-2c2b-446e-b3fd-2d21f7cf83d3','2025-03-19'),('e269c0e8-35a2-4888-a12e-e2316152f253','2025-03-19'),('a86741c3-e3f6-4410-8d58-4dcac9bb0048','2025-03-19'),('58d65d25-92fd-40c0-bb80-115690925c95','2025-03-19'),('7e4481f8-61ba-4dd8-9dd0-2484fe27b8bb','2025-03-19'),('6a20e51a-1b77-4f6f-b04b-f334a9b0a3a7','2025-03-19'),('486dfdff-f3ee-4266-a581-157c4e478d22','2025-03-19'),('5bcb7b88-a3d3-4f67-849e-d35565036191','2025-03-19'),('b553a512-5eac-46df-8693-05e107d310ea','2025-03-19'),('41692e28-b3f2-4ed6-b3ef-3ef597470174','2025-03-19'),('d8324f8d-8676-4d6d-b2f6-abe84c8858e1','2025-03-20'),('089ec7a6-f577-4114-9ce8-6d045e991077','2025-03-21'),('2e067d51-3109-488b-b8cb-e137a5f08c8f','2025-03-21'),('04dd9bcc-d335-4136-8925-723dd71e86aa','2025-03-21'),('8804a5a2-919d-4f30-88c3-77f38b83e1d9','2025-03-21'),('2252cfcc-9a5e-4979-bb5a-20912175b732','2025-03-21'),('b54bd0e2-3fbf-420b-ad8f-98a5b310b49f','2025-03-21'),('d808a5d5-38ee-4111-81f0-739bd1bb8dfb','2025-03-21'),('148d5fea-7ea4-4133-9b20-dce31ede54df','2025-03-22'),('22c08859-1f66-4ca3-ad08-387bff9b31bd','2025-03-22'),('86257cb4-168b-44d5-9de7-e5aa4457836e','2025-03-22'),('4e1e5023-4b26-458d-aee7-203a0b420282','2025-03-23'),('54d93a3c-f918-4630-86c6-d003002fe35c','2025-03-23'),('0274dddc-62d1-4745-89ed-12d4339bb8fa','2025-03-23'),('38f38aef-1eb2-41d9-b6e3-9477eebb4926','2025-03-23'),('32a906c5-cde7-4599-b6d8-fa2259d75ef9','2025-03-25'),('21a336ba-465b-4eb9-8517-1428542ccfd4','2025-03-25'),('b360b39d-72b1-4344-88d5-14862728449b','2025-03-26'),('bd3fa05d-cb98-4257-9276-f67634b7eed1','2025-03-28');
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
INSERT INTO `lich_su_hoa_don` VALUES ('LS00db1528','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',NULL,NULL,'2025-03-29 16:00:35'),('LS01c5c45c','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-03-28 19:18:04','2025-03-28 19:18:04'),('LS05175476','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đang giao',4,'2025-03-28 19:17:44','2025-03-28 19:17:44'),('LS120124ef','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,NULL,'2025-03-29 14:25:45'),('LS159c47f1','HD8e41158c',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-28 10:09:36',NULL),('LS15dc1b44','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,NULL,'2025-03-29 14:25:36'),('LS1f5bada9','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-03-28 19:18:11','2025-03-28 19:18:11'),('LS201b3a5d','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',1,NULL,'2025-03-29 15:27:45'),('LS2d452d1e','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-03-28 19:34:36','2025-03-28 19:34:36'),('LS44ea20da','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: 0388888888',1,NULL,'2025-03-28 14:21:11'),('LS4b3bc30c','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: 0388888888',1,NULL,'2025-03-28 11:24:49'),('LS4cd0659a','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',NULL,NULL,'2025-03-29 15:51:23'),('LS66a4dacf','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',1,NULL,'2025-03-29 15:29:50'),('LS75c2e408','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,'2025-03-28 19:17:25','2025-03-28 19:17:25'),('LSa61bfa61','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,'2025-03-28 19:34:42','2025-03-28 19:34:42'),('LSafbd684c','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ giao hàng',3,'2025-03-28 19:17:33','2025-03-28 19:17:33'),('LSb17c5b10','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',1,NULL,'2025-03-29 15:27:52'),('LSc5ca7a08','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Đã xác nhận',2,NULL,'2025-03-29 15:06:23'),('LSd83e3b50','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ giao hàng',3,'2025-03-28 19:17:57','2025-03-28 19:17:57'),('LSdedf58a7','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',1,NULL,'2025-03-28 19:01:06'),('LSe167a03b','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Chuyển sang trạng thái Chờ xác nhận',1,NULL,'2025-03-29 15:06:43'),('LSee9c4c72','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',NULL,NULL,'2025-03-29 15:50:24'),('LSf1a09ab0','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật trạng thái hóa đơn','Tạo hóa đơn mới',1,'2025-03-27 18:09:45',NULL),('LSfabd45d2','HD2e448207',NULL,'eb6db611-d763-438c-9246-7e6c1823f121','Cập nhật thông tin người nhận','Cập nhật thông tin người nhận: Khách hàng lẻ, SĐT: null',1,NULL,'2025-03-28 18:33:28');
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
INSERT INTO `phieu_giam_gia` VALUES ('0e272caa-4572-4664-8559-833e552039c5','PGG-48F864DC','Phiếu này Free',1,1,100,1000000,10000000,'2025-03-02 19:00:00','2025-03-29 10:00:00',0,NULL,2,'2025-03-02 11:05:31',NULL,NULL,NULL),('12687483-6de7-4370-8459-282b0ee8fda3','PGG-B5C2DB48','Phiếu giảm giá cho huy',1,1,11,12121,1212,'2025-02-14 10:00:00','2025-03-29 10:00:00',494,'212121',1,'2025-02-14 07:17:02',NULL,NULL,NULL),('13138841-adf4-4eea-8ed0-15fbd2c62bf6','PGG-61577FFC','2',2,1,400000,2000000,500000,'2025-02-10 09:16:53','2025-03-29 10:00:00',0,'Mã giảm giá thứ 4',1,NULL,NULL,NULL,NULL),('2800a5e9-5d1e-455d-9d04-86e07da9093b','PGG-508AF469','12',2,2,50,100000,100000,'2025-02-14 03:00:00','2025-03-29 10:00:00',0,'Mô tả ',1,NULL,NULL,NULL,NULL),('3f68e668-d340-4e86-9132-7b415a19bf69','PGG-F8F6ADDE','Phiếu giảm giá cho thinh',1,1,12,1231,122,'2025-02-14 10:00:00','2025-03-29 10:00:00',0,'213',1,NULL,NULL,NULL,NULL),('b6c16a50-2693-4f96-bf03-05c7b8bc1286','PGG-70F6F0A5','121',1,1,12,2312322,21321,'2025-02-18 10:00:00','2025-03-29 10:00:00',12,'dd',1,NULL,NULL,NULL,NULL),('cd2e955f-fb32-4d6a-bbf8-735ae1f75722','PGG-7D8DF4C6','bsbsb',1,1,12,5000000,1200000,'2025-02-22 22:57:17','2025-03-29 10:00:00',119790,'ko',2,'2025-02-22 15:53:36',NULL,NULL,NULL),('d488786c-066c-4902-b38d-e28f87d9d680','PGG-030F126D','Phiếu giảm giá cho thinh22',1,1,12,22321,2132,'2025-02-14 10:00:00','2025-03-29 10:00:00',164,'ok',1,'2025-02-14 09:07:05',NULL,NULL,NULL),('e4e1ecc2-3113-467a-9a6b-2d8e89e17d03','PGG-830C988D','Phiếu giảm giá cho Huy NN',1,2,100,20000,100000,'2025-03-20 16:00:00','2025-03-29 10:00:00',1,NULL,1,'2025-03-20 08:38:02',NULL,NULL,NULL),('fa37bee0-e9d9-4876-b5fc-5228f6a94c2b','PGG-450F99D5','we',2,2,12,12000,10000,'2025-02-23 00:00:00','2025-03-29 10:00:00',2,'ko',2,'2025-02-22 15:54:25',NULL,NULL,NULL),('fd4c6eb0-79a4-40bb-8a8e-98a1150b70d1','PGG-632602DC','1234',1,1,100,10000,1999,'2025-02-13 10:00:00','2025-03-29 10:00:00',0,'Mô tả danh cho 1234',1,NULL,NULL,NULL,NULL),('pg001','PG001','10',1,1,10,600000,100000,'2025-01-11 16:16:53','2025-03-29 10:00:00',805,'Mã giảm giá cho sản phẩm 1',1,'2025-01-11 09:16:53',NULL,'admin',NULL),('pg002','PG002','15',1,1,50,3000000,150000,'2025-01-11 09:16:53','2025-03-29 10:00:00',621,'Mã giảm giá cho sản phẩm 2',1,'2025-01-11 09:16:53',NULL,'admin',NULL),('pg003','PG003','89',1,1,45,5000000,450000,'2025-01-11 16:16:53','2025-03-29 10:00:00',787,'Mã giảm giá cho sản phẩm 3',1,'2025-01-31 06:30:07',NULL,NULL,NULL),('pg004','PG004','4',2,2,400000,2000000,500000,'2025-02-10 09:16:53','2025-03-29 10:00:00',333,'Mã giảm giá thứ 4',1,'2025-02-12 09:35:46',NULL,NULL,NULL);
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
INSERT INTO `phuong_thuc_thanh_toan` VALUES ('PTTT001','COD','Thanh toán trả sau','Thanh toán trực tiếp với nhân viên giao hàng',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL,NULL),('PTTT002','BANK','Chuyển khoản ngân hàng','Thanh toán qua tài khoản ngân hàng',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL,NULL),('PTTT003','CASH','Tiền mặt','Thanh toán trực tiếp với nhân viên',_binary '','2025-01-25 13:23:13',NULL,NULL,NULL,NULL);
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
INSERT INTO `san_pham` VALUES ('138f596b-da75-4cc9-b7df-858010e2a1b9','SP1740306970717','Sản phẩm 3','Mô tả sản phẩm 3',_binary '','2025-02-23 10:36:11',NULL,NULL,NULL),('34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','SP1740910337984','Sản phẩm 4','Mô tả sản phẩm 4',_binary '','2025-03-02 10:12:18',NULL,NULL,NULL),('3c3f3c1a-a9a2-4c80-be43-89b118445354','SP1740308841466','Sản phẩm 5','Mô tả sản phẩm 5',_binary '','2025-02-23 11:07:21',NULL,NULL,NULL),('69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','SP1739506011209','Sản phẩm 6','Mô tả sản phẩm 6',_binary '','2025-02-14 04:06:51',NULL,NULL,NULL),('fc8a9c3f-6617-4d21-b588-8ad9845a6a17','SP1742576935321','Sản phẩm test','Mô tả cho sản phẩm test\n',_binary '','2025-03-21 17:08:55',NULL,NULL,NULL),('sp001','SP001','Sản phẩm 1','Mô tả sản phẩm 1',_binary '','2025-01-11 09:14:09',NULL,'admin',NULL),('sp002','SP002','Sản phẩm 2','Mô tả sản phẩm 2',_binary '','2025-01-11 09:14:09',NULL,'admin',NULL);
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
INSERT INTO `san_pham_chi_tiet` VALUES ('008bc41c-d7ee-4f1a-97f0-987d102b15ad','SPCT1742577017799',47,'Ok',_binary '',190000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('01db00ef-5145-4cfa-b736-4255bef939df','SPCT1742577017449',46,'Ok',_binary '',210000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('02195fe8-3498-469c-be33-c049732f0727','SPCT1740910601292',400,'Mô tả cho sản phẩm\n',_binary '',2000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('061840ea-05d1-489a-af6c-291003491202','SPCT1739899844865',2,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('12a77fc0-f2dd-4fb5-8fa6-4debddb62249','SPCT1739899844807',34,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('14e83f96-ee63-4ca6-bd1a-648de9991c47','SPCT1740910601629',34,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('197d0db4-9d0e-4708-9610-4d21726cdf05','SPCT1740910601679',40,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('2426993d-01a0-4bdc-9ff5-4995b4f361ea','SPCT1740308928617',12,NULL,_binary '',2002000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','3c3f3c1a-a9a2-4c80-be43-89b118445354','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 11:08:49'),('3be0daee-846d-473b-9fee-2e7a29e91552','SPCT1740910601804',49,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('3ccc7099-66c9-4ee4-ba35-06a25371bde8','SPCT1740910601869',49,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('3f0a6468-73e0-4f36-b11e-296d7bfaba4d','SPCT1740910600480',496,NULL,_binary '',1000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('3f92826e-0eea-44f2-ada6-1c581c54694d','SPCT1739899844154',18,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('4393ee6d-f0ea-4e1d-a0f0-636c957b8165','SPCT1739523889392',87,'okee',_binary '',100000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('455aa19f-83da-490d-bef3-40fc95afa1b8','SPCT1742577017888',499,'Ok',_binary '',10000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('4610617a-7c4c-4b55-98d8-3d7b617a7a7b','SPCT1739519763382',33,'ok',_binary '',100033,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('464b2463-2fbe-4207-a7fb-d50357a66174','SPCT1740308928904',0,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','3c3f3c1a-a9a2-4c80-be43-89b118445354','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 11:08:49'),('4665b3b1-fe89-4779-be2b-9d05ed246e5b','SPCT1740308310396',0,NULL,_binary '',2200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('49c9ea0c-2c96-447e-98fb-2c6b9df591f4','SPCT1742577017973',500,'Ok',_binary '',10000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('4b39ae1a-9379-47e9-8c80-0f5672f46c10','SPCT1740910601215',493,NULL,_binary '',1000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('4bba63de-3521-453f-addc-25160d75cb50','SPCT1742577017846',500,'Ok',_binary '',10000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('4d2974ea-b76d-45a5-b52d-5f170e8896aa','SPCT1740910601746',41,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('61a1277d-6bd0-4596-9fcc-7cf908f04894','SPCT1742577017680',50,'Ok',_binary '',200000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('6639faec-b397-41c3-81fb-783dff594545','SPCT1739523889294',0,'okee',_binary '',1000000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('6d33cd1f-1498-4d8b-a45f-bada5c19452a','SPCT1740308310448',28,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('70835a28-7019-4c1c-a2ed-f2a009b4ece9','SPCT1739899844937',46,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('72e3fe9e-a47d-4a7e-bbdd-ee610faa1f18','SPCT1739519763173',47,'ok',_binary '',100000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('7c4314be-981f-49ff-be52-4989f01dc7ac','SPCT1739523888854',95,'okee22',_binary '',1003330,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('85a4aefa-83a4-470f-bd2c-fa0545b0adac','SPCT1740308310144',18,NULL,_binary '',323232,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('8830c9ed-39f8-4241-b548-9de74405deac','SPCT1740910601399',31,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('9484808d-6bf1-43a7-804a-f9987b3b8f7b','SPCT1740910601105',497,NULL,_binary '',1000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:41'),('98793d6b-f2a6-4404-af6f-b8438cb4771d','SPCT1742577017756',50,'Ok',_binary '',200000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('9a014ee3-43fa-48a5-a758-85b8c45faecb','SPCT1740910601486',49,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('ab5258b5-f94f-4869-a2d0-7cd702e3ef5f','SPCT1739519762969',47,'ok',_binary '',100099,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('b7253bf1-88d0-4110-81a2-a52ef6022307','SPCT1739899844899',48,NULL,_binary '',200000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('c0bfcac5-08dc-4557-b9ed-1bc45b64be63','SPCT1740308310361',21,NULL,_binary '',323232,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','350987d0-b0f6-43b4-927a-a5504f82b942','138f596b-da75-4cc9-b7df-858010e2a1b9','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-23 10:58:30'),('c3f1d286-002e-4998-998f-55336983cadf','SPCT1742577017932',500,'Ok',_binary '',10000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','fc8a9c3f-6617-4d21-b588-8ad9845a6a17','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-21 17:10:18'),('d1d9a7ad-a833-4347-9a7c-0544aad45374','SPCT1739899844829',47,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:30:44'),('de8d5e91-6896-40fd-bdd3-fb6a3e8e8ff5','SPCT1739523889343',98,'okee',_binary '',10000000,'f82d423c-5ee3-4b25-b87f-94deb47e4316','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','a75166f5-6bbd-463c-a605-d5407363307f','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('e3fe7452-028c-4dc9-9b27-44a07cb01a1a','SPCT1740910601553',50,NULL,_binary '',200000,'99549c36-8470-4fd0-afdc-7815c13854f8','2af77f53-a74c-468b-b599-a080a828d253','350987d0-b0f6-43b4-927a-a5504f82b942','34694b58-d294-4fc9-b9bf-f7cc41d8d1a8','eb6dcc6c-671c-4c0d-8063-d83008554350','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','fa9ec930-859c-4739-a1ae-e6feda1f5fdd','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-03-02 10:16:42'),('f8729c3a-2215-47c2-931e-b177cb871007','SPCT1739519762419',48,'ok',_binary '',100055,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','69d7d0ab-2539-455b-8b76-6c32fd0c3ae8','c79efdc3-a52a-434e-b342-8aa0824bae1b','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('spct001','SPCT001',78,'Chi tiết sản phẩm 1',_binary '',500000,'7ca6f090-d8d5-4f25-8572-de1ebd29f6da','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp001','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45'),('spct002','SPCT002',46,'Chi tiết sản phẩm 2',_binary '',700000,'99549c36-8470-4fd0-afdc-7815c13854f8','307ff145-d0e5-460a-afd9-d8b606c23c18','dm01','sp002','9c2aecc2-1ef4-47f7-8de4-461be6a57661','b396afb0-f55d-4ce0-80b7-f2f7daf8048c','f3685534-8606-491d-868e-30f3a40cd481','24034b35-b8aa-4882-843a-cb720f608522','c1578e35-2b86-47a8-bf68-06dedda3c59f','213123','d392abbb-54ad-4003-8583-255caa8eed1d','ht01','2bf211bd-c9dd-45f8-97a5-39461da40dda','2025-02-18 17:11:45');
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

-- Dump completed on 2025-03-29 23:37:34
