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
import java.util.UUID;

@RestController
@RequestMapping("/api/graduation-results")
public class GraduationResultController {

    private final GraduationResultService service;

    public GraduationResultController(GraduationResultService service) {
        this.service = service;
    }

    // 1. Lấy danh sách có phân trang và lọc theo trạng thái (result: 1=Đạt, 0=Chưa đạt)
    // Ví dụ gọi: GET /api/graduation-results?result=1&page=0&size=10
    @GetMapping
    public ResponseEntity<Page<GraduationResult>> findAll(
            @RequestParam(required = false) Short result,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(service.findAll(result, pageable));
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
}