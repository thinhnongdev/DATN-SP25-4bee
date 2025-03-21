package com.example.server.controller.ChatBot;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.service.ChatBot.ChatBotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    @Autowired
    private ChatBotService productService;

    @Value("${gemini.api.key}")
    private String GEMINI_API_KEY;

    @Value("${gemini.api.url}")
    private String GEMINI_API_URL;

    @PostMapping
    public String chat(@RequestBody String userInput) {
        try {
            List<SanPhamChiTiet> products;
            String productData;

            // Xử lý tìm kiếm theo khoảng giá
            Pattern pricePattern = Pattern.compile("(\\d+)[^0-9]+(\\d+)");
            Matcher matcher = pricePattern.matcher(userInput);
            if (userInput.toLowerCase().contains("giá từ") && matcher.find()) {
                BigDecimal minPrice = new BigDecimal(matcher.group(1));
                BigDecimal maxPrice = new BigDecimal(matcher.group(2));
                products = productService.getProductsByPriceRange(minPrice, maxPrice);
            } else if (userInput.toLowerCase().contains("danh mục") || userInput.toLowerCase().contains("loại")) {
                products = productService.getProductsByCategory(userInput);
            } else if (userInput.toLowerCase().contains("chất liệu")) {
                products = productService.getProductsByMaterial(userInput);
            } else {
                products = productService.getProductsByKeyword(userInput);
            }

            if (products.isEmpty()) {
                productData = "Không tìm thấy sản phẩm phù hợp với yêu cầu của bạn.";
            } else {
                productData = products.stream()
                        .map(p -> String.format(
                                "- %s: %,.0f VND (%d sp) [%s], Ảnh: %s",
                                p.getMaSanPhamChiTiet(),
                                p.getGia(),
                                p.getSoLuong(),
                                p.getDanhMuc() != null ? p.getDanhMuc().getTenDanhMuc() : "Không xác định",
                                String.join(", ", productService.getProductImages(p.getId()))
                        ))
                        .collect(Collectors.joining("\n"));
            }

            // Tạo prompt cho Gemini API
            String prompt = "Bạn là chatbot bán hàng. Dựa trên dữ liệu sau, trả lời khách hàng một cách tự nhiên: \n"
                    + "Dữ liệu sản phẩm:\n" + productData + "\n"
                    + "Câu hỏi: " + userInput;

            // Gọi Gemini API
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String urlWithKey = GEMINI_API_URL + "?key=" + GEMINI_API_KEY;
            ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, entity, String.class);

            // Xử lý phản hồi từ Gemini API
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> jsonResponse = mapper.readValue(response.getBody(), Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) jsonResponse.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return "Không nhận được phản hồi từ AI.";
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            if (content == null || !content.containsKey("parts")) {
                return "Dữ liệu trả về từ AI không đúng định dạng.";
            }

            List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
            return parts.get(0).get("text");

        } catch (Exception e) {
            return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn: " + e.getMessage();
        }
    }
}
