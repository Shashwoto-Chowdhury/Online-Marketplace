import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './ProductReportModal.css';

const REASONS = [
  'Fake or Counterfeit Product',
  'Prohibited or Illegal Item',
  'Misleading or False Description',
  'Price Manipulation or Scam',
  'Inappropriate Content',
  'Intellectual Property Violation',
  'Duplicate or Spam Listing',
  'Suspicious Seller Behavior',
  'Product Quality Concerns',
  'Violation of Platform Rules'
];

function ProductReportModal({ productId, onClose }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/productreport/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify({
          product_id: productId,
          reason,
          details
        })
      });
      if (res.ok) {
        onClose();
      } else {
        setError('Failed to submit report.');
      }
    } catch {
      setError('Failed to submit report.');
    }
    setSubmitting(false);
  };

  return (
    <div className="productreport-modal-overlay" onClick={onClose}>
      <div className="productreport-modal-window" onClick={e => e.stopPropagation()}>
        <button className="productreport-modal-close-btn" onClick={onClose} title="Close">
          <FaTimes />
        </button>
        <h2 className="productreport-modal-title">Report Product</h2>
        <form className="productreport-modal-form" onSubmit={handleSubmit}>
          <label>
            Reason
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="productreport-modal-select"
            >
              <option value="">Select a reason</option>
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Details (optional)
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={4}
              className="productreport-modal-textarea"
              placeholder="Add any additional details here..."
            />
          </label>
          {error && <div className="productreport-modal-error">{error}</div>}
          <button
            type="submit"
            className="productreport-modal-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductReportModal;