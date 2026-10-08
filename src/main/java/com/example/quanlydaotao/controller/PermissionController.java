package com.example.quanlydaotao.controller;

import com.example.quanlydaotao.entity.Permission;
import com.example.quanlydaotao.service.PermissionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@CrossOrigin("*")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {

        return ResponseEntity.ok(
                permissionService.getAllPermissions()
        );
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Permission> getPermissionById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                permissionService.getPermissionById(id)
        );
    }

    // GET BY NAME
    @GetMapping("/name/{name}")
    public ResponseEntity<Permission> getByName(
            @PathVariable String name) {

        return ResponseEntity.ok(
                permissionService.getByName(name)
        );
    }

    // GET BY MODULE (vd: /api/permissions/module/USER)
    @GetMapping("/module/{module}")
    public ResponseEntity<List<Permission>> getByModule(
            @PathVariable String module) {

        return ResponseEntity.ok(
                permissionService.getByModule(module)
        );
    }

    // GET ACTIVE PERMISSIONS
    @GetMapping("/active")
    public ResponseEntity<List<Permission>> getActivePermissions() {

        return ResponseEntity.ok(
                permissionService.getActivePermissions()
        );
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Permission> createPermission(
            @RequestBody Permission permission) {

        return ResponseEntity.ok(
                permissionService.createPermission(permission)
        );
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Permission> updatePermission(
            @PathVariable UUID id,
            @RequestBody Permission permission) {

        return ResponseEntity.ok(
                permissionService.updatePermission(id, permission)
        );
    }

    // DELETE SOFT
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePermission(
            @PathVariable UUID id) {

        permissionService.deletePermission(id);

        return ResponseEntity.ok(
                "Xóa permission thành công"
        );
    }

    // ACTIVE / INACTIVE
    @PatchMapping("/{id}/active")
    public ResponseEntity<Permission> updateActive(
            @PathVariable UUID id,
            @RequestParam Boolean active) {

        return ResponseEntity.ok(
                permissionService.updateActive(id, active)
        );
    }
}
