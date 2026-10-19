package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import com.example.quanlydaotao.n11.service.GraduationProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/graduation-profiles")
public class GraduationProfileController {

    private final GraduationProfileService graduationProfileService;

    public GraduationProfileController(GraduationProfileService graduationProfileService) {
        this.graduationProfileService = graduationProfileService;
    }

    @GetMapping
    public ResponseEntity<List<GraduationProfile>> getAll() {
        return ResponseEntity.ok(graduationProfileService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GraduationProfile> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(graduationProfileService.findById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<GraduationProfile>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(graduationProfileService.search(keyword));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GraduationProfile>> getByStudentId(@PathVariable UUID studentId) {
        return ResponseEntity.ok(graduationProfileService.findByStudentId(studentId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<GraduationProfile>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(graduationProfileService.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<GraduationProfile> create(@RequestBody GraduationProfile graduationProfile) {
        GraduationProfile saved = graduationProfileService.save(graduationProfile);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GraduationProfile> update(@PathVariable UUID id,
                                                    @RequestBody GraduationProfile graduationProfile) {
        graduationProfile.setId(id);
        GraduationProfile updated = graduationProfileService.save(graduationProfile);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        graduationProfileService.deleteSoft(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<GraduationProfile> review(@PathVariable UUID id,
                                                    @RequestBody Map<String, Object> body) {
        String status = body.get("status") != null ? body.get("status").toString() : null;
        String reviewerId = body.get("reviewerId") != null ? body.get("reviewerId").toString() :
                (body.get("reviewer_id") != null ? body.get("reviewer_id").toString() : null);
        String note = body.get("note") != null ? body.get("note").toString() : "";

        GraduationProfile updated = graduationProfileService.review(
                id,
                status,
                reviewerId != null ? UUID.fromString(reviewerId) : null,
                note
        );

        return ResponseEntity.ok(updated);
    }
}
