import React, { useState } from 'react'

interface SettingsProps {
  dailyLimit: number
  onUpdateDailyLimit: (limit: number) => void
  onExportData: () => void
  onImportData: (file: File) => Promise<number | string>
  onResetAll: () => void
  onSeedData: () => void
  totalCards: number
}

export const Settings: React.FC<SettingsProps> = ({
  dailyLimit,
  onUpdateDailyLimit,
  onExportData,
  onImportData,
  onResetAll,
  onSeedData,
  totalCards,
}) => {
  const [limitInput, setLimitInput] = useState(dailyLimit.toString())
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(limitInput, 10)
    if (isNaN(parsed) || parsed < 1) {
      alert('Please enter a valid positive number.')
      return
    }
    onUpdateDailyLimit(parsed)
    alert('Daily review limit updated successfully!')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportStatus({ message: 'Importing...' })
    try {
      const countOrError = await onImportData(file)
      if (typeof countOrError === 'number') {
        setImportStatus({ success: true, message: `Successfully imported ${countOrError} cards!` })
      } else {
        setImportStatus({ success: false, message: `Import failed: ${countOrError}` })
      }
    } catch (err: any) {
      setImportStatus({ success: false, message: `Import error: ${err.message || err}` })
    }
  }

  const handleResetSubmit = () => {
    if (confirm('WARNING: This will wipe out ALL your flashcards and progress. This cannot be undone. Are you absolutely sure?')) {
      if (confirm('Type YES to confirm deletion.')) {
        onResetAll()
        alert('All cards and stats have been reset.')
      }
    }
  }

  return (
    <div className="settings-container animate-fade-in">
      <header className="settings-header">
        <div>
          <h1>Settings</h1>
          <p className="subtext">Configure user preferences and manage database payloads</p>
        </div>
      </header>

      <div className="settings-grid">
        
        {/* Study Configuration */}
        <section className="settings-card card-glow-purple">
          <h3>Study Settings</h3>
          <p className="card-desc">Adjust daily parameters for spaced repetition reviews</p>

          <form onSubmit={handleLimitSubmit} className="limit-form">
            <div className="form-group">
              <label htmlFor="daily-limit-input">Daily Review Limit</label>
              <div className="input-with-button">
                <input
                  id="daily-limit-input"
                  type="number"
                  min="1"
                  max="500"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="input-text"
                />
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
              <span className="form-tip">Limits the maximum number of reviews proposed in a single day.</span>
            </div>
          </form>
        </section>

        {/* Data Transfer: Import / Export */}
        <section className="settings-card card-glow-cyan">
          <h3>Backup & Migration</h3>
          <p className="card-desc">Export flashcard database or restore from a JSON backup</p>

          <div className="data-transfer-buttons">
            <div className="transfer-action">
              <label className="transfer-label">Export Database</label>
              <button className="btn btn-outline btn-block" onClick={onExportData}>
                📥 Export JSON Backup
              </button>
              <span className="transfer-tip">Saves cards and scheduling progress into a JSON file.</span>
            </div>

            <div className="transfer-action">
              <label className="transfer-label">Import Database</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  id="import-file-uploader"
                  className="file-uploader-hidden"
                />
                <label htmlFor="import-file-uploader" className="btn btn-primary btn-block btn-file-label">
                  📤 Select JSON File
                </label>
              </div>
              <span className="transfer-tip">Append cards from a compatible `ponder` JSON file.</span>
            </div>
          </div>

          {importStatus && (
            <div className={`status-feedback-box ${importStatus.success ? 'feedback-success' : 'feedback-error'}`}>
              {importStatus.message}
            </div>
          )}
        </section>

        {/* Database Utilities */}
        <section className="settings-card card-glow-pink settings-danger-zone">
          <h3>Data Utilities & Reset</h3>
          <p className="card-desc">Actions to clear data or seed sample cards</p>

          <div className="db-utility-buttons">
            <div className="utility-item">
              <h4>Seed Sample Decks</h4>
              <p>Adds pre-defined study decks (JavaScript, Algorithms, Git, Regex) to practice and test reviews.</p>
              <button className="btn btn-outline" onClick={onSeedData}>
                🌱 Seed Starter Decks
              </button>
            </div>

            <div className="utility-item danger-item">
              <h4>Factory Reset</h4>
              <p>Permanently deletes all card data, configurations, history, and active streaks.</p>
              <button className="btn btn-danger" onClick={handleResetSubmit}>
                🚨 WIPE ENTIRE DATABASE
              </button>
            </div>
          </div>
        </section>

        {/* About App */}
        <section className="settings-card card-glow-dark settings-about">
          <h3>About Ponder</h3>
          <p>
            Ponder is a spaced-repetition application designed for developers. It uses the{' '}
            <strong className="sm2-link">SuperMemo-2 (SM-2) algorithm</strong> to calculate optimal review intervals:
          </p>
          <ul className="sm2-explanations">
            <li><strong>Ease Factor (E-Factor):</strong> Dictates how fast intervals grow. Starts at 2.5 and increases for easy answers, decreases for hard ones.</li>
            <li><strong>Repetitions (Intervals):</strong> Reviewing cards successfully schedules them into larger steps (1 day, 6 days, then multiplied by Ease Factor).</li>
            <li><strong>Forgetting:</strong> Scores below 3 reset the interval back to 0 days, forcing you to relearn.</li>
          </ul>
          <div className="settings-metadata">
            <span>Database Status: <strong>{totalCards} cards</strong></span>
            <span>Version: <strong>1.1.0-web</strong></span>
          </div>
        </section>

      </div>
    </div>
  )
}
