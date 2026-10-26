package com.example.quanlydaotao.n11.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "graduation_results", schema = "dbo")
public class GraduationResult extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "condition_id", nullable = false)
    private UUID conditionId;

    @Column(name = "gpa", precision = 3, scale = 2)
    private BigDecimal gpa;

    @Column(name = "total_credits")
    private Integer totalCredits;

    @Column(name = "failed_credits")
    private Integer failedCredits;

    @Column(name = "result")
    private Short result;

    @Column(name = "classification")
    private Short classification;

    @Column(name = "decision_date")
    private LocalDate decisionDate;

    @Column(name = "reviewer")
    private UUID reviewer;

    @Column(name = "note", columnDefinition = "nvarchar(max)")
    private String note;

    public GraduationResult() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public UUID getConditionId() {
        return conditionId;
    }

    public void setConditionId(UUID conditionId) {
        this.conditionId = conditionId;
    }

    public BigDecimal getGpa() {
        return gpa;
    }

    public void setGpa(BigDecimal gpa) {
        this.gpa = gpa;
    }

    public Integer getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(Integer totalCredits) {
        this.totalCredits = totalCredits;
    }

    public Integer getFailedCredits() {
        return failedCredits;
    }

    public void setFailedCredits(Integer failedCredits) {
        this.failedCredits = failedCredits;
    }

    public Short getResult() {
        return result;
    }

    public void setResult(Short result) {
        this.result = result;
    }

    public Short getClassification() {
        return classification;
    }

    public void setClassification(Short classification) {
        this.classification = classification;
    }

    public LocalDate getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDate decisionDate) {
        this.decisionDate = decisionDate;
    }

    public UUID getReviewer() {
        return reviewer;
    }

    public void setReviewer(UUID reviewer) {
        this.reviewer = reviewer;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
