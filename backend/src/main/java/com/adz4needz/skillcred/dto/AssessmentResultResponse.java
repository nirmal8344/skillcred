package com.adz4needz.skillcred.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AssessmentResultResponse {

    private Long attemptId;
    private int score;
    private int totalQuestions;
    private double percentage;
    private boolean passed;
    private int passPercentage;
    private String feedback;
    private boolean certificateEligible;
    private LocalDateTime attemptedAt;
    private List<QuestionFeedback> questionsWithFeedback;

    public static class QuestionFeedback {
        private Long questionId;
        private String questionText;
        private String submittedAnswer;
        private String correctAnswer;
        private boolean isCorrect;
        private String explanation;

        public QuestionFeedback() {}

        public QuestionFeedback(Long questionId, String questionText, String submittedAnswer, String correctAnswer, boolean isCorrect, String explanation) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.submittedAnswer = submittedAnswer;
            this.correctAnswer = correctAnswer;
            this.isCorrect = isCorrect;
            this.explanation = explanation;
        }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }

        public String getSubmittedAnswer() { return submittedAnswer; }
        public void setSubmittedAnswer(String submittedAnswer) { this.submittedAnswer = submittedAnswer; }

        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

        public boolean isCorrect() { return isCorrect; }
        public boolean getIsCorrect() { return isCorrect; }
        public void setCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }
        public void setIsCorrect(boolean isCorrect) { this.isCorrect = isCorrect; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public AssessmentResultResponse() {}

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public int getPassPercentage() { return passPercentage; }
    public void setPassPercentage(int passPercentage) { this.passPercentage = passPercentage; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public boolean isCertificateEligible() { return certificateEligible; }
    public void setCertificateEligible(boolean certificateEligible) { this.certificateEligible = certificateEligible; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }

    public List<QuestionFeedback> getQuestionsWithFeedback() { return questionsWithFeedback; }
    public void setQuestionsWithFeedback(List<QuestionFeedback> questionsWithFeedback) { this.questionsWithFeedback = questionsWithFeedback; }
}
