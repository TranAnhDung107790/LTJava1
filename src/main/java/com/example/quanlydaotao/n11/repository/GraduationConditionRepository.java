package com.example.graduationconditions.repository;

import com.example.graduationconditions.entity.GraduationCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GraduationConditionRepository extends JpaRepository<GraduationCondition, Long> {
    List<GraduationCondition> findByDeletedFalseOrderByIdDesc();
    Optional<GraduationCondition> findByIdAndDeletedFalse(Long id);
    Optional<GraduationCondition> findByCohortIgnoreCaseAndActiveTrueAndDeletedFalse(String cohort);
    boolean existsByCohortIgnoreCaseAndDeletedFalse(String cohort);
    boolean existsByCohortIgnoreCaseAndDeletedFalseAndIdNot(String cohort, Long id);
}
