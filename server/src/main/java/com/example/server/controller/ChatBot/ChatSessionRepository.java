package com.example.server.controller.ChatBot;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public   interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    Optional<ChatSession> findBySessionId(String sessionId);
    Optional<ChatSession> findById(String sessionId);
    Optional<ChatSession> findByIdTaiKhoan(String idTaiKhoan);
    List<ChatSession> findByIdNhanVien(String idNhanVien);
}