import React from 'react';
import { 
  Terminal, 
  Database, 
  Code2, 
  BookOpen, 
  FolderGit2, 
  History, 
  HardDrive, 
  User, 
  Palette, 
  CheckCircle2, 
  LogOut,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ 
  activeNav, 
  setActiveNav, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  currentTheme,
  setTheme 
}) {
  return (
    <header style={{
      height: '52px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      userSelect: 'none',
      zIndex: 100
    }}>
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div 
          onClick={() => setActiveNav('ide')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer' 
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(99, 102, 241, 0.4)'
          }}>
            <Database size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', letterSpacing: '-0.3px', color: '#ffffff' }}>
              Big Data <span style={{ color: '#818cf8' }}>Online Lab</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '-2px' }}>
              Multi-Language IDE & Big Data Engine
            </div>
          </div>
        </div>

        {/* Cluster Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          color: '#34d399',
          fontWeight: '500'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'inline-block',
            boxShadow: '0 0 8px #10b981'
          }} />
          Hadoop & Pig Active
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => setActiveNav('ide')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: activeNav === 'ide' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeNav === 'ide' ? '#818cf8' : 'var(--text-muted)'
          }}
        >
          <Code2 size={15} />
          Editor & Lab
        </button>

        <button
          onClick={() => setActiveNav('docs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: activeNav === 'docs' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeNav === 'docs' ? '#818cf8' : 'var(--text-muted)'
          }}
        >
          <BookOpen size={15} />
          Documentation
        </button>

        <button
          onClick={() => setActiveNav('hdfs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: activeNav === 'hdfs' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeNav === 'hdfs' ? '#818cf8' : 'var(--text-muted)'
          }}
        >
          <HardDrive size={15} />
          HDFS Browser
        </button>

        <button
          onClick={() => setActiveNav('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            backgroundColor: activeNav === 'history' ? 'var(--bg-tertiary)' : 'transparent',
            color: activeNav === 'history' ? '#818cf8' : 'var(--text-muted)'
          }}
        >
          <History size={15} />
          Execution History
        </button>
      </nav>

      {/* Right Controls: Theme & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Theme Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={14} color="var(--text-muted)" />
          <select 
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px'
            }}
          >
            <option value="default">Dark Violet</option>
            <option value="midnight-blue">Midnight Blue</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>

        {/* User Account / Login */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'var(--bg-tertiary)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              color: '#ffffff'
            }}>
              <User size={14} color="#818cf8" />
              <span>{currentUser.username}</span>
              {currentUser.is_guest && (
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>(Guest)</span>
              )}
            </div>

            {currentUser.is_guest ? (
              <button
                onClick={onOpenAuth}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={onLogout}
                title="Log Out"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}

