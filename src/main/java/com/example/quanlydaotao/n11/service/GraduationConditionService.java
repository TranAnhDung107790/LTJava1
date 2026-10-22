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

@Service
public class GraduationConditionService {
    private final GraduationConditionRepository repository;
    public GraduationConditionService(GraduationConditionRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<GraduationCondition> all() { return repository.findByDeletedFalseOrderByIdDesc(); }

    @Transactional(readOnly = true)
    public GraduationCondition one(Long id) { return repository.findByIdAndDeletedFalse(id)
        .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện ID=" + id)); }

    @Transactional(readOnly = true)
    public GraduationCondition byCohort(String cohort) { return repository.findByCohortIgnoreCaseAndActiveTrueAndDeletedFalse(cohort)
        .orElseThrow(() -> new NotFoundException("Không tìm thấy bộ điều kiện đang hiệu lực cho khóa " + cohort)); }

    @Transactional
    public GraduationCondition create(GraduationConditionRequest request) {
        String cohort = normalize(request.cohort());
        if (repository.existsByCohortIgnoreCaseAndDeletedFalse(cohort))
            throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
        GraduationCondition condition = new GraduationCondition();
        apply(condition, request);
        return repository.save(condition);
    }

    @Transactional
    public GraduationCondition update(Long id, GraduationConditionRequest request) {
        GraduationCondition condition = one(id);
        String cohort = normalize(request.cohort());
        if (repository.existsByCohortIgnoreCaseAndDeletedFalseAndIdNot(cohort, id))
            throw new ConflictException("Khóa " + cohort + " đã có bộ điều kiện chưa bị xóa");
        apply(condition, request);
        return repository.save(condition);
    }

    @Transactional
    public GraduationCondition toggle(Long id) {
        GraduationCondition condition = one(id);
        condition.setActive(!condition.isActive());
        return repository.save(condition);
    }

    @Transactional
    public void softDelete(Long id) {
        GraduationCondition condition = one(id);
        condition.setDeleted(true);
        condition.setActive(false);
        condition.setDeletedAt(LocalDateTime.now());
        repository.save(condition);
    }

    private String normalize(String cohort) { return cohort.trim().toUpperCase(Locale.ROOT); }
    private void apply(GraduationCondition condition, GraduationConditionRequest r) {
        condition.setCohort(normalize(r.cohort()));
        condition.setMinimumCredits(r.minimumCredits());
        condition.setMinimumGpa(r.minimumGpa());
        condition.setMaximumFailedCourses(r.maximumFailedCourses());
        condition.setForeignLanguageRequired(r.foreignLanguageRequired());
        condition.setItCertificateRequired(r.itCertificateRequired());
        condition.setConductRequirementMet(r.conductRequired());
    }
}
