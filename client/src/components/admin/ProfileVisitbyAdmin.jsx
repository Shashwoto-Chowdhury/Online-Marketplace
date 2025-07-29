import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../ReviewCard';
import LoadingSpinner from '../LoadingSpinner';
import {
  FaUserCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBuilding,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaSortAmountUp
} from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ProfileVisitbyAdmin.css';

function StarRating({ rating, max = 5 }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} />);
    } else {
      stars.push(<FaRegStar key={i} />);
    }
  }
  return <span className="pv-star-row">{stars}</span>;
}

export default function ProfileVisitbyAdmin() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyer');
  const [banning, setBanning] = useState(false);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const res = await fetch(`${API}/profilevisit/${userId}`, { headers: { token } });
      const data = await res.json();
      setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [userId]);

  const sellerRating = profile
    ? (typeof profile.seller_rating === 'number'
        ? profile.seller_rating
        : parseFloat(profile.seller_rating) || 0)
    : 0;
  const buyerRating = profile
    ? (typeof profile.buyer_rating === 'number'
        ? profile.buyer_rating
        : parseFloat(profile.buyer_rating) || 0)
    : 0;

  const handleBanUser = async () => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    setBanning(true);
    try {
      const res = await fetch(`${API}/admin/banuser?userId=${userId}`, {
        method: 'POST',
        headers: { token }
      });
      if (!res.ok) throw new Error();
      toast.success('User has been banned');
      setProfile(prev => ({ ...prev, status: 'banned' }));
    } catch {
      toast.error('Failed to ban user');
    } finally {
      setBanning(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    setBanning(true);
    try {
      const res = await fetch(`${API}/admin/banuser/unban?userId=${userId}`, {
        method: 'POST',
        headers: { token }
      });
      if (!res.ok) throw new Error();
      toast.success('User has been unbanned');
      setProfile(prev => ({ ...prev, status: 'active' }));
    } catch {
      toast.error('Failed to unban user');
    } finally {
      setBanning(false);
    }
  };

  if (loading) {
    return (
      <div className="pv-page">
        <div className="pv-container pv-centered"><LoadingSpinner /></div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="pv-page">
        <div className="pv-container pv-centered">User not found</div>
      </div>
    );
  }

  const tabs = {
    buyer: profile.reviews.filter(r => r.review_type === 'buyer'),
    seller: profile.reviews.filter(r => r.review_type === 'seller')
  };

  return (
    <div className="pv-page">
      <div className="pv-container">
        <div className="pv-user-card">
          <div className="pv-user-img">
            {profile.image_url
              ? <img src={`${API}${profile.image_url}`} alt={profile.name} />
              : <FaUserCircle className="pv-default-avatar" />
            }
          </div>
          <h2 className="pv-user-name">{profile.name}</h2>
          <div className="pv-user-info">
            <div><FaEnvelope /> {profile.email}</div>
            <div><FaMapMarkerAlt /> {profile.location}</div>
            <div><FaBuilding /> {profile.type === 'company' ? 'Company' : 'User'}</div>
          </div>
          <div className="pv-user-stats">
            <div className="pv-stat-row">
              <span className="pv-label">Buyer Rating:</span>
              <StarRating rating={buyerRating} />
              <span className="pv-value">{buyerRating.toFixed(1)}</span>
            </div>
            <div className="pv-stat-row">
              <span className="pv-label">Seller Rating:</span>
              <StarRating rating={sellerRating} />
              <span className="pv-value">{sellerRating.toFixed(1)}</span>
            </div>
            <div className="pv-stat-row">
              <FaSortAmountUp />
              <span className="pv-value">{profile.sell_count}</span>
              <span className="pv-label">Sales</span>
            </div>
          </div>
          <div className="pv-admin-action">
            {profile.status !== 'banned' ? (
              <button
                className="pv-ban-btn"
                onClick={handleBanUser}
                disabled={banning}
              >
                <FiXCircle /> Ban the user
              </button>
            ) : (
              <button
                className="pv-unban-btn"
                onClick={handleUnbanUser}
                disabled={banning}
              >
                <FiXCircle /> Unban the user
              </button>
            )}
          </div>
        </div>

        <div className="pv-tabs">
          <div
            className={`pv-tab ${activeTab === 'buyer' ? 'active' : ''}`}
            onClick={() => setActiveTab('buyer')}
          >As Buyer</div>
          <div
            className={`pv-tab ${activeTab === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveTab('seller')}
          >As Seller</div>
        </div>

        <section className="pv-reviews">
          {tabs[activeTab].length === 0
            ? <p className="pv-no-rev">No reviews here</p>
            : tabs[activeTab].map(r => (
                <ReviewCard key={r.review_id} review={r} />
              ))
          }
        </section>
      </div>
    </div>
  );
}