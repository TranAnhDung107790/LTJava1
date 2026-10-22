// package com.example.quanlydaotao.n11.entity;

// import jakarta.persistence.*;
// import java.math.BigDecimal;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "graduation_conditions")
// public class GraduationCondition {
//     @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     @Column(nullable = false, length = 20)
//     private String cohort;
//     @Column(nullable = false)
//     private Integer minimumCredits;
//     @Column(nullable = false, precision = 3, scale = 2)
//     private BigDecimal minimumGpa;
//     @Column(nullable = false)
//     private Integer maximumFailedCourses;
//     @Column(nullable = false)
//     private Boolean foreignLanguageRequired;
//     @Column(nullable = false)
//     private Boolean itCertificateRequired;
//     @Column(nullable = false)
//     private Boolean conductRequired;
//     @Column(nullable = false)
//     private boolean active = true;
//     @Column(nullable = false)
//     private boolean deleted = false;
//     private LocalDateTime deletedAt;
//     @Column(nullable = false, updatable = false)
//     private LocalDateTime createdAt;
//     @Column(nullable = false)
//     private LocalDateTime updatedAt;

//     @PrePersist public void beforeCreate() { createdAt = updatedAt = LocalDateTime.now(); }
//     @PreUpdate public void beforeUpdate() { updatedAt = LocalDateTime.now(); }

//     public Long getId() { return id; }
//     public String getCohort() { return cohort; }
//     public void setCohort(String cohort) { this.cohort = cohort; }
//     public Integer getMinimumCredits() { return minimumCredits; }
//     public void setMinimumCredits(Integer minimumCredits) { this.minimumCredits = minimumCredits; }
//     public BigDecimal getMinimumGpa() { return minimumGpa; }
//     public void setMinimumGpa(BigDecimal minimumGpa) { this.minimumGpa = minimumGpa; }
//     public Integer getMaximumFailedCourses() { return maximumFailedCourses; }
//     public void setMaximumFailedCourses(Integer maximumFailedCourses) { this.maximumFailedCourses = maximumFailedCourses; }
//     public Boolean getForeignLanguageRequired() { return foreignLanguageRequired; }
//     public void setForeignLanguageRequired(Boolean foreignLanguageRequired) { this.foreignLanguageRequired = foreignLanguageRequired; }
//     public Boolean getItCertificateRequired() { return itCertificateRequired; }
//     public void setItCertificateRequired(Boolean itCertificateRequired) { this.itCertificateRequired = itCertificateRequired; }
//     public Boolean getConductRequirementMet() { return conductRequired; }
//     public void setConductRequirementMet(Boolean conductRequired) { this.conductRequired = conductRequired; }
//     public boolean isActive() { return active; }
//     public void setActive(boolean active) { this.active = active; }
//     public boolean isDeleted() { return deleted; }
//     public void setDeleted(boolean deleted) { this.deleted = deleted; }
//     public LocalDateTime getDeletedAt() { return deletedAt; }
//     public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
//     public LocalDateTime getCreatedAt() { return createdAt; }
//     public LocalDateTime getUpdatedAt() { return updatedAt; }
// }
