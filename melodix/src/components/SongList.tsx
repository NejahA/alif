import { Song, Playlist } from '../types/music'

interface SongListProps {
  songs: Song[]
  onPlaySong: (song: Song) => void
  playlists: Playlist[]
  onAddToPlaylist: (song: Song, playlistId: string) => void
  currentSong: Song | null
  isPlaying: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
}

function SongList({ songs, onPlaySong, playlists, onAddToPlaylist, currentSong, isPlaying, searchQuery, onSearchChange }: SongListProps) {
  const toggleDropdown = (songId: string) => {
    const select = document.getElementById('playlist-select-' + songId)
    if (select) {
      select.style.display = select.style.display === 'block' ? 'none' : 'block'
    }
  }

  const addToPlaylist = (song: Song, plId: string) => {
    onAddToPlaylist(song, plId)
    const el = document.getElementById('playlist-select-' + song.id)
    if (el) {
      el.style.display = 'none'
    }
  }

  return (
    <div className="song-list-page">
      <div className="page-header">
        <h2>All Songs</h2>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="songs-grid">
        {songs.map(song => (
          <div
            key={song.id}
            className={'song-card' + (currentSong?.id === song.id ? ' playing' : '')}
          >
            <div className="song-cover-wrapper" onClick={() => onPlaySong(song)}>
              <img src={song.cover} alt={song.title} className="song-cover" />
              <div className="play-overlay">
                {currentSong?.id === song.id && isPlaying ? '⏸' : '▶'}
              </div>
            </div>
            <div className="song-info">
              <h4 className="song-title">{song.title}</h4>
              <p className="song-artist">{song.artist}</p>
              <p className="song-meta">{song.album} · {song.duration}</p>
              <span className="genre-tag">{song.genre}</span>
            </div>
            <div className="song-actions">
              <button
                className="add-to-playlist-btn"
                onClick={() => toggleDropdown(song.id)}
                title="Add to playlist"
              >
                + Playlist
              </button>
              <div id={'playlist-select-' + song.id} className="playlist-dropdown">
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(song, pl.id)}
                    className="playlist-option"
                  >
                    {pl.name}{pl.songs.find(s => s.id === song.id) ? ' ✓' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {songs.length === 0 && (
        <div className="empty-state">
          <p>No songs found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  )
}

export default SongList