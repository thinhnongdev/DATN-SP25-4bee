package com.example.server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/khach-hang/login",
            "/api/auth/khach-hang/register",
            "/api/auth/khach-hang/forgot-password",
            "/api/auth/reset-password",
            "/api/auth/introspect",
            "/api/auth/logout",
            "/api/auth/refreshToken",
            "/api/auth/getInfoUser",
            "/api/auth/register",
            "/api/auth/change-password",
            "/api/chat", // Thêm /api/chat vào đây
            "/ws/**",       // Add WebSocket endpoint
            "/ws/info/**",  // Add WebSocket info endpoint
            "/topic/**",     // Add STOMP destination prefix
            "api/admin/chatlieu",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "api/admin/kieutuiao",
            "/api/admin/sanpham/**",
    };
    // Thêm mảng riêng cho các GET endpoints công khai
    private final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/auth/check-email",
            "/api/auth/check-phone",
            "/api/auth/verify-reset-token",
            "/api/auth/khach-hang/forgot-password",
            "/api/admin/khach_hang/check-email", // Thêm endpoint admin check email
            "/api/admin/khach_hang/check-phone"  // Thêm endpoint admin check phone
    };

    private final String[] adminAndStaffEndpoints = {
            "/api/admin/hoa-don/**",
            "/api/admin/ban-hang/**",
            "/api/admin/khach_hang",
            "/api/admin/khach_hang/diaChi/**",
    };
    private final String[] adminOnlyEndpoints = {
            "/api/admin/nhan_vien/**",
            "/api/admin/thong-ke/**",
            "/api/admin/khach_hang/**",
            "/api/admin/nhan_vien/**"
    };
    @Autowired
    CustomJwtDecoder customJwtDecoder;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.addAllowedOrigin("https://datn-sp-25-4bee.vercel.app");

        configuration.addAllowedMethod("*");

        configuration.addAllowedHeader("*");

        configuration.setAllowCredentials(true);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    //    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//        http
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/**").permitAll()
//                        .anyRequest().authenticated()
//                );
//
//        return http.build();
//    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request ->
                request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                        // Thêm matcher cho các GET endpoints công khai
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                        .requestMatchers("/api/client/**").permitAll()
                        .requestMatchers(adminAndStaffEndpoints).hasAnyRole("ADMIN", "NHAN_VIEN")
                        .requestMatchers(adminOnlyEndpoints).hasRole("ADMIN")
                        .anyRequest().authenticated());

        httpSecurity.csrf(AbstractHttpConfigurer::disable);// Vô hiệu hóa CSRF
        httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource()));// Thêm CORS vào Security
        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwtConfigurer -> jwtConfigurer
                        .decoder(customJwtDecoder)
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
        );
        return httpSecurity.build();
    }

    //convert authority từ SCOPE->ROLE
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

}
