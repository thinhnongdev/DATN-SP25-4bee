package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.KieuTayAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuTayAoUpdateRequest;
import com.example.server.entity.KieuTayAo;
import com.example.server.service.SanPham.KieuTayAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KieuTayAoController {
    @Autowired
    KieuTayAoService kieuTayAoService;
    @GetMapping("/kieutayao")
    public List<KieuTayAo> getAll(){
        return kieuTayAoService.getAll();
    }
    @PostMapping("/addkieutayao")
    public KieuTayAo postKieuTayAo(@RequestBody KieuTayAoCreationRequest kieuTayAoCreationRequest){
        return kieuTayAoService.saveKieuTayAo(kieuTayAoCreationRequest);
    }
    @GetMapping("/kieutayao/{id}")
    public ResponseEntity<?> getKieuTayAoById(@PathVariable String id){
        KieuTayAo kieuTayAo=kieuTayAoService.getKieuTayAoById(id);
        if(kieuTayAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuTayAo);
    }
    @PatchMapping("/kieutayao/{id}")
    public ResponseEntity<?> updateKieuTayAo(@PathVariable String id, @RequestBody KieuTayAoUpdateRequest kieuTayAoUpdateRequest){
        KieuTayAo kieuTayAo=kieuTayAoService.updateKieuTayAo(id,kieuTayAoUpdateRequest);
        if(kieuTayAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuTayAo);

    }
}
