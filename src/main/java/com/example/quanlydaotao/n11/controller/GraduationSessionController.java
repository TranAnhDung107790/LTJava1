package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.n11.entity.GraduationSession;
import com.example.quanlydaotao.n11.service.GraduationSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/graduation-sessions")
@CrossOrigin(origins = "*")
public class GraduationSessionController {

    private final GraduationSessionService service;

    public GraduationSessionController(GraduationSessionService service) {
        this.service = service;
    }

    // 1. Lấy danh sách tất cả đợt xét (is_active = true)
    @GetMapping
    public ResponseEntity<List<GraduationSession>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // 2. Lấy chi tiết 1 đợt xét theo ID
    @GetMapping("/{id}")
    public ResponseEntity<GraduationSession> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // 3. Tìm kiếm theo session_code hoặc session_name
    @GetMapping("/search")
    public ResponseEntity<List<GraduationSession>> search(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(service.search(keyword));
    }

    // 4. Lấy danh sách đợt xét đang còn hiệu lực theo start_date và due_date
    @GetMapping("/active")
    public ResponseEntity<List<GraduationSession>> getActiveSessions() {
        return ResponseEntity.ok(service.getActiveSessions());
    }

    // 5. Thêm mới đợt xét tốt nghiệp
    @PostMapping
    public ResponseEntity<GraduationSession> create(@RequestBody GraduationSession session) {
        GraduationSession created = service.create(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 6. Cập nhật thông tin đợt xét
    @PutMapping("/{id}")
    public ResponseEntity<GraduationSession> update(@PathVariable UUID id, @RequestBody GraduationSession session) {
        return ResponseEntity.ok(service.update(id, session));
    }

    // 7. Xóa mềm đợt xét (is_active = false, lưu deleted_at)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID deletedBy) {
        service.deleteSoft(id, deletedBy);
        return ResponseEntity.noContent().build();
    }

    // 8. Tự động sinh các đợt xét tốt nghiệp theo niên giám năm học
    @PostMapping("/auto-generate")
    public ResponseEntity<List<GraduationSession>> autoGenerate(
            @RequestParam(required = false, defaultValue = "2026-2027") String academicYear) {
        return ResponseEntity.ok(service.generateAnnualSessions(academicYear));
    }
}
