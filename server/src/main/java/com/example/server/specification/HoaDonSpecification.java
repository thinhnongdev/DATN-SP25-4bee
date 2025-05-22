package com.example.server.specification;

import com.example.server.dto.HoaDon.request.HoaDonSearchCriteria;
import com.example.server.entity.HoaDon;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
public class HoaDonSpecification {

    public Specification<HoaDon> createSpecification(HoaDonSearchCriteria criteria) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(criteria.getMaHoaDon())) {
                predicates.add(cb.like(
                        cb.lower(root.get("maHoaDon")),
                        "%" + criteria.getMaHoaDon().toLowerCase() + "%"
                ));
            }

            if (StringUtils.hasText(criteria.getTenNguoiNhan())) {
                predicates.add(cb.like(
                        cb.lower(root.get("tenNguoiNhan")),
                        "%" + criteria.getTenNguoiNhan().toLowerCase() + "%"
                ));
            }

            if (StringUtils.hasText(criteria.getSoDienThoai())) {
                predicates.add(cb.like(
                        root.get("soDienThoai"),
                        "%" + criteria.getSoDienThoai() + "%"
                ));
            }

            if (criteria.getTrangThai() != null) {
                predicates.add(cb.equal(root.get("trangThai"), criteria.getTrangThai()));
            }

            if (criteria.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("ngayTao"),
                        criteria.getFromDate()
                ));
            }

            if (criteria.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("ngayTao"),
                        criteria.getToDate()
                ));
            }

            if (StringUtils.hasText(criteria.getIdKhachHang())) {
                predicates.add(cb.equal(
                        root.get("khachHang").get("id"),
                        criteria.getIdKhachHang()
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
