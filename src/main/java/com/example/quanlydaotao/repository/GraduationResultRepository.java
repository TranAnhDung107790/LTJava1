package com.example.quanlydaotao.repository;

import com.example.quanlydaotao.entity.GraduationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GraduationResultRepository extends JpaRepository<GraduationResult, UUID> {
    List<GraduationResult> findByDeletedAtIsNull();
    Optional<GraduationResult> findByStudentIdAndDeletedAtIsNull(UUID studentId);
}