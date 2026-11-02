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
