import React, { useState } from 'react';
import { FaMapMarkerAlt, FaTag, FaImage } from 'react-icons/fa';
// import './MyProductCard.css';

function MyProductCard({ product, onClick }) {
  const [imgError, setImgError] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const fullImageUrl = `${API_BASE_URL}${product.image_url}`;

  return (
    <div className="product-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="product-img-container">
        {!imgError ? (
          <img
            src={fullImageUrl}
            alt={product.title}
            loading="lazy"
            className="product-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="product-img-fallback">
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
  );
}

export default React.memo(MyProductCard);