package com.example.server.service.SanPham.impl;

import com.example.server.dto.SanPham.request.ChatLieuCreationRequest;
import com.example.server.dto.SanPham.request.ChatLieuUpdateRequest;
import com.example.server.entity.ChatLieu;
import com.example.server.repository.SanPham.ChatLieuRepository;
import com.example.server.service.SanPham.ChatLieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatLieuServiceImpl implements ChatLieuService {
    @Autowired
    ChatLieuRepository chatLieuRepository;

    @Override
    public List<ChatLieu> getAll() {
        return chatLieuRepository.findAll();
    }

    @Override
    public ChatLieu saveChatLieu(ChatLieuCreationRequest chatLieuCreationRequest) {
        ChatLieu chatLieu = new ChatLieu();
        chatLieu.setMaChatLieu("CL"+ System.currentTimeMillis());
        chatLieu.setTenChatLieu(chatLieuCreationRequest.getTenChatLieu());
        chatLieu.setMoTa(chatLieuCreationRequest.getMoTa());
        chatLieu.setTrangThai(true);
        return chatLieuRepository.save(chatLieu);
    }

    @Override
    public ChatLieu getChatLieuById(String id) {
        return chatLieuRepository.findById(id).orElseThrow(null);
    }

    @Override
    public ChatLieu updateChatLieu(String id, ChatLieuUpdateRequest chatLieuUpdateRequest) {
        Optional<ChatLieu> chatLieuOptional = chatLieuRepository.findById(id);
        if (chatLieuOptional.isPresent()) {
            ChatLieu chatLieu = chatLieuOptional.get();
            chatLieu.setTenChatLieu(chatLieuUpdateRequest.getTenChatLieu());
            chatLieu.setMoTa(chatLieuUpdateRequest.getMoTa());
            return chatLieuRepository.save(chatLieu);
        }
        return null;
    }
}
