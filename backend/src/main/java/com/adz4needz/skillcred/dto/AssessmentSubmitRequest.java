package com.adz4needz.skillcred.dto;

import java.util.List;
import java.util.Map;

public class AssessmentSubmitRequest {

    // Ordered list of question IDs served for this attempt
    private List<Long> questionIds;

    // Map of questionId -> studentAnswer
    private Map<Long, String> answers;

    public AssessmentSubmitRequest() {}

    public List<Long> getQuestionIds() { return questionIds; }
    public void setQuestionIds(List<Long> questionIds) { this.questionIds = questionIds; }

    public Map<Long, String> getAnswers() { return answers; }
    public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
}
