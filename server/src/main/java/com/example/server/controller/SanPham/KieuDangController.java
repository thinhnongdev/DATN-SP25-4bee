package com.example.server.controller.SanPham;

import com.example.server.dto.SanPham.request.KieuDangCreationRequest;
import com.example.server.dto.SanPham.request.KieuDangUpdateRequest;
import com.example.server.entity.KieuDang;
import com.example.server.service.SanPham.KieuDangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KieuDangController {
    @Autowired
     KieuDangService kieuDangService;

    @GetMapping("/kieudang")
    public List<KieuDang> getAll(){
        return kieuDangService.getAll();
    }
    @PostMapping("/addkieudang")
    public KieuDang postKieuDang(@RequestBody KieuDangCreationRequest kieuDangCreationRequest){
        return kieuDangService.saveKieuDang(kieuDangCreationRequest);
    }
    @GetMapping("/kieudang/{id}")
    public ResponseEntity<?> getKieuDangById(@PathVariable String id){
        KieuDang kieuDang=kieuDangService.getKieuDangById(id);
        if(kieuDang==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuDang);
    }
    @PatchMapping("/kieudang/{id}")
    public ResponseEntity<?> updateKieuDang(@PathVariable String id,@RequestBody KieuDangUpdateRequest kieuDangUpdateRequest){
        KieuDang kieuDang=kieuDangService.updateKieuDang(id,kieuDangUpdateRequest);
        if(kieuDang==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuDang);

    }
}
