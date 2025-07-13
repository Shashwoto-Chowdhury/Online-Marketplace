// src/components/ProductCard.jsx
import React, { useEffect, useState } from 'react';
import { FaRegHeart, FaHeart, FaMapMarkerAlt, FaTag, FaImage, FaFlag } from 'react-icons/fa';
import ProductReportModal from './ProductReportModal';
import './ProductCard.css';

function ProductCard({ product, onClick }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const fullImageUrl = `${API_BASE_URL}${product.image_url}`;

  const token = localStorage.getItem('token');

  // Check if product is already in wishlist on mount
  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/wishlist/check?product_id=${product.product_id}`, {
          headers: { token }
        });
        const data = await res.json();
        setSaved(data.isWishlisted);
      } catch (err) {
        // Optionally handle error
      }
    };
    checkWishlist();
  }, [product.product_id, token]);

  const handleWishlist = async (e) => {
    e.stopPropagation(); // Prevent modal open
    if (saving) return;
    setSaving(true);
    try {
      if (!saved) {
        await fetch(`${API_BASE_URL}/users/wishlist/add?product_id=${product.product_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', token }
        });
        setSaved(true);
      } else {
        await fetch(`${API_BASE_URL}/users/wishlist/remove?product_id=${product.product_id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', token }
        });
        setSaved(false);
      }
    } catch (err) {
      // Optionally handle error
    }
    setSaving(false);
  };

  const handleReportClick = (e) => {
    e.stopPropagation();
    setShowReport(true);
  };

  return (
    <>
      <div className="product-card" onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className="product-img-container">
          {/* Report button - top left */}
          <button
            className="product-report-btn"
            onClick={handleReportClick}
            title="Report Product"
          >
            <FaFlag />
          </button>
          {/* Wishlist button - top right */}
          <button
            className="wishlist-btn"
            onClick={handleWishlist}
            disabled={saving}
            title={saved ? "Remove from wishlist" : "Add to wishlist"}
          >
            {saved ? <FaHeart className="wishlist-icon saved" /> : <FaRegHeart className="wishlist-icon" />}
          </button>
          {!imgError ? (
            <img
              src={fullImageUrl}
              alt={product.title}
              loading="lazy"
              className="product-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="product-img-fallback" >
              <FaImage className="fallback-icon" />
              <span>No Image</span>
            </div>
          )}
        </div>
        <div className="product-info">
          <h4 className="product-title">
            <FaTag style={{ marginRight: '0.4em', color: '#38bdf8' }} />
            {product.title}
          </h4>
          <p className="product-price">$ {product.price}</p>
          <p className="product-location">
            <FaMapMarkerAlt style={{ marginRight: '0.3em', color: '#a5b4fc' }} />
            {product.location}
          </p>
        </div>
      </div>
      {showReport && (
        <ProductReportModal
          productId={product.product_id}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}

export default React.memo(ProductCard);
