package com.example.quanlydaotao.repository;

import com.example.quanlydaotao.n11.entity.GraduationResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GraduationResultRepository extends JpaRepository<GraduationResult, UUID> {

    @Query("SELECT r FROM GraduationResult r " +
            "WHERE r.isActive = true " +
            "AND (:result IS NULL OR r.result = :result)")
    Page<GraduationResult> findByIsActiveTrueAndResult(
            @Param("result") Short result,
            Pageable pageable
    );

    Optional<GraduationResult> findByIdAndIsActiveTrue(UUID id);

    List<GraduationResult> findByStudentIdAndIsActiveTrue(UUID studentId);

    Optional<GraduationResult> findFirstByStudentIdAndConditionIdAndIsActiveTrueOrderByCreatedAtDesc(
            UUID studentId,
            UUID conditionId
    );

    // Kiểm tra bộ điều kiện
    @Query(value = "SELECT COUNT(1) FROM dbo.graduation_conditions WHERE id = :conditionId AND is_active = 1", nativeQuery = true)
    int countActiveConditionById(@Param("conditionId") UUID conditionId);

    // Kiểm tra sinh viên (Hàm vừa bổ sung)
    @Query(value = "SELECT COUNT(1) FROM dbo.students_ WHERE id = :studentId AND is_active = 1", nativeQuery = true)
    int countActiveStudentById(@Param("studentId") UUID studentId);

    // Lấy tiêu chí từ bộ điều kiện
    @Query(value = "SELECT min_total_credits, min_gpa, max_failed_credits " +
            "FROM dbo.graduation_conditions " +
            "WHERE id = :conditionId AND is_active = 1", nativeQuery = true)
    List<Object[]> getConditionCriteria(@Param("conditionId") UUID conditionId);

    // Lấy danh sách ID sinh viên
    @Query(value = "SELECT id FROM dbo.students_ WHERE is_active = 1", nativeQuery = true)
    List<UUID> findActiveStudentIds();
}