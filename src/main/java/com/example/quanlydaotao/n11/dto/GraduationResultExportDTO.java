package com.example.quanlydaotao.n11.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO dùng cho chức năng xuất báo cáo kết quả xét tốt nghiệp ra file Word.
 * Chứa đầy đủ thông tin sinh viên, kết quả, phân loại và lý do không đạt.
 */
public class GraduationResultExportDTO {

    private int stt;
    private String studentCode;
    private String studentName;
    private BigDecimal gpa;
    private Integer totalCredits;
    private Integer failedCredits;
    private Short result;              // 1=Đạt, 0=Chưa đạt
    private String classificationText; // "Xuất sắc", "Giỏi", "Khá", "Trung bình"
    private String resultText;         // "Đạt" / "Chưa đạt"
    private List<String> failureReasons = new ArrayList<>();

    // --- Constructor ---
    public GraduationResultExportDTO() {}

    // --- Getter / Setter ---
    public int getStt() { return stt; }
    public void setStt(int stt) { this.stt = stt; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public BigDecimal getGpa() { return gpa; }
    public void setGpa(BigDecimal gpa) { this.gpa = gpa; }

    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }

    public Integer getFailedCredits() { return failedCredits; }
    public void setFailedCredits(Integer failedCredits) { this.failedCredits = failedCredits; }

    public Short getResult() { return result; }
    public void setResult(Short result) { this.result = result; }

    public String getClassificationText() { return classificationText; }
    public void setClassificationText(String classificationText) {
        this.classificationText = classificationText;
    }

    public String getResultText() { return resultText; }
    public void setResultText(String resultText) { this.resultText = resultText; }

    public List<String> getFailureReasons() { return failureReasons; }
    public void setFailureReasons(List<String> failureReasons) {
        this.failureReasons = failureReasons;
    }

    /**
     * Chuyển mã classification (1-4) sang chuỗi hiển thị tiếng Việt.
     */
    public static String classificationToText(Short classification) {
        if (classification == null) return "";
        return switch (classification) {
            case 1 -> "Xuất sắc";
            case 2 -> "Giỏi";
            case 3 -> "Khá";
            case 4 -> "Trung bình";
            default -> "";
        };
    }
}

