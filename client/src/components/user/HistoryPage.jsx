import React, { useEffect, useState } from 'react';
import { FaBoxOpen, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';
import MyProductCard from './MyProductCard';
import SellRecordCard from '../SellRecordCard';
import MyProductsModal from './MyProductsModal';
import SellRecordModal from '../SellRecordModal';
import LoadingSpinner from '../LoadingSpinner';
import './HistoryPage.css';

function HistoryPage() {
  const [tab, setTab] = useState('onsell');
  const [onsell, setOnsell] = useState([]);
  const [sold, setSold] = useState([]);
  const [bought, setBought] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedSellId, setSelectedSellId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    if (tab === 'onsell') {
      fetch(`${API_BASE_URL}/users/historypage/onsellproducts`, { headers: { token } })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
          setOnsell(data);
          setLoading(false);
        });
    } else if (tab === 'sold') {
      fetch(`${API_BASE_URL}/users/historypage/soldproducts`, { headers: { token } })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
          setSold(data);
          setLoading(false);
        });
    } else if (tab === 'bought') {
      fetch(`${API_BASE_URL}/users/historypage/boughtproducts`, { headers: { token } })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
          setBought(data);
          setLoading(false);
        });
    }
  }, [tab]);

  // Remove deleted product from onsell list
  const handleDeleteProduct = (deletedId) => {
    setOnsell(prev => prev.filter(p => p.product_id !== deletedId));
    setSelectedProductId(null);
  };

  return (
    <div className="history-page-container">
      <aside className="history-sidebar">
        <button
          className={`history-tab-btn${tab === 'onsell' ? ' active' : ''}`}
          onClick={() => setTab('onsell')}
        >
          <FaBoxOpen /> On Sell
        </button>
        <button
          className={`history-tab-btn${tab === 'sold' ? ' active' : ''}`}
          onClick={() => setTab('sold')}
        >
          <FaCheckCircle /> Sold
        </button>
        <button
          className={`history-tab-btn${tab === 'bought' ? ' active' : ''}`}
          onClick={() => setTab('bought')}
        >
          <FaShoppingCart /> Bought
        </button>
      </aside>
      <main className="history-main">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'onsell' && (
              <div className="history-list">
                {onsell.length === 0 && <div className="history-empty">No products on sell.</div>}
                {onsell.map(product => (
                  <MyProductCard
                    key={product.product_id}
                    product={product}
                    onClick={() => setSelectedProductId(product.product_id)}
                  />
                ))}
              </div>
            )}
            {tab === 'sold' && (
              <div className="history-list">
                {sold.length === 0 && <div className="history-empty">No products sold.</div>}
                {sold.map(record => (
                  <SellRecordCard
                    key={record.sell_id}
                    record={record}
                    onClick={() => setSelectedSellId(record.sell_id)}
                  />
                ))}
              </div>
            )}
            {tab === 'bought' && (
              <div className="history-list">
                {bought.length === 0 && <div className="history-empty">No products bought.</div>}
                {bought.map(record => (
                  <SellRecordCard
                    key={record.sell_id}
                    record={record}
                    onClick={() => setSelectedSellId(record.sell_id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {selectedProductId && (
        <MyProductsModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onDelete={handleDeleteProduct}
        />
      )}
      {selectedSellId && (
        <SellRecordModal
          sellId={selectedSellId}
          onClose={() => setSelectedSellId(null)}
        />
      )}
    </div>
  );
}

export default HistoryPage;