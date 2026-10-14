import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Typography: Outfit (headings), Urbanist (brand), Inter (body/forms)
  const fontOutfit = "'Outfit', sans-serif";
  const fontUrbanist = "'Urbanist', sans-serif";
  const fontInter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const fontHeading = fontOutfit;
  const fontBody = fontInter;
  const fontStack = fontInter;
  const brandFont = fontUrbanist;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 56px',
      boxSizing: 'border-box',
      fontFamily: fontBody,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-8%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(207,222,243,0.6) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Main Split Layout */}
      <div
        style={{
          width: '100%',
          maxWidth: '1160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '60px',
          position: 'relative',
          zIndex: 1,
        }}
        className="login-split-layout"
      >
        {/* LEFT SIDE: Brand & Copy */}
        <div
          style={{
            flex: '1 1 55%',
            maxWidth: '580px',
            color: '#0F172A',
          }}
          className="login-left-content"
        >
          {/* Official SkillCred Branding */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '48px',
          }}>
            <img
              src="/assets/skillcred_logo.png"
              alt="SkillCred Logo"
              style={{
                height: '72px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '42px',
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: '-0.3px',
                lineHeight: 1.1,
                fontFamily: brandFont,
              }}>
                Skill<span style={{ color: '#2563EB' }}>C</span>red
              </span>
              <span style={{
                fontSize: '12.5px',
                fontWeight: '600',
                color: '#334155',
                letterSpacing: '0.8px',
                fontFamily: fontInter,
                marginTop: '5px',
                lineHeight: 1,
              }}>
                By ADZ4NEEDZ
              </span>
            </div>
          </div>

          {/* Main Heading — Matching Pagedone Reference "Hey, Hello!" */}
          <h1 style={{
            fontSize: 'clamp(56px, 6vw, 72px)',
            fontWeight: '700',
            lineHeight: 1.08,
            letterSpacing: '-1.5px',
            margin: '0 0 24px 0',
            color: '#0F172A',
            fontFamily: fontOutfit,
          }}>
            Hey, Hello!
          </h1>

          {/* Supporting Line — Matching reference */}
          <p style={{
            fontSize: '23px',
            fontWeight: '600',
            color: '#1E293B',
            margin: '0 0 20px 0',
            lineHeight: 1.45,
            fontFamily: fontOutfit,
          }}>
            Ready to continue your certified learning?
          </p>

          {/* Description — Matching reference */}
          <p style={{
            fontSize: '16.5px',
            lineHeight: 1.75,
            color: '#334155',
            margin: 0,
            maxWidth: '520px',
            fontWeight: '400',
            fontFamily: fontInter,
          }}>
            Access your course modules, complete practical assessments, and earn credentials verified directly through our registry.
          </p>
        </div>

        {/* RIGHT SIDE: White Login Card */}
        <div
          style={{
            flex: '0 0 520px',
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            border: '1px solid #CFDEF3',
            padding: '52px 48px',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(207, 222, 243, 0.35)',
            boxSizing: 'border-box',
          }}
          className="login-card"
        >
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '30px',
              fontWeight: '700',
              color: '#18181B',
              letterSpacing: '-0.4px',
              margin: '0 0 10px 0',
              fontFamily: fontOutfit,
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '15.5px',
              color: '#71717A',
              margin: 0,
              fontWeight: '400',
              fontFamily: fontInter,
            }}>
              Sign in to continue your course journey.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECDCA',
              color: '#B42318',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '20px',
              fontFamily: fontStack,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Email Label + Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '500',
                color: '#3F3F46',
                marginBottom: '8px',
                fontFamily: fontInter,
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '1.5px solid #CFDEF3',
                  backgroundColor: '#F8FAFD',
                  fontSize: '15px',
                  fontWeight: '400',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  fontFamily: fontInter,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(207, 222, 243, 0.45)';
                  e.target.style.backgroundColor = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CFDEF3';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#F8FAFD';
                }}
              />
            </div>

            {/* Password Label + Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '500',
                color: '#3F3F46',
                marginBottom: '8px',
                fontFamily: fontInter,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 20px',
                    borderRadius: '14px',
                    border: '1.5px solid #CFDEF3',
                    backgroundColor: '#F8FAFD',
                    fontSize: '15px',
                    fontWeight: '400',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    fontFamily: fontInter,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563EB';
                    e.target.style.boxShadow = '0 0 0 3px rgba(207, 222, 243, 0.45)';
                    e.target.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CFDEF3';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = '#F8FAFD';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  color: '#71717A',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: '500',
                  fontFamily: fontInter,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '17px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '6px',
                fontFamily: fontInter,
                letterSpacing: '-0.1px',
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#1D4ED8';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(37, 99, 235, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '15px',
            color: '#71717A',
            fontWeight: '400',
            fontFamily: fontBody,
          }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#2563EB',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #CFDEF3',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.2)',
            fontFamily: fontStack,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#E0EAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <HelpCircle size={18} color="#1E40AF" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginBottom: '20px', fontWeight: '400' }}>
              To safeguard verified student certificates, password resets are processed securely via our academic helpdesk.
            </p>

            <div style={{
              backgroundColor: '#F8FAFD',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #CFDEF3',
              fontSize: '13px',
              color: '#334155',
              marginBottom: '20px',
              lineHeight: 1.65,
            }}>
              <strong>Contact Helpdesk:</strong> support@adz4needz.com<br />
              <strong>Verification:</strong> Please provide your registered student email address.
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontFamily: fontStack,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 960px) {
          .login-split-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 40px !important;
          }
          .login-left-content {
            max-width: 480px !important;
            text-align: center !important;
          }
          .login-left-content > div:first-child {
            justify-content: center !important;
          }
          .login-left-content p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .login-card {
            flex: unset !important;
            max-width: 500px !important;
            padding: 42px 32px !important;
            border-radius: 30px !important;
          }
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px !important;
            border-radius: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};
