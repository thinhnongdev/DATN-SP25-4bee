package com.example.server.controller.SanPham;


import com.example.server.dto.SanPham.request.MauSacCreationRequest;
import com.example.server.dto.SanPham.request.MauSacUpdateRequest;
import com.example.server.entity.MauSac;
import com.example.server.service.SanPham.MauSacService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MauSacController {
    @Autowired
    private MauSacService mauSacService;
    @GetMapping("/mausac")
    public List<MauSac> getAllMauSac(){
        return mauSacService.getAll();
    }
    @PostMapping("/addmausac")
    public MauSac AddMauSac(@RequestBody MauSacCreationRequest mauSacCreationRequest){
        return mauSacService.saveMauSac(mauSacCreationRequest);
    }
    @GetMapping("/mausac/{id}")
    public ResponseEntity<?> getMauSacById(@PathVariable String id){
        MauSac mauSac=mauSacService.getMauSacByID(id);
        if(mauSac==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(mauSac);
    }
    @PatchMapping("/mausac/{id}")
    public ResponseEntity<?> updateMauSac(@PathVariable String id,@RequestBody MauSacUpdateRequest mauSacUpdateRequest){
        MauSac mauSac=mauSacService.updateMauSac(id,mauSacUpdateRequest);
        if(mauSac==null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return ResponseEntity.ok(mauSac);

    }
}
