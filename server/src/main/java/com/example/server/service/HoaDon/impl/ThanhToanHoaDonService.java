package com.example.server.service.HoaDon.impl;

import com.example.server.dto.HoaDon.response.ThanhToanHoaDonResponse;
import com.example.server.mapper.impl.ThanhToanHoaDonMapper;
import com.example.server.repository.HoaDon.ThanhToanHoaDonRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThanhToanHoaDonService {
    private final ThanhToanHoaDonRepository repository;
    private final ThanhToanHoaDonMapper mapper;

    public ThanhToanHoaDonService(ThanhToanHoaDonRepository repository, ThanhToanHoaDonMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<ThanhToanHoaDonResponse> getByHoaDonId(String hoaDonId) {
        return repository.findByHoaDonId(hoaDonId)
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}
