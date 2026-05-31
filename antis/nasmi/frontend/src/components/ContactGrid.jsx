import React, { useState } from 'react';
import ContactCard from './ContactCard';
import './ContactGrid.css';

export default function ContactGrid({ contacts }) {
  const [filter, setFilter] = useState('All');

  const filteredContacts = filter === 'All' 
    ? contacts 
    : contacts.filter(c => c.department === filter);

  return (
    <section className="contact-grid-container container">
      <div className="grid-header">
        <h2>Executive Network</h2>
        <div className="grid-filters">
          {['All', 'Engineering', 'Design', 'Product', 'Other'].map(f => (
            <span 
              key={f}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <div className="contact-grid">
        {filteredContacts.map((contact, index) => (
          <ContactCard key={contact._id || index} contact={contact} />
        ))}
      </div>
    </section>
  );
}
