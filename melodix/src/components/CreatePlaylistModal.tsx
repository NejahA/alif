  import { useState } from 'react'

interface CreatePlaylistModalProps {
  onSubmit: (name: string, description: string) => void
  onClose: () => void
}

export default function CreatePlaylistModal({ onSubmit, onClose }: CreatePlaylistModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), description.trim())
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create Playlist</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>Playlist Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome playlist"
              autoFocus
              required
            />
          </div>
          <div className="modal-field">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-btn primary">Create</button>
            <button type="button" className="modal-btn secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}