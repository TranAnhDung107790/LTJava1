package com.example.quanlydaotao.service;

import com.example.quanlydaotao.entity.User;
import com.example.quanlydaotao.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Lấy tất cả user chưa xóa
    public List<User> getAllUsers() {
        return userRepository.findByDeletedAtIsNull();
    }

    // Lấy user theo ID
    public User getUserById(UUID id) {

        return userRepository.findById(id)
                .filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy user: " + id));
    }

    // Tìm theo username
    public User getByUsername(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy username: " + username));
    }

    // Thêm user
    public User createUser(User user) {

        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
        }

        if (user.getCreatedAt() == null) {
            user.setCreatedAt(LocalDateTime.now());
        }

        user.setUpdatedAt(LocalDateTime.now());

        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }

        return userRepository.save(user);
    }

    // Cập nhật user
    public User updateUser(UUID id, User request) {

        User user = getUserById(id);

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());

        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // Xóa mềm
    public void deleteUser(UUID id) {

        User user = getUserById(id);

        user.setDeletedAt(LocalDateTime.now());
        user.setIsActive(false);

        userRepository.save(user);
    }

    // Active / Inactive
    public User updateActive(UUID id, Boolean active) {

        User user = getUserById(id);

        user.setIsActive(active);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}