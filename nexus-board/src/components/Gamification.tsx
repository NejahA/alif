import { useState } from 'react';
import type { Task } from '../types';

interface GamificationProps {
  tasks: Task[];
  userPoints: number;
  onPointsUpdate: (points: number) => void;
}

const Gamification = ({ tasks, userPoints, onPointsUpdate }: GamificationProps) => {
  const [achievements, setAchievements] = useState([
    { id: 'first_task', name: 'First Task', description: 'Complete your first task', earned: true, points: 10 },
    { id: 'streak_3', name: '3-Day Streak', description: 'Complete tasks for 3 consecutive days', earned: false, points: 25 },
    { id: 'speed_runner', name: 'Speed Runner', description: 'Complete a task in under 1 hour', earned: false, points: 50 },
    { id: 'team_player', name: 'Team Player', description: 'Assign 5 tasks to team members', earned: true, points: 30 },
    { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 10 tasks with no revisions', earned: false, points: 75 },
    { id: 'early_bird', name: 'Early Bird', description: 'Complete 5 tasks before their due date', earned: false, points: 40 },
    { id: 'mentor', name: 'Mentor', description: 'Help 3 team members complete tasks', earned: false, points: 60 },
    { id: 'marathon', name: 'Marathon', description: 'Complete 50 total tasks', earned: false, points: 100 },
  ]);
  
  const [leaderboard, setLeaderboard] = useState([
    { id: 'user-1', name: 'Alex Johnson', points: 1250, rank: 1, avatar: '👑' },
    { id: 'user-2', name: 'Sam Wilson', points: 980, rank: 2, avatar: '🥈' },
    { id: 'user-3', name: 'Jordan Lee', points: 750, rank: 3, avatar: '🥉' },
    { id: 'user-4', name: 'Taylor Swift', points: 620, rank: 4, avatar: '⭐' },
    { id: 'user-5', name: 'Casey Kim', points: 540, rank: 5, avatar: '🌟' },
  ]);
  
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard' | 'rewards'>('achievements');
  
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const streakDays = 2; // This would come from backend
  const earlyCompletions = tasks.filter(t => t.dueDate && t.updatedAt < t.dueDate).length;
  
  const checkAchievements = () => {
    const newAchievements = [...achievements];
    let pointsEarned = 0;
    
    // Check for new achievements
    if (completedTasks >= 1 && !newAchievements[0].earned) {
      newAchievements[0].earned = true;
      pointsEarned += 10;
    }
    
    if (completedTasks >= 50 && !newAchievements[7].earned) {
      newAchievements[7].earned = true;
      pointsEarned += 100;
    }
    
    if (earlyCompletions >= 5 && !newAchievements[5].earned) {
      newAchievements[5].earned = true;
      pointsEarned += 40;
    }
    
    if (pointsEarned > 0) {
      setAchievements(newAchievements);
      onPointsUpdate(userPoints + pointsEarned);
      alert(`🎉 You earned ${pointsEarned} points from new achievements!`);
    }
  };
  
  const claimDailyReward = () => {
    const reward = 25;
    onPointsUpdate(userPoints + reward);
    alert(`🎁 Daily reward claimed! +${reward} points`);
  };
  
  const redeemPoints = (rewardId: string, cost: number) => {
    if (userPoints >= cost) {
      onPointsUpdate(userPoints - cost);
      alert(`🎁 Reward redeemed! -${cost} points`);
    } else {
      alert('Not enough points to redeem this reward');
    }
  };
  
  return (
    <div className="gamification">
      <div className="gamification-header">
        <h3 className="gamification-title">Gamification</h3>
        <div className="user-points">
          <div className="points-display">
            <span className="points-label">Your Points:</span>
            <span className="points-value">{userPoints}</span>
          </div>
          <button className="btn-primary" onClick={claimDailyReward}>
            Claim Daily Reward
          </button>
        </div>
      </div>
      
      <div className="gamification-tabs">
        <button 
          className={`gamification-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span className="tab-icon">🏆</span>
          Achievements
        </button>
        <button 
          className={`gamification-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <span className="tab-icon">📊</span>
          Leaderboard
        </button>
        <button 
          className={`gamification-tab ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          <span className="tab-icon">🎁</span>
          Rewards
        </button>
      </div>
      
      <div className="gamification-content">
        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <div className="section-header">
              <h4 className="section-title">Your Achievements</h4>
              <button className="btn-secondary btn-sm" onClick={checkAchievements}>
                Check for New
              </button>
            </div>
            
            <div className="achievements-grid">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    {achievement.earned ? '🏆' : '🔒'}
                  </div>
                  <div className="achievement-content">
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-description">{achievement.description}</div>
                    <div className="achievement-points">+{achievement.points} points</div>
                  </div>
                  <div className="achievement-status">
                    {achievement.earned ? (
                      <span className="status-earned">Earned</span>
                    ) : (
                      <span className="status-locked">Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="achievement-stats">
              <div className="stat-card">
                <div className="stat-value">{achievements.filter(a => a.earned).length}</div>
                <div className="stat-label">Achievements Earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{achievements.reduce((sum, a) => sum + (a.earned ? a.points : 0), 0)}</div>
                <div className="stat-label">Total Points Earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{achievements.length - achievements.filter(a => a.earned).length}</div>
                <div className="stat-label">Remaining</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <h4 className="section-title">Team Leaderboard</h4>
              <div className="leaderboard-time">This Week</div>
            </div>
            
            <div className="leaderboard-list">
              {leaderboard.map(player => (
                <div 
                  key={player.id}
                  className={`leaderboard-player ${player.rank <= 3 ? 'top-three' : ''}`}
                >
                  <div className="player-rank">
                    <span className="rank-number">{player.rank}</span>
                    <span className="rank-avatar">{player.avatar}</span>
                  </div>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-points">{player.points} points</div>
                  </div>
                  <div className="player-badges">
                    {player.rank === 1 && <span className="badge gold">👑 Champion</span>}
                    {player.rank === 2 && <span className="badge silver">🥈 Runner-up</span>}
                    {player.rank === 3 && <span className="badge bronze">🥉 Third</span>}
                    {player.rank > 3 && player.points > 500 && <span className="badge">⭐ Star Player</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="leaderboard-stats">
              <div className="stat-card">
                <div className="stat-value">{leaderboard[0].points}</div>
                <div className="stat-label">Top Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{Math.round(leaderboard.reduce((sum, p) => sum + p.points, 0) / leaderboard.length)}</div>
                <div className="stat-label">Average Points</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{leaderboard.length}</div>
                <div className="stat-label">Active Players</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'rewards' && (
          <div className="rewards-section">
            <div className="section-header">
              <h4 className="section-title">Reward Shop</h4>
              <div className="user-balance">Balance: {userPoints} points</div>
            </div>
            
            <div className="rewards-grid">
              <div className="reward-card">
                <div className="reward-icon">☕</div>
                <div className="reward-content">
                  <div className="reward-name">Coffee Break</div>
                  <div className="reward-description">15-minute break extension</div>
                  <div className="reward-cost">50 points</div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => redeemPoints('coffee', 50)}
                  disabled={userPoints < 50}
                >
                  Redeem
                </button>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon">🎨</div>
                <div className="reward-content">
                  <div className="reward-name">Custom Theme</div>
                  <div className="reward-description">Unlock a custom app theme</div>
                  <div className="reward-cost">100 points</div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => redeemPoints('theme', 100)}
                  disabled={userPoints < 100}
                >
                  Redeem
                </button>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon">🚀</div>
                <div className="reward-content">
                  <div className="reward-name">Priority Support</div>
                  <div className="reward-description">Jump to front of support queue</div>
                  <div className="reward-cost">150 points</div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => redeemPoints('support', 150)}
                  disabled={userPoints < 150}
                >
                  Redeem
                </button>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon">📊</div>
                <div className="reward-content">
                  <div className="reward-name">Advanced Analytics</div>
                  <div className="reward-description">Unlock premium analytics for 1 month</div>
                  <div className="reward-cost">200 points</div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => redeemPoints('analytics', 200)}
                  disabled={userPoints < 200}
                >
                  Redeem
                </button>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon">🤖</div>
                <div className="reward-content">
                  <div className="reward-name">AI Assistant Plus</div>
                  <div className="reward-description">Enhanced AI suggestions for 1 week</div>
                  <div className="reward-cost">75 points</div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => redeemPoints('ai', 75)}
                  disabled={userPoints < 75}
                >
                  Redeem
                </button>
              </div>
              
              <div className="reward-card">
                <div className="reward-icon">🎉</div>
                <div className="reward-content">
                  <div className="reward-name">Team Celebration</div>
                  <div className="reward-description">Virtual celebration for the team</div>
                  <div className="reward-cost">300 points</div>
                </div>
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => redeemPoints('celebration', 300)}
                  disabled={userPoints < 300}
                >
                  Redeem
                </button>
              </div>
            </div>
            
            <div className="rewards-info">
              <div className="info-card">
                <h5 className="info-title">How to Earn Points</h5>
                <ul className="points-list">
                  <li>Complete tasks: +10 points each</li>
                  <li>Complete tasks early: +5 bonus points</li>
                  <li>Help team members: +15 points</li>
                  <li>Maintain streaks: +25 points per day</li>
                  <li>Achieve milestones: +50-100 points</li>
                </ul>
              </div>
              
              <div className="info-card">
                <h5 className="info-title">Point Reset</h5>
                <p className="info-text">
                  Points reset at the end of each quarter. Top performers get special badges
                  and recognition in the Hall of Fame.
                </p>
                <div className="reset-timer">
                  <span className="timer-label">Next reset in:</span>
                  <span className="timer-value">45 days</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;