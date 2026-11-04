import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Boxes,
  X
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://server-tau-orcin-98.vercel.app';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface Stats {
  totalProducts: number;
  totalStock: number;
  avgPrice: number;
  categories: { _id: string; count: number }[];
}

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [prodRes, statsRes] = await Promise.all([
        axios.get(`${API}/api/products`),
        axios.get(`${API}/api/products/stats`),
      ]);
      setProducts(prodRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not connect to backend API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', stock: '' });
    setEditingProduct(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed. Ensure you are logged in.');
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/api/products/${id}`, { headers });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSeedDemo = async () => {
    try {
      await axios.post(`${API}/api/products/seed`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Seed failed');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f8fafc' }}>
            📦 Alpalin Inventory & Products
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Live cloud database inventory connected to {API.replace('https://', '')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSeedDemo}
            className="btn-primary"
            style={{ background: '#334155', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={15} />
            Seed Demo Data
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      {stats && (
        <div className="cards-grid">
          <div className="card">
            <span className="card-title">Total Products</span>
            <span className="card-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
              <Boxes size={22} />
              {stats.totalProducts}
            </span>
          </div>

          <div className="card">
            <span className="card-title">Total In Stock</span>
            <span className="card-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
              <TrendingUp size={22} />
              {stats.totalStock} units
            </span>
          </div>

          <div className="card">
            <span className="card-title">Average Price</span>
            <span className="card-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
              ${stats.avgPrice ? stats.avgPrice.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="interactive-panel" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </h3>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Name</label>
              <input
                className="greet-input"
                style={{ width: '100%' }}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
              <input
                className="greet-input"
                style={{ width: '100%' }}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="greet-input"
                style={{ width: '100%' }}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Stock Quantity</label>
              <input
                type="number"
                className="greet-input"
                style={{ width: '100%' }}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Description</label>
              <input
                className="greet-input"
                style={{ width: '100%' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={resetForm} className="btn-primary" style={{ background: '#334155' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input
            className="greet-input"
            style={{ width: '100%', paddingLeft: '36px' }}
            placeholder="Search products by title, category, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                border: selectedCategory === c ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                background: selectedCategory === c ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.5)',
                color: selectedCategory === c ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <button onClick={fetchData} className="btn-primary" style={{ background: '#1e293b', padding: '10px' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Products Table */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Fetching products from Alpalin server...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No products match your criteria. Click "Seed Demo Data" to load sample products.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(11, 15, 25, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '12px 16px', color: '#94a3b8' }}>Product</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8' }}>Category</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8' }}>Price</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8' }}>Stock</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{p.description}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#a5b4fc',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#38bdf8' }}>
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      color: p.stock > 10 ? '#34d399' : p.stock > 0 ? '#fbbf24' : '#ef4444',
                      fontWeight: 500
                    }}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
