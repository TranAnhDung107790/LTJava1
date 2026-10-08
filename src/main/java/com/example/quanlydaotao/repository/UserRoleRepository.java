package com.example.quanlydaotao.repository;

import com.example.quanlydaotao.entity.UserRole;
import com.example.quanlydaotao.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    // Lấy tất cả role của 1 user (chưa xóa)
    List<UserRole> findByIdUserIdAndDeletedAtIsNull(UUID userId);

    // Lấy tất cả user có 1 role nhất định (chưa xóa)
    List<UserRole> findByIdRoleIdAndDeletedAtIsNull(UUID roleId);

    // Lấy tất cả bản ghi chưa xóa
    List<UserRole> findByDeletedAtIsNull();

    // Kiểm tra user đã có role chưa
    boolean existsByIdUserIdAndIdRoleIdAndDeletedAtIsNull(UUID userId, UUID roleId);
}
