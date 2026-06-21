import { Song, Playlist } from '../types/music'

interface PlaylistViewProps {
  playlist: Playlist
  onPlaySong: (song: Song) => void
  onRemoveSong: (songId: string) => void
  currentSong: Song | null
  isPlaying: boolean
}

export default function PlaylistView({ playlist, onPlaySong, onRemoveSong, currentSong, isPlaying }: PlaylistViewProps) {
  return (
    <div className="playlist-view">
      <div className="playlist-header">
        <img src={playlist.cover} alt={playlist.name} className="playlist-cover-lg" />
        <div className="playlist-info-header">
          <span className="playlist-label">PLAYLIST</span>
          <h2>{playlist.name}</h2>
          <p className="playlist-desc">{playlist.description}</p>
          <p className="playlist-meta">{playlist.songs.length} songs · Created {playlist.createdAt}</p>
          <div className="playlist-actions">
            {playlist.songs.length > 0 && (
              <button className="play-all-btn" onClick={() => onPlaySong(playlist.songs[0])}>
                ▶ Play All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="playlist-songs">
        {playlist.songs.length === 0 ? (
          <div className="empty-playlist">
            <p>This playlist is empty. Add some songs from the All Songs page!</p>
          </div>
        ) : (
          <div className="songs-table">
            <div className="table-header">
              <span className="col-num">#</span>
              <span className="col-title">Title</span>
              <span className="col-artist">Artist</span>
              <span className="col-album">Album</span>
              <span className="col-duration">Duration</span>
              <span className="col-actions"></span>
            </div>
            {playlist.songs.map((song, idx) => (
              <div
                key={song.id}
                className={'table-row' + (currentSong?.id === song.id ? ' active' : '')}
                onDoubleClick={() => onPlaySong(song)}
              >
                <span className="col-num">{idx + 1}</span>
                <span className="col-title">
                  <img src={song.cover} alt="" className="row-cover" />
                  <span>{song.title}</span>
                </span>
                <span className="col-artist">{song.artist}</span>
                <span className="col-album">{song.album}</span>
                <span className="col-duration">{song.duration}</span>
                <span className="col-actions">
                  <button className="play-row-btn" onClick={() => onPlaySong(song)}>
                    {currentSong?.id === song.id && isPlaying ? '⏸' : '▶'}
                  </button>
                  <button className="remove-btn" onClick={() => onRemoveSong(song.id)} title="Remove from playlist">
                    ✕
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}