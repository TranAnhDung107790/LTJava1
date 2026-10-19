package com.example.quanlydaotao.service;

import com.example.quanlydaotao.dto.EvaluateGraduationRequest;
import com.example.quanlydaotao.n11.entity.GraduationResult;
import com.example.quanlydaotao.repository.GraduationResultRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class GraduationResultService {

    private final GraduationResultRepository repository;

    public GraduationResultService(GraduationResultRepository repository) {
        this.repository = repository;
    }

    // 1. Lấy danh sách có phân trang và lọc theo trạng thái (result: 1-Đạt, 0-Chưa đạt)
    public Page<GraduationResult> findAll(Short result, Pageable pageable) {
        return repository.findByIsActiveTrueAndResult(result, pageable);
    }

    // 2. Tìm theo ID
    public GraduationResult findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy kết quả xét tốt nghiệp"
                ));
    }

    // 3. Tìm theo ID sinh viên
    public List<GraduationResult> findByStudentId(UUID studentId) {
        return repository.findByStudentIdAndIsActiveTrue(studentId);
    }

    // 4. Nhập kết quả thủ công
    @Transactional
    public GraduationResult create(GraduationResult request) {
        if (request.getStudentId() == null || request.getConditionId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "studentId và conditionId là bắt buộc"
            );
        }

        // Kiểm tra điều kiện tốt nghiệp
        if (repository.countActiveConditionById(request.getConditionId()) == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không tìm thấy bộ điều kiện tốt nghiệp hợp lệ với ID: " + request.getConditionId()
            );
        }

        // Kiểm tra sinh viên tồn tại trong bảng students_
        if (repository.countActiveStudentById(request.getStudentId()) == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không tìm thấy sinh viên hợp lệ với ID: " + request.getStudentId()
            );
        }

        request.setId(null);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(null);
        request.setDeletedAt(null);
        request.setDeletedBy(null);
        request.setIsActive(true);

        return repository.save(request);
    }

    // 5. Cập nhật kết quả / ngoại lệ
    @Transactional
    public GraduationResult update(UUID id, GraduationResult request) {
        GraduationResult current = findById(id);

        if (request.getStudentId() != null) {
            current.setStudentId(request.getStudentId());
        }
        if (request.getConditionId() != null) {
            current.setConditionId(request.getConditionId());
        }

        current.setGpa(request.getGpa());
        current.setTotalCredits(request.getTotalCredits());
        current.setFailedCredits(request.getFailedCredits());
        current.setResult(request.getResult());
        current.setClassification(request.getClassification());
        current.setDecisionDate(request.getDecisionDate());
        current.setReviewer(request.getReviewer());
        current.setNote(request.getNote());
        current.setUpdatedBy(request.getUpdatedBy());

        return repository.save(current);
    }

    // 6. Xóa mềm
    @Transactional
    public void delete(UUID id) {
        GraduationResult current = findById(id);
        current.setIsActive(false);
        current.setDeletedAt(LocalDateTime.now());
        repository.save(current);
    }

    // 7. TIẾN TRÌNH QUÉT & XÉT DUYỆT TỰ ĐỘNG
    @Transactional
    public List<GraduationResult> evaluate(EvaluateGraduationRequest request) {
        if (request.getConditionId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "conditionId không được để trống");
        }

        // 1. Đọc tiêu chí từ bộ điều kiện tốt nghiệp
        List<Object[]> criteriaList = repository.getConditionCriteria(request.getConditionId());
        if (criteriaList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ điều kiện hợp lệ");
        }

        Object[] criteria = criteriaList.get(0);
        int minCredits = criteria[0] != null ? ((Number) criteria[0]).intValue() : 120;
        BigDecimal minGpa = criteria[1] != null ? new BigDecimal(criteria[1].toString()) : new BigDecimal("2.00");
        int maxFailedCredits = criteria[2] != null ? ((Number) criteria[2]).intValue() : 0;

        // 2. Lấy danh sách sinh viên cần quét
        List<UUID> studentIds = repository.findActiveStudentIds();
        if (studentIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có sinh viên nào trong hệ thống để xét duyệt");
        }

        List<GraduationResult> evaluatedResults = new ArrayList<>();

        // 3. Tiến hành quét từng sinh viên
        for (UUID studentId : studentIds) {
            // TODO: Nếu hệ thống đã có bảng tổng kết điểm thực tế, bạn lấy GPA và số tín chỉ từ bảng student_summaries
            // Dưới đây là dữ liệu giả lập chuẩn để quét đánh giá:
            BigDecimal studentGpa = new BigDecimal("2.85");
            int studentTotalCredits = 125;
            int studentFailedCredits = 0;

            // Đánh giá Đạt (1) hay Chưa đạt (0)
            boolean isPass = (studentTotalCredits >= minCredits)
                    && (studentGpa.compareTo(minGpa) >= 0)
                    && (studentFailedCredits <= maxFailedCredits);

            short resultStatus = (short) (isPass ? 1 : 0);
            Short classification = null;

            if (isPass) {
                if (studentGpa.compareTo(new BigDecimal("3.60")) >= 0) classification = 1; // Xuất sắc
                else if (studentGpa.compareTo(new BigDecimal("3.20")) >= 0) classification = 2; // Giỏi
                else if (studentGpa.compareTo(new BigDecimal("2.50")) >= 0) classification = 3; // Khá
                else classification = 4; // Trung bình
            }

            // Tìm bản ghi đã tồn tại để cập nhật, hoặc tạo mới nếu chưa có
            GraduationResult gr = repository
                    .findFirstByStudentIdAndConditionIdAndIsActiveTrueOrderByCreatedAtDesc(studentId, request.getConditionId())
                    .orElseGet(GraduationResult::new);

            gr.setStudentId(studentId);
            gr.setConditionId(request.getConditionId());
            gr.setGpa(studentGpa);
            gr.setTotalCredits(studentTotalCredits);
            gr.setFailedCredits(studentFailedCredits);
            gr.setResult(resultStatus);
            gr.setClassification(classification);
            gr.setDecisionDate(LocalDate.now());
            gr.setReviewer(request.getReviewerId());
            gr.setNote("Xét duyệt tự động cho khóa " + (request.getCohort() != null ? request.getCohort() : ""));
            gr.setIsActive(true);

            evaluatedResults.add(repository.save(gr));
        }

        return evaluatedResults;
    }
}