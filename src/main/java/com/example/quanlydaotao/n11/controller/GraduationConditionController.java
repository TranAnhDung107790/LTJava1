package com.example.graduationconditions.controller;

import com.example.graduationconditions.dto.GraduationConditionRequest;
import com.example.graduationconditions.entity.GraduationCondition;
import com.example.graduationconditions.service.GraduationConditionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/graduation-conditions")
public class GraduationConditionController {
    private final GraduationConditionService service;
    public GraduationConditionController(GraduationConditionService service) { this.service = service; }

    @GetMapping
    public List<GraduationCondition> all() { return service.all(); }

    // Đặt đường dẫn 'cohort/...' trước '/{id}' để rõ ý định, tránh lẫn mã khóa với ID.
    @GetMapping("/cohort/{cohort}")
    public GraduationCondition byCohort(@PathVariable String cohort) { return service.byCohort(cohort); }

    @GetMapping("/{id}")
    public GraduationCondition one(@PathVariable Long id) { return service.one(id); }

    @PostMapping
    public ResponseEntity<GraduationCondition> create(@Valid @RequestBody GraduationConditionRequest request) {
        GraduationCondition created = service.create(request);
        return ResponseEntity.created(URI.create("/api/graduation-conditions/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public GraduationCondition update(@PathVariable Long id, @Valid @RequestBody GraduationConditionRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/toggle-status")
    public GraduationCondition toggle(@PathVariable Long id) { return service.toggle(id); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { service.softDelete(id); }
}
