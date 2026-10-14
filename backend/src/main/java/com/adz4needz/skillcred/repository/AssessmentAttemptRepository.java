package com.adz4needz.skillcred.repository;

import com.adz4needz.skillcred.model.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByUserIdAndAssessmentIdOrderByAttemptedAtDesc(Long userId, Long assessmentId);
    List<AssessmentAttempt> findByUserIdOrderByAttemptedAtDesc(Long userId);
    Optional<AssessmentAttempt> findFirstByUserIdAndAssessmentIdAndPassedTrueOrderByScoreDesc(Long userId, Long assessmentId);
    boolean existsByAssessmentId(Long assessmentId);
    long countByAssessmentId(Long assessmentId);
}
