package com.example.quanlydaotao.n11.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record GraduationConditionRequest(
    @NotBlank @Pattern(regexp = "(?i)K[0-9]{2,4}", message = "Khóa phải có dạng K21, K22, K23...") String cohort,
    @NotNull @Min(0) Integer minimumCredits,
    @NotNull @DecimalMin("0.00") @DecimalMax("4.00") BigDecimal minimumGpa,
    @NotNull @Min(0) Integer maximumFailedCourses,
    @NotNull Boolean foreignLanguageRequired,
    @NotNull Boolean itCertificateRequired,
    @NotNull Boolean conductRequired
) {}
