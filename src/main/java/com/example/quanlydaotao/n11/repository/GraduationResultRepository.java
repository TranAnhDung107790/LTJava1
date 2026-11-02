package com.example.quanlydaotao.n11.repository;

import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
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
            "AND (:result IS NULL OR r.result = :result) " +
            "AND (:conditionId IS NULL OR r.conditionId = :conditionId)")
    Page<GraduationResult> findByIsActiveTrueAndResult(
            @Param("result") Short result,
            @Param("conditionId") UUID conditionId,
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

    // Kiểm tra sinh viên trên bảng students (UI) hoặc students_ (nếu có)
    @Query(value = "SELECT CASE WHEN EXISTS (SELECT 1 FROM dbo.students WHERE id = :studentId) " +
            "OR EXISTS (SELECT 1 FROM dbo.students_ WHERE id = :studentId AND is_active = 1) " +
            "THEN 1 ELSE 0 END", nativeQuery = true)
    int countActiveStudentById(@Param("studentId") UUID studentId);

    // Lấy tiêu chí từ bộ điều kiện
    @Query(value = "SELECT min_total_credits, min_gpa, max_failed_credits " +
            "FROM dbo.graduation_conditions " +
            "WHERE id = :conditionId AND is_active = 1", nativeQuery = true)
    List<Object[]> getConditionCriteria(@Param("conditionId") UUID conditionId);

    // Lấy danh sách ID sinh viên (ưu tiên students_, bổ sung students nếu thiếu)
    @Query(value = "SELECT DISTINCT id FROM (" +
            "SELECT id FROM dbo.students " +
            "UNION " +
            "SELECT id FROM dbo.students_ WHERE is_active = 1" +
            ") t", nativeQuery = true)
    List<UUID> findActiveStudentIds();

    // Lấy thông tin tổng kết học tập thực tế từ student_summaries (student_id, gpa_value, total_credits, failed_credits)
    @Query(value = "SELECT student_id, gpa_value, total_credits, failed_credits " +
            "FROM dbo.student_summaries " +
            "WHERE is_active = 1 AND student_id IS NOT NULL", nativeQuery = true)
    List<Object[]> findAllStudentSummaries();

    // Lấy danh sách ID sinh viên thuộc riêng một khóa cụ thể (VD: '24' cho K24, '25' cho K25, '23' cho K23)
    @Query(value = "SELECT DISTINCT id FROM (" +
            "SELECT id FROM dbo.students WHERE (:cohortSuffix IS NULL OR student_code LIKE :cohortSuffix + '%' OR class_name LIKE 'IT' + :cohortSuffix + '%') " +
            "UNION " +
            "SELECT id FROM dbo.students_ WHERE is_active = 1 AND (:cohortSuffix IS NULL OR code LIKE :cohortSuffix + '%' OR RIGHT(CAST(YEAR(admission_year) AS VARCHAR(4)), 2) = :cohortSuffix)" +
            ") t", nativeQuery = true)
    List<UUID> findActiveStudentIdsByCohortSuffix(@Param("cohortSuffix") String cohortSuffix);

    // =====================================================
    // Dùng cho chức năng xuất báo cáo Word (Nhóm 11) - Phương án 3: JPQL Query Join
    // =====================================================

    /**
     * Truy vấn dữ liệu xuất Word kết hợp bảng Student để lấy class_name theo bộ điều kiện.
     */
    @Query("SELECT new com.example.quanlydaotao.n11.dto.GraduationResultExportDTO(" +
           "s.studentCode, s.fullName, s.className, gr.gpa, gr.totalCredits, " +
           "gr.failedCredits, gr.result, gr.classification, gr.note) " +
           "FROM GraduationResult gr " +
           "JOIN Student s ON gr.studentId = s.id " +
           "WHERE gr.isActive = true " +
           "AND (:conditionId IS NULL OR gr.conditionId = :conditionId) " +
           "ORDER BY s.studentCode ASC")
    List<GraduationResultExportDTO> findExportDataByConditionId(@Param("conditionId") UUID conditionId);

    /**
     * Truy vấn toàn bộ dữ liệu xuất Word kèm class_name (không lọc theo conditionId).
     */
    @Query("SELECT new com.example.quanlydaotao.n11.dto.GraduationResultExportDTO(" +
           "s.studentCode, s.fullName, s.className, gr.gpa, gr.totalCredits, " +
           "gr.failedCredits, gr.result, gr.classification, gr.note) " +
           "FROM GraduationResult gr " +
           "JOIN Student s ON gr.studentId = s.id " +
           "WHERE gr.isActive = true " +
           "ORDER BY s.studentCode ASC")
    List<GraduationResultExportDTO> findAllExportData();

    /**
     * Lấy tất cả kết quả active theo bộ điều kiện (tương thích backward)
     */
    List<GraduationResult> findByConditionIdAndIsActiveTrue(UUID conditionId);

    /**
     * Lấy tất cả kết quả active (tương thích backward)
     */
    List<GraduationResult> findByIsActiveTrue();
}
