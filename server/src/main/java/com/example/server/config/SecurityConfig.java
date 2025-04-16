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
            "/api/auth/introspect",
            "/api/auth/logout",
            "/api/auth/refreshToken",
            "/api/auth/getInfoUser",
            "/api/auth/register",
            "/api/chat", // Thêm /api/chat vào đây
            "/ws/**",       // Add WebSocket endpoint
            "/ws/info/**",  // Add WebSocket info endpoint
            "/topic/**"     // Add STOMP destination prefix
    };

    private final String[] adminAndStaffEndpoints={
            "/api/admin/hoa-don/**",
            "/api/admin/ban-hang/**",
            "/api/admin/sanpham/**",
            "/api/admin/khach_hang",
            "/api/admin/khach_hang/diaChi/**",
    };
    private final String[] adminOnlyEndpoints={
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

        configuration.addAllowedOrigin("http://localhost:3000");

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
//        http
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/api/**").permitAll()
//                        .anyRequest().permitAll()
//                );
        httpSecurity.authorizeHttpRequests(request ->
                request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/client/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/client/**").permitAll()

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
