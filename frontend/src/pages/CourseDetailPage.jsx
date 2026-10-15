import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  LayoutList,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';

/* ───────── typography ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.get(`/courses/${id}/learning`);
        setCourseData(data);
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleStartAssessment = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
    } catch (err) {
      console.warn('Enrollment notice:', err);
    } finally {
      setEnrolling(false);
      navigate(`/assessments/${id}`);
    }
  };

  if (loading || !courseData) {
    return <div style={{ ...body, padding: '40px', textAlign: 'center' }}>Loading course overview...</div>;
  }

  const { course, modules } = courseData;
  const objectives = course.learningObjectives ? course.learningObjectives.split(';') : [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '48px' }}>
      <button
        onClick={() => navigate('/courses')}
        style={{
          ...body,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          color: '#64748B',
          fontSize: '13px',
          fontWeight: '700',
          marginBottom: '20px',
          padding: '6px 0',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Course Catalog</span>
      </button>

      {/* Course Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
        borderRadius: '24px',
        padding: '36px',
        border: '1px solid #BDD3F0',
        boxShadow: '0 8px 30px rgba(207, 222, 243, 0.4)',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <span style={{
            ...body,
            backgroundColor: '#E0EAFC',
            color: '#334155',
            border: '1px solid #CFDEF3',
            padding: '5px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '700',
            display: 'inline-block',
            marginBottom: '14px',
          }}>
            {course.category}
          </span>
          <h1 style={{ ...heading, fontSize: '30px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.25 }}>
            {course.title}
          </h1>
          <p style={{ ...body, fontSize: '15px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
            {course.description}
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ ...body, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
              <Clock size={16} color="#64748B" />
              <span>Exam Time: 40 Minutes</span>
            </div>
            <div style={{ ...body, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
              <LayoutList size={16} color="#64748B" />
              <span>30 Questions • Randomized Pool</span>
            </div>
            <div style={{ ...body, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', fontWeight: '600' }}>
              <ShieldCheck size={16} color="#12B76A" />
              <span>Official Industry Certificate on Passing</span>
            </div>
          </div>
        </div>

        {/* Start Assessment Action Box */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(207, 222, 243, 0.35)',
          border: '1px solid #CFDEF3',
          minWidth: '260px',
          textAlign: 'center',
        }}>
          <span style={{ ...body, fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
            Certificate Issuance Fee
          </span>
          <div style={{ ...heading, fontSize: '32px', fontWeight: '800', color: '#0F172A', margin: '4px 0 16px 0' }}>
            ₹{Math.round(course.price || 99)}
          </div>

          <button
            onClick={handleStartAssessment}
            disabled={enrolling}
            className="btn-primary"
            style={{ ...body, width: '100%', padding: '14px 20px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>{enrolling ? 'Preparing...' : 'Start Assessment'}</span>
            <ArrowRight size={18} />
          </button>

          <p style={{ ...body, fontSize: '11px', color: '#64748B', marginTop: '12px', margin: '12px 0 0 0' }}>
            Direct Examination • Unlimited Attempts
          </p>
        </div>
      </div>

      {/* Learning Outcomes */}
      {objectives.length > 0 && (
        <div className="skill-card" style={{ padding: '28px', marginBottom: '32px', border: '1px solid #CFDEF3' }}>
          <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
            Key Competencies & Evaluation Criteria
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {objectives.map((obj, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <Check size={12} color="#027A48" />
                </div>
                <span style={{ ...body, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                  {obj.trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Syllabus Domains */}
      <div className="skill-card" style={{ padding: '28px', border: '1px solid #CFDEF3' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Assessment Domains Covered
            </h3>
            <p style={{ ...body, fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Your 30 exam questions are dynamically drawn from these verified domain modules.
            </p>
          </div>
          <button
            onClick={handleStartAssessment}
            className="btn-primary"
            style={{ ...body, padding: '10px 18px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Begin Test</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {modules.map((mod, index) => (
            <div
              key={mod.id}
              style={{
                borderRadius: '16px',
                border: '1px solid #CFDEF3',
                backgroundColor: '#F8FAFD',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    ...body,
                    backgroundColor: '#64748B',
                    color: '#FFFFFF',
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '800',
                  }}>
                    {index + 1}
                  </span>
                  <h4 style={{ ...heading, fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {mod.title}
                  </h4>
                </div>
                <span style={{ ...body, fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                  Tested Domain
                </span>
              </div>

              {/* Topics evaluated */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '36px' }}>
                {mod.lessons?.map((les, lIndex) => (
                  <div
                    key={les.id}
                    style={{
                      ...body,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#334155',
                      padding: '4px 0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748B', fontSize: '12px' }}>•</span>
                      <span>{les.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
