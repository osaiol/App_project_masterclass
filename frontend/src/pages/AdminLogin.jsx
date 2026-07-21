import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/admin/login`, credentials);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', paddingTop: '60px' }}>
      <div className="card glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'var(--cyan-blue-light)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={32} className="text-cyan-blue" />
          </div>
          <h2>Admin Login</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to manage bookings</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><User size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px' }}/> Username</label>
            <input 
              type="text" 
              name="username" 
              required 
              value={credentials.username}
              onChange={handleInputChange}
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} style={{ display:'inline', verticalAlign:'middle', marginRight:'6px' }}/> Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              value={credentials.password}
              onChange={handleInputChange}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
