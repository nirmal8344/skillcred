import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Clock,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  Eye,
  X,
  Check,
  Copy,
  RotateCcw,
  FileText,
  Layers,
  Settings,
  CreditCard,
  Database,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Code,
  Image,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';

/* ───────── Typography Tokens ───────── */
const heading = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

/* ───────── Modal Portal (Direct Viewport Mount) ───────── */
const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

export const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || outletContext?.currentTab || 'overview';

  const [loading, setLoading] = useState(true);

  // Stats & Data States
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);

  // Payment Verification Tab States
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED'
  const [selectedProofImg, setSelectedProofImg] = useState(null);
  const [rejectModalPayment, setRejectModalPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Payment Settings Tab States
  const [configForm, setConfigForm] = useState({
    upiId: '',
    paymentNumber: '',
    recipientName: '',
    certificateFee: 99,
    enabled: true,
    instructions: '',
    qrImageUrl: '',
  });
  const [previewQr, setPreviewQr] = useState('');

  // Changeable UPI QR Code Modal States
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState({
    qrImage: '',
    upiId: '',
    recipientName: '',
    useCustom: false,
  });
  const [qrModalSaving, setQrModalSaving] = useState(false);
  const [qrModalError, setQrModalError] = useState('');

  // Course Management States
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [courseDeleteConfirm, setCourseDeleteConfirm] = useState(null);
  const [courseActionLoading, setCourseActionLoading] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'Technology',
    description: '',
    duration: 'Self-Paced',
    published: true,
    timeLimitMinutes: 40,
    passPercentage: 60,
  });

  // Question Bank States
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseQuestions, setCourseQuestions] = useState([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [questionDeleteConfirm, setQuestionDeleteConfirm] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'MCQ', // 'MCQ' | 'CODING'
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    codeSnippet: '',
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  // Certificate Template States
  const [isTemplateUploadModalOpen, setIsTemplateUploadModalOpen] = useState(false);
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreview, setTemplatePreview] = useState('');
  const [templateUploadLoading, setTemplateUploadLoading] = useState(false);
  const [templateUploadError, setTemplateUploadError] = useState('');
  const [templateKey, setTemplateKey] = useState(Date.now());

  // Student Audit Modal State
  const [selectedStudentAudit, setSelectedStudentAudit] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);

  // Audit Tab Filter State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterResult, setAuditFilterResult] = useState('ALL'); // 'ALL' | 'PASSED' | 'FAILED'

  // Revoke state
  const [revoking, setRevoking] = useState(null);

  // Student Export States
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Automatically lock background scrolling whenever any admin modal is active
  const isAnyModalActive = Boolean(
    selectedProofImg ||
    rejectModalPayment ||
    isCourseModalOpen ||
    viewingCourse ||
    courseDeleteConfirm ||
    isAddQuestionModalOpen ||
    questionDeleteConfirm ||
    isTemplateUploadModalOpen ||
    isImportModalOpen ||
    selectedStudentAudit
  );

  useEffect(() => {
    if (isAnyModalActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalActive]);

  useEffect(() => {
    fetchInitialAdminData();
  }, []);

  const fetchInitialAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, studentsData, certsData, paymentsData, configData, coursesData] = await Promise.all([
        api.get('/admin/stats').catch(() => null),
        api.get('/admin/students').catch(() => []),
        api.get('/admin/certificates').catch(() => []),
        api.get('/admin/payments').catch(() => []),
        api.get('/admin/payments/config').catch(() => null),
        api.get('/admin/courses').catch(() => []),
      ]);

      setStats(statsData);
      setStudents(studentsData || []);
      setCertificates(certsData || []);
      setPayments(paymentsData || []);
      setCourses(coursesData || []);

      if (coursesData && coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0].id);
      }

      if (configData) {
        setPaymentConfig(configData);
        setConfigForm({
          upiId: configData.upiId || 'adz4needz@okaxis',
          paymentNumber: configData.paymentNumber || '+91 9876543210',
          recipientName: configData.recipientName || 'ADZ4NEEDZ (OPC) PRIVATE LIMITED',
          certificateFee: configData.certificateFee || 99,
          enabled: configData.enabled !== false,
          instructions: configData.instructions || '',
          qrImageUrl: configData.qrImageUrl || '',
        });
        updatePreviewQr(configData.upiId, configData.recipientName, configData.certificateFee, configData.qrImageUrl);
      }

      // Fetch all attempts for audit reports
      fetchAllStudentAttempts(studentsData || []);
    } catch (err) {
      console.error('Failed to load initial admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudentAttempts = async (studentsList) => {
    try {
      const all = [];
      for (const s of studentsList) {
        try {
          const detail = await api.get(`/admin/students/${s.id}`);
          if (detail?.attempts) {
            detail.attempts.forEach(att => {
              all.push({
                ...att,
                studentId: s.id,
                studentName: s.fullName,
                studentEmail: s.email,
              });
            });
          }
        } catch (_) {}
      }
      all.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
      setAllAttempts(all);
    } catch (e) {
      console.error('Error fetching attempts:', e);
    }
  };

  const updatePreviewQr = async (upiId, name, fee, customQr) => {
    if (customQr) {
      setPreviewQr(customQr);
    } else {
      try {
        const uri = `upi://pay?pa=${encodeURIComponent(upiId || 'adz4needz@okaxis')}&pn=${encodeURIComponent(name || 'ADZ4NEEDZ')}&am=${fee || 99}&cu=INR&tn=${encodeURIComponent('SkillCred Fee')}`;
        const dataUrl = await QRCode.toDataURL(uri, { width: 180, margin: 1 });
        setPreviewQr(dataUrl);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // ─── Question Fetching ──────────────────────────────
  useEffect(() => {
    if (selectedCourseId && activeTab === 'questions') {
      fetchCourseQuestions(selectedCourseId);
    }
  }, [selectedCourseId, activeTab]);

  const fetchCourseQuestions = async (courseId) => {
    setQuestionsLoading(true);
    try {
      const data = await api.get(`/admin/courses/${courseId}/questions`);
      setCourseQuestions(data || []);
    } catch (err) {
      console.error('Failed to load course questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // ─── Payment Approval & Rejection ───────────────────
  const handleApprovePayment = async (paymentId) => {
    if (!window.confirm('Approve this payment and unlock the official certificate for the student?')) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/payments/${paymentId}/approve`);
      alert('Payment approved successfully! Official certificate has been issued.');
      const [updatedPayments, updatedStats, updatedCerts] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/stats'),
        api.get('/admin/certificates'),
      ]);
      setPayments(updatedPayments || []);
      setStats(updatedStats);
      setCertificates(updatedCerts || []);
      outletContext?.refreshPendingCount?.();
    } catch (err) {
      alert(err.message || 'Failed to approve payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (payment) => {
    setRejectModalPayment(payment);
    setRejectReason('UTR reference number not found or transaction amount mismatch.');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalPayment) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/payments/${rejectModalPayment.id}/reject`, { reason: rejectReason });
      alert('Payment submission rejected.');
      setRejectModalPayment(null);
      const [updatedPayments, updatedStats] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/stats'),
      ]);
      setPayments(updatedPayments || []);
      setStats(updatedStats);
      outletContext?.refreshPendingCount?.();
    } catch (err) {
      alert(err.message || 'Failed to reject payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Payment Settings Save ──────────────────────────
  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      const updated = await api.put('/admin/payments/config', configForm);
      setPaymentConfig(updated);
      alert('Payment settings updated successfully!');
      updatePreviewQr(updated.upiId, updated.recipientName, updated.certificateFee, updated.qrImageUrl);
    } catch (err) {
      alert(err.message || 'Failed to update payment settings.');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleOpenQrModal = () => {
    setQrModalData({
      qrImage: configForm.qrImageUrl || '',
      upiId: configForm.upiId || 'adz4needz@okaxis',
      recipientName: configForm.recipientName || 'ADZ4NEEDZ (OPC) PRIVATE LIMITED',
      useCustom: !!configForm.qrImageUrl,
    });
    setQrModalError('');
    setIsQrModalOpen(true);
  };

  const handleQrModalFileUpload = (e) => {
    setQrModalError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setQrModalError('Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP, or SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setQrModalError('Image file size exceeds the 5MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrModalData(prev => ({
        ...prev,
        qrImage: reader.result,
        useCustom: true,
      }));
    };
    reader.onerror = () => {
      setQrModalError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQrModal = async () => {
    if (!qrModalData.upiId.trim()) {
      setQrModalError('Please enter a valid receiving UPI ID (VPA).');
      return;
    }
    setQrModalSaving(true);
    setQrModalError('');
    try {
      const payload = {
        ...configForm,
        qrImageUrl: qrModalData.useCustom ? qrModalData.qrImage : '',
        upiId: qrModalData.upiId.trim(),
        recipientName: qrModalData.recipientName.trim() || configForm.recipientName,
      };

      const updated = await api.put('/admin/payments/config', payload);
      setPaymentConfig(updated);
      setConfigForm(prev => ({
        ...prev,
        qrImageUrl: updated.qrImageUrl || '',
        upiId: updated.upiId,
        recipientName: updated.recipientName,
      }));
      updatePreviewQr(updated.upiId, updated.recipientName, updated.certificateFee, updated.qrImageUrl);
      setIsQrModalOpen(false);
      alert('Payment QR Code and account details updated successfully! Active for all student checkouts.');
    } catch (err) {
      setQrModalError(err.message || 'Failed to update payment QR code.');
    } finally {
      setQrModalSaving(false);
    }
  };

  const handleUploadQrFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP, or SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size exceeds the 5MB limit. Please upload a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setConfigForm(prev => ({ ...prev, qrImageUrl: reader.result }));
      setPreviewQr(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ─── Course Management Handlers ────────────────────
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      category: 'Technology',
      description: '',
      duration: 'Self-Paced',
      published: true,
      timeLimitMinutes: 40,
      passPercentage: 60,
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title || '',
      category: c.category || 'Technology',
      description: c.description || '',
      duration: c.duration || 'Self-Paced',
      published: c.published !== false,
      timeLimitMinutes: c.timeLimitMinutes || 40,
      passPercentage: c.passPercentage || 60,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      alert('Course Name is required.');
      return;
    }
    if (!courseForm.category.trim()) {
      alert('Category is required.');
      return;
    }
    if (!courseForm.description.trim()) {
      alert('Description is required.');
      return;
    }

    setCourseActionLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, courseForm);
        alert('Course updated successfully!');
      } else {
        await api.post('/admin/courses', courseForm);
        alert('Course added successfully!');
      }
      setIsCourseModalOpen(false);
      const updatedCourses = await api.get('/admin/courses');
      setCourses(updatedCourses || []);
      const updatedStats = await api.get('/admin/stats');
      setStats(updatedStats);
    } catch (err) {
      alert(err.message || 'Failed to save course.');
    } finally {
      setCourseActionLoading(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    setCourseActionLoading(true);
    try {
      await api.delete(`/admin/courses/${course.id}`);
      alert(`Course "${course.title}" was deleted successfully.`);
      setCourseDeleteConfirm(null);
      const updatedCourses = await api.get('/admin/courses');
      setCourses(updatedCourses || []);
      if (selectedCourseId === course.id) {
        setSelectedCourseId(null);
      }
      const updatedStats = await api.get('/admin/stats');
      setStats(updatedStats);
    } catch (err) {
      alert(err.message || 'Failed to delete course.');
    } finally {
      setCourseActionLoading(false);
    }
  };

  // ─── Question CRUD Handlers ─────────────────────────
  const handleOpenAddQuestion = () => {
    setQuestionForm({
      questionText: '',
      questionType: 'MCQ',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      codeSnippet: '',
    });
    setEditingQuestion(null);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    const opts = (Array.isArray(q.options) && q.options.length) ? [...q.options] : ['', '', '', ''];
    while (opts.length < 4) opts.push('');
    let cIndex = opts.findIndex(opt => opt && opt.trim() === (q.correctAnswer || '').trim());
    if (cIndex === -1) cIndex = 0;

    setQuestionForm({
      questionText: q.questionText || '',
      questionType: q.questionType || 'MCQ',
      options: opts,
      correctAnswerIndex: cIndex,
      explanation: q.explanation || '',
      codeSnippet: q.codeSnippet || '',
    });
    setIsAddQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) {
      alert('Question text is required.');
      return;
    }
    const cleanOptions = questionForm.options.map(o => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      alert('Please provide at least 2 valid options.');
      return;
    }

    if (questionForm.correctAnswerIndex >= cleanOptions.length) {
      alert('Please select a valid option for the correct answer.');
      return;
    }

    const payload = {
      questionText: questionForm.questionText.trim(),
      questionType: questionForm.questionType,
      options: cleanOptions,
      correctAnswer: cleanOptions[questionForm.correctAnswerIndex],
      explanation: questionForm.explanation.trim(),
      codeSnippet: questionForm.codeSnippet.trim() || null,
    };

    try {
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, payload);
        alert('Question updated successfully!');
      } else {
        await api.post(`/admin/courses/${selectedCourseId}/questions`, payload);
        alert('Question added to assessment pool!');
      }
      setIsAddQuestionModalOpen(false);
      fetchCourseQuestions(selectedCourseId);
      const updatedCourses = await api.get('/admin/courses');
      setCourses(updatedCourses || []);
    } catch (err) {
      alert(err.message || 'Failed to save question.');
    }
  };

  const handleDeleteQuestion = async (q) => {
    try {
      await api.delete(`/admin/questions/${q.id}`);
      setCourseQuestions(prev => prev.filter(item => item.id !== q.id));
      setQuestionDeleteConfirm(null);
      const updatedCourses = await api.get('/admin/courses');
      setCourses(updatedCourses || []);
      alert('Question removed successfully.');
    } catch (err) {
      alert(err.message || 'Failed to delete question.');
    }
  };

  const handleImportQuestions = async () => {
    if (!importJsonText.trim()) return;
    setImporting(true);
    try {
      let parsed;
      try {
        parsed = JSON.parse(importJsonText);
      } catch (e) {
        throw new Error('Invalid JSON format. Please ensure valid JSON array syntax.');
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of question objects.');
      }

      const res = await api.post(`/admin/courses/${selectedCourseId}/questions/import`, parsed);
      alert(res.message || `Import successful! ${res.imported || 0} questions added.`);
      setIsImportModalOpen(false);
      setImportJsonText('');
      fetchCourseQuestions(selectedCourseId);
      const updatedCourses = await api.get('/admin/courses');
      setCourses(updatedCourses || []);
    } catch (err) {
      alert(err.message || 'Failed to import questions.');
    } finally {
      setImporting(false);
    }
  };

  // ─── Template Upload Handler ────────────────────────
  const handleTemplateFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setTemplateUploadError('Please choose a PNG, JPG, or WEBP image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setTemplateUploadError('File size exceeds the 5MB limit.');
      return;
    }

    setTemplateUploadError('');
    setTemplateFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTemplatePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadTemplate = async (e) => {
    e.preventDefault();
    if (!templatePreview) {
      setTemplateUploadError('Please select a valid image file first.');
      return;
    }

    setTemplateUploadLoading(true);
    setTemplateUploadError('');
    try {
      await api.post('/admin/certificate-template/upload', { image: templatePreview });
      alert('Official certificate template updated successfully! Newly generated certificates will use this template.');
      setIsTemplateUploadModalOpen(false);
      setTemplateFile(null);
      setTemplatePreview('');
      setTemplateKey(Date.now());
    } catch (err) {
      setTemplateUploadError(err.message || 'Failed to upload certificate template.');
    } finally {
      setTemplateUploadLoading(false);
    }
  };

  // ─── Student Audit Drawer / Modal ───────────────────
  const handleViewStudentAudit = async (studentId) => {
    setAuditLoading(true);
    try {
      const data = await api.get(`/admin/students/${studentId}`);
      setSelectedStudentAudit(data);
    } catch (err) {
      alert(err.message || 'Failed to load student audit details.');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRevoke = async (certificateId) => {
    const reason = window.prompt(`Enter reason for revoking certificate ${certificateId}:`, 'Violation of certification integrity');
    if (!reason) return;
    setRevoking(certificateId);
    try {
      await api.post(`/admin/certificates/${certificateId}/revoke`, { reason });
      const updatedCerts = await api.get('/admin/certificates');
      setCertificates(updatedCerts || []);
      alert('Certificate revoked.');
    } catch (err) {
      alert(err.message || 'Failed to revoke certificate');
    } finally {
      setRevoking(null);
    }
  };

  // ─── Student Export Handlers ────────────────────────
  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      const token = localStorage.getItem('skillcred_token');
      const response = await fetch('/api/admin/students/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      const csvBlob = new Blob([blob], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillcred_students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      alert('CSV Export failed: ' + err.message);
    } finally {
      setExportingCSV(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setExportingPDF(true);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Title & Header Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text('SkillCred by Adz4needz — Student Directory & Profile Roster', 14, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Official System Records | Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} | Total Registered Students: ${students.length}`, 14, 20);

      const tableRows = (students || []).map((s, index) => {
        const candidateDetails = `${s.fullName || '—'}\nCert: ${s.certificateDisplayName || s.fullName || '—'}`;
        const contactInfo = `${s.email || '—'}\n${s.mobileNumber ? 'Mob: ' + s.mobileNumber : 'Mob: —'}`;
        const roleStatus = `${s.role || 'STUDENT'}\n(${s.emailVerified !== false ? 'Verified / Active' : 'Pending'})`;
        const category = s.learnerCategory || 'Learner';

        // College & Education
        const eduParts = [];
        if (s.collegeName) eduParts.push(s.collegeName);
        const degDept = [s.degreeCourse, s.department].filter(Boolean).join(' • ');
        if (degDept) eduParts.push(degDept);
        const timing = [s.currentYearOfStudy ? `Yr: ${s.currentYearOfStudy}` : null, s.graduationYear ? `Grad: ${s.graduationYear}` : null].filter(Boolean).join(', ');
        if (timing) eduParts.push(timing);
        const education = eduParts.length > 0 ? eduParts.join('\n') : '—';

        // Company & Career
        const workParts = [];
        if (s.companyName) workParts.push(`Co: ${s.companyName}`);
        if (s.jobRole) workParts.push(`Role: ${s.jobRole}`);
        if (s.industry) workParts.push(`Ind: ${s.industry}`);
        const employment = workParts.length > 0 ? workParts.join('\n') : '—';

        // Academic Qualification & Goal
        const goalParts = [];
        if (s.qualification) goalParts.push(`Qual: ${s.qualification}`);
        if (s.learningGoal) goalParts.push(`Goal: ${s.learningGoal}`);
        const academicGoals = goalParts.length > 0 ? goalParts.join('\n') : '—';

        const regDate = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—';

        return [
          index + 1,
          candidateDetails,
          contactInfo,
          roleStatus,
          category,
          education,
          employment,
          academicGoals,
          regDate
        ];
      });

      autoTable(doc, {
        startY: 24,
        head: [[
          '#',
          'Candidate Name',
          'Contact Details',
          'Role & Status',
          'Category',
          'College & Degree',
          'Company & Career',
          'Qualification & Goal',
          'Registered'
        ]],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'left',
          cellPadding: 2.5,
        },
        styles: {
          fontSize: 7,
          cellPadding: 2.2,
          textColor: [51, 65, 85],
          overflow: 'linebreak',
          valign: 'middle',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 253]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 34 },
          2: { cellWidth: 38 },
          3: { cellWidth: 24 },
          4: { cellWidth: 24 },
          5: { cellWidth: 44 },
          6: { cellWidth: 40 },
          7: { cellWidth: 39 },
          8: { cellWidth: 18, halign: 'center' },
        },
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text('SkillCred by Adz4needz — Student Verification Roster • Confidential', 14, 204);
          doc.text(`Page ${data.pageNumber} of ${pageCount}`, 283, 204, { align: 'right' });
        }
      });

      doc.save(`skillcred_students_roster_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert('PDF Export failed: ' + err.message);
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...body, padding: '80px', textAlign: 'center', color: '#64748B' }}>
        <RotateCcw size={32} color="#64748B" className="animate-spin-slow" style={{ margin: '0 auto 16px auto' }} />
        <p style={{ fontWeight: '600' }}>Loading Admin Console & Analytics...</p>
      </div>
    );
  }

  const filteredPayments = payments.filter(p => {
    if (paymentFilter === 'ALL') return true;
    return p.status === paymentFilter;
  });

  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase();
    return s.fullName?.toLowerCase().includes(q) ||
           s.certificateDisplayName?.toLowerCase().includes(q) ||
           s.email?.toLowerCase().includes(q) ||
           s.mobileNumber?.toLowerCase().includes(q) ||
           s.learnerCategory?.toLowerCase().includes(q) ||
           s.collegeName?.toLowerCase().includes(q) ||
           s.companyName?.toLowerCase().includes(q) ||
           s.degreeCourse?.toLowerCase().includes(q);
  });

  const filteredQuestions = courseQuestions.filter(q => {
    return q.questionText?.toLowerCase().includes(questionSearch.toLowerCase());
  });

  const filteredAttempts = allAttempts.filter(a => {
    const matchesQuery = 
      a.studentName?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.studentEmail?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      a.assessmentTitle?.toLowerCase().includes(auditSearch.toLowerCase());

    if (auditFilterResult === 'PASSED') return matchesQuery && a.passed;
    if (auditFilterResult === 'FAILED') return matchesQuery && !a.passed;
    return matchesQuery;
  });

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: OVERVIEW                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div>
          <TopBar 
            title="System & Platform Overview" 
            subtitle="Platform-wide metrics, active candidate performance, revenue flow, and critical alerts" 
          />

          {/* Stats Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            <div className="skill-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ ...body, fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Learners</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E0EAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} color="#64748B" />
                </div>
              </div>
              <div style={{ ...heading, fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {stats?.totalStudents || 0}
              </div>
              <div style={{ ...body, fontSize: '11px', color: '#027A48', marginTop: '4px', fontWeight: '600' }}>
                Registered Students
              </div>
            </div>

            <div className="skill-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ ...body, fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Assessment Attempts</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FFF4ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="#E06D20" />
                </div>
              </div>
              <div style={{ ...heading, fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {stats?.totalAssessmentAttempts || 0}
              </div>
              <div style={{ ...body, fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Total Attempts Taken
              </div>
            </div>

            <div className="skill-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ ...body, fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Pending Payments</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} color="#D92D20" />
                </div>
              </div>
              <div style={{ ...heading, fontSize: '26px', fontWeight: '800', color: (stats?.pendingPayments || 0) > 0 ? '#D92D20' : '#0F172A' }}>
                {stats?.pendingPayments || 0}
              </div>
              <div style={{ ...body, fontSize: '11px', color: '#D92D20', marginTop: '4px', fontWeight: '600' }}>
                Awaiting Manual Review
              </div>
            </div>

            <div className="skill-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ ...body, fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Verified Certificates</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFDF3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={18} color="#027A48" />
                </div>
              </div>
              <div style={{ ...heading, fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {stats?.totalCertificates || 0}
              </div>
              <div style={{ ...body, fontSize: '11px', color: '#027A48', marginTop: '4px', fontWeight: '600' }}>
                Issued & Authenticated
              </div>
            </div>

            <div className="skill-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ ...body, fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Platform Revenue</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} color="#16A34A" />
                </div>
              </div>
              <div style={{ ...heading, fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                ₹{Math.round(stats?.totalRevenue || 0)}
              </div>
              <div style={{ ...body, fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Approved ₹99 Payments
              </div>
            </div>
          </div>

          {/* Pending Alert Banner */}
          {(stats?.pendingPayments || 0) > 0 && (
            <div style={{
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECDCA',
              borderRadius: '16px',
              padding: '18px 24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE4E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color="#D92D20" />
                </div>
                <div>
                  <h4 style={{ ...heading, fontSize: '15px', fontWeight: '700', color: '#912018', margin: 0 }}>
                    {stats.pendingPayments} Payment{stats.pendingPayments > 1 ? 's' : ''} Pending Verification
                  </h4>
                  <p style={{ ...body, fontSize: '13px', color: '#B42318', margin: '2px 0 0 0' }}>
                    Qualified students are waiting for their certificates. Review their UTR numbers and receipt screenshots.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { navigate('/admin?tab=payments'); setPaymentFilter('PENDING_VERIFICATION'); }}
                className="btn-primary"
                style={{ ...body, padding: '10px 20px', fontSize: '13px', backgroundColor: '#D92D20', borderColor: '#D92D20' }}
              >
                Review Pending Submissions
              </button>
            </div>
          )}

          {/* Recent Submissions */}
          <div className="skill-card" style={{ padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ ...heading, fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Recent Payment Submissions
              </h3>
              <button
                onClick={() => navigate('/admin?tab=payments')}
                style={{ ...body, background: 'none', border: 'none', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                View All Payments ({payments.length}) →
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ ...body, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CFDEF3', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Student</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>UTR / Reference</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Amount</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Submitted</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0F172A' }}>
                        {p.studentName}
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{p.studentEmail}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        {p.courseTitle}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: '700', color: '#334155' }}>
                        {p.utrNumber}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0F172A' }}>
                        ₹{p.amount}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '12px' }}>
                        {new Date(p.submittedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge ${
                          p.status === 'APPROVED' ? 'badge-green' :
                          p.status === 'PENDING_VERIFICATION' ? 'badge-peach' : 'badge-pink'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                        No payments submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: PAYMENT VERIFICATION                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}>
            <TopBar 
              title="Manual UPI Payment Verification" 
              subtitle="Review transaction references, examine uploaded bank receipts, and authorize certificate issuance" 
            />
            <button
              onClick={handleOpenQrModal}
              className="btn-primary"
              style={{
                ...body,
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                backgroundColor: '#586B84',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(88, 107, 132, 0.25)',
              }}
            >
              <QrCode size={16} />
              <span>Update Payment QR Code</span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'ALL', label: 'All Submissions', count: payments.length },
                { id: 'PENDING_VERIFICATION', label: 'Pending Review', count: payments.filter(p => p.status === 'PENDING_VERIFICATION').length },
                { id: 'APPROVED', label: 'Approved', count: payments.filter(p => p.status === 'APPROVED').length },
                { id: 'REJECTED', label: 'Rejected', count: payments.filter(p => p.status === 'REJECTED').length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPaymentFilter(f.id)}
                  style={{
                    ...body,
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: paymentFilter === f.id ? '#586B84' : '#FFFFFF',
                    color: paymentFilter === f.id ? '#FFFFFF' : '#334155',
                    border: '1px solid',
                    borderColor: paymentFilter === f.id ? '#586B84' : '#CFDEF3',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{
                    backgroundColor: paymentFilter === f.id ? 'rgba(255,255,255,0.25)' : '#E0EAFC',
                    color: paymentFilter === f.id ? '#FFFFFF' : '#334155',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ ...body, fontSize: '13px', color: '#64748B' }}>
              Showing {filteredPayments.length} submission{filteredPayments.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="skill-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ ...body, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CFDEF3', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Student Details</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>UTR / Reference</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Fee</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Proof Receipt</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{p.studentName}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{p.studentEmail}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(p.submittedAt).toLocaleString()}</div>
                      </td>
                      <td style={{ padding: '14px', color: '#334155', fontWeight: '500' }}>
                        {p.courseTitle}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#334155', fontSize: '14px' }}>
                          {p.utrNumber}
                        </div>
                        {p.notes && (
                          <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', marginTop: '2px' }}>
                            "{p.notes}"
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px', fontWeight: '700', color: '#0F172A' }}>
                        ₹{p.amount}
                      </td>
                      <td style={{ padding: '14px' }}>
                        {p.proofImageUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedProofImg(p.proofImageUrl)}
                            style={{
                              border: '1px solid #CFDEF3',
                              borderRadius: '8px',
                              padding: '2px',
                              backgroundColor: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Click to view full receipt"
                          >
                            <img
                              src={p.proofImageUrl}
                              alt="Proof thumbnail"
                              style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <Eye size={14} color="#64748B" style={{ margin: '0 4px' }} />
                          </button>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>No image</span>
                        )}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${
                          p.status === 'APPROVED' ? 'badge-green' :
                          p.status === 'PENDING_VERIFICATION' ? 'badge-peach' : 'badge-pink'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'APPROVED' && p.certificateId && (
                          <div style={{ marginTop: '4px' }}>
                            <a
                              href={`/certificates/${p.certificateId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '11px', color: '#64748B', textDecoration: 'none', fontWeight: '600' }}
                            >
                              View Certificate ↗
                            </a>
                          </div>
                        )}
                        {p.status === 'REJECTED' && p.rejectionReason && (
                          <div style={{ fontSize: '11px', color: '#D92D20', marginTop: '4px', maxWidth: '160px' }}>
                            {p.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        {p.status === 'PENDING_VERIFICATION' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleApprovePayment(p.id)}
                              disabled={actionLoading}
                              style={{
                                ...body,
                                padding: '6px 14px',
                                borderRadius: '8px',
                                backgroundColor: '#ECFDF3',
                                border: '1px solid #A6F4C5',
                                color: '#027A48',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(p)}
                              disabled={actionLoading}
                              style={{
                                ...body,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#FEF3F2',
                                border: '1px solid #FECDCA',
                                color: '#B42318',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : p.status === 'APPROVED' ? (
                          <span style={{ color: '#027A48', fontWeight: '600', fontSize: '12px' }}>Verified ✓</span>
                        ) : (
                          <span style={{ color: '#64748B', fontSize: '12px' }}>Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        No payments found for filter "{paymentFilter}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: UPI PAYMENT SETTINGS                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div>
          <TopBar 
            title="UPI & Payment Gateway Configuration" 
            subtitle="Manage your payment receiver UPI ID, QR code standee, issuance fee, and candidate checkout instructions" 
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}>
            <div className="skill-card" style={{ padding: '32px' }}>
              <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Payment Parameters
              </h3>
              <p style={{ ...body, fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
                Qualified candidates pay to this UPI ID or scan this QR before certificates can be issued.
              </p>

              <form onSubmit={handleSavePaymentConfig} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFD',
                  borderRadius: '12px',
                  border: '1px solid #CFDEF3',
                }}>
                  <div>
                    <div style={{ ...heading, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                      Require Certificate Payment
                    </div>
                    <div style={{ ...body, fontSize: '12px', color: '#64748B' }}>
                      When enabled, certificate issuance requires admin-approved UPI payment
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configForm.enabled}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    value={configForm.upiId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfigForm(prev => ({ ...prev, upiId: val }));
                      updatePreviewQr(val, configForm.recipientName, configForm.certificateFee, configForm.qrImageUrl);
                    }}
                    required
                    placeholder="e.g. adz4needz@okaxis"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Registered Recipient / Business Name *
                  </label>
                  <input
                    type="text"
                    value={configForm.recipientName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfigForm(prev => ({ ...prev, recipientName: val }));
                      updatePreviewQr(configForm.upiId, val, configForm.certificateFee, configForm.qrImageUrl);
                    }}
                    required
                    placeholder="e.g. ADZ4NEEDZ (OPC) PRIVATE LIMITED"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Certificate Fee (INR) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={configForm.certificateFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setConfigForm(prev => ({ ...prev, certificateFee: val }));
                        updatePreviewQr(configForm.upiId, configForm.recipientName, val, configForm.qrImageUrl);
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CFDEF3',
                        fontSize: '14px',
                        fontWeight: '700',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Phone / Helpline
                    </label>
                    <input
                      type="text"
                      value={configForm.paymentNumber}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, paymentNumber: e.target.value }))}
                      placeholder="+91 9876543210"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CFDEF3',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                      Payment QR Code Image
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenQrModal}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#586B84',
                        fontWeight: '700',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <QrCode size={14} />
                      <span>Update via QR Manager</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleUploadQrFile}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '12px',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Allowed formats: PNG, JPG, WEBP, SVG (Max 5MB). Leave empty to use auto-generated UPI QR code.
                  </span>
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Candidate Checkout Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={configForm.instructions}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM. Pay the certificate fee and enter your 12-digit UTR..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={configSaving}
                  className="btn-primary"
                  style={{ ...body, padding: '14px', fontSize: '15px', marginTop: '8px' }}
                >
                  <span>{configSaving ? 'Saving Settings...' : 'Save Payment Configuration'}</span>
                </button>
              </form>
            </div>

            {/* Live Student Checkout Preview Card */}
            <div className="skill-card" style={{ padding: '32px', backgroundColor: '#F8FAFD' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Eye size={18} color="#64748B" />
                <h3 style={{ ...heading, fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Live Candidate Checkout Preview
                </h3>
              </div>
              <p style={{ ...body, fontSize: '12px', color: '#64748B', marginBottom: '20px' }}>
                This is the exact UI component displayed to students upon qualifying their assessment:
              </p>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #CFDEF3',
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(207, 222, 243, 0.4)',
              }}>
                <span className="badge badge-purple" style={{ marginBottom: '10px' }}>
                  OFFICIAL CERTIFICATE FEE
                </span>
                <h4 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '4px 0 16px 0' }}>
                  ₹{configForm.certificateFee} One-Time Fee
                </h4>

                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  border: '1px solid #E2E8F0',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}>
                  {previewQr ? (
                    <img
                      src={previewQr}
                      alt="Preview QR"
                      style={{ width: '160px', height: '160px', display: 'block', borderRadius: '6px' }}
                    />
                  ) : (
                    <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      Loading QR...
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B' }}>UPI ID:</span>
                    <strong style={{ color: '#0F172A' }}>{configForm.upiId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F8FAFD', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ color: '#64748B' }}>Recipient:</span>
                    <strong style={{ color: '#0F172A' }}>{configForm.recipientName}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: COURSE MANAGEMENT                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <TopBar 
              title="Course Management" 
              subtitle="View, create, edit, and safely manage official certification tracks and examination criteria" 
            />
            <button
              onClick={handleOpenAddCourse}
              className="btn-primary"
              style={{ ...body, padding: '11px 20px', fontSize: '13.5px', marginTop: '6px' }}
            >
              <Plus size={16} />
              <span>Add Course</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}>
            {courses.map((course) => (
              <div
                key={course.id}
                className="skill-card"
                style={{
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid #CFDEF3',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className="badge badge-purple">
                      {course.category || 'Certification'}
                    </span>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: course.published !== false ? '#027A48' : '#B42318',
                      backgroundColor: course.published !== false ? '#ECFDF3' : '#FEF3F2',
                      border: '1px solid',
                      borderColor: course.published !== false ? '#A6F4C5' : '#FECDCA',
                      padding: '2px 10px',
                      borderRadius: '999px',
                    }}>
                      {course.published !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                    {course.title}
                  </h3>

                  <p style={{
                    ...body,
                    fontSize: '13px',
                    color: '#475569',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {course.description || 'Professional industry-recognized certificate track with randomized assessment questions.'}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#F8FAFD',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '18px',
                    fontSize: '12px',
                    color: '#475569',
                  }}>
                    <span style={{ fontWeight: '700', color: '#334155' }}>
                      {course.questionCount || 0} Questions
                    </span>
                    <span>•</span>
                    <span>{course.timeLimitMinutes || 40} min exam</span>
                    <span>•</span>
                    <span>{course.passPercentage || 60}% pass mark</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      navigate('/admin?tab=questions');
                    }}
                    className="btn-primary"
                    style={{ padding: '9px 14px', fontSize: '13px', justifyContent: 'center' }}
                  >
                    <Database size={15} />
                    <span>Open Question Bank</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setViewingCourse(course)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '8px', fontSize: '12.5px', justifyContent: 'center', border: '1px solid #CFDEF3' }}
                      title="View Details"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '8px', fontSize: '12.5px', justifyContent: 'center', border: '1px solid #CFDEF3' }}
                      title="Edit Course"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setCourseDeleteConfirm(course)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #FECDCA',
                        backgroundColor: '#FEF3F2',
                        color: '#B42318',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 5: QUESTION BANK (TWO-STEP WORKFLOW)                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'questions' && (
        <div>
          {/* STEP 1: COURSE LIST (When no course is selected) */}
          {!selectedCourseId && (
            <div>
              <TopBar 
                title="Question Bank — Select Course" 
                subtitle="Select an official course to view, add, edit, or bulk import examination questions" 
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              }}>
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className="skill-card"
                    style={{
                      borderRadius: '18px',
                      padding: '22px',
                      border: '1px solid #CFDEF3',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="badge badge-purple">{course.category || 'General'}</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          color: '#64748B',
                          backgroundColor: '#EFF8FF',
                          border: '1px solid #B2DDFF',
                          padding: '3px 10px',
                          borderRadius: '999px',
                        }}>
                          {course.questionCount || 0} Questions
                        </span>
                      </div>
                      <h3 style={{ ...heading, fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                        {course.title}
                      </h3>
                      <p style={{ ...body, fontSize: '12.5px', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                        30 questions randomly drawn per candidate examination • 40 min timer
                      </p>
                    </div>

                    <div style={{
                      marginTop: '20px',
                      paddingTop: '14px',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#64748B',
                      fontSize: '13px',
                      fontWeight: '700',
                    }}>
                      <span>Manage Question Bank</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: MANAGE QUESTIONS FOR SELECTED COURSE */}
          {selectedCourseId && (
            <div>
              {/* Compact, Sticky Header keeping Add Question immediately accessible */}
              <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 30,
                backgroundColor: '#F0F4F8',
                paddingTop: '2px',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CFDEF3',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {/* Top row: Back button, Course Title, Badges, Add Question button, Bulk Import button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <button
                        onClick={() => setSelectedCourseId(null)}
                        className="btn-secondary"
                        style={{
                          padding: '7px 12px',
                          borderRadius: '9px',
                          border: '1px solid #CFDEF3',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          color: '#334155',
                          flexShrink: 0,
                        }}
                      >
                        <ArrowLeft size={15} />
                        <span>Courses</span>
                      </button>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h2 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {courses.find(c => c.id === selectedCourseId)?.title}
                          </h2>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: '800',
                            color: '#64748B',
                            backgroundColor: '#EFF8FF',
                            border: '1px solid #B2DDFF',
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}>
                            {courseQuestions.length} Questions
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          30 questions drawn randomly per attempt • 40 min examination timer
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={handleOpenAddQuestion}
                        className="btn-primary"
                        style={{
                          ...body,
                          padding: '9px 18px',
                          fontSize: '13px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#586B84',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Question</span>
                      </button>

                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="btn-secondary"
                        style={{
                          ...body,
                          padding: '9px 14px',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid #CFDEF3',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <Upload size={14} />
                        <span>Bulk Import JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Questions */}
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '11px' }} />
                    <input
                      type="text"
                      placeholder={`Search ${courseQuestions.length} questions by text, code, or options...`}
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 38px',
                        borderRadius: '10px',
                        border: '1px solid #CFDEF3',
                        fontSize: '13px',
                        backgroundColor: '#F8FAFD',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Question List */}
              {questionsLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                  Loading questions from database...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="skill-card"
                      style={{ padding: '22px 24px', border: '1px solid #CFDEF3', borderRadius: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{
                            backgroundColor: '#E0EAFC',
                            color: '#334155',
                            fontWeight: '800',
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            minWidth: '38px',
                            textAlign: 'center',
                            flexShrink: 0,
                          }}>
                            Q{idx + 1}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{
                                fontSize: '10.5px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: q.questionType === 'CODING' ? '#FDF2FA' : '#F0F9FF',
                                color: q.questionType === 'CODING' ? '#C11574' : '#026AA2',
                                border: '1px solid',
                                borderColor: q.questionType === 'CODING' ? '#FCE7F6' : '#B9E6FE',
                              }}>
                                {q.questionType === 'CODING' ? 'Technical / Coding' : 'Multiple Choice (MCQ)'}
                              </span>
                            </div>
                            <h4 style={{ ...heading, fontSize: '15.5px', fontWeight: '700', color: '#0F172A', margin: 0, lineHeight: 1.45 }}>
                              {q.questionText}
                            </h4>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            style={{
                              padding: '7px 11px',
                              borderRadius: '8px',
                              border: '1px solid #CFDEF3',
                              backgroundColor: '#FFFFFF',
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                            title="Edit Question"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setQuestionDeleteConfirm(q)}
                            style={{
                              padding: '7px 11px',
                              borderRadius: '8px',
                              border: '1px solid #FECDCA',
                              backgroundColor: '#FEF3F2',
                              color: '#B42318',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                            title="Delete Question"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Optional Code Snippet */}
                      {q.codeSnippet && (
                        <div style={{
                          backgroundColor: '#0F172A',
                          color: '#E2E8F0',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontFamily: 'monospace',
                          fontSize: '12.5px',
                          lineHeight: 1.5,
                          overflowX: 'auto',
                          marginBottom: '14px',
                          whiteSpace: 'pre-wrap',
                          border: '1px solid #334155',
                        }}>
                          {q.codeSnippet}
                        </div>
                      )}

                      {/* Options Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '10px',
                        marginBottom: '12px',
                      }}>
                        {q.options?.map((opt, oIdx) => {
                          const isCorrect = (opt || '').trim() === (q.correctAnswer || '').trim();
                          return (
                            <div
                              key={oIdx}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                backgroundColor: isCorrect ? '#ECFDF3' : '#F8FAFD',
                                border: '1.5px solid',
                                borderColor: isCorrect ? '#12B76A' : '#E2E8F0',
                                fontSize: '13px',
                                color: isCorrect ? '#027A48' : '#334155',
                                fontWeight: isCorrect ? '700' : '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                              }}
                            >
                              <span style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isCorrect ? '#027A48' : '#CBD5E1',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: '800',
                                flexShrink: 0,
                              }}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {isCorrect && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: '#027A48',
                                  color: '#FFFFFF',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}>
                                  <Check size={11} /> Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div style={{
                          backgroundColor: '#EFF8FF',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          color: '#334155',
                          borderLeft: '3px solid #64748B',
                          lineHeight: 1.45,
                        }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredQuestions.length === 0 && (
                    <div className="skill-card" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                      No questions found matching "{questionSearch}".
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 6: STUDENT MANAGEMENT                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div>
          <TopBar 
            title="Student Roster & Credentials Directory" 
            subtitle="Search student profiles, inspect examination attempt histories, and export candidate records to CSV" 
          />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: '10px',
                  border: '1px solid #CFDEF3',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={exportingCSV}
                className="btn-secondary"
                style={{
                  ...body,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: '#ECFDF3',
                  border: '1px solid #A6F4C5',
                  color: '#027A48',
                  cursor: 'pointer',
                }}
              >
                <Download size={16} />
                <span>{exportingCSV ? 'Exporting CSV...' : 'Export Students to CSV'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="btn-secondary"
                style={{
                  ...body,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: '#EFF8FF',
                  border: '1px solid #B2DDFF',
                  color: '#175CD3',
                  cursor: 'pointer',
                }}
              >
                <FileText size={16} />
                <span>{exportingPDF ? 'Generating PDF...' : 'Export Students to PDF'}</span>
              </button>
            </div>
          </div>

          <div className="skill-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ ...body, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CFDEF3', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Candidate Name</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Contact Details</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Learner Profile & Academic/Career</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Role & Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Registered Date</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px', fontWeight: '700', color: '#0F172A' }}>
                        <div>{s.fullName}</div>
                        <div style={{ fontSize: '11.5px', color: '#334155', fontWeight: '600', marginTop: '2px' }}>
                          Cert: {s.certificateDisplayName || s.fullName}
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: '#475569' }}>
                        <div>{s.email}</div>
                        {s.mobileNumber && (
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                            📱 {s.mobileNumber}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px', color: '#334155' }}>
                        <span className="badge badge-purple" style={{ fontSize: '11px', marginBottom: '4px', display: 'inline-block' }}>
                          {s.learnerCategory || 'Learner'}
                        </span>
                        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                          {[s.collegeName || s.companyName, s.degreeCourse || s.jobRole].filter(Boolean).join(' • ') || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge ${s.role === 'ADMIN' ? 'badge-pink' : 'badge-green'}`} style={{ width: 'fit-content' }}>
                            {s.role}
                          </span>
                          <span style={{ fontSize: '11px', color: s.emailVerified !== false ? '#027A48' : '#D92D20', fontWeight: '600' }}>
                            {s.emailVerified !== false ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: '#64748B', fontSize: '12px' }}>
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleViewStudentAudit(s.id)}
                          style={{
                            ...body,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#E0EAFC',
                            border: '1px solid #CFDEF3',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} />
                          <span>View History</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 7: CERTIFICATE REGISTRY                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'certificates' && (
        <div>
          <TopBar 
            title="Official Certificate Registry & Validation" 
            subtitle="Search authorized industry credentials, check QR verification links, and manage credential validity" 
          />

          {/* Official Certificate Template Spec Card */}
          <div className="skill-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: '240px',
              height: '160px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #CFDEF3',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              position: 'relative',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
            }}>
              <img
                key={templateKey}
                src={`/assets/certificate_template.png?v=${templateKey}`}
                alt="Certificate Template"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#027A48',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '999px',
              }}>
                ACTIVE TEMPLATE
              </span>
            </div>

            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Award size={18} color="#64748B" />
                <h3 style={{ ...heading, fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  ADZ4NEEDZ Official Certificate Specification
                </h3>
              </div>
              <p style={{ ...body, fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                Preserves all original signatures (Mrs. Atchaya & Mrs. Renuka), company details, gold seal, and decorative borders. Student credentials and dynamic QR verification codes are calibrated precisely without covering existing content.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#64748B' }}>
                <span><strong>Template Resolution:</strong> 1024 × 768 px (Landscape)</span>
                <span>•</span>
                <span><strong>Typography:</strong> Playfair Display & Plus Jakarta Sans</span>
                <span>•</span>
                <span><strong>Format:</strong> High-Resolution PNG</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setTemplateFile(null);
                  setTemplatePreview('');
                  setTemplateUploadError('');
                  setIsTemplateUploadModalOpen(true);
                }}
                className="btn-primary"
                style={{
                  ...body,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  justifyContent: 'center',
                }}
              >
                <Upload size={14} />
                <span>Upload / Replace Template</span>
              </button>
              <a
                href="/assets/certificate_template.png"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{
                  ...body,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  color: '#334155',
                  backgroundColor: '#EFF8FF',
                  border: '1px solid #B2DDFF',
                  justifyContent: 'center',
                }}
              >
                <Eye size={14} />
                <span>View Full Template</span>
              </a>
            </div>
          </div>

          <div className="skill-card" style={{ padding: '28px' }}>
            <h3 style={{ ...heading, fontSize: '17px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
              All Issued Certificates ({certificates.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ ...body, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CFDEF3', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Certificate ID</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Student Name</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Course</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Issue Date</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => {
                    const isValid = cert.status === 'VALID';
                    return (
                      <tr key={cert.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '700', color: '#334155' }}>
                          {cert.certificateId}
                        </td>
                        <td style={{ padding: '14px', fontWeight: '700', color: '#0F172A' }}>
                          {cert.studentName}
                        </td>
                        <td style={{ padding: '14px', color: '#334155' }}>
                          {cert.courseTitle}
                        </td>
                        <td style={{ padding: '14px', color: '#64748B' }}>
                          {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span className={`badge ${isValid ? 'badge-green' : 'badge-pink'}`}>
                            {cert.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <a
                              href={`/verify/${cert.certificateId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#E0EAFC',
                                border: '1px solid #CFDEF3',
                                color: '#334155',
                                fontSize: '11px',
                                fontWeight: '600',
                                textDecoration: 'none',
                              }}
                            >
                              Verify Link
                            </a>
                            {isValid && (
                              <button
                                onClick={() => handleRevoke(cert.certificateId)}
                                disabled={revoking === cert.certificateId}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FEF3F2',
                                  border: '1px solid #FECDCA',
                                  color: '#B42318',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                {revoking === cert.certificateId ? 'Revoking...' : 'Revoke'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                        No certificates issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 8: AUDIT & REPORTS                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div>
          <TopBar 
            title="Comprehensive Audit Log & Examination Reports" 
            subtitle="Full chronological trajectory of all student assessment attempts, test score distributions, and verification records" 
          />

          {/* Audit Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div className="skill-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>Recorded Attempts</div>
              <div style={{ ...heading, fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{allAttempts.length}</div>
            </div>
            <div className="skill-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>Passed Attempts</div>
              <div style={{ ...heading, fontSize: '24px', fontWeight: '800', color: '#027A48' }}>
                {allAttempts.filter(a => a.passed).length}
              </div>
            </div>
            <div className="skill-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>Failed Attempts</div>
              <div style={{ ...heading, fontSize: '24px', fontWeight: '800', color: '#D92D20' }}>
                {allAttempts.filter(a => !a.passed).length}
              </div>
            </div>
            <div className="skill-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>Passing Standard</div>
              <div style={{ ...heading, fontSize: '24px', fontWeight: '800', color: '#64748B' }}>18/30 (60%)</div>
            </div>
          </div>

          {/* Audit Search and Filters */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
              <input
                type="text"
                placeholder="Filter by student, email, or assessment title..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: '10px',
                  border: '1px solid #CFDEF3',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'PASSED', 'FAILED'].map(res => (
                <button
                  key={res}
                  onClick={() => setAuditFilterResult(res)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: auditFilterResult === res ? '#586B84' : '#CFDEF3',
                    backgroundColor: auditFilterResult === res ? '#586B84' : '#FFFFFF',
                    color: auditFilterResult === res ? '#FFFFFF' : '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Chronological Attempts Table */}
          <div className="skill-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ ...body, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CFDEF3', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Date & Time</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Student</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Assessment Track</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Score</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Percentage</th>
                    <th style={{ padding: '12px 14px', fontWeight: '700' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((att) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px', color: '#64748B', fontSize: '12px' }}>
                        {new Date(att.attemptedAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px', fontWeight: '700', color: '#0F172A' }}>
                        {att.studentName}
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>{att.studentEmail}</div>
                      </td>
                      <td style={{ padding: '14px', color: '#334155', fontWeight: '600' }}>
                        {att.assessmentTitle}
                      </td>
                      <td style={{ padding: '14px', color: '#334155', fontWeight: '600' }}>
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td style={{ padding: '14px', fontWeight: '700', color: att.passed ? '#027A48' : '#D92D20' }}>
                        {Math.round(att.percentage)}%
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${att.passed ? 'badge-green' : 'badge-pink'}`}>
                          {att.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredAttempts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        No assessment attempts found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ALL ADMIN MODALS (RENDERED VIA PORTAL DIRECTLY INTO BODY)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <ModalPortal>
        {/* ───────────────────────────────────────────────────────────── */}
        {/* MODAL: PROOF IMAGE VIEWER                                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {selectedProofImg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ ...heading, fontWeight: '700', color: '#0F172A' }}>
                Payment Transaction Receipt
              </span>
              <button
                onClick={() => setSelectedProofImg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
              <img
                src={selectedProofImg}
                alt="Full receipt"
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fb = e.target.nextElementSibling;
                  if (fb) fb.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', padding: '36px', color: '#64748B', fontSize: '13px' }}>
                <AlertTriangle size={32} color="#F59E0B" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ fontWeight: '600', color: '#334155' }}>Preview unavailable</p>
                <p style={{ fontSize: '12px' }}>Click the button below to view or download the uploaded payment receipt directly.</p>
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
              <a
                href={selectedProofImg}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...body,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748B',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={15} />
                <span>Open Full Size in New Tab</span>
              </a>
              <button
                onClick={() => setSelectedProofImg(null)}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: PAYMENT REJECTION REASON                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {rejectModalPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ ...heading, fontSize: '17px', fontWeight: '800', color: '#991B1B', marginBottom: '8px' }}>
              Reject Payment Submission
            </h3>
            <p style={{ ...body, fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Provide a clear reason for the student. They will see this message and be asked to resubmit.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UTR number not found in bank statement, or payment amount mismatch..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #CFDEF3',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading || !rejectReason.trim()}
                style={{
                  ...body,
                  padding: '8px 18px',
                  borderRadius: '999px',
                  backgroundColor: '#D92D20',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT COURSE                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCourseModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '580px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
            }}>
              <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {editingCourse ? 'Edit Certification Course' : 'Add New Certification Course'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0, margin: 0 }}>
              <div style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="e.g. Cloud Computing Architecture"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CFDEF3',
                        fontSize: '13.5px',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">Design</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Business">Business</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={courseForm.published ? 'ACTIVE' : 'INACTIVE'}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, published: e.target.value === 'ACTIVE' }))}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CFDEF3',
                        fontSize: '13.5px',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="ACTIVE">Active (Available for Enrollment)</option>
                      <option value="INACTIVE">Inactive (Hidden from Students)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Course Description *
                  </label>
                  <textarea
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Comprehensive description of the curriculum, certification competencies, and industry skills measured..."
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Assessment Configuration */}
                <div style={{
                  backgroundColor: '#F8FAFD',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>
                    Assessment Settings (Evaluation Parameters)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ ...body, display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        Timer (Minutes)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={courseForm.timeLimitMinutes}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, timeLimitMinutes: Number(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CFDEF3',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ ...body, display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                        Passing Mark (%)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={courseForm.passPercentage}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, passPercentage: Number(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid #CFDEF3',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '8px' }}>
                    Note: Each assessment serves 30 randomized questions from the pool.
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer with Visible Buttons */}
              <div style={{
                padding: '14px 24px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseActionLoading}
                  className="btn-primary"
                  style={{ padding: '9px 24px', fontSize: '13px', fontWeight: '700' }}
                >
                  {courseActionLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: VIEW COURSE DETAILS                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewingCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '6px' }}>{viewingCourse.category}</span>
                <h3 style={{ ...heading, fontSize: '19px', fontWeight: '800', color: '#0F172A', margin: '4px 0 0 0' }}>
                  {viewingCourse.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingCourse(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ ...body, fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              {viewingCourse.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', fontSize: '12.5px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Question Bank</span>
                <strong style={{ color: '#0F172A', fontSize: '14px' }}>{viewingCourse.questionCount || 0} Questions</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Examination Timer</span>
                <strong style={{ color: '#0F172A', fontSize: '14px' }}>{viewingCourse.timeLimitMinutes || 40} Minutes</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Pass Standard</span>
                <strong style={{ color: '#027A48', fontSize: '14px' }}>{viewingCourse.passPercentage || 60}% Required</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFD', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B', display: 'block', marginBottom: '2px' }}>Enrollment Status</span>
                <strong style={{ color: viewingCourse.published !== false ? '#027A48' : '#B42318', fontSize: '14px' }}>
                  {viewingCourse.published !== false ? 'Active' : 'Inactive'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setViewingCourse(null)}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCourseId(viewingCourse.id);
                  setViewingCourse(null);
                  navigate('/admin?tab=questions');
                }}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Open Question Bank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: DELETE COURSE CONFIRMATION                             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {courseDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            padding: '26px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#B42318', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', margin: 0 }}>
                Confirm Course Deletion
              </h3>
            </div>
            <p style={{ ...body, fontSize: '13.5px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to delete <strong>"{courseDeleteConfirm.title}"</strong>?
            </p>
            <div style={{
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECDCA',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#B42318',
              lineHeight: 1.45,
              marginBottom: '20px',
            }}>
              <strong>Data Protection Safeguard:</strong> If students have already enrolled, taken tests, submitted payments, or received verified certificates for this course, deletion will be blocked to protect student credentials. In that case, set Status to Inactive instead.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCourseDeleteConfirm(null)}
                className="btn-secondary"
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCourse(courseDeleteConfirm)}
                disabled={courseActionLoading}
                style={{
                  ...body,
                  padding: '9px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#D92D20',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {courseActionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT QUESTION                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isAddQuestionModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
            }}>
              <div>
                <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {courses.find(c => c.id === selectedCourseId)?.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddQuestionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0, margin: 0 }}>
              <div style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Question Type
                  </label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, questionType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="MCQ">Multiple Choice Question (MCQ)</option>
                    <option value="CODING">Technical / Coding Question</option>
                  </select>
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Question Text *
                  </label>
                  <textarea
                    rows={3}
                    value={questionForm.questionText}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
                    required
                    placeholder="Enter the scenario or examination question..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Optional Code Snippet */}
                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Optional Code Snippet / Technical Details (Rendered in monospace)
                  </label>
                  <textarea
                    rows={3}
                    value={questionForm.codeSnippet}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, codeSnippet: e.target.value }))}
                    placeholder="e.g. def calculate_gradient(w, x): return w * x..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '12.5px',
                      fontFamily: 'monospace',
                      backgroundColor: '#F8FAFD',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    Options & Correct Answer (Select the radio button for the correct answer) *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {questionForm.options.map((opt, i) => {
                      const isSelected = questionForm.correctAnswerIndex === i;
                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '6px 10px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#ECFDF3' : 'transparent',
                            border: isSelected ? '1px solid #A6F4C5' : '1px solid transparent',
                          }}
                        >
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={isSelected}
                            onChange={() => setQuestionForm(prev => ({ ...prev, correctAnswerIndex: i }))}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            title="Mark as correct answer"
                          />
                          <span style={{ fontWeight: '800', color: isSelected ? '#027A48' : '#64748B', width: '20px' }}>
                            {String.fromCharCode(65 + i)}:
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...questionForm.options];
                              newOpts[i] = e.target.value;
                              setQuestionForm(prev => ({ ...prev, options: newOpts }));
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            required
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #CFDEF3',
                              fontSize: '13px',
                              backgroundColor: '#FFFFFF',
                            }}
                          />
                          {isSelected && (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#027A48' }}>
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Detailed Explanation (Shown after assessment)
                  </label>
                  <textarea
                    rows={2}
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explain why the correct answer is right and clarify the core concept..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #CFDEF3',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Pinned Modal Footer with Visible Buttons */}
              <div style={{
                padding: '14px 24px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={() => setIsAddQuestionModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '9px 24px', fontSize: '13px', fontWeight: '700' }}
                >
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: DELETE QUESTION CONFIRMATION                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {questionDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
          }}>
            <h3 style={{ ...heading, fontSize: '17px', fontWeight: '800', color: '#991B1B', marginBottom: '8px' }}>
              Delete Question
            </h3>
            <p style={{ ...body, fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to permanently delete this question from the examination pool?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setQuestionDeleteConfirm(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(questionDeleteConfirm)}
                style={{
                  ...body,
                  padding: '8px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#D92D20',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: UPLOAD / REPLACE CERTIFICATE TEMPLATE                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isTemplateUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Upload / Replace Certificate Template
              </h3>
              <button
                onClick={() => setIsTemplateUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ ...body, fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '18px' }}>
              Upload an authorized landscape certificate template. Format must be PNG, JPG, or WEBP (1024×768 landscape recommended, max 5MB).
            </p>

            <form onSubmit={handleUploadTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleTemplateFileChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px dashed #CFDEF3',
                    backgroundColor: '#F8FAFD',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
                {templateUploadError && (
                  <div style={{ color: '#D92D20', fontSize: '12px', marginTop: '6px', fontWeight: '600' }}>
                    {templateUploadError}
                  </div>
                )}
              </div>

              {templatePreview && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    Template Preview:
                  </div>
                  <div style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #CFDEF3',
                    maxHeight: '220px',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img
                      src={templatePreview}
                      alt="Template Preview"
                      style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsTemplateUploadModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={templateUploadLoading || !templatePreview}
                  className="btn-primary"
                  style={{ padding: '10px 24px', fontSize: '13px' }}
                >
                  {templateUploadLoading ? 'Uploading Template...' : 'Save & Replace Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: IMPORT JSON QUESTIONS                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              flexShrink: 0,
            }}>
              <h3 style={{ ...heading, fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Bulk Import Questions (JSON) — {courses.find(c => c.id === selectedCourseId)?.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <p style={{ ...body, fontSize: '13px', color: '#64748B', marginBottom: '14px', marginTop: 0 }}>
                Paste an array of questions in JSON format. Each object must have <code>questionText</code>, <code>options</code> (array of 4 strings), <code>correctAnswer</code>, and optional <code>explanation</code> and <code>codeSnippet</code>.
              </p>

              <textarea
                rows={9}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder={`[
  {
    "questionText": "What is the primary role of an AI Product Manager?",
    "options": ["Writing raw CUDA kernels", "Aligning ML capabilities with user needs and business metrics", "Managing hardware server fans", "Creating printer drivers"],
    "correctAnswer": "Aligning ML capabilities with user needs and business metrics",
    "explanation": "An AI PM translates business goals into machine learning specifications."
  }
]`}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '200px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #CFDEF3',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: '#F8FAFD',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportQuestions}
                disabled={importing || !importJsonText.trim()}
                className="btn-primary"
                style={{ padding: '9px 24px', fontSize: '13px', fontWeight: '700' }}
              >
                {importing ? 'Importing...' : 'Import into Pool'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: STUDENT AUDIT & ATTEMPTS HISTORY                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedStudentAudit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-peach" style={{ marginBottom: '6px' }}>STUDENT AUDIT</span>
                <h3 style={{ ...heading, fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '2px 0 4px 0' }}>
                  {selectedStudentAudit.fullName}
                </h3>
                <div style={{ ...body, fontSize: '13px', color: '#64748B' }}>
                  {selectedStudentAudit.email} • Certificate Name: <strong>{selectedStudentAudit.certificateDisplayName || selectedStudentAudit.fullName}</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentAudit(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <h4 style={{ ...heading, fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
              Assessment Attempts ({selectedStudentAudit.attempts?.length || 0})
            </h4>

            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <table style={{ ...body, width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #CFDEF3', color: '#64748B' }}>
                    <th style={{ padding: '8px 10px', fontWeight: '700' }}>Date</th>
                    <th style={{ padding: '8px 10px', fontWeight: '700' }}>Assessment</th>
                    <th style={{ padding: '8px 10px', fontWeight: '700' }}>Score</th>
                    <th style={{ padding: '8px 10px', fontWeight: '700' }}>Percentage</th>
                    <th style={{ padding: '8px 10px', fontWeight: '700' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentAudit.attempts?.map((att) => (
                    <tr key={att.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 10px', color: '#64748B' }}>
                        {new Date(att.attemptedAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '600', color: '#0F172A' }}>
                        {att.assessmentTitle}
                      </td>
                      <td style={{ padding: '8px 10px', color: '#334155' }}>
                        {att.score} / {att.totalQuestions}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: '700', color: att.passed ? '#027A48' : '#D92D20' }}>
                        {Math.round(att.percentage)}%
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span className={`badge ${att.passed ? 'badge-green' : 'badge-pink'}`}>
                          {att.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!selectedStudentAudit.attempts || selectedStudentAudit.attempts.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#94A3B8' }}>
                        No assessment attempts recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h4 style={{ ...heading, fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>
              Issued Certificates ({selectedStudentAudit.certificates?.length || 0})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {selectedStudentAudit.certificates?.map((c) => (
                <div
                  key={c.certificateId}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFD',
                    border: '1px solid #CFDEF3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                  }}
                >
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#334155', marginRight: '8px' }}>
                      {c.certificateId}
                    </span>
                    <span style={{ color: '#0F172A', fontWeight: '600' }}>{c.courseTitle}</span>
                  </div>
                  <a
                    href={`/certificates/${c.certificateId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#64748B', fontWeight: '700', textDecoration: 'none', fontSize: '12px' }}
                  >
                    View ↗
                  </a>
                </div>
              ))}
              {(!selectedStudentAudit.certificates || selectedStudentAudit.certificates.length === 0) && (
                <div style={{ color: '#94A3B8', fontSize: '13px' }}>
                  No certificates issued for this student yet.
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setSelectedStudentAudit(null)}
                className="btn-secondary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: UPDATE PAYMENT QR CODE                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isQrModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div className="skill-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            border: '1px solid #CFDEF3',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <QrCode size={20} color="#586B84" />
                  <h3 style={{ ...heading, fontSize: '19px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Update Payment QR Code
                  </h3>
                </div>
                <p style={{ ...body, fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Upload a new payment QR code image when your receiving bank or UPI account changes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error banner if validation failed */}
            {qrModalError && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '13px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{qrModalError}</span>
              </div>
            )}

            {/* Current vs New QR Preview Area */}
            <div style={{
              backgroundColor: '#F8FAFD',
              borderRadius: '16px',
              border: '1px solid #CFDEF3',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: qrModalData.useCustom && qrModalData.qrImage ? '#ECFDF5' : '#E0EAFC',
                color: qrModalData.useCustom && qrModalData.qrImage ? '#027A48' : '#334155',
                border: '1px solid',
                borderColor: qrModalData.useCustom && qrModalData.qrImage ? '#A6F4C5' : '#CFDEF3',
                marginBottom: '12px',
              }}>
                {qrModalData.useCustom && qrModalData.qrImage ? 'Custom QR Code Active' : 'Dynamic Auto-Generated QR Active'}
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                marginBottom: '14px',
              }}>
                {qrModalData.useCustom && qrModalData.qrImage ? (
                  <img
                    src={qrModalData.qrImage}
                    alt="Payment QR Preview"
                    style={{ width: '180px', height: '180px', objectFit: 'contain', display: 'block', borderRadius: '6px' }}
                  />
                ) : (
                  <img
                    src={previewQr}
                    alt="Standard Dynamic QR"
                    style={{ width: '180px', height: '180px', objectFit: 'contain', display: 'block', borderRadius: '6px' }}
                  />
                )}
              </div>

              {qrModalData.useCustom && qrModalData.qrImage && (
                <button
                  type="button"
                  onClick={() => setQrModalData(prev => ({ ...prev, qrImage: '', useCustom: false }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Reset to dynamic auto-generated UPI QR
                </button>
              )}
            </div>

            {/* Upload File Input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ ...body, display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Upload New QR Code Image *
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleQrModalFileUpload}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #CFDEF3',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Allowed formats: PNG, JPG, JPEG, WEBP, or SVG (Max 5MB).
              </span>
            </div>

            {/* Associated Bank / Account Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
              <div>
                <label style={{ ...body, display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Receiving UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  value={qrModalData.upiId}
                  onChange={(e) => setQrModalData(prev => ({ ...prev, upiId: e.target.value }))}
                  placeholder="e.g. adz4needz@okaxis"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CFDEF3',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ ...body, display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Recipient / Account Name
                </label>
                <input
                  type="text"
                  value={qrModalData.recipientName}
                  onChange={(e) => setQrModalData(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="e.g. ADZ4NEEDZ"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CFDEF3',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '13.5px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQrModal}
                disabled={qrModalSaving}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '13.5px', backgroundColor: '#586B84' }}
              >
                <span>{qrModalSaving ? 'Saving QR Code...' : 'Save Payment QR Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </ModalPortal>
    </div>
  );
};
