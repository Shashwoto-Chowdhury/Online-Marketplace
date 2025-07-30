import React, { useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';
import './BroadcastNotification.css';

export default function BroadcastNotification() {
  const [content, setContent] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch(`${API}/admin/broadcastnotification/all`, { headers: { token } });
    const data = await res.json();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/admin/broadcastnotification/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error();
      toast.success('Notification broadcasted');
      setContent('');
      fetchNotifications();
    } catch {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bn-page">
      <div className="bn-container">
        <h1 className="bn-title">Broadcast Notifications</h1>

        <div className="bn-input-area">
          <textarea
            rows="3"
            placeholder="Write your notification..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button
            className="bn-send-btn"
            onClick={handleSend}
            disabled={sending || !content.trim()}
          >
            <FiSend /> Send
          </button>
        </div>

        {loading ? (
          <div className="bn-loading"><LoadingSpinner /></div>
        ) : (
          <table className="bn-table">
            <thead>
              <tr>
                <th>Admin Name</th>
                <th>Content</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(n => (
                <tr key={n.notification_id}>
                  <td>{n.name}</td>
                  <td>{n.content}</td>
                  <td>{new Date(n.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}