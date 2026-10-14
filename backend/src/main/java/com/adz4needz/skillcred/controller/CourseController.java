package com.adz4needz.skillcred.controller;

import com.adz4needz.skillcred.model.Course;
import com.adz4needz.skillcred.model.Enrollment;
import com.adz4needz.skillcred.security.SecurityHelper;
import com.adz4needz.skillcred.service.CourseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final SecurityHelper securityHelper;

    public CourseController(CourseService courseService, SecurityHelper securityHelper) {
        this.courseService = courseService;
        this.securityHelper = securityHelper;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllPublishedCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Course> getCourseBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseBySlug(slug));
    }

    @GetMapping("/{id}/learning")
    public ResponseEntity<Map<String, Object>> getCourseLearningView(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = null;
        try {
            userId = securityHelper.getCurrentUserId(request);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(courseService.getCourseLearningView(userId, id));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<Map<String, Object>> enrollCourse(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        Enrollment en = courseService.enrollStudent(userId, id);
        return ResponseEntity.ok(Map.of(
                "enrollmentId", en.getId(),
                "courseId", en.getCourse().getId(),
                "status", en.getStatus().name(),
                "progressPercent", en.getProgressPercent(),
                "message", "Successfully enrolled"
        ));
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<Map<String, Object>> completeLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        Map<String, Object> res = courseService.markLessonComplete(userId, courseId, lessonId);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<List<Map<String, Object>>> getMyEnrollments(HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        return ResponseEntity.ok(courseService.getStudentEnrollments(userId));
    }
}
