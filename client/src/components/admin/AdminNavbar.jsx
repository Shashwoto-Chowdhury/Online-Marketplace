import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaClipboardList, FaChartBar, FaUserCircle, FaChevronUp } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import './AdminNavbar.css';

function AdminNavbar({ setIsAuthenticated, setRole }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileTimeout = useRef(null);

  // Example admin name, replace with real admin info if available
  const adminName = 'Admin';

  const handleNav = (path) => {
    navigate(path);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    if (setIsAuthenticated) setIsAuthenticated(false);
    if (setRole) setRole(null);
    navigate('/admin/login');
    setProfileOpen(false);
  };

  const handleProfileMouseEnter = () => {
    clearTimeout(profileTimeout.current);
    setProfileOpen(true);
  };
  const handleProfileMouseLeave = () => {
    profileTimeout.current = setTimeout(() => setProfileOpen(false), 120);
  };
  const handleProfileClick = (e) => {
    e.stopPropagation();
    setProfileOpen(open => !open);
  };
  window.onclick = () => setProfileOpen(false);

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-logo" onClick={() => handleNav('/admin/dashboard')}>
        <FaUserShield className="admin-navbar-logo-icon" />
        <span>Admin Panel</span>
      </div>
      <div className="admin-navbar-links">
        <button onClick={() => handleNav('/admin/audit')}>
          <FaChartBar />
          <span>Audit</span>
        </button>
        <button onClick={() => handleNav('/admin/reports')}>
          <FaClipboardList />
          <span>Reports</span>
        </button>
        <button onClick={() => handleNav('/admin/upgraderequests')}>
          <FaChevronUp />
          <span>Upgrade Requests</span>
        </button>
        <button onClick={() => handleNav('/admin/broadcast')}>
          <FiSend />
          <span>Broadcast</span>
        </button>
        <div
          className="admin-profile-dropdown-wrapper"
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          <button
            className="admin-profile-btn"
            onClick={handleProfileClick}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <FaUserCircle />
            <span>Profile</span>
          </button>
          {profileOpen && (
            <div className="admin-profile-dropdown" onClick={e => e.stopPropagation()}>
              <div className="admin-profile-dropdown-item" onClick={() => handleNav('/admin/profile')}>
                {adminName}
              </div>
              <div className="admin-profile-dropdown-item logout" onClick={handleLogout}>
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;