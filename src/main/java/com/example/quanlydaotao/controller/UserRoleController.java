package com.example.quanlydaotao.controller;

import com.example.quanlydaotao.entity.UserRole;
import com.example.quanlydaotao.service.UserRoleService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-roles")
@CrossOrigin("*")
public class UserRoleController {

    private final UserRoleService userRoleService;

    public UserRoleController(UserRoleService userRoleService) {
        this.userRoleService = userRoleService;
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<UserRole>> getAllUserRoles() {

        return ResponseEntity.ok(
                userRoleService.getAllUserRoles()
        );
    }

    // GET tất cả role của 1 user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserRole>> getRolesByUserId(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                userRoleService.getRolesByUserId(userId)
        );
    }

    // GET tất cả user có role nhất định
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<UserRole>> getUsersByRoleId(
            @PathVariable UUID roleId) {

        return ResponseEntity.ok(
                userRoleService.getUsersByRoleId(roleId)
        );
    }

    // ASSIGN - Gán role cho user
    @PostMapping("/user/{userId}/role/{roleId}")
    public ResponseEntity<UserRole> assignRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId,
            @RequestBody(required = false) UserRole request) {

        if (request == null) request = new UserRole();

        return ResponseEntity.ok(
                userRoleService.assignRole(userId, roleId, request)
        );
    }

    // UPDATE - Cập nhật thông tin gán role (expiredAt, isActive, ...)
    @PutMapping("/user/{userId}/role/{roleId}")
    public ResponseEntity<UserRole> updateUserRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId,
            @RequestBody UserRole request) {

        return ResponseEntity.ok(
                userRoleService.updateUserRole(userId, roleId, request)
        );
    }

    // REVOKE - Thu hồi role (xóa mềm)
    @DeleteMapping("/user/{userId}/role/{roleId}")
    public ResponseEntity<String> revokeRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId) {

        userRoleService.revokeRole(userId, roleId);

        return ResponseEntity.ok(
                "Thu hồi role thành công"
        );
    }

    // ACTIVE / INACTIVE role của user
    @PatchMapping("/user/{userId}/role/{roleId}/active")
    public ResponseEntity<UserRole> updateActive(
            @PathVariable UUID userId,
            @PathVariable UUID roleId,
            @RequestParam Boolean active) {

        return ResponseEntity.ok(
                userRoleService.updateActive(userId, roleId, active)
        );
    }
}
