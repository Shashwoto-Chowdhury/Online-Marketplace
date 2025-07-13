import { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

function RegisterPage({ setAuth, setRole }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmedPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('confirmed_password', confirmedPassword);
      formData.append('location', location);
      if (image) formData.append('image', image);

      const res = await fetch('$VITE_API_BASE_URL/users/auth/register/users', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setAuth(true);
        setRole(decoded.class);
        navigate('/user/home');
        toast.success("Registration successful");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };
//   if(loading) {
//     return <LoadingSpinner />;
//   }

  return (
    <div className="login-container">
      {/* <ToastContainer /> */}
      <div className="login-box">
        {!loading && (
        <>
            <h2 className="login-title">Register</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
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
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                required
                minLength={6}
            />
            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
            />
            <button type="submit">Register</button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <span
                onClick={() => navigate('/login')}
                style={{ color: '#2575fc', cursor: 'pointer', textDecoration: 'underline' }}
            >
                Login here
            </span>
            </p>
        </>
        )}
        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
}

export default RegisterPage;