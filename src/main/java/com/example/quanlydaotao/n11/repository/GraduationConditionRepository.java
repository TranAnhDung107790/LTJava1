package com.example.quanlydaotao.n11.repository;

import com.example.quanlydaotao.n11.entity.GraduationCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GraduationConditionRepository extends JpaRepository<GraduationCondition, UUID> {

    List<GraduationCondition> findByDeletedAtIsNullOrderByIdDesc();

    Optional<GraduationCondition> findByIdAndDeletedAtIsNull(UUID id);

    List<GraduationCondition> findByAppliedCohortIgnoreCaseAndIsActiveTrueAndDeletedAtIsNull(String appliedCohort);

    List<GraduationCondition> findByProgramIdAndDeletedAtIsNull(UUID programId);

    Optional<GraduationCondition> findByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNull(UUID programId, String appliedCohort);

    boolean existsByAppliedCohortIgnoreCaseAndDeletedAtIsNull(String appliedCohort);

    boolean existsByAppliedCohortIgnoreCaseAndDeletedAtIsNullAndIdNot(String appliedCohort, UUID id);

    boolean existsByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNull(UUID programId, String appliedCohort);

    boolean existsByProgramIdAndAppliedCohortIgnoreCaseAndDeletedAtIsNullAndIdNot(UUID programId, String appliedCohort, UUID id);
}
