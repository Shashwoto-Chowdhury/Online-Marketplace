import React, { useEffect, useState } from 'react';
import { FaUser, FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaStore } from 'react-icons/fa';
import ReviewCard from '../ReviewCard';
import './MyReviewsPage.css';
import { jwtDecode } from 'jwt-decode';

function MyReviewsPage() {
  const [tab, setTab] = useState('buyer');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
      } catch {
        setUserId(null);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/users/review/get/${tab}?userId=${userId}`, {
      headers: { token }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setReviews(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setReviews([]);
        setLoading(false);
      });
  }, [tab, userId]);

  return (
    <div className="myreviews-page-container">
      <aside className="myreviews-sidebar">
        <button
          className={`myreviews-tab-btn${tab === 'buyer' ? ' active' : ''}`}
          onClick={() => setTab('buyer')}
        >
          <FaShoppingCart /> Reviews as Buyer
        </button>
        <button
          className={`myreviews-tab-btn${tab === 'seller' ? ' active' : ''}`}
          onClick={() => setTab('seller')}
        >
          <FaStore /> Reviews as Seller
        </button>
      </aside>
      <main className="myreviews-main">
        {loading ? (
          <div className="myreviews-loading">Loading...</div>
        ) : (
          <div className="myreviews-list">
            {reviews.length === 0 ? (
              <div className="myreviews-empty">No reviews found.</div>
            ) : (
              reviews.map(review => (
                <ReviewCard key={review.review_id} review={review} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyReviewsPage;