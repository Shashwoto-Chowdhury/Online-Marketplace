import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import AdminNavbar from './AdminNavbar';
import { FaUsers, FaBoxOpen, FaShoppingCart } from 'react-icons/fa';

const Dashboard = () => {
    const [userCount, setUserCount] = useState(0);
    const [productCount, setProductCount] = useState(0);
    const [soldProductCount, setSoldProductCount] = useState(0);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch(`${API_BASE_URL}/admin/dashboard/usercount`, { headers: { token } })
            .then(res => res.json())
            .then(data => setUserCount(data.userCount || 0));
        fetch(`${API_BASE_URL}/admin/dashboard/productcount`, { headers: { token } })
            .then(res => res.json())
            .then(data => setProductCount(data.productCount || 0));
        fetch(`${API_BASE_URL}/admin/dashboard/soldproductcount`, { headers: { token } })
            .then(res => res.json())
            .then(data => setSoldProductCount(data.soldProductCount || 0));
    }, []);

    return (
        <>
            {/* <AdminNavbar /> */}
            <div className="admindashboard-container">
                <h1 className="admindashboard-title">Admin Dashboard</h1>
                <div className="admindashboard-cards">
                    <div className="admindashboard-card users">
                        <FaUsers className="admindashboard-card-icon" />
                        <h2>Users</h2>
                        <p className="admindashboard-card-count">{userCount}</p>
                    </div>
                    <div className="admindashboard-card products">
                        <FaBoxOpen className="admindashboard-card-icon" />
                        <h2>Products</h2>
                        <p className="admindashboard-card-count">{productCount}</p>
                    </div>
                    <div className="admindashboard-card sold">
                        <FaShoppingCart className="admindashboard-card-icon" />
                        <h2>Sold Products</h2>
                        <p className="admindashboard-card-count">{soldProductCount}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;