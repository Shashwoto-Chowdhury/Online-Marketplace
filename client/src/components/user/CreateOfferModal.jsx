import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './OfferModal.css';

function CreateOfferModal({ onClose, onCreate }) {
  const [percentage, setPercentage] = useState('');
  const [requiredBuying, setRequiredBuying] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', token };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/users/offers/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          percentage: Number(percentage),
          required_buying: Number(requiredBuying)
        })
      });
      const data = await res.json();
      if (res.ok){
          onCreate(data);
          toast.success('Offer created successfully.');
      } 
      else toast.error(data.error || 'Failed to create.');
    } catch {
      toast.error('Failed to create.');
    }
    setSubmitting(false);
  };

  return (
    <div className="offer-modal-overlay" onClick={onClose}>
      <div className="offer-modal-window" onClick={e => e.stopPropagation()}>
        <button className="offer-modal-close" onClick={onClose}><FaTimes /></button>
        <h2>Create Offer</h2>
        <form className="offer-modal-form" onSubmit={handleSubmit}>
          <label>
            Discount %
            <input
              type="number"
              step="0.1"          // allow decimals
              min="0"
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
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateOfferModal;