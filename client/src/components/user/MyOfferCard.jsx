import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './OfferCard.css';

function OfferCard({ offer, onEdit, onDelete }) {
  return (
    <div className="offer-card">
      <div className="offer-card-actions">
        <button className="offer-edit-btn" onClick={onEdit} title="Edit">
          <FaEdit />
        </button>
        <button className="offer-delete-btn" onClick={onDelete} title="Delete">
          <FaTrash />
        </button>
      </div>
      <div className="offer-card-content">
        <p><span>Discount:</span> {offer.percentage}%</p>
        <p><span>Min Purchase:</span> {offer.required_buying}</p>
      </div>
    </div>
  );
}

export default OfferCard;