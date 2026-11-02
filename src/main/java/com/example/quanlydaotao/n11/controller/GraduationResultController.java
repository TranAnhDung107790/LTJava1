package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.n11.dto.EvaluateGraduationRequest;
import com.example.quanlydaotao.n11.entity.GraduationResult;
import com.example.quanlydaotao.n11.service.GraduationResultService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.service.GraduationConditionService;
import com.example.quanlydaotao.n11.service.GraduationResultWordExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;
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

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(service.findAll(result, conditionId, pageable));
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

    // 8. Xuat bao cao ket qua xet tot nghiep ra file Word
    @GetMapping("/export/word")
    public ResponseEntity<byte[]> exportToWord(
            @RequestParam(required = false) UUID conditionId) {
        try {
            // 1. Lay du lieu phan loai Dat / Chua dat
            Map<String, List<GraduationResultExportDTO>> data =
                service.getResultsForExport(conditionId);

            // 2. Lay thong tin bo dieu kien (neu co)
            GraduationCondition condition = null;
            if (conditionId != null) {
                condition = conditionService.one(conditionId);
            }

            // 3. Tao file Word
            byte[] docBytes = wordExportService.generateReport(
                data.get("passed"), data.get("failed"), condition);

            // 4. Tra ve file download
            String filename = "BaoCao_XetTotNghiep_"
                + LocalDate.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"))
                + ".docx";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(docBytes.length);

            return ResponseEntity.ok().headers(headers).body(docBytes);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}