package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.dto.ApiResponse;
import com.example.quanlydaotao.n11.entity.GraduationProfile;
import com.example.quanlydaotao.n11.service.GraduationProfileService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<ApiResponse<List<GraduationProfile>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", graduationProfileService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GraduationProfile>> getById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "Success", graduationProfileService.findById(id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GraduationProfile>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", graduationProfileService.search(keyword)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<GraduationProfile>>> getByStudentId(@PathVariable UUID studentId) {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", graduationProfileService.findByStudentId(studentId)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<GraduationProfile>>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(new ApiResponse<>(200, "Success", graduationProfileService.findByStatus(status)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GraduationProfile>> create(@RequestBody GraduationProfile graduationProfile) {
        GraduationProfile saved = graduationProfileService.save(graduationProfile);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Created successfully", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GraduationProfile>> update(@PathVariable UUID id,
                                                                @RequestBody GraduationProfile graduationProfile) {
        graduationProfile.setId(id);
        GraduationProfile updated = graduationProfileService.save(graduationProfile);
        return ResponseEntity.ok(new ApiResponse<>(200, "Updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        graduationProfileService.deleteSoft(id);
        return ResponseEntity.ok(new ApiResponse<>(200, "Deleted successfully", null));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<GraduationProfile>> review(@PathVariable UUID id,
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

        return ResponseEntity.ok(new ApiResponse<>(200, "Review updated", updated));
    }
}
