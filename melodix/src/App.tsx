import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import PlaylistView from './components/PlaylistView'
import SongList from './components/SongList'
import PlayerBar from './components/PlayerBar'
import CreatePlaylistModal from './components/CreatePlaylistModal'
import { Song, Playlist } from './types/music'
import { sampleSongs, defaultPlaylists } from './data/songs'
import './App.css'

export default function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>(defaultPlaylists)
  const [activeView, setActiveView] = useState<'songs' | string>('songs')
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSongs = sampleSongs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.album.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
    }
  }

  const handleAddToPlaylist = (song: Song, playlistId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.songs.find(s => s.id === song.id)) {
        return { ...p, songs: [...p.songs, song] }
      }
      return p
    }))
  }

  const handleRemoveFromPlaylist = (songId: string, playlistId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) }
      }
      return p
    }))
  }

  const handleCreatePlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `pl${Date.now()}`,
      name,
      description,
      cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop',
      songs: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
    setPlaylists(prev => [...prev, newPlaylist])
    setShowCreateModal(false)
  }

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id))
    if (activeView === id) {
      setActiveView('songs')
      setCurrentPlaylist(null)
    }
  }

  useEffect(() => {
    if (activeView.startsWith('pl')) {
      const pl = playlists.find(p => p.id === activeView)
      setCurrentPlaylist(pl || null)
    } else {
      setCurrentPlaylist(null)
    }
  }, [activeView, playlists])

  return (
    <div className="app">
      <Sidebar
        playlists={playlists}
        activeView={activeView}
        onViewChange={setActiveView}
        onCreatePlaylist={() => setShowCreateModal(true)}
        onDeletePlaylist={handleDeletePlaylist}
      />
      <div className="main-area">
        {currentPlaylist ? (
          <PlaylistView
            playlist={currentPlaylist}
            onPlaySong={handlePlaySong}
            onRemoveSong={(songId) => handleRemoveFromPlaylist(songId, currentPlaylist.id)}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        ) : (
          <SongList
            songs={filteredSongs}
            onPlaySong={handlePlaySong}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            currentSong={currentSong}
            isPlaying={isPlaying}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={() => {
          const songs = currentPlaylist?.songs || filteredSongs
          const idx = songs.findIndex(s => s.id === currentSong?.id)
          if (idx < songs.length - 1) setCurrentSong(songs[idx + 1])
        }}
        onPrev={() => {
          const songs = currentPlaylist?.songs || filteredSongs
          const idx = songs.findIndex(s => s.id === currentSong?.id)
          if (idx > 0) setCurrentSong(songs[idx - 1])
        }}
      />
      {showCreateModal && (
        <CreatePlaylistModal
          onSubmit={handleCreatePlaylist}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}