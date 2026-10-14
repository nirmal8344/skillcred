import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Download, ExternalLink, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';

/* ───────── typography ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await api.get('/certificates/my-certificates');
        setCertificates(data || []);
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="animate-fade-in">
      <TopBar 
        title="My Verified Credentials" 
        subtitle="Access and download your official industry certifications and shareable verification badges" 
      />

      {certificates.length === 0 ? (
        <div className="skill-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#E0EAFC',
            border: '1px solid #CFDEF3',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <Award size={32} color="#2563EB" />
          </div>
          <h3 style={{ ...heading, fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
            No certificates earned yet
          </h3>
          <p style={{ ...body, fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            Pass the course assessment to qualify for and unlock your official industry credential.
          </p>
          <Link to="/courses" className="btn-primary" style={{ ...body, padding: '10px 24px' }}>
            Explore Available Courses
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="skill-card"
              
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Certificate Mini Preview Container */}
              <div style={{
                height: '180px',
                backgroundColor: '#E0EAFC',
                position: 'relative',
                backgroundImage: 'url(/assets/certificate_template.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}>
                  <div style={{ ...body, fontSize: '11px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' }}>
                    CERTIFICATE OF COMPLETION
                  </div>
                  <div style={{ ...heading, fontSize: '14px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                    {cert.studentName}
                  </div>
                </div>
              </div>

              {/* Certificate Details */}
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ ...body, fontSize: '11px', fontWeight: '700', color: '#2563EB' }}>
                      ID: {cert.certificateId}
                    </span>
                    <span className="badge badge-green" style={{ ...body }}>
                      <ShieldCheck size={12} style={{ marginRight: '4px' }} />
                      Verified
                    </span>
                  </div>

                  <h3 style={{ ...heading, fontSize: '17px', fontWeight: '600', color: '#0F172A', marginBottom: '8px', lineHeight: 1.3 }}>
                    {cert.courseTitle}
                  </h3>

                  <div style={{ ...body, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                    <Calendar size={14} />
                    <span>Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/certificates/${cert.certificateId}`)}
                    className="btn-primary"
                    style={{ ...body, flex: 1, padding: '10px', fontSize: '13px' }}
                  >
                    <span>View & Download</span>
                    <ArrowRight size={16} />
                  </button>

                  <a
                    href={`/verify/${cert.certificateId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...body,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 14px',
                      borderRadius: '999px',
                      backgroundColor: '#E0EAFC',
                      border: '1px solid #CFDEF3',
                      color: '#1E40AF',
                      textDecoration: 'none',
                    }}
                    title="Public Verification Link"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
