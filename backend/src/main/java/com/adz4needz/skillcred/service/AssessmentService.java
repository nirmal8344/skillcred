package com.adz4needz.skillcred.service;

import com.adz4needz.skillcred.dto.AssessmentAttemptResponse;
import com.adz4needz.skillcred.dto.AssessmentResultResponse;
import com.adz4needz.skillcred.model.*;
import com.adz4needz.skillcred.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AssessmentService(AssessmentRepository assessmentRepository,
                             QuestionRepository questionRepository,
                             AssessmentAttemptRepository attemptRepository,
                             UserRepository userRepository,
                             EnrollmentRepository enrollmentRepository) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public Assessment getAssessmentByCourseId(Long courseId) {
        return assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new IllegalArgumentException("No assessment found for course id: " + courseId));
    }

    // Returns 30 randomly selected questions sanitized for student (hiding correct answers)
    public Map<String, Object> getStudentAssessment(Long courseId) {
        Assessment assessment = getAssessmentByCourseId(courseId);
        List<Question> allQuestions = questionRepository.findByAssessmentId(assessment.getId());
        List<Question> questions = new ArrayList<>(allQuestions);
        Collections.shuffle(questions);
        if (questions.size() > 30) {
            questions = questions.subList(0, 30);
        }

        List<Map<String, Object>> sanitizedQuestions = new ArrayList<>();
        List<Long> questionIds = new ArrayList<>();
        for (Question q : questions) {
            questionIds.add(q.getId());
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("questionText", q.getQuestionText());
            qMap.put("questionType", q.getQuestionType().name());

            List<String> options = new ArrayList<>();
            if (q.getOptionsJson() != null && !q.getOptionsJson().isBlank()) {
                try {
                    options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<String>>() {});
                } catch (Exception ignored) {}
            }
            qMap.put("options", options);
            qMap.put("codeSnippet", q.getCodeSnippet());
            sanitizedQuestions.add(qMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", assessment.getId());
        response.put("assessmentId", assessment.getId());
        response.put("title", assessment.getTitle());
        response.put("description", assessment.getDescription());
        response.put("timeLimitMinutes", assessment.getTimeLimitMinutes());
        // Do not disclose pass threshold before or during assessment (requirement)
        response.put("totalQuestions", sanitizedQuestions.size());
        response.put("questionIds", questionIds);
        response.put("questions", sanitizedQuestions);
        return response;
    }

    @Transactional
    public AssessmentResultResponse submitAssessment(Long userId, Long assessmentId, List<Long> servedQuestionIds, Map<Long, String> submittedAnswers) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment not found"));

        List<Question> allQuestions = questionRepository.findByAssessmentId(assessmentId);
        if (allQuestions.isEmpty()) {
            throw new IllegalStateException("Assessment has no questions configured");
        }

        Map<Long, Question> questionMap = new HashMap<>();
        for (Question q : allQuestions) {
            questionMap.put(q.getId(), q);
        }

        List<Question> questionsToScore = new ArrayList<>();
        if (servedQuestionIds != null && !servedQuestionIds.isEmpty()) {
            for (Long qId : servedQuestionIds) {
                Question q = questionMap.get(qId);
                if (q != null) {
                    questionsToScore.add(q);
                }
            }
        }

        // If no servedQuestionIds provided or none matched, fallback to answers keys or take up to 30
        if (questionsToScore.isEmpty()) {
            if (submittedAnswers != null && !submittedAnswers.isEmpty()) {
                for (Long qId : submittedAnswers.keySet()) {
                    Question q = questionMap.get(qId);
                    if (q != null) {
                        questionsToScore.add(q);
                    }
                }
            } else {
                questionsToScore.addAll(allQuestions.subList(0, Math.min(30, allQuestions.size())));
            }
        }

        int score = 0;
        List<AssessmentResultResponse.QuestionFeedback> feedbackList = new ArrayList<>();

        for (Question q : questionsToScore) {
            String studentAns = submittedAnswers != null ? submittedAnswers.get(q.getId()) : null;
            boolean correct = isAnswerCorrect(q, studentAns);
            if (correct) {
                score++;
            }
            feedbackList.add(new AssessmentResultResponse.QuestionFeedback(
                    q.getId(),
                    q.getQuestionText(),
                    studentAns,
                    q.getCorrectAnswer(),
                    correct,
                    q.getExplanation()
            ));
        }

        int totalQuestions = questionsToScore.size();
        double percentage = totalQuestions > 0 ? ((double) score / totalQuestions) * 100.0 : 0.0;
        // Pass mark: 18 out of 30 (60%)
        boolean passed = (score >= 18) || (totalQuestions > 0 && percentage >= 60.0);

        String answersJson = "";
        try {
            answersJson = objectMapper.writeValueAsString(submittedAnswers != null ? submittedAnswers : Collections.emptyMap());
        } catch (Exception ignored) {}

        AssessmentAttempt attempt = new AssessmentAttempt(
                user, assessment, score, totalQuestions, percentage, passed, answersJson
        );
        AssessmentAttempt savedAttempt = attemptRepository.save(attempt);

        // Ensure course enrollment is marked 100% complete if student passed
        Course course = assessment.getCourse();
        if (passed && course != null) {
            Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, course.getId())
                    .orElseGet(() -> {
                        Enrollment newEn = new Enrollment(user, course);
                        newEn.setEnrolledAt(LocalDateTime.now());
                        return newEn;
                    });
            enrollment.setProgressPercent(100);
            enrollment.setStatus(Enrollment.Status.COMPLETED);
            if (enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            enrollmentRepository.save(enrollment);
        }

        AssessmentResultResponse res = new AssessmentResultResponse();
        res.setAttemptId(savedAttempt.getId());
        res.setScore(score);
        res.setTotalQuestions(totalQuestions);
        res.setPercentage(percentage);
        res.setPassed(passed);
        res.setPassPercentage(assessment.getPassPercentage());
        res.setAttemptedAt(savedAttempt.getAttemptedAt());
        res.setCertificateEligible(passed);
        res.setQuestionsWithFeedback(feedbackList);

        if (passed) {
            res.setFeedback("Congratulations! You passed the assessment with " + percentage + "%. You have qualified for your Course Completion Certificate.");
        } else {
            res.setFeedback("You scored " + percentage + "%. The passing score is " + assessment.getPassPercentage() + "%. Don't worry, unlimited attempts are allowed — review the materials and try again!");
        }

        return res;
    }

    private boolean isAnswerCorrect(Question q, String studentAnswer) {
        String correct = q.getCorrectAnswer();
        if (correct == null || studentAnswer == null) return false;
        String cleanCorrect = correct.trim().toLowerCase();
        String cleanStudent = studentAnswer.trim().toLowerCase();

        if (q.getQuestionType() == Question.QuestionType.MCQ) {
            return cleanCorrect.equals(cleanStudent);
        } else {
            // Short answer: check direct match or contains keyword
            return cleanStudent.contains(cleanCorrect) || cleanCorrect.contains(cleanStudent);
        }
    }

    public List<AssessmentAttemptResponse> getStudentAttempts(Long userId, Long assessmentId) {
        List<AssessmentAttempt> attempts = attemptRepository.findByUserIdAndAssessmentIdOrderByAttemptedAtDesc(userId, assessmentId);
        List<AssessmentAttemptResponse> list = new ArrayList<>();
        for (AssessmentAttempt att : attempts) {
            list.add(new AssessmentAttemptResponse(att));
        }
        return list;
    }

    public List<AssessmentAttemptResponse> getMyAttempts(Long userId) {
        List<AssessmentAttempt> attempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);
        List<AssessmentAttemptResponse> list = new ArrayList<>();
        for (AssessmentAttempt att : attempts) {
            list.add(new AssessmentAttemptResponse(att));
        }
        return list;
    }

    public List<AssessmentAttemptResponse> getCourseAttempts(Long userId, Long courseId) {
        Assessment a = assessmentRepository.findByCourseId(courseId).orElse(null);
        if (a == null) return Collections.emptyList();
        return getStudentAttempts(userId, a.getId());
    }

    public boolean hasPassedAssessment(Long userId, Long courseId) {
        Optional<Assessment> aOpt = assessmentRepository.findByCourseId(courseId);
        if (aOpt.isEmpty()) return true; // No assessment required
        return attemptRepository.findFirstByUserIdAndAssessmentIdAndPassedTrueOrderByScoreDesc(userId, aOpt.get().getId()).isPresent();
    }
}
