import { useState } from 'react';
import type { Comment, User } from '../types';

interface TaskCommentsProps {
  taskId: string;
  comments: Comment[];
  currentUser: User;
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const TaskComments = ({ taskId, comments, currentUser, onAddComment, onDeleteComment }: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const taskComments = comments.filter(comment => comment.taskId === taskId);

  return (
    <div className="task-comments">
      <div className="comments-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4 className="comments-title">
          Comments ({taskComments.length})
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 20 20" 
            fill="none"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginLeft: '8px' }}
          >
            <path d="M5 7L10 12L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </h4>
      </div>

      {isExpanded && (
        <>
          <div className="comments-list">
            {taskComments.length === 0 ? (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              taskComments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-avatar">
                        {comment.userId.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-author-info">
                        <span className="author-name">
                          {comment.userId === currentUser.id ? 'You' : `User ${comment.userId.slice(-4)}`}
                        </span>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    {comment.userId === currentUser.id && (
                      <button 
                        className="btn-icon btn-sm"
                        onClick={() => onDeleteComment(comment.id)}
                        aria-label="Delete comment"
                      >
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="comment-form">
            <div className="comment-input-wrapper">
              <div className="comment-avatar current-user">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                rows={2}
              />
            </div>
            <div className="comment-actions">
              <button 
                type="button" 
                className="btn-secondary btn-sm"
                onClick={() => setNewComment('')}
                disabled={!newComment.trim()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary btn-sm"
                disabled={!newComment.trim()}
              >
                Comment
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default TaskComments;