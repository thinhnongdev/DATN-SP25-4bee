package com.example.phieu_giam_gia.service.impl;

import com.example.phieu_giam_gia.dto.KhachHangDTO;
import com.example.phieu_giam_gia.entity.KhachHang;
import com.example.phieu_giam_gia.repository.KhachHangRepository;
import com.example.phieu_giam_gia.service.KhachHangService;
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
