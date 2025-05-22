package com.example.server.repository.SanPham;


import com.example.server.entity.HoaTiet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface HoaTietRepository extends JpaRepository<HoaTiet,String> {
    @Query(value = "select * from hoa_tiet order by ngay_tao desc",nativeQuery = true)
    List<HoaTiet> findAll();
}
