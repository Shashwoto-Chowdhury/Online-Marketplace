import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

function RequestCard({ request, onClick }) {
  return (
    <div className="request-card" onClick={onClick}>
      <h3>{request.title}</h3>
      <p>{request.description}</p>
      <div className="request-location">
        <FaMapMarkerAlt style={{ marginRight: 6 }} />
        {request.location}
      </div>
    </div>
  );
}

export default RequestCard;