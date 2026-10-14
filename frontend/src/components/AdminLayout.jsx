import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Layers, 
  CreditCard, 
  Settings, 
  BookOpen, 
  Database, 
  Users, 
  Award, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  AlertTriangle,
  Bell,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/admin/payments/pending')
        .then(data => {
          if (Array.isArray(data)) setPendingPaymentsCount(data.length);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleAdminLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#F0F4F8',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: '4px solid #CFDEF3',
            borderTop: '4px solid #2563EB',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Validating Administrator Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in as student -> deny access and redirect to student dashboard
  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin Navigation Items
  const adminNav = [
    { id: 'overview', name: 'Overview', icon: Layers },
    { id: 'payments', name: 'Payment Verification', icon: CreditCard, badge: pendingPaymentsCount },
    { id: 'settings', name: 'UPI Payment Settings', icon: Settings },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'questions', name: 'Question Bank', icon: Database },
    { id: 'students', name: 'Student Management', icon: Users },
    { id: 'certificates', name: 'Certificate Registry', icon: Award },
    { id: 'audit', name: 'Audit & Reports', icon: FileText },
  ];

  const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F0F4F8',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* ─── Dedicated Admin Sidebar ─── */}
      <aside style={{
        width: '260px',
        background: 'linear-gradient(180deg, #E0EAFC 0%, #CFDEF3 100%)',
        borderRadius: '24px',
        margin: '16px 0 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        border: '1px solid #BDD3F0',
        boxShadow: '0 8px 30px rgba(148, 163, 184, 0.25)',
        height: 'calc(100vh - 32px)',
        position: 'sticky',
        top: '16px',
        zIndex: 20,
        boxSizing: 'border-box',
      }}>
        {/* Admin Brand Header — matches Student sidebar logo layout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <img
            src="/assets/adzivo_icon.png"
            alt="SkillCred Logo"
            style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Skill<span style={{ color: '#2563EB' }}>C</span>red
              </h2>
              <span style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '9.5px',
                fontWeight: '800',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.4px',
              }}>
                ADMIN
              </span>
            </div>
            <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '600', letterSpacing: '0.8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              By ADZ4NEEDZ
            </span>
          </div>
        </div>

        {/* Admin Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/admin?tab=${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#1E40AF' : '#334155',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  boxShadow: isActive ? '0 4px 14px rgba(15, 23, 42, 0.08)' : 'none',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.9)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} color={isActive ? '#1E40AF' : '#64748B'} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.badge > 0 && (
                  <span style={{
                    backgroundColor: '#D92D20',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 7px',
                    borderRadius: '999px',
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin User Card & Logout */}
        <div style={{
          borderTop: '1px solid #B8CEEE',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#FFFFFF',
              fontSize: '14px',
            }}>
              A
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || 'Administrator'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#1E40AF', fontWeight: '700', letterSpacing: '0.3px' }}>
                SYSTEM ADMIN
              </div>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              color: '#334155',
              fontSize: '12.5px',
              fontWeight: '700',
              border: '1px solid #B8CEEE',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
              e.currentTarget.style.borderColor = '#FCA5A5';
              e.currentTarget.style.color = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';
              e.currentTarget.style.borderColor = '#B8CEEE';
              e.currentTarget.style.color = '#334155';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Admin Workspace ─── */}
      <main style={{
        flex: 1,
        padding: '24px 32px 48px 32px',
        overflowY: 'auto',
        maxHeight: '100vh',
        boxSizing: 'border-box',
      }}>
        <Outlet context={{ currentTab, refreshPendingCount: () => {
          api.get('/admin/payments/pending').then(data => {
            if (Array.isArray(data)) setPendingPaymentsCount(data.length);
          }).catch(() => {});
        }}} />
      </main>
    </div>
  );
};
