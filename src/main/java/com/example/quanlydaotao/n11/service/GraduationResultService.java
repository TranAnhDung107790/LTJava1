package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.dto.EvaluateGraduationRequest;
import com.example.quanlydaotao.n11.dto.GraduationResultExportDTO;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.entity.GraduationResult;
import com.example.quanlydaotao.n11.repository.GraduationConditionRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

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
    public Page<GraduationResult> findAll(Short result, UUID conditionId, Pageable pageable) {
        return repository.findByIsActiveTrueAndResult(result, conditionId, pageable);
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

    // DTO nội bộ lưu dữ liệu điểm đọc từ student_summaries
    private record StudentSummaryItem(BigDecimal gpa, int totalCredits, int failedCredits) {}

    // 7. TIẾN TRÌNH QUÉT & XÉT DUYỆT TỰ ĐỘNG
    @Transactional
    public List<GraduationResult> evaluate(EvaluateGraduationRequest request) {
        String cohort = request.getCohort() != null && !request.getCohort().isBlank() 
                ? request.getCohort().trim().toUpperCase(Locale.ROOT) : null;
        UUID conditionId = request.getConditionId();

        GraduationCondition condition;

        // 1. Phân giải bộ điều kiện dựa trên conditionId hoặc cohort
        if (conditionId != null) {
            condition = conditionRepository.findByIdAndDeletedAtIsNull(conditionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ điều kiện hợp lệ"));

            // Kiểm tra ràng buộc: nếu truyền cả cohort lẫn conditionId, đảm bảo chúng khớp nhau
            if (cohort != null && !cohort.equalsIgnoreCase(condition.getAppliedCohort())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("Bộ điều kiện được chọn áp dụng cho khóa %s, không khớp với khóa yêu cầu %s", 
                        condition.getAppliedCohort(), cohort));
            }
            cohort = condition.getAppliedCohort();
        } else if (cohort != null) {
            List<GraduationCondition> conditions = conditionRepository
                    .findByAppliedCohortIgnoreCaseAndIsActiveTrueAndDeletedAtIsNull(cohort);
            if (conditions.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Không tìm thấy bộ điều kiện tốt nghiệp đang hiệu lực cho khóa " + cohort);
            }
            condition = conditions.get(0);
            conditionId = condition.getId();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Vui lòng cung cấp khóa áp dụng (cohort) hoặc mã bộ điều kiện xét tốt nghiệp (conditionId)");
        }

        int minCredits = condition.getMinTotalCredits() != null ? condition.getMinTotalCredits() : 120;
        BigDecimal minGpa = condition.getMinGpa() != null ? condition.getMinGpa() : new BigDecimal("2.00");
        int maxFailedCredits = condition.getMaxFailedCredits() != null ? condition.getMaxFailedCredits() : 0;

        // 2. Trích xuất số khóa (VD: "K24" -> "24") để lọc đúng sinh viên của khóa đó
        String cohortSuffix = (cohort != null) ? cohort.replaceAll("[^0-9]", "") : null;
        List<UUID> studentIds;
        if (cohortSuffix != null && !cohortSuffix.isBlank()) {
            studentIds = repository.findActiveStudentIdsByCohortSuffix(cohortSuffix);
        } else {
            studentIds = repository.findActiveStudentIds();
        }

        if (studentIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Không tìm thấy sinh viên nào thuộc khóa " + (cohort != null ? cohort : "") + " để xét duyệt");
        }

        // 3. Đọc dữ liệu tổng kết học tập thực tế từ bảng student_summaries
        List<Object[]> summaryRows = repository.findAllStudentSummaries();
        if (summaryRows.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có dữ liệu tổng kết điểm trong bảng student_summaries để xét duyệt");
        }

        Map<UUID, StudentSummaryItem> summaryMap = new HashMap<>();
        for (Object[] row : summaryRows) {
            if (row[0] == null) continue;
            UUID sId = (row[0] instanceof UUID) ? (UUID) row[0] : UUID.fromString(row[0].toString());
            BigDecimal gpa = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            int totalCredits = row[2] != null ? ((Number) row[2]).intValue() : 0;
            int failedCredits = row[3] != null ? ((Number) row[3]).intValue() : 0;
            summaryMap.put(sId, new StudentSummaryItem(gpa, totalCredits, failedCredits));
        }

        // 4. Lấy danh sách kết quả đã tồn tại theo conditionId để tối ưu hóa cập nhật
        List<GraduationResult> existingList = repository.findByConditionIdAndIsActiveTrue(conditionId);
        Map<UUID, GraduationResult> existingMap = new HashMap<>();
        for (GraduationResult item : existingList) {
            existingMap.put(item.getStudentId(), item);
        }

        List<GraduationResult> evaluatedResults = new ArrayList<>();

        // 5. Tiến hành quét từng sinh viên dựa trên điểm thực tế từ student_summaries
        for (UUID studentId : studentIds) {
            StudentSummaryItem summary = summaryMap.get(studentId);
            if (summary == null) {
                // Bỏ qua sinh viên chưa có dữ liệu tổng kết điểm trong student_summaries
                continue;
            }

            BigDecimal studentGpa = summary.gpa();
            int studentTotalCredits = summary.totalCredits();
            int studentFailedCredits = summary.failedCredits();

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
            GraduationResult gr = existingMap.getOrDefault(studentId, new GraduationResult());

            gr.setStudentId(studentId);
            gr.setConditionId(conditionId);
            gr.setGpa(studentGpa);
            gr.setTotalCredits(studentTotalCredits);
            gr.setFailedCredits(studentFailedCredits);
            gr.setResult(resultStatus);
            gr.setClassification(classification);
            gr.setDecisionDate(LocalDate.now());
            gr.setReviewer(request.getReviewerId());
            gr.setNote("Xét duyệt tự động" + (cohort != null && !cohort.isBlank() ? " cho khóa " + cohort : ""));
            gr.setIsActive(true);

            evaluatedResults.add(gr);
        }

        // 6. Lưu toàn bộ kết quả theo batch để đạt hiệu năng cao nhất
        return repository.saveAll(evaluatedResults);
    }

    // =====================================================
    // Xuất báo cáo Word (Nhóm 11) - Phương án 3: JPQL Query Join
    // =====================================================

    /**
     * Lấy danh sách kết quả xét TN phân theo Đạt / Chưa đạt,
     * kèm tên lớp lấy từ bảng students thông qua JPQL Join và lý do không đạt chi tiết.
     */
    public Map<String, List<GraduationResultExportDTO>> getResultsForExport(UUID conditionId) {

        // 1. Thực thi truy vấn JPQL lấy trực tiếp danh sách DTO kèm tên lớp
        List<GraduationResultExportDTO> rawList;
        if (conditionId != null) {
            rawList = repository.findExportDataByConditionId(conditionId);
        } else {
            rawList = repository.findAllExportData();
        }

        // 2. Lấy thông tin bộ điều kiện để tính lý do không đạt
        GraduationCondition condition = null;
        if (conditionId != null) {
            condition = conditionRepository.findById(conditionId).orElse(null);
        }

        // 3. Phân loại và tạo danh sách Đạt / Chưa đạt
        List<GraduationResultExportDTO> passedList = new ArrayList<>();
        List<GraduationResultExportDTO> failedList = new ArrayList<>();

        int passStt = 1, failStt = 1;

        for (GraduationResultExportDTO dto : rawList) {
            // Làm sạch số thừa ở đuôi tên sinh viên (nếu có do dữ liệu mẫu)
            dto.setStudentName(cleanStudentName(dto.getStudentName()));

            if (dto.getResult() != null && dto.getResult() == 1) {
                // ĐẠT
                dto.setStt(passStt++);
                dto.setResultText("Đạt");
                passedList.add(dto);
            } else {
                // CHƯA ĐẠT
                dto.setStt(failStt++);
                dto.setResultText("Chưa đạt");
                dto.setFailureReasons(buildFailureReasons(dto, condition));
                failedList.add(dto);
            }
        }

        Map<String, List<GraduationResultExportDTO>> resultMap = new HashMap<>();
        resultMap.put("passed", passedList);
        resultMap.put("failed", failedList);
        return resultMap;
    }

    /**
     * Loại bỏ các chữ số mock data ở cuối tên sinh viên (ví dụ: 'Nguyễn Văn A 12' -> 'Nguyễn Văn A')
     */
    private String cleanStudentName(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("\\s+\\d+$", "").trim();
    }

    /**
     * Xác định lý do cụ thể sinh viên không đạt tốt nghiệp.
     */
    private List<String> buildFailureReasons(GraduationResultExportDTO dto, GraduationCondition condition) {
        List<String> reasons = new ArrayList<>();

        if (condition == null) {
            reasons.add(dto.getNote() != null && !dto.getNote().isEmpty()
                ? dto.getNote() : "Chưa đạt yêu cầu tốt nghiệp");
            return reasons;
        }

        if (dto.getTotalCredits() != null && condition.getMinTotalCredits() != null
                && dto.getTotalCredits() < condition.getMinTotalCredits()) {
            reasons.add(String.format(
                "Chưa đủ tín chỉ tích lũy (có: %d, yêu cầu: %d)",
                dto.getTotalCredits(), condition.getMinTotalCredits()));
        }

        if (dto.getGpa() != null && condition.getMinGpa() != null
                && dto.getGpa().compareTo(condition.getMinGpa()) < 0) {
            reasons.add(String.format(
                "GPA chưa đạt yêu cầu (có: %s, yêu cầu: %s)",
                dto.getGpa(), condition.getMinGpa()));
        }

        if (dto.getFailedCredits() != null && condition.getMaxFailedCredits() != null
                && dto.getFailedCredits() > condition.getMaxFailedCredits()) {
            reasons.add(String.format(
                "Số tín chỉ nợ vượt mức cho phép (có: %d, tối đa: %d)",
                dto.getFailedCredits(), condition.getMaxFailedCredits()));
        }

        if (reasons.isEmpty()) {
            reasons.add(dto.getNote() != null && !dto.getNote().isEmpty()
                ? dto.getNote() : "Chưa đạt yêu cầu theo đánh giá tổng hợp");
        }

        return reasons;
    }
}
