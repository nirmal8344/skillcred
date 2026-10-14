package com.adz4needz.skillcred.dto;

import com.adz4needz.skillcred.model.AssessmentAttempt;
import java.time.LocalDateTime;

public class AssessmentAttemptResponse {
    private Long id;
    private Long assessmentId;
    private Long courseId;
    private String courseTitle;
    private String assessmentTitle;
    private int score;
    private int totalQuestions;
    private double percentage;
    private boolean passed;
    private LocalDateTime attemptedAt;

    public AssessmentAttemptResponse() {}

    public AssessmentAttemptResponse(AssessmentAttempt attempt) {
        this.id = attempt.getId();
        if (attempt.getAssessment() != null) {
            this.assessmentId = attempt.getAssessment().getId();
            this.assessmentTitle = attempt.getAssessment().getTitle();
            if (attempt.getAssessment().getCourse() != null) {
                this.courseId = attempt.getAssessment().getCourse().getId();
                this.courseTitle = attempt.getAssessment().getCourse().getTitle();
            }
        }
        this.score = attempt.getScore();
        this.totalQuestions = attempt.getTotalQuestions();
        this.percentage = attempt.getPercentage();
        this.passed = attempt.isPassed();
        this.attemptedAt = attempt.getAttemptedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getAssessmentTitle() { return assessmentTitle; }
    public void setAssessmentTitle(String assessmentTitle) { this.assessmentTitle = assessmentTitle; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }
}
