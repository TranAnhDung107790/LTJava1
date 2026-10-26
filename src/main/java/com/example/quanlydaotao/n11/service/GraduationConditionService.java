package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.GraduationConditionRequest;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.exception.ConflictException;
import com.example.quanlydaotao.n11.exception.NotFoundException;
import com.example.quanlydaotao.n11.repository.GraduationConditionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class GraduationConditionService {

    private final GraduationConditionRepository repository;

    public GraduationConditionService(GraduationConditionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<GraduationCondition> all() {
        return repository.findByDeletedAtIsNullOrderByIdDesc();
    }

    @Transactional(readOnly = true)
    public GraduationCondition one(UUID id) {
        return repository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện ID=" + id));
    }

    @Transactional(readOnly = true)
    public List<GraduationCondition> byCohort(String cohort) {
        List<GraduationCondition> list = repository.findByAppliedCohortIgnoreCaseAndIsActiveTrueAndDeletedAtIsNull(normalize(cohort));
        if (list.isEmpty()) {
            throw new NotFoundException("Không tìm thấy bộ điều kiện đang hiệu lực cho khóa " + cohort);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public GraduationCondition byProgramAndCohort(UUID programId, String cohort) {
        return repository.findByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNull(programId, normalize(cohort))
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện cho chương trình và khóa " + cohort));
    }

    @Transactional(readOnly = true)
    public List<GraduationCondition> byProgram(UUID programId) {
        return repository.findByProgramIdAndDeletedAtIsNull(programId);
    }

    @Transactional
    public GraduationCondition create(GraduationConditionRequest request) {
        String cohort = normalize(request.appliedCohort());
        UUID programId = request.programId();

        if (programId != null) {
            if (repository.existsByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNull(programId, cohort)) {
                throw new ConflictException("Chương trình đào tạo này đã có bộ điều kiện cho khóa " + cohort);
            }
        } else if (repository.existsByAppliedCohortIgnoreCaseAndDeletedAtIsNull(cohort)) {
            throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
        }

        GraduationCondition condition = new GraduationCondition();
        apply(condition, request);
        return repository.save(condition);
    }

    @Transactional
    public GraduationCondition update(UUID id, GraduationConditionRequest request) {
        GraduationCondition condition = one(id);
        String cohort = normalize(request.appliedCohort());
        UUID programId = request.programId();

        if (programId != null) {
            if (repository.existsByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNullAndIdNot(programId, cohort, id)) {
                throw new ConflictException("Chương trình đào tạo này đã có bộ điều kiện cho khóa " + cohort);
            }
        } else if (repository.existsByAppliedCohortIgnoreCaseAndDeletedAtIsNullAndIdNot(cohort, id)) {
            throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
        }

        apply(condition, request);
        return repository.save(condition);
    }

    @Transactional
    public GraduationCondition toggle(UUID id) {
        GraduationCondition condition = one(id);
        condition.setIsActive(!condition.getIsActive());
        return repository.save(condition);
    }

    @Transactional
    public void softDelete(UUID id) {
        GraduationCondition condition = one(id);
        condition.setIsActive(false);
        condition.setDeletedAt(LocalDateTime.now());
        repository.save(condition);
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
