package com.example.server.controller.SanPham;

import com.example.server.dto.SanPham.request.KieuTuiAoCreationRequest;
import com.example.server.dto.SanPham.request.KieuTuiAoUpdateRequest;
import com.example.server.entity.KieuTuiAo;
import com.example.server.service.SanPham.KieuTuiAoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KieuTuiAoController {
    @Autowired
    KieuTuiAoService kieuTuiAoService;
    @GetMapping("/kieutuiao")
    public List<KieuTuiAo> getAll(){
        return kieuTuiAoService.getAll();
    }
    @PostMapping("/addkieutuiao")
    public KieuTuiAo postKieuTuiAo(@RequestBody KieuTuiAoCreationRequest kieuTuiAoCreationRequest){
        return kieuTuiAoService.saveKieuTuiAo(kieuTuiAoCreationRequest);
    }
    @GetMapping("/kieutuiao/{id}")
    public ResponseEntity<?> getKieuTuiAoById(@PathVariable String id){
        KieuTuiAo kieuTuiAo=kieuTuiAoService.getKieuTuiAoById(id);
        if(kieuTuiAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuTuiAo);
    }
    @PatchMapping("/kieutuiao/{id}")
    public ResponseEntity<?> updateKieuTuiAo(@PathVariable String id, @RequestBody KieuTuiAoUpdateRequest kieuTuiAoUpdateRequest){
        KieuTuiAo kieuTuiAo=kieuTuiAoService.updateKieuTuiAo(id,kieuTuiAoUpdateRequest);
        if(kieuTuiAo==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuTuiAo);
    }
}
