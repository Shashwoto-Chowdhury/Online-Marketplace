import React, { useEffect, useState } from 'react';
import { FaTimes, FaTag, FaMapMarkerAlt, FaImage, FaSortAmountUp } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';
import './SellRecordModal.css';

function SellRecordModal({ sellId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/historypage/selldetails?sell_id=${sellId}`, {
        headers: { token }
      });
      const data = await res.json();
      console.log(data);
      setRecord(data);
      setLoading(false);
    };
    if (sellId) fetchDetails();
  }, [sellId]);

  if (!sellId) return null;

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal-window" onClick={e => e.stopPropagation()}>
        <button className="history-modal-close-btn" onClick={onClose} title="Close">
          <FaTimes />
        </button>
        {loading ? (
          <div className="modal-loading">Loading...</div>
        ) : (
          <>
            <div className="modal-images">
              {record.image_url ? (
                <img src={`${API_BASE_URL}${record.image_url}`} alt="Product" loading="lazy" />
              ) : (
                <div className="modal-img-fallback">
                  <FaImage className="fallback-icon" />
                  <span>No Images</span>
                </div>
              )}
            </div>
            <div className="modal-info">
              <h2>
                <FaTag style={{ marginRight: 8, color: '#38bdf8' }} />
                {record.title}
              </h2>
              <p className="modal-price">$ {record.selling_price}</p>
              <p>
                <FaMapMarkerAlt style={{ marginRight: 6, color: '#a5b4fc' }} />
                {record.location}
              </p>
              <p>
                <FaSortAmountUp style={{ marginRight: 6, color: '#38d39f' }} />
                <b>Sold Quantity:</b> {record.quantity}
              </p>
              <p>
                <b>Category:</b> {record.category} <b>Subcategory:</b> {record.subcategory}
              </p>
              <p>
                <b>Brand:</b> {record.brand}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SellRecordModal;