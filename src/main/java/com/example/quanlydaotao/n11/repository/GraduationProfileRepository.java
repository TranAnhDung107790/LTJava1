package com.example.quanlydaotao.n11.repository;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GraduationProfileRepository extends JpaRepository<GraduationProfile, UUID> {

    List<GraduationProfile> findByIsActiveTrue();

    Optional<GraduationProfile> findByIdAndIsActiveTrue(UUID id);

    List<GraduationProfile> findByStudent_IdAndIsActiveTrue(UUID studentId);

    List<GraduationProfile> findByStatusAndIsActiveTrue(String status);

    List<GraduationProfile> findByProfileCodeContainingIgnoreCaseAndIsActiveTrueOrStudent_StudentCodeContainingIgnoreCaseAndIsActiveTrue(
            String profileCode, String studentCode);

    boolean existsByProfileCodeIgnoreCase(String profileCode);
}
