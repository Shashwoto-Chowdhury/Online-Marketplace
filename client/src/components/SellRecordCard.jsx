import React, { useState } from 'react';
import { FaMapMarkerAlt, FaTag, FaImage, FaSortAmountUp } from 'react-icons/fa';
// import './SellRecordCard.css';

function SellRecordCard({ record, onClick }) {
  const [imgError, setImgError] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const fullImageUrl = `${API_BASE_URL}${record.image_url}`;

  return (
    <div className="product-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="product-img-container">
        {!imgError ? (
          <img
            src={fullImageUrl}
            alt={record.title}
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
          {record.title}
        </h4>
        <p className="product-price">$ {record.price}</p>
        <p className="product-location">
          <FaMapMarkerAlt style={{ marginRight: '0.3em', color: '#a5b4fc' }} />
          {record.location}
        </p>
        <p className="product-quantity" style={{ color: '#38d39f', fontWeight: 600 }}>
          <FaSortAmountUp style={{ marginRight: '0.3em', color: '#38d39f' }} />
          Quantity: {record.quantity}
        </p>
      </div>
    </div>
  );
}

export default React.memo(SellRecordCard);