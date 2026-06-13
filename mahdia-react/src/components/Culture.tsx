import { cultureItems } from '../data/attractions';

export default function Culture() {
  return (
    <section className="section culture-section" id="culture">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Heritage</span>
          <h2>Culture & Traditions</h2>
          <div className="divider"></div>
        </div>
        <div className="culture-grid">
          {cultureItems.map((item, i) => (
            <div key={i} className="culture-card">
              <div className="culture-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}