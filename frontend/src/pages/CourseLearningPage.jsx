import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  FileText, 
  Award, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client';

export const CourseLearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [learningData, setLearningData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [marking, setMarking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const data = await api.get(`/courses/${courseId}/learning`);
      setLearningData(data);
      const completedSet = new Set(data.completedLessonIds || []);
      setCompletedLessonIds(completedSet);

      // Set active lesson to first non-completed or first lesson
      if (!activeLesson && data.modules?.length > 0) {
        let firstLesson = null;
        for (const mod of data.modules) {
          for (const les of mod.lessons) {
            if (!completedSet.has(les.id) && !firstLesson) {
              firstLesson = les;
              break;
            }
          }
        }
        setActiveLesson(firstLesson || data.modules[0].lessons[0]);
      }
    } catch (err) {
      console.error('Failed to fetch learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || marking) return;
    setMarking(true);
    try {
      const res = await api.post(`/courses/${courseId}/lessons/${activeLesson.id}/complete`);
      
      // Update local state
      const nextCompleted = new Set(completedLessonIds);
      nextCompleted.add(activeLesson.id);
      setCompletedLessonIds(nextCompleted);

      // Find next lesson
      let foundActive = false;
      let nextLesson = null;
      for (const mod of learningData.modules) {
        for (const les of mod.lessons) {
          if (foundActive) {
            nextLesson = les;
            break;
          }
          if (les.id === activeLesson.id) {
            foundActive = true;
          }
        }
        if (nextLesson) break;
      }

      if (nextLesson) {
        setActiveLesson(nextLesson);
      }

      // Re-fetch to update progress percent
      fetchCourseData();
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    } finally {
      setMarking(false);
    }
  };

  if (loading || !learningData) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading lesson classroom...</div>;
  }

  const { course, modules, enrollment } = learningData;
  const isAllCompleted = enrollment?.progressPercent === 100;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F0F4F8', overflow: 'hidden' }}>
      {/* Classroom Left Navigation / Syllabus Drawer */}
      <aside style={{
        width: '360px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #CFDEF3',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '4px 0 20px rgba(207, 222, 243, 0.25)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #CFDEF3' }}>
          <button
            onClick={() => navigate('/my-learning')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              color: '#2563EB',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '12px',
              padding: 0,
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to My Courses</span>
          </button>

          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', lineHeight: 1.3, margin: '0 0 10px 0' }}>
            {course.title}
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '6px' }}>
            <span>Course Progress</span>
            <span style={{ color: isAllCompleted ? '#027A48' : '#2563EB', fontWeight: '800' }}>
              {enrollment?.progressPercent || 0}%
            </span>
          </div>

          <div style={{ height: '6px', backgroundColor: '#E0EAFC', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{
              width: `${enrollment?.progressPercent || 0}%`,
              height: '100%',
              backgroundColor: isAllCompleted ? '#12B76A' : '#2563EB',
              borderRadius: '999px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Modules & Lessons Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {modules.map((mod, mIdx) => (
            <div key={mod.id} style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                paddingLeft: '4px',
              }}>
                Module {mIdx + 1}: {mod.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {mod.lessons.map((les) => {
                  const isDone = completedLessonIds.has(les.id);
                  const isCurrent = activeLesson?.id === les.id;

                  return (
                    <button
                      key={les.id}
                      onClick={() => setActiveLesson(les)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: isCurrent ? '#E0EAFC' : 'transparent',
                        border: '1px solid',
                        borderColor: isCurrent ? '#CFDEF3' : 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {isDone ? (
                          <CheckCircle2 size={16} color="#12B76A" style={{ flexShrink: 0 }} />
                        ) : (
                          <Circle size={16} color="#CFDEF3" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontSize: '13px',
                          fontWeight: isCurrent ? '700' : '500',
                          color: isCurrent ? '#1E40AF' : '#334155',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {les.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '6px', flexShrink: 0 }}>
                        {les.durationMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Link Card in Drawer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #CFDEF3', backgroundColor: '#F8FAFD' }}>
          <button
            onClick={() => navigate(`/assessments/${courseId}`)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '14px',
              backgroundColor: isAllCompleted ? '#2563EB' : '#E0EAFC',
              color: isAllCompleted ? '#FFFFFF' : '#1E40AF',
              border: isAllCompleted ? 'none' : '1px solid #CFDEF3',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: isAllCompleted ? '0 4px 16px rgba(37, 99, 235, 0.3)' : 'none',
            }}
          >
            <Award size={16} />
            <span>Take Final Assessment</span>
          </button>
        </div>
      </aside>

      {/* Classroom Main Viewer */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Banner if 100% completed */}
        {isAllCompleted && (
          <div style={{
            background: 'linear-gradient(90deg, #ECFDF3 0%, #D1FADF 100%)',
            borderBottom: '1px solid #A6F4C5',
            padding: '14px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#12B76A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={16} color="#FFFFFF" />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#027A48' }}>
                  Course Completed (100%)!
                </span>
                <span style={{ fontSize: '13px', color: '#05603A', marginLeft: '6px' }}>
                  You are now fully eligible to take the assessment and claim your certificate.
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/assessments/${courseId}`)}
              style={{
                backgroundColor: '#027A48',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Attend Assessment Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Lesson View Container */}
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '36px 32px' }}>
          {activeLesson ? (
            <div>
              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge-purple">
                    {activeLesson.lessonType} Lecture
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    {activeLesson.durationMinutes} Minutes Expected
                  </span>
                </div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
                  {activeLesson.title}
                </h1>
              </div>

              {/* Video Mockup / Content Screen */}
              {activeLesson.lessonType === 'VIDEO' ? (
                <div style={{
                  backgroundColor: '#0F172A',
                  borderRadius: '20px',
                  height: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: '28px',
                  boxShadow: '0 12px 36px rgba(15, 23, 42, 0.25)',
                }}>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}>
                    <PlayCircle size={44} color="#FFFFFF" />
                  </div>
                  <span style={{ marginTop: '16px', fontSize: '15px', fontWeight: '700', letterSpacing: '0.3px' }}>
                    Interactive Video Module
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    HD Lecture • SkillCred Production
                  </span>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '32px',
                  border: '1px solid #CFDEF3',
                  boxShadow: '0 4px 20px rgba(207, 222, 243, 0.2)',
                  marginBottom: '28px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <FileText size={22} color="#2563EB" />
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      Study Material & Practical Reading
                    </h3>
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#334155' }}>
                    {activeLesson.content || 'Review key principles, syntax structures, and architecture best practices for this module.'}
                  </div>
                </div>
              )}

              {/* Lesson Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                padding: '20px 24px',
                borderRadius: '16px',
                border: '1px solid #CFDEF3',
                boxShadow: '0 4px 16px rgba(207, 222, 243, 0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {completedLessonIds.has(activeLesson.id) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#027A48', fontSize: '13px', fontWeight: '700' }}>
                      <CheckCircle2 size={18} />
                      <span>Completed</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#64748B' }}>
                      Click below when you have finished this topic
                    </span>
                  )}
                </div>

                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '13px' }}
                >
                  <Check size={16} />
                  <span>{marking ? 'Saving...' : 'Mark as Complete & Next'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              Select a lesson from the sidebar to begin
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
