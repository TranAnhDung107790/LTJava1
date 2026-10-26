package com.example.quanlydaotao.n11.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record GraduationConditionRequest(
    @NotNull(message = "Mã chương trình đào tạo không được để trống")
    UUID programId,

    @NotBlank(message = "Khóa áp dụng không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9_-]{2,10}$", message = "Khóa áp dụng phải từ 2 đến 10 ký tự chữ hoặc số (ví dụ: K21, 2026)")
    @JsonAlias({"cohort", "appliedCohort"})
    String appliedCohort,

    @NotNull(message = "Số tín chỉ tối thiểu không được để trống")
    @Min(value = 0, message = "Số tín chỉ tối thiểu phải >= 0")
    @JsonAlias({"minimumCredits", "minTotalCredits"})
    Integer minTotalCredits,

    @NotNull(message = "Điểm GPA tối thiểu không được để trống")
    @DecimalMin(value = "0.00", message = "GPA phải từ 0.00 đến 4.00")
    @DecimalMax(value = "4.00", message = "GPA phải từ 0.00 đến 4.00")
    @JsonAlias({"minimumGpa", "minGpa"})
    BigDecimal minGpa,

    @NotNull(message = "Số tín chỉ rớt tối đa không được để trống")
    @Min(value = 0, message = "Số tín chỉ rớt tối đa phải >= 0")
    @JsonAlias({"maximumFailedCourses", "maxFailedCredits"})
    Integer maxFailedCredits,

    @JsonAlias({"foreignLanguageRequired", "englishRequirement"})
    String englishRequirement,

    @JsonAlias({"itCertificateRequired", "itRequirement"})
    String itRequirement,

    @JsonAlias({"conductRequirement", "conductRequired"})
    String conductRequired,

    String note
) {
    public String cohort() {
        return appliedCohort;
    }

    public Integer minimumCredits() {
        return minTotalCredits;
    }

    public BigDecimal minimumGpa() {
        return minGpa;
    }

    public Integer maximumFailedCourses() {
        return maxFailedCredits;
    }
}
