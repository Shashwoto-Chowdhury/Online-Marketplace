import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CoverPage from './components/Coverpage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import UserHome from './components/user/HomePage';
import SellProduct from './components/user/SellProduct';
import UserDetails from './components/user/UserDetails';
import RequestProduct from './components/user/RequestProduct';
import WishlistPage from './components/user/WishlistPage';
import RequestsPage from './components/user/RequestsPage';
import HistoryPage from './components/user/HistoryPage';
import MyReviewsPage from './components/user/MyReviewsPage';
import OfferPage from './components/user/OfferPage';
import ProfileVisit from './components/user/ProfileVisit';
import AdminNavbar from './components/admin/AdminNavbar';
import AdminDashboard from './components/admin/Dashboard';

import { useState, useEffect, Fragment } from 'react';
import {jwtDecode} from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'; // If you want Navbar at the top level
import './App.css';
import { ChatProvider } from './context/ChatContext';
import ConversationsPage from './components/Chat/ConversationsPage';
import ChatWindow from './components/Chat/ChatWindow';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const classType = decoded.class;

        const verifyRoute =
          classType === "admin" ? `${API_BASE_URL}/admin/auth/verify` : `${API_BASE_URL}/users/auth/verify`;

        fetch(verifyRoute, {
          method: "GET",
          headers: {
            token: token,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.verified) {
              setIsAuthenticated(true);
              setRole(classType);
            } else {
              localStorage.removeItem("token");
              setIsAuthenticated(false);
              setRole(null);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error("Verification failed", err);
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setRole(null);
            setLoading(false);
          });
      } catch (err) {
        console.error("Token decoding failed", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setRole(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        {/* If you want Navbar globally, uncomment below: */}
        {isAuthenticated && role === 'admin' && <AdminNavbar setIsAuthenticated={setIsAuthenticated} setRole={setRole} />}
        <ChatProvider>
          {isAuthenticated && role === 'user' && <Navbar setIsAuthenticated={setIsAuthenticated} setRole={setRole} />}
          <Routes>
            <Route path="/" element={!isAuthenticated ? <CoverPage /> : <Navigate to={role === 'admin' ? "/admin/dashboard" : "/user/home"} />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage setAuth={setIsAuthenticated} setRole={setRole} /> : role==='user'? <Navigate to="/user/home" /> : <Navigate to="/admin/dashboard" />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <RegisterPage setAuth={setIsAuthenticated} setRole={setRole} /> : role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/home" />}
            />
            <Route
              path="/user/home"
              element={
                isAuthenticated ? role === 'user' ? <UserHome setIsAuthenticated={setIsAuthenticated} setRole={setRole} /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/details"
              element={
                isAuthenticated ? role === 'user' ? <UserDetails /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/sell"
              element={
                isAuthenticated ? role === 'user' ? <SellProduct /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/requestproduct"
              element={
                isAuthenticated ? role === 'user' ? <RequestProduct /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/wishlist"
              element={
                isAuthenticated ? role === 'user' ? <WishlistPage /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/requests"
              element={
                isAuthenticated ? role === 'user' ? <RequestsPage /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/history"
              element={
                isAuthenticated ? role === 'user' ? <HistoryPage /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/reviews"
              element={
                isAuthenticated ? role === 'user' ? <MyReviewsPage /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/offers"
              element={
                isAuthenticated ? role === 'user' ? <OfferPage /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />
              }
            />
            <Route
              path="/user/profilevisit/:userId"
              element={ isAuthenticated ? role === 'user' ? <ProfileVisit /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />}
            />
            <Route path="/user/messages" element={ isAuthenticated ? role ==='user' ? <ConversationsPage /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />} />
            <Route path="/user/chat/:id" element={ isAuthenticated ? role ==='user' ? <ChatWindow /> : <Navigate to="/admin/dashboard" /> : <Navigate to="/" />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                isAuthenticated ? role === 'admin' ? <AdminDashboard /> : <Navigate to="/user/home" /> : <Navigate to="/" />
              }
            />
          </Routes>
        </ChatProvider>
      </Router>
    </Fragment>
  );
}

export default App;