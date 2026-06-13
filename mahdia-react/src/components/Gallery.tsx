import { galleryItems } from '../data/attractions';

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Views</span>
          <h2>Gallery</h2>
          <div className="divider"></div>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item, i) => (
            <div key={i} className="gallery-item" style={{ background: item.gradient }}>
              <div className="gallery-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}