package com.example.quanlydaotao.controller;

import com.example.quanlydaotao.entity.GraduationResult;
import com.example.quanlydaotao.service.GraduationResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/graduation-results")
@CrossOrigin("*")
public class GraduationResultController {

    private final GraduationResultService service;

    public GraduationResultController(GraduationResultService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<GraduationResult>> getAll() {
        return ResponseEntity.ok(service.getAllResults());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GraduationResult> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getResultById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<GraduationResult> getByStudentId(@PathVariable UUID studentId) {
        return ResponseEntity.ok(service.getByStudentId(studentId));
    }

    @PostMapping
    public ResponseEntity<GraduationResult> create(@RequestBody GraduationResult result) {
        return ResponseEntity.ok(service.createResult(result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GraduationResult> update(@PathVariable UUID id, @RequestBody GraduationResult result) {
        return ResponseEntity.ok(service.updateResult(id, result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable UUID id) {
        service.deleteResult(id);
        return ResponseEntity.ok("Xóa kết quả tốt nghiệp thành công");
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<GraduationResult> updateActive(@PathVariable UUID id, @RequestParam Boolean active) {
        return ResponseEntity.ok(service.updateActive(id, active));
    }
}