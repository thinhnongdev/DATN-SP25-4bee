package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.KieuCucCreationRequest;
import com.example.server.dto.SanPham.request.KieuCucUpdateRequest;
import com.example.server.entity.KieuCuc;
import com.example.server.service.SanPham.KieuCucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class KieuCucController {
    @Autowired
    KieuCucService kieuCucService;

    @GetMapping("/kieucuc")
    public List<KieuCuc> getAll(){
        return kieuCucService.getAll();
    }
    @GetMapping("/check-kieucuc")
    public ResponseEntity<Map<String, Boolean>> checkKieuCucExists(@RequestParam String name) {
        boolean exists = kieuCucService.existsByTenKieuCuc(name);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/addkieucuc")
    public KieuCuc postKieuDang(@RequestBody KieuCucCreationRequest kieuCucCreationRequest){
        return kieuCucService.saveKieuCucAo(kieuCucCreationRequest);
    }
    @GetMapping("/kieucuc/{id}")
    public ResponseEntity<?> getKieuDangById(@PathVariable String id){
        KieuCuc kieuCuc=kieuCucService.getKieuCucAoById(id);
        if(kieuCuc==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuCuc);
    }
    @PatchMapping("/kieucuc/{id}")
    public ResponseEntity<?> updateKieuDang(@PathVariable String id,@RequestBody KieuCucUpdateRequest kieuCucUpdateRequest){
        KieuCuc kieuCuc=kieuCucService.updateKieuCucAo(id,kieuCucUpdateRequest);
        if(kieuCuc==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(kieuCuc);

    }
}
