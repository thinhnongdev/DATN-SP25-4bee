package com.example.phieu_giam_gia.ModelMapper;

import com.example.phieu_giam_gia.dto.PhieuGiamGiaDTO;
import com.example.phieu_giam_gia.entity.PhieuGiamGia;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }


}