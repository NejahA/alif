import { attractions } from '../data/attractions';

export default function Attractions() {
  return (
    <section className="section" id="attractions">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Must-See</span>
          <h2>Top Attractions</h2>
          <div className="divider"></div>
        </div>
        <div className="cards-grid">
          {attractions.map((attraction, i) => (
            <div key={i} className="attraction-card">
              <div className="card-icon">{attraction.icon}</div>
              <h3>{attraction.name}</h3>
              <p>{attraction.desc}</p>
              <span className="card-tag">{attraction.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}