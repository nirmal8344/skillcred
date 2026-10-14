import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Download, 
  Share2, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Printer, 
  Copy, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';

export const CertificateViewPage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const certRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const data = await api.get(`/certificates/${certificateId}`);
        setCert(data);

        // Generate QR code for verification URL
        const verifyUrl = `${window.location.origin}/verify/${data.certificateId}`;
        const qrUrl = await QRCode.toDataURL(verifyUrl, {
          width: 140,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(qrUrl);
      } catch (err) {
        console.error('Failed to load certificate:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownloadPDF = async () => {
    if (!certRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = certRef.current;
      // Capture canvas with 3x scale for ultra-crisp HD print quality
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      // A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SkillCred_${cert.certificateId}_${cert.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!certRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `SkillCred_${cert.certificateId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading PNG:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    const verifyUrl = `${window.location.origin}/verify/${cert.certificateId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || !cert) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Rendering high-definition certificate...</div>;
  }

  const formattedDate = cert.issueDate 
    ? new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'October 12, 2026';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F0F4F8', padding: '24px 20px 48px 20px' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
        {/* Navigation & Controls Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <button
            onClick={() => navigate('/certificates')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              color: '#2563EB',
              fontSize: '13px',
              fontWeight: '700',
              padding: '6px 0',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Credentials</span>
          </button>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleCopyLink}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {copied ? <Check size={14} color="#12B76A" /> : <Copy size={14} />}
              <span>{copied ? 'Link Copied!' : 'Copy Verify URL'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Download size={14} />
              <span>PNG Image</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              <Printer size={15} />
              <span>{downloading ? 'Preparing HD PDF...' : 'Download HD PDF'}</span>
            </button>
          </div>
        </div>

        {/* Certificate Display Outer Wrapper */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 12px 40px rgba(207, 222, 243, 0.35)',
          border: '1px solid #CFDEF3',
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}>
          {/* Official Certificate Canvas Container (1024px x 768px matching official template) */}
          <div
            ref={certRef}
            id="certificate-canvas"
            style={{
              width: '1024px',
              height: '768px',
              position: 'relative',
              backgroundImage: 'url(/assets/certificate_template.png)',
              backgroundSize: '1024px 768px',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {/* Dynamic Recipient Name Overlay — positioned between presentation header and gold diamond divider */}
            <div style={{
              position: 'absolute',
              top: '312px',
              left: '100px',
              right: '100px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: (cert.studentName?.length || 0) > 28 ? '28px' : (cert.studentName?.length || 0) > 20 ? '32px' : '38px',
                fontWeight: '700',
                color: '#0F172A',
                letterSpacing: '0.5px',
                textTransform: 'capitalize',
                lineHeight: 1.15,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}>
                {cert.studentName}
              </div>
            </div>

            {/* Dynamic Course Title Overlay — positioned directly below template text 'for successfully completing the assessment for the' */}
            <div style={{
              position: 'absolute',
              top: '422px',
              left: '120px',
              right: '120px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: (cert.courseTitle?.length || 0) > 35 ? '16px' : (cert.courseTitle?.length || 0) > 24 ? '18px' : '20px',
                fontWeight: '800',
                color: '#1E40AF',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}>
                {cert.courseTitle}
              </div>
            </div>

            {/* Dynamic Completion Date — placed directly onto the template's 'Date of Completion: ________' blank line */}
            <div style={{
              position: 'absolute',
              top: '488px',
              left: '505px',
              width: '185px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#0F172A',
                letterSpacing: '0.2px',
              }}>
                {formattedDate}
              </div>
            </div>

            {/* Dynamic Verification QR Code & Certificate ID — positioned in top-right clean space */}
            <div style={{
              position: 'absolute',
              top: '65px',
              right: '65px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 10px',
              borderRadius: '10px',
              border: '1px solid #CFDEF3',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Verification QR Code"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '4px',
                    display: 'block',
                  }}
                />
              )}
              <div style={{
                fontFamily: "'Plus Jakarta Sans', monospace",
                fontSize: '9.5px',
                fontWeight: '800',
                color: '#1E40AF',
                letterSpacing: '0.4px',
                marginTop: '2px',
              }}>
                ID: {cert.certificateId}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '8.5px',
                fontWeight: '700',
                color: '#027A48',
              }}>
                <ShieldCheck size={11} color="#12B76A" />
                <span>VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Info Footer */}
        <div style={{
          marginTop: '24px',
          padding: '18px 24px',
          borderRadius: '16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CFDEF3',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
              Public Verification Record Available
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Anyone scanning the QR code or visiting the URL can authenticate this credential directly against the Adz4needz registry.
            </div>
          </div>

          <a
            href={`/verify/${cert.certificateId}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#2563EB',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Open Public Verification Page</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
