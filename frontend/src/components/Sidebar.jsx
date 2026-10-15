import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Library, 
  BookCheck, 
  BadgeCheck, 
  CircleUser, 
  ShieldCheck, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid },
    { name: 'Courses', path: '/courses', icon: Library },
    { name: 'My Learning', path: '/my-learning', icon: BookCheck },
    { name: 'Certificates', path: '/certificates', icon: BadgeCheck },
    { name: 'Profile', path: '/profile', icon: CircleUser },
  ];

  return (
    <aside style={{
      width: '250px',
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
      color: '#0F172A',
      zIndex: 10,
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
        <img
          src="/assets/adzivo_icon.png"
          alt="SkillCred Logo"
          style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0, color: '#0F172A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Skill<span style={{ color: '#64748B' }}>C</span>red
          </h2>
          <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '600', letterSpacing: '0.8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            By ADZ4NEEDZ
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontSize: '15px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#0F172A' : '#334155',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                boxShadow: isActive ? '0 4px 16px rgba(15, 23, 42, 0.08)' : 'none',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.8)' : '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              })}
            >
              <Icon size={20} strokeWidth={2} color="currentColor" style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div style={{
        borderTop: '1px solid #B8CEEE',
        paddingTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFFFF, #E0EAFC)',
            border: '1px solid #B8CEEE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: '#334155',
            fontSize: '15px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {user?.fullName || 'Learner'}
            </div>
            <div style={{ fontSize: '11px', color: '#475569', textTransform: 'capitalize', fontWeight: '500', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {user?.role?.toLowerCase() || 'Student'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            color: '#334155',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            border: '1px solid #B8CEEE',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderColor = '#FECACA';
            e.currentTarget.style.color = '#DC2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.65)';
            e.currentTarget.style.borderColor = '#B8CEEE';
            e.currentTarget.style.color = '#334155';
          }}
        >
          <LogOut size={16} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
