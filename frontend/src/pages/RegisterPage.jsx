import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Briefcase, 
  Award, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  AlertCircle, 
  Check, 
  Building, 
  Book, 
  Eye, 
  EyeOff,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Typography definitions matching approved LoginPage
const fontOutfit = "'Outfit', sans-serif";
const fontUrbanist = "'Urbanist', sans-serif";
const fontInter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const fontHeading = fontOutfit;
const fontBody = fontInter;
const brandFont = fontUrbanist;

// Reusable input styling tokens matching LoginPage
const inputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  backgroundColor: '#F8FAFD',
  border: '1.5px solid #CFDEF3',
  borderRadius: '14px',
  padding: '13px 16px',
  transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
  boxSizing: 'border-box',
};

const inputStyle = {
  border: 'none',
  background: 'transparent',
  width: '100%',
  fontSize: '14.5px',
  fontWeight: '400',
  color: '#0F172A',
  outline: 'none',
  fontFamily: fontInter,
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#334155',
  marginBottom: '7px',
  fontFamily: fontInter,
};

const iconColor = '#64748B';

// Category definitions
const categories = [
  {
    id: 'College Student',
    title: 'College Student',
    subtitle: 'Currently pursuing an undergraduate, postgraduate, or diploma degree',
    icon: GraduationCap,
    color: '#2563EB',
    bg: '#E0EAFC',
  },
  {
    id: 'Graduate',
    title: 'Graduate',
    subtitle: 'Recently completed studies and preparing for placements or industry roles',
    icon: Award,
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    id: 'Working Professional',
    title: 'Working Professional',
    subtitle: 'Currently employed and upskilling or transitioning career domains',
    icon: Briefcase,
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    id: 'Other Learner',
    title: 'Other Learner',
    subtitle: 'Freelancer, self-taught enthusiast, or career explorer',
    icon: BookOpen,
    color: '#1E40AF',
    bg: '#CFDEF3',
  },
];

// Stable Step Indicator defined at module-level to prevent re-mounting
const StepIndicator = ({ step }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '26px',
  }}>
    {[
      { num: 1, label: 'Personal Info' },
      { num: 2, label: 'Category' },
      { num: 3, label: 'Details' }
    ].map((item, idx) => (
      <React.Fragment key={item.num}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: step >= item.num ? '#0F172A' : '#64748B',
          fontWeight: step === item.num ? '600' : '500',
          fontSize: '12.5px',
          fontFamily: fontInter,
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: step > item.num ? '#10B981' : step === item.num ? '#2563EB' : '#F0F4FA',
            color: step >= item.num ? '#FFFFFF' : '#64748B',
            border: step >= item.num ? 'none' : '1.5px solid #CFDEF3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '700',
            transition: 'all 0.25s ease',
          }}>
            {step > item.num ? <Check size={14} strokeWidth={2.5} /> : item.num}
          </div>
          <span style={{ letterSpacing: '-0.1px' }}>
            {item.label}
          </span>
        </div>
        {idx < 2 && (
          <div style={{
            width: '24px',
            height: '2px',
            borderRadius: '1px',
            backgroundColor: step > item.num ? '#10B981' : '#CFDEF3',
            transition: 'background-color 0.25s ease',
          }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Stable FormField wrapper defined outside RegisterPage so inputs never lose focus during keystrokes
const FormField = ({ label, hint, icon: Icon, children, required }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <label style={labelStyle}>
        {label}{required && ' *'}
      </label>
      {hint && (
        <span style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: '500', fontFamily: fontInter }}>
          {hint}
        </span>
      )}
    </div>
    <div
      data-input-wrapper
      style={inputWrapperStyle}
    >
      {Icon && <Icon size={16} color={iconColor} style={{ flexShrink: 0 }} />}
      {children}
    </div>
  </div>
);

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Step state: 1 = Basic Info, 2 = Category Select, 3 = Category Fields
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    certificateDisplayName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    learnerCategory: '', // 'College Student', 'Graduate', 'Working Professional', 'Other Learner'
    // College Student & Graduate
    collegeName: '',
    degreeCourse: '',
    department: '',
    currentYearOfStudy: '3rd Year',
    graduationYear: '2025',
    // Working Professional
    jobRole: '',
    companyName: '',
    industry: '',
    // Other Learner
    qualification: '',
    learningGoal: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'fullName' && !prev.certificateDisplayName) {
        next.certificateDisplayName = value;
      }
      return next;
    });
  };

  // Input focus handler for border/shadow matching LoginPage
  const handleInputFocus = (e) => {
    const wrapper = e.target.closest('[data-input-wrapper]');
    if (wrapper) {
      wrapper.style.borderColor = '#2563EB';
      wrapper.style.boxShadow = '0 0 0 3px rgba(207, 222, 243, 0.45)';
      wrapper.style.backgroundColor = '#FFFFFF';
    }
  };

  const handleInputBlur = (e) => {
    const wrapper = e.target.closest('[data-input-wrapper]');
    if (wrapper) {
      wrapper.style.borderColor = '#CFDEF3';
      wrapper.style.boxShadow = 'none';
      wrapper.style.backgroundColor = '#F8FAFD';
    }
  };

  // Step 1 Validation
  const handleProceedToCategory = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanMobile = formData.mobileNumber.replace(/[^0-9]/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please enter a valid mobile number with at least 10 digits.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setStep(2);
  };

  // Step 2 Selection
  const handleSelectCategory = (cat) => {
    setFormData((prev) => ({ ...prev, learnerCategory: cat }));
    setError('');
    setStep(3);
  };

  // Step 3 Submission
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError('');

    const cat = formData.learnerCategory;
    if (cat === 'College Student') {
      if (!formData.collegeName.trim()) {
        setError('Please enter your college name.');
        return;
      }
      if (!formData.degreeCourse.trim()) {
        setError('Please enter your degree or course.');
        return;
      }
      if (!formData.department.trim()) {
        setError('Please enter your department or major.');
        return;
      }
    } else if (cat === 'Graduate') {
      if (!formData.collegeName.trim()) {
        setError('Please enter your graduated college name.');
        return;
      }
      if (!formData.degreeCourse.trim()) {
        setError('Please enter your degree or course.');
        return;
      }
      if (!formData.department.trim()) {
        setError('Please enter your department.');
        return;
      }
      if (!formData.graduationYear.trim()) {
        setError('Please specify your graduation year.');
        return;
      }
    } else if (cat === 'Working Professional') {
      if (!formData.jobRole.trim()) {
        setError('Please specify your current job role or designation.');
        return;
      }
    } else if (cat === 'Other Learner') {
      if (!formData.learningGoal.trim()) {
        setError('Please specify your primary learning goal.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Subtle background decoration with reduced brightness & glow */}
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
          maxWidth: '1180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '56px',
          position: 'relative',
          zIndex: 1,
        }}
        className="register-split-layout"
      >
        {/* LEFT SIDE: Brand & Copy */}
        <div
          style={{
            flex: '1 1 50%',
            maxWidth: '540px',
            color: '#0F172A',
          }}
          className="register-left-content"
        >
          {/* Official SkillCred Branding */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '44px',
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
                SkillCred
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
                By ADZ<span style={{ color: '#2563EB', fontWeight: '800' }}>4</span>NEEDZ
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: 'clamp(42px, 5vw, 56px)',
            fontWeight: '700',
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            margin: '0 0 20px 0',
            color: '#0F172A',
            fontFamily: fontOutfit,
          }}>
            Learn New Skills. Earn Your Certificate.
          </h1>

          {/* Supporting Line */}
          <p style={{
            fontSize: '21px',
            fontWeight: '600',
            color: '#1E293B',
            margin: '0 0 16px 0',
            lineHeight: 1.45,
            fontFamily: fontOutfit,
          }}>
            Learn at your own pace and prove what you know.
          </p>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            lineHeight: 1.75,
            color: '#334155',
            margin: '0 0 32px 0',
            maxWidth: '500px',
            fontWeight: '400',
            fontFamily: fontInter,
          }}>
            Choose a course, complete the lessons, and take the assessment. Pass the test to earn your course completion certificate.
          </p>

          {/* Feature Highlights on Left Panel */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            maxWidth: '480px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CFDEF3',
                boxShadow: '0 2px 8px rgba(207, 222, 243, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <BookOpen size={18} color="#2563EB" />
              </div>
              <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: '500', fontFamily: fontInter }}>
                Learn through structured courses
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CFDEF3',
                boxShadow: '0 2px 8px rgba(207, 222, 243, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Award size={18} color="#2563EB" />
              </div>
              <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: '500', fontFamily: fontInter }}>
                Test your knowledge with assessments
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CFDEF3',
                boxShadow: '0 2px 8px rgba(207, 222, 243, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ShieldCheck size={18} color="#2563EB" />
              </div>
              <span style={{ fontSize: '15px', color: '#1E293B', fontWeight: '500', fontFamily: fontInter }}>
                Earn a certificate you can verify online
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: White Registration Card */}
        <div
          style={{
            flex: step === 2 ? '0 0 570px' : '0 0 530px',
            width: '100%',
            maxWidth: step === 2 ? '570px' : '530px',
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            border: '1px solid #CFDEF3',
            padding: '44px 40px',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(207, 222, 243, 0.35)',
            boxSizing: 'border-box',
            transition: 'max-width 0.25s ease, flex-basis 0.25s ease',
          }}
          className="register-card"
        >
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#18181B',
              letterSpacing: '-0.4px',
              margin: '0 0 8px 0',
              fontFamily: fontOutfit,
            }}>
              Create your Account
            </h2>
            <p style={{
              fontSize: '14.5px',
              color: '#71717A',
              margin: 0,
              fontWeight: '400',
              fontFamily: fontInter,
            }}>
              {step === 1 && 'Enter your personal details to get started'}
              {step === 2 && 'Select your learner category to customize your pathway'}
              {step === 3 && 'Complete your profile details to finish setup'}
            </p>
          </div>

          <StepIndicator step={step} />

          {/* Error Banner */}
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
              fontSize: '13.5px',
              fontWeight: '500',
              marginBottom: '20px',
              fontFamily: fontInter,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <form onSubmit={handleProceedToCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FormField label="Full Name" icon={User} required>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="e.g. Gowtham Ramesh"
                  required
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Certificate Display Name" hint="Printed on credentials" icon={Award}>
                <input
                  type="text"
                  name="certificateDisplayName"
                  id="certificateDisplayName"
                  value={formData.certificateDisplayName}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Exact name to print on certificates"
                  style={inputStyle}
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="register-grid-row">
                <FormField label="Email Address" icon={Mail} required>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    style={{ ...inputStyle, fontSize: '13.5px' }}
                  />
                </FormField>

                <FormField label="Mobile Number" icon={Phone} required>
                  <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="e.g. 9876543210"
                    autoComplete="tel"
                    required
                    style={{ ...inputStyle, fontSize: '13.5px' }}
                  />
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="register-grid-row">
                <div>
                  <label style={labelStyle}>Password *</label>
                  <div data-input-wrapper style={{ ...inputWrapperStyle, gap: '8px' }}>
                    <Lock size={15} color={iconColor} style={{ flexShrink: 0 }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      style={{ ...inputStyle, fontSize: '13.5px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: iconColor, padding: 0, display: 'flex', alignItems: 'center' }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Confirm Password *</label>
                  <div data-input-wrapper style={{ ...inputWrapperStyle, gap: '8px' }}>
                    <Lock size={15} color={iconColor} style={{ flexShrink: 0 }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      style={{ ...inputStyle, fontSize: '13.5px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: iconColor, padding: 0, display: 'flex', alignItems: 'center' }}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontSize: '15.5px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s ease',
                  marginTop: '8px',
                  fontFamily: fontInter,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '-0.1px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1D4ED8';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(37, 99, 235, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Continue to Category</span>
                <ArrowRight size={17} />
              </button>
            </form>
          )}

          {/* STEP 2: Category Selection */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#0F172A',
                  margin: '0 0 5px 0',
                  letterSpacing: '-0.2px',
                  fontFamily: fontOutfit,
                }}>
                  Which best describes you?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: '400', fontFamily: fontInter }}>
                  Select your profile to customize your certification pathway
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '24px' }} className="register-cat-grid">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.learnerCategory === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      style={{
                        padding: '18px',
                        borderRadius: '16px',
                        border: '2px solid',
                        borderColor: isSelected ? '#2563EB' : '#CFDEF3',
                        backgroundColor: isSelected ? '#E0EAFC' : '#F8FAFD',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected ? '0 4px 16px rgba(207, 222, 243, 0.4)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#2563EB';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#CFDEF3';
                          e.currentTarget.style.backgroundColor = '#F8FAFD';
                        }
                      }}
                    >
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: cat.bg,
                            color: cat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icon size={20} />
                          </div>

                          {isSelected && (
                            <div style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>

                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#0F172A',
                          margin: '0 0 4px 0',
                          letterSpacing: '-0.2px',
                          fontFamily: fontInter,
                        }}>
                          {cat.title}
                        </h4>
                        <p style={{
                          fontSize: '12px',
                          color: '#64748B',
                          margin: 0,
                          lineHeight: 1.45,
                          fontWeight: '400',
                          fontFamily: fontInter,
                        }}>
                          {cat.subtitle}
                        </p>
                      </div>

                      <div style={{
                        marginTop: '14px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isSelected ? '#1E40AF' : '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: fontInter,
                      }}>
                        <span>Select category</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: '#FFFFFF',
                    color: '#334155',
                    border: '1.5px solid #CFDEF3',
                    padding: '11px 18px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: fontInter,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E0EAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  <ArrowLeft size={15} />
                  <span>Back to Personal Info</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Category-Specific Fields */}
          {step === 3 && (
            <form onSubmit={handleSubmitRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: '#E0EAFC',
                border: '1px solid #CFDEF3',
                marginBottom: '4px',
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px', fontFamily: fontInter }}>Selected Profile</span>
                  <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#1E40AF', letterSpacing: '-0.2px', fontFamily: fontInter }}>{formData.learnerCategory}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontFamily: fontInter,
                  }}
                >
                  Change
                </button>
              </div>

              {/* COLLEGE STUDENT FIELDS */}
              {formData.learnerCategory === 'College Student' && (
                <>
                  <FormField label="College / University Name" icon={Building} required>
                    <input type="text" name="collegeName" id="collegeName" value={formData.collegeName} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Anna University / PSG Tech" required style={inputStyle} />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }} className="register-grid-row">
                    <FormField label="Degree / Course" icon={Book} required>
                      <input type="text" name="degreeCourse" id="degreeCourse" value={formData.degreeCourse} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. B.Tech / B.E / B.Sc" required style={inputStyle} />
                    </FormField>

                    <div>
                      <label style={labelStyle}>Current Year *</label>
                      <select
                        name="currentYearOfStudy"
                        id="currentYearOfStudy"
                        value={formData.currentYearOfStudy}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          backgroundColor: '#F8FAFD',
                          border: '1.5px solid #CFDEF3',
                          borderRadius: '14px',
                          padding: '13px 14px',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          fontWeight: '500',
                          fontFamily: fontInter,
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#2563EB'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#CFDEF3'; }}
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Final Year">Final Year</option>
                      </select>
                    </div>
                  </div>

                  <FormField label="Department / Major" icon={BookOpen} required>
                    <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Computer Science, IT, Mechanical" required style={inputStyle} />
                  </FormField>
                </>
              )}

              {/* GRADUATE FIELDS */}
              {formData.learnerCategory === 'Graduate' && (
                <>
                  <FormField label="Graduated College / University" icon={Building} required>
                    <input type="text" name="collegeName" id="collegeName" value={formData.collegeName} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="College graduated from" required style={inputStyle} />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }} className="register-grid-row">
                    <FormField label="Degree / Course" icon={Book} required>
                      <input type="text" name="degreeCourse" id="degreeCourse" value={formData.degreeCourse} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. B.E, MCA, B.Com" required style={inputStyle} />
                    </FormField>

                    <div>
                      <label style={labelStyle}>Graduation Year *</label>
                      <select
                        name="graduationYear"
                        id="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          backgroundColor: '#F8FAFD',
                          border: '1.5px solid #CFDEF3',
                          borderRadius: '14px',
                          padding: '13px 14px',
                          fontSize: '13.5px',
                          color: '#0F172A',
                          fontWeight: '500',
                          fontFamily: fontInter,
                          outline: 'none',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#2563EB'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#CFDEF3'; }}
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="Earlier">Earlier</option>
                      </select>
                    </div>
                  </div>

                  <FormField label="Department / Specialization" icon={BookOpen} required>
                    <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Electrical Engineering" required style={inputStyle} />
                  </FormField>
                </>
              )}

              {/* WORKING PROFESSIONAL FIELDS */}
              {formData.learnerCategory === 'Working Professional' && (
                <>
                  <FormField label="Current Job Role / Designation" icon={Briefcase} required>
                    <input type="text" name="jobRole" id="jobRole" value={formData.jobRole} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Junior Developer, Marketing Specialist" required style={inputStyle} />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="register-grid-row">
                    <FormField label="Company Name" icon={Building}>
                      <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="Current company" style={inputStyle} />
                    </FormField>

                    <FormField label="Industry" icon={Sparkles}>
                      <input type="text" name="industry" id="industry" value={formData.industry} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Tech, FinTech, Media" style={inputStyle} />
                    </FormField>
                  </div>
                </>
              )}

              {/* OTHER LEARNER FIELDS */}
              {formData.learnerCategory === 'Other Learner' && (
                <>
                  <FormField label="Current Qualification" icon={Award}>
                    <input type="text" name="qualification" id="qualification" value={formData.qualification} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Higher Secondary, Bachelor's, Self-Taught" style={inputStyle} />
                  </FormField>

                  <FormField label="Primary Learning Goal" icon={BookOpen} required>
                    <input type="text" name="learningGoal" id="learningGoal" value={formData.learningGoal} onChange={handleChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="e.g. Upskilling for job, Career change" required style={inputStyle} />
                  </FormField>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    background: '#FFFFFF',
                    color: '#334155',
                    border: '1.5px solid #CFDEF3',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: fontInter,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E0EAFC'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: '15px 24px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    fontSize: '15.5px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1,
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s ease',
                    fontFamily: fontInter,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
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
                  <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}

          {/* Footer link matching LoginPage */}
          <div style={{
            textAlign: 'center',
            marginTop: '28px',
            fontSize: '14.5px',
            color: '#71717A',
            fontWeight: '400',
            fontFamily: fontInter,
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#2563EB',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive Styles matching LoginPage */}
      <style>{`
        [data-input-wrapper]:focus-within {
          border-color: #2563EB !important;
          box-shadow: 0 0 0 3px rgba(207, 222, 243, 0.45) !important;
          background-color: #FFFFFF !important;
        }
        @media (max-width: 960px) {
          .register-split-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 40px !important;
          }
          .register-left-content {
            max-width: 500px !important;
            text-align: center !important;
          }
          .register-left-content > div:first-child {
            justify-content: center !important;
          }
          .register-left-content p {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .register-card {
            flex: unset !important;
            max-width: 520px !important;
            padding: 38px 28px !important;
            border-radius: 28px !important;
          }
        }
        @media (max-width: 560px) {
          .register-grid-row {
            grid-template-columns: 1fr !important;
          }
          .register-cat-grid {
            grid-template-columns: 1fr !important;
          }
          .register-card {
            padding: 30px 20px !important;
            border-radius: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};
