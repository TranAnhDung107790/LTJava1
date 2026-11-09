package com.example.quanlydaotao.n11.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "graduation_conditions", schema = "dbo")
public class GraduationCondition extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "program_id", nullable = false)
    private UUID programId;

    @Column(name = "applied_cohort", length = 10, nullable = false)
    private String appliedCohort;

    @Column(name = "min_total_credits", nullable = false)
    private Integer minTotalCredits;

    @Column(name = "min_gpa", precision = 3, scale = 2, nullable = false)
    private BigDecimal minGpa;

    @Column(name = "max_failed_credits", nullable = false)
    private Integer maxFailedCredits;

    @Column(name = "english_requirement", columnDefinition = "nvarchar(100)")
    private String englishRequirement;

    @Column(name = "it_requirement", columnDefinition = "nvarchar(100)")
    private String itRequirement;

    @Column(name = "conduct_required", columnDefinition = "nvarchar(50)")
    private String conductRequired;

    @Column(name = "note", columnDefinition = "nvarchar(max)")
    private String note;

    public GraduationCondition() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProgramId() {
        return programId;
    }

    public void setProgramId(UUID programId) {
        this.programId = programId;
    }

    public String getAppliedCohort() {
        return appliedCohort;
    }

    public void setAppliedCohort(String appliedCohort) {
        this.appliedCohort = appliedCohort;
    }

    public Integer getMinTotalCredits() {
        return minTotalCredits;
    }

    public void setMinTotalCredits(Integer minTotalCredits) {
        this.minTotalCredits = minTotalCredits;
    }

    public BigDecimal getMinGpa() {
        return minGpa;
    }

    public void setMinGpa(BigDecimal minGpa) {
        this.minGpa = minGpa;
    }

    public Integer getMaxFailedCredits() {
        return maxFailedCredits;
    }

    public void setMaxFailedCredits(Integer maxFailedCredits) {
        this.maxFailedCredits = maxFailedCredits;
    }

    public String getEnglishRequirement() {
        return englishRequirement;
    }

    public void setEnglishRequirement(String englishRequirement) {
        this.englishRequirement = englishRequirement;
    }

    public String getItRequirement() {
        return itRequirement;
    }

    public void setItRequirement(String itRequirement) {
        this.itRequirement = itRequirement;
    }

    public String getConductRequired() {
        return conductRequired;
    }

    public void setConductRequired(String conductRequired) {
        this.conductRequired = conductRequired;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    // Alias methods hỗ trợ tương thích ngược
    public String getCohort() {
        return appliedCohort;
    }

    public void setCohort(String cohort) {
        this.appliedCohort = cohort;
    }

    public Integer getMinimumCredits() {
        return minTotalCredits;
    }

    public void setMinimumCredits(Integer minimumCredits) {
        this.minTotalCredits = minimumCredits;
    }

    public BigDecimal getMinimumGpa() {
        return minGpa;
    }

    public void setMinimumGpa(BigDecimal minimumGpa) {
        this.minGpa = minimumGpa;
    }

    public Integer getMaximumFailedCourses() {
        return maxFailedCredits;
    }

    public void setMaximumFailedCourses(Integer maximumFailedCourses) {
        this.maxFailedCredits = maximumFailedCourses;
    }

    public boolean isActive() {
        return getIsActive();
    }

    public void setActive(boolean active) {
        setIsActive(active);
    }
}
