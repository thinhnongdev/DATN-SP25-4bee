package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.KieuCoTayAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuCoTayAoUpdateRequest;
import com.example.server.entity.KieuCoTayAo;
import com.example.server.service.SanPham.KieuCoTayAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KieuCoTayAoController {
    @Autowired
    KieuCoTayAoService kieuCoTayAoService;

    @GetMapping("/kieucotayao")
    public List<KieuCoTayAo> getAll(){
        return kieuCoTayAoService.getAll();
    }
    @PostMapping("/addkieucotayao")
    public KieuCoTayAo postKieuCoAo(@RequestBody KieuCoTayAoCreationRequest kieuCoTayAoCreationRequest){
        return kieuCoTayAoService.saveKieuCoTayAo(kieuCoTayAoCreationRequest);
    }
    @GetMapping("/kieucotayao/{id}")
    public ResponseEntity<?> getKieuCoAoById(@PathVariable String id){
        KieuCoTayAo kieuCoTayAo=kieuCoTayAoService.getKieuCoTayAoById(id);
        if(kieuCoTayAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuCoTayAo);
    }
    @PatchMapping("/kieucotayao/{id}")
    public ResponseEntity<?> updateKieuCoAo(@PathVariable String id, @RequestBody KieuCoTayAoUpdateRequest kieuCoTayAoUpdateRequest){
        KieuCoTayAo kieuCoTayAo=kieuCoTayAoService.updateKieuCoTayAo(id,kieuCoTayAoUpdateRequest);
        if(kieuCoTayAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuCoTayAo);

    }
}
