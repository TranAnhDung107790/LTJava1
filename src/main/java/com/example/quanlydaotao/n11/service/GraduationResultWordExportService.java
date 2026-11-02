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
     * Tạo báo cáo Word hoàn chỉnh từ danh sách sinh viên Đạt / Chưa đạt có kèm tên lớp.
     *
     * @param passedStudents Danh sách sinh viên đạt yêu cầu tốt nghiệp
     * @param failedStudents Danh sách sinh viên chưa đạt
     * @param condition      Bộ điều kiện tốt nghiệp áp dụng (nếu có)
     * @return Mảng byte của file .docx
     */
    public byte[] generateReport(
            List<GraduationResultExportDTO> passedStudents,
            List<GraduationResultExportDTO> failedStudents,
            GraduationCondition condition) throws IOException {

        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // 1. Quốc hiệu - Tiêu ngữ & Header đơn vị
            createReportHeader(document);

            // 2. Tiêu đề chính của báo cáo
            createReportTitle(document, condition);

            // 3. Thông tin bộ tiêu chí xét tốt nghiệp
            createConditionInfo(document, condition);

            // 4. Bảng I: Danh sách sinh viên ĐẠT (7 cột: có cột Lớp)
            createSectionTitle(document, "PHẦN I: DANH SÁCH SINH VIÊN ĐẠT YÊU CẦU TỐT NGHIỆP", PASS_COLOR);
            createSubInfo(document, "Tổng số sinh viên đạt: " + passedStudents.size() + " sinh viên");
            if (passedStudents.isEmpty()) {
                createEmptyNotice(document);
            } else {
                createPassedStudentsTable(document, passedStudents);
            }

            // 5. Bảng II: Danh sách sinh viên CHƯA ĐẠT (8 cột: có cột Lớp và Lý do chi tiết)
            createSectionTitle(document, "PHẦN II: DANH SÁCH SINH VIÊN CHƯA ĐẠT YÊU CẦU", FAIL_COLOR);
            createSubInfo(document, "Tổng số sinh viên chưa đạt: " + failedStudents.size() + " sinh viên");
            if (failedStudents.isEmpty()) {
                createEmptyNotice(document);
            } else {
                createFailedStudentsTable(document, failedStudents);
            }

            // 6. Thống kê tổng hợp
            createSummarySection(document, passedStudents, failedStudents);

            // 7. Khu vực chữ ký xác nhận
            createSignatureSection(document);

            document.write(out);
            return out.toByteArray();
        }
    }

    // ===========================
    // Header hành chính
    // ===========================

    private void createReportHeader(XWPFDocument document) {
        XWPFTable headerTable = document.createTable(1, 2);
        headerTable.setWidth("100%");
        headerTable.getCTTbl().getTblPr().unsetTblBorders();

        // Cột trái: Tên trường & Khoa
        XWPFTableCell leftCell = headerTable.getRow(0).getCell(0);
        XWPFParagraph pLeft1 = leftCell.getParagraphs().get(0);
        pLeft1.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rLeft1 = pLeft1.createRun();
        rLeft1.setText("TRƯỜNG ĐẠI HỌC ĐÔNG Á");
        rLeft1.setBold(true);
        rLeft1.setFontFamily(FONT_NAME);
        rLeft1.setFontSize(10);

        XWPFParagraph pLeft2 = leftCell.addParagraph();
        pLeft2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rLeft2 = pLeft2.createRun();
        rLeft2.setText("KHOA CÔNG NGHỆ THÔNG TIN");
        rLeft2.setBold(true);
        rLeft2.setFontFamily(FONT_NAME);
        rLeft2.setFontSize(10);
        rLeft2.setUnderline(UnderlinePatterns.SINGLE);

        // Cột phải: Quốc hiệu - Tiêu ngữ
        XWPFTableCell rightCell = headerTable.getRow(0).getCell(1);
        XWPFParagraph pRight1 = rightCell.getParagraphs().get(0);
        pRight1.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rRight1 = pRight1.createRun();
        rRight1.setText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
        rRight1.setBold(true);
        rRight1.setFontFamily(FONT_NAME);
        rRight1.setFontSize(10);

        XWPFParagraph pRight2 = rightCell.addParagraph();
        pRight2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rRight2 = pRight2.createRun();
        rRight2.setText("Độc lập - Tự do - Hạnh phúc");
        rRight2.setBold(true);
        rRight2.setFontFamily(FONT_NAME);
        rRight2.setFontSize(10);
        rRight2.setUnderline(UnderlinePatterns.SINGLE);

        document.createParagraph(); // Dòng trống
    }

    // ===========================
    // Tiêu đề báo cáo
    // ===========================

    private void createReportTitle(XWPFDocument document, GraduationCondition condition) {
        XWPFParagraph titleP = document.createParagraph();
        titleP.setAlignment(ParagraphAlignment.CENTER);
        titleP.setSpacingAfter(100);

        XWPFRun titleR = titleP.createRun();
        titleR.setText("BÁO CÁO KẾT QUẢ XÉT TỐT NGHIỆP");
        titleR.setBold(true);
        titleR.setFontFamily(FONT_NAME);
        titleR.setFontSize(FONT_SIZE_TITLE);
        titleR.setColor(HEADER_BG_COLOR);

        XWPFParagraph subTitleP = document.createParagraph();
        subTitleP.setAlignment(ParagraphAlignment.CENTER);
        subTitleP.setSpacingAfter(150);

        XWPFRun subTitleR = subTitleP.createRun();
        String cohort = condition != null && condition.getAppliedCohort() != null
            ? condition.getAppliedCohort() : "Tất cả các khóa";
        subTitleR.setText("Khóa áp dụng: " + cohort
            + " — Ngày xuất báo cáo: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        subTitleR.setItalic(true);
        subTitleR.setFontFamily(FONT_NAME);
        subTitleR.setFontSize(FONT_SIZE_BODY);
    }

    // ===========================
    // Tiêu chuẩn tốt nghiệp
    // ===========================

    private void createConditionInfo(XWPFDocument document, GraduationCondition condition) {
        if (condition == null) return;

        XWPFParagraph condP = document.createParagraph();
        XWPFRun condR = condP.createRun();
        condR.setText("TIÊU CHÍ XÉT TỐT NGHIỆP:");
        condR.setBold(true);
        condR.setFontFamily(FONT_NAME);
        condR.setFontSize(FONT_SIZE_BODY);
        condR.setUnderline(UnderlinePatterns.SINGLE);

        String[] criteria = {
            "Số tín chỉ tích lũy tối thiểu: " + condition.getMinTotalCredits(),
            "Điểm trung bình (GPA) tối thiểu: " + condition.getMinGpa(),
            "Số tín chỉ nợ tối đa cho phép: " + condition.getMaxFailedCredits(),
            "Yêu cầu Tiếng Anh: " + nvl(condition.getEnglishRequirement()),
            "Yêu cầu Tin học: " + nvl(condition.getItRequirement()),
            "Yêu cầu Hạnh kiểm: " + nvl(condition.getConductRequired())
        };

        for (String text : criteria) {
            XWPFParagraph p = document.createParagraph();
            p.setIndentationLeft(720);
            XWPFRun run = p.createRun();
            run.setText("- " + text);
            run.setFontFamily(FONT_NAME);
            run.setFontSize(FONT_SIZE_BODY);
        }

        document.createParagraph(); // Dòng trống
    }

    // ===========================
    // Bảng SV ĐẠT (7 cột: bổ sung Lớp)
    // ===========================

    private void createPassedStudentsTable(XWPFDocument document,
                                           List<GraduationResultExportDTO> students) {
        String[] headers = {"STT", "Mã SV", "Họ và tên", "Lớp", "Điểm TB (GPA)", "Tổng tín chỉ", "Xếp loại TN"};
        XWPFTable table = document.createTable(students.size() + 1, headers.length);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            setCellStyle(headerRow.getCell(i), headers[i], true, HEADER_BG_COLOR, HEADER_TEXT_COLOR, ParagraphAlignment.CENTER);
        }

        // Data rows
        for (int i = 0; i < students.size(); i++) {
            GraduationResultExportDTO dto = students.get(i);
            XWPFTableRow row = table.getRow(i + 1);
            setCellStyle(row.getCell(0), String.valueOf(dto.getStt()), false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(1), nvl(dto.getStudentCode()), false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(2), nvl(dto.getStudentName()), false, null, null, ParagraphAlignment.LEFT);
            setCellStyle(row.getCell(3), nvl(dto.getClassName()), false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(4),
                dto.getGpa() != null ? dto.getGpa().toString() : "", false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(5),
                dto.getTotalCredits() != null ? dto.getTotalCredits().toString() : "", false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(6), nvl(dto.getClassificationText()), false, null, null, ParagraphAlignment.CENTER);
        }
    }

    // ===========================
    // Bảng SV CHƯA ĐẠT (8 cột: bổ sung Lớp và Lý do chi tiết)
    // ===========================

    private void createFailedStudentsTable(XWPFDocument document,
                                           List<GraduationResultExportDTO> students) {
        String[] headers = {"STT", "Mã SV", "Họ và tên", "Lớp", "Điểm TB", "Tín chỉ", "Nợ TC", "Lý do chưa đạt chi tiết"};
        XWPFTable table = document.createTable(students.size() + 1, headers.length);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            setCellStyle(headerRow.getCell(i), headers[i], true, HEADER_BG_COLOR, HEADER_TEXT_COLOR, ParagraphAlignment.CENTER);
        }

        // Data rows
        for (int i = 0; i < students.size(); i++) {
            GraduationResultExportDTO dto = students.get(i);
            XWPFTableRow row = table.getRow(i + 1);
            setCellStyle(row.getCell(0), String.valueOf(dto.getStt()), false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(1), nvl(dto.getStudentCode()), false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(2), nvl(dto.getStudentName()), false, null, null, ParagraphAlignment.LEFT);
            setCellStyle(row.getCell(3), nvl(dto.getClassName()), false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(4),
                dto.getGpa() != null ? dto.getGpa().toString() : "", false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(5),
                dto.getTotalCredits() != null ? dto.getTotalCredits().toString() : "", false, null, null, ParagraphAlignment.CENTER);
            setCellStyle(row.getCell(6),
                dto.getFailedCredits() != null ? dto.getFailedCredits().toString() : "", false, null, null, ParagraphAlignment.CENTER);

            // Cột lý do: mỗi lý do 1 dòng kèm bullet đỏ
            XWPFTableCell reasonCell = row.getCell(7);
            reasonCell.removeParagraph(0);
            if (dto.getFailureReasons() != null && !dto.getFailureReasons().isEmpty()) {
                for (String reason : dto.getFailureReasons()) {
                    XWPFParagraph p = reasonCell.addParagraph();
                    p.setAlignment(ParagraphAlignment.LEFT);
                    XWPFRun run = p.createRun();
                    run.setText("- " + reason);
                    run.setFontFamily(FONT_NAME);
                    run.setFontSize(9);
                    run.setColor("C0392B");
                }
            } else {
                XWPFParagraph p = reasonCell.addParagraph();
                p.setAlignment(ParagraphAlignment.LEFT);
                XWPFRun run = p.createRun();
                run.setText("- Chưa đạt yêu cầu tốt nghiệp");
                run.setFontFamily(FONT_NAME);
                run.setFontSize(9);
                run.setColor("C0392B");
            }
        }
    }

    // ===========================
    // Thống kê tổng hợp
    // ===========================

    private void createSummarySection(XWPFDocument document,
                                      List<GraduationResultExportDTO> passed,
                                      List<GraduationResultExportDTO> failed) {
        document.createParagraph();

        XWPFParagraph summaryTitle = document.createParagraph();
        XWPFRun summaryRun = summaryTitle.createRun();
        summaryRun.setText("THỐNG KÊ TỔNG HỢP");
        summaryRun.setBold(true);
        summaryRun.setFontFamily(FONT_NAME);
        summaryRun.setFontSize(FONT_SIZE_SUBTITLE);
        summaryRun.setUnderline(UnderlinePatterns.SINGLE);

        int total = passed.size() + failed.size();
        double passRate = total > 0 ? (double) passed.size() / total * 100 : 0;
        double failRate = total > 0 ? (double) failed.size() / total * 100 : 0;

        long excellent = passed.stream()
            .filter(s -> "Xuất sắc".equals(s.getClassificationText())).count();
        long good = passed.stream()
            .filter(s -> "Giỏi".equals(s.getClassificationText())).count();
        long fair = passed.stream()
            .filter(s -> "Khá".equals(s.getClassificationText())).count();
        long average = passed.stream()
            .filter(s -> "Trung bình".equals(s.getClassificationText())).count();

        String[] stats = {
            "Tổng số sinh viên được xét duyệt: " + total,
            String.format("Số sinh viên đạt yêu cầu: %d (%.1f%%)", passed.size(), passRate),
            String.format("   Trong đó: Xuất sắc: %d  |  Giỏi: %d  |  Khá: %d  |  Trung bình: %d",
                          excellent, good, fair, average),
            String.format("Số sinh viên chưa đạt: %d (%.1f%%)", failed.size(), failRate)
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
    // Phần chữ ký
    // ===========================

    private void createSignatureSection(XWPFDocument document) {
        document.createParagraph();
        document.createParagraph();

        XWPFTable sigTable = document.createTable(2, 2);
        sigTable.setWidth("100%");
        sigTable.getCTTbl().getTblPr().unsetTblBorders();

        setCellStyle(sigTable.getRow(0).getCell(0), "Người lập báo cáo", true, null, null, ParagraphAlignment.CENTER);
        setCellStyle(sigTable.getRow(0).getCell(1), "Trưởng Khoa", true, null, null, ParagraphAlignment.CENTER);
        setCellStyle(sigTable.getRow(1).getCell(0), "(Ký, ghi rõ họ tên)", false, null, null, ParagraphAlignment.CENTER);
        setCellStyle(sigTable.getRow(1).getCell(1), "(Ký, đóng dấu, ghi rõ họ tên)", false, null, null, ParagraphAlignment.CENTER);
    }

    // ===========================
    // Helper methods
    // ===========================

    private void createEmptyNotice(XWPFDocument document) {
        XWPFParagraph p = document.createParagraph();
        p.setIndentationLeft(720);
        XWPFRun r = p.createRun();
        r.setText("Không có sinh viên nào trong danh sách này.");
        r.setItalic(true);
        r.setFontFamily(FONT_NAME);
        r.setFontSize(FONT_SIZE_BODY);
        r.setColor("7F8C8D");
    }

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
                              boolean isBold, String bgColor, String textColor,
                              ParagraphAlignment alignment) {
        XWPFParagraph paragraph = cell.getParagraphs().isEmpty()
            ? cell.addParagraph() : cell.getParagraphs().get(0);
        paragraph.setAlignment(alignment != null ? alignment : ParagraphAlignment.CENTER);

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
