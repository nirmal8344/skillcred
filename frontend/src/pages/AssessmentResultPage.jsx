import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../api/client';

export const AssessmentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [issuing, setIssuing] = useState(false);
  const [issuedCert, setIssuedCert] = useState(null);
  const [error, setError] = useState('');
  const [courseAttempts, setCourseAttempts] = useState([]);

  // Payment states
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [utrNumber, setUtrNumber] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrDisplayUrl, setQrDisplayUrl] = useState('');

  const result = location.state?.result;
  const courseId = location.state?.courseId;

  useEffect(() => {
    if (courseId) {
      api.get(`/assessments/course/${courseId}/attempts`)
        .then((data) => setCourseAttempts(data || []))
        .catch(() => {});
      
      checkPaymentStatus();
    }
  }, [courseId]);

  const checkPaymentStatus = async () => {
    setPaymentLoading(true);
    try {
      const [configData, statusData] = await Promise.all([
        api.get('/payments/config').catch(() => null),
        api.get(`/payments/status/${courseId}`).catch(() => null),
      ]);

      setPaymentConfig(configData);
      setPaymentStatus(statusData);

      // Generate dynamic QR code if no custom uploaded QR image
      if (configData) {
        if (configData.qrImageUrl) {
          setQrDisplayUrl(configData.qrImageUrl);
        } else {
          const upiUri = `upi://pay?pa=${encodeURIComponent(configData.upiId || 'adz4needz@okaxis')}&pn=${encodeURIComponent(configData.recipientName || 'ADZ4NEEDZ')}&am=${configData.certificateFee || 99}&cu=INR&tn=${encodeURIComponent('SkillCred Certificate Fee')}`;
          const generatedQr = await QRCode.toDataURL(upiUri, { width: 220, margin: 1 });
          setQrDisplayUrl(generatedQr);
        }
      }
    } catch (err) {
      console.error('Error fetching payment status:', err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Proof image must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert('Please enter your 12-digit UTR or Reference Number');
      return;
    }
    if (!proofImage) {
      alert('Please upload a screenshot of your payment receipt');
      return;
    }

    setSubmittingPayment(true);
    try {
      const resp = await api.post('/payments/submit', {
        courseId: Number(courseId),
        utrNumber: utrNumber.trim(),
        proofImageUrl: proofImage,
        notes: paymentNotes,
      });
      setPaymentStatus(resp);
      alert('Payment submission received! Our admin team will verify it shortly.');
    } catch (err) {
      alert(err.message || 'Failed to submit payment verification request.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleClaimOrViewCertificate = async () => {
    setIssuing(true);
    setError('');
    try {
      if (paymentStatus?.certificateId) {
        navigate(`/certificates/${paymentStatus.certificateId}`);
        return;
      }
      const cert = await api.post('/certificates/issue', { courseId: Number(courseId) });
      setIssuedCert(cert);
      navigate(`/certificates/${cert.certificateId}`);
    } catch (err) {
      setError(err.message || 'Failed to open certificate.');
    } finally {
      setIssuing(false);
    }
  };

  useEffect(() => {
    if (result?.passed) {
      // Fire celebration confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#64748B', '#E0EAFC', '#CFDEF3', '#10B981'],
      });
    }
  }, [result]);

  if (!result) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h3>No recent assessment results found</h3>
        <Link to="/my-learning" className="btn-primary" style={{ marginTop: '16px' }}>
          Back to My Learning
        </Link>
      </div>
    );
  }

  const { score, totalQuestions, percentage, passed, questionsWithFeedback } = result;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F4F8', padding: '36px 20px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Result Card */}
        <div className="skill-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '28px', border: '1px solid #CFDEF3' }}>
          {/* Status Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: passed ? '#ECFDF3' : '#FEF3F2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: passed ? '0 8px 24px rgba(18, 183, 106, 0.2)' : '0 8px 24px rgba(240, 68, 56, 0.2)',
          }}>
            {passed ? (
              <CheckCircle2 size={48} color="#12B76A" />
            ) : (
              <XCircle size={48} color="#F04438" />
            )}
          </div>

          <span className={`badge ${passed ? 'badge-green' : 'badge-pink'}`} style={{ marginBottom: '10px' }}>
            {passed ? 'QUALIFIED FOR CERTIFICATION' : 'ASSESSMENT NOT CLEARED'}
          </span>

          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
            {passed ? 'Congratulations! You Passed!' : 'Keep Practicing & Retake'}
          </h2>

          <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '520px', margin: '0 auto 28px auto', lineHeight: 1.5 }}>
            {passed
              ? 'You have successfully achieved the qualifying standard for this course. Complete the certificate verification to claim your official credential.'
              : 'You did not meet the qualifying standard on this attempt. Review the question explanations below and take the assessment again whenever you are ready.'}
          </p>

          {/* Score breakdown metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            backgroundColor: '#F8FAFD',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid #CFDEF3',
            marginBottom: '32px',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Score</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>
                {score} / {totalQuestions}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Percentage</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: passed ? '#027A48' : '#D92D20' }}>
                {Math.round(percentage)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Assessment Result</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: passed ? '#027A48' : '#D92D20', marginTop: '3px' }}>
                {passed ? 'QUALIFIED' : 'UNSUCCESSFUL'}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: '#D92D20', fontSize: '13px', marginBottom: '16px', backgroundColor: '#FEF3F2', padding: '10px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {/* If NOT passed: Retake button */}
          {!passed && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                onClick={() => navigate(`/assessments/${courseId}`)}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                <RotateCcw size={16} />
                <span>Retake Assessment Now</span>
              </button>
              <button
                onClick={() => navigate('/my-learning')}
                className="btn-secondary"
                style={{ padding: '12px 24px', fontSize: '14px', border: '1px solid #CFDEF3' }}
              >
                <span>Back to Courses</span>
              </button>
            </div>
          )}
        </div>

        {/* ─── PAYMENT & CERTIFICATE WORKFLOW (PASSED STUDENTS ONLY) ─── */}
        {passed && (
          <div className="skill-card" style={{ padding: '36px', marginBottom: '28px', border: '1px solid #CFDEF3' }}>
            {paymentLoading ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                Checking certificate and payment verification status...
              </div>
            ) : paymentStatus?.status === 'APPROVED' ? (
              /* Approved State: Claim / View Certificate */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <ShieldCheck size={36} color="#12B76A" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Payment Verified • Certificate Unlocked!
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                  Your UPI payment has been verified by our administrator. Your official industry certificate is ready for viewing, printing, and sharing.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleClaimOrViewCertificate}
                    disabled={issuing}
                    className="btn-primary"
                    style={{ padding: '12px 32px', fontSize: '15px' }}
                  >
                    <Award size={18} />
                    <span>{issuing ? 'Opening Certificate...' : 'View & Download Official Certificate'}</span>
                  </button>
                  <button
                    onClick={() => navigate('/certificates')}
                    className="btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '14px', border: '1px solid #CFDEF3' }}
                  >
                    All My Certificates
                  </button>
                </div>
              </div>
            ) : paymentStatus?.status === 'PENDING_VERIFICATION' ? (
              /* Pending Admin Verification State */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF4ED',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <RotateCcw size={32} color="#E06D20" className="animate-spin-slow" />
                </div>
                <span className="badge badge-peach" style={{ marginBottom: '12px' }}>
                  UNDER MANUAL VERIFICATION
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Payment Verification Pending
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                  We have received your payment submission with UTR: <strong style={{ color: '#0F172A' }}>{paymentStatus.utrNumber}</strong>. 
                  Our administration team manually verifies all transactions. Your certificate will be unlocked as soon as verified.
                </p>
                
                <div style={{
                  backgroundColor: '#F8FAFD',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #CFDEF3',
                  maxWidth: '420px',
                  margin: '0 auto 24px auto',
                  textAlign: 'left',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Amount:</span>
                    <strong style={{ color: '#0F172A' }}>₹{paymentStatus.amount || 99}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Submitted:</span>
                    <span style={{ color: '#0F172A' }}>{new Date(paymentStatus.submittedAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Status:</span>
                    <strong style={{ color: '#E06D20' }}>Admin Review In Progress</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={checkPaymentStatus}
                    className="btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '13px', border: '1px solid #CFDEF3' }}
                  >
                    <RotateCcw size={14} />
                    <span>Check Verification Status</span>
                  </button>
                  <button
                    onClick={() => navigate('/my-learning')}
                    className="btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '13px', border: '1px solid #CFDEF3' }}
                  >
                    Back to Learning
                  </button>
                </div>
              </div>
            ) : (
              /* Payment Submission Form (New or Resubmission) */
              <div>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
                    OFFICIAL CERTIFICATION FEE
                  </span>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                    Claim Your Verified Certificate
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '500px', margin: '0 auto' }}>
                    Pay the one-time verification fee of ₹{paymentConfig?.certificateFee || 99} via UPI, enter your transaction reference number, and upload proof.
                  </p>
                </div>

                {paymentStatus?.status === 'REJECTED' && (
                  <div style={{
                    backgroundColor: '#FEF3F2',
                    border: '1px solid #FECDCA',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    color: '#B42318',
                    fontSize: '13px',
                  }}>
                    <strong>Previous submission was not approved:</strong> {paymentStatus.rejectionReason || 'UTR could not be verified'}.
                    Please re-verify your transaction details and re-submit.
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  alignItems: 'start',
                }}>
                  {/* Left: Payment QR & Details */}
                  <div style={{
                    backgroundColor: '#F8FAFD',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #CFDEF3',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
                      Scan QR with Any UPI App
                    </div>

                    <div style={{
                      backgroundColor: '#FFFFFF',
                      padding: '12px',
                      borderRadius: '14px',
                      display: 'inline-block',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      marginBottom: '16px',
                      border: '1px solid #E2E8F0',
                    }}>
                      {qrDisplayUrl ? (
                        <img
                          src={qrDisplayUrl}
                          alt="UPI Payment QR"
                          style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '12px' }}>
                          Generating QR...
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>UPI ID</div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                            {paymentConfig?.upiId || 'adz4needz@okaxis'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(paymentConfig?.upiId || 'adz4needz@okaxis')}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#E0EAFC',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#334155',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedUpi ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>Payee Name</div>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>
                          {paymentConfig?.recipientName || 'ADZ4NEEDZ (OPC) PRIVATE LIMITED'}
                        </div>
                      </div>

                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#ECFDF3',
                        borderRadius: '10px',
                        border: '1px solid #A6F4C5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#027A48' }}>Payable Amount</span>
                        <strong style={{ fontSize: '16px', color: '#027A48' }}>₹{paymentConfig?.certificateFee || 99}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Submission Form */}
                  <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                        12-Digit UPI / UTR Reference Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 428190382910"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                        maxLength={20}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #CFDEF3',
                          fontSize: '14px',
                          fontWeight: '600',
                          letterSpacing: '1px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                        Found in your GPay / PhonePe / Paytm transaction receipt
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                        Upload Payment Screenshot *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required={!proofImage}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '10px',
                          border: '1px solid #CFDEF3',
                          fontSize: '12px',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                      {proofImage && (
                        <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                          <img
                            src={proofImage}
                            alt="Payment Receipt Preview"
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #CFDEF3',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setProofImage('')}
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              background: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                        Notes / Remarks (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paid from HDFC account"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #CFDEF3',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingPayment || !utrNumber.trim()}
                      className="btn-primary"
                      style={{ padding: '14px', fontSize: '15px', marginTop: '8px' }}
                    >
                      <ShieldCheck size={18} />
                      <span>{submittingPayment ? 'Submitting Verification...' : 'Submit Verification Request'}</span>
                    </button>

                    <p style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', margin: 0 }}>
                      ⚡ Admin verifies within a few hours. Once verified, download and print your official certificate anytime.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Question Explanations */}
        {questionsWithFeedback && questionsWithFeedback.length > 0 && (
          <div className="skill-card" style={{ padding: '32px', border: '1px solid #CFDEF3' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
              Question Review & Explanations
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questionsWithFeedback.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: q.isCorrect ? '#F6FEF9' : '#FFFBFA',
                    border: '1px solid',
                    borderColor: q.isCorrect ? '#D1FADF' : '#FEE4E2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {q.isCorrect ? (
                      <CheckCircle2 size={16} color="#12B76A" />
                    ) : (
                      <XCircle size={16} color="#F04438" />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                      Question {idx + 1}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#334155', marginBottom: '8px', lineHeight: 1.4 }}>
                    {q.questionText}
                  </p>

                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                    <strong>Your Choice:</strong> {q.submittedAnswer || 'Not Answered'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#027A48', marginBottom: '8px' }}>
                    <strong>Correct Answer:</strong> {q.correctAnswer}
                  </div>

                  {q.explanation && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#334155',
                      fontStyle: 'italic',
                    }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Attempts History for this Course */}
        {courseAttempts && courseAttempts.length > 0 && (
          <div className="skill-card" style={{ padding: '28px', marginTop: '24px', border: '1px solid #CFDEF3' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              Attempt History for this Course
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFD', borderBottom: '1px solid #CFDEF3' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Attempt</th>
                    <th style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Score</th>
                    <th style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Percentage</th>
                    <th style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Result</th>
                    <th style={{ padding: '10px 14px', fontWeight: '700', color: '#334155' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {courseAttempts.map((att, index) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0F172A' }}>
                        Attempt #{courseAttempts.length - index}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#334155' }}>
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: att.passed ? '#059669' : '#DC2626' }}>
                        {Math.round(att.percentage)}%
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: att.passed ? '#DCFCE7' : '#FEE2E2',
                          color: att.passed ? '#15803D' : '#B91C1C',
                        }}>
                          {att.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748B' }}>
                        {att.attemptedAt ? new Date(att.attemptedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
