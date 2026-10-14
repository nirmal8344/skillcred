package com.adz4needz.skillcred.repository;

import com.adz4needz.skillcred.model.PaymentStatus;
import com.adz4needz.skillcred.model.PaymentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentSubmissionRepository extends JpaRepository<PaymentSubmission, Long> {
    List<PaymentSubmission> findByUserId(Long userId);
    List<PaymentSubmission> findByUserIdAndCourseId(Long userId, Long courseId);
    Optional<PaymentSubmission> findTopByUserIdAndCourseIdOrderBySubmittedAtDesc(Long userId, Long courseId);
    Optional<PaymentSubmission> findByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);
    List<PaymentSubmission> findByStatusOrderBySubmittedAtDesc(PaymentStatus status);
    List<PaymentSubmission> findAllByOrderBySubmittedAtDesc();
    long countByStatus(PaymentStatus status);
    boolean existsByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);
    boolean existsByCourseId(Long courseId);
    long countByCourseId(Long courseId);
}
