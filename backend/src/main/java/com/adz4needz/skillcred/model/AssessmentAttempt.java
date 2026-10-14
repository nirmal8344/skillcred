package com.adz4needz.skillcred.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_attempts")
public class AssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    private int score;
    private int totalQuestions;
    private double percentage;
    private boolean passed;

    @Column(columnDefinition = "TEXT")
    private String submittedAnswersJson;

    private LocalDateTime attemptedAt = LocalDateTime.now();

    public AssessmentAttempt() {}

    public AssessmentAttempt(User user, Assessment assessment, int score, int totalQuestions, double percentage, boolean passed, String submittedAnswersJson) {
        this.user = user;
        this.assessment = assessment;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.passed = passed;
        this.submittedAnswersJson = submittedAnswersJson;
        this.attemptedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Assessment getAssessment() { return assessment; }
    public void setAssessment(Assessment assessment) { this.assessment = assessment; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getSubmittedAnswersJson() { return submittedAnswersJson; }
    public void setSubmittedAnswersJson(String submittedAnswersJson) { this.submittedAnswersJson = submittedAnswersJson; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }
}
