package com.example.server.service.SanPham;



import com.example.server.dto.SanPham.request.ChatLieuCreationRequest;
import com.example.server.dto.SanPham.request.ChatLieuUpdateRequest;
import com.example.server.entity.ChatLieu;

import java.util.List;

public interface ChatLieuService {
    List<ChatLieu> getAll();

    ChatLieu saveChatLieu(ChatLieuCreationRequest chatLieuCreationRequest);

    ChatLieu getChatLieuById(String id);

    ChatLieu updateChatLieu(String id, ChatLieuUpdateRequest chatLieuUpdateRequest);
}
