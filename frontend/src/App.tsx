import React, { useState, useEffect } from 'react'
import LoginPage from './pages/Login'
import MainLayout from './components/layout/MainLayout'
import ParallaxBackground from './components/ParallaxBackground'
import { Toaster } from 'react-hot-toast'

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedLogin = localStorage.getItem('userLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userSicil');
    setIsLoggedIn(false);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
            style: {
                background: '#ffffff',
                color: '#1e293b',
                padding: '16px 24px',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 20px 25px -5px rgba(0, 35, 102, 0.1), 0 8px 10px -6px rgba(0, 35, 102, 0.05)',
                fontWeight: '600',
                fontSize: '14px'
            },
            success: {
                iconTheme: {
                    primary: '#002366',
                    secondary: '#D4AF37',
                },
            }
        }}
      />
      {!isLoggedIn && <ParallaxBackground />}
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <MainLayout onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
