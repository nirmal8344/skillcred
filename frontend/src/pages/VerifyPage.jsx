import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, XCircle, Award, CheckCircle, Calendar, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '../api/client';

export const VerifyPage = () => {
  const { certificateId } = useParams();

  const [verifyData, setVerifyData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyCert = async () => {
      try {
        const data = await api.get(`/certificates/verify/${certificateId}`);
        setVerifyData(data);
      } catch (err) {
        setError(err.message || 'Certificate record could not be verified.');
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCert();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #CFDEF3',
            borderTop: '4px solid #64748B',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px auto',
          }} />
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
            Querying SkillCred Public Registry...
          </span>
        </div>
      </div>
    );
  }

  const isValid = verifyData?.valid;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
        border: '1px solid #CFDEF3',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(207, 222, 243, 0.5)',
              overflow: 'hidden',
              padding: '3px',
            }}>
              <img
                src="/assets/adzivo_icon.png"
                alt="SkillCred"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', lineHeight: 1.1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Skill<span style={{ color: '#334155' }}>C</span>red
              </div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748B', letterSpacing: '0.6px' }}>
                By ADZ4NEEDZ
              </div>
            </div>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            backgroundColor: '#E0EAFC',
            color: '#334155',
            padding: '4px 10px',
            borderRadius: '999px',
            border: '1px solid #CFDEF3',
          }}>
            OFFICIAL REGISTRY
          </span>
        </div>

        {/* Verification Status Banner */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          borderRadius: '20px',
          backgroundColor: isValid ? '#ECFDF3' : '#FEF3F2',
          border: '1px solid',
          borderColor: isValid ? '#A6F4C5' : '#FECDCA',
          marginBottom: '28px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isValid ? '#12B76A' : '#F04438',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: isValid ? '0 4px 14px rgba(18, 183, 106, 0.3)' : '0 4px 14px rgba(240, 68, 56, 0.3)',
          }}>
            {isValid ? (
              <ShieldCheck size={32} color="#FFFFFF" />
            ) : (
              <XCircle size={32} color="#FFFFFF" />
            )}
          </div>

          <h3 style={{
            fontSize: '20px',
            fontWeight: '800',
            color: isValid ? '#027A48' : '#B42318',
            margin: '0 0 6px 0',
          }}>
            {isValid ? 'Authentic & Valid Credential' : 'Invalid or Unverified Credential'}
          </h3>

          <p style={{
            fontSize: '13px',
            color: isValid ? '#05603A' : '#912018',
            margin: 0,
            lineHeight: 1.4,
          }}>
            {isValid
              ? 'This certificate has been issued by SkillCred by Adz4needz and conforms to all verification standards.'
              : 'No verified record exists matching this identifier in the Adz4needz certificate registry.'}
          </p>
        </div>

        {/* Certificate Metadata Records */}
        {isValid && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#F8FAFD',
              borderRadius: '12px',
              border: '1px solid #CFDEF3',
            }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Student Name</span>
              <span style={{ fontSize: '14px', color: '#0F172A', fontWeight: '800' }}>
                {verifyData.studentName}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#F8FAFD',
              borderRadius: '12px',
              border: '1px solid #CFDEF3',
            }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Course Title</span>
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '800', textAlign: 'right', maxWidth: '280px' }}>
                {verifyData.courseTitle}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#F8FAFD',
              borderRadius: '12px',
              border: '1px solid #CFDEF3',
            }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Credential ID</span>
              <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: '700', fontFamily: 'monospace' }}>
                {verifyData.certificateId}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#F8FAFD',
              borderRadius: '12px',
              border: '1px solid #CFDEF3',
            }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Date of Issue</span>
              <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: '700' }}>
                {verifyData.issueDate ? new Date(verifyData.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'October 12, 2026'}
              </span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/login"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            <span>Learn with SkillCred by Adz4needz</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
