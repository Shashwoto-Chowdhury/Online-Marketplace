import React, { useEffect, useState } from 'react';
import { FaTimes, FaTrash } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';

function MyRequestDetailsModal({ requestId, onClose, onDelete }) {
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

  const handleDelete = async () => {
    if (!window.confirm('Delete this request?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/productrequest/delete?request_id=${requestId}`, {
        method: 'DELETE',
        headers: { token }
      });
      if (res.ok) {
        toast.success('Request deleted');
        onDelete(requestId);
        onClose();
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

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
              className="request-modal-action-btn"
              onClick={handleDelete}
            >
              <FaTrash style={{ marginRight: 8 }} />
              Delete Request
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MyRequestDetailsModal;