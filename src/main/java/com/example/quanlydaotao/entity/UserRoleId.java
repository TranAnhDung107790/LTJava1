package com.example.quanlydaotao.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Khóa tổng hợp (composite key) cho bảng user_roles
 * Gồm: user_id + role_id
 */
@Embeddable
public class UserRoleId implements Serializable {

    @Column(name = "user_id", columnDefinition = "uniqueidentifier")
    private UUID userId;

    @Column(name = "role_id", columnDefinition = "uniqueidentifier")
    private UUID roleId;

    public UserRoleId() {}

    public UserRoleId(UUID userId, UUID roleId) {
        this.userId = userId;
        this.roleId = roleId;
    }

    // Getter + Setter

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getRoleId() {
        return roleId;
    }

    public void setRoleId(UUID roleId) {
        this.roleId = roleId;
    }

    // equals + hashCode bắt buộc khi dùng @Embeddable

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserRoleId)) return false;
        UserRoleId that = (UserRoleId) o;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(roleId, that.roleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, roleId);
    }
}
