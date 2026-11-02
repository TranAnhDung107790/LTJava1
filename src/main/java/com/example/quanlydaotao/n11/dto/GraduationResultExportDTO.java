package com.example.quanlydaotao.n11.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO dùng cho chức năng xuất báo cáo kết quả xét tốt nghiệp ra file Word.
 * Chứa đầy đủ thông tin sinh viên, tên lớp, kết quả, phân loại và lý do không đạt.
 */
public class GraduationResultExportDTO {

    private int stt;
    private String studentCode;
    private String studentName;
    private String className;
    private BigDecimal gpa;
    private Integer totalCredits;
    private Integer failedCredits;
    private Short result;              // 1=Đạt, 0=Chưa đạt
    private Short classification;      // 1=Xuất sắc, 2=Giỏi, 3=Khá, 4=Trung bình
    private String classificationText; // "Xuất sắc", "Giỏi", "Khá", "Trung bình"
    private String resultText;         // "Đạt" / "Chưa đạt"
    private String note;
    private List<String> failureReasons = new ArrayList<>();

    // --- Constructor mặc định ---
    public GraduationResultExportDTO() {}

    // --- Constructor dùng cho JPQL Constructor Projection (Phương án 3) ---
    public GraduationResultExportDTO(
            String studentCode,
            String studentName,
            String className,
            BigDecimal gpa,
            Integer totalCredits,
            Integer failedCredits,
            Short result,
            Short classification,
            String note) {
        this.studentCode = studentCode;
        this.studentName = studentName;
        this.className = (className != null && !className.trim().isEmpty()) ? className : "Chưa xếp lớp";
        this.gpa = gpa;
        this.totalCredits = totalCredits;
        this.failedCredits = failedCredits;
        this.result = result != null ? result : (short) 0;
        this.classification = classification;
        this.classificationText = classificationToText(classification);
        this.resultText = (this.result == 1) ? "Đạt" : "Chưa đạt";
        this.note = note;
    }

    // --- Getter / Setter ---
    public int getStt() { return stt; }
    public void setStt(int stt) { this.stt = stt; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public BigDecimal getGpa() { return gpa; }
    public void setGpa(BigDecimal gpa) { this.gpa = gpa; }

    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }

    public Integer getFailedCredits() { return failedCredits; }
    public void setFailedCredits(Integer failedCredits) { this.failedCredits = failedCredits; }

    public Short getResult() { return result; }
    public void setResult(Short result) { this.result = result; }

    public Short getClassification() { return classification; }
    public void setClassification(Short classification) {
        this.classification = classification;
        this.classificationText = classificationToText(classification);
    }

    public String getClassificationText() { return classificationText; }
    public void setClassificationText(String classificationText) {
        this.classificationText = classificationText;
    }

    public String getResultText() { return resultText; }
    public void setResultText(String resultText) { this.resultText = resultText; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

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
