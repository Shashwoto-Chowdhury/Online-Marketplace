import React, { useEffect, useState } from 'react';
import { FiBox, FiMessageSquare, FiCheck, FiX, FiTrash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';
import ReportProductDetailsModal from './ProductDetails';
import './ReportPage.css';

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState('product');
  const [loading, setLoading] = useState(true);
  const [productReports, setProductReports] = useState([]);
  const [messageReports, setMessageReports] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const [prodRes, msgRes] = await Promise.all([
        fetch(`${API}/admin/reports/productreports`, { headers: { token } }),
        fetch(`${API}/admin/reports/messagereports`, { headers: { token } })
      ]);
      const [prodData, msgData] = await Promise.all([
        prodRes.json(),
        msgRes.json()
      ]);
      setProductReports(prodData);
      setMessageReports(msgData);
      setLoading(false);
    }
    fetchReports();
  }, []);

  const goToProfile = id => navigate(`/admin/profilevisit/${id}`);

  const handleResolve = async (type, reportId) => {
    const url = `${API}/admin/reports/${type}report/resolve?reportId=${reportId}`;
    const res = await fetch(url, { method: 'POST', headers: { token } });
    if (!res.ok) return toast.error('Action failed');
    toast.success('Report resolved');
    setLoading(true);
    // refresh
    const data = await fetch(`${API}/admin/reports/${type}reports`, { headers: { token } }).then(r => r.json());
    type === 'product' ? setProductReports(data) : setMessageReports(data);
    setLoading(false);
  };

  const handleReject = async (type, reportId) => {
    const url = `${API}/admin/reports/${type}report/reject?reportId=${reportId}`;
    const res = await fetch(url, { method: 'POST', headers: { token } });
    if (!res.ok) return toast.error('Action failed');
    toast.success('Report rejected');
    setLoading(true);
    const data = await fetch(`${API}/admin/reports/${type}reports`, { headers: { token } }).then(r => r.json());
    type === 'product' ? setProductReports(data) : setMessageReports(data);
    setLoading(false);
  };

  const handleDelete = async (type, reportId) => {
    const url = `${API}/admin/reports/${type}report/delete?reportId=${reportId}`;
    await fetch(url, { method: 'DELETE', headers: { token } });
    toast.success('Report deleted');
    setLoading(true);
    const data = await fetch(`${API}/admin/reports/${type}reports`, { headers: { token } }).then(r => r.json());
    type === 'product' ? setProductReports(data) : setMessageReports(data);
    setLoading(false);
  };

  return (
    <div className="rp-page">
      <div className="rp-container">
        <h1 className="rp-title">Admin Reports</h1>
        <div className="rp-tabs">
          <div
            className={`rp-tab ${activeTab === 'product' ? 'active' : ''}`}
            onClick={() => setActiveTab('product')}
          >
            <FiBox className="rp-tab-icon" /> Product Reports
          </div>
          <div
            className={`rp-tab ${activeTab === 'message' ? 'active' : ''}`}
            onClick={() => setActiveTab('message')}
          >
            <FiMessageSquare className="rp-tab-icon" /> Message Reports
          </div>
        </div>

        {loading ? (
          <div className="rp-loading"><LoadingSpinner /></div>
        ) : activeTab === 'product' ? (
          <table className="rp-table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reported User</th>
                <th>Product Title</th>
                <th>Reason</th>
                <th>Details</th>
                <th>Status</th>
                <th>Reported At</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {productReports.map(r => (
                <tr key={r.report_id}>
                  <td>
                    <button className="rp-user-btn" onClick={() => goToProfile(r.reporter_id)}>
                      {r.reporter_name}
                    </button>
                  </td>
                  <td>
                    <button className="rp-user-btn" onClick={() => goToProfile(r.reported_user_id)}>
                      {r.reported_user_name}
                    </button>
                  </td>
                  <td>
                    {r.product_id
                      ? (
                        <button
                          className="rp-link-btn"
                          onClick={() => setSelectedProductId(r.product_id)}
                        >
                          {r.product_title}
                        </button>
                      )
                      : (
                        <span className="rp-removed-text">Product removed by admin</span>
                      )
                    }
                  </td>
                  <td>{r.reason}</td>
                  <td>{r.details}</td>
                  <td className="rp-status-cell">
                    {r.status === 'pending' ? (
                      <div className="rp-action-group">
                        <button className="rp-btn rp-btn-approve" onClick={() => handleResolve('product', r.report_id)}>
                          <FiCheck />
                        </button>
                        <button className="rp-btn rp-btn-reject" onClick={() => handleReject('product', r.report_id)}>
                          <FiX />
                        </button>
                      </div>
                    ) : r.status === 'resolved' ? (
                      <span className="rp-approved">Resolved</span>
                    ) : (
                      <span className="rp-rejected">Rejected</span>
                    )}
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="rp-btn rp-btn-delete"
                      disabled={r.status === 'pending'}
                      onClick={() => handleDelete('product', r.report_id)}
                    >
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="rp-table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reported User</th>
                <th>Message</th>
                <th>Reason</th>
                <th>Details</th>
                <th>Status</th>
                <th>Reported At</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {messageReports.map(r => (
                <tr key={r.report_id}>
                  <td>
                    <button className="rp-user-btn" onClick={() => goToProfile(r.reporter_id)}>
                      {r.reporter_name}
                    </button>
                  </td>
                  <td>
                    <button className="rp-user-btn" onClick={() => goToProfile(r.reported_user_id)}>
                      {r.reported_user_name}
                    </button>
                  </td>
                  <td className="rp-message-content">
                    {r.message_id
                      ? r.message_content
                      : <span className="rp-removed-text">Message removed by admin</span>
                    }
                  </td>
                  <td>{r.reason}</td>
                  <td>{r.details}</td>
                  <td className="rp-status-cell">
                    {r.status === 'pending' ? (
                      <div className="rp-action-group">
                        <button className="rp-btn rp-btn-approve" onClick={() => handleResolve('message', r.report_id)}>
                          <FiCheck />
                        </button>
                        <button className="rp-btn rp-btn-reject" onClick={() => handleReject('message', r.report_id)}>
                          <FiX />
                        </button>
                      </div>
                    ) : r.status === 'resolved' ? (
                      <span className="rp-approved">Resolved</span>
                    ) : (
                      <span className="rp-rejected">Rejected</span>
                    )}
                  </td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="rp-btn rp-btn-delete"
                      disabled={r.status === 'pending'}
                      onClick={() => handleDelete('message', r.report_id)}
                    >
                      <FiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* product details modal */}
      {selectedProductId && (
        <ReportProductDetailsModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}