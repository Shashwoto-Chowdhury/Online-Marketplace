import React, { useEffect, useState } from 'react';
import { FaTimes, FaTag, FaMapMarkerAlt, FaImage, FaSortAmountUp, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useChat } from '../context/ChatContext';
import './SellRecordModal.css';

function SellRecordModal({ sellId, onClose }) {
  const { userId } = useChat();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/users/historypage/selldetails?sell_id=${sellId}`,
        { headers: { token } }
      );
      const data = await res.json();
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
          <div className="modal-loading"><LoadingSpinner /></div>
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

              <div className="modal-user-row">
                <FaUserCircle style={{ marginRight: 6, color: '#38bdf8' }} />
                <span className="modal-user-label">Buyer:</span>
                <button
                  className="history-modal-user-btn"
                  onClick={() => record.buyer_id !== userId ? navigate(`/user/profilevisit/${record.buyer_id}`) : navigate('/user/details')}
                >
                  {record.buyer_name}
                </button>
              </div>
              <div className="modal-user-row">
                <FaUserCircle style={{ marginRight: 6, color: '#38bdf8' }} />
                <span className="modal-user-label">Seller:</span>
                <button
                  className="history-modal-user-btn"
                  onClick={() => record.seller_id !==userId ? navigate(`/user/profilevisit/${record.seller_id}`) : navigate('/user/details')}
                >
                  {record.seller_name}
                </button>
              </div>

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