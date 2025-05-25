package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.ThuongHieuCreationRequest;
import com.example.server.dto.SanPham.request.ThuongHieuUpdateRequest;
import com.example.server.entity.ThuongHieu;
import com.example.server.service.SanPham.ThuongHieuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class ThuongHieuController {
    @Autowired
    ThuongHieuService thuongHieuService;
    @GetMapping("/thuonghieu")
    public List<ThuongHieu> getAll(){
        return thuongHieuService.getAll();
    }
    @GetMapping("/thuonghieu/{id}")
    public ResponseEntity<?> findThuongHieuById(@PathVariable String id){
        ThuongHieu thuongHieu=thuongHieuService.getThuongHieuByID(id);
        if(thuongHieu==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(thuongHieu);
    }
    @PostMapping("/addthuonghieu")
    public ThuongHieu addThuongHieu(@RequestBody ThuongHieuCreationRequest thuongHieuCreationRequest){
        return thuongHieuService.saveThuongHieu(thuongHieuCreationRequest);
    }
    @PatchMapping("/thuonghieu/{id}")
    public ResponseEntity<?> updateChatLieu(@PathVariable String id, @RequestBody ThuongHieuUpdateRequest thuongHieuUpdateRequest){
        ThuongHieu thuongHieu=thuongHieuService.updateThuongHieu(id,thuongHieuUpdateRequest);
        if(thuongHieu==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(thuongHieu);
    }

}
