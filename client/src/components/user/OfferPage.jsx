import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import './OfferPage.css';
import OfferCard from './MyOfferCard';
import CreateOfferModal from './CreateOfferModal';
import EditOfferModal from './EditOfferModal';
import { toast } from 'react-toastify';

function OfferPage({ setIsAuthenticated, setRole }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editOffer, setEditOffer] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', token };

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/offers/get`, { headers });
      const data = await res.json();
      setOffers(data);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
    setLoading(false);
  }, [API]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleDelete = async (offer_id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`${API}/users/offers/delete/${offer_id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (res.ok) {
        setOffers(prev => prev.filter(o => o.offer_id !== offer_id));
        toast.success('Offer deleted successfully.');
      } else {
        toast.error(data.message || 'Failed to delete offer.');
      }
    } catch {
      toast.error('Failed to delete offer.');
    }
  };

  const handleCreate = (newOffer) => {
    // close the modal first
    setShowCreateModal(false);

    // // Option A: guard the spread so prev is always an array
    // setOffers(prev => {
    //   const list = Array.isArray(prev) ? prev : [];
    //   return [ newOffer, ...list ];
    // });

    // Option B (stronger): re-fetch from the server to get a fresh, guaranteed array
    fetchOffers();
  };

  const handleUpdate = (updated) => {
    setOffers(prev => prev.map(o => o.offer_id === updated.offer_id ? updated : o));
    setEditOffer(null);
  };

  return (
    <div className="offer-page-container dark-theme">
      <div className="offer-page-header">
        <h1>My Offers</h1>
        <button
          className="offer-add-btn"
          onClick={() => setShowCreateModal(true)}
          title="Add Offer"
        >
          <FaPlus /> Add Offer
        </button>
      </div>
      <div className="offer-list">
        {loading
          ? <p className="no-offers">Loading offers…</p>
          : offers.length > 0
            ? offers.map(o => (
                <OfferCard
                  key={o.offer_id}
                  offer={o}
                  onEdit={() => setEditOffer(o)}
                  onDelete={() => handleDelete(o.offer_id)}
                />
              ))
            : <p className="no-offers">No offers found.</p>
        }
      </div>

      {showCreateModal && (
        <CreateOfferModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
      {editOffer && (
        <EditOfferModal
          offer={editOffer}
          onClose={() => setEditOffer(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

export default OfferPage;