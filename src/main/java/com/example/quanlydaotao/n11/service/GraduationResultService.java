package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.EvaluateGraduationRequest;
import com.example.quanlydaotao.n11.entity.GraduationResult;
import com.example.quanlydaotao.n11.repository.GraduationResultRepository;
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
import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.repository.GraduationConditionRepository;
import java.util.HashMap;
import java.util.Map;

@Service
public class GraduationResultService {

    private final GraduationResultRepository repository;
    private final GraduationConditionRepository conditionRepository;

    public GraduationResultService(GraduationResultRepository repository,
                                    GraduationConditionRepository conditionRepository) {
        this.repository = repository;
        this.conditionRepository = conditionRepository;
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

    // =====================================================
    // Xuat bao cao Word (Nhom 11)
    // =====================================================

    /**
     * Lay danh sach ket qua xet TN phan theo Dat/Chua dat,
     * kem ly do khong dat chi tiet.
     */
    public Map<String, List<GraduationResultExportDTO>> getResultsForExport(UUID conditionId) {

        // 1. Lay tat ca ket qua active (theo conditionId neu co)
        List<GraduationResult> results;
        if (conditionId != null) {
            results = repository.findByConditionIdAndIsActiveTrue(conditionId);
        } else {
            results = repository.findByIsActiveTrue();
        }

        // 2. Lay thong tin bo dieu kien
        GraduationCondition condition = null;
        if (conditionId != null) {
            condition = conditionRepository.findById(conditionId).orElse(null);
        }

        // 3. Phan loai va tao DTO
        List<GraduationResultExportDTO> passedList = new ArrayList<>();
        List<GraduationResultExportDTO> failedList = new ArrayList<>();

        int passStt = 1, failStt = 1;

        for (GraduationResult r : results) {
            GraduationResultExportDTO dto = new GraduationResultExportDTO();
            dto.setStudentCode(r.getStudentCode());
            dto.setStudentName(r.getStudentName());
            dto.setGpa(r.getGpa());
            dto.setTotalCredits(r.getTotalCredits());
            dto.setFailedCredits(r.getFailedCredits());
            dto.setResult(r.getResult() != null ? r.getResult() : (short) 0);

            if (r.getResult() != null && r.getResult() == 1) {
                // DAT
                dto.setStt(passStt++);
                dto.setResultText("Dat");
                dto.setClassificationText(
                    GraduationResultExportDTO.classificationToText(r.getClassification()));
                passedList.add(dto);
            } else {
                // CHUA DAT
                dto.setStt(failStt++);
                dto.setResultText("Chua dat");
                dto.setFailureReasons(buildFailureReasons(r, condition));
                failedList.add(dto);
            }
        }

        Map<String, List<GraduationResultExportDTO>> resultMap = new HashMap<>();
        resultMap.put("passed", passedList);
        resultMap.put("failed", failedList);
        return resultMap;
    }

    /**
     * Xac dinh ly do cu the sinh vien khong dat TN.
     */
    private List<String> buildFailureReasons(GraduationResult r, GraduationCondition condition) {
        List<String> reasons = new ArrayList<>();

        if (condition == null) {
            reasons.add(r.getNote() != null && !r.getNote().isEmpty()
                ? r.getNote() : "Chua dat yeu cau tot nghiep");
            return reasons;
        }

        if (r.getTotalCredits() != null && condition.getMinTotalCredits() != null
                && r.getTotalCredits() < condition.getMinTotalCredits()) {
            reasons.add(String.format(
                "Chua du tin chi tich luy (co: %d, yeu cau: %d)",
                r.getTotalCredits(), condition.getMinTotalCredits()));
        }

        if (r.getGpa() != null && condition.getMinGpa() != null
                && r.getGpa().compareTo(condition.getMinGpa()) < 0) {
            reasons.add(String.format(
                "GPA chua dat yeu cau (co: %s, yeu cau: %s)",
                r.getGpa(), condition.getMinGpa()));
        }

        if (r.getFailedCredits() != null && condition.getMaxFailedCredits() != null
                && r.getFailedCredits() > condition.getMaxFailedCredits()) {
            reasons.add(String.format(
                "So tin chi no vuot muc cho phep (co: %d, toi da: %d)",
                r.getFailedCredits(), condition.getMaxFailedCredits()));
        }

        if (reasons.isEmpty()) {
            reasons.add(r.getNote() != null && !r.getNote().isEmpty()
                ? r.getNote() : "Chua dat yeu cau theo danh gia tong hop");
        }

        return reasons;
    }
}