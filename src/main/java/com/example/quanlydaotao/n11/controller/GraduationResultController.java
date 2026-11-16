package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.n11.dto.EvaluateGraduationRequest;
import com.example.quanlydaotao.n11.dto.StudentSummaryResponse;
import com.example.quanlydaotao.n11.entity.GraduationResult;
import com.example.quanlydaotao.n11.exception.NotFoundException;
import com.example.quanlydaotao.n11.service.GraduationResultService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.service.GraduationConditionService;
import com.example.quanlydaotao.n11.service.GraduationResultWordExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/graduation-results")
@CrossOrigin(origins = "*")
public class GraduationResultController {

    private final GraduationResultService service;
    private final GraduationResultWordExportService wordExportService;
    private final GraduationConditionService conditionService;

    public GraduationResultController(GraduationResultService service,
                                       GraduationResultWordExportService wordExportService,
                                       GraduationConditionService conditionService) {
        this.service = service;
        this.wordExportService = wordExportService;
        this.conditionService = conditionService;
    }

    // Whitelist các field hợp lệ để sort, tránh 500 khi truyền field sai
    private static final Set<String> VALID_SORT_FIELDS = Set.of(
            "createdAt", "updatedAt", "result", "classification", "gpa",
            "totalCredits", "failedCredits", "decisionDate");

    // 1. Lấy danh sách có phân trang và lọc theo trạng thái (result: 1=Đạt, 0=Chưa đạt)
    // Ví dụ gọi: GET /api/graduation-results?result=1&page=0&size=10
    @GetMapping
    public ResponseEntity<Page<GraduationResult>> findAll(
            @RequestParam(required = false) Short result,
            @RequestParam(required = false) UUID conditionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        // LỖI 1 FIX: Validate sortBy field, fallback về createdAt nếu không hợp lệ
        String safeSortBy = VALID_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(service.findAll(result, conditionId, pageable));
    }

    // 8. Xuat bao cao ket qua xet tot nghiep ra file Word (khai bao truoc /{id})
    @GetMapping("/export/classes")
    public ResponseEntity<List<String>> exportClassNames(
            @RequestParam(required = false) List<UUID> conditionIds) {
        return ResponseEntity.ok(service.getExportClassNames(conditionIds));
    }

    @GetMapping("/export/word")
    public ResponseEntity<byte[]> exportToWord(
            @RequestParam(required = false) Short result,
            @RequestParam(required = false) List<UUID> conditionIds,
            @RequestParam(required = false) List<String> classNames,
            @RequestParam(required = false) UUID conditionId) {
        try {
            if (conditionIds == null && conditionId != null) {
                conditionIds = List.of(conditionId);
            }
            Map<String, List<GraduationResultExportDTO>> data =
                service.getResultsForExport(result, conditionIds, classNames);

            GraduationCondition condition = null;
            if (conditionIds != null && conditionIds.size() == 1) {
                // LỖI 2 FIX: NotFoundException được bắt → trả 404 thay vì 500
                try {
                    condition = conditionService.one(conditionIds.get(0));
                } catch (NotFoundException e) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy bộ điều kiện ID=" + conditionIds.get(0));
                }
            }

            List<GraduationResultExportDTO> passed = data.getOrDefault("passed", List.of());
            List<GraduationResultExportDTO> failed = data.getOrDefault("failed", List.of());
            if (passed.isEmpty() && failed.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không có kết quả xét tốt nghiệp phù hợp với tiêu chí đã chọn");
            }
            byte[] docBytes = wordExportService.generateReport(passed, failed, condition);

            String filename = "BaoCao_XetTotNghiep_"
                + LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"))
                + ".docx";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(docBytes.length);

            return ResponseEntity.ok().headers(headers).body(docBytes);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể xuất file Word: " + e.getMessage(),
                    e);
        }
    }

    // 2. Chi tiết 1 bản ghi
    @GetMapping("/{id}")
    public ResponseEntity<GraduationResult> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // 3. Tra cứu theo sinh viên
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GraduationResult>> findByStudentId(@PathVariable UUID studentId) {
        return ResponseEntity.ok(service.findByStudentId(studentId));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<StudentSummaryResponse> findStudentSummary(@PathVariable UUID studentId) {
        return ResponseEntity.ok(service.findStudentSummary(studentId));
    }

    // 4. Nhập kết quả thủ công
    @PostMapping
    public ResponseEntity<GraduationResult> create(@RequestBody GraduationResult request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    // 5. KÍCH HOẠT TIẾN TRÌNH XÉT DUYỆT TỰ ĐỘNG
    @PostMapping("/evaluate")
    public ResponseEntity<List<GraduationResult>> evaluate(
            @RequestBody EvaluateGraduationRequest request) {
        return ResponseEntity.ok(service.evaluate(request));
    }

    // 6. Cập nhật kết quả / ghi chú ngoại lệ
    @PutMapping("/{id}")
    public ResponseEntity<GraduationResult> update(
            @PathVariable UUID id,
            @RequestBody GraduationResult request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // 7. Xóa kết quả
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}