package com.example.quanlydaotao.n11.controller;

import com.example.quanlydaotao.n11.dto.GraduationConditionRequest;
import com.example.quanlydaotao.n11.entity.GraduationCondition;
import com.example.quanlydaotao.n11.exception.ApiExceptionHandler;
import com.example.quanlydaotao.n11.exception.ConflictException;
import com.example.quanlydaotao.n11.exception.NotFoundException;
import com.example.quanlydaotao.n11.service.GraduationConditionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class GraduationConditionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GraduationConditionService service;

    @InjectMocks
    private GraduationConditionController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private UUID sampleId;
    private UUID programId;
    private GraduationCondition sampleCondition;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();

        sampleId = UUID.randomUUID();
        programId = UUID.randomUUID();

        sampleCondition = new GraduationCondition();
        sampleCondition.setId(sampleId);
        sampleCondition.setProgramId(programId);
        sampleCondition.setAppliedCohort("K21");
        sampleCondition.setMinTotalCredits(120);
        sampleCondition.setMinGpa(new BigDecimal("2.50"));
        sampleCondition.setMaxFailedCredits(10);
        sampleCondition.setEnglishRequirement("TOEIC 450");
        sampleCondition.setItRequirement("MOS");
        sampleCondition.setConductRequired("Khá");
        sampleCondition.setNote("Ghi chú thử nghiệm");
        sampleCondition.setIsActive(true);
    }

    @Test
    void testGetAll() throws Exception {
        when(service.all()).thenReturn(List.of(sampleCondition));

        mockMvc.perform(get("/api/graduation-conditions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(sampleId.toString()))
                .andExpect(jsonPath("$[0].appliedCohort").value("K21"))
                .andExpect(jsonPath("$[0].minTotalCredits").value(120));

        verify(service, times(1)).all();
    }

    @Test
    void testGetById_Success() throws Exception {
        when(service.one(sampleId)).thenReturn(sampleCondition);

        mockMvc.perform(get("/api/graduation-conditions/" + sampleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sampleId.toString()))
                .andExpect(jsonPath("$.appliedCohort").value("K21"));

        verify(service, times(1)).one(sampleId);
    }

    @Test
    void testGetById_NotFound() throws Exception {
        when(service.one(sampleId)).thenThrow(new NotFoundException("Không tìm thấy bộ điều kiện ID=" + sampleId));

        mockMvc.perform(get("/api/graduation-conditions/" + sampleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Không tìm thấy bộ điều kiện ID=" + sampleId));

        verify(service, times(1)).one(sampleId);
    }

    @Test
    void testGetByCohort() throws Exception {
        when(service.byCohort("K21")).thenReturn(List.of(sampleCondition));

        mockMvc.perform(get("/api/graduation-conditions/cohort/K21")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].appliedCohort").value("K21"));

        verify(service, times(1)).byCohort("K21");
    }

    @Test
    void testGetByProgram() throws Exception {
        when(service.byProgram(programId)).thenReturn(List.of(sampleCondition));

        mockMvc.perform(get("/api/graduation-conditions/program/" + programId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].programId").value(programId.toString()));

        verify(service, times(1)).byProgram(programId);
    }

    @Test
    void testGetByProgramAndCohort() throws Exception {
        when(service.byProgramAndCohort(programId, "K21")).thenReturn(sampleCondition);

        mockMvc.perform(get("/api/graduation-conditions/program/" + programId + "/cohort/K21")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.programId").value(programId.toString()))
                .andExpect(jsonPath("$.appliedCohort").value("K21"));

        verify(service, times(1)).byProgramAndCohort(programId, "K21");
    }

    @Test
    void testCreate_Success() throws Exception {
        GraduationConditionRequest request = new GraduationConditionRequest(
                programId,
                "K21",
                120,
                new BigDecimal("2.50"),
                10,
                "TOEIC 450",
                "MOS",
                "Khá",
                "Ghi chú mới"
        );

        when(service.create(any(GraduationConditionRequest.class))).thenReturn(sampleCondition);

        mockMvc.perform(post("/api/graduation-conditions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/graduation-conditions/" + sampleId))
                .andExpect(jsonPath("$.id").value(sampleId.toString()));

        verify(service, times(1)).create(any(GraduationConditionRequest.class));
    }

    @Test
    void testCreate_Conflict() throws Exception {
        GraduationConditionRequest request = new GraduationConditionRequest(
                programId,
                "K21",
                120,
                new BigDecimal("2.50"),
                10,
                "TOEIC 450",
                "MOS",
                "Khá",
                "Ghi chú"
        );

        when(service.create(any(GraduationConditionRequest.class)))
                .thenThrow(new ConflictException("Chương trình đào tạo này đã có bộ điều kiện cho khóa K21"));

        mockMvc.perform(post("/api/graduation-conditions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Chương trình đào tạo này đã có bộ điều kiện cho khóa K21"));

        verify(service, times(1)).create(any(GraduationConditionRequest.class));
    }

    @Test
    void testCreate_ValidationError_InvalidGpaAndCredits() throws Exception {
        // minGpa > 4.00, minTotalCredits < 0
        GraduationConditionRequest invalidRequest = new GraduationConditionRequest(
                programId,
                "K21",
                -10,
                new BigDecimal("5.00"),
                -5,
                "TOEIC 450",
                "MOS",
                "Khá",
                "Invalid"
        );

        mockMvc.perform(post("/api/graduation-conditions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Dữ liệu không hợp lệ"))
                .andExpect(jsonPath("$.fields").exists());

        verify(service, never()).create(any());
    }

    @Test
    void testUpdate_Success() throws Exception {
        GraduationConditionRequest request = new GraduationConditionRequest(
                programId,
                "K21",
                130,
                new BigDecimal("2.80"),
                5,
                "IELTS 5.5",
                "IC3",
                "Tốt",
                "Cập nhật"
        );

        when(service.update(eq(sampleId), any(GraduationConditionRequest.class))).thenReturn(sampleCondition);

        mockMvc.perform(put("/api/graduation-conditions/" + sampleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sampleId.toString()));

        verify(service, times(1)).update(eq(sampleId), any(GraduationConditionRequest.class));
    }

    @Test
    void testToggleStatus() throws Exception {
        when(service.toggle(sampleId)).thenReturn(sampleCondition);

        mockMvc.perform(patch("/api/graduation-conditions/" + sampleId + "/toggle-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sampleId.toString()));

        verify(service, times(1)).toggle(sampleId);
    }

    @Test
    void testDelete_Success() throws Exception {
        doNothing().when(service).softDelete(sampleId);

        mockMvc.perform(delete("/api/graduation-conditions/" + sampleId))
                .andExpect(status().isNoContent());

        verify(service, times(1)).softDelete(sampleId);
    }
}
