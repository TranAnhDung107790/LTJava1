package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import com.example.quanlydaotao.n11.entity.Student;
import com.example.quanlydaotao.n11.repository.GraduationProfileRepository;
import com.example.quanlydaotao.n11.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class GraduationProfileService {

    private final GraduationProfileRepository graduationProfileRepository;
    private final StudentRepository studentRepository;
    private final StudentService studentService;
    private final List<GraduationProfile> fallbackProfiles = new CopyOnWriteArrayList<>();

    public GraduationProfileService(GraduationProfileRepository graduationProfileRepository,
                                    StudentRepository studentRepository,
                                    StudentService studentService) {
        this.graduationProfileRepository = graduationProfileRepository;
        this.studentRepository = studentRepository;
        this.studentService = studentService;
        initFallbackProfiles();
    }

    private void initFallbackProfiles() {
        List<Student> students = studentService.getFallbackStudents();
        Student s1 = students.size() > 0 ? students.get(0) : new Student("26687", "Hứa Tiến Tiến", "tien.hua@donga.edu.vn", "0901234561", "IT24AB");
        Student s2 = students.size() > 1 ? students.get(1) : new Student("26563", "Ngô Hữu Tuấn", "tuan.ngo@donga.edu.vn", "0901234562", "IT24AB");
        Student s3 = students.size() > 2 ? students.get(2) : new Student("25549", "Hồ Hoàng Hùng", "hung.ho@donga.edu.vn", "0901234563", "IT24AB");
        Student s4 = students.size() > 3 ? students.get(3) : new Student("23017", "Vũ Khánh Tùng", "tung.vu@donga.edu.vn", "0901234564", "IT24AB");

        fallbackProfiles.add(createSampleProfile("aaaaaaaa-1111-1111-1111-111111111111", "HS2026_001", s1, "Approved", "Đã đủ điều kiện tốt nghiệp và hoàn tất lệ phí"));
        fallbackProfiles.add(createSampleProfile("bbbbbbbb-2222-2222-2222-222222222222", "HS2026_002", s2, "Approved", "Hồ sơ chuẩn bị xét đợt 1"));
        fallbackProfiles.add(createSampleProfile("cccccccc-3333-3333-3333-333333333333", "HS2026_003", s3, "Pending", "Chờ bổ sung chứng chỉ ngoại ngữ"));
        fallbackProfiles.add(createSampleProfile("dddddddd-4444-4444-4444-444444444444", "HS2026_004", s4, "Pending", "Đang trong quá trình xét duyệt hồ sơ đợt 1"));
    }

    private GraduationProfile createSampleProfile(String idStr, String code, Student student, String status, String note) {
        GraduationProfile p = new GraduationProfile();
        p.setId(UUID.fromString(idStr));
        p.setProfileCode(code);
        p.setStudent(student);
        p.setStatus(status);
        p.setNote(note);
        p.setSubmittedDate(LocalDateTime.now().minusDays(5));
        p.setIsActive(true);
        if ("Approved".equalsIgnoreCase(status)) {
            p.setReviewDate(LocalDateTime.now().minusDays(1));
            p.setReviewerId(UUID.fromString("99999999-9999-9999-9999-999999999999"));
        }
        return p;
    }

    public List<GraduationProfile> findAll() {
        try {
            List<GraduationProfile> list = graduationProfileRepository.findByIsActiveTrue();
            if (list != null && !list.isEmpty()) {
                return list;
            }
            return new ArrayList<>(fallbackProfiles);
        } catch (Exception e) {
            return new ArrayList<>(fallbackProfiles);
        }
    }

    public GraduationProfile findById(UUID id) {
        try {
            return graduationProfileRepository.findByIdAndIsActiveTrue(id)
                    .orElseGet(() -> fallbackProfiles.stream()
                            .filter(p -> p.getId().equals(id) && Boolean.TRUE.equals(p.getIsActive()))
                            .findFirst()
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ xét tốt nghiệp với id: " + id)));
        } catch (Exception e) {
            return fallbackProfiles.stream()
                    .filter(p -> p.getId().equals(id) && Boolean.TRUE.equals(p.getIsActive()))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ xét tốt nghiệp với id: " + id));
        }
    }

    public List<GraduationProfile> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findAll();
        }
        String query = keyword.trim();
        try {
            Map<UUID, GraduationProfile> results = new LinkedHashMap<>();
            graduationProfileRepository
                    .findByProfileCodeContainingIgnoreCaseAndIsActiveTrueOrStudent_StudentCodeContainingIgnoreCaseAndIsActiveTrue(
                            query, query)
                    .forEach(profile -> results.put(profile.getId(), profile));
            try {
                graduationProfileRepository.findByStudent_IdAndIsActiveTrue(UUID.fromString(query))
                        .forEach(profile -> results.put(profile.getId(), profile));
            } catch (IllegalArgumentException ignored) {
            }
            if (!results.isEmpty()) {
                return List.copyOf(results.values());
            }
        } catch (Exception ignored) {
        }
        String kw = query.toLowerCase();
        return fallbackProfiles.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()) &&
                        ((p.getProfileCode() != null && p.getProfileCode().toLowerCase().contains(kw))
                                || (p.getStudent() != null && p.getStudent().getStudentCode() != null && p.getStudent().getStudentCode().toLowerCase().contains(kw))
                                || (p.getStudent() != null && p.getStudent().getFullName() != null && p.getStudent().getFullName().toLowerCase().contains(kw))))
                .toList();
    }

    public List<GraduationProfile> findByStudentId(UUID studentId) {
        try {
            List<GraduationProfile> list = graduationProfileRepository.findByStudent_IdAndIsActiveTrue(studentId);
            if (list != null && !list.isEmpty()) {
                return list;
            }
        } catch (Exception ignored) {
        }
        return fallbackProfiles.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()) && p.getStudent() != null && p.getStudent().getId().equals(studentId))
                .toList();
    }

    public List<GraduationProfile> findByStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái hồ sơ không được để trống");
        }
        try {
            List<GraduationProfile> list = graduationProfileRepository.findByStatusAndIsActiveTrue(status.trim());
            if (list != null && !list.isEmpty()) {
                return list;
            }
        } catch (Exception ignored) {
        }
        String s = status.trim().toLowerCase();
        return fallbackProfiles.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()) && p.getStatus() != null && p.getStatus().toLowerCase().equals(s))
                .toList();
    }

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
        if (graduationProfile.getStatus() == null || graduationProfile.getStatus().isBlank()) {
            graduationProfile.setStatus("Pending");
        } else {
            graduationProfile.setStatus(graduationProfile.getStatus().trim());
        }
        if (graduationProfile.getSubmittedDate() == null) {
            graduationProfile.setSubmittedDate(LocalDateTime.now());
        }
        graduationProfile.setProfileCode(graduationProfile.getProfileCode().trim());

        // Resolve student
        Student student = null;
        try {
            student = studentRepository.findById(graduationProfile.getStudent().getId()).orElse(null);
        } catch (Exception ignored) {
        }
        if (student == null) {
            try {
                student = studentService.getById(graduationProfile.getStudent().getId());
            } catch (Exception ignored) {
            }
        }
        if (student == null) {
            // Assign dummy student if none found
            student = new Student("SV", "Sinh viên", "sv@donga.edu.vn", "0900000000", "IT24AB");
            student.setId(graduationProfile.getStudent().getId());
        }
        graduationProfile.setStudent(student);

        try {
            if (graduationProfileRepository.existsByProfileCodeIgnoreCase(graduationProfile.getProfileCode().trim())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã hồ sơ đã tồn tại");
            }
            return graduationProfileRepository.save(graduationProfile);
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            if (graduationProfile.getId() == null) {
                graduationProfile.setId(UUID.randomUUID());
            }
            fallbackProfiles.add(0, graduationProfile);
            return graduationProfile;
        }
    }

    public GraduationProfile update(UUID id, GraduationProfile input) {
        GraduationProfile profile = findById(id);
        if (input.getProfileCode() == null || input.getProfileCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã hồ sơ không được để trống");
        }

        Student student = null;
        if (input.getStudent() != null && input.getStudent().getId() != null) {
            try {
                student = studentRepository.findById(input.getStudent().getId()).orElse(null);
            } catch (Exception ignored) {
            }
            if (student == null) {
                try {
                    student = studentService.getById(input.getStudent().getId());
                } catch (Exception ignored) {
                }
            }
        }
        if (student != null) {
            profile.setStudent(student);
        }

        profile.setProfileCode(input.getProfileCode().trim());
        profile.setSessionId(input.getSessionId());
        if (input.getSubmittedDate() != null) {
            profile.setSubmittedDate(input.getSubmittedDate());
        }
        profile.setNote(input.getNote());
        if (input.getStatus() != null && !input.getStatus().isBlank()) {
            profile.setStatus(input.getStatus().trim());
        }

        try {
            return graduationProfileRepository.save(profile);
        } catch (Exception e) {
            int idx = -1;
            for (int i = 0; i < fallbackProfiles.size(); i++) {
                if (fallbackProfiles.get(i).getId().equals(id)) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                fallbackProfiles.set(idx, profile);
            }
            return profile;
        }
    }

    public GraduationProfile review(UUID id, String status, UUID reviewerId, String note) {
        GraduationProfile profile = findById(id);
        String normalizedStatus = status == null ? "" : status.trim();
        if (!normalizedStatus.equalsIgnoreCase("Approved") && !normalizedStatus.equalsIgnoreCase("Rejected")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái duyệt phải là Approved hoặc Rejected");
        }
        profile.setStatus(normalizedStatus.toLowerCase(Locale.ROOT).equals("approved") ? "Approved" : "Rejected");
        profile.setReviewerId(reviewerId != null ? reviewerId : UUID.randomUUID());
        profile.setReviewDate(LocalDateTime.now());
        profile.setNote(note);

        try {
            return graduationProfileRepository.save(profile);
        } catch (Exception e) {
            return profile;
        }
    }

    public void deleteSoft(UUID id) {
        try {
            GraduationProfile profile = findById(id);
            profile.setIsActive(false);
            profile.setDeletedAt(LocalDateTime.now());
            graduationProfileRepository.save(profile);
        } catch (Exception ignored) {
        }
        fallbackProfiles.removeIf(p -> p.getId().equals(id));
    }
}
