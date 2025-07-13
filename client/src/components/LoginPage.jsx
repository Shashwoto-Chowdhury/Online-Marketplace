import { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import LoadingSpinner from './LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginPage({ setAuth, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState('user');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = roleType === 'admin' ? `${API_BASE_URL}/admin/auth/login` : `${API_BASE_URL}/users/auth/login`;

    try {
      setLoading(true);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setAuth(true);
        setRole(decoded.class);
        console.log('Decoded token:', decoded.class);
        if (decoded.class === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/home');
        }
        toast.success('Login successful');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Login error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      {/* <ToastContainer /> */}
      <div className="login-box">
      {!loading && (
        <>
          <h2 className="login-title">Login</h2>
          <div className="login-toggle">
            <button
              className={roleType === 'user' ? 'active' : ''}
              onClick={() => setRoleType('user')}
            >User</button>
            <button
              className={roleType === 'admin' ? 'active' : ''}
              onClick={() => setRoleType('admin')}
            >Admin</button>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button type="submit">Login</button>
          </form>
          {roleType === 'user' && (
            <p style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/register')}
                style={{ color: '#2575fc', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Register here
              </span>
            </p>
          )}
        </>
      )}
      {loading && <LoadingSpinner />}
      </div>

    </div>
  );
}

export default LoginPage;