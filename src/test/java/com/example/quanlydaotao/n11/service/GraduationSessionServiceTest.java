package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationSession;
import com.example.quanlydaotao.n11.repository.GraduationSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test tự động riêng cho Phần D - Quản lý đợt xét tốt nghiệp.
 * Dùng repository giả (Mockito) nên KHÔNG đụng đến SQL Server thật hay dữ liệu của nhóm.
 */
@ExtendWith(MockitoExtension.class)
class GraduationSessionServiceTest {

    @Mock
    private GraduationSessionRepository repository;

    @InjectMocks
    private GraduationSessionService service;

    private GraduationSession sample(UUID id, String code) {
        GraduationSession s = new GraduationSession();
        s.setId(id);
        s.setSessionCode(code);
        s.setSessionName("Đợt xét " + code);
        s.setAcademicYear("2026-2027");
        s.setSemester(1);
        s.setStartDate(LocalDate.of(2026, 10, 1));
        s.setDueDate(LocalDate.of(2026, 11, 30));
        s.setNote("Ghi chú mẫu");
        s.setIsActive(true);
        return s;
    }

    // 1. DB trả về rỗng phải trả rỗng thật, KHÔNG trả dữ liệu mẫu
    @Test
    void findAllReturnsEmptyWhenDatabaseHasNoActiveSession() {
        when(repository.findByIsActiveTrue()).thenReturn(List.of());

        List<GraduationSession> result = service.findAll();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(repository).findByIsActiveTrue();
    }

    // 2. Chỉ fallback khi DB thực sự lỗi
    @Test
    void findAllFallsBackOnlyWhenRepositoryThrows() {
        when(repository.findByIsActiveTrue()).thenThrow(new RuntimeException("DB offline"));

        List<GraduationSession> result = service.findAll();

        assertFalse(result.isEmpty());
        assertEquals(4, result.size());
    }

    // 3. Lấy chi tiết theo ID thật
    @Test
    void findByIdReturnsExistingSession() {
        UUID id = UUID.randomUUID();
        GraduationSession s = sample(id, "DOT1_2026_2027");
        when(repository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(s));

        GraduationSession result = service.findById(id);

        assertSame(s, result);
        assertEquals("DOT1_2026_2027", result.getSessionCode());
    }

    // 4. ID không tồn tại phải trả 404 thật (không trả đợt giả)
    @Test
    void findByIdThrows404WhenMissing() {
        UUID id = UUID.randomUUID();
        when(repository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.findById(id));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    // 5. Đợt đang hiệu lực theo ngày: DB rỗng thì trả rỗng
    @Test
    void getActiveSessionsReturnsEmptyWhenDatabaseHasNoRow() {
        when(repository.findActiveSessionsInPeriod(any(LocalDate.class))).thenReturn(List.of());

        List<GraduationSession> result = service.getActiveSessions();

        assertTrue(result.isEmpty());
    }

    // 6. Tạo mới: từ chối mã trùng với đợt còn hiệu lực
    @Test
    void createRejectsCodeOfActiveSession() {
        GraduationSession input = sample(null, "DOT1_2026_2027");
        when(repository.existsBySessionCodeIgnoreCaseAndIsActiveTrue("DOT1_2026_2027")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.create(input));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(repository, never()).save(any(GraduationSession.class));
    }

    // 7. Tạo mới: được phép dùng lại mã của đợt đã xóa mềm
    @Test
    void createAllowsReusingSoftDeletedCode() {
        GraduationSession input = sample(null, "DOT1_2026_2027");
        when(repository.existsBySessionCodeIgnoreCaseAndIsActiveTrue("DOT1_2026_2027")).thenReturn(false);
        when(repository.save(any(GraduationSession.class))).thenAnswer(inv -> inv.getArgument(0));

        GraduationSession result = service.create(input);

        assertNotNull(result);
        assertEquals("DOT1_2026_2027", result.getSessionCode());
        assertTrue(result.getIsActive());
        verify(repository).save(any(GraduationSession.class));
    }

    // 8. Cập nhật: từ chối đổi sang mã của đợt khác
    @Test
    void updateRejectsDuplicateCodeOfAnotherSession() {
        UUID id = UUID.randomUUID();
        GraduationSession current = sample(id, "DOT1_CU");
        GraduationSession input = sample(null, "DOT2_2026_2027");
        when(repository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(current));
        when(repository.existsBySessionCodeIgnoreCaseAndIsActiveTrueAndIdNot("DOT2_2026_2027", id)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.update(id, input));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(repository, never()).save(any(GraduationSession.class));
    }

    // 9. Cập nhật thành công: các field được ghi nhận và lưu xuống repository
    @Test
    void updateAppliesAllFieldsAndSaves() {
        UUID id = UUID.randomUUID();
        GraduationSession current = sample(id, "DOT1_2026_2027");
        GraduationSession input = sample(null, "DOT1_2026_2027");
        input.setSessionName("Đợt đã sửa");
        input.setSemester(2);
        input.setNote("Ghi chú đã sửa");
        when(repository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(current));
        when(repository.existsBySessionCodeIgnoreCaseAndIsActiveTrueAndIdNot("DOT1_2026_2027", id)).thenReturn(false);
        when(repository.save(any(GraduationSession.class))).thenAnswer(inv -> inv.getArgument(0));

        GraduationSession result = service.update(id, input);

        assertEquals("Đợt đã sửa", result.getSessionName());
        assertEquals(2, result.getSemester());
        assertEquals("Ghi chú đã sửa", result.getNote());
        verify(repository).save(current);
    }

    // 10. Xóa mềm: is_active=false, có deleted_at, vẫn giữ dữ liệu
    @Test
    void deleteSoftDeactivatesAndRecordsTimestamp() {
        UUID id = UUID.randomUUID();
        GraduationSession s = sample(id, "DOT3_2026_2027");
        when(repository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(s));
        when(repository.save(any(GraduationSession.class))).thenAnswer(inv -> inv.getArgument(0));

        service.deleteSoft(id, UUID.randomUUID());

        assertFalse(s.getIsActive());
        assertNotNull(s.getDeletedAt());
        verify(repository).save(s);
    }

    // 11. Xóa mềm: lỗi DB phải được ném ra, không nuốt và báo thành công
    @Test
    void deleteSoftPropagatesDatabaseError() {
        UUID id = UUID.randomUUID();
        GraduationSession s = sample(id, "DOT3_2026_2027");
        when(repository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(s));
        when(repository.save(any(GraduationSession.class))).thenThrow(new RuntimeException("Lưu DB lỗi"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.deleteSoft(id, null));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
    }

    // 12. Tự động tạo đợt: không tạo lại mã đã tồn tại (kể cả đã xóa mềm)
    @Test
    void autoGenerateSkipsCodesThatAlreadyExist() {
        when(repository.existsBySessionCodeIgnoreCaseAndIsActiveTrue(anyString())).thenReturn(true);

        List<GraduationSession> result = service.generateAnnualSessions("2026-2027");

        assertTrue(result.isEmpty());
        verify(repository, never()).save(any(GraduationSession.class));
    }
}
