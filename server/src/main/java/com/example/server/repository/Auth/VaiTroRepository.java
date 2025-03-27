package com.example.server.repository.Auth;

import com.example.server.entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface VaiTroRepository extends JpaRepository<VaiTro,String > {
    @Query("select v from VaiTro v where v.tenVaiTro=:tenVaiTro")
    Optional<VaiTro>findByTenVaiTro(String tenVaiTro);
}
