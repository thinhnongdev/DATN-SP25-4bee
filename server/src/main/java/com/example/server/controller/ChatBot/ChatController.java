package com.example.server.controller.ChatBot;

import com.example.server.entity.KhachHang;
import com.example.server.entity.SanPhamChiTiet;
import com.example.server.entity.TaiKhoan;
import com.example.server.repository.Auth.TaiKhoanRepository;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import com.example.server.service.ChatBot.ChatBotService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
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

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatBotService chatBotService;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Environment environment;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${gemini.api.key}")
    private String GEMINI_API_KEY;

    @Value("${gemini.api.url}")
    private String GEMINI_API_URL;

    private final RestTemplate restTemplate = new RestTemplate();

    // API gửi tin nhắn
    @PostMapping("/send")
    public Map<String, Object> chat(@RequestBody Map<String, String> requestBody,
                                    @RequestHeader("Session-Id") String sessionId,
                                    @RequestHeader(value = "Authorization", required = false) String token) {
        long startTime = System.currentTimeMillis();
        logger.info("Bắt đầu xử lý yêu cầu chat - SessionId: {}", sessionId);

        String userInput = requestBody.get("message").toLowerCase().trim();
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Phiên chat không tồn tại"));
        Map<String, Object> context = loadSession(session);
        Map<String, Object> response = new HashMap<>();
        String textResponse = "";
        List<SanPhamChiTiet> products = null;
        String userId = token != null ? getUserIdFromToken(token) : null;

        try {
            logger.debug("User input: {}, User ID: {}", userInput, userId);
            logger.debug("Context hiện tại: {}", context);

            List<Map<String, Object>> cart = (List<Map<String, Object>>) context.computeIfAbsent("cart", k -> new ArrayList<>());
            List<String> history = (List<String>) context.computeIfAbsent("history", k -> new ArrayList<>());
            history.add("User: " + userInput);

            // Lưu tin nhắn người dùng
            ChatMessage userMessage = new ChatMessage();
            userMessage.setSessionId(sessionId);
            userMessage.setSender(ChatMessage.Sender.USER);
            userMessage.setMessage(userInput);
            chatMessageRepository.save(userMessage);

            // Xử lý lời chào
            if (userInput.equals("hello") || userInput.equals("xin chào")) {
                logger.debug("Xử lý lời chào");
                textResponse = "Chào bạn! Mình là chatbot bán hàng, rất vui được giúp bạn. Bạn đang tìm gì hôm nay nhỉ?";
            }
            // Xem chi tiết sản phẩm
            else if (userInput.contains("xem chi tiết") || userInput.contains("chi tiết")) {
                logger.debug("Xử lý yêu cầu xem chi tiết sản phẩm");
                String maSanPham = extractKeyword(userInput, "xem chi tiết", "chi tiết");
                logger.debug("Mã sản phẩm được yêu cầu: {}", maSanPham);

                SanPhamChiTiet product = chatBotService.getProductById(maSanPham);
                if (product != null) {
                    List<String> images = chatBotService.getProductImages(product.getId());
                    String productDetail = String.format(
                            "Thông tin chi tiết sản phẩm %s:\n" +
                                    "- Tên: %s\n" +
                                    "- Giá: %,.0f VNĐ\n" +
                                    "- Số lượng còn: %d\n" +
                                    "- Danh mục: %s\n" +
                                    "- Chất liệu: %s\n" +
                                    "- Ảnh: %s",
                            product.getMaSanPhamChiTiet(),
                            product.getSanPham().getTenSanPham(),
                            product.getGia(),
                            product.getSoLuong(),
                            product.getDanhMuc() != null ? product.getDanhMuc().getTenDanhMuc() : "Không có",
                            product.getChatLieu() != null ? product.getChatLieu() : "Không có",
                            images.isEmpty() ? "Không có ảnh" : images.get(0)
                    );
                    textResponse = callGeminiAPI(productDetail, userInput, history);
                    response.put("product", formatProductData(List.of(product)).get(0));
                } else {
                    textResponse = "Mình không tìm thấy sản phẩm với mã '" + maSanPham + "'. Bạn có thể kiểm tra lại mã không?";
                    logger.warn("Không tìm thấy sản phẩm với mã: {}", maSanPham);
                }
            }
            // Gợi ý sản phẩm
            else if (userInput.contains("gợi ý")) {
                logger.debug("Xử lý yêu cầu gợi ý sản phẩm");
                if (userId != null) {
                    List<String> preferredCategories = getPreferredCategories(userId);
                    logger.debug("Danh mục ưa thích của user {}: {}", userId, preferredCategories);
                    products = chatBotService.getProductsByCategories(preferredCategories);
                    textResponse = "Dựa trên sở thích của bạn, đây là một số sản phẩm gợi ý:\n";
                } else {
                    products = chatBotService.getTopSellingProducts(5);
                    textResponse = "Đây là một số sản phẩm đang hot mà mình gợi ý cho bạn:\n";
                }
                context.put("lastProducts", products);
                logger.debug("Số lượng sản phẩm gợi ý: {}", products != null ? products.size() : 0);
            }
            // Thêm sản phẩm vào giỏ
            else if (userInput.contains("thêm vào giỏ")) {
                logger.debug("Xử lý yêu cầu thêm vào giỏ hàng");
                if (context.containsKey("lastProducts")) {
                    List<SanPhamChiTiet> lastProducts = (List<SanPhamChiTiet>) context.get("lastProducts");
                    String maSanPham = extractKeyword(userInput, "thêm");
                    logger.debug("Mã sản phẩm được yêu cầu thêm: {}", maSanPham);

                    SanPhamChiTiet product = lastProducts.stream()
                            .filter(p -> p.getMaSanPhamChiTiet().contains(maSanPham))
                            .findFirst()
                            .orElse(null);

                    if (product != null) {
                        if (product.getSoLuong() > 0) {
                            cart.add(Map.of(
                                    "productId", product.getId(),
                                    "maSanPham", product.getMaSanPhamChiTiet(),
                                    "quantity", 1,
                                    "price", product.getGia()
                            ));
                            textResponse = "Đã thêm " + product.getMaSanPhamChiTiet() + " vào giỏ hàng. Bạn muốn thêm gì nữa không?";
                            logger.info("Đã thêm sản phẩm {} vào giỏ hàng", product.getMaSanPhamChiTiet());
                        } else {
                            textResponse = "Sản phẩm " + product.getMaSanPhamChiTiet() + " hiện đã hết hàng. Bạn muốn xem sản phẩm khác không?";
                            logger.warn("Sản phẩm {} hết hàng", product.getMaSanPhamChiTiet());
                        }
                    } else {
                        textResponse = "Mình không tìm thấy sản phẩm đó. Bạn có thể nói rõ mã sản phẩm không?";
                        logger.warn("Không tìm thấy sản phẩm với mã: {}", maSanPham);
                    }
                } else {
                    textResponse = "Bạn chưa chọn sản phẩm nào. Hãy hỏi 'gợi ý sản phẩm' để mình tìm giúp nhé!";
                    logger.warn("Không có sản phẩm nào trong context để thêm vào giỏ");
                }
            }
            // Xem giỏ hàng
            else if (userInput.contains("xem giỏ hàng")) {
                logger.debug("Xử lý yêu cầu xem giỏ hàng");
                if (cart.isEmpty()) {
                    textResponse = "Giỏ hàng của bạn đang trống. Bạn muốn thêm sản phẩm không?";
                    logger.debug("Giỏ hàng trống");
                } else {
                    String cartText = cart.stream()
                            .map(item -> String.format("%s - Số lượng: %d - Giá: %,.0f VNĐ",
                                    item.get("maSanPham"),
                                    item.get("quantity"),
                                    item.get("price")))
                            .collect(Collectors.joining("\n"));
                    textResponse = "Giỏ hàng của bạn:\n" + cartText;
                    logger.debug("Nội dung giỏ hàng: {}", cartText);

                    double total = cart.stream()
                            .mapToDouble(item -> ((Number) item.get("price")).doubleValue() * ((Number) item.get("quantity")).intValue())
                            .sum();
                    textResponse += String.format("\nTổng giá trị: %,.0f VNĐ", total);
                }
            }
            // Tìm kiếm sản phẩm phức tạp
            else {
                logger.debug("Xử lý yêu cầu tìm kiếm phức tạp");
                Map<String, Object> conditions = extractConditions(userInput);
                logger.debug("Điều kiện tìm kiếm được trích xuất: {}", conditions);

                if (!conditions.isEmpty()) {
                    products = processComplexQuery(conditions);
                    if (products.isEmpty()) {
                        textResponse = "Hiện tại không có sản phẩm nào phù hợp. Bạn muốn mình tìm thêm theo tiêu chí khác không?";
                        logger.debug("Không tìm thấy sản phẩm phù hợp với điều kiện");
                    } else {
                        textResponse = "Mình tìm được vài sản phẩm phù hợp đây:\n";
                        context.put("lastProducts", products);
                        logger.debug("Tìm thấy {} sản phẩm phù hợp", products.size());
                    }
                } else {
                    String keyword = extractKeyword(userInput, "muốn", "xem", "có");
                    logger.debug("Từ khóa tìm kiếm: {}", keyword);
                    products = chatBotService.getProductsByKeyword(keyword);
                    if (products.isEmpty()) {
                        textResponse = "Không tìm thấy sản phẩm nào với từ khóa '" + keyword + "'. Bạn có thể mô tả thêm không?";
                        logger.debug("Không tìm thấy sản phẩm với từ khóa: {}", keyword);
                    } else {
                        context.put("lastProducts", products);
                        logger.debug("Tìm thấy {} sản phẩm với từ khóa {}", products.size(), keyword);
                    }
                }
            }

            // Xử lý kết quả sản phẩm
            if (products != null && !products.isEmpty()) {
                List<Map<String, Object>> productData = formatProductData(products);
                String productText = formatProductText(productData);
                logger.debug("Dữ liệu sản phẩm được định dạng: {}", productText);

                textResponse = callGeminiAPI("Dữ liệu sản phẩm:\n" + productText, userInput, history);
                response.put("products", productData);
            } else if (textResponse.isEmpty()) {
                textResponse = callGeminiAPI("Không có dữ liệu sản phẩm cụ thể.", userInput, history);
                logger.debug("Không có dữ liệu sản phẩm để gửi đến Gemini API");
            }

            // Lưu tin nhắn bot
            ChatMessage botMessage = new ChatMessage();
            botMessage.setSessionId(sessionId);
            botMessage.setSender(ChatMessage.Sender.BOT);
            botMessage.setMessage(textResponse);
            chatMessageRepository.save(botMessage);

            history.add("Bot: " + textResponse);
            context.put("history", history);
            saveSession(session, context);
            response.put("text", textResponse);

            long endTime = System.currentTimeMillis();
            logger.info("Hoàn thành xử lý yêu cầu chat - Thời gian: {}ms", (endTime - startTime));

            return response;

        } catch (Exception e) {
            logger.error("Lỗi khi xử lý yêu cầu chat", e);
            logger.error("Thông tin request gây lỗi - SessionId: {}, UserInput: {}, Token: {}",
                    sessionId, userInput, token != null ? "có" : "không");
            logger.error("Context hiện tại: {}", context);

            response.put("text", "Ôi, có lỗi xảy ra rồi. Bạn thử lại nhé!");
            response.put("error", true);

            if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
                response.put("errorDetails", e.getMessage());
                response.put("errorType", e.getClass().getName());
                response.put("stackTrace", Arrays.stream(e.getStackTrace())
                        .map(StackTraceElement::toString)
                        .collect(Collectors.joining("\n")));
            }

            return response;
        }
    }

    // API tạo phiên chat
    @PostMapping("/session")
    public ResponseEntity<Map<String, String>> createSession(
            @RequestHeader(value = "Authorization", required = false) String token) {
        logger.info("Yêu cầu tạo phiên chat mới");
        String sessionId = UUID.randomUUID().toString();
        String userId = null; // id_khach_hang
        String taiKhoanId = null; // id_tai_khoan

        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwtToken = token.substring(7);
                logger.debug("Token nhận được: {}", jwtToken);
                try {
                    // Trích xuất username từ token
                    String username = jwtUtil.extractUsername(jwtToken);
                    logger.info("Username trích xuất: {}", username);

                    if (username == null || username.trim().isEmpty()) {
                        logger.error("Username trích xuất từ token là null hoặc rỗng");
                        throw new IllegalArgumentException("Invalid username in token");
                    }

                    // Tìm tai_khoan dựa trên username
                    logger.info("Tìm TaiKhoan với username: {}", username);
                    Optional<TaiKhoan> taiKhoan = taiKhoanRepository.findByUsername(username.trim());
                    if (taiKhoan.isPresent()) {
                        taiKhoanId = taiKhoan.get().getId();
                        logger.info("Tìm thấy TaiKhoan: id = {}", taiKhoanId);

                        // Tìm khach_hang dựa trên id_tai_khoan
                        logger.info("Tìm KhachHang với id_tai_khoan: {}", taiKhoanId);
                        Optional<KhachHang> khachHang = khachHangRepository.findByTaiKhoan_Id(taiKhoanId);
                        if (khachHang.isPresent()) {
                            userId = khachHang.get().getId();
                            logger.info("Tìm thấy KhachHang: id = {}", userId);
                        } else {
                            logger.warn("Không tìm thấy KhachHang với id_tai_khoan: {}", taiKhoanId);
                        }
                    } else {
                        logger.warn("Không tìm thấy TaiKhoan với username: {}", username);
                    }
                } catch (Exception e) {
                    logger.error("Lỗi khi xử lý token JWT: {}", e.getMessage(), e);
                }
            } else {
                logger.warn("Không có token hoặc token không hợp lệ: {}", token);
            }

            ChatSession session = new ChatSession();
            session.setSessionId(sessionId);
            session.setIdKhachHang(userId);
            session.setIdTaiKhoan(taiKhoanId);
            session.setTrangThai(ChatSession.TrangThai.ACTIVE);
            session.setLoaiChat(ChatSession.LoaiChat.BOT);

            logger.debug("Đang lưu phiên chat: sessionId={}, id_khach_hang={}, id_tai_khoan={}", sessionId, userId, taiKhoanId);
            try {
                ChatSession savedSession = chatSessionRepository.save(session);
                if (savedSession == null || savedSession.getSessionId() == null) {
                    logger.error("Lưu phiên chat thất bại: sessionId={}", sessionId);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Internal Server Error", "message", "Không thể tạo phiên chat"));
                }
            } catch (DataIntegrityViolationException e) {
                logger.error("Vi phạm ràng buộc cơ sở dữ liệu khi lưu phiên chat: sessionId={}", sessionId, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Database Error", "message", "Lỗi cơ sở dữ liệu: " + e.getMessage()));
            } catch (Exception e) {
                logger.error("Lỗi bất ngờ khi lưu phiên chat: sessionId={}", sessionId, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Internal Server Error", "message", "Lỗi khi lưu phiên: " + e.getMessage()));
            }

            logger.info("Tạo phiên chat thành công: sessionId={}", sessionId);
            return ResponseEntity.ok(Map.of("sessionId", sessionId));
        } catch (Exception e) {
            logger.error("Lỗi khi tạo phiên chat: sessionId={}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", "Lỗi khi tạo phiên chat: " + e.getMessage()));
        }
    }
    // API lấy lịch sử trò chuyện
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String sessionId) {
        logger.info("Yêu cầu lấy thông tin phiên chat cho sessionId: {}", sessionId);
        try {
            // Tìm phiên chat dựa trên sessionId
            Optional<ChatSession> session = chatSessionRepository.findBySessionId(sessionId);
            if (session.isEmpty()) {
                logger.warn("Không tìm thấy phiên chat với sessionId: {}", sessionId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Not Found", "message", "Phiên chat không tồn tại"));
            }

            // Lấy thông tin phiên chat
            ChatSession chatSession = session.get();
            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", chatSession.getSessionId());
            response.put("idKhachHang", chatSession.getIdKhachHang());
            response.put("idTaiKhoan", chatSession.getIdTaiKhoan());
            response.put("trangThai", chatSession.getTrangThai().toString());
            response.put("loaiChat", chatSession.getLoaiChat().toString());

            // Nếu có idKhachHang, lấy thêm thông tin khách hàng (tùy chọn)
            if (chatSession.getIdKhachHang() != null) {
                Optional<KhachHang> khachHang = khachHangRepository.findById(chatSession.getIdKhachHang());
                if (khachHang.isPresent()) {
                    response.put("tenKhachHang", khachHang.get().getTenKhachHang());
                    response.put("email", khachHang.get().getEmail());
                    logger.info("Tìm thấy thông tin khách hàng cho idKhachHang: {}", chatSession.getIdKhachHang());
                } else {
                    logger.warn("Không tìm thấy khách hàng với idKhachHang: {}", chatSession.getIdKhachHang());
                }
            }

            // Nếu có idTaiKhoan, lấy thêm thông tin tài khoản (tùy chọn)
            if (chatSession.getIdTaiKhoan() != null) {
                Optional<TaiKhoan> taiKhoan = taiKhoanRepository.findById(chatSession.getIdTaiKhoan());
                if (taiKhoan.isPresent()) {
                    response.put("username", taiKhoan.get().getUsername());
                    logger.info("Tìm thấy thông tin tài khoản cho idTaiKhoan: {}", chatSession.getIdTaiKhoan());
                } else {
                    logger.warn("Không tìm thấy tài khoản với idTaiKhoan: {}", chatSession.getIdTaiKhoan());
                }
            }

            logger.info("Lấy thông tin phiên chat thành công cho sessionId: {}", sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Lỗi khi lấy thông tin phiên chat cho sessionId: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", "Lỗi khi lấy thông tin phiên chat: " + e.getMessage()));
        }
    }

    private String callGeminiAPI(String data, String userInput, List<String> history) {
        logger.debug("Bắt đầu gọi Gemini API");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = "Bạn là chatbot bán hàng thông minh, giao tiếp tự nhiên, gần gũi và thân thiện bằng tiếng Việt. " +
                "Dựa trên lịch sử hội thoại và dữ liệu sản phẩm sau đây, trả lời chi tiết, hữu ích và tự nhiên nhất có thể:\n" +
                "Lịch sử hội thoại:\n" + String.join("\n", history) + "\n" +
                "Dữ liệu sản phẩm:\n" + data + "\n" +
                "Câu hỏi của khách hàng: " + userInput;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "safetySettings", List.of(Map.of(
                        "category", "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold", "BLOCK_ONLY_HIGH"
                )),
                "generationConfig", Map.of(
                        "temperature", 0.9,
                        "topK", 1,
                        "topP", 1,
                        "maxOutputTokens", 2048
                )
        );

        logger.debug("Request body gửi đến Gemini API: {}", requestBody);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            String urlWithKey = GEMINI_API_URL + "?key=" + GEMINI_API_KEY;
            logger.debug("Gọi Gemini API với URL: {}", urlWithKey);

            String apiResponse = restTemplate.postForEntity(urlWithKey, entity, String.class).getBody();
            logger.debug("Phản hồi từ Gemini API: {}", apiResponse);

            Map<String, Object> responseMap = objectMapper.readValue(apiResponse, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return parts.get(0).get("text");
                }
            }
            return data; // Fallback
        } catch (Exception e) {
            logger.error("Lỗi khi gọi Gemini API", e);
            logger.error("Dữ liệu gửi đi: {}, User input: {}", data, userInput);
            return "Mình đang gặp chút trục trặc, nhưng đây là thông tin cơ bản: " + data;
        }
    }

    private String getUserIdFromToken(String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwtToken = token.substring(7);
                String username = jwtUtil.extractUsername(jwtToken);
                logger.debug("Giải mã token, username: {}", username);
                if (username != null && !username.trim().isEmpty()) {
                    Optional<TaiKhoan> taiKhoan = taiKhoanRepository.findByUsername(username.trim());
                    if (taiKhoan.isPresent()) {
                        String taiKhoanId = taiKhoan.get().getId();
                        Optional<KhachHang> khachHang = khachHangRepository.findByTaiKhoan_Id(taiKhoanId);
                        if (khachHang.isPresent()) {
                            logger.info("Tìm thấy KhachHang với id: {}", khachHang.get().getId());
                            return khachHang.get().getId();
                        } else {
                            logger.warn("Không tìm thấy KhachHang với id_tai_khoan: {}", taiKhoanId);
                        }
                    } else {
                        logger.warn("Không tìm thấy TaiKhoan với username: {}", username);
                    }
                }
            }
            logger.warn("Token không hợp lệ hoặc không có username");
            return null;
        } catch (Exception e) {
            logger.error("Lỗi khi giải mã token: {}", e.getMessage(), e);
            return null;
        }
    }
    private List<String> getPreferredCategories(String userId) {
        logger.debug("Lấy danh mục ưa thích cho user: {}", userId);
        return List.of("Áo", "Quần");
    }

    private Map<String, Object> loadSession(ChatSession session) {
        try {
            if (session.getContext() != null) {
                return objectMapper.readValue(session.getContext(), new TypeReference<Map<String, Object>>() {});
            }
            return new HashMap<>();
        } catch (Exception e) {
            logger.error("Lỗi khi load session: {}", session.getSessionId(), e);
            return new HashMap<>();
        }
    }

    private void saveSession(ChatSession session, Map<String, Object> context) {
        try {
            session.setContext(objectMapper.writeValueAsString(context));
            chatSessionRepository.save(session);
            logger.debug("Đã lưu session: {}", session.getSessionId());
        } catch (Exception e) {
            logger.error("Lỗi khi lưu session: {}", session.getSessionId(), e);
        }
    }

    private String extractKeyword(String input, String... triggers) {
        try {
            for (String trigger : triggers) {
                if (input.contains(trigger)) {
                    String[] parts = input.split(trigger);
                    if (parts.length > 1) {
                        String[] words = parts[1].trim().split("\\s+");
                        return words.length > 0 ? words[0] : "";
                    }
                }
            }
            String[] words = input.trim().split("\\s+");
            return words.length > 0 ? words[words.length - 1] : input;
        } catch (Exception e) {
            logger.error("Lỗi khi trích xuất từ khóa từ input: {}", input, e);
            return input;
        }
    }

    private Map<String, Object> extractConditions(String userInput) {
        Map<String, Object> conditions = new HashMap<>();
        try {
            String[] keywords = userInput.split("\\s+");
            Pattern pricePattern = Pattern.compile("(\\d+)\\s*(triệu|nghìn|k|tr)?(?:\\s*(đến|và|dưới|từ)\\s*(\\d+)\\s*(triệu|nghìn|k|tr)?)?");
            Matcher priceMatcher = pricePattern.matcher(userInput);

            if (priceMatcher.find()) {
                BigDecimal price1 = parsePrice(priceMatcher.group(1), priceMatcher.group(2));
                String rangeIndicator = priceMatcher.group(3);
                if (rangeIndicator != null && (rangeIndicator.equals("đến") || rangeIndicator.equals("và"))) {
                    BigDecimal price2 = parsePrice(priceMatcher.group(4), priceMatcher.group(5));
                    conditions.put("minPrice", price1);
                    conditions.put("maxPrice", price2);
                } else if (rangeIndicator != null && rangeIndicator.equals("dưới")) {
                    conditions.put("maxPrice", price1);
                } else if (rangeIndicator != null && rangeIndicator.equals("từ")) {
                    conditions.put("minPrice", price1);
                } else {
                    conditions.put("maxPrice", price1);
                }
            }

            for (int i = 0; i < keywords.length; i++) {
                switch (keywords[i]) {
                    case "màu":
                    case "color":
                        if (i + 1 < keywords.length) conditions.put("color", keywords[++i]);
                        break;
                    case "chất":
                    case "liệu":
                    case "material":
                        if (i + 1 < keywords.length) conditions.put("material", keywords[++i]);
                        break;
                    case "danh":
                    case "mục":
                    case "loại":
                    case "category":
                        if (i + 1 < keywords.length) conditions.put("category", keywords[++i]);
                        break;
                    case "sản":
                    case "phẩm":
                    case "product":
                        if (i + 1 < keywords.length) conditions.put("product", keywords[++i]);
                        break;
                    default:
                        if (!conditions.containsKey("product")) conditions.put("product", keywords[i]);
                }
            }

            if (conditions.isEmpty()) {
                conditions.put("keyword", userInput.trim());
            }
        } catch (Exception e) {
            logger.error("Lỗi khi trích xuất điều kiện từ input: {}", userInput, e);
        }
        return conditions;
    }

    private BigDecimal parsePrice(String value, String unit) {
        try {
            BigDecimal price = new BigDecimal(value);
            if (unit != null) {
                switch (unit.toLowerCase()) {
                    case "triệu":
                    case "tr":
                        price = price.multiply(BigDecimal.valueOf(1000000));
                        break;
                    case "nghìn":
                    case "k":
                        price = price.multiply(BigDecimal.valueOf(1000));
                        break;
                }
            }
            return price;
        } catch (Exception e) {
            logger.error("Lỗi khi phân tích giá từ value: {}, unit: {}", value, unit, e);
            return BigDecimal.ZERO;
        }
    }

    private List<SanPhamChiTiet> processComplexQuery(Map<String, Object> conditions) {
        try {
            BigDecimal minPrice = conditions.containsKey("minPrice") ? new BigDecimal(conditions.get("minPrice").toString()) : BigDecimal.ZERO;
            BigDecimal maxPrice = conditions.containsKey("maxPrice") ? new BigDecimal(conditions.get("maxPrice").toString()) : null;
            String category = (String) conditions.get("category");
            String material = (String) conditions.get("material");
            String keyword = (String) conditions.get("keyword");

            logger.debug("Xử lý truy vấn phức tạp với điều kiện: minPrice={}, maxPrice={}, category={}, material={}, keyword={}",
                    minPrice, maxPrice, category, material, keyword);

            List<SanPhamChiTiet> products = chatBotService.getProductsByKeyword(keyword != null ? keyword : "");
            if (maxPrice != null) {
                products = chatBotService.getProductsByPriceRange(minPrice, maxPrice);
            }
            if (category != null) {
                products.retainAll(chatBotService.getProductsByCategory(category));
            }
            if (material != null) {
                products.retainAll(chatBotService.getProductsByMaterial(material));
            }
            return products;
        } catch (Exception e) {
            logger.error("Lỗi khi xử lý truy vấn phức tạp với điều kiện: {}", conditions, e);
            return Collections.emptyList();
        }
    }

    private List<Map<String, Object>> formatProductData(List<SanPhamChiTiet> products) {
        try {
            return products.stream().map(p -> {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("id", p.getSanPham().getId());
                productMap.put("maSanPham", p.getMaSanPhamChiTiet());
                productMap.put("tenSanPham", p.getSanPham().getTenSanPham());
                productMap.put("gia", p.getGia());
                productMap.put("soLuong", p.getSoLuong());
                productMap.put("danhMuc", p.getDanhMuc() != null ? p.getDanhMuc().getTenDanhMuc() : "N/A");
                productMap.put("chatLieu", p.getChatLieu() != null ? p.getChatLieu().getTenChatLieu() : "N/A");
                productMap.put("images", chatBotService.getProductImages(p.getId()));
                productMap.put("link", "/product/" + p.getSanPham().getId());
                return productMap;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Lỗi khi định dạng dữ liệu sản phẩm", e);
            return Collections.emptyList();
        }
    }

    private String formatProductText(List<Map<String, Object>> productData) {
        try {
            return productData.stream()
                    .map(p -> String.format("%s: %,.0f VNĐ (%d sp) [%s - %s]",
                            p.get("maSanPham"),
                            p.get("gia"),
                            p.get("soLuong"),
                            p.get("danhMuc"),
                            p.get("chatLieu")))
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            logger.error("Lỗi khi định dạng văn bản sản phẩm", e);
            return "Không thể hiển thị thông tin sản phẩm";
        }
    }
}