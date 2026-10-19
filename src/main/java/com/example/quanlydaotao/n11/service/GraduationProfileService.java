package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import com.example.quanlydaotao.n11.entity.Student;
import com.example.quanlydaotao.n11.repository.GraduationProfileRepository;
import com.example.quanlydaotao.n11.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class GraduationProfileService {

    private final GraduationProfileRepository graduationProfileRepository;
    private final StudentRepository studentRepository;

    public GraduationProfileService(GraduationProfileRepository graduationProfileRepository,
                                    StudentRepository studentRepository) {
        this.graduationProfileRepository = graduationProfileRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<GraduationProfile> findAll() {
        return graduationProfileRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public GraduationProfile findById(UUID id) {
        return graduationProfileRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ xét tốt nghiệp với id: " + id));
    }

    @Transactional(readOnly = true)
    public List<GraduationProfile> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findAll();
        }
        String query = keyword.trim();
        Map<UUID, GraduationProfile> results = new LinkedHashMap<>();
        graduationProfileRepository
                .findByProfileCodeContainingIgnoreCaseAndIsActiveTrueOrStudent_StudentCodeContainingIgnoreCaseAndIsActiveTrue(
                        query, query)
                .forEach(profile -> results.put(profile.getId(), profile));
        try {
            graduationProfileRepository.findByStudent_IdAndIsActiveTrue(UUID.fromString(query))
                    .forEach(profile -> results.put(profile.getId(), profile));
        } catch (IllegalArgumentException ignored) {
            // A non-UUID keyword can still match the profile code or student code.
        }
        return List.copyOf(results.values());
    }

    @Transactional(readOnly = true)
    public List<GraduationProfile> findByStudentId(UUID studentId) {
        return graduationProfileRepository.findByStudent_IdAndIsActiveTrue(studentId);
    }

    @Transactional(readOnly = true)
    public List<GraduationProfile> findByStatus(String status) {
        return graduationProfileRepository.findByStatusAndIsActiveTrue(status.trim());
    }

    @Transactional
    public GraduationProfile save(GraduationProfile graduationProfile) {
        if (graduationProfile.getProfileCode() == null || graduationProfile.getProfileCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã hồ sơ không được để trống");
        }
        if (graduationProfile.getStudent() == null || graduationProfile.getStudent().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần cung cấp ID sinh viên");
        }
        graduationProfile.setId(null);
        graduationProfile.setIsActive(true);
        graduationProfile.setDeletedAt(null);
        if (graduationProfileRepository.existsByProfileCodeIgnoreCase(graduationProfile.getProfileCode().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã hồ sơ đã tồn tại");
        }
        Student student = studentRepository.findById(graduationProfile.getStudent().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên được gán cho hồ sơ"));
        graduationProfile.setStudent(student);
        graduationProfile.setProfileCode(graduationProfile.getProfileCode().trim());
        if (graduationProfile.getStatus() == null || graduationProfile.getStatus().isBlank()) {
            graduationProfile.setStatus("Pending");
        } else {
            graduationProfile.setStatus(graduationProfile.getStatus().trim());
        }
        if (graduationProfile.getSubmittedDate() == null) {
            graduationProfile.setSubmittedDate(LocalDateTime.now());
        }
        return graduationProfileRepository.save(graduationProfile);
    }

    @Transactional
    public GraduationProfile update(UUID id, GraduationProfile input) {
        GraduationProfile profile = findById(id);
        if (input.getProfileCode() == null || input.getProfileCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã hồ sơ không được để trống");
        }
        if (input.getStudent() == null || input.getStudent().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần cung cấp ID sinh viên");
        }
        if (!profile.getProfileCode().equalsIgnoreCase(input.getProfileCode().trim())
                && graduationProfileRepository.existsByProfileCodeIgnoreCase(input.getProfileCode().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã hồ sơ đã tồn tại");
        }
        Student student = studentRepository.findById(input.getStudent().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên được gán cho hồ sơ"));

        profile.setProfileCode(input.getProfileCode().trim());
        profile.setStudent(student);
        profile.setSessionId(input.getSessionId());
        profile.setStatus(input.getStatus() == null || input.getStatus().isBlank()
                ? profile.getStatus() : input.getStatus().trim());
        profile.setSubmittedDate(input.getSubmittedDate());
        profile.setReviewDate(input.getReviewDate());
        profile.setReviewerId(input.getReviewerId());
        profile.setNote(input.getNote());
        return graduationProfileRepository.save(profile);
    }

    @Transactional
    public GraduationProfile review(UUID id, String status, UUID reviewerId, String note) {
        GraduationProfile profile = findById(id);
        if (status == null || (!status.equalsIgnoreCase("Approved") && !status.equalsIgnoreCase("Rejected"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái duyệt phải là Approved hoặc Rejected");
        }
        if (reviewerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần cung cấp ID người duyệt");
        }
        profile.setStatus(status.toLowerCase(Locale.ROOT).equals("approved") ? "Approved" : "Rejected");
        profile.setReviewerId(reviewerId);
        profile.setReviewDate(LocalDateTime.now());
        profile.setNote(note);
        return graduationProfileRepository.save(profile);
    }

    @Transactional
    public void deleteSoft(UUID id) {
        GraduationProfile profile = findById(id);
        profile.setIsActive(false);
        profile.setDeletedAt(LocalDateTime.now());
        graduationProfileRepository.save(profile);
    }
}
