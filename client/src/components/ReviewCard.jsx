import React from 'react';
import { FaUser, FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import './ReviewCard.css';

function StarProgress({ rating, max = 5 }) {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} style={{ color: '#ffd700', marginRight: 2 }} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} style={{ color: '#ffd700', marginRight: 2 }} />);
    } else {
      stars.push(<FaRegStar key={i} style={{ color: '#ffd700', marginRight: 2 }} />);
    }
  }
  return <span>{stars}</span>;
}

function ReviewCard({ review }) {
  return (
    <div className="reviewcard-container">
      <div className="reviewcard-header">
        <a
          className="reviewcard-reviewer"
          href="#"
          title="Visit profile"
          // onClick={...} // implement navigation later
        >
          <FaUser style={{ marginRight: 6, color: '#38bdf8' }} />
          {review.reviewer_username}
        </a>
        <span className="reviewcard-rating">
          <StarProgress rating={review.rating} />
        </span>
      </div>
      <div className="reviewcard-comment">
        {review.comment}
      </div>
      <div className="reviewcard-date">
        {new Date(review.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

export default ReviewCard;