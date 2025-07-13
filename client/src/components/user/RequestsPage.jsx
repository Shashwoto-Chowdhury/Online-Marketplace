import React, { useEffect, useState } from 'react';
import { FaListAlt, FaUsers } from 'react-icons/fa';
import RequestCard from '../RequestCard';
import MyRequestDetailsModal from './MyRequestDetailsModal';
import AllRequestDetailsModal from '../AllRequestDetailsModal';
import LoadingSpinner from '../LoadingSpinner';
import './RequestsPage.css';

function RequestsPage() {
  const [tab, setTab] = useState('my');
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  // Fetch requests
  useEffect(() => {
    setLoading(true);
    if (tab === 'my') {
      fetch(`${API_BASE_URL}/users/productrequest`, { headers: { token } })
        .then(res => res.json())
        .then(data => {
          setMyRequests(data);
          setLoading(false);
        });
    } else {
      fetch(`${API_BASE_URL}/users/productrequest/all`, { headers: { token } })
        .then(res => res.json())
        .then(data => {
          setAllRequests(data);
          setLoading(false);
        });
    }
  }, [tab]);

  // Handle delete from modal
  const handleDelete = (deletedId) => {
    setMyRequests(prev => prev.filter(r => r.request_id !== deletedId));
  };

  // Handle start conversation (implement logic as needed)
  const handleStartConversation = (details) => {
    // You can implement your conversation logic here
    alert(`Start conversation with ${details.requester_name} about "${details.title}"`);
  };

  return (
    <div className="user-home-container dark-theme requests-page">
      <div className="requests-tabs">
        <button
          className={`requests-tab-btn${tab === 'my' ? ' active' : ''}`}
          onClick={() => setTab('my')}
        >
          <FaListAlt style={{ fontSize: 20 }} />
          My Requests
        </button>
        <button
          className={`requests-tab-btn${tab === 'all' ? ' active' : ''}`}
          onClick={() => setTab('all')}
        >
          <FaUsers style={{ fontSize: 20 }} />
          All Requests
        </button>
      </div>
      <div className="requests-list-container">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'my' && myRequests.length === 0 && (
              <div className="requests-empty">No requests found.</div>
            )}
            {tab === 'all' && allRequests.length === 0 && (
              <div className="requests-empty">No requests found.</div>
            )}
            {(tab === 'my' ? myRequests : allRequests).map(request => (
              <RequestCard
                key={request.request_id}
                request={request}
                onClick={() => setSelectedRequestId(request.request_id)}
              />
            ))}
          </>
        )}
      </div>
      {tab === 'my' && selectedRequestId && (
        <MyRequestDetailsModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onDelete={handleDelete}
        />
      )}
      {tab === 'all' && selectedRequestId && (
        <AllRequestDetailsModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onStartConversation={handleStartConversation}
        />
      )}
    </div>
  );
}

export default RequestsPage;