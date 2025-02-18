package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.ChatLieuCreationRequest;
import com.example.server.dto.SanPham.request.ChatLieuUpdateRequest;
import com.example.server.entity.ChatLieu;
import com.example.server.service.SanPham.ChatLieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChatLieuController {
    @Autowired
    ChatLieuService chatLieuService;
    @GetMapping("/chatlieu")
    public List<ChatLieu> getAll(){
        return chatLieuService.getAll();
    }
    @GetMapping("/chatlieu/{id}")
    public ResponseEntity<?> findById(@PathVariable String id){
        ChatLieu chatLieu=chatLieuService.getChatLieuById(id);
        if(chatLieu==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(chatLieu);
    }
    @PostMapping("/addchatlieu")
    public ChatLieu addChatLieu(@RequestBody ChatLieuCreationRequest chatLieuCreationRequest){
        return chatLieuService.saveChatLieu(chatLieuCreationRequest);
    }
    @PatchMapping("/chatlieu/{id}")
    public ResponseEntity<?> updateChatLieu(@PathVariable String id, @RequestBody ChatLieuUpdateRequest chatLieuUpdateRequest){
        ChatLieu chatLieu=chatLieuService.updateChatLieu(id,chatLieuUpdateRequest);
        if(chatLieu==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(chatLieu);
    }
}
