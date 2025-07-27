import { useState, useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaHistory, FaComments, FaUserCircle, FaStore, FaHeart, FaBars, FaTimes, FaLock } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { useChat } from '../context/ChatContext';
import './Navbar.css';

function Navbar({ setIsAuthenticated, setRole }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileTimeout = useRef(null);

  const { conversations, loadConversations } = useChat();
  useEffect(() => {
    loadConversations();
  }, []);

  //total unread messages across all conversations
  const unreadCount = conversations.reduce(
    (sum, conv) => sum + Number(conv.unread_count || 0),
    0
  );
  //console.log('Unread messages:', unreadCount);
  // Get user info from JWT
  const token = localStorage.getItem('token');
  let username = 'User';
  let user_type = 'normal';
  try {
    if (token) {
      const decoded = jwtDecode(token);
      username = decoded.name || 'User';
      user_type = decoded.type || decoded.class || 'normal';
    }
  } catch {
    // fallback to defaults
  }

  // Close menu on navigation
  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    if (setIsAuthenticated) setIsAuthenticated(false);
    if (setRole) setRole(null);
    navigate('/');
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // For hover on desktop
  const handleProfileMouseEnter = () => {
    clearTimeout(profileTimeout.current);
    setProfileOpen(true);
  };
  const handleProfileMouseLeave = () => {
    profileTimeout.current = setTimeout(() => setProfileOpen(false), 120);
  };

  // For click on mobile
  const handleProfileClick = (e) => {
    e.stopPropagation();
    setProfileOpen((open) => !open);
  };

  // Close dropdown on outside click (mobile)
  window.onclick = () => setProfileOpen(false);

  

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => handleNav('/user/home')}>
        <FaStore className="navbar-logo-icon" />
        <span>Marketplace 360</span>
      </div>
      <button
        className="navbar-hamburger"
        aria-label="Open menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <button title="Wishlist" onClick={() => handleNav('/user/wishlist')}>
          <FaHeart />
          <span>Wishlist</span>
        </button>
        <button title="Requests" onClick={() => handleNav('/user/requests')}>
          <FaHistory style={{ transform: 'scaleX(-1)' }} />
          <span>Requests</span>
        </button>
        <button title="Notifications" onClick={() => handleNav('/user/notifications')}>
          <FaBell />
          <span>Notifications</span>
        </button>
        <button title="History" onClick={() => handleNav('/user/history')}>
          <FaHistory />
          <span>History</span>
        </button>
        <button
          title="Messages"
          onClick={() => handleNav('/user/messages')}
          className="navbar-msg-btn"
        >
          <FaComments />
          {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}
          <span>Messages</span>
        </button>
        <div
          className="profile-dropdown-wrapper"
          onMouseEnter={handleProfileMouseEnter}
          onMouseLeave={handleProfileMouseLeave}
        >
          <button
            title="Profile"
            className="profile-btn"
            onClick={handleProfileClick}
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <FaUserCircle />
            <span>Profile</span>
          </button>
          {profileOpen && (
            <div className="profile-dropdown" onClick={e => e.stopPropagation()}>
              <div className="profile-dropdown-item username" onClick={() => handleNav('/user/details')}>
                {username}
              </div>
              <div className="profile-dropdown-item" onClick={() => handleNav('/user/reviews')}>
                Reviews
              </div>
              <div
                className={`profile-dropdown-item${user_type !== 'company' ? ' locked' : ''}`}
                onClick={user_type === 'company' ? () => handleNav('/user/offers') : undefined}
                title={user_type !== 'company' ? 'Only for company users' : ''}
              >
                Offers {user_type !== 'company' && <FaLock style={{ marginLeft: 6, fontSize: '0.95em' }} />}
              </div>
              <div className="profile-dropdown-item logout" onClick={handleLogout}>
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;