package com.adz4needz.skillcred.controller;

import com.adz4needz.skillcred.dto.*;
import com.adz4needz.skillcred.model.*;
import com.adz4needz.skillcred.repository.*;
import com.adz4needz.skillcred.security.SecurityHelper;
import com.adz4needz.skillcred.service.CertificateService;
import com.adz4needz.skillcred.service.PaymentService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final PaymentSubmissionRepository paymentSubmissionRepository;
    private final CertificateService certificateService;
    private final PaymentService paymentService;
    private final SecurityHelper securityHelper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminController(UserRepository userRepository,
                           CourseRepository courseRepository,
                           EnrollmentRepository enrollmentRepository,
                           CertificateRepository certificateRepository,
                           AssessmentAttemptRepository attemptRepository,
                           AssessmentRepository assessmentRepository,
                           QuestionRepository questionRepository,
                           PaymentSubmissionRepository paymentSubmissionRepository,
                           CertificateService certificateService,
                           PaymentService paymentService,
                           SecurityHelper securityHelper) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.certificateRepository = certificateRepository;
        this.attemptRepository = attemptRepository;
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.paymentSubmissionRepository = paymentSubmissionRepository;
        this.certificateService = certificateService;
        this.paymentService = paymentService;
        this.securityHelper = securityHelper;
    }

    // ─── Dashboard Stats ─────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats(HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        long totalStudents = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long totalCertificates = certificateRepository.count();
        long totalAttempts = attemptRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("totalCertificates", totalCertificates);
        stats.put("totalAssessmentAttempts", totalAttempts);

        // Payment stats
        Map<String, Object> paymentStats = paymentService.getPaymentStats();
        stats.putAll(paymentStats);

        // Revenue (approved payments * fee)
        long approvedCount = (long) paymentStats.getOrDefault("approvedPayments", 0L);
        stats.put("totalRevenue", approvedCount * 99.0);

        return ResponseEntity.ok(stats);
    }

    // ─── Student Management ──────────────────────────────
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents(HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("certificateDisplayName", u.getCertificateDisplayName());
            map.put("email", u.getEmail());
            map.put("mobileNumber", u.getMobileNumber());
            map.put("role", u.getRole().name());
            map.put("emailVerified", u.isEmailVerified());
            map.put("learnerCategory", u.getLearnerCategory());
            map.put("collegeName", u.getCollegeName());
            map.put("degreeCourse", u.getDegreeCourse());
            map.put("department", u.getDepartment());
            map.put("currentYearOfStudy", u.getCurrentYearOfStudy());
            map.put("graduationYear", u.getGraduationYear());
            map.put("jobRole", u.getJobRole());
            map.put("companyName", u.getCompanyName());
            map.put("industry", u.getIndustry());
            map.put("qualification", u.getQualification());
            map.put("learningGoal", u.getLearningGoal());
            map.put("createdAt", u.getCreatedAt());
            map.put("updatedAt", u.getUpdatedAt());
            res.add(map);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentDetail(
            @PathVariable Long studentId,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Map<String, Object> detail = new HashMap<>();
        detail.put("id", user.getId());
        detail.put("fullName", user.getFullName());
        detail.put("certificateDisplayName", user.getCertificateDisplayName());
        detail.put("email", user.getEmail());
        detail.put("mobileNumber", user.getMobileNumber());
        detail.put("role", user.getRole().name());
        detail.put("emailVerified", user.isEmailVerified());
        detail.put("learnerCategory", user.getLearnerCategory());
        detail.put("collegeName", user.getCollegeName());
        detail.put("degreeCourse", user.getDegreeCourse());
        detail.put("department", user.getDepartment());
        detail.put("currentYearOfStudy", user.getCurrentYearOfStudy());
        detail.put("graduationYear", user.getGraduationYear());
        detail.put("jobRole", user.getJobRole());
        detail.put("companyName", user.getCompanyName());
        detail.put("industry", user.getIndustry());
        detail.put("qualification", user.getQualification());
        detail.put("learningGoal", user.getLearningGoal());
        detail.put("createdAt", user.getCreatedAt());
        detail.put("updatedAt", user.getUpdatedAt());

        // Attempts
        List<AssessmentAttempt> attempts = attemptRepository.findByUserIdOrderByAttemptedAtDesc(studentId);
        List<Map<String, Object>> attemptList = new ArrayList<>();
        for (AssessmentAttempt a : attempts) {
            Map<String, Object> am = new HashMap<>();
            am.put("id", a.getId());
            am.put("assessmentTitle", a.getAssessment() != null ? a.getAssessment().getTitle() : "");
            am.put("score", a.getScore());
            am.put("totalQuestions", a.getTotalQuestions());
            am.put("percentage", a.getPercentage());
            am.put("passed", a.isPassed());
            am.put("attemptedAt", a.getAttemptedAt());
            attemptList.add(am);
        }
        detail.put("attempts", attemptList);

        // Certificates
        List<Certificate> certs = certificateRepository.findByUserId(studentId);
        List<Map<String, Object>> certList = new ArrayList<>();
        for (Certificate c : certs) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("certificateId", c.getCertificateId());
            cm.put("courseTitle", c.getCourseTitle());
            cm.put("issueDate", c.getIssueDate());
            cm.put("status", c.getStatus().name());
            certList.add(cm);
        }
        detail.put("certificates", certList);

        return ResponseEntity.ok(detail);
    }

    // ─── CSV Export ──────────────────────────────────────
    @GetMapping({"/students/export", "/export/students"})
    public void exportStudentsCSV(HttpServletRequest request, HttpServletResponse response) throws Exception {
        securityHelper.requireAdmin(request);

        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"skillcred_students.csv\"");

        PrintWriter writer = response.getWriter();
        // Write UTF-8 BOM so spreadsheet viewers render accents and characters correctly
        writer.write('\ufeff');
        writer.println("ID,Full Name,Certificate Name,Email Address,Mobile Number,Role,Account Status,Learner Category,College / Institution,Degree / Course,Department,Current Year of Study,Graduation Year,Job Role,Company Name,Industry,Highest Qualification,Learning Goal,Registration Date");

        List<User> users = userRepository.findAll();
        for (User u : users) {
            writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    u.getId(),
                    escapeCsv(u.getFullName()),
                    escapeCsv(u.getCertificateDisplayName() != null ? u.getCertificateDisplayName() : ""),
                    escapeCsv(u.getEmail()),
                    escapeCsv(u.getMobileNumber() != null ? u.getMobileNumber() : ""),
                    u.getRole() != null ? u.getRole().name() : "STUDENT",
                    u.isEmailVerified() ? "Verified / Active" : "Pending Verification",
                    escapeCsv(u.getLearnerCategory() != null ? u.getLearnerCategory() : ""),
                    escapeCsv(u.getCollegeName() != null ? u.getCollegeName() : ""),
                    escapeCsv(u.getDegreeCourse() != null ? u.getDegreeCourse() : ""),
                    escapeCsv(u.getDepartment() != null ? u.getDepartment() : ""),
                    escapeCsv(u.getCurrentYearOfStudy() != null ? u.getCurrentYearOfStudy() : ""),
                    escapeCsv(u.getGraduationYear() != null ? u.getGraduationYear() : ""),
                    escapeCsv(u.getJobRole() != null ? u.getJobRole() : ""),
                    escapeCsv(u.getCompanyName() != null ? u.getCompanyName() : ""),
                    escapeCsv(u.getIndustry() != null ? u.getIndustry() : ""),
                    escapeCsv(u.getQualification() != null ? u.getQualification() : ""),
                    escapeCsv(u.getLearningGoal() != null ? u.getLearningGoal() : ""),
                    u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
            );
        }
        writer.flush();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }

    // ─── Certificate Management ──────────────────────────
    @GetMapping("/certificates")
    public ResponseEntity<List<CertificateResponse>> getAllCertificates(HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        List<Certificate> certs = certificateRepository.findAll();
        List<CertificateResponse> list = new ArrayList<>();
        for (Certificate c : certs) {
            list.add(new CertificateResponse(c));
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/certificates/{certificateId}/revoke")
    public ResponseEntity<CertificateResponse> revokeCertificate(
            @PathVariable String certificateId,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        String reason = payload.getOrDefault("reason", "Administrative revocation");
        CertificateResponse res = certificateService.revokeCertificate(certificateId, reason);
        return ResponseEntity.ok(res);
    }

    // ─── Payment Management ──────────────────────────────
    @GetMapping("/payments/config")
    public ResponseEntity<PaymentConfigDto> getPaymentConfig(HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        return ResponseEntity.ok(paymentService.getPaymentConfig());
    }

    @PutMapping("/payments/config")
    public ResponseEntity<PaymentConfigDto> updatePaymentConfig(
            @RequestBody PaymentConfigDto dto,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        return ResponseEntity.ok(paymentService.updatePaymentConfig(dto));
    }

    @PostMapping("/payments/upload-qr")
    public ResponseEntity<PaymentConfigDto> uploadQrImage(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        String qrImageUrl = payload.get("qrImageUrl");
        return ResponseEntity.ok(paymentService.updateQrImage(qrImageUrl));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentSubmissionResponse>> getAllPayments(HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/payments/pending")
    public ResponseEntity<List<PaymentSubmissionResponse>> getPendingPayments(HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @PostMapping("/payments/{paymentId}/approve")
    public ResponseEntity<PaymentSubmissionResponse> approvePayment(
            @PathVariable Long paymentId,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        Long adminId = securityHelper.getCurrentUserId(request);
        return ResponseEntity.ok(paymentService.approvePayment(paymentId, adminId));
    }

    @PostMapping("/payments/{paymentId}/reject")
    public ResponseEntity<PaymentSubmissionResponse> rejectPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);
        Long adminId = securityHelper.getCurrentUserId(request);
        String reason = payload.getOrDefault("reason", "Payment verification failed");
        return ResponseEntity.ok(paymentService.rejectPayment(paymentId, adminId, reason));
    }

    // ─── Course Management ──────────────────────────────
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getAdminCourses(HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        List<Course> courses = courseRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Course c : courses) {
            Map<String, Object> cm = new HashMap<>();
            cm.put("id", c.getId());
            cm.put("title", c.getTitle());
            cm.put("slug", c.getSlug());
            cm.put("category", c.getCategory());
            cm.put("description", c.getDescription());
            cm.put("duration", c.getDuration());
            cm.put("price", c.getPrice());
            cm.put("published", c.isPublished());
            cm.put("createdAt", c.getCreatedAt());

            // Count questions & assessment settings
            Optional<Assessment> aOpt = assessmentRepository.findByCourseId(c.getId());
            long qCount = 0;
            Long assessmentId = null;
            int timeLimit = 40;
            int passPct = 60;
            if (aOpt.isPresent()) {
                Assessment a = aOpt.get();
                assessmentId = a.getId();
                qCount = questionRepository.findByAssessmentId(assessmentId).size();
                timeLimit = a.getTimeLimitMinutes();
                passPct = a.getPassPercentage();
            }
            cm.put("assessmentId", assessmentId);
            cm.put("questionCount", qCount);
            cm.put("timeLimitMinutes", timeLimit);
            cm.put("passPercentage", passPct);
            result.add(cm);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Map<String, Object>> getAdminCourseById(
            @PathVariable Long courseId,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Course c = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Map<String, Object> cm = new HashMap<>();
        cm.put("id", c.getId());
        cm.put("title", c.getTitle());
        cm.put("slug", c.getSlug());
        cm.put("category", c.getCategory());
        cm.put("description", c.getDescription());
        cm.put("duration", c.getDuration());
        cm.put("price", c.getPrice());
        cm.put("published", c.isPublished());
        cm.put("createdAt", c.getCreatedAt());

        Optional<Assessment> aOpt = assessmentRepository.findByCourseId(c.getId());
        long qCount = 0;
        Long assessmentId = null;
        int timeLimit = 40;
        int passPct = 60;
        if (aOpt.isPresent()) {
            Assessment a = aOpt.get();
            assessmentId = a.getId();
            qCount = questionRepository.findByAssessmentId(assessmentId).size();
            timeLimit = a.getTimeLimitMinutes();
            passPct = a.getPassPercentage();
        }
        cm.put("assessmentId", assessmentId);
        cm.put("questionCount", qCount);
        cm.put("timeLimitMinutes", timeLimit);
        cm.put("passPercentage", passPct);
        return ResponseEntity.ok(cm);
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        String title = (String) payload.get("title");
        String category = (String) payload.get("category");
        String description = (String) payload.get("description");

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Course Name is required");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }

        title = title.trim();
        if (courseRepository.existsByTitleIgnoreCase(title)) {
            throw new IllegalArgumentException("A course named '" + title + "' already exists. Please choose a unique name.");
        }

        // Generate unique slug
        String baseSlug = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (baseSlug.isEmpty()) baseSlug = "course";
        String slug = baseSlug;
        int counter = 1;
        while (courseRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Course course = new Course();
        course.setTitle(title);
        course.setSlug(slug);
        course.setCategory(category.trim());
        course.setDescription(description.trim());

        Object publishedObj = payload.get("published");
        course.setPublished(publishedObj instanceof Boolean ? (Boolean) publishedObj : true);

        String duration = (String) payload.get("duration");
        course.setDuration(duration != null && !duration.trim().isEmpty() ? duration.trim() : "Self-Paced");
        course.setPrice(99.0);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        Course savedCourse = courseRepository.save(course);

        // Auto-create assessment for course so questions can be added immediately
        Assessment assessment = new Assessment();
        assessment.setCourse(savedCourse);
        assessment.setTitle(savedCourse.getTitle() + " Certification Assessment");
        assessment.setDescription("Official certification assessment for " + savedCourse.getTitle());

        int timeLimit = 40;
        if (payload.get("timeLimitMinutes") != null) {
            try {
                timeLimit = Integer.parseInt(payload.get("timeLimitMinutes").toString());
            } catch (Exception ignored) {}
        }
        assessment.setTimeLimitMinutes(timeLimit > 0 ? timeLimit : 40);

        int passPct = 60;
        if (payload.get("passPercentage") != null) {
            try {
                passPct = Integer.parseInt(payload.get("passPercentage").toString());
            } catch (Exception ignored) {}
        }
        assessment.setPassPercentage(passPct > 0 ? passPct : 60);
        assessmentRepository.save(assessment);

        Map<String, Object> res = new HashMap<>();
        res.put("id", savedCourse.getId());
        res.put("title", savedCourse.getTitle());
        res.put("slug", savedCourse.getSlug());
        res.put("category", savedCourse.getCategory());
        res.put("published", savedCourse.isPublished());
        res.put("message", "Course '" + savedCourse.getTitle() + "' created successfully");
        return ResponseEntity.ok(res);
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<Map<String, Object>> updateCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (payload.containsKey("title")) {
            String title = (String) payload.get("title");
            if (title == null || title.trim().isEmpty()) {
                throw new IllegalArgumentException("Course Name cannot be empty");
            }
            title = title.trim();
            if (courseRepository.existsByTitleIgnoreCaseAndIdNot(title, courseId)) {
                throw new IllegalArgumentException("Another course already exists with the name '" + title + "'.");
            }
            course.setTitle(title);
        }

        if (payload.containsKey("category")) {
            String category = (String) payload.get("category");
            if (category != null && !category.trim().isEmpty()) {
                course.setCategory(category.trim());
            }
        }

        if (payload.containsKey("description")) {
            String description = (String) payload.get("description");
            if (description != null && !description.trim().isEmpty()) {
                course.setDescription(description.trim());
            }
        }

        if (payload.containsKey("published")) {
            Object publishedObj = payload.get("published");
            if (publishedObj instanceof Boolean) {
                course.setPublished((Boolean) publishedObj);
            }
        }

        if (payload.containsKey("duration")) {
            String duration = (String) payload.get("duration");
            if (duration != null && !duration.trim().isEmpty()) {
                course.setDuration(duration.trim());
            }
        }

        course.setUpdatedAt(LocalDateTime.now());
        courseRepository.save(course);

        // Update associated assessment
        Optional<Assessment> aOpt = assessmentRepository.findByCourseId(courseId);
        if (aOpt.isPresent()) {
            Assessment a = aOpt.get();
            a.setTitle(course.getTitle() + " Certification Assessment");
            if (payload.get("timeLimitMinutes") != null) {
                try {
                    int timeLimit = Integer.parseInt(payload.get("timeLimitMinutes").toString());
                    if (timeLimit > 0) a.setTimeLimitMinutes(timeLimit);
                } catch (Exception ignored) {}
            }
            if (payload.get("passPercentage") != null) {
                try {
                    int passPct = Integer.parseInt(payload.get("passPercentage").toString());
                    if (passPct > 0) a.setPassPercentage(passPct);
                } catch (Exception ignored) {}
            }
            assessmentRepository.save(a);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", course.getId());
        res.put("title", course.getTitle());
        res.put("category", course.getCategory());
        res.put("published", course.isPublished());
        res.put("message", "Course updated successfully");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Map<String, Object>> deleteCourse(
            @PathVariable Long courseId,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Safety Protection 1: Certificates
        if (certificateRepository.existsByCourseId(courseId)) {
            long count = certificateRepository.countByCourseId(courseId);
            throw new IllegalArgumentException("Cannot delete course: " + count + " student certificate(s) have been issued for this course. To protect credential verification records, you can deactivate the course instead.");
        }

        // Safety Protection 2: Payments
        if (paymentSubmissionRepository.existsByCourseId(courseId)) {
            long count = paymentSubmissionRepository.countByCourseId(courseId);
            throw new IllegalArgumentException("Cannot delete course: " + count + " student payment submission(s) exist for this course. Please deactivate the course instead.");
        }

        // Safety Protection 3: Enrollments
        if (enrollmentRepository.existsByCourseId(courseId)) {
            long count = enrollmentRepository.countByCourseId(courseId);
            throw new IllegalArgumentException("Cannot delete course: " + count + " active student enrollment(s) exist for this course. Please deactivate the course instead.");
        }

        // Safety Protection 4: Assessment attempts
        Optional<Assessment> aOpt = assessmentRepository.findByCourseId(courseId);
        if (aOpt.isPresent()) {
            Assessment assessment = aOpt.get();
            if (attemptRepository.existsByAssessmentId(assessment.getId())) {
                long count = attemptRepository.countByAssessmentId(assessment.getId());
                throw new IllegalArgumentException("Cannot delete course: " + count + " assessment attempt(s) have been recorded for this course. Please deactivate the course instead.");
            }
            // Safely delete questions and assessment
            List<Question> questions = questionRepository.findByAssessmentId(assessment.getId());
            if (!questions.isEmpty()) {
                questionRepository.deleteAll(questions);
            }
            assessmentRepository.delete(assessment);
        }

        courseRepository.delete(course);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Course '" + course.getTitle() + "' deleted successfully");
        return ResponseEntity.ok(res);
    }

    // ─── Question Bank Management ────────────────────────
    @GetMapping("/courses/{courseId}/questions")
    public ResponseEntity<List<Map<String, Object>>> getCourseQuestions(
            @PathVariable Long courseId,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new IllegalArgumentException("No assessment found for course " + courseId));

        List<Question> questions = questionRepository.findByAssessmentId(assessment.getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Question q : questions) {
            Map<String, Object> qm = new HashMap<>();
            qm.put("id", q.getId());
            qm.put("questionText", q.getQuestionText());
            qm.put("questionType", q.getQuestionType().name());
            qm.put("correctAnswer", q.getCorrectAnswer());
            qm.put("explanation", q.getExplanation());
            qm.put("codeSnippet", q.getCodeSnippet());

            List<String> options = new ArrayList<>();
            if (q.getOptionsJson() != null && !q.getOptionsJson().isBlank()) {
                try {
                    options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<String>>() {});
                } catch (Exception ignored) {}
            }
            qm.put("options", options);
            result.add(qm);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/courses/{courseId}/questions")
    public ResponseEntity<Map<String, Object>> addQuestion(
            @PathVariable Long courseId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new IllegalArgumentException("No assessment found for course " + courseId));

        String questionText = (String) payload.get("questionText");
        if (questionText == null || questionText.trim().isEmpty()) {
            questionText = (String) payload.get("text");
        }
        String correctAnswer = (String) payload.get("correctAnswer");
        String explanation = (String) payload.get("explanation");
        String codeSnippet = (String) payload.get("codeSnippet");
        String typeStr = (String) payload.get("questionType");
        if (typeStr == null) {
            typeStr = (String) payload.get("type");
        }

        if (questionText == null || questionText.trim().isEmpty()) {
            throw new IllegalArgumentException("Question text is required");
        }
        if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
            throw new IllegalArgumentException("A correct answer must be selected");
        }

        Object optionsObj = payload.get("options");
        List<String> validOptions = new ArrayList<>();
        if (optionsObj instanceof List) {
            for (Object o : (List<?>) optionsObj) {
                if (o != null && !o.toString().trim().isEmpty()) {
                    validOptions.add(o.toString().trim());
                }
            }
        } else {
            // Check optionA, optionB, optionC, optionD fields
            for (String key : List.of("optionA", "optionB", "optionC", "optionD")) {
                if (payload.get(key) != null && !payload.get(key).toString().trim().isEmpty()) {
                    validOptions.add(payload.get(key).toString().trim());
                }
            }
        }
        if (validOptions.size() < 2) {
            throw new IllegalArgumentException("At least two non-empty answer options are required");
        }

        correctAnswer = correctAnswer.trim();
        if (!validOptions.contains(correctAnswer)) {
            throw new IllegalArgumentException("The correct answer must match one of the provided options");
        }

        Question q = new Question();
        q.setAssessment(assessment);
        q.setQuestionText(questionText.trim());

        if ("CODING".equalsIgnoreCase(typeStr)) {
            q.setQuestionType(Question.QuestionType.CODING);
        } else if ("SHORT_ANSWER".equalsIgnoreCase(typeStr)) {
            q.setQuestionType(Question.QuestionType.SHORT_ANSWER);
        } else {
            q.setQuestionType(Question.QuestionType.MCQ);
        }

        q.setCorrectAnswer(correctAnswer);
        q.setExplanation(explanation != null ? explanation.trim() : "");
        q.setCodeSnippet(codeSnippet != null && !codeSnippet.trim().isEmpty() ? codeSnippet.trim() : null);

        try {
            q.setOptionsJson(objectMapper.writeValueAsString(validOptions));
        } catch (Exception ignored) {}

        questionRepository.save(q);

        Map<String, Object> res = new HashMap<>();
        res.put("id", q.getId());
        res.put("message", "Question added successfully to " + assessment.getTitle());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<Map<String, Object>> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (payload.containsKey("questionText") || payload.containsKey("text")) {
            String questionText = (String) payload.getOrDefault("questionText", payload.get("text"));
            if (questionText == null || questionText.trim().isEmpty()) {
                throw new IllegalArgumentException("Question text cannot be empty");
            }
            q.setQuestionText(questionText.trim());
        }

        if (payload.containsKey("options") || payload.containsKey("optionA")) {
            Object optionsObj = payload.get("options");
            List<String> validOptions = new ArrayList<>();
            if (optionsObj instanceof List) {
                for (Object o : (List<?>) optionsObj) {
                    if (o != null && !o.toString().trim().isEmpty()) {
                        validOptions.add(o.toString().trim());
                    }
                }
            } else {
                for (String key : List.of("optionA", "optionB", "optionC", "optionD")) {
                    if (payload.get(key) != null && !payload.get(key).toString().trim().isEmpty()) {
                        validOptions.add(payload.get(key).toString().trim());
                    }
                }
            }
            if (validOptions.size() < 2) {
                throw new IllegalArgumentException("At least two non-empty answer options are required");
            }
            try {
                q.setOptionsJson(objectMapper.writeValueAsString(validOptions));
            } catch (Exception ignored) {}
        }

        if (payload.containsKey("correctAnswer")) {
            String correctAnswer = (String) payload.get("correctAnswer");
            if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
                throw new IllegalArgumentException("Correct answer cannot be empty");
            }
            q.setCorrectAnswer(correctAnswer.trim());
        }

        if (payload.containsKey("explanation")) {
            q.setExplanation((String) payload.get("explanation"));
        }

        if (payload.containsKey("codeSnippet")) {
            String codeSnippet = (String) payload.get("codeSnippet");
            q.setCodeSnippet(codeSnippet != null && !codeSnippet.trim().isEmpty() ? codeSnippet.trim() : null);
        }

        if (payload.containsKey("questionType")) {
            String typeStr = (String) payload.get("questionType");
            if ("CODING".equalsIgnoreCase(typeStr)) {
                q.setQuestionType(Question.QuestionType.CODING);
            } else if ("SHORT_ANSWER".equalsIgnoreCase(typeStr)) {
                q.setQuestionType(Question.QuestionType.SHORT_ANSWER);
            } else {
                q.setQuestionType(Question.QuestionType.MCQ);
            }
        }

        questionRepository.save(q);

        Map<String, Object> res = new HashMap<>();
        res.put("id", q.getId());
        res.put("message", "Question updated successfully");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Map<String, Object>> deleteQuestion(
            @PathVariable Long questionId,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        questionRepository.delete(q);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Question deleted successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/courses/{courseId}/questions/import")
    public ResponseEntity<Map<String, Object>> importQuestions(
            @PathVariable Long courseId,
            @RequestBody List<Map<String, Object>> questionsData,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        if (questionsData == null || questionsData.isEmpty()) {
            throw new IllegalArgumentException("Import data must contain an array of question objects");
        }

        Assessment assessment = assessmentRepository.findByCourseId(courseId)
                .orElseThrow(() -> new IllegalArgumentException("No assessment found for course " + courseId));

        int imported = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < questionsData.size(); i++) {
            Map<String, Object> qd = questionsData.get(i);
            String questionText = (String) qd.get("questionText");
            String correctAnswer = (String) qd.get("correctAnswer");

            if (questionText == null || questionText.trim().isEmpty()) {
                errors.add("Item " + (i + 1) + ": Missing questionText");
                continue;
            }
            if (correctAnswer == null || correctAnswer.trim().isEmpty()) {
                errors.add("Item " + (i + 1) + ": Missing correctAnswer");
                continue;
            }

            Object optionsObj = qd.get("options");
            List<String> validOptions = new ArrayList<>();
            if (optionsObj instanceof List) {
                for (Object o : (List<?>) optionsObj) {
                    if (o != null && !o.toString().trim().isEmpty()) {
                        validOptions.add(o.toString().trim());
                    }
                }
            }

            if (validOptions.size() < 2) {
                errors.add("Item " + (i + 1) + ": Must have at least 2 options");
                continue;
            }

            correctAnswer = correctAnswer.trim();
            if (!validOptions.contains(correctAnswer)) {
                // If option doesn't match verbatim, check if letter index "A", "B", "C", "D" was passed
                if (correctAnswer.length() == 1 && Character.isLetter(correctAnswer.charAt(0))) {
                    int idx = Character.toUpperCase(correctAnswer.charAt(0)) - 'A';
                    if (idx >= 0 && idx < validOptions.size()) {
                        correctAnswer = validOptions.get(idx);
                    } else {
                        errors.add("Item " + (i + 1) + ": Correct answer index out of bounds");
                        continue;
                    }
                } else {
                    errors.add("Item " + (i + 1) + ": Correct answer '" + correctAnswer + "' does not match any option");
                    continue;
                }
            }

            Question q = new Question();
            q.setAssessment(assessment);
            q.setQuestionText(questionText.trim());
            q.setQuestionType(Question.QuestionType.MCQ);
            q.setCorrectAnswer(correctAnswer);
            q.setExplanation((String) qd.getOrDefault("explanation", ""));
            q.setCodeSnippet((String) qd.get("codeSnippet"));

            try {
                q.setOptionsJson(objectMapper.writeValueAsString(validOptions));
            } catch (Exception ignored) {}

            questionRepository.save(q);
            imported++;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("imported", imported);
        res.put("totalSubmitted", questionsData.size());
        res.put("errors", errors);
        res.put("message", imported + " valid question(s) imported successfully into " + assessment.getTitle());
        return ResponseEntity.ok(res);
    }

    // ─── Certificate Template Management ──────────────────
    @PostMapping("/certificate-template/upload")
    public ResponseEntity<Map<String, Object>> uploadCertificateTemplate(
            @RequestBody Map<String, String> payload,
            HttpServletRequest request) {
        securityHelper.requireAdmin(request);

        String base64Image = payload.get("image");
        if (base64Image == null || base64Image.isBlank()) {
            throw new IllegalArgumentException("No template image provided");
        }

        // Validate format
        int commaIndex = base64Image.indexOf(',');
        if (commaIndex > 0) {
            String meta = base64Image.substring(0, commaIndex);
            if (!meta.contains("png") && !meta.contains("jpeg") && !meta.contains("jpg") && !meta.contains("webp")) {
                throw new IllegalArgumentException("Invalid file format. Only PNG, JPG, or WEBP images are accepted.");
            }
            base64Image = base64Image.substring(commaIndex + 1);
        }

        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(base64Image);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid image encoding: " + e.getMessage());
        }

        if (imageBytes.length > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Template file size exceeds maximum limit of 5MB.");
        }

        try {
            java.nio.file.Path targetPath = java.nio.file.Paths.get("frontend/public/assets/certificate_template.png");
            if (!java.nio.file.Files.exists(targetPath.getParent())) {
                targetPath = java.nio.file.Paths.get(System.getProperty("user.dir"), "frontend/public/assets/certificate_template.png");
            }
            // Create backup if original doesn't have backup
            java.nio.file.Path backupPath = targetPath.resolveSibling("certificate_template_backup.png");
            if (!java.nio.file.Files.exists(backupPath) && java.nio.file.Files.exists(targetPath)) {
                java.nio.file.Files.copy(targetPath, backupPath);
            }
            java.nio.file.Files.write(targetPath, imageBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save certificate template image: " + e.getMessage(), e);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Official certificate template updated successfully");
        res.put("templateUrl", "/assets/certificate_template.png?v=" + System.currentTimeMillis());
        return ResponseEntity.ok(res);
    }
}
