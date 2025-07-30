import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../LoadingSpinner';
import './UserlistPage.css';

export default function UserlistPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/admin/userlist`, { headers: { token } });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="ulp-page">
      <div className="ulp-container">
        <h1 className="ulp-title">User List</h1>

        {loading ? (
          <div className="ulp-loading">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="ulp-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <button
                      className="ulp-user-btn"
                      onClick={() => navigate(`/admin/profilevisit/${u.user_id}`)}
                    >
                      {u.name}
                    </button>
                  </td>
                  <td>{u.type === 'company' ? 'Company' : 'Normal'}</td>
                  <td>{u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}