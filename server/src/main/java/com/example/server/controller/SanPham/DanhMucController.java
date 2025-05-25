package com.example.server.controller.SanPham;

import com.example.server.dto.SanPham.request.DanhMucCreationRequest;
import com.example.server.dto.SanPham.request.DanhMucUpdateRequest;
import com.example.server.entity.DanhMuc;
import com.example.server.service.SanPham.DanhMucService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://datn-sp-25-4bee.vercel.app", allowCredentials = "true")
public class DanhMucController {
    @Autowired
    DanhMucService danhMucService;
    @GetMapping("/danhmuc")
    public List<DanhMuc> getAll(){
        return danhMucService.getAll();
    }
    @GetMapping("/danhmuc/{id}")
    public ResponseEntity<?> findById(@PathVariable String id){
        DanhMuc danhMuc=danhMucService.getDanhMucByID(id);
        if(danhMuc==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(danhMuc);
    }
    @PostMapping("/adddanhmuc")
    public DanhMuc addHoaTiet(@RequestBody DanhMucCreationRequest danhMucCreationRequest){
        return danhMucService.saveDanhMuc(danhMucCreationRequest);
    }
    @PatchMapping("/danhmuc/{id}")
    public ResponseEntity<?> updateHoaTiet(@PathVariable String id, @RequestBody DanhMucUpdateRequest danhMucUpdateRequest){
        DanhMuc danhMuc=danhMucService.updateDanhMuc(id,danhMucUpdateRequest);
        if(danhMuc==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(danhMuc);
    }
}
