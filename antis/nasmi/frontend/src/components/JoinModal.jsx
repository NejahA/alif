import React, { useState } from 'react';
import './JoinModal.css';

export default function JoinModal({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    department: 'Engineering',
    email: '',
    profileUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newContact = await res.json();
        onAdded(newContact);
        onClose();
      } else {
        alert('Failed to add contact');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating contact.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Join the Network</h2>
        <p className="text-secondary">Enter your details to be featured.</p>
        
        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} />
          </div>
          <div className="row">
            <div className="form-group">
              <label>Role / Title</label>
              <input type="text" name="role" required value={formData.role} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input type="text" name="company" required value={formData.company} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select name="department" value={formData.department} onChange={handleChange}>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="row">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Profile URL</label>
              <input type="url" name="profileUrl" value={formData.profileUrl} onChange={handleChange} />
            </div>
          </div>
          
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 'Submitting...' : 'Join Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
