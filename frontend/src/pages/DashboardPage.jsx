import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  PlayCircle,
  ClipboardCheck,
  Trophy,
  GraduationCap,
  CheckCheck,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';
import {
  EnrolledIcon,
  InProgressIcon,
  CompletedIcon,
  CertificatesIcon,
} from '../components/StatIcons';

/* ───────── category colors ───────── */
const CATEGORY_COLORS = {
  'Marketing & Growth': { bg: '#E0EAFC', text: '#1E40AF' },
  'Engineering & Web': { bg: '#CFDEF3', text: '#1E3A8A' },
  'Data & AI': { bg: '#FEF3C7', text: '#92400E' },
  'Design & Product': { bg: '#E0EAFC', text: '#1E40AF' },
  'Cloud & Infrastructure': { bg: '#ECFDF5', text: '#065F46' },
  'Programming': { bg: '#CFDEF3', text: '#1E3A8A' },
  'Security & Networks': { bg: '#E0EAFC', text: '#1E40AF' },
};
const catColor = (cat) => CATEGORY_COLORS[cat] || { bg: '#E0EAFC', text: '#1E40AF' };

/* ───────── typography ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollmentData, courseData, certData, attemptData] = await Promise.all([
          api.get('/courses/my-enrollments'),
          api.get('/courses'),
          api.get('/certificates/my-certificates'),
          api.get('/assessments/my-attempts').catch(() => []),
        ]);
        setEnrollments(enrollmentData || []);
        setCourses(courseData || []);
        setCertificates(certData || []);
        setAttempts(attemptData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ───── derived data ───── */
  const inProgress = enrollments.filter((e) => e.progressPercent < 100);
  const completed = enrollments.filter((e) => e.progressPercent === 100);
  const totalEnrolled = enrollments.length;

  // Highest progress first, excluding 100%
  const continueCourse = [...inProgress].sort(
    (a, b) => b.progressPercent - a.progressPercent
  )[0];

  // Unenrolled courses
  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const unenrolled = courses.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <TopBar />

      {/* ─────── OVERVIEW STATS ─────── */}
      <section style={{ marginBottom: 36 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          {/* Enrolled */}
          <StatCard
            icon={<EnrolledIcon />}
            iconBg="#E7EFFE"
            label="Enrolled Courses"
            value={totalEnrolled}
          />
          {/* In Progress */}
          <StatCard
            icon={<InProgressIcon />}
            iconBg="#E4E9FD"
            label="In Progress"
            value={inProgress.length}
          />
          {/* Completed */}
          <StatCard
            icon={<CompletedIcon />}
            iconBg="#DCFCE7"
            label="Completed"
            value={completed.length}
          />
          {/* Certificates */}
          <StatCard
            icon={<CertificatesIcon />}
            iconBg="#FEF5E3"
            label="Certificates"
            value={certificates.length}
          />
        </div>
      </section>

      {/* ─────── TAKE ASSESSMENT CARD ─────── */}
      {continueCourse && (
        <section style={{ marginBottom: 36 }}>
          <SectionHeader title="Certification Assessment" />
          <div
            className="skill-card"
            style={{
              padding: '28px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              flexWrap: 'wrap',
              borderRadius: 20,
              border: '1px solid #CFDEF3',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* Icon block */}
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
              }}
            >
              <ClipboardCheck size={34} color="#fff" />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <CategoryPill category={continueCourse.courseCategory} />
              <h3
                style={{
                  ...heading,
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: '8px 0 6px',
                }}
              >
                {continueCourse.courseTitle}
              </h3>
              <span style={{ ...body, fontSize: 14, color: '#64748B', fontWeight: 400 }}>
                Official 30-Question Certification Examination • 40 Mins Timed
              </span>
            </div>

            {/* Progress + button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexShrink: 0,
              }}
            >
              <ProgressRing
                percent={continueCourse.progressPercent}
                size={64}
              />
              <button
                onClick={() =>
                  navigate(`/assessments/${continueCourse.courseId}`)
                }
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 14,
                  backgroundColor: '#2563EB',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>Take Assessment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ─────── COURSES IN PROGRESS ─────── */}
      {inProgress.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionHeader
            title="Courses in Progress"
            linkTo="/my-learning"
            linkLabel="View All"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {inProgress.slice(0, 3).map((en) => (
              <CourseCard key={en.enrollmentId} enrollment={en} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* ─────── COMPLETED COURSES / CERTIFICATE ACTIONS ─────── */}
      {completed.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <SectionHeader
            title="Completed Courses"
            linkTo="/certificates"
            linkLabel="Certificates"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {completed.map((en) => {
              const hasCert = certificates.some(
                (c) => c.courseTitle === en.courseTitle
              );
              return (
                <div
                  key={en.enrollmentId}
                  className="skill-card"
                  style={{
                    padding: 26,
                    borderRadius: 18,
                    border: '1px solid #CFDEF3',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 18,
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div>
                    <CategoryPill category={en.courseCategory} />
                    <h4
                      style={{
                        ...heading,
                        fontSize: 17,
                        fontWeight: 600,
                        color: '#0F172A',
                        margin: '10px 0 6px',
                        lineHeight: 1.4,
                      }}
                    >
                      {en.courseTitle}
                    </h4>
                    <span
                      style={{
                        ...body,
                        fontSize: 13,
                        color: '#059669',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle2 size={15} />
                      All lessons completed
                    </span>
                  </div>

                  {hasCert ? (
                    <button
                      onClick={() => navigate('/certificates')}
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        padding: '11px 18px',
                        fontSize: 14,
                        fontWeight: 600,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <Award size={16} color="#2563EB" />
                      <span>View Certificate</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={() =>
                          navigate(`/assessments/${en.courseId}`)
                        }
                        className="btn-primary"
                        style={{
                          flex: 1,
                          padding: '11px 16px',
                          fontSize: 14,
                          fontWeight: 600,
                          backgroundColor: '#2563EB',
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <ClipboardCheck size={16} />
                        <span>Take Assessment</span>
                      </button>
                      <div
                        style={{
                          ...body,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '8px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#B45309',
                          backgroundColor: '#FEF3C7',
                          borderRadius: 999,
                          border: '1px solid #FDE68A',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Trophy size={14} color="#D97706" />
                        ₹99 Certificate
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────── EXPLORE SECTION (HUMAN-WRITTEN INTRO) ─────── */}
      {unenrolled.length > 0 && (
        <section style={{ marginTop: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  ...heading,
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#0F172A',
                  margin: '0 0 6px',
                }}
              >
                Learn new skills. Pass assessments. Earn verified certificates.
              </h3>
              <p
                style={{
                  ...body,
                  fontSize: 14,
                  color: '#64748B',
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Explore open courses, build hands-on skills at your own pace, and unlock official credentials.
              </p>
            </div>
            <Link
              to="/courses"
              style={{
                ...body,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 600,
                color: '#2563EB',
                textDecoration: 'none',
              }}
            >
              <span>Browse All Courses</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {unenrolled.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="skill-card"
                style={{
                  padding: 26,
                  borderRadius: 18,
                  border: '1px solid #CFDEF3',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 18,
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <CategoryPill category={course.category} />
                  </div>
                  <h4
                    style={{
                      ...heading,
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#0F172A',
                      lineHeight: 1.4,
                      marginBottom: 8,
                    }}
                  >
                    {course.title}
                  </h4>
                  <p
                    style={{
                      ...body,
                      fontSize: 14,
                      color: '#64748B',
                      fontWeight: 400,
                      lineHeight: 1.55,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      margin: 0,
                    }}
                  >
                    {course.description}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────── ASSESSMENT ATTEMPTS HISTORY ─────── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader
          title="Recent Assessment Attempts"
          linkTo="/courses"
          linkLabel="Take Exam"
        />
        {attempts.length === 0 ? (
          <div
            className="skill-card"
            style={{
              padding: '32px',
              textAlign: 'center',
              borderRadius: 18,
              border: '1px solid #CFDEF3',
              backgroundColor: '#FFFFFF',
            }}
          >
            <p style={{ ...body, color: '#64748B', fontSize: '14px', margin: 0 }}>
              No assessment attempts recorded yet. Select any course to begin your examination.
            </p>
          </div>
        ) : (
          <div
            className="skill-card"
            style={{
              borderRadius: 18,
              border: '1px solid #CFDEF3',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', ...body }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #CFDEF3' }}>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Course Assessment</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Score</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Percentage</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Status</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Attempted On</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: '#334155', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((att) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A' }}>
                        {att.courseTitle || att.assessmentTitle || 'Certification Assessment'}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#334155' }}>
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: att.passed ? '#059669' : '#DC2626' }}>
                        {Math.round(att.percentage)}%
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: att.passed ? '#DCFCE7' : '#FEE2E2',
                          color: att.passed ? '#15803D' : '#B91C1C',
                        }}>
                          {att.passed ? 'PASSED' : 'NOT CLEARED'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748B' }}>
                        {att.attemptedAt ? new Date(att.attemptedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {att.passed ? (
                          <button
                            onClick={() => navigate('/certificates')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563EB',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Certificate
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/assessments/${att.courseId}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563EB',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '13px',
                            }}
                          >
                            Retake Exam
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/* ═══════════════════ SUB-COMPONENTS ═══════════════════ */

const SectionHeader = ({ title, linkTo, linkLabel }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    }}
  >
    <h3
      style={{
        ...heading,
        fontSize: 18,
        fontWeight: 600,
        color: '#0F172A',
        margin: 0,
      }}
    >
      {title}
    </h3>
    {linkTo && (
      <Link
        to={linkTo}
        style={{
          ...body,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 14,
          fontWeight: 500,
          color: '#2563EB',
          textDecoration: 'none',
        }}
      >
        <span>{linkLabel}</span>
        <ChevronRight size={16} />
      </Link>
    )}
  </div>
);

const StatCard = ({ icon, iconBg, iconColor, label, value }) => (
  <div
    className="skill-card"
    style={{
      padding: '24px 26px',
      borderRadius: 18,
      border: '1px solid #CFDEF3',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div
        style={{
          ...body,
          fontSize: 14,
          color: '#64748B',
          marginBottom: 3,
          fontWeight: 400,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...heading,
          fontSize: 28,
          fontWeight: 600,
          color: '#0F172A',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

const CategoryPill = ({ category }) => {
  const c = catColor(category);
  return (
    <span
      style={{
        ...body,
        display: 'inline-block',
        backgroundColor: c.bg,
        color: c.text,
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {category || 'Course'}
    </span>
  );
};

const ProgressRing = ({ percent, size = 64 }) => {
  const strokeWidth = 5.5;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent === 100 ? '#059669' : '#2563EB';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#CFDEF3"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        style={{
          ...heading,
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: '#0F172A',
        }}
      >
        {percent}%
      </span>
    </div>
  );
};

const CourseCard = ({ enrollment: en, navigate }) => {
  const isCompleted = en.progressPercent === 100;
  return (
    <div
      className="skill-card"
      style={{
        padding: 26,
        borderRadius: 18,
        border: '1px solid #CFDEF3',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 230,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Top */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <CategoryPill category={en.courseCategory} />
        </div>
        <h4
          style={{
            ...heading,
            fontSize: 17,
            fontWeight: 600,
            color: '#0F172A',
            lineHeight: 1.4,
            marginBottom: 6,
          }}
        >
          {en.courseTitle}
        </h4>
      </div>

      {/* Bottom */}
      <div>
        {/* Progress label + bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span style={{ ...body, fontSize: 13, color: '#64748B', fontWeight: 400 }}>
            {en.completedLessonsCount}/{en.totalLessonsCount} lessons
          </span>
          <span
            style={{
              ...heading,
              fontSize: 14,
              fontWeight: 600,
              color: isCompleted ? '#059669' : '#2563EB',
            }}
          >
            {en.progressPercent}%
          </span>
        </div>
        <div
          style={{
            height: 7,
            backgroundColor: '#E0EAFC',
            borderRadius: 999,
            overflow: 'hidden',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: `${en.progressPercent}%`,
              height: '100%',
              background: isCompleted
                ? '#059669'
                : 'linear-gradient(90deg, #2563EB, #60A5FA)',
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate(`/assessments/${en.courseId}`)}
            className="btn-primary"
            style={{
              flex: 1,
              padding: '11px 16px',
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: '#2563EB',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>{isCompleted ? 'Retake Exam' : 'Start Assessment'}</span>
            <ArrowRight size={16} />
          </button>
          {isCompleted && (
            <button
              onClick={() => navigate('/certificates')}
              style={{
                backgroundColor: '#E0EAFC',
                color: '#1E40AF',
                border: '1px solid #CFDEF3',
                padding: '11px 16px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Award size={16} />
              <span>Certificate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
