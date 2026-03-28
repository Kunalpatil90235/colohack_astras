import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(user => {
      onLogin(user);
      setLoading(false);
    })
    .catch(err => {
      console.error('Login error:', err);
      setLoading(false);
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)', 
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          padding: '2.5rem 2rem', 
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'var(--primary-glow)', 
          borderRadius: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Smartphone size={40} color="var(--primary)" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Welcome to वानी</h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>आपका अपना डिजिटल बिज़नेस साथी। अपनी ईमेल के साथ आगे बढ़ें।</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="email" 
                placeholder="vendor@business.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 40px', 
                  borderRadius: '12px', 
                  border: '1px solid #ddd', 
                  fontSize: '1rem',
                  outline: 'none'
                }} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px', 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              fontSize: '1rem', 
              fontWeight: '700', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In Now'} 
            <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6 }}>
           <ShieldCheck size={16} />
           <span style={{ fontSize: '0.75rem' }}>100% Secure & Private Business Data</span>
        </div>
      </motion.div>

      <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.8 }}>
          <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Developed for Indian Micro-Entrepreneurs</p>
      </div>
    </div>
  );
};

export default LoginView;
