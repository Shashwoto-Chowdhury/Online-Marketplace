import { useEffect, useState } from 'react';
import { FaUserCircle, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaEdit, FaKey, FaTimes, FaStar, FaRegStar, FaStarHalfAlt, FaLock, FaUnlockAlt, FaArrowUp } from 'react-icons/fa';
import './UserDetails.css';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';

function StarRating({ rating, max = 5 }) {
  // rating: number (e.g. 4.3)
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} style={{ color: '#ffd700', marginRight: 2 }} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} style={{ color: '#ffd700', marginRight: 2 }} />);
    } else {
      stars.push(<FaRegStar key={i} style={{ color: '#ffd700', marginRight: 2 }} />);
    }
  }
  return <span>{stars}</span>;
}

function UserDetails() {
  const [user, setUser] = useState(null);
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [editPassOpen, setEditPassOpen] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: '', location: '' });
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [infoLoading, setInfoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [passError, setPassError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`${API_BASE_URL}/users/userdetails`, {
        headers: { token }
      });
      const data = await res.json();
      setUser(data);
      setInfoForm({ name: data.name, location: data.location });
    };
    fetchUser();
  }, [API_BASE_URL, token]);

  // Edit Info Handlers
  const handleInfoChange = e => setInfoForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleInfoSubmit = async e => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoError('');
    setInfoSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/userdetails/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify(infoForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(u => ({ ...u, ...infoForm }));
        setInfoSuccess('Information updated!');
        setEditInfoOpen(false);
        toast.success('Information updated successfully');
      } else {
        setInfoError(data.message || 'Update failed');
      }
    } catch {
      setInfoError('Update failed');
    }
    setInfoLoading(false);
  };

  // Edit Password Handlers
  const handlePassChange = e => setPassForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePassSubmit = async e => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');
    if (passForm.newPass !== passForm.confirm) {
      setPassError('New passwords do not match');
      setPassLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/users/userdetails/updatepassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({
          current: passForm.current,
          newPass: passForm.newPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPassSuccess('Password updated!');
        setEditPassOpen(false);
        toast.success('Password updated successfully');
      } else {
        setPassError(data.message || 'Password update failed');
      }
    } catch {
      setPassError('Password update failed');
    }
    setPassLoading(false);
  };

  // Upgrade to company request handler
  const handleUpgradeRequest = async () => {
    setUpgradeLoading(true);
    try {
      // This endpoint should be implemented later
      await fetch(`${API_BASE_URL}/users/upgrade-request`, {
        method: 'POST',
        headers: { token },
      });
      toast.success('Upgrade request sent to admin!');
    } catch {
      toast.error('Failed to send upgrade request');
    }
    setUpgradeLoading(false);
  };

  return (
    <div className="user-details-outer">
      {!user && <LoadingSpinner />}
      {user && (
        <div className="user-details-content">
          <div className="user-details-main">
            <div className="user-details-img">
              {user.image_url
                ? <img src={`${API_BASE_URL}${user.image_url}`} alt="User" />
                : <FaUserCircle style={{ fontSize: 90, color: '#38bdf8' }} />}
            </div>
            <h2 className="user-details-name">{user.name}</h2>
            <div className="user-details-info">
              <div><FaEnvelope style={{ marginRight: 8, color: '#90caf9' }} />{user.email}</div>
              <div><FaMapMarkerAlt style={{ marginRight: 8, color: '#ffca28' }} />{user.location}</div>
              <div>
                <FaBuilding style={{ marginRight: 8, color: '#7e57c2' }} />
                {user.type === 'company' ? 'Company' : 'Normal User'}
              </div>
            </div>
            <div className="user-details-ratings">
              <div className="user-rating-row">
                <span className="user-rating-label">Rating as a Buyer:</span>
                <StarRating rating={user.buyer_rating || 0} />
                <span className="user-rating-value">{user.buyer_rating ? user.buyer_rating : 'N/A'}</span>
              </div>
              <div className="user-rating-row">
                <span className="user-rating-label">Rating as a Seller:</span>
                <StarRating rating={user.seller_rating || 0} />
                <span className="user-rating-value">{user.seller_rating ? user.seller_rating : 'N/A'}</span>
              </div>
              <div className="user-rating-row">
                <span className="user-rating-label">Products Sold:</span>
                <span className="user-rating-value">{user.sell_count ?? 'N/A'}</span>
              </div>
            </div>
            {/* Place upgrade button below ratings, full width */}
            {user.type === 'normal' && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <button
                  className="upgrade-btn"
                  disabled={
                    !(user.seller_rating >= 4 && user.sell_count >= 3) || upgradeLoading
                  }
                  style={{
                    width: '100%',
                    maxWidth: 340,
                    background:
                      user.seller_rating >= 4 && user.sell_count >= 3
                        ? 'linear-gradient(90deg, #38d39f 0%, #38bdf8 100%)'
                        : '#232946',
                    color:
                      user.seller_rating >= 4 && user.sell_count >= 3
                        ? '#fff'
                        : '#aaa',
                    border:
                      user.seller_rating >= 4 && user.sell_count >= 3
                        ? '1.5px solid #38d39f'
                        : '1.5px solid #aaa',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor:
                      user.seller_rating >= 4 && user.sell_count >= 3
                        ? 'pointer'
                        : 'not-allowed',
                    boxShadow:
                      user.seller_rating >= 4 && user.sell_count >= 3
                        ? '0 2px 8px rgba(56,211,159,0.10)'
                        : 'none',
                    transition: 'background 0.2s, color 0.2s, border 0.2s',
                  }}
                  onClick={handleUpgradeRequest}
                  title={
                    user.seller_rating >= 4 && user.sell_count >= 3
                      ? 'Request upgrade to company'
                      : 'You are not eligible for upgrade yet'
                  }
                >
                  {user.seller_rating >= 4 && user.sell_count >= 3 ? (
                    <FaUnlockAlt style={{ color: '#fff', fontSize: 20 }} />
                  ) : (
                    <FaLock style={{ color: '#aaa', fontSize: 20 }} />
                  )}
                  <FaArrowUp style={{ marginLeft: 4, fontSize: 18 }} />
                  Upgrade to Company
                </button>
              </div>
            )}
            {/* Edit buttons below everything else */}
            <div className="user-details-actions" style={{ marginTop: 24 }}>
              <button className="edit-btn" onClick={() => setEditInfoOpen(true)}>
                <FaEdit style={{ marginRight: 7 }} /> Edit Information
              </button>
              <button className="edit-btn" onClick={() => setEditPassOpen(true)}>
                <FaKey style={{ marginRight: 7 }} /> Edit Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Info Modal */}
      {editInfoOpen && (
        <div className="userdetails-modal-overlay" onClick={() => setEditInfoOpen(false)}>
          <div className="userdetails-modal-window" style={{ maxWidth: 370 }} onClick={e => e.stopPropagation()}>
            <button className="userdetails-modal-close-btn" onClick={() => setEditInfoOpen(false)}><FaTimes /></button>
            <h3 style={{ color: '#38bdf8', marginBottom: 18 }}>Edit Information</h3>
            <form onSubmit={handleInfoSubmit} className="user-details-form">
              <label>
                Name
                <input name="name" value={infoForm.name} onChange={handleInfoChange} required />
              </label>
              <label>
                Location
                <input name="location" value={infoForm.location} onChange={handleInfoChange} required />
              </label>
              {infoError && <div className="form-error">{infoError}</div>}
              <button type="submit" className="edit-btn" disabled={infoLoading}>
                {infoLoading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {editPassOpen && (
        <div className="userdetails-modal-overlay" onClick={() => setEditPassOpen(false)}>
          <div className="userdetails-modal-window" style={{ maxWidth: 370 }} onClick={e => e.stopPropagation()}>
            <button className="userdetails-modal-close-btn" onClick={() => setEditPassOpen(false)}><FaTimes /></button>
            <h3 style={{ color: '#38bdf8', marginBottom: 18 }}>Edit Password</h3>
            <form onSubmit={handlePassSubmit} className="user-details-form">
              <label>
                Current Password
                <input type="password" name="current" value={passForm.current} onChange={handlePassChange} required />
              </label>
              <label>
                New Password
                <input type="password" name="newPass" value={passForm.newPass} onChange={handlePassChange} required />
              </label>
              <label>
                Confirm New Password
                <input type="password" name="confirm" value={passForm.confirm} onChange={handlePassChange} required />
              </label>
              {passError && <div className="form-error">{passError}</div>}
              <button type="submit" className="edit-btn" disabled={passLoading}>
                {passLoading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetails;