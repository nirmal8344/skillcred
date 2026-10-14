package com.adz4needz.skillcred.service;

import com.adz4needz.skillcred.dto.AuthRequest;
import com.adz4needz.skillcred.dto.AuthResponse;
import com.adz4needz.skillcred.dto.ProfileUpdateRequest;
import com.adz4needz.skillcred.dto.RegisterRequest;
import com.adz4needz.skillcred.model.User;
import com.adz4needz.skillcred.repository.UserRepository;
import com.adz4needz.skillcred.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()) {
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                throw new IllegalArgumentException("Passwords do not match");
            }
        }

        String cat = request.getLearnerCategory();
        if (cat != null && !cat.isBlank()) {
            switch (cat) {
                case "College Student":
                    if (request.getCollegeName() == null || request.getCollegeName().isBlank()) {
                        throw new IllegalArgumentException("College name is required for College Students");
                    }
                    if (request.getDegreeCourse() == null || request.getDegreeCourse().isBlank()) {
                        throw new IllegalArgumentException("Degree/Course is required for College Students");
                    }
                    if (request.getDepartment() == null || request.getDepartment().isBlank()) {
                        throw new IllegalArgumentException("Department is required for College Students");
                    }
                    if (request.getCurrentYearOfStudy() == null || request.getCurrentYearOfStudy().isBlank()) {
                        throw new IllegalArgumentException("Current year of study is required for College Students");
                    }
                    break;
                case "Graduate":
                    if (request.getCollegeName() == null || request.getCollegeName().isBlank()) {
                        throw new IllegalArgumentException("College name is required for Graduates");
                    }
                    if (request.getDegreeCourse() == null || request.getDegreeCourse().isBlank()) {
                        throw new IllegalArgumentException("Degree/Course is required for Graduates");
                    }
                    if (request.getDepartment() == null || request.getDepartment().isBlank()) {
                        throw new IllegalArgumentException("Department is required for Graduates");
                    }
                    if (request.getGraduationYear() == null || request.getGraduationYear().isBlank()) {
                        throw new IllegalArgumentException("Graduation year is required for Graduates");
                    }
                    break;
                case "Working Professional":
                    if (request.getJobRole() == null || request.getJobRole().isBlank()) {
                        throw new IllegalArgumentException("Current job role is required for Working Professionals");
                    }
                    break;
                case "Other Learner":
                    if (request.getLearningGoal() == null || request.getLearningGoal().isBlank()) {
                        throw new IllegalArgumentException("Learning goal is required for Other Learners");
                    }
                    break;
            }
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        String certName = request.getCertificateDisplayName();
        if (certName == null || certName.isBlank()) {
            certName = request.getFullName().trim();
        }
        user.setCertificateDisplayName(certName);

        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            String cleanMobile = request.getMobileNumber().replaceAll("[^0-9]", "");
            if (cleanMobile.length() < 10) {
                throw new IllegalArgumentException("Mobile number must be at least 10 digits");
            }
            user.setMobileNumber(request.getMobileNumber().trim());
        }

        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.STUDENT);
        user.setEmailVerified(true);

        user.setLearnerCategory(request.getLearnerCategory());
        user.setCollegeName(request.getCollegeName());
        user.setDegreeCourse(request.getDegreeCourse());
        user.setDepartment(request.getDepartment());
        user.setCurrentYearOfStudy(request.getCurrentYearOfStudy());
        user.setGraduationYear(request.getGraduationYear());
        user.setJobRole(request.getJobRole());
        user.setCompanyName(request.getCompanyName());
        user.setIndustry(request.getIndustry());
        user.setQualification(request.getQualification());
        user.setLearningGoal(request.getLearningGoal());

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name(), savedUser.getFullName());
        return new AuthResponse(token, savedUser);
    }

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getFullName());
        return new AuthResponse(token, user);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public User updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = getUserById(userId);
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getCertificateDisplayName() != null && !request.getCertificateDisplayName().isBlank()) {
            user.setCertificateDisplayName(request.getCertificateDisplayName().trim());
        }
        return userRepository.save(user);
    }
}
