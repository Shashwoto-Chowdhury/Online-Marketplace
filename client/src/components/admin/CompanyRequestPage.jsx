import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCheck, FiX, FiTrash } from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner';
import { toast } from 'react-toastify';
import './CompanyRequestPage.css';

export default function CompanyRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch(`${API}/admin/companyrequest/get`, {
      headers: { token }
    });
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const goToProfile = id => {
    navigate(`/admin/profilevisit/${id}`);
  };

  const handleApprove = async (requestId) => {
    const res = await fetch(`${API}/admin/companyrequest/approve?requestId=${requestId}`, {
        method: 'POST',
        headers: { token }
    });
    if (!res.ok) {
        toast.error('Failed to approve request');
    }
    else {
        fetchRequests();
        toast.success('Request approved successfully');
    }
  };

  const handleReject = async (requestId) => {
    const res =await fetch(`${API}/admin/companyrequest/reject?requestId=${requestId}`, {
      method: 'POST',
      headers: { token }
    });
    if (!res.ok) {
      toast.error('Failed to reject request');
    }
    else {
      fetchRequests();
      toast.success('Request rejected successfully');
    }
  };

  const handleDelete = async (requestId) => {
    await fetch(`${API}/admin/companyrequest/delete?requestId=${requestId}`, {
      method: 'DELETE',
      headers: { token }
    });
    fetchRequests();
  };

  return (
    <div className="crp-page">
      <div className="crp-container">
        <h1 className="crp-title">Company Upgrade Requests</h1>

        {loading ? (
          <div className="crp-loading"><LoadingSpinner /></div>
        ) : (
          <table className="crp-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Status</th>
                <th>Requested At</th>
                <th>Responded At</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.request_id}>
                  <td>
                    <button
                      className="crp-user-btn"
                      onClick={() => goToProfile(req.user_id)}
                    >
                      <FiUser style={{ marginRight: 4, color: '#38bdf8' }} />
                      {req.name}
                    </button>
                  </td>
                  <td className="crp-status-cell">
                    {req.status === 'pending' ? (
                      <div className="crp-action-group">
                        <button
                          className="crp-btn crp-btn-approve"
                          onClick={() => handleApprove(req.request_id)}
                        >
                          <FiCheck />
                        </button>
                        <button
                          className="crp-btn crp-btn-reject"
                          onClick={() => handleReject(req.request_id)}
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <span className="crp-approved">Approved</span>
                    ) : (
                      <span className="crp-rejected">Rejected</span>
                    )}
                  </td>
                  <td>{new Date(req.requested_at).toLocaleString()}</td>
                  <td>{req.responded_at ? new Date(req.responded_at).toLocaleString() : '—'}</td>
                  <td>
                    <button
                      className="crp-btn crp-btn-delete"
                      disabled={req.status === 'pending'}
                      onClick={() => handleDelete(req.request_id)}
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
    </div>
  );
}