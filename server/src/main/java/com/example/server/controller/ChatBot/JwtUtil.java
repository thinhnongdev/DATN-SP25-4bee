package com.example.server.controller.ChatBot;

import com.example.server.repository.Auth.TaiKhoanRepository;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.signerKey}") // Thay đổi từ jwt.secret sang jwt.signerKey
    private String secretKey;


    public String extractUsername(String token) {
        try {
            String username = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            logger.info("Username trích xuất: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("Lỗi khi trích xuất username từ token: {}", e.getMessage(), e);
            return null;
        }
    }

    public String extractUserId(String token) {
        logger.info("Trích xuất userId từ token");
        try {
            if (isTokenExpired(token)) {
                logger.warn("Token đã hết hạn");
                throw new ExpiredJwtException(null, null, "Token đã hết hạn");
            }
            String userId = extractClaim(token, Claims::getSubject);
            logger.debug("Trích xuất userId thành công: {}", userId);
            return userId;
        } catch (ExpiredJwtException e) {
            logger.error("Token đã hết hạn: {}", e.getMessage());
            throw e;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Lỗi khi trích xuất userId từ token: {}", e.getMessage());
            throw new IllegalArgumentException("Token không hợp lệ: " + e.getMessage());
        }
    }

    private <T> T extractClaim(String token, ClaimsResolver<T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.resolve(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.error("Lỗi khi giải mã token: {}", e.getMessage());
            throw e;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @FunctionalInterface
    interface ClaimsResolver<T> {
        T resolve(Claims claims);
    }
}