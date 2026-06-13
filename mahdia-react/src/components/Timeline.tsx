import { timelineEvents } from '../data/attractions';

export default function Timeline() {
  return (
    <section className="section timeline-section" id="timeline">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">History</span>
          <h2>Historical Timeline</h2>
          <div className="divider"></div>
        </div>
        <div className="timeline">
          {timelineEvents.map((event, index) => (
            <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-content">
                <span className="year">{event.year}</span>
                <h3>{event.title}</h3>
                <p>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}