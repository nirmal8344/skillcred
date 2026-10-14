import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  X,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';

export const AssessmentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes default
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const assessmentRef = useRef(assessment);
  assessmentRef.current = assessment;

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Prevent accidental tab closure or navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (answersRef.current && Object.keys(answersRef.current).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request denied:', err);
    }
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await api.get(`/assessments/course/${courseId}`);
        setAssessment(data);
        if (data.timeLimitMinutes) {
          setTimeLeft(data.timeLimitMinutes * 60);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assessment. Please ensure course is ready.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [courseId]);

  // Submit test function
  const submitTest = async (answersToSubmit) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      const currentAssessment = assessmentRef.current;
      const targetAssessmentId = currentAssessment?.assessmentId || currentAssessment?.id;
      const questionIds = (currentAssessment?.questions || []).map((q) => q.id);

      const result = await api.post(`/assessments/${targetAssessmentId}/submit`, {
        questionIds,
        answers: answersToSubmit || answersRef.current,
      });

      navigate('/assessment-result', { state: { result, courseId } });
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!assessment) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assessment]);

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>
          Loading assessment session...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ color: '#EF4444', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <AlertCircle size={44} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
            Unable to load assessment
          </h3>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/courses')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentIdx] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const formatDigitalTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const rem = secs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeLeft < 300; // less than 5 minutes

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ================= FULL-SCREEN TOP NAVIGATION HEADER ================= */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '15px'
            }}>
              S
            </div>
            <span style={{ fontWeight: '800', fontSize: '17px', color: '#0F172A', letterSpacing: '-0.3px' }}>
              SkillCred
            </span>
          </div>

          <span style={{ color: '#CBD5E1', fontSize: '18px' }}>|</span>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Official Examination
            </span>
            <h1 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
              {assessment.title || 'Course Assessment'}
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Header Compact Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: isTimeCritical ? '#FEE2E2' : '#EFF6FF',
            border: isTimeCritical ? '1px solid #FECACA' : '1px solid #DBEAFE',
            color: isTimeCritical ? '#DC2626' : '#1E40AF',
            fontWeight: '700',
            fontSize: '14px',
            fontFamily: 'monospace',
          }}>
            <Clock size={16} />
            <span>{formatDigitalTime(timeLeft)}</span>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span style={{ display: 'none', smDisplay: 'inline' }}>
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>

          {/* Exit Button */}
          <button
            onClick={() => setShowExitModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #F1F5F9',
              backgroundColor: '#F8FAFC',
              color: '#64748B',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* ================= ASSESSMENT CONTENT CONTAINER ================= */}
      <main style={{
        flex: 1,
        maxWidth: '1240px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'grid',
        gridTemplateColumns: '290px 1fr',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* ================= LEFT SIDEBAR ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Timer Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: isTimeCritical ? '1px solid #FECACA' : '1px solid #E2E8F0',
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: isTimeCritical ? '#DC2626' : '#2563EB',
              display: 'block',
              marginBottom: '6px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Time Remaining
            </span>
            <div style={{
              fontSize: '26px',
              fontWeight: '800',
              fontFamily: 'monospace',
              letterSpacing: '1px',
              color: isTimeCritical ? '#DC2626' : '#0F172A',
            }}>
              {formatDigitalTime(timeLeft)}
            </div>
            {isTimeCritical && (
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                ⚠️ Less than 5 minutes remaining!
              </span>
            )}
          </div>

          {/* Card 2: Question Navigator Grid */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#2563EB',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Question Navigator
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#059669',
              }}>
                {answeredCount} / {totalQuestions} Answered
              </span>
            </div>

            {/* Grid of question numbers: 6 columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
              marginBottom: '16px',
            }}>
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIdx;

                let bg = '#FFFFFF';
                let color = '#334155';
                let border = '1px solid #CBD5E1';

                if (isAnswered) {
                  bg = '#2563EB';
                  color = '#FFFFFF';
                  border = '1px solid #2563EB';
                }

                if (isCurrent) {
                  if (!isAnswered) {
                    bg = '#EFF6FF';
                    color = '#1E40AF';
                    border = '2px solid #2563EB';
                  } else {
                    bg = '#1D4ED8';
                    color = '#FFFFFF';
                    border = '2px solid #0F172A';
                  }
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      border,
                      backgroundColor: bg,
                      color,
                      fontSize: '13px',
                      fontWeight: isCurrent || isAnswered ? '700' : '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isCurrent ? '0 0 0 2px rgba(37, 99, 235, 0.3)' : 'none',
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '11px',
              color: '#64748B',
              paddingTop: '10px',
              borderTop: '1px solid #F1F5F9',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#2563EB' }} />
                <span>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }} />
                <span>Unanswered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#EFF6FF', border: '1px solid #2563EB' }} />
                <span>Current</span>
              </div>
            </div>
          </div>

          {/* Card 3: Exam Rules / Requirements */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#64748B',
              display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Exam Standards
            </span>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>
              Minimum 50% passing threshold
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
              Score at least 15 / 30 questions to immediately qualify for your certificate. Unlimited attempts permitted.
            </div>
          </div>
        </div>

        {/* ================= MAIN QUESTION PANEL ================= */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px 36px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          minHeight: '540px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            {/* Top Navigation Bar: Previous - Question Number - Next */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '20px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '28px',
            }}>
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid #E2E8F0',
                  color: currentIdx === 0 ? '#CBD5E1' : '#0F172A',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                  backgroundColor: currentIdx === 0 ? '#F8FAFC' : '#FFFFFF',
                }}
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>

              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#2563EB',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {answers[currentQ?.id] ? '✓ Answer selected' : 'Not answered yet'}
                </div>
              </div>

              <button
                onClick={() => setCurrentIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                disabled={currentIdx === totalQuestions - 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid #E2E8F0',
                  color: currentIdx === totalQuestions - 1 ? '#CBD5E1' : '#0F172A',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: currentIdx === totalQuestions - 1 ? 'not-allowed' : 'pointer',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                  backgroundColor: currentIdx === totalQuestions - 1 ? '#F8FAFC' : '#FFFFFF',
                }}
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Question Text */}
            {currentQ && (
              <div>
                <p style={{
                  fontSize: '16px',
                  lineHeight: '1.65',
                  color: '#0F172A',
                  marginBottom: '28px',
                  fontWeight: '600',
                }}>
                  {currentQ.questionText}
                </p>

                {/* Multiple Choice Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQ.options?.map((option, optIdx) => {
                    const isSelected = answers[currentQ.id] === option;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, option)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                          border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Radio circle */}
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #2563EB' : '2px solid #94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          backgroundColor: '#FFFFFF',
                          transition: 'all 0.15s ease',
                        }}>
                          {isSelected && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: '#2563EB',
                            }} />
                          )}
                        </div>

                        {/* Option label */}
                        <span style={{
                          fontSize: '14px',
                          color: isSelected ? '#0F172A' : '#334155',
                          fontWeight: isSelected ? '600' : '400',
                          lineHeight: 1.5,
                        }}>
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main Panel Footer: Bottom Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9',
          }}>
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Completed <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
              className="btn-primary"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 32px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Examination'}
            </button>
          </div>
        </div>
      </main>

      {/* ================= CONFIRMATION MODAL ON SUBMIT ================= */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: answeredCount < totalQuestions ? '#FEF3C7' : '#DCFCE7',
              color: answeredCount < totalQuestions ? '#D97706' : '#15803D',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {answeredCount < totalQuestions ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
            </div>

            <h4 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              Confirm Examination Submission
            </h4>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
              {totalQuestions - answeredCount > 0 ? (
                <span style={{ color: '#DC2626', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                  {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's are' : ' is'} still unanswered!
                </span>
              ) : (
                <span style={{ color: '#059669', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                  All questions have been answered. Ready for scoring!
                </span>
              )}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  padding: '11px 22px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Keep Reviewing
              </button>

              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  submitTest();
                }}
                disabled={submitting}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ON EXIT ================= */}
      {showExitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertCircle size={28} />
            </div>

            <h4 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
              Exit Examination?
            </h4>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to leave? Your responses in this active session will not be scored.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowExitModal(false)}
                style={{
                  padding: '11px 22px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Resume Exam
              </button>

              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  }
                  navigate('/courses');
                }}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
