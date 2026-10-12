package com.example.quanlydaotao.repository;

import com.example.quanlydaotao.entity.GraduationCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GraduationConditionRepository extends JpaRepository<GraduationCondition, UUID> {
    List<GraduationCondition> findByDeletedAtIsNull();
    Optional<GraduationCondition> findByAppliedCohortAndDeletedAtIsNull(String appliedCohort);
}