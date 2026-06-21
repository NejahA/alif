import { Song } from '../types/music'

interface PlayerBarProps {
  currentSong: Song | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
}

export default function PlayerBar({ currentSong, isPlaying, onPlayPause, onNext, onPrev }: PlayerBarProps) {
  if (!currentSong) return null

  return (
    <div className="player-bar">
      <div className="player-song-info">
        <img src={currentSong.cover} alt={currentSong.title} className="player-cover" />
        <div>
          <h4 className="player-title">{currentSong.title}</h4>
          <p className="player-artist">{currentSong.artist}</p>
        </div>
      </div>

      <div className="player-controls">
        <button className="control-btn" onClick={onPrev}>⏮</button>
        <button className="control-btn play-btn" onClick={onPlayPause}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="control-btn" onClick={onNext}>⏭</button>
      </div>

      <div className="player-meta">
        <span className="player-duration">{currentSong.duration}</span>
        <span className="player-genre">{currentSong.genre}</span>
      </div>
    </div>
  )
}