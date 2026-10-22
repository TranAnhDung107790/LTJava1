package com.example.quanlydaotao.n11.service;

import com.example.quanlydaotao.n11.entity.GraduationProfile;
import com.example.quanlydaotao.n11.entity.Student;
import com.example.quanlydaotao.n11.repository.GraduationProfileRepository;
import com.example.quanlydaotao.n11.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GraduationProfileServiceTest {

    @Mock
    private GraduationProfileRepository graduationProfileRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private GraduationProfileService service;

    @Test
    void createStartsPendingAndClearsReviewMetadata() {
        UUID studentId = UUID.randomUUID();
        Student student = new Student();
        student.setId(studentId);

        GraduationProfile input = new GraduationProfile();
        input.setId(UUID.randomUUID());
        input.setProfileCode("  GP-2026-001  ");
        input.setStudent(student);
        input.setStatus("Approved");
        input.setReviewerId(UUID.randomUUID());
        input.setReviewDate(LocalDateTime.now());

        when(graduationProfileRepository.existsByProfileCodeIgnoreCase("GP-2026-001")).thenReturn(false);
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(graduationProfileRepository.save(any(GraduationProfile.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GraduationProfile created = service.save(input);

        assertEquals("GP-2026-001", created.getProfileCode());
        assertEquals("Pending", created.getStatus());
        assertNull(created.getReviewerId());
        assertNull(created.getReviewDate());
        assertEquals(studentId, created.getStudent().getId());
        verify(graduationProfileRepository).save(input);
    }

    @Test
    void updateDoesNotChangeReviewStateOutsideReviewEndpoint() {
        UUID id = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        Student student = new Student();
        student.setId(studentId);
        GraduationProfile current = new GraduationProfile();
        current.setId(id);
        current.setProfileCode("GP-OLD");
        current.setStudent(student);
        current.setStatus("Approved");
        current.setReviewerId(reviewerId);
        LocalDateTime reviewDate = LocalDateTime.now().minusDays(1);
        current.setReviewDate(reviewDate);

        GraduationProfile input = new GraduationProfile();
        input.setProfileCode("GP-NEW");
        input.setStudent(student);
        input.setStatus("Rejected");
        input.setReviewerId(UUID.randomUUID());
        input.setReviewDate(LocalDateTime.now());

        when(graduationProfileRepository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(current));
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));
        when(graduationProfileRepository.save(current)).thenReturn(current);

        GraduationProfile updated = service.update(id, input);

        assertEquals("GP-NEW", updated.getProfileCode());
        assertEquals("Approved", updated.getStatus());
        assertEquals(reviewerId, updated.getReviewerId());
        assertEquals(reviewDate, updated.getReviewDate());
    }

    @Test
    void reviewAcceptsWhitespaceAroundSupportedStatus() {
        UUID id = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        GraduationProfile profile = new GraduationProfile();
        profile.setId(id);

        when(graduationProfileRepository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(profile));
        when(graduationProfileRepository.save(profile)).thenReturn(profile);

        GraduationProfile reviewed = service.review(id, " Approved ", reviewerId, "Đã đủ hồ sơ");

        assertEquals("Approved", reviewed.getStatus());
        assertEquals(reviewerId, reviewed.getReviewerId());
        assertEquals("Đã đủ hồ sơ", reviewed.getNote());
        assertNotNull(reviewed.getReviewDate());
    }

    @Test
    void statusFilterRejectsBlankValues() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.findByStatus("   "));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void deleteSoftDeactivatesTheProfile() {
        UUID id = UUID.randomUUID();
        GraduationProfile profile = new GraduationProfile();
        profile.setId(id);

        when(graduationProfileRepository.findByIdAndIsActiveTrue(id)).thenReturn(Optional.of(profile));
        when(graduationProfileRepository.save(profile)).thenReturn(profile);

        service.deleteSoft(id);

        assertFalse(profile.getIsActive());
        assertNotNull(profile.getDeletedAt());
        verify(graduationProfileRepository).save(profile);
    }
}
