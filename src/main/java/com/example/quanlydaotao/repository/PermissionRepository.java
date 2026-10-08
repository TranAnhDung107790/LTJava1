package com.example.quanlydaotao.repository;

import com.example.quanlydaotao.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    // Tìm theo tên quyền
    Optional<Permission> findByName(String name);

    // Lấy tất cả quyền chưa bị xóa
    List<Permission> findByDeletedAtIsNull();

    // Lấy quyền theo module (vd: "USER", "STUDENT", ...)
    List<Permission> findByModuleAndDeletedAtIsNull(String module);

    // Lấy quyền đang active
    List<Permission> findByIsActiveAndDeletedAtIsNull(Boolean isActive);
}
