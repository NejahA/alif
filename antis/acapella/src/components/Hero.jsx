import { useEffect, useRef } from 'react'

function Hero({ profile, repos, loading }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))]

  return (
    <section className="hero" id="hero">
      <div className="hero__grid-bg" />
      <div className="hero__content fade-up" ref={ref}>
        {/* Avatar */}
        <div className="hero__avatar-wrap">
          <div className="hero__avatar-ring">
            {loading ? (
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              <img
                className="hero__avatar"
                src={profile?.avatar_url}
                alt={`${profile?.login}'s avatar`}
              />
            )}
          </div>
          <div className="hero__avatar-glow" />
        </div>

        {/* Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Available for opportunities
        </div>

        {/* Title */}
        <h1 className="hero__title">
          Hi, I'm{' '}
          <span className="hero__title-gradient">
            {loading ? '...' : profile?.login || 'NejahA'}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          {profile?.bio ||
            'Full-stack developer crafting modern web applications, desktop tools, and IoT solutions. Passionate about clean code and great user experiences.'}
        </p>

        {/* Stats */}
        <div className="hero__stats">
          <div className="hero__stat">
            <div className="hero__stat-value">{loading ? '—' : repos.length}</div>
            <div className="hero__stat-label">Projects</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-value">{loading ? '—' : languages.length}</div>
            <div className="hero__stat-label">Languages</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-value">{loading ? '—' : profile?.followers ?? 0}</div>
            <div className="hero__stat-label">Followers</div>
          </div>
          <div className="hero__stat">
            <div className="hero__stat-value">{loading ? '—' : profile?.following ?? 0}</div>
            <div className="hero__stat-label">Following</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
