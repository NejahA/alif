import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/products`),
        axios.get(`${API}/api/products/stats`),
      ]);
      setProducts(prodRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', stock: '' });
    setEditingProduct(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingProduct) {
        await axios.put(`${API}/api/products/${editingProduct._id}`, form, { headers });
      } else {
        await axios.post(`${API}/api/products`, form, { headers });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/api/products/${id}`, { headers });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleSeedDemo = async () => {
    try {
      await axios.post(`${API}/api/products/seed`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Seed failed');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-logo">Alpalin</h1>
          <span className="dash-subtitle">Inventory Manager</span>
        </div>
        <div className="dash-header-right">
          <span className="dash-user">👤 {user.name || user.email || 'User'}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dash-main">
        {/* Stats Cards */}
        {stats && (
          <section className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalProducts}</span>
                <span className="stat-label">Products</span>
              </div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <span className="stat-value">{stats.categoriesCount}</span>
                <span className="stat-label">Categories</span>
              </div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalStock}</span>
                <span className="stat-label">Total Stock</span>
              </div>
            </div>
            <div className="stat-card stat-gold">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-value">${stats.inventoryValue?.toLocaleString()}</span>
                <span className="stat-label">Inventory Value</span>
              </div>
            </div>
            {stats.lowStockCount > 0 && (
              <div className="stat-card stat-orange">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.lowStockCount}</span>
                  <span className="stat-label">Low Stock</span>
                </div>
              </div>
            )}
            {stats.outOfStockCount > 0 && (
              <div className="stat-card stat-red">
                <div className="stat-icon">🚫</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.outOfStockCount}</span>
                  <span className="stat-label">Out of Stock</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Toolbar */}
        <section className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Search products or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="toolbar-actions">
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              + Add Product
            </button>
            {products.length === 0 && (
              <button className="btn btn-secondary" onClick={handleSeedDemo}>
                Load Demo Data
              </button>
            )}
          </div>
        </section>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Add/Edit Form */}
        {showForm && (
          <section className="form-card">
            <div className="form-header">
              <h3>{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button className="btn btn-ghost" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Products Table */}
        <section className="table-card">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No products found.</p>
              {products.length === 0 && <p className="empty-hint">Click "Load Demo Data" or "Add Product" to get started.</p>}
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product._id} className={product.stock <= 0 ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : ''}>
                    <td>
                      <div className="product-name">{product.name}</div>
                      <div className="product-desc">{product.description}</div>
                    </td>
                    <td><span className="category-badge">{product.category}</span></td>
                    <td className="price">${product.price?.toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${product.stock <= 0 ? 'stock-out' : product.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn btn-sm btn-edit" onClick={() => handleEdit(product)}>✏️</button>
                      <button className="btn btn-sm btn-delete" onClick={() => handleDelete(product._id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
