package com.example.server.repository.SanPham;


import com.example.server.entity.ChatLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface ChatLieuRepository extends JpaRepository<ChatLieu,String> {
    @Query(value = "select * from chat_lieu order by ngay_tao desc",nativeQuery = true)
    List<ChatLieu>findAll();
}
