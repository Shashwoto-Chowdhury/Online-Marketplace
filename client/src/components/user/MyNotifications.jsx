import React, { useEffect, useState } from 'react';
import { FiPackage, FiUser, FiGlobe } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner';
import './MyNotifications.css';

export default function MyNotifications() {
  const [activeTab, setActiveTab] = useState('product');
  const [loading, setLoading] = useState(true);
  const [productNotifications, setProductNotifications] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [broadcastNotifications, setBroadcastNotifications] = useState([]);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [prodRes, adminMeRes, broadcastRes] = await Promise.all([
        fetch(`${API}/users/notification/productnotifications`, { headers: { token } }),
        fetch(`${API}/users/notification/adminusernotifications`, { headers: { token } }),
        fetch(`${API}/users/notification/adminnotifications`, { headers: { token } })
      ]);
      const [prodData, adminMeData, broadcastData] = await Promise.all([
        prodRes.ok ? prodRes.json() : [],
        adminMeRes.ok ? adminMeRes.json() : [],
        broadcastRes.ok ? broadcastRes.json() : []
      ]);
      setProductNotifications(prodData);
      setAdminNotifications(adminMeData);
      setBroadcastNotifications(broadcastData);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const renderList = () => {
    let items = [];
    if (activeTab === 'product') items = productNotifications;
    else if (activeTab === 'admin') items = adminNotifications;
    else items = broadcastNotifications;

    if (!items.length) {
      return <p className="mn-empty">No notifications here</p>;
    }

    return (
      <ul className="mn-list">
        {items.map((n, idx) => (
          <li key={n.notification_id ?? idx} className="mn-item">
            <div className="mn-icon">
              {activeTab === 'product' && <FiPackage />}
              {activeTab === 'admin' && <FiUser />}
              {activeTab === 'broadcast' && <FiGlobe />}
            </div>
            <div className="mn-content">
              <div className="mn-item-title">
                {activeTab === 'product' ? n.title : n.admin_name}
              </div>
              <div className="mn-item-text">{n.content}</div>
            </div>
            <div className="mn-time">
              {new Date(n.created_at || n.timestamp).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mn-page">
      <div className="mn-container">
        <h2 className="mn-header">My Notifications</h2>

        <div className="mn-tabs">
          <div
            className={`mn-tab ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            Product
          </div>
          <div
            className={`mn-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin to Me
          </div>
          <div
            className={`mn-tab ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            Broadcasted
          </div>
        </div>

        {loading 
          ? <div className="mn-loading"><LoadingSpinner /></div>
          : renderList()
        }
      </div>
    </div>
  );
}