import { Playlist } from '../types/music'

interface SidebarProps {
  playlists: Playlist[]
  activeView: string
  onViewChange: (view: string) => void
  onCreatePlaylist: () => void
  onDeletePlaylist: (id: string) => void
}

export default function Sidebar({ playlists, activeView, onViewChange, onCreatePlaylist, onDeletePlaylist }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🎵</span>
          <h1>Melodix</h1>
        </div>
      </div>

      <div className="sidebar-section">
        <button
          className={`sidebar-item ${activeView === 'songs' ? 'active' : ''}`}
          onClick={() => onViewChange('songs')}
        >
          <span className="item-icon">🎶</span>
          <span>All Songs</span>
        </button>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Playlists</h3>
          <button className="add-btn" onClick={onCreatePlaylist} title="Create Playlist">+</button>
        </div>
        <div className="playlist-list">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className={`sidebar-item playlist-item ${activeView === pl.id ? 'active' : ''}`}
              onClick={() => onViewChange(pl.id)}
            >
              <img src={pl.cover} alt={pl.name} className="playlist-cover-mini" />
              <div className="playlist-info">
                <span className="playlist-name">{pl.name}</span>
                <span className="playlist-count">{pl.songs.length} songs</span>
              </div>
              <button
                className="delete-playlist-btn"
                onClick={(e) => { e.stopPropagation(); onDeletePlaylist(pl.id) }}
                title="Delete playlist"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}