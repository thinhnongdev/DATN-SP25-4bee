package com.example.phieu_giam_gia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Áp dụng cho tất cả các endpoint có đường dẫn bắt đầu bằng "/api"
                .allowedOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8080") // Cho phép các cổng cụ thể
                .allowedMethods("*") // Cho phép tất cả các phương thức HTTP
                .allowedHeaders("*") // Cho phép tất cả các header
                .allowCredentials(true); // Cho phép gửi cookie nếu cần thiết
    }
}
