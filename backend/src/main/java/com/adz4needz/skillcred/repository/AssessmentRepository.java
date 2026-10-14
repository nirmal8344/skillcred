package com.adz4needz.skillcred.repository;

import com.adz4needz.skillcred.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    Optional<Assessment> findByCourseId(Long courseId);
}
