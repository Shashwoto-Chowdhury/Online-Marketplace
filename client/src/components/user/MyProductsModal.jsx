import React, { useEffect, useState } from 'react';
import { FaTimes, FaTag, FaMapMarkerAlt, FaImage, FaTrash } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';
import './MyProductsModal.css';

function MyProductsModal({ productId, onClose, onDelete }) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/productdetails/${productId}`, {
        headers: { token }
      });
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    };
    if (productId) fetchDetails();
  }, [productId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/productdelete?product_id=${productId}`, {
        method: 'DELETE',
        headers: { token }
      });
      if (res.ok) {
        onDelete(productId);
        toast.success('Product deleted successfully.');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete product.');
      }
    } catch {
      toast.error('Failed to delete product.');
    }
    setDeleting(false);
  };

  if (!productId) return null;

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
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <img key={idx} src={`${API_BASE_URL}${img}`} alt={`Product ${idx}`} loading="lazy" />
                ))
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
                {product.title}
              </h2>
              <p className="modal-price">$ {product.price}</p>
              <p>
                <FaMapMarkerAlt style={{ marginRight: 6, color: '#a5b4fc' }} />
                {product.location}
              </p>
              <p>
                <b>Available Products:</b> {product.quantity}
              </p>
              <p>
                <b>Category:</b> {product.category} <b>Subcategory:</b> {product.sub_category}
              </p>
              <p>
                <b>Brand:</b> {product.brand}
              </p>
              <p className="modal-description">{product.description}</p>
              <div className="modal-actions">
                <button
                  className="modal-delete-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <FaTrash style={{ marginRight: 8 }} />
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyProductsModal;