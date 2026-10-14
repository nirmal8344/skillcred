import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TopBar = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px',
      gap: '20px',
      flexWrap: 'wrap',
    }}>
      {/* Title & Greeting */}
      <div>
        {title ? (
          <>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '26px',
              fontWeight: '600',
              color: '#0F172A',
              letterSpacing: '-0.5px',
              margin: 0,
            }}>
              {title}
            </h1>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              fontWeight: '400',
              color: '#64748B',
              margin: '5px 0 0 0',
            }}>
              {subtitle}
            </p>
          </>
        ) : (
          <>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '48px',
              fontWeight: 400,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              margin: 0,
            }}>
              Invest in your<br />education.
            </h1>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              fontWeight: '600',
              color: '#0F172A',
              marginTop: '14px',
            }}>
              {user?.fullName && user.fullName !== 'Gowtham' ? user.fullName : 'Nirmalkumar'}
            </div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              fontWeight: '400',
              color: '#64748B',
              margin: '5px 0 0 0',
            }}>
              {subtitle || 'Explore your courses, track assignments, and earn verified credentials.'}
            </p>
          </>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '999px',
          border: '1px solid #CFDEF3',
          boxShadow: '0 2px 10px rgba(207, 222, 243, 0.3)',
          width: '280px',
        }}>
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search courses, skills..."
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              width: '100%',
              color: '#0F172A',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </header>
  );
};

