package com.example.server.controller.SanPham;

import com.example.server.dto.SanPham.request.HoaTietCreationRequest;
import com.example.server.dto.SanPham.request.HoaTietUpdateRequest;
import com.example.server.entity.HoaTiet;
import com.example.server.service.SanPham.HoaTietService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class HoaTietController {
    @Autowired
    HoaTietService hoaTietService;
    @GetMapping("/hoatiet")
    public List<HoaTiet> getAll(){
        return hoaTietService.getAll();
    }
    @GetMapping("/hoatiet/{id}")
    public ResponseEntity<?> findById(@PathVariable String id){
        HoaTiet hoaTiet=hoaTietService.getHoaTietByID(id);
        if(hoaTiet==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(hoaTiet);
    }
    @PostMapping("/addhoatiet")
    public HoaTiet addHoaTiet(@RequestBody HoaTietCreationRequest hoaTietCreationRequest){
        return hoaTietService.saveHoaTiet(hoaTietCreationRequest);
    }
    @PatchMapping("/hoatiet/{id}")
    public ResponseEntity<?> updateHoaTiet(@PathVariable String id, @RequestBody HoaTietUpdateRequest hoaTietUpdateRequest){
        HoaTiet hoaTiet=hoaTietService.updateHoaTiet(id,hoaTietUpdateRequest);
        if(hoaTiet==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(hoaTiet);
    }
}
