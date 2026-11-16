package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.entity.GraduationResult;
import com.example.quanlydaotao.n11.repository.GraduationConditionRepository;
import com.example.quanlydaotao.n11.repository.GraduationResultRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GraduationResultServiceTest {

    @Mock
    private GraduationResultRepository repository;

    @Mock
    private GraduationConditionRepository conditionRepository;

    @InjectMocks
    private GraduationResultService service;

    @Test
    void createDerivesResultFieldsFromStudentSummary() {
        UUID studentId = UUID.randomUUID();
        UUID conditionId = UUID.randomUUID();
        GraduationCondition condition = condition(conditionId, 120, "2.00", 0);

        when(repository.countActiveConditionById(conditionId)).thenReturn(1);
        when(repository.countActiveStudentById(studentId)).thenReturn(1);
        when(conditionRepository.findByIdAndDeletedAtIsNull(conditionId)).thenReturn(Optional.of(condition));
        when(repository.findStudentSummary(studentId))
                .thenReturn(List.<Object[]>of(new Object[]{studentId, new BigDecimal("3.45"), 130, 0}));
        when(repository.save(any(GraduationResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GraduationResult request = new GraduationResult();
        request.setStudentId(studentId);
        request.setConditionId(conditionId);
        request.setGpa(BigDecimal.ZERO);
        request.setTotalCredits(1);
        request.setFailedCredits(99);
        request.setResult((short) 0);
        request.setClassification((short) 1);

        GraduationResult created = service.create(request);

        assertEquals(new BigDecimal("3.45"), created.getGpa());
        assertEquals(130, created.getTotalCredits());
        assertEquals(0, created.getFailedCredits());
        assertEquals((short) 1, created.getResult());
        assertEquals((short) 2, created.getClassification());
    }

    @Test
    void createRejectsStudentWithoutSummary() {
        UUID studentId = UUID.randomUUID();
        UUID conditionId = UUID.randomUUID();
        when(repository.countActiveConditionById(conditionId)).thenReturn(1);
        when(repository.countActiveStudentById(studentId)).thenReturn(1);
        when(conditionRepository.findByIdAndDeletedAtIsNull(conditionId))
                .thenReturn(Optional.of(condition(conditionId, 120, "2.00", 0)));
        when(repository.findStudentSummary(studentId)).thenReturn(List.<Object[]>of());

        GraduationResult request = new GraduationResult();
        request.setStudentId(studentId);
        request.setConditionId(conditionId);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.create(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void exportAppliesStatusConditionAndClassFilters() {
        UUID conditionId = UUID.randomUUID();
        Object[] matchingRow = {
                "SV001", "Nguyen Van A", "CNTT-K24-01",
                new BigDecimal("3.40"), 130, 0, (short) 1, (short) 2, null, conditionId
        };
        Object[] differentClassRow = {
                "SV002", "Nguyen Van B", "CNTT-K24-02",
                new BigDecimal("3.40"), 130, 0, (short) 1, (short) 2, null, conditionId
        };
        when(repository.findAllExportData()).thenReturn(List.<Object[]>of(matchingRow, differentClassRow));

        var export = service.getResultsForExport(
                (short) 1,
                List.of(conditionId),
                List.of("CNTT-K24-01"));

        assertEquals(1, export.get("passed").size());
        assertEquals("SV001", export.get("passed").get(0).getStudentCode());
        assertEquals(0, export.get("failed").size());
    }

    private GraduationCondition condition(UUID id, int minCredits, String minGpa, int maxFailedCredits) {
        GraduationCondition condition = new GraduationCondition();
        condition.setId(id);
        condition.setIsActive(true);
        condition.setMinTotalCredits(minCredits);
        condition.setMinGpa(new BigDecimal(minGpa));
        condition.setMaxFailedCredits(maxFailedCredits);
        return condition;
    }
}
