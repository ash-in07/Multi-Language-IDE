import React, { useState } from 'react';
import { User, Lock, Mail, X, LogIn, UserPlus } from 'lucide-react';
import { authAPI } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let resp;
      if (isRegister) {
        resp = await authAPI.register(username, email, password);
      } else {
        resp = await authAPI.login(username, password);
      }

      if (resp.data.token) {
        localStorage.setItem('token', resp.data.token);
      }
      onAuthSuccess(resp.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '380px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            color: 'var(--text-muted)'
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
          {isRegister ? 'Create Student Account' : 'Sign In to Big Data Lab'}
        </h2>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          {isRegister 
            ? 'Access your dedicated workspace, datasets, and execution history.'
            : 'Welcome back! Enter your credentials to access your cloud workspace.'}
        </p>

        {error && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
              Username or ID
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="student_id or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px' }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
                University Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Sign In')}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: '#818cf8', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegister ? 'Sign In' : 'Register Here'}
          </span>
        </div>
      </div>
    </div>
  );
}

