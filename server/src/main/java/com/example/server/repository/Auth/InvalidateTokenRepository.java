package com.example.server.repository.Auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.server.entity.InvalidateToken;
@Repository
public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken,String> {
}
