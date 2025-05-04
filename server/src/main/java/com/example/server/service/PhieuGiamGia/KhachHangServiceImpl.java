package com.example.server.service.PhieuGiamGia;


import com.example.server.dto.PhieuGiamGia.KhachHangDTO;
import com.example.server.repository.NhanVien_KhachHang.KhachHangRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KhachHangServiceImpl implements KhachHangService {

@Autowired
 private KhachHangRepository repository;

@Autowired
private ModelMapper modelMapper;


    @Override
    public List<KhachHangDTO> getAll() {
        return repository.findAll().stream()
                .map(entity -> modelMapper.map(entity, KhachHangDTO.class))
                .collect(Collectors.toList());
    }

}
