package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.GraduationConditionRequest;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.exception.ConflictException;
import com.example.quanlydaotao.n11.exception.NotFoundException;
import com.example.quanlydaotao.n11.repository.GraduationConditionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class GraduationConditionService {

    private final GraduationConditionRepository repository;
    private final List<GraduationCondition> fallbackConditions = new CopyOnWriteArrayList<>();

    public GraduationConditionService(GraduationConditionRepository repository) {
        this.repository = repository;
        initFallbackConditions();
    }

    private void initFallbackConditions() {
        UUID programId = UUID.fromString("452c369d-df15-4888-b6c4-869f112bca2d");
        fallbackConditions.add(createSample("01fe9695-b2e0-463a-a99c-c5b4af4af213", programId, "K23", 135, "2.50", 0, "IELTS 5.5 / TOEIC 600", "MOS Expert / CNTT Nâng cao", "Tốt trở lên", "Tiêu chuẩn K23"));
        fallbackConditions.add(createSample("392a8b22-76fd-4d5d-afa2-b4253d9b7343", programId, "K22", 120, "2.00", 0, "TOEIC 450", "CNTT", "Khá trở lên", "Tiêu chuẩn K22"));
        fallbackConditions.add(createSample("0305285a-4a5b-4cf8-8e75-8aff692d9cb5", programId, "K24", 140, "2.50", 0, "IELTS 6.0 / TOEIC 650", "CNTT Nâng cao & Lập trình ứng dụng", "Xuất sắc", "Tiêu chuẩn K24"));
        fallbackConditions.add(createSample("e9747719-59f6-4a02-85d5-8350d0220f03", programId, "K20", 120, "2.00", 0, "TOEIC 450 / B1", "CNTT Cơ bản", "Khá trở lên", "Tiêu chuẩn K20"));
        fallbackConditions.add(createSample("c563fcd6-fbf8-47fb-8a9a-0aef91e4a844", programId, "K21", 125, "2.00", 0, "TOEIC 500 / B1 Chuẩn", "IC3 / MOS 2 môn", "Khá trở lên", "Tiêu chuẩn K21"));
    }

    private GraduationCondition createSample(String idStr, UUID programId, String cohort, int credits,
                                             String gpa, int failedCredits, String eng, String it, String conduct, String note) {
        GraduationCondition c = new GraduationCondition();
        c.setId(UUID.fromString(idStr));
        c.setProgramId(programId);
        c.setAppliedCohort(cohort);
        c.setMinTotalCredits(credits);
        c.setMinGpa(new BigDecimal(gpa));
        c.setMaxFailedCredits(failedCredits);
        c.setEnglishRequirement(eng);
        c.setItRequirement(it);
        c.setConductRequired(conduct);
        c.setNote(note);
        c.setIsActive(true);
        c.setCreatedAt(LocalDateTime.now().minusMonths(1));
        return c;
    }

    public List<GraduationCondition> all() {
        try {
            List<GraduationCondition> list = repository.findByDeletedAtIsNullOrderByIdDesc();
            if (list != null && !list.isEmpty()) {
                return list;
            }
            return new ArrayList<>(fallbackConditions);
        } catch (Exception e) {
            return new ArrayList<>(fallbackConditions);
        }
    }

    public GraduationCondition one(UUID id) {
        try {
            return repository.findByIdAndDeletedAtIsNull(id)
                    .orElseGet(() -> fallbackConditions.stream()
                            .filter(c -> c.getId().equals(id) && c.getDeletedAt() == null)
                            .findFirst()
                            .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện ID=" + id)));
        } catch (Exception e) {
            return fallbackConditions.stream()
                    .filter(c -> c.getId().equals(id) && c.getDeletedAt() == null)
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện ID=" + id));
        }
    }

    public List<GraduationCondition> byCohort(String cohort) {
        String normalized = normalize(cohort);
        try {
            List<GraduationCondition> list = repository.findByAppliedCohortIgnoreCaseAndIsActiveTrueAndDeletedAtIsNull(normalized);
            if (list != null && !list.isEmpty()) {
                return list;
            }
        } catch (Exception ignored) {
        }
        List<GraduationCondition> filtered = fallbackConditions.stream()
                .filter(c -> c.getAppliedCohort() != null && c.getAppliedCohort().equalsIgnoreCase(normalized)
                        && Boolean.TRUE.equals(c.getIsActive()) && c.getDeletedAt() == null)
                .toList();
        if (filtered.isEmpty()) {
            throw new NotFoundException("Không tìm thấy bộ điều kiện đang hiệu lực cho khóa " + cohort);
        }
        return filtered;
    }

    public GraduationCondition byProgramAndCohort(UUID programId, String cohort) {
        String normalized = normalize(cohort);
        try {
            return repository.findByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNull(programId, normalized)
                    .orElseGet(() -> fallbackConditions.stream()
                            .filter(c -> c.getProgramId() != null && c.getProgramId().equals(programId)
                                    && c.getAppliedCohort() != null && c.getAppliedCohort().equalsIgnoreCase(normalized)
                                    && c.getDeletedAt() == null)
                            .findFirst()
                            .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện cho chương trình và khóa " + cohort)));
        } catch (Exception e) {
            return fallbackConditions.stream()
                    .filter(c -> c.getProgramId() != null && c.getProgramId().equals(programId)
                            && c.getAppliedCohort() != null && c.getAppliedCohort().equalsIgnoreCase(normalized)
                            && c.getDeletedAt() == null)
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện cho chương trình và khóa " + cohort));
        }
    }

    public List<GraduationCondition> byProgram(UUID programId) {
        try {
            List<GraduationCondition> list = repository.findByProgramIdAndDeletedAtIsNull(programId);
            if (list != null && !list.isEmpty()) {
                return list;
            }
        } catch (Exception ignored) {
        }
        return fallbackConditions.stream()
                .filter(c -> c.getProgramId() != null && c.getProgramId().equals(programId) && c.getDeletedAt() == null)
                .toList();
    }

    public GraduationCondition create(GraduationConditionRequest request) {
        String cohort = normalize(request.appliedCohort());
        UUID programId = request.programId();

        try {
            if (programId != null) {
                if (repository.existsByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNull(programId, cohort)) {
                    throw new ConflictException("Chương trình đào tạo này đã có bộ điều kiện cho khóa " + cohort);
                }
            } else if (repository.existsByAppliedCohortIgnoreCaseAndDeletedAtIsNull(cohort)) {
                throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
            }
        } catch (ConflictException ce) {
            throw ce;
        } catch (Exception ignored) {
            // DB offline or error, check fallback
            boolean conflict = fallbackConditions.stream().anyMatch(c -> c.getAppliedCohort().equalsIgnoreCase(cohort) && c.getDeletedAt() == null);
            if (conflict) {
                throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
            }
        }

        GraduationCondition condition = new GraduationCondition();
        apply(condition, request);
        condition.setIsActive(true);
        condition.setCreatedAt(LocalDateTime.now());

        try {
            return repository.save(condition);
        } catch (Exception e) {
            if (condition.getId() == null) {
                condition.setId(UUID.randomUUID());
            }
            fallbackConditions.add(0, condition);
            return condition;
        }
    }

    public GraduationCondition update(UUID id, GraduationConditionRequest request) {
        GraduationCondition condition = one(id);
        String cohort = normalize(request.appliedCohort());
        UUID programId = request.programId();

        try {
            if (programId != null) {
                if (repository.existsByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNullAndIdNot(programId, cohort, id)) {
                    throw new ConflictException("Chương trình đào tạo này đã có bộ điều kiện cho khóa " + cohort);
                }
            } else if (repository.existsByAppliedCohortIgnoreCaseAndDeletedAtIsNullAndIdNot(cohort, id)) {
                throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
            }
        } catch (ConflictException ce) {
            throw ce;
        } catch (Exception ignored) {
        }

        apply(condition, request);
        condition.setUpdatedAt(LocalDateTime.now());

        try {
            return repository.save(condition);
        } catch (Exception e) {
            int idx = -1;
            for (int i = 0; i < fallbackConditions.size(); i++) {
                if (fallbackConditions.get(i).getId().equals(id)) {
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                fallbackConditions.set(idx, condition);
            }
            return condition;
        }
    }

    public GraduationCondition toggle(UUID id) {
        GraduationCondition condition = one(id);
        condition.setIsActive(!Boolean.TRUE.equals(condition.getIsActive()));
        try {
            return repository.save(condition);
        } catch (Exception e) {
            return condition;
        }
    }

    public void softDelete(UUID id) {
        try {
            GraduationCondition condition = one(id);
            condition.setIsActive(false);
            condition.setDeletedAt(LocalDateTime.now());
            repository.save(condition);
        } catch (Exception ignored) {
        }
        fallbackConditions.removeIf(c -> c.getId().equals(id));
    }

    private String normalize(String cohort) {
        return cohort == null ? "" : cohort.trim().toUpperCase(Locale.ROOT);
    }

    private void apply(GraduationCondition condition, GraduationConditionRequest r) {
        if (r.programId() != null) {
            condition.setProgramId(r.programId());
        }
        condition.setAppliedCohort(normalize(r.appliedCohort()));
        condition.setMinTotalCredits(r.minTotalCredits());
        condition.setMinGpa(r.minGpa());
        condition.setMaxFailedCredits(r.maxFailedCredits());
        condition.setEnglishRequirement(r.englishRequirement());
        condition.setItRequirement(r.itRequirement());
        condition.setConductRequired(r.conductRequired());
        condition.setNote(r.note());
    }
}
