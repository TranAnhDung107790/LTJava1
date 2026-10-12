package com.example.quanlydaotao.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "graduation_conditions")
public class GraduationCondition {

    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    private UUID id;

    @Column(name = "program_id", nullable = false, columnDefinition = "uniqueidentifier")
    private UUID programId;

    @Column(name = "applied_cohort", length = 10)
    private String appliedCohort;

    @Column(name = "min_total_credits")
    private Integer minTotalCredits;

    @Column(name = "min_gpa", precision = 3, scale = 2)
    private BigDecimal minGpa;

    @Column(name = "max_failed_credits")
    private Integer maxFailedCredits;

    @Column(name = "english_requirement", length = 100)
    private String englishRequirement;

    @Column(name = "it_requirement", length = 100)
    private String itRequirement;

    @Column(name = "conduct_required", length = 50)
    private String conductRequired;

    @Column(name = "note", columnDefinition = "nvarchar(max)")
    private String note;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", columnDefinition = "uniqueidentifier")
    private UUID createdBy;

    @Column(name = "updated_by", columnDefinition = "uniqueidentifier")
    private UUID updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", columnDefinition = "uniqueidentifier")
    private UUID deletedBy;

    @Column(name = "is_active")
    private Boolean isActive;

    public GraduationCondition() {}

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProgramId() { return programId; }
    public void setProgramId(UUID programId) { this.programId = programId; }

    public String getAppliedCohort() { return appliedCohort; }
    public void setAppliedCohort(String appliedCohort) { this.appliedCohort = appliedCohort; }

    public Integer getMinTotalCredits() { return minTotalCredits; }
    public void setMinTotalCredits(Integer minTotalCredits) { this.minTotalCredits = minTotalCredits; }

    public BigDecimal getMinGpa() { return minGpa; }
    public void setMinGpa(BigDecimal minGpa) { this.minGpa = minGpa; }

    public Integer getMaxFailedCredits() { return maxFailedCredits; }
    public void setMaxFailedCredits(Integer maxFailedCredits) { this.maxFailedCredits = maxFailedCredits; }

    public String getEnglishRequirement() { return englishRequirement; }
    public void setEnglishRequirement(String englishRequirement) { this.englishRequirement = englishRequirement; }

    public String getItRequirement() { return itRequirement; }
    public void setItRequirement(String itRequirement) { this.itRequirement = itRequirement; }

    public String getConductRequired() { return conductRequired; }
    public void setConductRequired(String conductRequired) { this.conductRequired = conductRequired; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    public UUID getDeletedBy() { return deletedBy; }
    public void setDeletedBy(UUID deletedBy) { this.deletedBy = deletedBy; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}