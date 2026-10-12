package com.example.quanlydaotao.service;

import com.example.quanlydaotao.entity.GraduationCondition;
import com.example.quanlydaotao.repository.GraduationConditionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GraduationConditionService {

    private final GraduationConditionRepository repository;

    public GraduationConditionService(GraduationConditionRepository repository) {
        this.repository = repository;
    }

    public List<GraduationCondition> getAllConditions() {
        return repository.findByDeletedAtIsNull();
    }

    public GraduationCondition getConditionById(UUID id) {
        return repository.findById(id)
                .filter(c -> c.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy điều kiện tốt nghiệp: " + id));
    }

    public GraduationCondition createCondition(GraduationCondition condition) {
        if (condition.getId() == null) {
            condition.setId(UUID.randomUUID());
        }
        if (condition.getCreatedAt() == null) {
            condition.setCreatedAt(LocalDateTime.now());
        }
        condition.setUpdatedAt(LocalDateTime.now());
        if (condition.getIsActive() == null) {
            condition.setIsActive(true);
        }
        return repository.save(condition);
    }

    public GraduationCondition updateCondition(UUID id, GraduationCondition request) {
        GraduationCondition condition = getConditionById(id);

        condition.setProgramId(request.getProgramId());
        condition.setAppliedCohort(request.getAppliedCohort());
        condition.setMinTotalCredits(request.getMinTotalCredits());
        condition.setMinGpa(request.getMinGpa());
        condition.setMaxFailedCredits(request.getMaxFailedCredits());
        condition.setEnglishRequirement(request.getEnglishRequirement());
        condition.setItRequirement(request.getItRequirement());
        condition.setConductRequired(request.getConductRequired());
        condition.setNote(request.getNote());
        condition.setUpdatedAt(LocalDateTime.now());

        return repository.save(condition);
    }

    public void deleteCondition(UUID id) {
        GraduationCondition condition = getConditionById(id);
        condition.setDeletedAt(LocalDateTime.now());
        condition.setIsActive(false);
        repository.save(condition);
    }

    public GraduationCondition updateActive(UUID id, Boolean active) {
        GraduationCondition condition = getConditionById(id);
        condition.setIsActive(active);
        condition.setUpdatedAt(LocalDateTime.now());
        return repository.save(condition);
    }
}