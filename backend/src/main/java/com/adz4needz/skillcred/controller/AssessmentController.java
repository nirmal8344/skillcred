package com.adz4needz.skillcred.controller;

import com.adz4needz.skillcred.dto.AssessmentAttemptResponse;
import com.adz4needz.skillcred.dto.AssessmentResultResponse;
import com.adz4needz.skillcred.dto.AssessmentSubmitRequest;
import com.adz4needz.skillcred.model.Assessment;
import com.adz4needz.skillcred.security.SecurityHelper;
import com.adz4needz.skillcred.service.AssessmentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final SecurityHelper securityHelper;

    public AssessmentController(AssessmentService assessmentService, SecurityHelper securityHelper) {
        this.assessmentService = assessmentService;
        this.securityHelper = securityHelper;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<Map<String, Object>> getAssessmentForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assessmentService.getStudentAssessment(courseId));
    }

    @PostMapping("/{assessmentId}/submit")
    public ResponseEntity<AssessmentResultResponse> submitAssessment(
            @PathVariable Long assessmentId,
            @RequestBody AssessmentSubmitRequest request,
            HttpServletRequest httpRequest) {
        Long userId = securityHelper.getCurrentUserId(httpRequest);
        AssessmentResultResponse result = assessmentService.submitAssessment(userId, assessmentId, request.getQuestionIds(), request.getAnswers());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/my-attempts")
    public ResponseEntity<List<AssessmentAttemptResponse>> getMyAttempts(HttpServletRequest httpRequest) {
        Long userId = securityHelper.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(assessmentService.getMyAttempts(userId));
    }

    @GetMapping("/course/{courseId}/attempts")
    public ResponseEntity<List<AssessmentAttemptResponse>> getCourseAttempts(
            @PathVariable Long courseId,
            HttpServletRequest httpRequest) {
        Long userId = securityHelper.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(assessmentService.getCourseAttempts(userId, courseId));
    }

    @GetMapping("/{assessmentId}/attempts")
    public ResponseEntity<List<AssessmentAttemptResponse>> getAttempts(
            @PathVariable Long assessmentId,
            HttpServletRequest httpRequest) {
        Long userId = securityHelper.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(assessmentService.getStudentAttempts(userId, assessmentId));
    }
}
