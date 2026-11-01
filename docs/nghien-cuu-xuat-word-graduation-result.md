# 📋 BÁO CÁO NGHIÊN CỨU: Chức năng xuất báo cáo Graduation Result ra file Word

> **Nhóm 11 — Quản lý Tốt nghiệp**
> **Nhánh**: `nhom11-test`
> **Ngày**: 01/11/2026
> **Dự án**: Hệ thống Quản lý Đào tạo IT24AB

---

## 📑 Mục lục

1. [Tổng quan hệ thống hiện tại](#1-tổng-quan-hệ-thống-hiện-tại)
2. [Phân tích cấu trúc dữ liệu](#2-phân-tích-cấu-trúc-dữ-liệu)
3. [Yêu cầu chức năng xuất Word](#3-yêu-cầu-chức-năng-xuất-word)
4. [Nghiên cứu thư viện Apache POI](#4-nghiên-cứu-thư-viện-apache-poi)
5. [Thiết kế giải pháp chi tiết](#5-thiết-kế-giải-pháp-chi-tiết)
6. [Mẫu file Word đầu ra](#6-mẫu-file-word-đầu-ra)
7. [Hướng dẫn triển khai từng bước](#7-hướng-dẫn-triển-khai-từng-bước)
8. [Kế hoạch thực hiện](#8-kế-hoạch-thực-hiện)

---

## 1. Tổng quan hệ thống hiện tại

### 1.1 Kiến trúc dự án

- **Framework**: Spring Boot 4.1.1, Java 21
- **Database**: SQL Server (`localhost:1433`, database `it24ab`)
- **ORM**: Spring Data JPA (Hibernate)
- **API Doc**: SpringDoc OpenAPI (Swagger UI)
- **Port**: `8080`

### 1.2 Cấu trúc package Nhóm 11

```
com.example.quanlydaotao.n11
├── controller/
│   ├── GraduationResultController.java      ← API kết quả xét TN
│   ├── GraduationConditionController.java   ← API điều kiện TN
│   ├── GraduationProfileController.java     ← API hồ sơ TN
│   ├── GraduationSessionController.java     ← API đợt xét TN
│   └── StudentController.java              ← API sinh viên
├── dto/
│   ├── EvaluateGraduationRequest.java       ← DTO xét duyệt tự động
│   ├── GraduationConditionRequest.java      ← DTO điều kiện TN
│   └── GraduationProfileReviewRequest.java  ← DTO duyệt hồ sơ
├── entity/
│   ├── BaseEntity.java                      ← Entity cơ sở (audit fields)
│   ├── GraduationResult.java                ← Entity kết quả TN
│   ├── GraduationCondition.java             ← Entity điều kiện TN
│   ├── GraduationSession.java               ← Entity đợt xét TN
│   ├── GraduationProfile.java               ← Entity hồ sơ TN
│   └── Student.java                         ← Entity sinh viên
├── repository/
│   ├── GraduationResultRepository.java
│   ├── GraduationConditionRepository.java
│   ├── GraduationProfileRepository.java
│   ├── GraduationSessionRepository.java
│   └── StudentRepository.java
├── service/
│   ├── GraduationResultService.java
│   ├── GraduationConditionService.java
│   ├── GraduationSessionService.java
│   ├── GraduationProfileService.java
│   └── StudentService.java
└── exception/
    ├── ApiExceptionHandler.java
    ├── NotFoundException.java
    └── ConflictException.java
```

### 1.3 Tình trạng chức năng export hiện tại

> ⚠️ **HIỆN TẠI CHƯA CÓ BẤT KỲ CHỨC NĂNG EXPORT NÀO**

- Không có thư viện Apache POI trong `pom.xml`
- Không có endpoint export Word/Excel/PDF
- Dữ liệu chỉ trả về dạng JSON qua REST API

---

## 2. Phân tích cấu trúc dữ liệu

### 2.1 Bảng `graduation_results` — Kết quả xét tốt nghiệp

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UNIQUEIDENTIFIER (PK) | Mã kết quả |
| `student_id` | UNIQUEIDENTIFIER (FK) | Mã sinh viên |
| `condition_id` | UNIQUEIDENTIFIER (FK) | Mã bộ điều kiện TN |
| `gpa` | DECIMAL(3,2) | Điểm trung bình tích lũy |
| `total_credits` | INT | Tổng số tín chỉ tích lũy |
| `failed_credits` | INT | Số tín chỉ nợ/rớt |
| `result` | TINYINT | **1 = Đạt**, **0 = Chưa đạt** |
| `classification` | TINYINT | 1=Xuất sắc, 2=Giỏi, 3=Khá, 4=Trung bình |
| `decision_date` | DATE | Ngày quyết định |
| `reviewer` | UNIQUEIDENTIFIER | Người xét duyệt |
| `note` | NVARCHAR(MAX) | Ghi chú |
| `is_active` | BIT | Trạng thái (soft delete) |

**Ràng buộc (Constraints):**
- `result` chỉ nhận giá trị `0` (Chưa đạt) hoặc `1` (Đạt)
- `classification` nhận `NULL` hoặc `1, 2, 3, 4`
- `gpa` trong khoảng `0.00 – 4.00`
- `total_credits >= 0`, `failed_credits >= 0`

### 2.2 Bảng `graduation_conditions` — Tiêu chí điều kiện tốt nghiệp

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UNIQUEIDENTIFIER (PK) | Mã bộ điều kiện |
| `program_id` | UNIQUEIDENTIFIER | Mã chương trình đào tạo |
| `applied_cohort` | NVARCHAR(10) | Khóa áp dụng (VD: "K24") |
| `min_total_credits` | INT | Số tín chỉ tối thiểu |
| `min_gpa` | DECIMAL(3,2) | GPA tối thiểu |
| `max_failed_credits` | INT | Số tín chỉ nợ tối đa cho phép |
| `english_requirement` | NVARCHAR(100) | Yêu cầu tiếng Anh |
| `it_requirement` | NVARCHAR(100) | Yêu cầu tin học |
| `conduct_required` | NVARCHAR(50) | Yêu cầu hạnh kiểm |

### 2.3 Bảng `students` / `students_` — Thông tin sinh viên

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | UNIQUEIDENTIFIER (PK) | Mã sinh viên |
| `student_code` / `code` | NVARCHAR | Mã số sinh viên |
| `full_name` | NVARCHAR | Họ và tên |
| `email` | NVARCHAR | Email |
| `class_name` | NVARCHAR | Lớp (VD: IT24A, IT24B) |

> **Lưu ý**: Entity `GraduationResult` dùng `@Formula` để lấy `studentName` và `studentCode` từ cả 2 bảng `students` và `students_` qua câu SQL COALESCE.

### 2.4 Logic xét duyệt tốt nghiệp

Một sinh viên **ĐẠT** tốt nghiệp khi thỏa TẤT CẢ các điều kiện:

```
✅ total_credits >= min_total_credits   (đủ tín chỉ)
✅ gpa >= min_gpa                        (đủ điểm GPA)
✅ failed_credits <= max_failed_credits  (không nợ quá mức)
```

Một sinh viên **KHÔNG ĐẠT** khi vi phạm BẤT KỲ điều kiện nào ở trên.

**Phân loại tốt nghiệp** (chỉ áp dụng cho sinh viên Đạt):

| Classification | Giá trị | GPA |
|---------------|---------|-----|
| Xuất sắc | 1 | ≥ 3.60 |
| Giỏi | 2 | ≥ 3.20 |
| Khá | 3 | ≥ 2.50 |
| Trung bình | 4 | < 2.50 |

### 2.5 Xác định lý do KHÔNG ĐẠT

Dựa trên logic xét duyệt, một sinh viên không đạt có thể do **1 hoặc nhiều** lý do sau:

| Lý do | Điều kiện vi phạm |
|-------|-------------------|
| Chưa đủ tín chỉ tích lũy | `total_credits < min_total_credits` |
| GPA chưa đạt yêu cầu tối thiểu | `gpa < min_gpa` |
| Số tín chỉ nợ vượt mức cho phép | `failed_credits > max_failed_credits` |

---

## 3. Yêu cầu chức năng xuất Word

### 3.1 Mô tả tổng quan

Xây dựng API endpoint cho phép xuất **báo cáo kết quả xét tốt nghiệp** ra file Microsoft Word (.docx) với các yêu cầu:

1. **Phân rõ 2 phần**: Sinh viên **ĐẠT** yêu cầu và sinh viên **KHÔNG ĐẠT**
2. Sinh viên không đạt phải ghi rõ **lý do cụ thể**
3. File Word có format chuyên nghiệp, có thể in ấn được
4. Hỗ trợ lọc theo bộ điều kiện (condition_id)

### 3.2 Endpoint dự kiến

```
GET /api/graduation-results/export/word
GET /api/graduation-results/export/word?conditionId={uuid}
```

**Response**: File `.docx` download trực tiếp

---

## 4. Nghiên cứu thư viện Apache POI

### 4.1 Giới thiệu

**Apache POI** là thư viện Java mã nguồn mở, cho phép đọc/ghi các file định dạng Microsoft Office:

| Module | Chức năng | Định dạng |
|--------|-----------|-----------|
| `poi` | Excel cũ (.xls) | HSSF |
| `poi-ooxml` | Excel mới (.xlsx), Word (.docx) | XSSF, XWPF |
| `poi-scratchpad` | PowerPoint (.ppt), Visio | HSLF |

Để tạo file Word `.docx`, ta dùng module **XWPF** (XML Word Processing Format) từ `poi-ooxml`.

### 4.2 Dependency Maven

```xml
<!-- Apache POI for Word (.docx) -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### 4.3 Các class chính của XWPF

| Class | Chức năng |
|-------|-----------|
| `XWPFDocument` | Đại diện cho toàn bộ file .docx |
| `XWPFParagraph` | Một đoạn văn bản |
| `XWPFRun` | Một đoạn text với format riêng (bold, font, size, color) |
| `XWPFTable` | Một bảng (table) |
| `XWPFTableRow` | Một hàng trong bảng |
| `XWPFTableCell` | Một ô trong hàng |
| `ParagraphAlignment` | Căn lề (LEFT, CENTER, RIGHT) |
| `TableAlignment` | Căn lề bảng |

### 4.4 So sánh các thư viện export Word

| Tiêu chí | Apache POI | Docx4j | JasperReports |
|----------|------------|--------|---------------|
| Độ phổ biến | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Dễ sử dụng | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Hiệu năng | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Kích thước | Nhẹ (~15MB) | Nặng (~30MB) | Rất nặng |
| Tạo bảng | ✅ Dễ | ✅ Dễ | ✅ Phức tạp |
| Có sẵn template | ❌ Code thuần | ✅ Hỗ trợ | ✅ GUI thiết kế |
| License | Apache 2.0 | Apache 2.0 | LGPL/Thương mại |

> **Kết luận: Chọn Apache POI (poi-ooxml)** vì nhẹ, phổ biến, dễ tích hợp Spring Boot, đủ chức năng tạo bảng và format Word cho yêu cầu bài toán.

---

## 5. Thiết kế giải pháp chi tiết

### 5.1 Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client (Browser/Postman)                     │
│              GET /api/graduation-results/export/word             │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              GraduationResultController                          │
│              + exportToWord(conditionId)                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              GraduationResultService                             │
│              + getResultsForExport(conditionId)                  │
│              + buildFailureReasons(result, condition)            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              GraduationResultWordExportService    [MỚI]          │
│              + generateReport(results, condition) → byte[]      │
│              + createHeader(document)                            │
│              + createPassedStudentsTable(document, passedList)   │
│              + createFailedStudentsTable(document, failedList)   │
│              + createSummarySection(document, stats)             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Apache POI (XWPFDocument)                           │
│              → Tạo file .docx                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Các file cần tạo mới

| File | Chức năng |
|------|-----------|
| `service/GraduationResultWordExportService.java` | Service tạo file Word |
| `dto/GraduationResultExportDTO.java` | DTO chứa data + lý do không đạt |

### 5.3 Các file cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `pom.xml` | Thêm dependency `poi-ooxml` |
| `controller/GraduationResultController.java` | Thêm endpoint `GET /export/word` |
| `service/GraduationResultService.java` | Thêm method lấy data cho export |
| `repository/GraduationResultRepository.java` | Thêm query lọc theo conditionId |

### 5.4 DTO xuất báo cáo

```java
public class GraduationResultExportDTO {
    private int stt;                    // Số thứ tự
    private String studentCode;         // Mã sinh viên
    private String studentName;         // Họ và tên
    private BigDecimal gpa;             // GPA
    private Integer totalCredits;       // Tổng tín chỉ
    private Integer failedCredits;      // Số tín chỉ nợ
    private Short result;               // 1=Đạt, 0=Chưa đạt
    private String classificationText;  // "Xuất sắc", "Giỏi", ...
    private String resultText;          // "Đạt" / "Chưa đạt"
    private List<String> failureReasons;// Danh sách lý do không đạt
}
```

### 5.5 Logic xác định lý do không đạt

```java
public List<String> buildFailureReasons(GraduationResult result, 
                                         GraduationCondition condition) {
    List<String> reasons = new ArrayList<>();
    
    // 1. Kiểm tra tín chỉ
    if (result.getTotalCredits() < condition.getMinTotalCredits()) {
        reasons.add(String.format(
            "Chưa đủ tín chỉ tích lũy (hiện có: %d, yêu cầu: %d)", 
            result.getTotalCredits(), condition.getMinTotalCredits()));
    }
    
    // 2. Kiểm tra GPA
    if (result.getGpa().compareTo(condition.getMinGpa()) < 0) {
        reasons.add(String.format(
            "GPA chưa đạt yêu cầu (hiện tại: %.2f, yêu cầu tối thiểu: %.2f)", 
            result.getGpa(), condition.getMinGpa()));
    }
    
    // 3. Kiểm tra tín chỉ nợ
    if (result.getFailedCredits() > condition.getMaxFailedCredits()) {
        reasons.add(String.format(
            "Số tín chỉ nợ vượt mức cho phép (hiện có: %d, tối đa: %d)", 
            result.getFailedCredits(), condition.getMaxFailedCredits()));
    }
    
    // Nếu không có lý do cụ thể nhưng vẫn chưa đạt
    if (reasons.isEmpty() && result.getResult() == 0) {
        reasons.add("Chưa đạt yêu cầu theo đánh giá tổng hợp");
    }
    
    return reasons;
}
```

---

## 6. Mẫu file Word đầu ra

### 6.1 Cấu trúc tổng thể file Word

```
╔══════════════════════════════════════════════════════════════╗
║              TRƯỜNG ĐẠI HỌC ... / KHOA CNTT                ║
║                                                              ║
║        BÁO CÁO KẾT QUẢ XÉT TỐT NGHIỆP                     ║
║     Bộ tiêu chí: [Tên bộ tiêu chí / Khóa áp dụng]          ║
║     Ngày xuất báo cáo: dd/MM/yyyy                            ║
║                                                              ║
║  ┌──────────── TIÊU CHÍ XÉT TỐT NGHIỆP ────────────┐      ║
║  │ • Tín chỉ tối thiểu: 120                          │      ║
║  │ • GPA tối thiểu: 2.00                              │      ║
║  │ • Tín chỉ nợ tối đa: 0                             │      ║
║  │ • Yêu cầu Tiếng Anh: TOEIC 450                     │      ║
║  │ • Yêu cầu Tin học: IC3/MOS                          │      ║
║  └────────────────────────────────────────────────────┘      ║
║                                                              ║
║  ═══ PHẦN I: SINH VIÊN ĐẠT YÊU CẦU TỐT NGHIỆP ═══        ║
║  Tổng số: XX sinh viên                                       ║
║                                                              ║
║  ┌───┬──────────┬──────────────┬─────┬──────┬──────────┐    ║
║  │STT│ Mã SV    │ Họ và tên    │ GPA │Tín chỉ│Xếp loại │    ║
║  ├───┼──────────┼──────────────┼─────┼──────┼──────────┤    ║
║  │ 1 │ SV001    │ Nguyễn Văn A │3.65 │ 130  │ Xuất sắc │    ║
║  │ 2 │ SV002    │ Trần Thị B   │3.45 │ 128  │ Giỏi     │    ║
║  │ 3 │ SV003    │ Lê Văn C     │2.80 │ 125  │ Khá      │    ║
║  └───┴──────────┴──────────────┴─────┴──────┴──────────┘    ║
║                                                              ║
║  ═══ PHẦN II: SINH VIÊN CHƯA ĐẠT YÊU CẦU ═══              ║
║  Tổng số: XX sinh viên                                       ║
║                                                              ║
║  ┌───┬──────────┬──────────────┬─────┬──────┬───┬──────────┐║
║  │STT│ Mã SV    │ Họ và tên    │ GPA │TC   │ Nợ│ Lý do    │║
║  ├───┼──────────┼──────────────┼─────┼──────┼───┼──────────┤║
║  │ 1 │ SV010    │ Phạm Văn D   │1.80 │ 100  │ 5 │- GPA...  │║
║  │   │          │              │     │      │   │- Chưa... │║
║  │   │          │              │     │      │   │- Nợ...   │║
║  │ 2 │ SV011    │ Hoàng Thị E  │2.50 │ 110  │ 0 │- Chưa... │║
║  └───┴──────────┴──────────────┴─────┴──────┴───┴──────────┘║
║                                                              ║
║  ═══ THỐNG KÊ TỔNG HỢP ═══                                 ║
║  • Tổng số sinh viên xét: XX                                 ║
║  • Số đạt yêu cầu: XX (XX.X%)                               ║
║  •   Xuất sắc: XX    Giỏi: XX                               ║
║  •   Khá: XX         Trung bình: XX                          ║
║  • Số chưa đạt: XX (XX.X%)                                  ║
║                                                              ║
║  Người lập báo cáo         Trưởng khoa                       ║
║  (Ký, ghi rõ họ tên)      (Ký, ghi rõ họ tên)               ║
╚══════════════════════════════════════════════════════════════╝
```

### 6.2 Chi tiết bảng Sinh viên ĐẠT (6 cột)

| STT | Mã sinh viên | Họ và tên | GPA | Tổng tín chỉ | Xếp loại |
|-----|-------------|-----------|-----|--------------|----------|
| 1 | SV001 | Nguyễn Văn A | 3.65 | 130 | Xuất sắc |
| 2 | SV002 | Trần Thị B | 3.45 | 128 | Giỏi |
| 3 | SV003 | Lê Văn C | 2.80 | 125 | Khá |

### 6.3 Chi tiết bảng Sinh viên KHÔNG ĐẠT (7 cột, có lý do)

| STT | Mã SV | Họ và tên | GPA | Tín chỉ | Nợ | Lý do không đạt |
|-----|-------|-----------|-----|---------|-----|-----------------|
| 1 | SV010 | Phạm Văn D | 1.80 | 100 | 5 | - GPA chưa đạt (1.80 < 2.00) |
| | | | | | | - Chưa đủ tín chỉ (100 < 120) |
| | | | | | | - Nợ vượt mức (5 > 0) |
| 2 | SV011 | Hoàng Thị E | 2.50 | 110 | 0 | - Chưa đủ tín chỉ (110 < 120) |

---

## 7. Hướng dẫn triển khai từng bước

### Bước 1: Thêm dependency Apache POI vào `pom.xml`

```xml
<!-- Thêm vào trong <dependencies> -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>
```

### Bước 2: Tạo DTO `GraduationResultExportDTO.java`

```java
package com.example.quanlydaotao.n11.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    // --- Helper: chuyển classification code sang text ---
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
```

### Bước 3: Tạo Service `GraduationResultWordExportService.java`

```java
package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
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
     * Tạo báo cáo Word hoàn chỉnh
     */
    public byte[] generateReport(
            List<GraduationResultExportDTO> passedStudents,
            List<GraduationResultExportDTO> failedStudents,
            GraduationCondition condition) throws IOException {

        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // 1. Header báo cáo
            createReportHeader(document, condition);

            // 2. Thông tin tiêu chí xét TN
            createConditionInfo(document, condition);

            // 3. Phần I - Sinh viên ĐẠT
            createSectionTitle(document, 
                "PHẦN I: DANH SÁCH SINH VIÊN ĐẠT YÊU CẦU TỐT NGHIỆP", 
                PASS_COLOR);
            createSubInfo(document, 
                "Tổng số: " + passedStudents.size() + " sinh viên");
            
            if (!passedStudents.isEmpty()) {
                createPassedStudentsTable(document, passedStudents);
            } else {
                createSubInfo(document, "(Không có sinh viên nào đạt yêu cầu)");
            }

            // 4. Phần II - Sinh viên CHƯA ĐẠT
            createSectionTitle(document, 
                "PHẦN II: DANH SÁCH SINH VIÊN CHƯA ĐẠT YÊU CẦU", 
                FAIL_COLOR);
            createSubInfo(document, 
                "Tổng số: " + failedStudents.size() + " sinh viên");
            
            if (!failedStudents.isEmpty()) {
                createFailedStudentsTable(document, failedStudents);
            } else {
                createSubInfo(document, "(Không có sinh viên nào chưa đạt)");
            }

            // 5. Thống kê tổng hợp
            createSummarySection(document, passedStudents, failedStudents);

            // 6. Phần ký tên
            createSignatureSection(document);

            document.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Tạo header (tiêu đề) báo cáo
     */
    private void createReportHeader(XWPFDocument document, 
                                     GraduationCondition condition) {
        // Tên trường/khoa
        XWPFParagraph orgParagraph = document.createParagraph();
        orgParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun orgRun = orgParagraph.createRun();
        orgRun.setText("TRƯỜNG ĐẠI HỌC ... — KHOA CÔNG NGHỆ THÔNG TIN");
        orgRun.setFontFamily(FONT_NAME);
        orgRun.setFontSize(FONT_SIZE_BODY);

        // Tiêu đề chính
        XWPFParagraph titleParagraph = document.createParagraph();
        titleParagraph.setAlignment(ParagraphAlignment.CENTER);
        titleParagraph.setSpacingAfter(200);
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO KẾT QUẢ XÉT TỐT NGHIỆP");
        titleRun.setBold(true);
        titleRun.setFontFamily(FONT_NAME);
        titleRun.setFontSize(FONT_SIZE_TITLE);
        titleRun.setColor("1A237E");

        // Phụ đề: khóa áp dụng
        if (condition != null && condition.getAppliedCohort() != null) {
            XWPFParagraph subParagraph = document.createParagraph();
            subParagraph.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun subRun = subParagraph.createRun();
            subRun.setText("Khóa áp dụng: " + condition.getAppliedCohort());
            subRun.setFontFamily(FONT_NAME);
            subRun.setFontSize(FONT_SIZE_SUBTITLE);
            subRun.setItalic(true);
        }

        // Ngày xuất
        XWPFParagraph dateParagraph = document.createParagraph();
        dateParagraph.setAlignment(ParagraphAlignment.CENTER);
        dateParagraph.setSpacingAfter(400);
        XWPFRun dateRun = dateParagraph.createRun();
        dateRun.setText("Ngày xuất báo cáo: " 
            + LocalDate.now().format(
                DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        dateRun.setFontFamily(FONT_NAME);
        dateRun.setFontSize(FONT_SIZE_BODY);
    }

    /**
     * Tạo phần thông tin tiêu chí tốt nghiệp
     */
    private void createConditionInfo(XWPFDocument document, 
                                      GraduationCondition condition) {
        if (condition == null) return;

        XWPFParagraph condTitle = document.createParagraph();
        XWPFRun condTitleRun = condTitle.createRun();
        condTitleRun.setText("TIÊU CHÍ XÉT TỐT NGHIỆP:");
        condTitleRun.setBold(true);
        condTitleRun.setFontFamily(FONT_NAME);
        condTitleRun.setFontSize(FONT_SIZE_BODY);
        condTitleRun.setUnderline(UnderlinePatterns.SINGLE);

        String[] criteria = {
            "Số tín chỉ tối thiểu: " + condition.getMinTotalCredits(),
            "GPA tối thiểu: " + condition.getMinGpa(),
            "Số tín chỉ nợ tối đa cho phép: " + condition.getMaxFailedCredits(),
            "Yêu cầu Tiếng Anh: " + nvl(condition.getEnglishRequirement()),
            "Yêu cầu Tin học: " + nvl(condition.getItRequirement()),
            "Yêu cầu Hạnh kiểm: " + nvl(condition.getConductRequired())
        };

        for (String text : criteria) {
            XWPFParagraph p = document.createParagraph();
            p.setIndentationLeft(720); // 0.5 inch
            XWPFRun run = p.createRun();
            run.setText("• " + text);
            run.setFontFamily(FONT_NAME);
            run.setFontSize(FONT_SIZE_BODY);
        }

        document.createParagraph(); // Dòng trống
    }

    /**
     * Tạo bảng sinh viên ĐẠT (6 cột)
     */
    private void createPassedStudentsTable(XWPFDocument document, 
                                            List<GraduationResultExportDTO> students) {
        String[] headers = {"STT", "Mã SV", "Họ và tên", "GPA", 
                            "Tổng tín chỉ", "Xếp loại TN"};
        XWPFTable table = document.createTable(students.size() + 1, 
                                                headers.length);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            setCellStyle(headerRow.getCell(i), headers[i], true, 
                         HEADER_BG_COLOR, HEADER_TEXT_COLOR);
        }

        // Data rows
        for (int i = 0; i < students.size(); i++) {
            GraduationResultExportDTO dto = students.get(i);
            XWPFTableRow row = table.getRow(i + 1);
            setCellStyle(row.getCell(0), String.valueOf(dto.getStt()), 
                         false, null, null);
            setCellStyle(row.getCell(1), nvl(dto.getStudentCode()), 
                         false, null, null);
            setCellStyle(row.getCell(2), nvl(dto.getStudentName()), 
                         false, null, null);
            setCellStyle(row.getCell(3), 
                dto.getGpa() != null ? dto.getGpa().toString() : "", 
                false, null, null);
            setCellStyle(row.getCell(4), 
                dto.getTotalCredits() != null 
                    ? dto.getTotalCredits().toString() : "", 
                false, null, null);
            setCellStyle(row.getCell(5), nvl(dto.getClassificationText()), 
                         false, null, null);
        }
    }

    /**
     * Tạo bảng sinh viên CHƯA ĐẠT (7 cột, có cột lý do)
     */
    private void createFailedStudentsTable(XWPFDocument document, 
                                            List<GraduationResultExportDTO> students) {
        String[] headers = {"STT", "Mã SV", "Họ và tên", "GPA", 
                            "Tín chỉ", "Nợ", "Lý do không đạt"};
        XWPFTable table = document.createTable(students.size() + 1, 
                                                headers.length);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            setCellStyle(headerRow.getCell(i), headers[i], true, 
                         HEADER_BG_COLOR, HEADER_TEXT_COLOR);
        }

        // Data rows
        for (int i = 0; i < students.size(); i++) {
            GraduationResultExportDTO dto = students.get(i);
            XWPFTableRow row = table.getRow(i + 1);
            setCellStyle(row.getCell(0), String.valueOf(dto.getStt()), 
                         false, null, null);
            setCellStyle(row.getCell(1), nvl(dto.getStudentCode()), 
                         false, null, null);
            setCellStyle(row.getCell(2), nvl(dto.getStudentName()), 
                         false, null, null);
            setCellStyle(row.getCell(3), 
                dto.getGpa() != null ? dto.getGpa().toString() : "", 
                false, null, null);
            setCellStyle(row.getCell(4), 
                dto.getTotalCredits() != null 
                    ? dto.getTotalCredits().toString() : "", 
                false, null, null);
            setCellStyle(row.getCell(5), 
                dto.getFailedCredits() != null 
                    ? dto.getFailedCredits().toString() : "", 
                false, null, null);

            // Cột lý do: mỗi lý do 1 dòng
            XWPFTableCell reasonCell = row.getCell(6);
            reasonCell.removeParagraph(0);
            for (String reason : dto.getFailureReasons()) {
                XWPFParagraph p = reasonCell.addParagraph();
                XWPFRun run = p.createRun();
                run.setText("• " + reason);
                run.setFontFamily(FONT_NAME);
                run.setFontSize(9);
                run.setColor("C0392B");
            }
        }
    }

    /**
     * Tạo phần thống kê tổng hợp
     */
    private void createSummarySection(XWPFDocument document,
                                       List<GraduationResultExportDTO> passed,
                                       List<GraduationResultExportDTO> failed) {
        document.createParagraph();

        XWPFParagraph summaryTitle = document.createParagraph();
        XWPFRun summaryTitleRun = summaryTitle.createRun();
        summaryTitleRun.setText("THỐNG KÊ TỔNG HỢP");
        summaryTitleRun.setBold(true);
        summaryTitleRun.setFontFamily(FONT_NAME);
        summaryTitleRun.setFontSize(FONT_SIZE_SUBTITLE);
        summaryTitleRun.setUnderline(UnderlinePatterns.SINGLE);

        int total = passed.size() + failed.size();
        double passRate = total > 0 
            ? (double) passed.size() / total * 100 : 0;
        double failRate = total > 0 
            ? (double) failed.size() / total * 100 : 0;

        // Đếm phân loại
        long excellent = passed.stream()
            .filter(s -> "Xuất sắc".equals(s.getClassificationText()))
            .count();
        long good = passed.stream()
            .filter(s -> "Giỏi".equals(s.getClassificationText()))
            .count();
        long fair = passed.stream()
            .filter(s -> "Khá".equals(s.getClassificationText()))
            .count();
        long average = passed.stream()
            .filter(s -> "Trung bình".equals(s.getClassificationText()))
            .count();

        String[] stats = {
            "Tổng số sinh viên được xét: " + total,
            String.format("Số đạt yêu cầu: %d (%.1f%%)", 
                          passed.size(), passRate),
            String.format("    Xuất sắc: %d  |  Giỏi: %d  |  " +
                          "Khá: %d  |  Trung bình: %d", 
                          excellent, good, fair, average),
            String.format("Số chưa đạt: %d (%.1f%%)", 
                          failed.size(), failRate)
        };

        for (String text : stats) {
            XWPFParagraph p = document.createParagraph();
            p.setIndentationLeft(360);
            XWPFRun run = p.createRun();
            run.setText("• " + text);
            run.setFontFamily(FONT_NAME);
            run.setFontSize(FONT_SIZE_BODY);
        }
    }

    /**
     * Tạo phần chữ ký
     */
    private void createSignatureSection(XWPFDocument document) {
        document.createParagraph();
        document.createParagraph();

        XWPFTable sigTable = document.createTable(2, 2);
        sigTable.setWidth("100%");
        // Bỏ viền
        sigTable.getCTTbl().getTblPr().unsetTblBorders();

        // Hàng 1: Tiêu đề
        setCellStyle(sigTable.getRow(0).getCell(0), 
                     "Người lập báo cáo", true, null, null);
        setCellStyle(sigTable.getRow(0).getCell(1), 
                     "Trưởng Khoa", true, null, null);
        // Hàng 2: Ghi chú ký
        setCellStyle(sigTable.getRow(1).getCell(0), 
                     "(Ký, ghi rõ họ tên)", false, null, null);
        setCellStyle(sigTable.getRow(1).getCell(1), 
                     "(Ký, đóng dấu, ghi rõ họ tên)", false, null, null);
    }

    // ===== HELPER METHODS =====

    private void createSectionTitle(XWPFDocument document, String title, 
                                     String color) {
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
                               boolean isBold, String bgColor, 
                               String textColor) {
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
        return value != null ? value : "Không yêu cầu";
    }
}
```

### Bước 4: Thêm method vào `GraduationResultService.java`

```java
// Thêm vào GraduationResultService.java

/**
 * Lấy danh sách kết quả xét TN phân theo Đạt/Chưa đạt,
 * kèm lý do không đạt chi tiết
 */
public Map<String, List<GraduationResultExportDTO>> getResultsForExport(
        UUID conditionId) {
    
    // 1. Lấy tất cả kết quả active (theo conditionId nếu có)
    List<GraduationResult> results;
    if (conditionId != null) {
        results = repository.findByConditionIdAndIsActiveTrue(conditionId);
    } else {
        results = repository.findByIsActiveTrue();
    }
    
    // 2. Lấy thông tin bộ điều kiện
    GraduationCondition condition = null;
    if (conditionId != null) {
        condition = conditionRepository.findById(conditionId).orElse(null);
    }
    
    // 3. Phân loại và tạo DTO
    List<GraduationResultExportDTO> passedList = new ArrayList<>();
    List<GraduationResultExportDTO> failedList = new ArrayList<>();
    
    int passStt = 1, failStt = 1;
    
    for (GraduationResult r : results) {
        GraduationResultExportDTO dto = new GraduationResultExportDTO();
        dto.setStudentCode(r.getStudentCode());
        dto.setStudentName(r.getStudentName());
        dto.setGpa(r.getGpa());
        dto.setTotalCredits(r.getTotalCredits());
        dto.setFailedCredits(r.getFailedCredits());
        dto.setResult(r.getResult());
        
        if (r.getResult() != null && r.getResult() == 1) {
            // ĐẠT
            dto.setStt(passStt++);
            dto.setResultText("Đạt");
            dto.setClassificationText(
                GraduationResultExportDTO
                    .classificationToText(r.getClassification()));
            passedList.add(dto);
        } else {
            // CHƯA ĐẠT - xác định lý do
            dto.setStt(failStt++);
            dto.setResultText("Chưa đạt");
            dto.setFailureReasons(
                buildFailureReasons(r, condition));
            failedList.add(dto);
        }
    }
    
    Map<String, List<GraduationResultExportDTO>> result = new HashMap<>();
    result.put("passed", passedList);
    result.put("failed", failedList);
    return result;
}

/**
 * Xác định lý do cụ thể sinh viên không đạt TN
 */
private List<String> buildFailureReasons(GraduationResult result,
                                          GraduationCondition condition) {
    List<String> reasons = new ArrayList<>();
    
    if (condition == null) {
        if (result.getNote() != null && !result.getNote().isEmpty()) {
            reasons.add(result.getNote());
        } else {
            reasons.add("Chưa đạt yêu cầu tốt nghiệp");
        }
        return reasons;
    }
    
    // Kiểm tra tín chỉ
    if (result.getTotalCredits() != null && 
        condition.getMinTotalCredits() != null &&
        result.getTotalCredits() < condition.getMinTotalCredits()) {
        reasons.add(String.format(
            "Chưa đủ tín chỉ tích lũy (có: %d, yêu cầu: %d)",
            result.getTotalCredits(), condition.getMinTotalCredits()));
    }
    
    // Kiểm tra GPA
    if (result.getGpa() != null && 
        condition.getMinGpa() != null &&
        result.getGpa().compareTo(condition.getMinGpa()) < 0) {
        reasons.add(String.format(
            "GPA chưa đạt yêu cầu (có: %s, yêu cầu: %s)",
            result.getGpa(), condition.getMinGpa()));
    }
    
    // Kiểm tra tín chỉ nợ
    if (result.getFailedCredits() != null && 
        condition.getMaxFailedCredits() != null &&
        result.getFailedCredits() > condition.getMaxFailedCredits()) {
        reasons.add(String.format(
            "Số tín chỉ nợ vượt mức cho phép (có: %d, tối đa: %d)",
            result.getFailedCredits(), condition.getMaxFailedCredits()));
    }
    
    // Fallback
    if (reasons.isEmpty()) {
        if (result.getNote() != null && !result.getNote().isEmpty()) {
            reasons.add(result.getNote());
        } else {
            reasons.add("Chưa đạt yêu cầu theo đánh giá tổng hợp");
        }
    }
    
    return reasons;
}
```

### Bước 5: Thêm endpoint vào `GraduationResultController.java`

```java
// Thêm import
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

// Thêm inject
@Autowired
private GraduationResultWordExportService wordExportService;

// Thêm endpoint
@GetMapping("/export/word")
public ResponseEntity<byte[]> exportToWord(
        @RequestParam(required = false) UUID conditionId) {
    try {
        // 1. Lấy dữ liệu phân loại
        Map<String, List<GraduationResultExportDTO>> data = 
            service.getResultsForExport(conditionId);
        
        // 2. Lấy thông tin bộ điều kiện
        GraduationCondition condition = null;
        if (conditionId != null) {
            condition = conditionService.findById(conditionId);
        }
        
        // 3. Tạo file Word
        byte[] docBytes = wordExportService.generateReport(
            data.get("passed"), data.get("failed"), condition);
        
        // 4. Trả về file download
        String filename = "BaoCao_XetTotNghiep_" 
            + LocalDate.now().format(
                DateTimeFormatter.ofPattern("ddMMyyyy")) 
            + ".docx";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument" +
            ".wordprocessingml.document"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(docBytes.length);
        
        return ResponseEntity.ok().headers(headers).body(docBytes);
        
    } catch (IOException e) {
        return ResponseEntity.internalServerError().build();
    }
}
```

### Bước 6: Thêm query vào `GraduationResultRepository.java`

```java
// Thêm vào GraduationResultRepository.java

List<GraduationResult> findByConditionIdAndIsActiveTrue(UUID conditionId);

List<GraduationResult> findByIsActiveTrue();
```

---

## 8. Kế hoạch thực hiện

### 8.1 Phân chia công việc

| Bước | Công việc | Ước lượng | Ưu tiên |
|------|-----------|-----------|---------|
| 1 | Thêm dependency POI vào `pom.xml` | 5 phút | Cao |
| 2 | Tạo `GraduationResultExportDTO.java` | 15 phút | Cao |
| 3 | Tạo `GraduationResultWordExportService.java` | 60 phút | Cao |
| 4 | Thêm methods export vào `GraduationResultService` | 30 phút | Cao |
| 5 | Thêm endpoint vào Controller | 15 phút | Cao |
| 6 | Thêm queries vào Repository | 5 phút | Cao |
| 7 | Test với Swagger/Postman | 30 phút | Cao |
| 8 | Tối ưu format Word (căn cột, font...) | 30 phút | Trung bình |
| **Tổng** | | **~3 giờ** | |

### 8.2 Rủi ro và giải pháp

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Font tiếng Việt bị lỗi encoding | Trung bình | Sử dụng `Times New Roman`, đảm bảo UTF-8 |
| Bảng quá rộng khi nhiều dữ liệu | Thấp | Giới hạn độ rộng cột, wordwrap |
| Hiệu năng khi xuất nhiều sinh viên | Thấp | Dùng streaming (ByteArrayOutputStream) |
| `@Formula` không load khi export | Trung bình | Dùng `@EntityGraph` hoặc native query |
| Dữ liệu mock trong evaluate() | Cao | Cần thay bằng dữ liệu thực khi có bảng điểm |

### 8.3 Lưu ý quan trọng

> ⚠️ **Hiện tại method `evaluate()` dùng dữ liệu GPA/tín chỉ HARDCODED (giả lập)**
> - GPA mặc định = 2.85, tín chỉ = 125, nợ = 0
> - Tất cả sinh viên đều ra kết quả giống nhau
> - Cần thay bằng dữ liệu thực từ bảng tổng kết điểm khi có

> ⚠️ **Entity GraduationResult dùng `@Formula` cho studentName/studentCode**
> - Khi load từ DB, Hibernate tự chạy subselect SQL
> - Khi tạo export, cần đảm bảo data đã được load đầy đủ (không bị lazy)

---

> **Tài liệu này là kết quả nghiên cứu của Nhóm 11 trên nhánh `nhom11-test`.**
> **Mọi thay đổi chỉ commit local, KHÔNG push lên GitHub.**
