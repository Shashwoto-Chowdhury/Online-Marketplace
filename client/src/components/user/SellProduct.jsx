// src/pages/user/SellProduct.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import './SellProduct.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBoxOpen, FaTag, FaDollarSign, FaList, FaMapMarkerAlt, FaLayerGroup, FaUpload, FaImage, FaSortAmountUp, FaBoxes, FaMinusCircle } from 'react-icons/fa';

function SellProduct() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    sub_category_id: '',
    brand_id: '',
    location: '',
    quantity: '',
  });
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const authHeader = { headers: { token } };
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/users/homepage/filter/categories`, { method: 'GET', ...authHeader })
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`${API_BASE_URL}/users/homepage/filter/brands`, { method: 'GET', ...authHeader })
      .then(res => res.json())
      .then(data => setBrands(data));
  }, []);

  useEffect(() => {
    if (form.category_id) {
      fetch(`${API_BASE_URL}/users/homepage/filter/subcategories?category_id=${form.category_id}`, {
        method: 'GET',
        ...authHeader,
      })
        .then(res => res.json())
        .then(data => setSubcategories(data));
    } else {
      setSubcategories([]);
    }
  }, [form.category_id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages(prev => {
      // Combine previous and new files, but only keep up to 5
      const combined = [...prev, ...newFiles].slice(0, 5);
      return combined;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach(img => formData.append('images', img));

    try {
      const res = await fetch(`${API_BASE_URL}/users/productupload/products`, {
        method: 'POST',
        headers: { token },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Product uploaded successfully!');
        setTimeout(() => navigate('/user/home'), 2000);
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div>
      <div className="sell-product-container">
        <button
          type="button"
          className="back-home-btn"
          style={{
            margin: '2rem 0 1.5rem 0',
            background: '#2d1212',
            color: '#ff6b6b',
            border: '1.5px solid #ff6b6b',
            borderRadius: '8px',
            padding: '0.7rem 1.5rem',
            fontWeight: 600,
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255,107,107,0.10)',
            transition: 'background 0.2s, color 0.2s, border 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#ff6b6b';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#2d1212';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onClick={() => navigate('/user/home')}
        >
          <FaBoxOpen style={{ color: '#ff6b6b', fontSize: 20 }} />
          Back to Home
        </button>
        <div className="sell-product-content">
          <h2>
            <FaBoxOpen style={{ marginRight: 10, color: '#38bdf8', verticalAlign: 'middle' }} />
            Upload Product
          </h2>
          <form onSubmit={handleSubmit} className="sell-form" encType="multipart/form-data">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaTag className="icon" /> Title
                </label>
                <input name="title" placeholder="Product Title" required value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>
                  <FaDollarSign className="icon" /> Price
                </label>
                <input name="price" type="number" placeholder="Price" required value={form.price} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaList className="icon" /> Category
                </label>
                <select name="category_id" value={form.category_id} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <FaLayerGroup className="icon" /> Subcategory
                </label>
                <select name="sub_category_id" value={form.sub_category_id} onChange={handleChange} required disabled={!form.category_id}>
                  <option value="">Select Subcategory</option>
                  {subcategories.map(s => <option key={s.sub_category_id} value={s.sub_category_id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaBoxes className="icon" /> Brand
                </label>
                <select name="brand_id" value={form.brand_id} onChange={handleChange} required>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <FaSortAmountUp className="icon" /> Quantity
                </label>
                <input name="quantity" type="number" placeholder="Quantity" required value={form.quantity} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  <FaMapMarkerAlt className="icon" /> Location
                </label>
                <input name="location" placeholder="Location" required value={form.location} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  <FaImage className="icon" /> Images
                </label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="file-input" />
                <span className="file-hint">*You can upload up to 5 images</span>
                <div className="image-preview-row">
                  {images.map((img, idx) => (
                    <div key={idx} className="image-preview">
                      <img src={URL.createObjectURL(img)} alt={`preview-${idx}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        title="Remove"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      >
                        <FaMinusCircle />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>
                  <FaTag className="icon" /> Description
                </label>
                <textarea name="description" placeholder="Short Description" required value={form.description} onChange={handleChange} rows={3} />
              </div>
            </div>
            <button type="submit" className="upload-btn">
              <FaUpload style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Upload Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellProduct;
