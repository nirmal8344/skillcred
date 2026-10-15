import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';

/* ───────── colour helpers ───────── */
const CATEGORY_COLORS = {
  'AI & Technology': { bg: '#EDE9FE', text: '#5B21B6' },
  'Data & AI': { bg: '#FEF3C7', text: '#92400E' },
  'Engineering & Web': { bg: '#DBEAFE', text: '#334155' },
  'Data & Analytics': { bg: '#E0E7FF', text: '#3730A3' },
  'Business & Management': { bg: '#FCE7F3', text: '#9D174D' },
  'Sales & Business': { bg: '#FFEDD5', text: '#9A3412' },
  'Healthcare & Coding': { bg: '#D1FAE5', text: '#065F46' },
};
const catColor = (cat) => CATEGORY_COLORS[cat] || { bg: '#E0EAFC', text: '#334155' };

/* ───────── fonts ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const MyLearningPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await api.get('/courses/my-enrollments');
        setEnrollments(data || []);
      } catch (err) {
        console.error('Failed to load enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="animate-fade-in">
      <TopBar
        title="My Learning"
        subtitle="Track your enrolled courses and pick up where you left off"
      />

      {enrollments.length === 0 ? (
        <div
          className="skill-card"
          style={{ padding: '60px 40px', textAlign: 'center', border: '1px solid #CFDEF3' }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#E0EAFC',
              border: '1px solid #CFDEF3',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <BookOpen size={28} color="#64748B" />
          </div>
          <h3
            style={{
              ...heading,
              fontSize: 18,
              fontWeight: 700,
              color: '#0F172A',
              marginBottom: 8,
            }}
          >
            No enrolled courses yet
          </h3>
          <p
            style={{
              ...body,
              fontSize: 13,
              color: '#64748B',
              marginBottom: 24,
            }}
          >
            Browse courses and start learning at your own pace.
          </p>
          <Link
            to="/courses"
            className="btn-primary"
            style={{ padding: '10px 24px' }}
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div
          className="mylearning-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 22,
          }}
        >
          {enrollments.map((en) => {
            const isCompleted = en.progressPercent === 100;
            const c = catColor(en.courseCategory);

            return (
              <div
                key={en.enrollmentId}
                className="skill-card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 240,
                  border: '1px solid #CFDEF3',
                }}
              >
                {/* Top */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        ...body,
                        backgroundColor: c.bg,
                        color: c.text,
                        border: '1px solid #CFDEF3',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {en.courseCategory}
                    </span>
                  </div>

                  <h3
                    style={{
                      ...heading,
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: 6,
                      lineHeight: 1.35,
                    }}
                  >
                    {en.courseTitle}
                  </h3>

                  <div
                    style={{
                      ...body,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: isCompleted ? '#059669' : '#64748B',
                      fontWeight: isCompleted ? 600 : 400,
                      marginBottom: 16,
                    }}
                  >
                    <CheckCircle2
                      size={14}
                      color={isCompleted ? '#059669' : '#9CA3AF'}
                    />
                    <span>
                      {en.completedLessonsCount}/{en.totalLessonsCount}{' '}
                      lessons{isCompleted ? ' — Completed' : ' completed'}
                    </span>
                  </div>
                </div>

                {/* Bottom */}
                <div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ ...body, color: '#64748B' }}>
                        Progress
                      </span>
                      <span
                        style={{
                          ...heading,
                          color: isCompleted ? '#059669' : '#64748B',
                        }}
                      >
                        {en.progressPercent}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        backgroundColor: '#E0EAFC',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${en.progressPercent}%`,
                          height: '100%',
                          background: isCompleted
                            ? '#059669'
                            : 'linear-gradient(90deg, #64748B, #94A3B8)',
                          borderRadius: 999,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/assessments/${en.courseId}`)}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{isCompleted ? 'Retake Exam' : 'Start Assessment'}</span>
                      <ArrowRight size={14} />
                    </button>

                    {isCompleted ? (
                      <button
                        onClick={() => navigate('/certificates')}
                        style={{
                          backgroundColor: '#E0EAFC',
                          color: '#334155',
                          border: '1px solid #CFDEF3',
                          padding: '9px 14px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <Award size={14} />
                        <span>Certificate</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${en.courseId}`)}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#475569',
                          border: '1px solid #CBD5E1',
                          padding: '9px 14px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <span>Details</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
