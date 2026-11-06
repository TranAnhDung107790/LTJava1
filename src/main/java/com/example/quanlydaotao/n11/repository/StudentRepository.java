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
                   "LOWER(CONCAT('sv', s.code, '@donga.edu.vn')), " +
                   "'0901234567', 'IT24AB' " +
                   "FROM dbo.students_ s WHERE s.is_active = 1", nativeQuery = true)
    List<Object[]> findAllFromStudents_();
}