// package com.example.quanlydaotao.n11.repository;

// import com.example.quanlydaotao.n11.entity.GraduationCondition;
// import org.springframework.data.jpa.repository.JpaRepository;
// import java.util.List;
// import java.util.Optional;

// public interface GraduationConditionRepository extends JpaRepository<GraduationCondition, Long> {
//     List<GraduationCondition> findByDeletedFalseOrderByIdDesc();
//     Optional<GraduationCondition> findByIdAndDeletedFalse(Long id);
//     Optional<GraduationCondition> findByCohortIgnoreCaseAndActiveTrueAndDeletedFalse(String cohort);
//     boolean existsByCohortIgnoreCaseAndDeletedFalse(String cohort);
//     boolean existsByCohortIgnoreCaseAndDeletedFalseAndIdNot(String cohort, Long id);
// }
