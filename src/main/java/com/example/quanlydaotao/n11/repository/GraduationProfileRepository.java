package com.example.quanlydaotao.n11.repository;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GraduationProfileRepository extends JpaRepository<GraduationProfile, UUID> {

    List<GraduationProfile> findByStudentId(UUID studentId);

    List<GraduationProfile> findByStatus(String status);

    List<GraduationProfile> findByProfileCodeContainingIgnoreCase(String keyword);
}
