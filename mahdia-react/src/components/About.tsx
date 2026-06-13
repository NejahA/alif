export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Discover</span>
          <h2>About Mahdia</h2>
          <div className="divider"></div>
        </div>
        <div className="about-grid">
          <div className="about-text">
            <p>Mahdia is a coastal city in northern Tunisia, known for its rich history as the capital of the Fatimid Caliphate in the 10th century. Founded in 921 AD by Caliph Abdallah al-Mahdi, the city was built on a narrow peninsula jutting into the Mediterranean Sea, giving it a naturally defensive position and stunning sea views.</p>
            <p>Today, Mahdia is celebrated for its pristine white-sand beaches, authentic medina, vibrant fishing port, and centuries-old monuments that tell the story of Islamic civilization in North Africa. It's a quieter alternative to Tunisia's more tourist-heavy resorts, offering a genuine glimpse into Tunisian coastal life.</p>
            <div className="stats">
              <div className="stat"><span className="stat-num">1100+</span><span className="stat-label">Years of History</span></div>
              <div className="stat"><span className="stat-num">15km</span><span className="stat-label">Golden Beaches</span></div>
              <div className="stat"><span className="stat-num">3rd</span><span className="stat-label">Fatimid Capital</span></div>
            </div>
          </div>
          <div className="about-image">
            <div className="image-placeholder">
              <span>&#127754;</span>
              <p>Mediterranean Coastline</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}