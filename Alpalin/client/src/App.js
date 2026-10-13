import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

const defaultProductForm = {
  name: '',
  price: '',
  description: '',
  category: '',
  stock: '',
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('alpalin-token') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('alpalin-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    inventoryValue: 0,
    categoriesCount: 0,
    categories: [],
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [productForm, setProductForm] = useState(defaultProductForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('alpalin-token', token);
    } else {
      localStorage.removeItem('alpalin-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('alpalin-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('alpalin-user');
    }
  }, [user]);

  const addActivity = (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActivity((prev) => [{ id: Date.now(), text, time }, ...prev.slice(0, 4)]);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/products/stats`),
      ]);
      setProducts(productsRes.data);
      setStats(statsRes.data);
    } catch (loadError) {
      console.error(loadError);
      setError('Unable to load live data from MongoDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      const { token: jwtToken, user: authUser } = response.data;
      setToken(jwtToken);
      setUser(authUser);
      setAuthForm({ name: '', email: '', password: '' });
      setInfo(authMode === 'login' ? `Welcome back, ${authUser.name}!` : 'Account created successfully!');
      addActivity(`User ${authUser.name} signed in`);
    } catch (authError) {
      setError(authError.response?.data?.message || 'Authentication failed.');
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!token) {
      setError('Please sign in with an account before adding or editing products.');
      return;
    }

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };

      if (editingId) {
        await axios.put(`${API_BASE}/products/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfo(`Updated "${productForm.name}" successfully.`);
        addActivity(`Updated product "${productForm.name}"`);
      } else {
        await axios.post(`${API_BASE}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfo(`Created "${productForm.name}" in database.`);
        addActivity(`Added new product "${productForm.name}"`);
      }

      setProductForm(defaultProductForm);
      setEditingId(null);
      await loadData();
    } catch (productError) {
      setError(productError.response?.data?.message || 'Product save failed.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!token) {
      setError('Sign in required to delete products.');
      return;
    }

    if (!window.confirm(`Delete "${product.name}"?`)) return;

    try {
      await axios.delete(`${API_BASE}/products/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfo(`Deleted "${product.name}".`);
      addActivity(`Deleted product "${product.name}"`);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Delete failed.');
    }
  };

  const handleStockAdjust = async (product, delta) => {
    try {
      const response = await axios.patch(`${API_BASE}/products/${product._id}/stock`, { delta });
      const updated = response.data;
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      
      const actionText = delta > 0 ? `Restocked +${delta}` : `Sold 1 unit of`;
      setInfo(`${actionText} "${product.name}". New stock: ${updated.stock}`);
      addActivity(`${actionText} "${product.name}" (Stock: ${updated.stock})`);

      // Refresh live stats
      const statsRes = await axios.get(`${API_BASE}/products/stats`);
      setStats(statsRes.data);
    } catch (stockError) {
      setError(stockError.response?.data?.message || 'Failed to adjust stock.');
    }
  };

  const handleSeedDemoData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/products/seed`);
      setInfo(response.data.message || 'Demo products loaded successfully!');
      addActivity('Seeded sample catalog data into MongoDB');
      await loadData();
    } catch (seedError) {
      setError(seedError.response?.data?.message || 'Failed to seed sample data.');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setProductForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category,
      stock: String(product.stock),
    });
    // Scroll smoothly to form
    const elem = document.getElementById('catalog-form');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setError('');
    setInfo('You have been signed out.');
    addActivity('User signed out');
  };

  // Dynamic unique categories derived from live products
  const uniqueCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Dynamic filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          (product.name && product.name.toLowerCase().includes(term)) ||
          (product.description && product.description.toLowerCase().includes(term)) ||
          (product.category && product.category.toLowerCase().includes(term));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
        if (sortBy === 'stock-asc') return Number(a.stock) - Number(b.stock);
        if (sortBy === 'stock-desc') return Number(b.stock) - Number(a.stock);
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">A</div>
          <div>
            <p className="brand-name">Alpalin</p>
            <div className="live-status-pill">
              <span className="live-pulse"></span>
              <small>MongoDB Atlas Live</small>
            </div>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#catalog">Catalog</a>
          <a href="#accounts">Accounts</a>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-profile-badge">
              <span className="user-name-tag">{user.name}</span>
              <button className="secondary-btn logout-btn" onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <button className="primary-btn" onClick={() => setAuthMode('login')}>Sign in</button>
          )}
        </div>
      </header>

      <main className="content">
        <section id="overview" className="hero card">
          <div className="hero-copy">
            <span className="eyebrow">Dynamic Commerce Platform</span>
            <h1>Real-time Inventory &amp; Live Catalog.</h1>
            <p>
              Alpalin connects directly to your cloud MongoDB database with live aggregations, instant stock updates,
              and category analytics.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => {
                const elem = document.getElementById('catalog-form');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}>
                Add Product
              </button>
              <button className="secondary-btn" onClick={loadData} disabled={isLoading}>
                {isLoading ? 'Syncing...' : '↻ Refresh Data'}
              </button>
              {products.length <= 2 && (
                <button className="secondary-btn seed-btn" onClick={handleSeedDemoData} disabled={isLoading}>
                  + Load Demo Catalog
                </button>
              )}
            </div>
          </div>

          <div className="stats-panel">
            <div className="metric-box">
              <div className="metric-top">
                <span>Total Catalog Value</span>
                <span className="metric-tag">Live</span>
              </div>
              <strong>${(stats.inventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              <small className="metric-sub">{stats.totalStock || 0} total units in stock</small>
            </div>

            <div className="metric-box">
              <div className="metric-top">
                <span>Active Products</span>
                <span className="metric-tag">{stats.categoriesCount || 0} Categories</span>
              </div>
              <strong>{stats.totalProducts || 0}</strong>
              <small className="metric-sub">
                {stats.totalProducts === 1 ? '1 item registered' : `${stats.totalProducts} items registered`}
              </small>
            </div>

            <div className="metric-box">
              <div className="metric-top">
                <span>Stock Health</span>
                <span className={`health-tag ${stats.outOfStockCount > 0 ? 'alert' : 'ok'}`}>
                  {stats.outOfStockCount > 0 ? `${stats.outOfStockCount} Out` : '100% In Stock'}
                </span>
              </div>
              <strong>
                {stats.totalProducts > 0
                  ? `${Math.round(((stats.totalProducts - (stats.outOfStockCount || 0)) / stats.totalProducts) * 100)}%`
                  : '100%'}
              </strong>
              <small className="metric-sub">
                {stats.lowStockCount || 0} low stock items (&le;5 units)
              </small>
            </div>
          </div>
        </section>

        {activity.length > 0 && (
          <div className="activity-banner card">
            <span className="activity-label">Recent Activity:</span>
            <div className="activity-ticker">
              <span className="activity-badge">{activity[0].time}</span>
              <span className="activity-text">{activity[0].text}</span>
            </div>
          </div>
        )}

        {error && <div className="flash error">{error}</div>}
        {info && <div className="flash info">{info}</div>}

        <section className="workspace-grid">
          <div id="accounts" className="card auth-card">
            {!user ? (
              <>
                <div className="section-header">
                  <h2>{authMode === 'login' ? 'Sign in' : 'Create account'}</h2>
                  <button className="link-btn" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                    {authMode === 'login' ? 'Need an account?' : 'Already registered?'}
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="form-grid">
                  {authMode === 'register' && (
                    <label>
                      Full name
                      <input
                        type="text"
                        name="name"
                        value={authForm.name}
                        onChange={handleAuthChange}
                        placeholder="Jane Doe"
                        required
                      />
                    </label>
                  )}

                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthChange}
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      name="password"
                      value={authForm.password}
                      onChange={handleAuthChange}
                      placeholder="••••••••"
                      minLength="6"
                      required
                    />
                  </label>

                  <button type="submit" className="primary-btn submit-btn">
                    {authMode === 'login' ? 'Sign in' : 'Register'}
                  </button>
                </form>
              </>
            ) : (
              <div className="welcome-box">
                <span className="eyebrow">Authenticated Staff</span>
                <h2>Welcome back, {user.name}</h2>
                <p>Your session is active. You have full administrative permission to manage inventory and products.</p>
                <div className="user-chip">{user.email}</div>
              </div>
            )}
          </div>

          <div id="catalog-form" className="card product-card">
            <div className="section-header">
              <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
              {editingId && (
                <button
                  className="link-btn"
                  onClick={() => {
                    setEditingId(null);
                    setProductForm(defaultProductForm);
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form onSubmit={handleProductSubmit} className="form-grid">
              <label>
                Product name
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  placeholder="e.g. Ergonomic Office Chair"
                  required
                />
              </label>

              <label>
                Price ($)
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleProductChange}
                  placeholder="149.99"
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Category
                <input
                  type="text"
                  name="category"
                  value={productForm.category}
                  onChange={handleProductChange}
                  placeholder="e.g. Furniture, Electronics"
                  list="categories-datalist"
                  required
                />
                <datalist id="categories-datalist">
                  {stats.categories?.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </label>

              <label>
                Stock Units
                <input
                  type="number"
                  name="stock"
                  value={productForm.stock}
                  onChange={handleProductChange}
                  placeholder="25"
                  min="0"
                  required
                />
              </label>

              <label className="full-width">
                Description
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  placeholder="Describe dimensions, features, materials..."
                  rows="3"
                  required
                />
              </label>

              <button type="submit" className="primary-btn submit-btn">
                {editingId ? 'Update in Database' : 'Save to MongoDB'}
              </button>
            </form>
          </div>
        </section>

        <section id="catalog" className="catalog-list card">
          <div className="catalog-controls-header">
            <div>
              <h2>Live Product Catalog</h2>
              <span className="item-count-badge">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>

            <div className="catalog-action-bar">
              <div className="search-wrap">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                    ✕
                  </button>
                )}
              </div>

              <div className="sort-wrap">
                <label htmlFor="sort-select">Sort:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock-desc">Stock: High to Low</option>
                  <option value="stock-asc">Stock: Low to High</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              <button className="refresh-btn" onClick={loadData} title="Refresh catalog">
                ↻
              </button>
            </div>
          </div>

          {uniqueCategories.length > 1 && (
            <div className="category-pills">
              {uniqueCategories.map((cat) => {
                const count = cat === 'All'
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} <span className="cat-pill-count">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isOutOfStock = (product.stock || 0) <= 0;
                const isLowStock = !isOutOfStock && (product.stock || 0) <= 5;

                return (
                  <article key={product._id} className={`product-item ${isOutOfStock ? 'item-out' : ''}`}>
                    <div className="product-header">
                      <div>
                        <h3>{product.name}</h3>
                        <span className="product-cat-tag">{product.category}</span>
                      </div>
                      <div className="price-tag">
                        <strong>${Number(product.price).toFixed(2)}</strong>
                      </div>
                    </div>

                    <p>{product.description}</p>

                    <div className="stock-status-bar">
                      <span className={`stock-badge ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock (${product.stock})` : `In Stock: ${product.stock}`}
                      </span>

                      <div className="quick-stock-controls">
                        <button
                          className="quick-adjust-btn sell-btn"
                          onClick={() => handleStockAdjust(product, -1)}
                          disabled={isOutOfStock}
                          title="Sell 1 unit (decrease stock)"
                        >
                          − Sell 1
                        </button>
                        <button
                          className="quick-adjust-btn restock-btn"
                          onClick={() => handleStockAdjust(product, 5)}
                          title="Restock 5 units"
                        >
                          + Restock 5
                        </button>
                      </div>
                    </div>

                    <div className="product-meta">
                      <span className="item-id-hint">ID: {product._id?.slice(-6)}</span>
                      <div className="row-actions">
                        <button className="small-btn" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button className="small-btn danger" onClick={() => handleDeleteProduct(product)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No products match your current filters.</p>
                {searchTerm || selectedCategory !== 'All' ? (
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button className="primary-btn" onClick={handleSeedDemoData}>
                    Load Sample Catalog Data
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
