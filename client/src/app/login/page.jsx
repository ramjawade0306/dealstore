'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { user, sendOTP, verifyOTP, login, register, resetPassword } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState('LOGIN'); // LOGIN, SIGNUP, FORGOT, VERIFY, RESET
  const [loginRole, setLoginRole] = useState('CUSTOMER'); // CUSTOMER, ADMIN
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { 
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user]);

  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    if (phone.length < 10) return toast.error('Enter valid phone number');
    setLoading(true);
    try {
      await sendOTP(phone);
      setMode('VERIFY_FORGOT');
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (phone.length < 10) return toast.error('Enter valid phone number');
    if (!name.trim()) return toast.error('Enter your full name');
    setLoading(true);
    try {
      await sendOTP(phone);
      setMode('VERIFY_SIGNUP');
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await verifyOTP(otp);
      await register(name, phone, password, token);
      toast.success('Account created and logged in!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP or Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await verifyOTP(otp);
      setIdToken(token);
      setMode('RESET_PASS');
      toast.success('OTP verified!');
    } catch (err) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password, loginRole.toLowerCase());
      toast.success('Welcome back!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      // If the error message is about phone/password mismatch, show "Invalid credentials"
      if (msg.toLowerCase().includes('invalid phone') || msg.toLowerCase().includes('invalid password')) {
        toast.error('Invalid credentials');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await resetPassword(phone, password, idToken);
      toast.success('Password updated! Please login.');
      setMode('LOGIN');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { position: 'relative', width: '100%', marginBottom: 16 };
  const toggleIcon = (
    <button type="button" onClick={() => setShowPassword(!showPassword)}
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#c9a84c', fontSize: 18, padding: 4, zIndex: 10 }}>
      {showPassword ? '👁️' : '🙈'}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#161616', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 24, padding: 40, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mode === 'LOGIN' ? 24 : 8 }}>
            <h1 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontWeight: 700 }}>
              {mode === 'LOGIN' ? (loginRole === 'ADMIN' ? 'Admin Access' : 'Welcome Back') : mode === 'SIGNUP' || mode === 'SIGNUP_FINAL' ? 'Join Luxury' : 'Reset Password'}
            </h1>
            <button type="button" onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: 28, cursor: 'pointer', lineHeight: 1 }}>
              &times;
            </button>
          </div>

          {mode !== 'LOGIN' && (
            <p style={{ color: '#6b6b6b', fontSize: 13, letterSpacing: '0.05em', marginTop: 8 }}>
              Experience affordable premium luxury
            </p>
          )}

        </div>

        <form onSubmit={
          mode === 'LOGIN' ? handleLogin :
          mode === 'SIGNUP' ? handleSignupSubmit :
          mode === 'FORGOT' ? handleSendForgotOTP :
          mode === 'VERIFY_SIGNUP' ? handleVerifySignupOTP :
          mode === 'VERIFY_FORGOT' ? handleVerifyForgotOTP :
          handleReset
        }>
          
          {/* SIGNUP MODE */}
          {mode === 'SIGNUP' && (
            <>
              <div style={inputStyle}>
                <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Full Name</label>
                <input className="input-luxury" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div style={inputStyle}>
                <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#c9a84c', fontWeight: 600, fontSize: 14 }}>+91</span>
                  <input className="input-luxury" type="tel" placeholder="XXXXXXXXXX" maxLength={10} value={phone} 
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} style={{ paddingLeft: 52 }} required />
                </div>
              </div>
              <div style={inputStyle}>
                <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Create Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-luxury" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  {toggleIcon}
                </div>
              </div>
              <div style={inputStyle}>
                <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Confirm Password</label>
                <input className="input-luxury" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </>
          )}

          {/* LOGIN & FORGOT MODE (Phone Input) */}
          {(mode === 'LOGIN' || mode === 'FORGOT') && (
            <div style={inputStyle}>
              <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#c9a84c', fontWeight: 600, fontSize: 14 }}>+91</span>
                <input className="input-luxury" type="tel" placeholder="XXXXXXXXXX" maxLength={10} value={phone} 
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} style={{ paddingLeft: 52 }} required />
              </div>
            </div>
          )}

          {/* LOGIN MODE (Password Input) */}
          {mode === 'LOGIN' && (
            <div style={inputStyle}>
              <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-luxury" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                {toggleIcon}
              </div>
              <button type="button" onClick={() => { setMode('FORGOT'); setPassword(''); }} style={{ background: 'none', color: '#6b6b6b', fontSize: 12, marginTop: 8, cursor: 'pointer' }}>Forgot Password?</button>
            </div>
          )}

          {/* VERIFY OTP MODE (For both Signup and Forgot Password) */}
          {(mode === 'VERIFY_SIGNUP' || mode === 'VERIFY_FORGOT') && (
            <div style={inputStyle}>
              <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Enter OTP sent to +91{phone}</label>
              <input className="input-luxury" type="text" placeholder="6-digit OTP" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required autoFocus />
            </div>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === 'RESET_PASS' && (
            <>
              <div style={inputStyle}>
                <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-luxury" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  {toggleIcon}
                </div>
              </div>
              <div style={inputStyle}>
                <label style={{ color: '#c9a84c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>Confirm New Password</label>
                <input className="input-luxury" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <button className="btn-gold" style={{ flex: 1, padding: '14px', fontSize: 15, marginTop: 12 }} disabled={loading}>
              {loading ? 'Processing...' : 
              mode === 'LOGIN' ? (loginRole === 'ADMIN' ? 'Admin Login' : 'Login') : 
              (mode === 'VERIFY_SIGNUP' || mode === 'VERIFY_FORGOT') ? 'Verify OTP' : 
              mode === 'SIGNUP' ? 'Sign Up & Send OTP' : 
              mode === 'FORGOT' ? 'Send OTP' : 
              'Update Password'}
            </button>
            
            {mode === 'LOGIN' && (
              <button 
                type="button"
                onClick={() => setLoginRole(loginRole === 'CUSTOMER' ? 'ADMIN' : 'CUSTOMER')}
                style={{ 
                  marginTop: 12,
                  background: 'rgba(201,168,76,0.05)', 
                  border: '1px solid rgba(201,168,76,0.3)', 
                  color: '#c9a84c', 
                  borderRadius: 12, 
                  padding: '0 15px', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(201,168,76,0.05)'; }}
              >
                {loginRole === 'CUSTOMER' ? 'Admin' : 'User'}
              </button>
            )}
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          {mode === 'LOGIN' ? (
            <p style={{ color: '#6b6b6b', fontSize: 13 }}>Don't have an account? <button onClick={() => { setMode('SIGNUP'); setPassword(''); }} style={{ color: '#c9a84c', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Sign Up</button></p>
          ) : (
            <button onClick={() => { setMode('LOGIN'); setPassword(''); setConfirmPassword(''); setOtp(''); }} style={{ color: '#c9a84c', background: 'none', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>← Back to Login</button>
          )}
        </div>

        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
