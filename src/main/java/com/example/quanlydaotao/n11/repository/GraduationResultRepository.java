package com.example.quanlydaotao.n11.repository;

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

    @Query(value = "SELECT student_id, gpa_value, total_credits, failed_credits " +
            "FROM dbo.student_summaries " +
            "WHERE is_active = 1 AND student_id = :studentId", nativeQuery = true)
    List<Object[]> findStudentSummary(@Param("studentId") UUID studentId);

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
     * Xuất Word: native SQL để tránh lỗi JPQL join entity không có quan hệ
     * (GraduationResult.studentId không map @ManyToOne tới Student) và lệch kiểu Short/Integer.
     */
    /**
     * Xuất Word theo điều kiện: trả thêm condition_id (cột 9) để Service
     * có thể load bộ tiêu chí tương ứng và sinh lý do chi tiết không đạt.
     */
    @Query(value = "SELECT COALESCE(s.student_code, ''), COALESCE(s.full_name, N'Sinh viên'), " +
            "COALESCE(s.class_name, N'Chưa xếp lớp'), gr.gpa, gr.total_credits, " +
            "gr.failed_credits, gr.result, gr.classification, gr.note, gr.condition_id " +
            "FROM dbo.graduation_results gr " +
            "LEFT JOIN dbo.students s ON s.id = gr.student_id " +
            "WHERE gr.is_active = 1 AND gr.condition_id = :conditionId " +
            "ORDER BY COALESCE(s.student_code, '') ASC", nativeQuery = true)
    List<Object[]> findExportDataByConditionId(@Param("conditionId") UUID conditionId);

    /**
     * Xuất Word toàn bộ: trả thêm condition_id (cột 9) để Service tự lookup
     * bộ tiêu chí của từng khóa và sinh lý do chi tiết không đạt cho mọi khóa.
     */
    @Query(value = "SELECT COALESCE(s.student_code, ''), COALESCE(s.full_name, N'Sinh viên'), " +
            "COALESCE(s.class_name, N'Chưa xếp lớp'), gr.gpa, gr.total_credits, " +
            "gr.failed_credits, gr.result, gr.classification, gr.note, gr.condition_id " +
            "FROM dbo.graduation_results gr " +
            "LEFT JOIN dbo.students s ON s.id = gr.student_id " +
            "WHERE gr.is_active = 1 " +
            "ORDER BY gr.condition_id, COALESCE(s.student_code, '') ASC", nativeQuery = true)
    List<Object[]> findAllExportData();

    @Query(value = "SELECT DISTINCT s.class_name " +
            "FROM dbo.graduation_results gr " +
            "INNER JOIN dbo.students s ON s.id = gr.student_id " +
            "WHERE gr.is_active = 1 " +
            "AND s.class_name IS NOT NULL AND LTRIM(RTRIM(s.class_name)) <> '' " +
            "ORDER BY s.class_name", nativeQuery = true)
    List<String> findDistinctExportClassNames();

    @Query(value = "SELECT DISTINCT s.class_name " +
            "FROM dbo.graduation_results gr " +
            "INNER JOIN dbo.students s ON s.id = gr.student_id " +
            "WHERE gr.is_active = 1 " +
            "AND gr.condition_id IN (:conditionIds) " +
            "AND s.class_name IS NOT NULL AND LTRIM(RTRIM(s.class_name)) <> '' " +
            "ORDER BY s.class_name", nativeQuery = true)
    List<String> findDistinctExportClassNamesByConditions(@Param("conditionIds") List<UUID> conditionIds);

    /**
     * Lấy tất cả kết quả active theo bộ điều kiện (tương thích backward)
     */
    List<GraduationResult> findByConditionIdAndIsActiveTrue(UUID conditionId);

    /**
     * Lấy tất cả kết quả active (tương thích backward)
     */
    List<GraduationResult> findByIsActiveTrue();
}
