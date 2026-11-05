import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import IdePage from './pages/IdePage';
import DocsPage from './pages/DocsPage';
import HistoryPage from './pages/HistoryPage';
import HdfsExplorer from './components/HdfsExplorer';
import { authAPI } from './services/api';
import './styles/theme.css';

export default function App() {
  const [activeNav, setActiveNav] = useState('ide'); // 'ide' | 'docs' | 'hdfs' | 'history'
  const [theme, setTheme] = useState('default');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check initial user authentication
    authAPI.getCurrentUser().then((res) => {
      setCurrentUser(res.data.user);
    }).catch(() => {
      setCurrentUser({ id: 1, username: 'student_guest', is_guest: true });
    });
  }, []);

  useEffect(() => {
    // Apply theme attribute to body
    if (theme === 'default') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    localStorage.removeItem('token');
    setCurrentUser({ id: 1, username: 'student_guest', is_guest: true });
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Application Navbar */}
      <Navbar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        currentTheme={theme}
        setTheme={setTheme}
      />

      {/* Main View Router */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {activeNav === 'ide' && <IdePage />}
        {activeNav === 'docs' && <DocsPage />}
        {activeNav === 'hdfs' && <HdfsExplorer />}
        {activeNav === 'history' && <HistoryPage />}
      </main>

      {/* Student Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
