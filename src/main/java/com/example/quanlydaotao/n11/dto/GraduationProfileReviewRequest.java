package com.example.quanlydaotao.n11.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.util.UUID;

public record GraduationProfileReviewRequest(
        String status,
        @JsonAlias("reviewer_id") UUID reviewerId,
        String note) {
}
