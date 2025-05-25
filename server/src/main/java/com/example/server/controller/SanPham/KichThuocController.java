package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.KichThuocCreationRequest;
import com.example.server.dto.SanPham.request.KichThuocUpdateRequest;
import com.example.server.entity.KichThuoc;
import com.example.server.service.SanPham.KichThuocService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KichThuocController {
    @Autowired
    KichThuocService kichThuocService;
    @GetMapping("/kichthuoc")
    public List<KichThuoc> getAll(){
        return kichThuocService.getAll();
    }
    @GetMapping("/kichthuoc/{id}")
    public ResponseEntity<?> findById(@PathVariable String id){
        KichThuoc kichThuoc=kichThuocService.getKichThuocById(id);
        if(kichThuoc==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kichThuoc);
    }
    @PostMapping("/addkichthuoc")
    public KichThuoc addKichThuoc(@RequestBody KichThuocCreationRequest kichThuocCreationRequest){
        return kichThuocService.saveKichThuoc(kichThuocCreationRequest);
    }
    @PatchMapping("/kichthuoc/{id}")
    public ResponseEntity<?> updateKichThuoc(@PathVariable String id, @RequestBody KichThuocUpdateRequest kichThuocUpdateRequest){
        KichThuoc kichThuoc=kichThuocService.updateKichThuoc(id,kichThuocUpdateRequest);
        if(kichThuoc==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kichThuoc);
    }
}
