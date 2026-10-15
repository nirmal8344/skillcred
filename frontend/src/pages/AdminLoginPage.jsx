import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ShieldAlert, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email address.');
      return;
    }
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await adminLogin(email, password);
      if (data?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        setError('Access Denied: Administrator privileges required.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fontHeading = "'Plus Jakarta Sans', 'Outfit', sans-serif";
  const fontBody = "'Plus Jakarta Sans', sans-serif";

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      boxSizing: 'border-box',
      fontFamily: fontBody,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(207,222,243,0.5) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Main Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* SkillCred Admin Brand */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '28px',
          textAlign: 'center',
        }}>
          <img
            src="/assets/adzivo_icon.png"
            alt="SkillCred Logo"
            style={{
              width: '56px',
              height: '56px',
              objectFit: 'contain',
              marginBottom: '16px',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#0F172A',
              margin: 0,
              fontFamily: fontHeading,
              letterSpacing: '-0.4px',
            }}>
              Skill<span style={{ color: '#64748B' }}>C</span>red
            </h1>
            <span style={{
              backgroundColor: '#334155',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              letterSpacing: '0.5px',
            }}>
              ADMIN
            </span>
          </div>

          <p style={{
            fontSize: '13px',
            color: '#64748B',
            fontWeight: '600',
            marginTop: '6px',
            letterSpacing: '0.4px',
          }}>
            ADZ4NEEDZ ADMINISTRATION & GOVERNANCE GATEWAY
          </p>
        </div>

        {/* Admin Login Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #CFDEF3',
          padding: '40px 36px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(207, 222, 243, 0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECDCA',
              color: '#B42318',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              <Lock size={12} />
              <span>RESTRICTED PERSONNEL ONLY</span>
            </div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#0F172A',
              margin: '0 0 6px 0',
              fontFamily: fontHeading,
            }}>
              Administrator Sign In
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
              Enter your verified credentials to access the console
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECDCA',
              color: '#B42318',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '20px',
              lineHeight: 1.45,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
              }}>
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@adz4needz.com"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid #CFDEF3',
                  backgroundColor: '#F8FAFD',
                  fontSize: '14px',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: fontBody,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#64748B';
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CFDEF3';
                  e.target.style.backgroundColor = '#F8FAFD';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#334155',
                marginBottom: '6px',
              }}>
                Security Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid #CFDEF3',
                    backgroundColor: '#F8FAFD',
                    fontSize: '14px',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontFamily: fontBody,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#64748B';
                    e.target.style.backgroundColor = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(100, 116, 139, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CFDEF3';
                    e.target.style.backgroundColor = '#F8FAFD';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: 0,
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                backgroundColor: '#64748B',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '700',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(100, 116, 139, 0.25)',
                transition: 'all 0.2s ease',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: fontBody,
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#475569';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(100, 116, 139, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#64748B';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(100, 116, 139, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              onMouseDown={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = '#334155';
                }
              }}
            >
              <span>{submitting ? 'Verifying Admin Authority...' : 'Sign In to Control Center'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Student Link Notice */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748B',
          }}>
            Are you a student or certificate earner?{' '}
            <Link
              to="/login"
              style={{
                color: '#64748B',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Go to Student Portal
            </Link>
          </div>
        </div>

        {/* Security watermark footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '11px',
          color: '#64748B',
          letterSpacing: '0.3px',
        }}>
          🔒 All administrative sessions and operations are audited under ADZ4NEEDZ Governance Standards.
        </div>
      </div>
    </div>
  );
};
