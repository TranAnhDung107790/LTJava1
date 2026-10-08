package com.example.quanlydaotao.service;

import com.example.quanlydaotao.entity.Permission;
import com.example.quanlydaotao.repository.PermissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    // Lấy tất cả quyền chưa xóa
    public List<Permission> getAllPermissions() {
        return permissionRepository.findByDeletedAtIsNull();
    }

    // Lấy quyền theo ID
    public Permission getPermissionById(UUID id) {
        return permissionRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy permission: " + id));
    }

    // Lấy quyền theo tên
    public Permission getByName(String name) {
        return permissionRepository.findByName(name)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy permission: " + name));
    }

    // Lấy quyền theo module
    public List<Permission> getByModule(String module) {
        return permissionRepository.findByModuleAndDeletedAtIsNull(module);
    }

    // Lấy quyền đang active
    public List<Permission> getActivePermissions() {
        return permissionRepository.findByIsActiveAndDeletedAtIsNull(true);
    }

    // Thêm quyền mới
    public Permission createPermission(Permission permission) {

        if (permission.getId() == null) {
            permission.setId(UUID.randomUUID());
        }

        if (permission.getCreatedAt() == null) {
            permission.setCreatedAt(LocalDateTime.now());
        }

        permission.setUpdatedAt(LocalDateTime.now());

        if (permission.getIsActive() == null) {
            permission.setIsActive(true);
        }

        return permissionRepository.save(permission);
    }

    // Cập nhật quyền
    public Permission updatePermission(UUID id, Permission request) {

        Permission permission = getPermissionById(id);

        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
        permission.setModule(request.getModule());
        permission.setAction(request.getAction());

        permission.setUpdatedAt(LocalDateTime.now());
        permission.setUpdatedBy(request.getUpdatedBy());

        return permissionRepository.save(permission);
    }

    // Xóa mềm
    public void deletePermission(UUID id) {

        Permission permission = getPermissionById(id);

        permission.setDeletedAt(LocalDateTime.now());
        permission.setIsActive(false);

        permissionRepository.save(permission);
    }

    // Active / Inactive
    public Permission updateActive(UUID id, Boolean active) {

        Permission permission = getPermissionById(id);

        permission.setIsActive(active);
        permission.setUpdatedAt(LocalDateTime.now());

        return permissionRepository.save(permission);
    }
}
