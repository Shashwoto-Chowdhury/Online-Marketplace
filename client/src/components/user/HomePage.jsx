// src/pages/user/UserHome.jsx
import { useEffect, useState, useCallback } from 'react';
import { FaFilter, FaBoxOpen, FaBuilding, FaGlobe, FaPlusCircle, FaTags } from 'react-icons/fa';
import './UserHome.css';
import ProductCard from '../ProductCard';
import Navbar from '../Navbar';
import LoadingSpinner from '../LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import ProductDetailsModal from '../ProductDetailsModal';

function UserHome({ setIsAuthenticated, setRole }) {
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [companyProducts, setCompanyProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filters, setFilters] = useState({
    category_id: '',
    sub_category_id: '',
    brand_id: '',
    min_price: '',
    max_price: '',
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openProductId, setOpenProductId] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const token = localStorage.getItem('token');
  const authHeader = { headers: { token } };

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/homepage/nearbyproducts`, {
      method: 'GET',
      ...authHeader,
    })
      .then(res => res.json())
      .then(data => setNearbyProducts(data));

    fetch(`${API_BASE_URL}/users/homepage/companyproducts`, {
      method: 'GET',
      ...authHeader,
    })
      .then(res => res.json())
      .then(data => setCompanyProducts(data));

    fetch(`${API_BASE_URL}/users/homepage/allproducts`, {
      method: 'GET',
      ...authHeader,
    })
      .then(res => res.json())
      .then(data => setAllProducts(data));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/homepage/filter/categories`, {
      method: 'GET',
      ...authHeader,
    })
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${API_BASE_URL}/users/homepage/filter/brands`, {
      method: 'GET',
      ...authHeader,
    })
      .then(res => res.json())
      .then(data => setBrands(data));
  }, []);

  useEffect(() => {
    if (filters.category_id) {
      fetch(`${API_BASE_URL}/users/homepage/filter/subcategories?category_id=${filters.category_id}`, {
        method: 'GET',
        ...authHeader,
      })
        .then(res => res.json())
        .then(data => setSubcategories(data));
    } else {
      setSubcategories([]);
    }
  }, [filters.category_id]);

  const handleFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleFilterSubmit = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams(filters).toString();

    const fetchFiltered = async (endpoint, setter) => {
      const res = await fetch(`${API_BASE_URL}/users/homepage/${endpoint}?${query}`, {
        method: 'GET',
        ...authHeader,
      });
      const data = await res.json();
      setter(data);
    };

    await Promise.all([
      fetchFiltered('nearbyproducts', setNearbyProducts),
      fetchFiltered('companyproducts', setCompanyProducts),
      fetchFiltered('allproducts', setAllProducts),
    ]);
    setLoading(false);
  }, [API_BASE_URL, authHeader, filters]);

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
              <h2>
                <FaBoxOpen style={{ marginRight: 8, color: '#38bdf8', verticalAlign: 'middle' }} />
                Nearby Products
              </h2>
              <div className="product-list">
                {nearbyProducts.length > 0 ? (
                  nearbyProducts.map(product => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      onClick={() => handleProductClick(product.product_id)}
                    />
                  ))
                ) : (
                  <p className="no-products">No nearby products found.</p>
                )}
              </div>

              <h2>
                <FaBuilding style={{ marginRight: 8, color: '#90caf9', verticalAlign: 'middle' }} />
                Company Products
              </h2>
              <div className="product-list">
                {companyProducts.length > 0 ? (
                  companyProducts.map(product => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      onClick={() => handleProductClick(product.product_id)}
                    />
                  ))
                ) : (
                  <p className="no-products">No company products found.</p>
                )}
              </div>

              <h2>
                <FaGlobe style={{ marginRight: 8, color: '#ffca28', verticalAlign: 'middle' }} />
                All Products
              </h2>
              <div className="product-list">
                {allProducts.length > 0 ? (
                  allProducts.map(product => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                      onClick={() => handleProductClick(product.product_id)}
                    />
                  ))
                ) : (
                  <p className="no-products">No products found.</p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
      {openProductId && (
        <ProductDetailsModal
          productId={openProductId}
          onClose={() => setOpenProductId(null)}
        />
      )}
    </div>
  );
}

export default UserHome;
