import { useEffect, useRef } from 'react'
import ProjectCard from './ProjectCard'

function ProjectGrid({ repos, loading }) {
  const gridRef = useRef(null)

  useEffect(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    cards.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [repos])

  return (
    <section className="section" id="projects">
      <div className="container">
        <div className="section__header">
          <div className="section__tag">Projects</div>
          <h2 className="section__title">What I've been building</h2>
        </div>

        {loading ? (
          <div className="projects-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 20 }} />
            ))}
          </div>
        ) : (
          <div className="projects-grid" ref={gridRef}>
            {repos.map((repo, i) => (
              <ProjectCard key={repo.id} repo={repo} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectGrid
