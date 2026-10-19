package com.example.quanlydaotao.n11.dto;

import java.util.UUID;

public class EvaluateGraduationRequest {
    private String cohort;          // Ví dụ: "K21", "K22", "K23"
    private UUID conditionId;       // ID bộ điều kiện áp dụng
    private UUID reviewerId;        // Người kích hoạt / thẩm định

    public String getCohort() { return cohort; }
    public void setCohort(String cohort) { this.cohort = cohort; }

    public UUID getConditionId() { return conditionId; }
    public void setConditionId(UUID conditionId) { this.conditionId = conditionId; }

    public UUID getReviewerId() { return reviewerId; }
    public void setReviewerId(UUID reviewerId) { this.reviewerId = reviewerId; }
}