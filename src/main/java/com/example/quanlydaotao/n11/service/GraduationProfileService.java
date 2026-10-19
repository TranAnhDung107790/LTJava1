package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import com.example.quanlydaotao.n11.repository.GraduationProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GraduationProfileService {

    private final GraduationProfileRepository graduationProfileRepository;

    public GraduationProfileService(GraduationProfileRepository graduationProfileRepository) {
        this.graduationProfileRepository = graduationProfileRepository;
    }

    public List<GraduationProfile> findAll() {
        return graduationProfileRepository.findAll();
    }

    public GraduationProfile findById(UUID id) {
        return graduationProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ xét tốt nghiệp với id: " + id));
    }

    public List<GraduationProfile> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return graduationProfileRepository.findAll();
        }
        return graduationProfileRepository.findByProfileCodeContainingIgnoreCase(keyword.trim());
    }

    public List<GraduationProfile> findByStudentId(UUID studentId) {
        return graduationProfileRepository.findByStudentId(studentId);
    }

    public List<GraduationProfile> findByStatus(String status) {
        return graduationProfileRepository.findByStatus(status);
    }

    public GraduationProfile save(GraduationProfile graduationProfile) {
        if (graduationProfile.getSubmittedDate() == null) {
            graduationProfile.setSubmittedDate(LocalDateTime.now());
        }
        return graduationProfileRepository.save(graduationProfile);
    }

    public GraduationProfile review(UUID id, String status, UUID reviewerId, String note) {
        GraduationProfile profile = findById(id);
        profile.setStatus(status);
        profile.setReviewerId(reviewerId);
        profile.setReviewDate(LocalDateTime.now());
        profile.setNote(note);
        return graduationProfileRepository.save(profile);
    }

    public void deleteSoft(UUID id) {
        GraduationProfile profile = findById(id);
        profile.setIsActive(false);
        profile.setDeletedAt(LocalDateTime.now());
        graduationProfileRepository.save(profile);
    }
}
