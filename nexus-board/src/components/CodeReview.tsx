import { useState } from 'react';

interface CodeReviewProps {
  onReviewSubmit: (review: any) => void;
  onReviewApprove: (reviewId: string) => void;
  onReviewReject: (reviewId: string, comments: string) => void;
}

const CodeReview = ({ onReviewSubmit, onReviewApprove, onReviewReject }: CodeReviewProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [suggestedChanges, setSuggestedChanges] = useState('');
  
  const reviews = [
    {
      id: 'review-1',
      title: 'Authentication Module Refactor',
      author: 'Alex Johnson',
      reviewer: 'Sam Wilson',
      status: 'pending',
      prNumber: '#142',
      branch: 'feature/auth-refactor',
      changes: '+124 -67',
      createdAt: '2 hours ago',
      filesChanged: 8,
      comments: 3,
      severity: 'medium',
      tags: ['security', 'refactor', 'backend']
    },
    {
      id: 'review-2',
      title: 'UI Component Library Update',
      author: 'Jordan Lee',
      reviewer: 'Taylor Swift',
      status: 'approved',
      prNumber: '#138',
      branch: 'feature/ui-components',
      changes: '+89 -12',
      createdAt: '1 day ago',
      filesChanged: 5,
      comments: 7,
      severity: 'low',
      tags: ['frontend', 'components', 'design-system']
    },
    {
      id: 'review-3',
      title: 'Database Migration Script',
      author: 'Casey Kim',
      reviewer: 'Alex Johnson',
      status: 'rejected',
      prNumber: '#135',
      branch: 'feature/db-migration',
      changes: '+256 -189',
      createdAt: '3 days ago',
      filesChanged: 12,
      comments: 15,
      severity: 'high',
      tags: ['database', 'migration', 'backend']
    },
    {
      id: 'review-4',
      title: 'API Rate Limiting',
      author: 'Sam Wilson',
      reviewer: 'Jordan Lee',
      status: 'pending',
      prNumber: '#141',
      branch: 'feature/rate-limiting',
      changes: '+45 -23',
      createdAt: '5 hours ago',
      filesChanged: 3,
      comments: 2,
      severity: 'high',
      tags: ['api', 'security', 'performance']
    },
    {
      id: 'review-5',
      title: 'Mobile Responsive Fixes',
      author: 'Taylor Swift',
      reviewer: 'Casey Kim',
      status: 'approved',
      prNumber: '#137',
      branch: 'fix/mobile-responsive',
      changes: '+67 -34',
      createdAt: '2 days ago',
      filesChanged: 6,
      comments: 4,
      severity: 'medium',
      tags: ['mobile', 'responsive', 'frontend']
    }
  ];
  
  const filteredReviews = reviews.filter(review => review.status === activeTab);
  const selectedReviewData = selectedReview ? reviews.find(r => r.id === selectedReview) : null;
  
  const handleApprove = () => {
    if (selectedReview) {
      onReviewApprove(selectedReview);
      alert(`Review ${selectedReview} approved!`);
    }
  };
  
  const handleReject = () => {
    if (selectedReview && reviewComments.trim()) {
      onReviewReject(selectedReview, reviewComments);
      alert(`Review ${selectedReview} rejected with comments.`);
      setReviewComments('');
      setSuggestedChanges('');
    } else {
      alert('Please provide comments when rejecting a review.');
    }
  };
  
  const handleRequestChanges = () => {
    if (selectedReview && suggestedChanges.trim()) {
      alert(`Changes requested for review ${selectedReview}`);
      setSuggestedChanges('');
    } else {
      alert('Please suggest changes when requesting modifications.');
    }
  };
  
  const handleAddComment = () => {
    if (reviewComments.trim()) {
      alert(`Comment added to review ${selectedReview}`);
      setReviewComments('');
    }
  };
  
  return (
    <div className="code-review">
      <div className="review-header">
        <h3 className="review-title">Code Review</h3>
        <div className="review-stats">
          <span className="stat-badge pending">{reviews.filter(r => r.status === 'pending').length} pending</span>
          <span className="stat-badge approved">{reviews.filter(r => r.status === 'approved').length} approved</span>
          <span className="stat-badge total">{reviews.length} total</span>
        </div>
      </div>
      
      <div className="review-content">
        <div className="review-sidebar">
          <div className="sidebar-section">
            <h4 className="section-title">Review Status</h4>
            <div className="status-tabs">
              <button 
                className={`status-tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <span className="tab-icon">⏳</span>
                Pending
                <span className="tab-count">{reviews.filter(r => r.status === 'pending').length}</span>
              </button>
              <button 
                className={`status-tab ${activeTab === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('approved')}
              >
                <span className="tab-icon">✅</span>
                Approved
                <span className="tab-count">{reviews.filter(r => r.status === 'approved').length}</span>
              </button>
              <button 
                className={`status-tab ${activeTab === 'rejected' ? 'active' : ''}`}
                onClick={() => setActiveTab('rejected')}
              >
                <span className="tab-icon">❌</span>
                Rejected
                <span className="tab-count">{reviews.filter(r => r.status === 'rejected').length}</span>
              </button>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Quick Actions</h4>
            <div className="quick-actions">
              <button className="btn-secondary" onClick={() => onReviewSubmit({ type: 'new', title: 'New Review' })}>
                <span className="action-icon">➕</span>
                New Review
              </button>
              <button className="btn-secondary" onClick={() => alert('Bulk review mode activated')}>
                <span className="action-icon">📋</span>
                Bulk Review
              </button>
              <button className="btn-secondary" onClick={() => alert('Review settings opened')}>
                <span className="action-icon">⚙️</span>
                Settings
              </button>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="section-title">Review Guidelines</h4>
            <div className="guidelines-list">
              <div className="guideline">
                <div className="guideline-icon">🎯</div>
                <div className="guideline-text">Check for security vulnerabilities</div>
              </div>
              <div className="guideline">
                <div className="guideline-icon">📝</div>
                <div className="guideline-text">Ensure code follows style guide</div>
              </div>
              <div className="guideline">
                <div className="guideline-icon">🧪</div>
                <div className="guideline-text">Verify tests are included</div>
              </div>
              <div className="guideline">
                <div className="guideline-icon">📚</div>
                <div className="guideline-text">Check documentation updates</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="review-main">
          <div className="reviews-list">
            <div className="list-header">
              <h4 className="list-title">
                {activeTab === 'pending' ? 'Pending Reviews' : 
                 activeTab === 'approved' ? 'Approved Reviews' : 'Rejected Reviews'}
              </h4>
              <div className="list-actions">
                <button className="btn-secondary btn-sm">Filter</button>
                <button className="btn-secondary btn-sm">Sort</button>
              </div>
            </div>
            
            <div className="reviews-grid">
              {filteredReviews.map(review => (
                <div 
                  key={review.id}
                  className={`review-card ${selectedReview === review.id ? 'selected' : ''}`}
                  onClick={() => setSelectedReview(review.id)}
                >
                  <div className="card-header">
                    <div className="card-title">{review.title}</div>
                    <div className={`severity-badge severity-${review.severity}`}>
                      {review.severity}
                    </div>
                  </div>
                  
                  <div className="card-meta">
                    <div className="meta-item">
                      <span className="meta-label">Author:</span>
                      <span className="meta-value">{review.author}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Reviewer:</span>
                      <span className="meta-value">{review.reviewer}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">PR:</span>
                      <span className="meta-value">{review.prNumber}</span>
                    </div>
                  </div>
                  
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-icon">📁</span>
                      <span className="stat-value">{review.filesChanged}</span>
                      <span className="stat-label">files</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">📝</span>
                      <span className="stat-value">{review.comments}</span>
                      <span className="stat-label">comments</span>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">🔄</span>
                      <span className="stat-value">{review.changes}</span>
                      <span className="stat-label">changes</span>
                    </div>
                  </div>
                  
                  <div className="card-tags">
                    {review.tags.map(tag => (
                      <span key={tag} className="card-tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="card-footer">
                    <div className="card-time">{review.createdAt}</div>
                    <div className="card-branch">{review.branch}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedReviewData && (
            <div className="review-detail">
              <div className="detail-header">
                <h4 className="detail-title">{selectedReviewData.title}</h4>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => setSelectedReview(null)}
                >
                  Close
                </button>
              </div>
              
              <div className="detail-content">
                <div className="detail-section">
                  <h5 className="section-title">Review Details</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${selectedReviewData.status}`}>
                        {selectedReviewData.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Severity:</span>
                      <span className={`detail-value severity-${selectedReviewData.severity}`}>
                        {selectedReviewData.severity}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">{selectedReviewData.createdAt}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Branch:</span>
                      <span className="detail-value">{selectedReviewData.branch}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h5 className="section-title">Code Changes</h5>
                  <div className="code-preview">
                    <div className="code-header">
                      <div className="code-title">Changes ({selectedReviewData.changes})</div>
                      <button className="btn-secondary btn-sm">View Diff</button>
                    </div>
                    <div className="code-content">
                      <pre className="code-snippet">
                        {`// Sample code changes
function authenticateUser(credentials) {
  // Old implementation
  // return auth.verify(credentials);
  
  // New implementation
  return auth.verifyWith2FA(credentials);
}`}
                      </pre>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h5 className="section-title">Review Actions</h5>
                  <div className="action-buttons">
                    {selectedReviewData.status === 'pending' && (
                      <>
                        <button className="btn-primary" onClick={handleApprove}>
                          Approve
                        </button>
                        <button className="btn-secondary" onClick={handleReject}>
                          Reject
                        </button>
                        <button className="btn-secondary" onClick={handleRequestChanges}>
                          Request Changes
                        </button>
                      </>
                    )}
                    {selectedReviewData.status === 'approved' && (
                      <div className="status-message approved">
                        ✅ This review has been approved
                      </div>
                    )}
                    {selectedReviewData.status === 'rejected' && (
                      <div className="status-message rejected">
                        ❌ This review has been rejected
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h5 className="section-title">Comments & Suggestions</h5>
                  <div className="comments-section">
                    <div className="comments-list">
                      <div className="comment">
                        <div className="comment-header">
                          <div className="comment-author">Sam Wilson</div>
                          <div className="comment-time">1 hour ago</div>
                        </div>
                        <div className="comment-text">
                          Good refactor! Consider adding more error handling for edge cases.
                        </div>
                      </div>
                      <div className="comment">
                        <div className="comment-header">
                          <div className="comment-author">Alex Johnson</div>
                          <div className="comment-time">30 minutes ago</div>
                        </div>
                        <div className="comment-text">
                          Added error handling as suggested. Also updated documentation.
                        </div>
                      </div>
                    </div>
                    
                    <div className="comment-input">
                      <textarea
                        className="comment-textarea"
                        placeholder="Add your review comments..."
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        rows={3}
                      />
                      <div className="comment-actions">
                        <button className="btn-secondary btn-sm" onClick={handleAddComment}>
                          Add Comment
                        </button>
                      </div>
                    </div>
                    
                    <div className="suggestions-input">
                      <textarea
                        className="suggestions-textarea"
                        placeholder="Suggest specific changes..."
                        value={suggestedChanges}
                        onChange={(e) => setSuggestedChanges(e.target.value)}
                        rows={2}
                      />
                      <div className="suggestions-actions">
                        <button className="btn-secondary btn-sm" onClick={handleRequestChanges}>
                          Suggest Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="review-footer">
        <div className="footer-stats">
          <div className="stat-card">
            <div className="stat-value">{reviews.filter(r => r.status === 'pending').length}</div>
            <div className="stat-label">Awaiting Review</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round((reviews.filter(r => r.status !== 'pending').length / reviews.length) * 100)}%</div>
            <div className="stat-label">Review Completion</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">24h</div>
            <div className="stat-label">Avg Review Time</div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-primary">
            Export Review Report
          </button>
          <button className="btn-secondary">
            Generate Metrics
          </button>
          <button className="btn-secondary">
            Schedule Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeReview;