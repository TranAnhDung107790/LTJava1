package com.example.quanlydaotao;

import com.example.quanlydaotao.n11.dto.EvaluateGraduationRequest;
import com.example.quanlydaotao.n11.entity.*;
import com.example.quanlydaotao.n11.repository.*;
import com.example.quanlydaotao.n11.service.GraduationResultService;
import com.example.quanlydaotao.n11.service.GraduationSessionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@SpringBootApplication
public class QuanlydaotaoApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuanlydaotaoApplication.class, args);
	}

	@Bean
	CommandLineRunner seedData(
			GraduationConditionRepository conditionRepo,
			GraduationSessionRepository sessionRepo,
			GraduationSessionService sessionService,
			GraduationProfileRepository profileRepo,
			GraduationResultRepository resultRepo,
			GraduationResultService resultService,
			StudentRepository studentRepo) {
		return args -> {
			try {
				// 1. Tự động khởi tạo đợt xét tốt nghiệp nếu chưa có
				if (sessionRepo.count() == 0) {
					try {
						sessionService.generateAnnualSessions("2026-2027");
						sessionService.generateAnnualSessions("2025-2026");
					} catch (Exception e) {
						System.err.println("Session auto-seed warning: " + e.getMessage());
					}
				}

				// 2. Tự động khởi tạo bộ tiêu chuẩn tốt nghiệp K20 - K24 nếu thiếu
				if (conditionRepo.count() < 5) {
					UUID programId = UUID.fromString("452c369d-df15-4888-b6c4-869f112bca2d");
					String[][] sampleConditions = {
							{"K20", "120", "2.00", "0", "TOEIC 450 / B1", "CNTT Cơ bản", "Khá trở lên", "Tiêu chuẩn K20"},
							{"K21", "125", "2.00", "0", "TOEIC 500 / B1 Chuẩn", "IC3 / MOS 2 môn", "Khá trở lên", "Tiêu chuẩn K21"},
							{"K22", "130", "2.00", "0", "TOEIC 550 / B2", "MOS 3 môn (Word, Excel, PPT)", "Tốt trở lên", "Tiêu chuẩn K22"},
							{"K23", "135", "2.50", "0", "IELTS 5.5 / TOEIC 600", "MOS Expert / CNTT Nâng cao", "Tốt trở lên", "Tiêu chuẩn K23"},
							{"K24", "140", "2.50", "0", "IELTS 6.0 / TOEIC 650", "CNTT Nâng cao & Lập trình ứng dụng", "Xuất sắc", "Tiêu chuẩn K24"}
					};
					for (String[] c : sampleConditions) {
						if (!conditionRepo.existsByAppliedCohortAndIsActiveTrue(c[0])) {
							GraduationCondition gc = new GraduationCondition();
							gc.setProgramId(programId);
							gc.setAppliedCohort(c[0]);
							gc.setMinTotalCredits(Integer.parseInt(c[1]));
							gc.setMinGpa(new BigDecimal(c[2]));
							gc.setMaxFailedCredits(Integer.parseInt(c[3]));
							gc.setEnglishRequirement(c[4]);
							gc.setItRequirement(c[5]);
							gc.setConductRequired(c[6]);
							gc.setNote(c[7]);
							gc.setIsActive(true);
							conditionRepo.save(gc);
						}
					}
				}

				// 3. Tự động khởi tạo hồ sơ xét tốt nghiệp nếu chưa có
				if (profileRepo.count() == 0) {
					List<Student> students = studentRepo.findAll();
					List<GraduationSession> sessions = sessionRepo.findAll();
					UUID sessionId = sessions.isEmpty() ? null : sessions.get(0).getId();
					String[] statuses = {"Approved", "Approved", "Approved", "Pending", "Pending", "Approved", "Pending", "Rejected"};
					String[] notes = {
							"Hồ sơ đầy đủ, đủ điều kiện xét đợt 1",
							"Đã đối chiếu bảng điểm, đủ 135 tín chỉ",
							"Hồ sơ hợp lệ, chứng chỉ TOEIC 650",
							"Đang chờ nộp bổ sung chứng chỉ Tin học",
							"Chờ phòng Đào tạo đối soát tín chỉ tích lũy",
							"Đủ điều kiện xếp loại Giỏi",
							"Đăng ký xét đợt 2 (HK2)",
							"Thiếu chứng chỉ GDQP-AN, cần nộp lại"
					};
					int limit = Math.min(students.size(), 8);
					for (int i = 0; i < limit; i++) {
						GraduationProfile p = new GraduationProfile();
						p.setProfileCode(String.format("HS-2026-%03d", i + 1));
						p.setStudent(students.get(i));
						p.setSessionId(sessionId);
						p.setStatus(statuses[i % statuses.length]);
						p.setNote(notes[i % notes.length]);
						p.setSubmittedDate(LocalDateTime.now().minusDays(i * 3L + 1));
						if ("Approved".equals(p.getStatus())) {
							p.setReviewDate(LocalDateTime.now().minusDays(i * 2L));
							p.setReviewerId(students.get(0).getId());
						}
						p.setIsActive(true);
						profileRepo.save(p);
					}
				}

				// 4. Tự động xét duyệt kết quả tốt nghiệp nếu chưa có
				if (resultRepo.count() == 0) {
					List<GraduationCondition> conditions = conditionRepo.findAll();
					if (!conditions.isEmpty()) {
						EvaluateGraduationRequest evalReq = new EvaluateGraduationRequest(
								conditions.get(0).getId(),
								conditions.get(0).getAppliedCohort(),
								null
						);
						resultService.evaluate(evalReq);
					}
				}
			} catch (Exception e) {
				System.err.println("Nhóm 11 Seed Data Error (safe ignored): " + e.getMessage());
			}
		};
	}

}
