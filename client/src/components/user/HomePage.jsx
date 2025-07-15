// src/pages/user/UserHome.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { FaFilter, FaBoxOpen, FaBuilding, FaGlobe, FaPlusCircle, FaTags } from 'react-icons/fa';
import './UserHome.css';
import ProductCard from '../ProductCard';
import Navbar from '../Navbar';
import LoadingSpinner from '../LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import ProductDetailsModal from '../ProductDetailsModal';

const ITEMS_PER_PAGE = 10;

function UserHome({ setIsAuthenticated, setRole }) {
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [companyProducts, setCompanyProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filters, setFilters] = useState({ category_id: '', sub_category_id: '', brand_id: '', min_price: '', max_price: '' });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openProductId, setOpenProductId] = useState(null);
  const [nearbyPage, setNearbyPage]     = useState(1);
  const [companyPage, setCompanyPage]   = useState(1);
  const [allPage, setAllPage]           = useState(1);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token');
  const authHeader = useMemo(() => ({ headers: { token } }), [token])

  // clear subcats when category changes
  useEffect(() => {
    if (filters.category_id) {
      fetch(`${API_BASE_URL}/users/homepage/filter/subcategories?category_id=${filters.category_id}`, authHeader)
        .then(r => r.json()).then(setSubcategories);
    } else {
      setSubcategories([]);
    }
  }, [filters.category_id]);

  // fetch category + brand lists once
  useEffect(() => {
    fetch(`${API_BASE_URL}/users/homepage/filter/categories`, authHeader)
      .then(r => r.json()).then(setCategories);
    fetch(`${API_BASE_URL}/users/homepage/filter/brands`, authHeader)
      .then(r => r.json()).then(setBrands);
  }, []);

  // master loader for all three sections:
  const loadSections = useCallback(async () => {
    setLoading(true);

    const fetchSection = async (endpoint, setter, page) => {
      const params = new URLSearchParams({ ...filters, page, limit: ITEMS_PER_PAGE });
      const res = await fetch(
        `${API_BASE_URL}/users/homepage/${endpoint}?${params}`,
        authHeader
      );
      const data = await res.json();
      setter(data);
    };

    await Promise.all([
      fetchSection('nearbyproducts', setNearbyProducts, nearbyPage),
      fetchSection('companyproducts', setCompanyProducts, companyPage),
      fetchSection('allproducts', setAllProducts, allPage),
    ]);

    setLoading(false);
  }, [API_BASE_URL, authHeader, filters, nearbyPage, companyPage, allPage]);

  // run on mount + whenever filters or any page changes
  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // reset pages on filter submit
  const handleFilterSubmit = useCallback(() => {
    setNearbyPage(1);
    setCompanyPage(1);
    setAllPage(1);
    // removed sessionStorage.clear calls
  }, [setNearbyPage, setCompanyPage, setAllPage]);

  const handleFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleProductClick = useCallback((id) => setOpenProductId(id), []);

  return (
    <div className="user-home-container dark-theme">
      {/* <Navbar setIsAuthenticated={setIsAuthenticated} setRole={setRole} /> */}
      <div className="action-buttons">
        <button className="request-btn" onClick={() => navigate('/user/requestproduct')}>
          <FaPlusCircle style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Request a Product
        </button>
        <button className="sell-btn" onClick={() => navigate('/user/sell')}>
          <FaTags style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Sell a Product
        </button>
      </div>
      <div className="content">
        <aside className="filters">
          <h3>
            <FaFilter style={{ marginRight: 8, color: '#38bdf8', verticalAlign: 'middle' }} />
            Filters
          </h3>
          <select name="category_id" onChange={handleFilterChange} value={filters.category_id}>
            <option value="">Category</option>
            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
          </select>

          {filters.category_id && (
            <select name="sub_category_id" onChange={handleFilterChange} value={filters.sub_category_id}>
              <option value="">Subcategory</option>
              {subcategories.map(sub => <option key={sub.sub_category_id} value={sub.sub_category_id}>{sub.name}</option>)}
            </select>
          )}

          <select name="brand_id" onChange={handleFilterChange} value={filters.brand_id}>
            <option value="">Brand</option>
            {brands.map(brand => <option key={brand.brand_id} value={brand.brand_id}>{brand.name}</option>)}
          </select>

          <input
            type="number"
            name="min_price"
            placeholder="Min Price"
            value={filters.min_price}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="max_price"
            placeholder="Max Price"
            value={filters.max_price}
            onChange={handleFilterChange}
          />
          <button onClick={handleFilterSubmit}>
            <FaFilter style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Apply Filters
          </button>
        </aside>

        <main className="product-list-section">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Nearby Products */}
              <h2><FaBoxOpen style={{ marginRight: 8, color: '#38bdf8', verticalAlign: 'middle' }} /> Nearby Products</h2>
              <div className="product-list">
                {nearbyProducts.length > 0
                  ? nearbyProducts.map(p => <ProductCard key={p.product_id} product={p} onClick={() => handleProductClick(p.product_id)} />)
                  : <p className="no-products">No nearby products found.</p>}
              </div>
              <div className="product-pagination">
                <button disabled={nearbyPage === 1 || loading} onClick={() => setNearbyPage(n => n - 1)}>Previous</button>
                <span>Page {nearbyPage}</span>
                <button disabled={nearbyProducts.length < ITEMS_PER_PAGE || loading} onClick={() => setNearbyPage(n => n + 1)}>Next</button>
              </div>

              {/* Company Products */}
              <h2><FaBuilding style={{ marginRight: 8, color: '#90caf9', verticalAlign: 'middle' }} /> Company Products</h2>
              <div className="product-list">
                {companyProducts.length > 0
                  ? companyProducts.map(p => <ProductCard key={p.product_id} product={p} onClick={() => handleProductClick(p.product_id)} />)
                  : <p className="no-products">No company products found.</p>}
              </div>
              <div className="product-pagination">
                <button disabled={companyPage === 1 || loading} onClick={() => setCompanyPage(n => n - 1)}>Previous</button>
                <span>Page {companyPage}</span>
                <button disabled={companyProducts.length < ITEMS_PER_PAGE || loading} onClick={() => setCompanyPage(n => n + 1)}>Next</button>
              </div>

              {/* All Products */}
              <h2><FaGlobe  style={{ marginRight: 8, color: '#ffca28', verticalAlign: 'middle' }} /> All Products</h2>
              <div className="product-list">
                {allProducts.length > 0
                  ? allProducts.map(p => <ProductCard key={p.product_id} product={p} onClick={() => handleProductClick(p.product_id)} />)
                  : <p className="no-products">No products found.</p>}
              </div>
              <div className="product-pagination">
                <button disabled={allPage === 1 || loading} onClick={() => setAllPage(n => n - 1)}>Previous</button>
                <span>Page {allPage}</span>
                <button disabled={allProducts.length < ITEMS_PER_PAGE || loading} onClick={() => setAllPage(n => n + 1)}>Next</button>
              </div>
            </>
          )}
        </main>
      </div>
      {openProductId && (
        <ProductDetailsModal productId={openProductId} onClose={() => setOpenProductId(null)} />
      )}
    </div>
  );
}

export default UserHome;
