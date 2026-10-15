import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export const AppLayout = () => {
  const { user, loading } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            borderTop: '4px solid #586B84',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
            Loading SkillCred...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="app-container">
      {/* ─── Student Mobile Top Header (<= 1024px) ─── */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/assets/adzivo_icon.png"
              alt="SkillCred Logo"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Skill<span style={{ color: '#2563EB' }}>C</span>red
              </h2>
              <span style={{ fontSize: '9.5px', color: '#475569', fontWeight: '600', letterSpacing: '0.6px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                By ADZ4NEEDZ
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Drawer Backdrop Overlay ─── */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* ─── Student Sidebar (Desktop Sticky / Mobile Drawer) ─── */}
      <Sidebar
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
