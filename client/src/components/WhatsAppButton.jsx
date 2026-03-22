'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WhatsAppButton() {
  const [phoneInfo, setPhoneInfo] = useState('916264267644');

  useEffect(() => {
    api.get('/public/settings').then(({ data }) => {
      if (data.supportWhatsapp) {
        setPhoneInfo(data.supportWhatsapp.replace(/\D/g, ''));
      }
    }).catch(() => {});
  }, []);

  return (
    <a
      href={`https://wa.me/${phoneInfo}?text=Hello!%20I%20need%20help%20with%20my%20order.`}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: '#25D366',
        color: '#fff',
        borderRadius: '50%',
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        boxShadow: '0 4px 24px rgba(37,211,102,0.4)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 32px rgba(37,211,102,0.6)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,211,102,0.4)';
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: 34, height: 34, fill: '#fff' }}>
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.252.38 2.457 1.107 3.461l-.65 2.378 2.435-.639c.983.645 2.127.986 3.276.986h.001c3.181 0 5.767-2.586 5.768-5.766 0-3.181-2.586-5.767-5.769-5.767m0 10.603h-.001c-1.02-.001-2.022-.279-2.898-.807l-.208-.125-1.444.379.387-1.408-.137-.218A4.908 4.908 0 0 1 6.784 11.94c.001-2.892 2.355-5.245 5.249-5.245 2.893 0 5.247 2.354 5.247 5.246s-2.354 5.246-5.249 5.246m2.883-3.94c-.158-.079-.933-.461-1.078-.513-.145-.053-.25-.079-.355.079-.105.158-.408.513-.5.618-.093.105-.185.118-.342.04-.158-.079-.666-.246-1.27-.785-.469-.42-.785-.939-.878-1.098-.093-.158-.01-.244.069-.323.071-.07.158-.184.237-.276.079-.092.105-.158.158-.263.053-.105.026-.197-.013-.276-.04-.079-.355-.855-.487-1.171-.128-.309-.259-.267-.355-.272-.092-.004-.198-.005-.303-.005s-.277.039-.422.197c-.145.158-.553.54-.553 1.316s.566 1.526.645 1.632c.079.105 1.115 1.701 2.7 2.348.378.154.673.246.903.315.378.12.723.103.996.062.308-.046.933-.381 1.065-.75.132-.368.132-.684.093-.75-.04-.065-.145-.105-.303-.184zM12 2C6.477 2 2 6.477 2 12c0 1.815.485 3.518 1.34 5.03l-1.309 4.79 4.903-1.285A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    </a>
  );
}
