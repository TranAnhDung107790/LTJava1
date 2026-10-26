package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.n11.dto.GraduationConditionRequest;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.service.GraduationConditionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/graduation-conditions")
@CrossOrigin(origins = "*")
public class GraduationConditionController {

    private final GraduationConditionService service;

    public GraduationConditionController(GraduationConditionService service) {
        this.service = service;
    }

    @GetMapping
    public List<GraduationCondition> all() {
        return service.all();
    }

    // Lấy danh sách các bộ điều kiện áp dụng cho một khóa (ví dụ: /cohort/2026 hoặc /cohort/K21)
    @GetMapping("/cohort/{cohort}")
    public List<GraduationCondition> byCohort(@PathVariable String cohort) {
        return service.byCohort(cohort);
    }

    // Lấy danh sách điều kiện theo chương trình đào tạo
    @GetMapping("/program/{programId}")
    public List<GraduationCondition> byProgram(@PathVariable UUID programId) {
        return service.byProgram(programId);
    }

    // Lấy chính xác điều kiện của một chương trình và một khóa
    @GetMapping("/program/{programId}/cohort/{cohort}")
    public GraduationCondition byProgramAndCohort(@PathVariable UUID programId, @PathVariable String cohort) {
        return service.byProgramAndCohort(programId, cohort);
    }

    @GetMapping("/{id}")
    public GraduationCondition one(@PathVariable UUID id) {
        return service.one(id);
    }

    @PostMapping
    public ResponseEntity<GraduationCondition> create(@Valid @RequestBody GraduationConditionRequest request) {
        GraduationCondition created = service.create(request);
        return ResponseEntity.created(URI.create("/api/graduation-conditions/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public GraduationCondition update(@PathVariable UUID id, @Valid @RequestBody GraduationConditionRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/toggle-status")
    public GraduationCondition toggle(@PathVariable UUID id) {
        return service.toggle(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.softDelete(id);
    }
}
