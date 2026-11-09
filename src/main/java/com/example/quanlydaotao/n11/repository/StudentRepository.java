package com.example.quanlydaotao.n11.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.quanlydaotao.n11.entity.Student;

public interface StudentRepository extends JpaRepository<Student, UUID> {

    List<Student> findByStudentCodeContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContainingIgnoreCase(
            String studentCode,
            String fullName,
            String email,
            String phone);

    @Query(value = "SELECT s.id, COALESCE(s.code, 'SV'), s.full_name, " +
            "COALESCE(u.email, LOWER(CONCAT('sv', s.code, '@donga.edu.vn'))), " +
            "COALESCE(u.phone, '0901234567'), " +
            "COALESCE(sc.code, sc.name, 'CNTT-K24-01'), " +
            "COALESCE(ss.name, N'Đang học') " +
            "FROM dbo.students_ s " +
            "LEFT JOIN dbo.users u ON s.user_id = u.id " +
            "LEFT JOIN dbo.student_classes sc ON s.student_classess_id = sc.id " +
            "LEFT JOIN dbo.student_status ss ON s.id = ss.student_id " +
            "WHERE s.is_active = 1", nativeQuery = true)
    List<Object[]> findAllFromStudents_();
}