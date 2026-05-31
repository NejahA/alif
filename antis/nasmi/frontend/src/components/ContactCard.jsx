import React from 'react';
import './ContactCard.css';

export default function ContactCard({ contact }) {
  return (
    <div className="contact-card glass-panel">
      <div className="card-header">
        <div className="avatar-wrapper">
          <img 
            src={contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name || 'User')}&background=random`} 
            alt={contact.name} 
            className="avatar" 
          />
          <div className="status-indicator"></div>
        </div>
      </div>
      <div className="card-body">
        <h3 className="contact-name">{contact.name}</h3>
        <p className="contact-role text-gradient">{contact.role}</p>
        <p className="contact-company">{contact.company}</p>
      </div>
      <div className="card-footer">
        {contact.email ? (
          <a href={`mailto:${contact.email}`} className="card-btn">Email</a>
        ) : (
          <button className="card-btn" disabled>No Email</button>
        )}
        
        {contact.profileUrl && contact.profileUrl !== '#' ? (
          <a href={contact.profileUrl} target="_blank" rel="noreferrer" className="card-btn">Profile</a>
        ) : (
          <a href="#" onClick={(e) => e.preventDefault()} className="card-btn">Profile</a>
        )}
      </div>
    </div>
  );
}
