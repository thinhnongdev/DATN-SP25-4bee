package com.example.server.controller.SanPham;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/imagesSanPham")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class CloudinaryController {

    private final Cloudinary cloudinary;

    public CloudinaryController() {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dl1ahr7s5", // Thay bằng Cloud Name
                "api_key", "184793981881179", // Thay bằng API Key
                "api_secret", "-iKVA-ULhv63Rt2K2fKp3tIYWOM" // Thay bằng API Secret
        ));
    }

    @GetMapping
    public List<String> getAllImages() {
        try {
            Map result = cloudinary.api().resources(ObjectUtils.asMap(
                    "type", "upload",
                    "max_results", 50 // Giới hạn số ảnh lấy về
            ));

            List<Map> resources = (List<Map>) result.get("resources");
            return resources.stream()
                    .map(img -> (String) img.get("secure_url")) // Lấy URL ảnh
                    .collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}

