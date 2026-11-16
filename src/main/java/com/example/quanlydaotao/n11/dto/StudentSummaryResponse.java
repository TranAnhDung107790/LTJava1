package com.example.quanlydaotao.n11.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record StudentSummaryResponse(
        UUID studentId,
        BigDecimal gpa,
        Integer totalCredits,
        Integer failedCredits) {
}
