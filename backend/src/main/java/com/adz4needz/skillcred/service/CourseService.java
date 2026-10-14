package com.adz4needz.skillcred.service;

import com.adz4needz.skillcred.model.*;
import com.adz4needz.skillcred.model.Module;
import com.adz4needz.skillcred.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;

    public CourseService(CourseRepository courseRepository,
                         EnrollmentRepository enrollmentRepository,
                         LessonRepository lessonRepository,
                         LessonProgressRepository lessonProgressRepository,
                         UserRepository userRepository,
                         ModuleRepository moduleRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.userRepository = userRepository;
        this.moduleRepository = moduleRepository;
    }

    public List<Course> getAllPublishedCourses() {
        return courseRepository.findByPublishedTrue();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));
    }

    public Course getCourseBySlug(String slug) {
        return courseRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentEnrollments(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Enrollment en : enrollments) {
            Course c = en.getCourse();
            Map<String, Object> map = new HashMap<>();
            map.put("enrollmentId", en.getId());
            map.put("courseId", c.getId());
            map.put("courseTitle", c.getTitle());
            map.put("slug", c.getSlug());
            map.put("category", c.getCategory());
            map.put("thumbnailUrl", c.getThumbnailUrl());
            map.put("badgeColor", c.getBadgeColor());
            map.put("duration", c.getDuration());
            map.put("progressPercent", en.getProgressPercent());
            map.put("status", en.getStatus().name());
            map.put("enrolledAt", en.getEnrolledAt());
            map.put("completedAt", en.getCompletedAt());
            result.add(map);
        }
        return result;
    }

    @Transactional
    public Enrollment enrollStudent(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = getCourseById(courseId);

        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Enrollment enrollment = new Enrollment(user, course);
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public Map<String, Object> markLessonComplete(Long userId, Long courseId, Long lessonId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> enrollStudent(userId, courseId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        Optional<LessonProgress> lpOpt = lessonProgressRepository.findByEnrollmentIdAndLessonId(enrollment.getId(), lessonId);
        LessonProgress lp;
        if (lpOpt.isPresent()) {
            lp = lpOpt.get();
            lp.setCompleted(true);
            lp.setCompletedAt(LocalDateTime.now());
        } else {
            lp = new LessonProgress(enrollment, lesson, true);
        }
        lessonProgressRepository.save(lp);

        long totalLessons = lessonRepository.countByModuleCourseId(courseId);
        long completedLessons = lessonProgressRepository.countByEnrollmentIdAndCompletedTrue(enrollment.getId());

        int percent = totalLessons > 0 ? (int) Math.min(100, (completedLessons * 100) / totalLessons) : 100;
        enrollment.setProgressPercent(percent);

        if (percent >= 100 && enrollment.getStatus() != Enrollment.Status.COMPLETED) {
            enrollment.setStatus(Enrollment.Status.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        enrollmentRepository.save(enrollment);

        Map<String, Object> res = new HashMap<>();
        res.put("lessonId", lessonId);
        res.put("completed", true);
        res.put("progressPercent", percent);
        res.put("courseStatus", enrollment.getStatus().name());
        return res;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCourseLearningView(Long userId, Long courseId) {
        Course course = getCourseById(courseId);
        Optional<Enrollment> enrollmentOpt = userId != null ?
                enrollmentRepository.findByUserIdAndCourseId(userId, courseId) : Optional.empty();

        Set<Long> completedLessonIds = new HashSet<>();
        int progressPercent = 0;
        String enrollmentStatus = "NOT_ENROLLED";

        if (enrollmentOpt.isPresent()) {
            Enrollment en = enrollmentOpt.get();
            progressPercent = en.getProgressPercent();
            enrollmentStatus = en.getStatus().name();
            List<LessonProgress> progresses = lessonProgressRepository.findByEnrollmentId(en.getId());
            for (LessonProgress lpp : progresses) {
                if (lpp.isCompleted()) {
                    completedLessonIds.add(lpp.getLesson().getId());
                }
            }
        }

        List<Module> modules = moduleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);
        List<Map<String, Object>> modulesData = new ArrayList<>();
        long totalLessonCount = 0;
        for (Module m : modules) {
            Map<String, Object> mMap = new HashMap<>();
            mMap.put("id", m.getId());
            mMap.put("title", m.getTitle());
            mMap.put("moduleOrder", m.getModuleOrder());

            List<Lesson> lessons = lessonRepository.findByModuleIdOrderByLessonOrderAsc(m.getId());
            List<Map<String, Object>> lessonsData = new ArrayList<>();
            for (Lesson l : lessons) {
                Map<String, Object> lMap = new HashMap<>();
                lMap.put("id", l.getId());
                lMap.put("title", l.getTitle());
                lMap.put("lessonType", l.getLessonType().name());
                lMap.put("content", l.getContent());
                lMap.put("videoUrl", l.getVideoUrl());
                lMap.put("pdfUrl", l.getPdfUrl());
                lMap.put("durationMinutes", l.getDurationMinutes());
                lMap.put("lessonOrder", l.getLessonOrder());
                lessonsData.add(lMap);
                totalLessonCount++;
            }
            mMap.put("lessons", lessonsData);
            modulesData.add(mMap);
        }

        Map<String, Object> courseData = new HashMap<>();
        courseData.put("id", course.getId());
        courseData.put("title", course.getTitle());
        courseData.put("slug", course.getSlug());
        courseData.put("description", course.getDescription());
        courseData.put("category", course.getCategory());
        courseData.put("duration", course.getDuration());
        courseData.put("price", course.getPrice());
        courseData.put("thumbnailUrl", course.getThumbnailUrl());
        courseData.put("badgeColor", course.getBadgeColor());
        courseData.put("learningObjectives", course.getLearningObjectives());

        Map<String, Object> view = new HashMap<>();
        view.put("course", courseData);
        view.put("modules", modulesData);
        view.put("totalLessons", totalLessonCount);
        view.put("progressPercent", progressPercent);
        view.put("enrollmentStatus", enrollmentStatus);
        view.put("completedLessonIds", completedLessonIds);
        return view;
    }
}
