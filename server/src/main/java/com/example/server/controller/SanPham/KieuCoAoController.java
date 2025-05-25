package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.KieuCoAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuCoAoUpdateRequest;
import com.example.server.entity.KieuCoAo;
import com.example.server.service.SanPham.KieuCoAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KieuCoAoController {
    @Autowired
    KieuCoAoService kieuCoAoService;

    @GetMapping("/kieucoao")
    public List<KieuCoAo> getAll(){
        return kieuCoAoService.getAll();
    }
    @PostMapping("/addkieucoao")
    public KieuCoAo postKieuCoAo(@RequestBody KieuCoAoCreationRequest kieuCoAoCreationRequest){
        return kieuCoAoService.saveKieuCoAo(kieuCoAoCreationRequest);
    }
    @GetMapping("/kieucoao/{id}")
    public ResponseEntity<?> getKieuCoAoById(@PathVariable String id){
        KieuCoAo kieuCoAo=kieuCoAoService.getKieuCoAoById(id);
        if(kieuCoAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuCoAo);
    }
    @PatchMapping("/kieucoao/{id}")
    public ResponseEntity<?> updateKieuCoAo(@PathVariable String id, @RequestBody KieuCoAoUpdateRequest kieuCoAoUpdateRequest){
        KieuCoAo kieuCoAo=kieuCoAoService.updateKieuCoAo(id,kieuCoAoUpdateRequest);
        if(kieuCoAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuCoAo);

    }
}
