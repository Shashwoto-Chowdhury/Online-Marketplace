import React, { useEffect, useState } from 'react';
import { FaTimes, FaComments } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

function AllRequestDetailsModal({ requestId, onClose, onStartConversation }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/users/productrequest/details?request_id=${requestId}`, {
      headers: { token }
    })
      .then(res => res.json())
      .then(data => {
        setDetails(data);
        setLoading(false);
      });
  }, [requestId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><FaTimes /></button>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <h2 style={{ color: '#38bdf8', marginBottom: 10 }}>{details.title}</h2>
            <div style={{ marginBottom: 10, color: '#e0e7ef' }}>{details.description}</div>
            <div style={{ marginBottom: 10, color: '#ff6b6b' }}>
              <b>Location:</b> {details.location}
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Category:</b> {details.category}<br />
              <b>Subcategory:</b> {details.sub_category}<br />
              <b>Brand:</b> {details.brand}
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Requested By:</b> {details.requester_name}
            </div>
            <button
              className="request-modal-action-btn green"
              onClick={() => onStartConversation(details)}
            >
              <FaComments style={{ marginRight: 8 }} />
              Start Conversation
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AllRequestDetailsModal;