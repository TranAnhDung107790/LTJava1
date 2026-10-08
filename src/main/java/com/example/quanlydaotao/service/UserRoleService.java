package com.example.quanlydaotao.service;

import com.example.quanlydaotao.entity.UserRole;
import com.example.quanlydaotao.entity.UserRoleId;
import com.example.quanlydaotao.repository.UserRoleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserRoleService {

    private final UserRoleRepository userRoleRepository;

    public UserRoleService(UserRoleRepository userRoleRepository) {
        this.userRoleRepository = userRoleRepository;
    }

    // Lấy tất cả bản ghi chưa xóa
    public List<UserRole> getAllUserRoles() {
        return userRoleRepository.findByDeletedAtIsNull();
    }

    // Lấy tất cả role của 1 user
    public List<UserRole> getRolesByUserId(UUID userId) {
        return userRoleRepository.findByIdUserIdAndDeletedAtIsNull(userId);
    }

    // Lấy tất cả user có role nhất định
    public List<UserRole> getUsersByRoleId(UUID roleId) {
        return userRoleRepository.findByIdRoleIdAndDeletedAtIsNull(roleId);
    }

    // Gán role cho user
    public UserRole assignRole(UUID userId, UUID roleId, UserRole request) {

        // Kiểm tra xem user đã có role này chưa
        if (userRoleRepository.existsByIdUserIdAndIdRoleIdAndDeletedAtIsNull(userId, roleId)) {
            throw new RuntimeException(
                    "User " + userId + " đã có role " + roleId + " rồi"
            );
        }

        UserRole userRole = new UserRole();
        userRole.setId(new UserRoleId(userId, roleId));

        userRole.setAssignedAt(LocalDateTime.now());
        userRole.setAssignedBy(request.getAssignedBy());
        userRole.setExpiredAt(request.getExpiredAt());

        userRole.setIsActive(true);
        userRole.setCreatedAt(LocalDateTime.now());
        userRole.setUpdatedAt(LocalDateTime.now());
        userRole.setCreatedBy(request.getCreatedBy());

        return userRoleRepository.save(userRole);
    }

    // Cập nhật thông tin gán role (expired_at, is_active, ...)
    public UserRole updateUserRole(UUID userId, UUID roleId, UserRole request) {

        UserRole userRole = userRoleRepository
                .findById(new UserRoleId(userId, roleId))
                .filter(ur -> ur.getDeletedAt() == null)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy user_role: userId=" + userId + ", roleId=" + roleId
                        ));

        userRole.setExpiredAt(request.getExpiredAt());
        userRole.setIsActive(request.getIsActive());
        userRole.setUpdatedAt(LocalDateTime.now());
        userRole.setUpdatedBy(request.getUpdatedBy());

        return userRoleRepository.save(userRole);
    }

    // Thu hồi role (xóa mềm)
    public void revokeRole(UUID userId, UUID roleId) {

        UserRole userRole = userRoleRepository
                .findById(new UserRoleId(userId, roleId))
                .filter(ur -> ur.getDeletedAt() == null)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy user_role: userId=" + userId + ", roleId=" + roleId
                        ));

        userRole.setDeletedAt(LocalDateTime.now());
        userRole.setIsActive(false);

        userRoleRepository.save(userRole);
    }

    // Active / Inactive role của user
    public UserRole updateActive(UUID userId, UUID roleId, Boolean active) {

        UserRole userRole = userRoleRepository
                .findById(new UserRoleId(userId, roleId))
                .filter(ur -> ur.getDeletedAt() == null)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy user_role: userId=" + userId + ", roleId=" + roleId
                        ));

        userRole.setIsActive(active);
        userRole.setUpdatedAt(LocalDateTime.now());

        return userRoleRepository.save(userRole);
    }
}
