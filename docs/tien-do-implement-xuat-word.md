# 📊 Tiến độ Implement: Chức năng xuất Word Graduation Result

> **Nhánh:** `nhom11-test` | **Bắt đầu:** 02/11/2026 | **Hoàn thành:** 02/11/2026
> **Mục tiêu:** Implement 6 bước theo tài liệu nghiên cứu

---

## Trạng thái tổng quan

| Bước | File | Trạng thái | Commit |
|------|------|-----------|--------|
| 1 | `pom.xml` — Thêm dependency POI | ✅ Xong | `1d37751` |
| 2 | `dto/GraduationResultExportDTO.java` — Tạo mới | ✅ Xong | `1d37751` |
| 3 | `repository/GraduationResultRepository.java` — Thêm 2 method | ✅ Xong | `1d37751` |
| 4 | `service/GraduationResultService.java` — Inject + 2 method | ✅ Xong | `1d37751` |
| 5 | `service/GraduationResultWordExportService.java` — Tạo mới | ✅ Xong | `1d37751` |
| 6 | `controller/GraduationResultController.java` — Inject + endpoint | ✅ Xong | `1d37751` |

> ✅ **BUILD SUCCESS** — `mvn compile`: 30 source files, 0 errors

---

## Chi tiết tiến độ từng bước

### Bước 1: `pom.xml`
- **Việc cần làm:** Thêm dependency `poi-ooxml 5.2.5`
- **Trạng thái:** ⏳ Chưa làm

---

### Bước 2: `GraduationResultExportDTO.java`
- **Việc cần làm:** Tạo mới file DTO
- **Path:** `src/main/java/com/example/quanlydaotao/n11/dto/GraduationResultExportDTO.java`
- **Trạng thái:** ⏳ Chưa làm

---

### Bước 3: `GraduationResultRepository.java`
- **Việc cần làm:** Thêm 2 method:
  - `findByConditionIdAndIsActiveTrue(UUID conditionId)`
  - `findByIsActiveTrue()`
- **Path:** `src/main/java/com/example/quanlydaotao/n11/repository/GraduationResultRepository.java`
- **Trạng thái:** ⏳ Chưa làm

---

### Bước 4: `GraduationResultService.java`
- **Việc cần làm:**
  - Inject thêm `GraduationConditionRepository`
  - Thêm method `getResultsForExport(UUID conditionId)`
  - Thêm method `buildFailureReasons(...)`
- **Path:** `src/main/java/com/example/quanlydaotao/n11/service/GraduationResultService.java`
- **Trạng thái:** ⏳ Chưa làm

---

### Bước 5: `GraduationResultWordExportService.java`
- **Việc cần làm:** Tạo mới Service tạo file Word với Apache POI
- **Path:** `src/main/java/com/example/quanlydaotao/n11/service/GraduationResultWordExportService.java`
- **Trạng thái:** ⏳ Chưa làm

---

### Bước 6: `GraduationResultController.java`
- **Việc cần làm:**
  - Inject thêm `GraduationResultWordExportService` và `GraduationConditionService`
  - Thêm endpoint `GET /export/word`
- **Path:** `src/main/java/com/example/quanlydaotao/n11/controller/GraduationResultController.java`
- **Trạng thái:** ⏳ Chưa làm

---

## Log thực hiện

_(Cập nhật khi hoàn thành từng bước)_

---

## Test sau khi hoàn thành

```
GET http://localhost:8080/api/graduation-results/export/word
GET http://localhost:8080/api/graduation-results/export/word?conditionId=276a95ec-a78d-4033-886c-6c3b0cabd8dd
```

**Kết quả mong đợi:** File `BaoCao_XetTotNghiep_02112026.docx` — 667 đạt, 133 không đạt


---

# 🚀 GIAI ĐOẠN 2: TÍCH HỢP XUẤT BÁO CÁO WORD KÈM TÊN LỚP VÀO FRONTEND (PHƯƠNG ÁN 3 - JPQL QUERY JOIN)

> **Căn cứ tài liệu:** docs/nghien-cuu-tich-hop-xuat-word-frontend-kem-ten-lop.md  
> **Thời gian thực hiện:** 02/11/2026  
> **Phương án kỹ thuật:** Phương án 3 (JPQL Query Join giữa GraduationResult và Student, tạo DTO trực tiếp trong Repository)  
> **Mục tiêu:** Bổ sung cột Tên lớp vào file Word xuất ra, chuẩn hóa tiếng Việt có dấu, và tích hợp nút "Xuất Word" vào Frontend graduation-results.html.

## 1. Trạng thái tổng quan Giai đoạn 2

| STT | Nhiệm vụ / File | Trạng thái | Ghi chú kỹ thuật |
|:---:|:---|:---:|:---|
| 1 | dto/GraduationResultExportDTO.java | ✅ Hoàn thành | Thêm thuộc tính className, 
ote và Constructor 9 tham số cho JPQL projection |
| 2 | epository/GraduationResultRepository.java | ✅ Hoàn thành | Thêm 2 method @Query JPQL JOIN: indExportDataByConditionId và indAllExportData |
| 3 | service/GraduationResultService.java | ✅ Hoàn thành | Cập nhật getResultsForExport: gọi truy vấn JPQL 1 query duy nhất, làm sạch số thừa đuôi tên SV |
| 4 | service/GraduationResultWordExportService.java | ✅ Hoàn thành | Cập nhật Bảng I (7 cột: thêm Lớp) và Bảng II (8 cột: thêm Lớp + Lý do chi tiết), 100% tiếng Việt có dấu |
| 5 | static/graduation-results.html | ✅ Hoàn thành | Thêm nút #btnExportWord (icon Word, Bootstrap 5) và dropdown lọc #filterCondition |
| 6 | static/assets/js/graduation-result.js | ✅ Hoàn thành | Thêm hàm handleExportWord (loading spinner, fetch blob, auto download, toast alert), hiển thị badge lớp trên Web UI |
| 7 | Biên dịch & Kiểm thử máy chủ thực tế | ✅ Hoàn thành | mvn compile 30 files SUCCESS, test API xuất Word sinh file 31.3 KB chứa đầy đủ tên lớp IT24, IT25, IT26 |

---

## 2. Chi tiết thực hiện từng bước

### Bước 1: Cập nhật GraduationResultExportDTO.java
- **Mục đích:** Bổ sung trường dữ liệu className để nhận thông tin lớp từ bảng students.
- **Nội dung thực hiện:**
  - Thêm thuộc tính private String className;, private String note;.
  - Bổ sung Constructor 9 tham số phục vụ JPQL Constructor Expression (SELECT new ...DTO(...)).
  - Giữ nguyên Constructor mặc định và các hàm tiện ích (classificationToText).

### Bước 2: Bổ sung JPQL Join trong GraduationResultRepository.java
- **Mục đích:** Thực hiện JOIN trực tiếp giữa GraduationResult và Student trên gr.studentId = s.id mà không cần thay đổi Entity.
- **Nội dung thực hiện:**
  - Thêm method indExportDataByConditionId(@Param("conditionId") UUID conditionId).
  - Thêm method indAllExportData().
  - Lấy chính xác s.className từ bảng students, loại bỏ hoàn toàn vấn đề N+1 query.

### Bước 3: Nâng cấp GraduationResultService.java
- **Mục đích:** Xử lý dữ liệu xuất báo cáo nhanh chóng trong 1 query duy nhất.
- **Nội dung thực hiện:**
  - Gọi repository lấy danh sách DTO đã có sẵn tên lớp.
  - Sử dụng hàm cleanStudentName() xóa bỏ số mock data thừa ở đuôi tên sinh viên (ví dụ: Diệp Thành Nam 12 $\rightarrow$ Diệp Thành Nam).
  - Phân loại danh sách passed và ailed, tính toán danh sách ailureReasons cho sinh viên chưa đạt.

### Bước 4: Hoàn thiện định dạng văn bản trong GraduationResultWordExportService.java
- **Mục đích:** Tạo tài liệu Word đẹp, chuẩn quy thức văn bản hành chính, bổ sung cột Lớp.
- **Nội dung thực hiện:**
  - **Bảng I (Sinh viên đạt):** 7 cột (STT, Mã SV, Họ và tên, Lớp, Điểm TB (GPA), Tổng tín chỉ, Xếp loại TN). Căn giữa STT, Mã SV, Lớp, GPA, Tín chỉ, Xếp loại; căn trái Họ tên.
  - **Bảng II (Sinh viên chưa đạt):** 8 cột (STT, Mã SV, Họ và tên, Lớp, Điểm TB, Tín chỉ, Nợ TC, Lý do chưa đạt chi tiết). Các lý do được đánh bullet đỏ nổi bật (#C0392B).
  - Toàn bộ tiêu đề, tiêu chuẩn tốt nghiệp, thống kê tỷ lệ đạt/chưa đạt và phần chữ ký đều sử dụng 100% tiếng Việt có dấu chuẩn Unicode.

### Bước 5 & 6: Tích hợp Giao diện Frontend (graduation-results.html & graduation-result.js)
- **Mục đích:** Cho phép người dùng xuất báo cáo Word trực tiếp từ trình duyệt.
- **Nội dung thực hiện:**
  - Thêm nút #btnExportWord trên thanh toolbar với icon Bootstrap i-file-earmark-word và phong cách Office tn-success.
  - Thêm bộ lọc #filterCondition để lọc và xuất theo từng bộ tiêu chí tốt nghiệp.
  - Xử lý trạng thái Loading: Nút chuyển sang disabled và hiển thị spinner Đang tạo Word... khi đang tải.
  - Xử lý tải file: Nhận luồng nhị phân Blob, tự động trích xuất filename từ header Content-Disposition, tạo link ảo tải về và thu hồi URL blob sau khi hoàn tất.
  - Hiển thị thông báo trạng thái qua Toast Alert (showAlert('success') hoặc showAlert('danger')).
  - Bổ sung hiển thị badge Tên lớp của sinh viên ngay trên bảng kết quả Web UI.

---

## 3. Kết quả kiểm thử thực tế

1. **Biên dịch Backend:**
   - Lệnh: mvn compile
   - Kết quả: BUILD SUCCESS, 30 source files compiled with 0 errors.

2. **Kiểm tra API Xuất Word toàn bộ:**
   - Lệnh gọi: GET /api/graduation-results/export/word
   - Kết quả: File tải về dung lượng **31,301 bytes**. Cấu trúc XML tài liệu chứa đầy đủ cột Lớp và các lớp IT23A-D, IT24A-D, IT25A-D, IT26A-D. Tiêu đề và nội dung 100% tiếng Việt có dấu.

3. **Kiểm tra API Xuất Word theo Bộ tiêu chí K24:**
   - Lệnh gọi: GET /api/graduation-results/export/word?conditionId=276a95ec-a78d-4033-886c-6c3b0cabd8dd
   - Kết quả: File tải về dung lượng **32,379 bytes**, tiêu đề phản ánh đúng Khóa áp dụng: K24 và đầy đủ cột Lớp.

4. **Kiểm tra Giao diện Frontend:**
   - Trang http://localhost:8080/graduation-results.html phục vụ đầy đủ nút Xuất Word, bộ lọc tiêu chí và hiển thị badge lớp của sinh viên trên bảng dữ liệu.