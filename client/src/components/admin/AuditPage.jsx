import React, { useEffect, useState } from 'react';
import { FiEdit, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import './AuditPage.css';

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [infoUpdates, setInfoUpdates] = useState([]);
  const [passChanges, setPassChanges] = useState([]);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const [infoRes, passRes] = await Promise.all([
        fetch(`${API}/admin/audit/updateinfo`, { headers: { token } }),
        fetch(`${API}/admin/audit/passwordchange`, { headers: { token } })
      ]);
      const [infoData, passData] = await Promise.all([
        infoRes.json(),
        passRes.json()
      ]);
      setInfoUpdates(infoData);
      setPassChanges(passData);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const goToProfile = id => navigate(`/admin/profilevisit/${id}`);

  return (
    <div className="audit-page">
      <div className="audit-container">
        <h1 className="audit-title">Audit Logs</h1>

        <div className="audit-tabs">
          <div
            className={`audit-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FiEdit className="audit-tab-icon"/> Info Update
          </div>
          <div
            className={`audit-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FiLock className="audit-tab-icon"/> Password Change
          </div>
        </div>

        {loading ? (
          <div className="audit-loading"><LoadingSpinner /></div>
        ) : activeTab === 'info' ? (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Old Name</th>
                <th>New Name</th>
                <th>Old Location</th>
                <th>New Location</th>
                <th>Update Time</th>
              </tr>
            </thead>
            <tbody>
              {infoUpdates.map(item => (
                <tr key={item.log_id}>
                  <td>
                    <button
                      className="audit-user-btn"
                      onClick={() => goToProfile(item.user_id)}
                    >
                      {item.user_name}
                    </button>
                  </td>
                  <td>{item.old_name}</td>
                  <td>{item.new_name}</td>
                  <td>{item.old_location}</td>
                  <td>{item.new_location}</td>
                  <td>{new Date(item.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Update Time</th>
              </tr>
            </thead>
            <tbody>
              {passChanges.map(item => (
                <tr key={item.log_id}>
                  <td>
                    <button
                      className="audit-user-btn"
                      onClick={() => goToProfile(item.user_id)}
                    >
                      {item.user_name}
                    </button>
                  </td>
                  <td>{new Date(item.update_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}