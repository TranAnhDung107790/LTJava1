package com.example.quanlydaotao.controller;

import com.example.quanlydaotao.entity.GraduationCondition;
import com.example.quanlydaotao.service.GraduationConditionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/graduation-conditions")
@CrossOrigin("*")
public class GraduationConditionController {

    private final GraduationConditionService service;

    public GraduationConditionController(GraduationConditionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<GraduationCondition>> getAll() {
        return ResponseEntity.ok(service.getAllConditions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GraduationCondition> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getConditionById(id));
    }

    @PostMapping
    public ResponseEntity<GraduationCondition> create(@RequestBody GraduationCondition condition) {
        return ResponseEntity.ok(service.createCondition(condition));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GraduationCondition> update(@PathVariable UUID id, @RequestBody GraduationCondition condition) {
        return ResponseEntity.ok(service.updateCondition(id, condition));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable UUID id) {
        service.deleteCondition(id);
        return ResponseEntity.ok("Xóa điều kiện tốt nghiệp thành công");
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<GraduationCondition> updateActive(@PathVariable UUID id, @RequestParam Boolean active) {
        return ResponseEntity.ok(service.updateActive(id, active));
    }
}