package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationSession;
import com.example.quanlydaotao.n11.repository.GraduationSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GraduationSessionService {

    private final GraduationSessionRepository repository;

    public GraduationSessionService(GraduationSessionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<GraduationSession> findAll() {
        return repository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public GraduationSession findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đợt xét tốt nghiệp"));
    }

    @Transactional(readOnly = true)
    public List<GraduationSession> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findAll();
        }
        return repository.searchByKeyword(keyword.trim());
    }

    @Transactional(readOnly = true)
    public List<GraduationSession> getActiveSessions() {
        return repository.findActiveSessionsInPeriod(LocalDate.now());
    }

    @Transactional
    public GraduationSession create(GraduationSession session) {
        if (session.getSessionCode() == null || session.getSessionCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã đợt xét không được để trống");
        }
        if (session.getSessionName() == null || session.getSessionName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên đợt xét không được để trống");
        }
        if (repository.existsBySessionCodeIgnoreCase(session.getSessionCode().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã đợt xét đã tồn tại");
        }

        session.setId(null);
        session.setSessionCode(session.getSessionCode().trim());
        session.setIsActive(true);
        session.setDeletedAt(null);
        return repository.save(session);
    }

    @Transactional
    public GraduationSession update(UUID id, GraduationSession input) {
        GraduationSession session = findById(id);

        if (input.getSessionCode() == null || input.getSessionCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã đợt xét không được để trống");
        }
        if (!session.getSessionCode().equalsIgnoreCase(input.getSessionCode().trim())
                && repository.existsBySessionCodeIgnoreCase(input.getSessionCode().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã đợt xét đã tồn tại");
        }

        session.setSessionCode(input.getSessionCode().trim());
        session.setSessionName(input.getSessionName());
        session.setAcademicYear(input.getAcademicYear());
        session.setSemester(input.getSemester());
        session.setStartDate(input.getStartDate());
        session.setDueDate(input.getDueDate());
        session.setNote(input.getNote());
        if (input.getUpdatedBy() != null) {
            session.setUpdatedBy(input.getUpdatedBy());
        }
        return repository.save(session);
    }

    @Transactional
    public void deleteSoft(UUID id, UUID deletedBy) {
        GraduationSession session = findById(id);
        session.setIsActive(false);
        session.setDeletedAt(LocalDateTime.now());
        session.setDeletedBy(deletedBy);
        repository.save(session);
    }

    @Transactional
    public List<GraduationSession> generateAnnualSessions(String academicYear) {
        if (academicYear == null || academicYear.isBlank()) {
            academicYear = "2026-2027";
        }
        academicYear = academicYear.trim();

        int startYear = 2026;
        try {
            String[] parts = academicYear.split("-");
            if (parts.length > 0) {
                startYear = Integer.parseInt(parts[0].trim());
            }
        } catch (Exception ignored) {
        }
        int nextYear = startYear + 1;
        String cleanYearCode = startYear + "_" + nextYear;

        List<GraduationSession> generated = new ArrayList<>();

        // Đợt 1: HK1 (Tháng 10 - Tháng 11)
        createIfNotExists(generated,
                "DOT1_" + cleanYearCode,
                "Xét tốt nghiệp Đợt 1 năm học " + academicYear,
                academicYear,
                1,
                LocalDate.of(startYear, 10, 1),
                LocalDate.of(startYear, 11, 30),
                "Khởi tạo tự động theo niên giám đào tạo " + academicYear + " (HK1)");

        // Đợt 2: HK2 (Tháng 3 - Tháng 4)
        createIfNotExists(generated,
                "DOT2_" + cleanYearCode,
                "Xét tốt nghiệp Đợt 2 năm học " + academicYear,
                academicYear,
                2,
                LocalDate.of(nextYear, 3, 1),
                LocalDate.of(nextYear, 4, 30),
                "Khởi tạo tự động theo niên giám đào tạo " + academicYear + " (HK2)");

        // Đợt 3: HK Hè (Tháng 7 - Tháng 8)
        createIfNotExists(generated,
                "DOT3_" + cleanYearCode,
                "Xét tốt nghiệp Đợt 3 năm học " + academicYear,
                academicYear,
                3,
                LocalDate.of(nextYear, 7, 1),
                LocalDate.of(nextYear, 8, 31),
                "Khởi tạo tự động theo niên giám đào tạo " + academicYear + " (Kỳ hè)");

        return generated;
    }

    private void createIfNotExists(List<GraduationSession> list, String code, String name,
                                   String academicYear, int semester, LocalDate startDate,
                                   LocalDate dueDate, String note) {
        if (!repository.existsBySessionCodeIgnoreCase(code)) {
            GraduationSession s = new GraduationSession();
            s.setSessionCode(code);
            s.setSessionName(name);
            s.setAcademicYear(academicYear);
            s.setSemester(semester);
            s.setStartDate(startDate);
            s.setDueDate(dueDate);
            s.setNote(note);
            s.setIsActive(true);
            list.add(repository.save(s));
        }
    }
}
