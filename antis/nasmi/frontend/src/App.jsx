import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContactGrid from './components/ContactGrid';
import JoinModal from './components/JoinModal';

function App() {
  const [contacts, setContacts] = useState([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(err => console.error('Failed to fetch contacts:', err));
  }, []);

  const handleContactAdded = (newContact) => {
    setContacts([newContact, ...contacts]);
  };

  const handleExplore = () => {
    document.getElementById('network').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Header onConnectClick={() => setIsJoinModalOpen(true)} />
      <main>
        <HeroSection 
          onExploreClick={handleExplore} 
          onJoinClick={() => setIsJoinModalOpen(true)} 
        />
        <div id="network">
          <ContactGrid contacts={contacts} />
        </div>
      </main>

      {isJoinModalOpen && (
        <JoinModal 
          onClose={() => setIsJoinModalOpen(false)} 
          onAdded={handleContactAdded}
        />
      )}
    </div>
  );
}

export default App;
