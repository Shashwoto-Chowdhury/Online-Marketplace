import React, { useEffect, useState } from 'react';
import {
  FaTimes,
  FaImage,
  FaMapMarkerAlt,
  FaTag,
  FaUserCircle,
  FaSortAmountUp
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../ProductDetailsModal.css';

export default function ReportProductDetailsModal({ productId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/admin/productdetails/${productId}`,
          { headers: { token } }
        );
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchDetails();
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="productdetails-modal-overlay" onClick={onClose}>
      <div
        className="productdetails-modal-window"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="productdetails-modal-close-btn"
          onClick={onClose}
          title="Close"
        >
          <FaTimes />
        </button>

        {loading ? (
          <div className="productdetails-modal-loading">Loading...</div>
        ) : (
          <>
            <div className="productdetails-modal-images">
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${API}${img}`}
                    alt={`Product ${idx}`}
                    loading="lazy"
                  />
                ))
              ) : (
                <div className="productdetails-modal-img-fallback">
                  <FaImage className="productdetails-fallback-icon" />
                  <span>No Images</span>
                </div>
              )}
            </div>

            <div className="productdetails-modal-info">
              <h2>
                <FaTag style={{ marginRight: 8, color: '#38bdf8' }} />
                {product.title}
              </h2>

              {product.offer_percentage > 0 ? (
                <div className="productdetails-modal-price-container">
                  <span className="productdetails-modal-old-price">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="productdetails-modal-new-price">
                    {`$${(
                      Number(product.price) *
                      (1 - Number(product.offer_percentage) / 100)
                    ).toFixed(2)}`}
                  </span>
                  <span className="productdetails-modal-discount-badge">
                    -{Number(product.offer_percentage)}%
                  </span>
                </div>
              ) : (
                <p className="productdetails-modal-price">
                  ${Number(product.price).toFixed(2)}
                </p>
              )}

              <p>
                <FaMapMarkerAlt
                  style={{ marginRight: 6, color: '#a5b4fc' }}
                />
                {product.location}
              </p>
              <p>
                <FaSortAmountUp
                  style={{ marginRight: 6, color: '#38d39f' }}
                />
                <b>Available:</b> {product.quantity}
              </p>
              <p>
                <b>Category:</b> {product.category}{' '}
                <b>Subcategory:</b> {product.sub_category}
              </p>
              <p>
                <b>Brand:</b> {product.brand}
              </p>
              <p className="productdetails-modal-description">
                {product.description}
              </p>
              <div className="productdetails-modal-seller">
                <FaUserCircle
                  style={{ marginRight: 6, color: '#38bdf8' }}
                />
                <button
                  className="productdetails-modal-seller-btn"
                  onClick={() =>
                    navigate(`/admin/profilevisit/${product.seller_id}`)
                  }
                >
                  {product.seller_name}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}