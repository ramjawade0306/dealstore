'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import api from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('lpl_user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else if (storedUser && !token) {
      localStorage.removeItem('lpl_user');
    }
    setLoading(false);
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const sendOTP = async (phoneNumber) => {
    setupRecaptcha();
    try {
      // Ensure +91 prefix
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      return confirmation;
    } catch (error) {
      console.error('OTP Send Error:', error);
      throw error;
    }
  };

  const verifyOTP = async (otp) => {
    if (!confirmationResult) {
      throw new Error("Confirmation result not found. Please send OTP first.");
    }
    const result = await confirmationResult.confirm(otp);
    const idToken = await result.user.getIdToken();
    return idToken; // Return idToken for registration/login
  };

  const register = async (name, phoneNumber, password, idToken) => {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const { data } = await api.post('/users/register', { name, phoneNumber: formattedPhone, password, idToken });
    setUser(data);
    localStorage.setItem('lpl_user', JSON.stringify(data));
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  };

  const login = async (phoneNumber, password, expectedRole) => {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    const { data } = await api.post('/users/login', { phoneNumber: formattedPhone, password });
    
    if (expectedRole === 'customer' && data.role === 'user') {
      // Valid customer login mapping
    } else if (expectedRole && data.role !== expectedRole) {
      throw { response: { data: { message: `Invalid credentials for ${expectedRole.toUpperCase()} portal.` } } };
    }

    setUser(data);
    localStorage.setItem('lpl_user', JSON.stringify(data));
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  };

  const resetPassword = async (phoneNumber, password, idToken) => {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    await api.post('/users/reset-password', { phoneNumber: formattedPhone, password, idToken });
  };

  const logout = () => {
    localStorage.removeItem('lpl_user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, register, login, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
