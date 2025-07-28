import { useEffect, useState } from 'react';
import { FaTimes, FaHeart, FaRegHeart, FaMapMarkerAlt, FaTag, FaUserCircle, FaComments, FaImage, FaSortAmountUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './ProductDetailsModal.css';
import { useChat } from '../context/ChatContext';

function ProductDetailsModal({ productId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [saving, setSaving] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { userId, startConversation } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/users/productdetails/${productId}`, {
        headers: { token }
      });
      const data = await res.json();
      setProduct(data);
      setLoading(false);

      // Check wishlist status
      const resWish = await fetch(`${API_BASE_URL}/users/wishlist/check?product_id=${productId}`, {
        headers: { token }
      });
      const wishData = await resWish.json();
      setWishlist(wishData.isWishlisted);
    };
    if (productId) fetchDetails();
  }, [productId]);

  const handleWishlist = async () => {
    if (!product || saving) return;
    setSaving(true);
    const token = localStorage.getItem('token');
    try {
      if (!wishlist) {
        await fetch(`${API_BASE_URL}/users/wishlist/add?product_id=${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', token }
        });
        setWishlist(true);
      } else {
        await fetch(`${API_BASE_URL}/users/wishlist/remove?product_id=${productId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', token }
        });
        setWishlist(false);
      }
    } catch (err) {}
    setSaving(false);
  };

  if (!productId) return null;

  return (
    <div className="productdetails-modal-overlay" onClick={onClose}>
      <div className="productdetails-modal-window" onClick={e => e.stopPropagation()}>
        <button className="productdetails-modal-close-btn" onClick={onClose} title="Close">
          <FaTimes />
        </button>
        {loading ? (
          <div className="productdetails-modal-loading">Loading...</div>
        ) : (
          <>
            <div className="productdetails-modal-images">
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <img key={idx} src={`${import.meta.env.VITE_API_BASE_URL}${img}`} alt={`Product ${idx}`} loading="lazy" />
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
                    ${(Number(product.price) * (1 - Number(product.offer_percentage) / 100)).toFixed(2)}
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
                <FaMapMarkerAlt style={{ marginRight: 6, color: '#a5b4fc' }} />
                {product.location}
              </p>
              <p>
                <FaSortAmountUp style={{ marginRight: 6, color: '#38d39f' }} />
                <b>Available Products:</b> {product.quantity}
              </p>
              <p>
                <b>Category:</b> {product.category} <b>Subcategory:</b> {product.sub_category}
              </p>
              <p>
                <b>Brand:</b> {product.brand}
              </p>
              <p className="productdetails-modal-description">{product.description}</p>
              <div className="productdetails-modal-seller">
                <FaUserCircle style={{ marginRight: 6, color: '#38bdf8' }} />
                <button
                  className="productdetails-modal-seller-btn"
                  onClick={() => navigate(`/user/profilevisit/${product.seller_id}`)}
                >
                  {product.seller_name}
                </button>
              </div>
              <div className="productdetails-modal-actions">
                <button
                  className={`productdetails-modal-wishlist-btn${wishlist ? ' saved' : ''}`}
                  onClick={handleWishlist}
                  disabled={saving}
                >
                  {wishlist ? <FaHeart /> : <FaRegHeart />}
                  {wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  className="productdetails-modal-convo-btn"
                  onClick={async () => {
                    const conv = await startConversation({
                      product_id: product.product_id,
                      request_id: null, // assuming this is a product, not a request
                      seller_id: product.seller_id,
                      buyer_id: userId || null
                    });
                    // optionally auto‐join is handled in ChatContext effect
                  }}
                >
                  <FaComments /> Start Conversation
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductDetailsModal;