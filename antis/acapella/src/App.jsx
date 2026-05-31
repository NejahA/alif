import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProjectGrid from './components/ProjectGrid'
import Footer from './components/Footer'

const GITHUB_USER = 'NejahA'
const API_BASE = 'https://api.github.com'

function App() {
  const [profile, setProfile] = useState(null)
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`${API_BASE}/users/${GITHUB_USER}`),
          fetch(`${API_BASE}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`),
        ])
        const profileData = await profileRes.json()
        const reposData = await reposRes.json()

        setProfile(profileData)
        // Filter out forks and sort by most recently pushed
        const filtered = reposData
          .filter(r => !r.fork)
          .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        setRepos(filtered)
      } catch (err) {
        console.error('Failed to fetch GitHub data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <>
      <Navbar />
      <Hero profile={profile} repos={repos} loading={loading} />
      <ProjectGrid repos={repos} loading={loading} />
      <Footer />
    </>
  )
}

export default App
