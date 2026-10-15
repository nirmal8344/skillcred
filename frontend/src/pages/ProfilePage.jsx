import React, { useState } from 'react';
import { User, Award, Mail, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TopBar } from '../components/TopBar';

/* ───────── typography ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [certificateDisplayName, setCertificateDisplayName] = useState(user?.certificateDisplayName || user?.fullName || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await updateProfile({ fullName, certificateDisplayName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px' }}>
      <TopBar 
        title="Student Profile" 
        subtitle="Manage your personal details and official certificate designation" 
      />

      <div className="skill-card" style={{ padding: '36px' }}>
        {/* Profile Avatar Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{
            ...heading,
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #334155, #64748B)',
            color: '#FFFFFF',
            fontSize: '26px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)',
          }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>

          <div>
            <h2 style={{ ...heading, fontSize: '20px', fontWeight: '600', color: '#0F172A', margin: '0 0 4px 0' }}>
              {user?.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span className="badge badge-purple" style={{ ...body, textTransform: 'capitalize' }}>
                {user?.role?.toLowerCase() || 'Student'}
              </span>
              {user?.learnerCategory && (
                <span className="badge badge-peach" style={{ ...body }}>
                  {user.learnerCategory}
                </span>
              )}
              <span style={{ ...body, fontSize: '13px', color: '#64748B' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {success && (
          <div style={{
            ...body,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ECFDF3',
            border: '1px solid #A6F4C5',
            color: '#027A48',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '24px',
            fontWeight: '600',
          }}>
            <CheckCircle2 size={18} />
            <span>Profile and certificate display name updated successfully!</span>
          </div>
        )}

        {error && (
          <div style={{
            ...body,
            color: '#D92D20',
            backgroundColor: '#FEF3F2',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '24px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
              Full Account Name
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFD',
              border: '1px solid #CFDEF3',
              borderRadius: '12px',
              padding: '12px 16px',
            }}>
              <User size={18} color="#64748B" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  ...body,
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ ...body, fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                Certificate Display Name
              </label>
              <span style={{ ...body, fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                Official Credential Authority
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFD',
              border: '1px solid #CFDEF3',
              borderRadius: '12px',
              padding: '12px 16px',
            }}>
              <Award size={18} color="#64748B" />
              <input
                type="text"
                value={certificateDisplayName}
                onChange={(e) => setCertificateDisplayName(e.target.value)}
                placeholder="How your name appears on printed certificate"
                required
                style={{
                  ...body,
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
              />
            </div>
            <p style={{ ...body, fontSize: '12px', color: '#64748B', marginTop: '6px', margin: '6px 0 0 0' }}>
              This exact string will be rendered onto your official Adz4needz landscape certificate template upon completing courses.
            </p>
          </div>

          <div>
            <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CFDEF3',
              borderRadius: '12px',
              padding: '12px 16px',
            }}>
              <Mail size={18} color="#64748B" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  ...body,
                  border: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '14px',
                  color: '#64748B',
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ ...body, padding: '12px 28px', fontSize: '14px' }}
            >
              <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
