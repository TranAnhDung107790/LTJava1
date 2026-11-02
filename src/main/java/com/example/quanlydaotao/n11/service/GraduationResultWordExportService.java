package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import org.apache.poi.xwpf.usermodel.*;
import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service tao file Word (.docx) bao cao ket qua xet tot nghiep.
 * Su dung Apache POI (poi-ooxml 5.2.5).
 * Phan ro 2 phan: Sinh vien DAT va CHUA DAT (co ly do cu the).
 */
@Service
public class GraduationResultWordExportService {

    private static final String FONT_NAME = "Times New Roman";
    private static final int FONT_SIZE_TITLE = 16;
    private static final int FONT_SIZE_SUBTITLE = 13;
    private static final int FONT_SIZE_BODY = 11;
    private static final String HEADER_BG_COLOR = "1F4E79";
    private static final String HEADER_TEXT_COLOR = "FFFFFF";
    private static final String PASS_COLOR = "27AE60";
    private static final String FAIL_COLOR = "E74C3C";

    /**
     * Tao bao cao Word hoan chinh tu danh sach sinh vien dat/chua dat.
     *
     * @param passedStudents Danh sach sinh vien DAT
     * @param failedStudents Danh sach sinh vien CHUA DAT (co ly do)
     * @param condition      Bo dieu kien TN dang ap dung (co the null)
     * @return Mang byte cua file .docx
     */
    public byte[] generateReport(
            List<GraduationResultExportDTO> passedStudents,
            List<GraduationResultExportDTO> failedStudents,
            GraduationCondition condition) throws IOException {

        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // 1. Header bao cao
            createReportHeader(document, condition);

            // 2. Thong tin tieu chi xet TN
            createConditionInfo(document, condition);

            // 3. Phan I - Sinh vien DAT
            createSectionTitle(document,
                "PHAN I: DANH SACH SINH VIEN DAT YEU CAU TOT NGHIEP",
                PASS_COLOR);
            createSubInfo(document, "Tong so: " + passedStudents.size() + " sinh vien");

            if (!passedStudents.isEmpty()) {
                createPassedStudentsTable(document, passedStudents);
            } else {
                createSubInfo(document, "(Khong co sinh vien nao dat yeu cau)");
            }

            // 4. Phan II - Sinh vien CHUA DAT
            createSectionTitle(document,
                "PHAN II: DANH SACH SINH VIEN CHUA DAT YEU CAU",
                FAIL_COLOR);
            createSubInfo(document, "Tong so: " + failedStudents.size() + " sinh vien");

            if (!failedStudents.isEmpty()) {
                createFailedStudentsTable(document, failedStudents);
            } else {
                createSubInfo(document, "(Khong co sinh vien nao chua dat)");
            }

            // 5. Thong ke tong hop
            createSummarySection(document, passedStudents, failedStudents);

            // 6. Phan ky ten
            createSignatureSection(document);

            document.write(out);
            return out.toByteArray();
        }
    }

    // ===========================
    // Header + tieu de bao cao
    // ===========================

    private void createReportHeader(XWPFDocument document, GraduationCondition condition) {
        // Ten truong/khoa
        XWPFParagraph orgP = document.createParagraph();
        orgP.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun orgR = orgP.createRun();
        orgR.setText("TRUONG DAI HOC ... - KHOA CONG NGHE THONG TIN");
        orgR.setFontFamily(FONT_NAME);
        orgR.setFontSize(FONT_SIZE_BODY);

        // Tieu de chinh
        XWPFParagraph titleP = document.createParagraph();
        titleP.setAlignment(ParagraphAlignment.CENTER);
        titleP.setSpacingAfter(200);
        XWPFRun titleR = titleP.createRun();
        titleR.setText("BAO CAO KET QUA XET TOT NGHIEP");
        titleR.setBold(true);
        titleR.setFontFamily(FONT_NAME);
        titleR.setFontSize(FONT_SIZE_TITLE);
        titleR.setColor("1A237E");

        // Khoa ap dung
        if (condition != null && condition.getAppliedCohort() != null) {
            XWPFParagraph subP = document.createParagraph();
            subP.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun subR = subP.createRun();
            subR.setText("Khoa ap dung: " + condition.getAppliedCohort());
            subR.setFontFamily(FONT_NAME);
            subR.setFontSize(FONT_SIZE_SUBTITLE);
            subR.setItalic(true);
        }

        // Ngay xuat
        XWPFParagraph dateP = document.createParagraph();
        dateP.setAlignment(ParagraphAlignment.CENTER);
        dateP.setSpacingAfter(400);
        XWPFRun dateR = dateP.createRun();
        dateR.setText("Ngay xuat bao cao: "
            + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        dateR.setFontFamily(FONT_NAME);
        dateR.setFontSize(FONT_SIZE_BODY);
    }

    // ===========================
    // Thong tin tieu chi TN
    // ===========================

    private void createConditionInfo(XWPFDocument document, GraduationCondition condition) {
        if (condition == null) return;

        XWPFParagraph condP = document.createParagraph();
        XWPFRun condR = condP.createRun();
        condR.setText("TIEU CHI XET TOT NGHIEP:");
        condR.setBold(true);
        condR.setFontFamily(FONT_NAME);
        condR.setFontSize(FONT_SIZE_BODY);
        condR.setUnderline(UnderlinePatterns.SINGLE);

        String[] criteria = {
            "So tin chi toi thieu: " + condition.getMinTotalCredits(),
            "GPA toi thieu: " + condition.getMinGpa(),
            "So tin chi no toi da cho phep: " + condition.getMaxFailedCredits(),
            "Yeu cau Tieng Anh: " + nvl(condition.getEnglishRequirement()),
            "Yeu cau Tin hoc: " + nvl(condition.getItRequirement()),
            "Yeu cau Hanh kiem: " + nvl(condition.getConductRequired())
        };

        for (String text : criteria) {
            XWPFParagraph p = document.createParagraph();
            p.setIndentationLeft(720);
            XWPFRun run = p.createRun();
            run.setText("- " + text);
            run.setFontFamily(FONT_NAME);
            run.setFontSize(FONT_SIZE_BODY);
        }

        document.createParagraph(); // dong trong
    }

    // ===========================
    // Bang SV DAT (6 cot)
    // ===========================

    private void createPassedStudentsTable(XWPFDocument document,
                                           List<GraduationResultExportDTO> students) {
        String[] headers = {"STT", "Ma SV", "Ho va ten", "GPA", "Tong tin chi", "Xep loai TN"};
        XWPFTable table = document.createTable(students.size() + 1, headers.length);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            setCellStyle(headerRow.getCell(i), headers[i], true, HEADER_BG_COLOR, HEADER_TEXT_COLOR);
        }

        // Data rows
        for (int i = 0; i < students.size(); i++) {
            GraduationResultExportDTO dto = students.get(i);
            XWPFTableRow row = table.getRow(i + 1);
            setCellStyle(row.getCell(0), String.valueOf(dto.getStt()), false, null, null);
            setCellStyle(row.getCell(1), nvl(dto.getStudentCode()), false, null, null);
            setCellStyle(row.getCell(2), nvl(dto.getStudentName()), false, null, null);
            setCellStyle(row.getCell(3),
                dto.getGpa() != null ? dto.getGpa().toString() : "", false, null, null);
            setCellStyle(row.getCell(4),
                dto.getTotalCredits() != null ? dto.getTotalCredits().toString() : "", false, null, null);
            setCellStyle(row.getCell(5), nvl(dto.getClassificationText()), false, null, null);
        }
    }

    // ===========================
    // Bang SV CHUA DAT (7 cot)
    // ===========================

    private void createFailedStudentsTable(XWPFDocument document,
                                           List<GraduationResultExportDTO> students) {
        String[] headers = {"STT", "Ma SV", "Ho va ten", "GPA", "Tin chi", "No", "Ly do khong dat"};
        XWPFTable table = document.createTable(students.size() + 1, headers.length);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            setCellStyle(headerRow.getCell(i), headers[i], true, HEADER_BG_COLOR, HEADER_TEXT_COLOR);
        }

        // Data rows
        for (int i = 0; i < students.size(); i++) {
            GraduationResultExportDTO dto = students.get(i);
            XWPFTableRow row = table.getRow(i + 1);
            setCellStyle(row.getCell(0), String.valueOf(dto.getStt()), false, null, null);
            setCellStyle(row.getCell(1), nvl(dto.getStudentCode()), false, null, null);
            setCellStyle(row.getCell(2), nvl(dto.getStudentName()), false, null, null);
            setCellStyle(row.getCell(3),
                dto.getGpa() != null ? dto.getGpa().toString() : "", false, null, null);
            setCellStyle(row.getCell(4),
                dto.getTotalCredits() != null ? dto.getTotalCredits().toString() : "", false, null, null);
            setCellStyle(row.getCell(5),
                dto.getFailedCredits() != null ? dto.getFailedCredits().toString() : "", false, null, null);

            // Cot ly do: moi ly do 1 dong
            XWPFTableCell reasonCell = row.getCell(6);
            reasonCell.removeParagraph(0);
            if (dto.getFailureReasons() != null) {
                for (String reason : dto.getFailureReasons()) {
                    XWPFParagraph p = reasonCell.addParagraph();
                    XWPFRun run = p.createRun();
                    run.setText("- " + reason);
                    run.setFontFamily(FONT_NAME);
                    run.setFontSize(9);
                    run.setColor("C0392B");
                }
            }
        }
    }

    // ===========================
    // Thong ke tong hop
    // ===========================

    private void createSummarySection(XWPFDocument document,
                                      List<GraduationResultExportDTO> passed,
                                      List<GraduationResultExportDTO> failed) {
        document.createParagraph();

        XWPFParagraph summaryTitle = document.createParagraph();
        XWPFRun summaryRun = summaryTitle.createRun();
        summaryRun.setText("THONG KE TONG HOP");
        summaryRun.setBold(true);
        summaryRun.setFontFamily(FONT_NAME);
        summaryRun.setFontSize(FONT_SIZE_SUBTITLE);
        summaryRun.setUnderline(UnderlinePatterns.SINGLE);

        int total = passed.size() + failed.size();
        double passRate = total > 0 ? (double) passed.size() / total * 100 : 0;
        double failRate = total > 0 ? (double) failed.size() / total * 100 : 0;

        long excellent = passed.stream()
            .filter(s -> "Xuat sac".equals(s.getClassificationText())).count();
        long good = passed.stream()
            .filter(s -> "Gioi".equals(s.getClassificationText())).count();
        long fair = passed.stream()
            .filter(s -> "Kha".equals(s.getClassificationText())).count();
        long average = passed.stream()
            .filter(s -> "Trung binh".equals(s.getClassificationText())).count();

        String[] stats = {
            "Tong so sinh vien duoc xet: " + total,
            String.format("So dat yeu cau: %d (%.1f%%)", passed.size(), passRate),
            String.format("   Xuat sac: %d  |  Gioi: %d  |  Kha: %d  |  Trung binh: %d",
                          excellent, good, fair, average),
            String.format("So chua dat: %d (%.1f%%)", failed.size(), failRate)
        };

        for (String text : stats) {
            XWPFParagraph p = document.createParagraph();
            p.setIndentationLeft(360);
            XWPFRun run = p.createRun();
            run.setText("- " + text);
            run.setFontFamily(FONT_NAME);
            run.setFontSize(FONT_SIZE_BODY);
        }
    }

    // ===========================
    // Phan chu ky
    // ===========================

    private void createSignatureSection(XWPFDocument document) {
        document.createParagraph();
        document.createParagraph();

        XWPFTable sigTable = document.createTable(2, 2);
        sigTable.setWidth("100%");
        sigTable.getCTTbl().getTblPr().unsetTblBorders();

        setCellStyle(sigTable.getRow(0).getCell(0), "Nguoi lap bao cao", true, null, null);
        setCellStyle(sigTable.getRow(0).getCell(1), "Truong Khoa", true, null, null);
        setCellStyle(sigTable.getRow(1).getCell(0), "(Ky, ghi ro ho ten)", false, null, null);
        setCellStyle(sigTable.getRow(1).getCell(1), "(Ky, dong dau, ghi ro ho ten)", false, null, null);
    }

    // ===========================
    // Helper methods
    // ===========================

    private void createSectionTitle(XWPFDocument document, String title, String color) {
        document.createParagraph();
        XWPFParagraph p = document.createParagraph();
        p.setAlignment(ParagraphAlignment.LEFT);
        p.setSpacingAfter(100);
        XWPFRun run = p.createRun();
        run.setText(title);
        run.setBold(true);
        run.setFontFamily(FONT_NAME);
        run.setFontSize(FONT_SIZE_SUBTITLE);
        run.setColor(color);
    }

    private void createSubInfo(XWPFDocument document, String text) {
        XWPFParagraph p = document.createParagraph();
        XWPFRun run = p.createRun();
        run.setText(text);
        run.setFontFamily(FONT_NAME);
        run.setFontSize(FONT_SIZE_BODY);
        run.setItalic(true);
    }

    private void setCellStyle(XWPFTableCell cell, String text,
                               boolean isBold, String bgColor, String textColor) {
        XWPFParagraph paragraph = cell.getParagraphs().isEmpty()
            ? cell.addParagraph() : cell.getParagraphs().get(0);
        paragraph.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun run = paragraph.createRun();
        run.setText(text != null ? text : "");
        run.setBold(isBold);
        run.setFontFamily(FONT_NAME);
        run.setFontSize(FONT_SIZE_BODY);

        if (textColor != null) run.setColor(textColor);
        if (bgColor != null) cell.setColor(bgColor);
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}
