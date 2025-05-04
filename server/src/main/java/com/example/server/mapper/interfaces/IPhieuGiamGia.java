package com.example.server.mapper.interfaces;

import com.example.server.dto.HoaDon.request.PhieuGiamGiaRequest;
import com.example.server.dto.HoaDon.response.PhieuGiamGiaResponse;
import com.example.server.entity.PhieuGiamGia;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;



@Mapper(componentModel = "spring")
public interface IPhieuGiamGia {

    PhieuGiamGiaResponse entityToResponse(PhieuGiamGia entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ngayTao", ignore = true)
    @Mapping(target = "ngaySua", ignore = true)
    @Mapping(target = "nguoiTao", ignore = true)
    @Mapping(target = "nguoiSua", ignore = true)
    PhieuGiamGia requestToEntity(PhieuGiamGiaRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ngayTao", ignore = true)
    @Mapping(target = "nguoiTao", ignore = true)
    void updateEntityFromRequest(PhieuGiamGiaRequest request, @MappingTarget PhieuGiamGia entity);
}