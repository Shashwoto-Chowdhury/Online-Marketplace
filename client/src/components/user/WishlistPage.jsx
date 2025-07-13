import { useEffect, useState, useCallback } from 'react';
import { FaFilter, FaHeart, FaBoxOpen, FaTags } from 'react-icons/fa';
import './UserHome.css';
import ProductCard from '../ProductCard';
import LoadingSpinner from '../LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import ProductDetailsModal from '../ProductDetailsModal';

function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState([]);
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

  // Fetch categories and brands for filters
  useEffect(() => {
    fetch(`${API_BASE_URL}/users/homepage/filter/categories`, { method: 'GET', ...authHeader })
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${API_BASE_URL}/users/homepage/filter/brands`, { method: 'GET', ...authHeader })
      .then(res => res.json())
      .then(data => setBrands(data));
  }, []);

  // Fetch subcategories when category changes
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

  // Fetch all wishlist products on mount
  useEffect(() => {
    const fetchAllWishlist = async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/wishlist/get`, { method: 'GET', ...authHeader });
      const data = res.status === 404 ? [] : await res.json();
      setWishlistProducts(data);
      setLoading(false);
    };
    fetchAllWishlist();
  }, []);

  // Fetch filtered wishlist products only when filter is applied
  const handleFilterSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    const query = new URLSearchParams(filters).toString();
    // console.log(`Fetching wishlist with filters: ${query}`);
    const res = await fetch(`${API_BASE_URL}/users/wishlist/get?${query}`, { method: 'GET', ...authHeader });
    const data = res.status === 404 ? [] : await res.json();
    // console.log('Fetched wishlist products:', data);
    setWishlistProducts(data);
    setLoading(false);
  }, [API_BASE_URL, authHeader, filters]);

  const handleFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleProductClick = useCallback((id) => setOpenProductId(id), []);

  return (
    <div className="user-home-container dark-theme">
      {/* <div className="action-buttons">
        <button className="sell-btn" onClick={() => navigate('/user/sell')}>
          <FaTags style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Sell a Product
        </button>
        <button className="request-btn" onClick={() => navigate('/user/requestproduct')}>
          <FaBoxOpen style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Request a Product
        </button>
        <button className="request-btn" style={{ background: 'linear-gradient(90deg, #ff6b6b 0%, #ffb199 100%)', color: '#fff' }}>
          <FaHeart style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Wishlist
        </button>
      </div> */}
      <div className="content">
        <aside className="filters">
          <h3>
            <FaFilter style={{ marginRight: 8, color: '#38bdf8', verticalAlign: 'middle' }} />
            Filters
          </h3>
          <form onSubmit={handleFilterSubmit}>
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
          </form>
        </aside>
        <main className="product-list-section">
          <h2>
            <FaHeart style={{ marginRight: 8, color: '#ff6b6b', verticalAlign: 'middle' }} />
            My Wishlist
          </h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="product-list">
              {wishlistProducts.length > 0 ? (
                wishlistProducts.map(product => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onClick={() => handleProductClick(product.product_id)}
                  />
                ))
              ) : (
                <p className="no-products">Your wishlist is empty.</p>
              )}
            </div>
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

export default WishlistPage;