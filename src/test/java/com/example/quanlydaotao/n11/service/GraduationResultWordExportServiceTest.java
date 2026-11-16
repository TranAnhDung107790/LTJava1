package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class GraduationResultWordExportServiceTest {

    private final GraduationResultWordExportService service = new GraduationResultWordExportService();

    @Test
    void generateReportWithEmptyLists() throws Exception {
        byte[] bytes = service.generateReport(List.of(), List.of(), null);
        assertTrue(bytes.length > 0);
    }

    @Test
    void generateReportWithPassedAndFailedRows() throws Exception {
        GraduationResultExportDTO passed = new GraduationResultExportDTO(
                "24001", "Nguyen Van A", "IT24A", new BigDecimal("3.20"), 130, 0, (short) 1, (short) 2, null);
        GraduationResultExportDTO failed = new GraduationResultExportDTO(
                "24002", "Tran Thi B", "IT24B", new BigDecimal("1.80"), 90, 12, (short) 0, null, "GPA thap");
        failed.setFailureReasons(List.of("GPA chua dat yeu cau"));

        GraduationCondition condition = new GraduationCondition();
        condition.setAppliedCohort("K24");
        condition.setMinTotalCredits(120);
        condition.setMinGpa(new BigDecimal("2.00"));
        condition.setMaxFailedCredits(10);

        byte[] bytes = service.generateReport(List.of(passed), List.of(failed), condition);
        assertTrue(bytes.length > 1000);
    }
}
