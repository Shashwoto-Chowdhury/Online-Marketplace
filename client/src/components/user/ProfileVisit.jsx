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
  FaSortAmountUp,
} from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ProfileVisit.css';

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

export default function ProfileVisit() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyer');
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState('buyer');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleAddReview = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/users/review/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({
          reviewed_person_id: Number(userId),
          review_type: newType,
          rating: newRating,
          comment: newComment
        })
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setProfile(prev => ({
        ...prev,
        reviews: [created, ...prev.reviews]
      }));
      toast.success('Review submitted');
      setShowModal(false);
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
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

        <button className="pv-add-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Review
        </button>

        <section className="pv-reviews">
          {tabs[activeTab].length === 0
            ? <p className="pv-no-rev">No reviews here</p>
            : tabs[activeTab].map(r => (
                <ReviewCard key={r.review_id} review={r} />
              ))
          }
        </section>

        {showModal && (
          <div className="pv-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="pv-modal" onClick={e => e.stopPropagation()}>
              <h4>Add Review</h4>
              <label>
                Review Type:
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                >
                  <option value="buyer">As Buyer</option>
                  <option value="seller">As Seller</option>
                </select>
              </label>
              <label>
                Rating:
                <select
                  value={newRating}
                  onChange={e => setNewRating(Number(e.target.value))}
                >
                  {[5,4,3,2,1].map(n =>
                    <option key={n} value={n}>{n} ★</option>
                  )}
                </select>
              </label>
              <label>
                Comment:
                <textarea
                  rows="4"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write your review…"
                />
              </label>
              <div className="pv-modal-actions">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button
                  onClick={handleAddReview}
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}