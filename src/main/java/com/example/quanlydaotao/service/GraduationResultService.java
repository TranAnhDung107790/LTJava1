package com.example.quanlydaotao.service;

import com.example.quanlydaotao.entity.GraduationResult;
import com.example.quanlydaotao.repository.GraduationResultRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GraduationResultService {

    private final GraduationResultRepository repository;

    public GraduationResultService(GraduationResultRepository repository) {
        this.repository = repository;
    }

    public List<GraduationResult> getAllResults() {
        return repository.findByDeletedAtIsNull();
    }

    public GraduationResult getResultById(UUID id) {
        return repository.findById(id)
                .filter(r -> r.getDeletedAt() == null)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả tốt nghiệp: " + id));
    }

    public GraduationResult getByStudentId(UUID studentId) {
        return repository.findByStudentIdAndDeletedAtIsNull(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kết quả của sinh viên: " + studentId));
    }

    public GraduationResult createResult(GraduationResult result) {
        if (result.getId() == null) {
            result.setId(UUID.randomUUID());
        }
        if (result.getCreatedAt() == null) {
            result.setCreatedAt(LocalDateTime.now());
        }
        result.setUpdatedAt(LocalDateTime.now());
        if (result.getIsActive() == null) {
            result.setIsActive(true);
        }
        return repository.save(result);
    }

    public GraduationResult updateResult(UUID id, GraduationResult request) {
        GraduationResult result = getResultById(id);

        result.setStudentId(request.getStudentId());
        result.setConditionId(request.getConditionId());
        result.setGpa(request.getGpa());
        result.setTotalCredits(request.getTotalCredits());
        result.setFailedCredits(request.getFailedCredits());
        result.setResult(request.getResult());
        result.setClassification(request.getClassification());
        result.setDecisionDate(request.getDecisionDate());
        result.setReviewer(request.getReviewer());
        result.setNote(request.getNote());
        result.setUpdatedAt(LocalDateTime.now());

        return repository.save(result);
    }

    public void deleteResult(UUID id) {
        GraduationResult result = getResultById(id);
        result.setDeletedAt(LocalDateTime.now());
        result.setIsActive(false);
        repository.save(result);
    }

    public GraduationResult updateActive(UUID id, Boolean active) {
        GraduationResult result = getResultById(id);
        result.setIsActive(active);
        result.setUpdatedAt(LocalDateTime.now());
        return repository.save(result);
    }
}