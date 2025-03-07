package com.example.server.repository.Auth;

import com.example.server.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan,String> {
    boolean existsByUsername(String username);

    Optional<TaiKhoan> findByUsername(String username);
}
