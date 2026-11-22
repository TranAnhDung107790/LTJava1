package com.example.quanlydaotao.n11.repository;

import com.example.quanlydaotao.n11.entity.GraduationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GraduationSessionRepository extends JpaRepository<GraduationSession, UUID> {

    List<GraduationSession> findByIsActiveTrue();

    Optional<GraduationSession> findByIdAndIsActiveTrue(UUID id);

    boolean existsBySessionCodeIgnoreCase(String sessionCode);

    // Chỉ xét các đợt còn hiệu lực: mã đã xóa mềm được phép dùng lại
    boolean existsBySessionCodeIgnoreCaseAndIsActiveTrue(String sessionCode);

    // Kiểm tra trùng khi cập nhật, bỏ qua chính bản ghi đang sửa
    boolean existsBySessionCodeIgnoreCaseAndIsActiveTrueAndIdNot(String sessionCode, UUID id);

    @Query("SELECT s FROM GraduationSession s WHERE s.isActive = true AND " +
           "(LOWER(s.sessionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.sessionName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<GraduationSession> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT s FROM GraduationSession s WHERE s.isActive = true AND " +
           ":currentDate >= s.startDate AND :currentDate <= s.dueDate")
    List<GraduationSession> findActiveSessionsInPeriod(@Param("currentDate") LocalDate currentDate);
}
