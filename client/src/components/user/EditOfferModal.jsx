import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './OfferModal.css';

function EditOfferModal({ offer, onClose, onUpdate }) {
  const [percentage, setPercentage] = useState(offer.percentage);
  const [requiredBuying, setRequiredBuying] = useState(offer.required_buying);
  const [submitting, setSubmitting] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', token };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/users/offers/update/${offer.offer_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          percentage: Number(percentage),
          required_buying: Number(requiredBuying)
        })
      });
      const data = await res.json();
      if (res.ok) onUpdate(data);
      else alert(data.error || 'Failed to update.');
    } catch {
      alert('Failed to update.');
    }
    setSubmitting(false);
  };

  return (
    <div className="offer-modal-overlay" onClick={onClose}>
      <div className="offer-modal-window" onClick={e => e.stopPropagation()}>
        <button className="offer-modal-close" onClick={onClose}><FaTimes /></button>
        <h2>Edit Offer</h2>
        <form className="offer-modal-form" onSubmit={handleSubmit}>
          <label>
            Discount %
            <input
              type="number"
              min="1"
              max="100"
              required
              value={percentage}
              onChange={e => setPercentage(e.target.value)}
            />
          </label>
          <label>
            Min Purchase
            <input
              type="number"
              min="0"
              required
              value={requiredBuying}
              onChange={e => setRequiredBuying(e.target.value)}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditOfferModal;