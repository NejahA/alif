import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import { sound } from '../utils/audio';

export default function Dashboard() {
  const { user, token, logout, refreshUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isTraveling, setIsTraveling] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFusing, setIsFusing] = useState(false);
  const [isStriking, setIsStriking] = useState(false);
  const [isBankAction, setIsBankAction] = useState(false);
  const [isOverclocking, setIsOverclocking] = useState(false);
  const [isEquipping, setIsEquipping] = useState(false);
  const [isBuyingHarvester, setIsBuyingHarvester] = useState(false);
  const [isChoosingFaction, setIsChoosingFaction] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'cyberpunk' | 'golden' | 'steampunk'>('cyberpunk');
  const [isMuted, setIsMuted] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [targetEraForTravel, setTargetEraForTravel] = useState('');
  const [codexData, setCodexData] = useState<any>(null);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [bankAmount, setBankAmount] = useState('50');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);

  const getTravelerTitle = () => {
    if (!user) return '🥉 Lost Soul';
    const toasts = user.toastsCollected ?? user.toasts ?? 0;
    const eras = (user.timePeriodsVisited || []).length;
    const items = (user.inventory || []).length;

    if (toasts >= 500) return '👑 Grand Reaper';
    if (eras >= 3) return '🥇 Ethereal Walker';
    if (items >= 5) return '🥈 Spirit Collector';
    return '🥉 Lost Soul';
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/game/leaderboard');
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    }
  };

  const fetchQuests = async () => {
    try {
      const response = await api.get('/game/quests');
      setQuests(response.data.quests);
    } catch (error) {
      console.error('Failed to fetch quests');
    }
  };

  const fetchCodex = async () => {
    try {
      const response = await api.get('/game/codex');
      setCodexData(response.data);
    } catch (error) {
      console.error('Failed to fetch codex');
    }
  };

  const fetchActivityFeed = async () => {
    try {
      const response = await api.get('/game/activity-feed');
      setActivityFeed(response.data.feed);
    } catch (error) {
      console.error('Failed to fetch activity feed');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchLeaderboard();
      fetchQuests();
      fetchCodex();
      fetchActivityFeed();
    }
  }, [token, navigate]);

  // Automated Toast Harvester Idle Interval (every 10s)
  useEffect(() => {
    if (user?.hasHarvester) {
      const interval = setInterval(async () => {
        try {
          const response = await api.post('/game/idle-claim');
          updateUser(response.data.user);
        } catch (error) {
          // Silent catch for background harvest
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.hasHarvester]);

  if (!user) return <div className="p-8 text-white text-center">Loading...</div>;

  const toggleAudio = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
    toast(sound.isMuted ? '🔇 Audio Muted' : '🔊 Audio Enabled');
  };

  const startTravelFlow = (period: string) => {
    setTargetEraForTravel(period);
    setShowMinigame(true);
  };

  const handleTimeTravel = async (period: string) => {
    setIsTraveling(true);
    sound.playWhoosh();
    try {
      const response = await api.post('/game/time-travel', { targetPeriod: period });
      toast.success(response.data.message);
      updateUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Reincarnation gateway failed');
    } finally {
      setIsTraveling(false);
    }
  };

  const handleDiscover = async () => {
    setIsDiscovering(true);
    sound.playBeep();
    try {
      const response = await api.post('/game/discover');
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Séance failed');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleRecharge = async () => {
    setIsRecharging(true);
    try {
      const response = await api.post('/game/recharge');
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Recharge failed');
    } finally {
      setIsRecharging(false);
    }
  };

  const handleEquipGear = async (slot: string, item: string, rarity: string, action: string = 'equip') => {
    setIsEquipping(true);
    try {
      const response = await api.post('/game/equip-gear', { slot, item, rarity, action });
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Equip failed');
    } finally {
      setIsEquipping(false);
    }
  };

  const handleUpgrade = async (upgradeId: string) => {
    setIsUpgrading(true);
    try {
      const response = await api.post('/game/upgrade', { upgradeId });
      toast.success(response.data.message);
      updateUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upgrade failed');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleSpin = async () => {
    setIsSpinning(true);
    try {
      const response = await api.post('/game/quantum-spin');
      toast.success(`🎉 ${response.data.message}`);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Wheel of fate failed');
    } finally {
      setIsSpinning(false);
    }
  };

  const handleFuse = async (item: string, rarity: string) => {
    setIsFusing(true);
    try {
      const response = await api.post('/game/fuse', { item, rarity });
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Fusion failed');
    } finally {
      setIsFusing(false);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      const response = await api.post('/game/claim-quest', { questId });
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
      fetchQuests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Claim failed');
    }
  };

  const handleBankDeposit = async () => {
    setIsBankAction(true);
    try {
      const response = await api.post('/game/bank/deposit', { amount: bankAmount });
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Deposit failed');
    } finally {
      setIsBankAction(false);
    }
  };

  const handleBankWithdraw = async () => {
    setIsBankAction(true);
    try {
      const response = await api.post('/game/bank/withdraw', { amount: bankAmount });
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsBankAction(false);
    }
  };

  const handleClaimInterest = async () => {
    setIsBankAction(true);
    try {
      const response = await api.post('/game/bank/claim-interest');
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Claim karma interest failed');
    } finally {
      setIsBankAction(false);
    }
  };

  const handleBossStrike = async () => {
    setIsStriking(true);
    sound.playThud();
    try {
      const response = await api.post('/game/boss-strike');
      toast.success(response.data.message);
      updateUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Boss strike failed');
    } finally {
      setIsStriking(false);
    }
  };

  const isOverclockActive = user?.overclockUntil && new Date() < new Date(user.overclockUntil);

  const handleOverclock = async () => {
    setIsOverclocking(true);
    try {
      const response = await api.post('/game/overclock');
      toast.success(response.data.message);
      updateUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Overclock failed');
    } finally {
      setIsOverclocking(false);
    }
  };

  const handleChooseFaction = async (faction: string) => {
    setIsChoosingFaction(true);
    try {
      const response = await api.post('/game/choose-faction', { faction });
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Affiliation selection failed');
    } finally {
      setIsChoosingFaction(false);
    }
  };

  const handleBuyHarvester = async () => {
    setIsBuyingHarvester(true);
    try {
      const response = await api.post('/game/buy-harvester');
      toast.success(response.data.message);
      updateUser(response.data.user);
      sound.playDing();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Harvester purchase failed');
    } finally {
      setIsBuyingHarvester(false);
    }
  };

  const timePeriods = ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'];

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary': return 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-yellow-400/10';
      case 'Epic': return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-purple-500/10';
      case 'Rare': return 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)] bg-blue-400/10';
      default: return 'border-gray-700 bg-gray-800/80';
    }
  };

  const hasCapacitor = user?.upgrades?.some(u => u.name === 'Capacitor Expansion');
  const hasScanner = user?.upgrades?.some(u => u.name === 'Efficient Scanner');
  const maxEnergy = hasCapacitor ? 1500 : 1000;
  const scanCost = hasScanner ? 10 : 15;

  const themeClass =
    currentTheme === 'golden' ? 'from-amber-950 via-black to-yellow-950 text-amber-50' :
      currentTheme === 'steampunk' ? 'from-stone-900 via-stone-950 to-amber-950 text-amber-100' :
        'from-gray-900 via-black to-gray-900 text-white';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeClass} p-8 relative transition-colors duration-700`}>
      {isTraveling && <Loader fullScreen message="Traveling through time..." />}
      {isDiscovering && <Loader fullScreen message="Scanning local timeline..." />}
      {isRecharging && <Loader fullScreen message="Recharging energy..." />}
      {isSpinning && <Loader fullScreen message="Spinning Quantum Wheel..." />}
      {isFusing && <Loader fullScreen message="Fusing toasters in Quantum Lab..." />}
      {isStriking && <Loader fullScreen message="Striking Time Rift Boss..." />}
      {isBankAction && <Loader fullScreen message="Processing Vault transaction..." />}
      {isOverclocking && <Loader fullScreen message="Activating Quantum Overclock..." />}
      {isBuyingHarvester && <Loader fullScreen message="Unlocking Automated Toast Harvester..." />}
      {isChoosingFaction && <Loader fullScreen message="Pledging Faction Alliance..." />}

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">
              Traveler Dashboard
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              Welcome, {user.username} ({user.role})
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-full">
                {getTravelerTitle()}
              </span>
              {user.faction && (
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold rounded-full">
                  🚩 {user.faction}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none"
            >
              <option value="cyberpunk">🌌 Cyberpunk Dark</option>
              <option value="golden">🌟 Golden Chrono</option>
              <option value="steampunk">⚙️ Steampunk Bronze</option>
            </select>

            <button
              onClick={toggleAudio}
              className="px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white font-bold rounded-xl transition-all text-xs"
            >
              {isMuted ? '🔇 Sound OFF' : '🔊 Sound ON'}
            </button>
            <button
              onClick={() => setShowCodex(true)}
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] text-xs"
            >
              Museum Codex 📖
            </button>
            <button
              onClick={logout}
              className="px-5 py-2 glass-effect text-red-400 hover:text-red-300 hover:bg-white/10 rounded-xl transition-all text-xs"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Active Gear Loadout */}
        <div className="mb-8 glass-effect rounded-2xl p-5 border border-indigo-500/30">
          <h2 className="text-lg font-semibold mb-3 text-indigo-300 flex items-center gap-2">
            <span>Active Soul Resonance 🛡️</span>
            <span className="text-xs text-gray-400 font-normal">(Equipped spirits grant active perks)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-xs uppercase font-bold text-indigo-400">Primary Link</div>
                <div className="font-semibold text-sm text-gray-200 mt-1">
                  {user.equippedGear?.find(g => g.slot === 'primary')?.item || 'No Spirit Linked'}
                </div>
              </div>
              {user.equippedGear?.find(g => g.slot === 'primary') && (
                <button
                  onClick={() => handleEquipGear('primary', '', '', 'unequip')}
                  disabled={isEquipping}
                  className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded hover:bg-red-500/30"
                >
                  Unequip
                </button>
              )}
            </div>
            <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
              <div>
                <div className="text-xs uppercase font-bold text-indigo-400">Secondary Link</div>
                <div className="font-semibold text-sm text-gray-200 mt-1">
                  {user.equippedGear?.find(g => g.slot === 'secondary')?.item || 'No Spirit Linked'}
                </div>
              </div>
              {user.equippedGear?.find(g => g.slot === 'secondary') && (
                <button
                  onClick={() => handleEquipGear('secondary', '', '', 'unequip')}
                  disabled={isEquipping}
                  className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded hover:bg-red-500/30"
                >
                  Unequip
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Panel */}
          <div className="glass-effect rounded-2xl p-6 h-fit space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Your Stats</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Spiritual Energy</span>
                  <span className="font-mono text-amber-400 text-xl">{user.energy ?? 100} ✨</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Souls Harvested</span>
                  <span className="font-mono text-orange-400 text-xl">{user.toastsCollected ?? user.toasts ?? 0} 👻</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Karma Vault</span>
                  <span className="font-mono text-emerald-400 text-xl">{user.bankBalance ?? 0} ⚖️</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6">
                <button
                  onClick={handleRecharge}
                  disabled={isRecharging || (user.toastsCollected ?? user.toasts ?? 0) < 5 || (user.energy ?? 0) >= maxEnergy}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Consume 5 Souls (+25 ✨)
                </button>

                <button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Wheel of Fate 🎡
                </button>

                <button
                  onClick={handleOverclock}
                  disabled={isOverclocking || isOverclockActive || (user.toastsCollected ?? 0) < 50}
                  className={`w-full py-3 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${isOverclockActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    }`}
                >
                  {isOverclockActive ? '✨ Divine Burst Active (15m)' : 'Divine Burst (50 👻) ✨'}
                </button>

                <button
                  onClick={handleBuyHarvester}
                  disabled={isBuyingHarvester || user.hasHarvester || (user.toastsCollected ?? 0) < 500}
                  className={`w-full py-3 font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${user.hasHarvester
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    }`}
                >
                  {user.hasHarvester ? '⚙️ Relic Active (+1 👻/10s)' : 'Unlock Reaper Relic (500 👻) ⚙️'}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Soul Affiliation 🚩</h3>
              <div className="space-y-2">
                {['Angelic Guard', 'Grim Reapers', 'Underworld Smugglers'].map(fac => (
                  <button
                    key={fac}
                    onClick={() => handleChooseFaction(fac)}
                    disabled={isChoosingFaction || user.faction === fac}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex justify-between items-center ${user.faction === fac
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800'
                      }`}
                  >
                    <span>{fac === 'Angelic Guard' ? '🛡️ Angelic Guard (+20% Demon DMG)' : fac === 'Grim Reapers' ? '🔍 Grim Reapers (+15% Séance Chance)' : '💰 Underworld Smugglers (+15% Karma Rate)'}</span>
                    {user.faction === fac && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded">Joined</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Live Multiverse Feed 🌍</h3>
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3 space-y-2 max-h-40 overflow-y-auto">
                {activityFeed.map((item) => (
                  <div key={item.id} className="text-xs text-gray-300 border-b border-gray-700/50 pb-1.5 last:border-0">
                    <span className="text-amber-400 font-mono text-[10px] mr-2">{item.time}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Daily Quests 📜</h3>
              {quests && quests.length > 0 ? (
                <ul className="space-y-3">
                  {quests.map((q) => (
                    <li key={q.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm text-gray-200">{q.title}</div>
                        <div className="text-xs text-gray-400">{q.description}</div>
                        <div className="text-[10px] text-amber-400 mt-1">Reward: +{q.rewardAmount} {q.rewardType === 'toasts' ? '🍞' : '⚡'}</div>
                      </div>
                      {q.claimed ? (
                        <span className="text-xs text-gray-500 font-bold">Claimed</span>
                      ) : q.completed ? (
                        <button
                          onClick={() => handleClaimQuest(q.id)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all"
                        >
                          Claim
                        </button>
                      ) : (
                        <span className="text-xs text-gray-600 italic">Locked</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">Loading quests...</p>
              )}
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Achievements</h3>
              {user.achievements && user.achievements.length > 0 ? (
                <ul className="space-y-3">
                  {user.achievements.map((ach, idx) => (
                    <li key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="font-medium text-amber-300 flex justify-between">
                        <span>{ach.name}</span>
                        <span className="text-amber-500 text-xs">+{ach.points} pts</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{ach.description}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm italic">No achievements yet. Keep traveling!</p>
              )}
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Top Travelers</h3>
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                {leaderboard.map((luser, idx) => (
                  <div key={luser._id} className="flex justify-between items-center p-3 border-b border-gray-700/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-xs w-4">{idx + 1}.</span>
                      <span className="font-medium text-sm text-gray-200">{luser.username}</span>
                    </div>
                    <span className="text-orange-400 font-mono text-sm">{luser.toastsCollected} 🍞</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Reincarnation Gateway</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {timePeriods.map(period => (
                  <button
                    key={period}
                    onClick={() => startTravelFlow(period)}
                    disabled={isTraveling || isDiscovering}
                    className="relative group p-4 bg-gray-800 border border-gray-600 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed capitalize text-center overflow-hidden hover:scale-[1.02] active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 font-semibold group-hover:text-amber-400 transition-colors">{period}</span>
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-400 text-center">
                Select a destination era. Travel costs 25 energy.
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2 relative z-10">Local Area Scanner</h2>

              <div className="text-center py-8 relative z-10">
                <button
                  onClick={handleDiscover}
                  disabled={isDiscovering || isTraveling || (user.energy ?? 0) < scanCost}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                >
                  Hold Séance ({scanCost} Energy)
                </button>
                <p className="text-sm text-gray-400 mt-4">
                  Discover ancient artifacts and unique souls nearby.
                </p>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Soul Core Inventory</h2>
              {user.inventory && user.inventory.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user.inventory.map((inv, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${getRarityColor(inv.rarity)}`}>
                      <div className="text-4xl mb-2">👻</div>
                      <div className="font-medium text-sm text-gray-200">{inv.item}</div>
                      <div className="text-xs text-amber-500 mt-1">x{inv.quantity}</div>
                      {inv.rarity && <div className={`text-[10px] mt-1 uppercase font-bold tracking-wider ${inv.rarity === 'Legendary' ? 'text-yellow-400' :
                        inv.rarity === 'Epic' ? 'text-purple-400' :
                          inv.rarity === 'Rare' ? 'text-blue-400' : 'text-gray-400'
                        }`}>{inv.rarity}</div>}
                      <div className="text-[10px] text-gray-500 mt-2 capitalize">Found in: {inv.obtainedFrom}</div>

                      <div className="flex gap-1.5 w-full mt-3">
                        <button
                          onClick={() => handleEquipGear('primary', inv.item, inv.rarity || 'Common')}
                          disabled={isEquipping}
                          className="w-1/2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded transition-all"
                        >
                          Equip P
                        </button>
                        <button
                          onClick={() => handleEquipGear('secondary', inv.item, inv.rarity || 'Common')}
                          disabled={isEquipping}
                          className="w-1/2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded transition-all"
                        >
                          Equip S
                        </button>
                      </div>
                      {inv.quantity >= 3 && inv.rarity !== 'Legendary' && (
                        <button
                          onClick={() => handleFuse(inv.item, inv.rarity || 'Common')}
                          disabled={isFusing}
                          className="mt-3 w-full py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)] transform hover:scale-[1.02] active:scale-95"
                        >
                          Fuse 3x 🧪
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 italic">
                  Your phylactery is empty. Hold a Séance to collect souls!
                </div>
              )}
            </div>

            <div className="glass-effect rounded-2xl p-6 relative overflow-hidden">
              <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Underworld Upgrades</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-amber-300">Capacitor Expansion</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Increases maximum energy from 1000 to 1500.</p>
                  </div>
                  {hasCapacitor ? (
                    <div className="text-center py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">Purchased</div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('capacitor')}
                      disabled={isUpgrading || (user.toastsCollected ?? 0) < 200}
                      className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-500 hover:to-red-500 disabled:opacity-50 transition-all"
                    >
                      Buy (200 👻)
                    </button>
                  )}
                </div>

                <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-cyan-300">Efficient Scanner</h3>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Reduces scan cost from 15 to 10 Energy.</p>
                  </div>
                  {hasScanner ? (
                    <div className="text-center py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">Purchased</div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('scanner')}
                      disabled={isUpgrading || (user.toastsCollected ?? 0) < 300}
                      className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-lg hover:from-orange-500 hover:to-red-500 disabled:opacity-50 transition-all"
                    >
                      Buy (300 👻)
                    </button>
                  )}
                </div>

              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 relative overflow-hidden border border-red-500/30">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 text-red-400 flex items-center gap-2">
                <span>Underworld Demon Battle</span>
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded font-normal">Active Event</span>
              </h2>

              <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-red-300">{user.bossName || 'Arch-Demon'} 👾</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Defeat to earn +500 👻 and a Legendary Spirit!</p>
                  </div>
                  <div className="text-right font-mono text-sm">
                    <span className="text-red-400 font-bold">{user.bossHp ?? 1000}</span>
                    <span className="text-gray-500"> / {user.bossMaxHp ?? 1000} HP</span>
                  </div>
                </div>

                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-orange-500 h-full transition-all duration-500"
                    style={{ width: `${Math.max(0, Math.min(100, ((user.bossHp ?? 1000) / (user.bossMaxHp ?? 1000)) * 100))}%` }}
                  ></div>
                </div>

                <button
                  onClick={handleBossStrike}
                  disabled={isStriking || (user.energy ?? 0) < 50}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] disabled:opacity-50 transform hover:scale-[1.01] active:scale-95"
                >
                  Strike Boss (50 ⚡) ⚔️
                </button>
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-6 relative overflow-hidden border border-emerald-500/30">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 text-emerald-400 flex items-center justify-between">
                <span>Quantum Toast Bank 🏦</span>
                <span className="text-xs text-emerald-300 font-mono">10% Daily Interest</span>
              </h2>

              <div className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Vault Balance</span>
                  <span className="font-mono text-emerald-400 font-bold text-lg">{user.bankBalance ?? 0} 🍞</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    value={bankAmount}
                    onChange={(e) => setBankAmount(e.target.value)}
                    placeholder="Amount"
                  />
                  <button
                    onClick={handleBankDeposit}
                    disabled={isBankAction}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={handleBankWithdraw}
                    disabled={isBankAction}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    Withdraw
                  </button>
                </div>

                <button
                  onClick={handleClaimInterest}
                  disabled={isBankAction || !(user.bankBalance && user.bankBalance > 0)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  Claim 10% Daily Interest 💰
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCodex && codexData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto relative">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-cyan-300">Soul Museum Codex 📖</h2>
                <p className="text-xs text-gray-400 mt-1">Collection Progress: {codexData.collectedCount} / {codexData.totalCount} ({codexData.completionPercentage}%)</p>
              </div>
              <button
                onClick={() => setShowCodex(false)}
                className="text-gray-400 hover:text-white text-xl font-bold p-2"
              >
                ✕
              </button>
            </div>

            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${codexData.completionPercentage}%` }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codexData.codex.map((item: any) => (
                <div key={item.id} className={`p-4 rounded-xl border flex gap-4 items-center ${item.collected ? 'bg-gray-800/90 border-cyan-500/50' : 'bg-gray-950/60 border-gray-800 opacity-60'}`}>
                  <div className="text-4xl">{item.collected ? '👻' : '❓'}</div>
                  <div>
                    <h3 className={`font-bold text-sm ${item.collected ? 'text-white' : 'text-gray-500'}`}>
                      {item.collected ? item.name : 'Unknown Artifact'}
                    </h3>
                    <div className="text-[10px] uppercase font-bold text-amber-400 mt-0.5">{item.era} • {item.rarity}</div>
                    <p className="text-xs text-gray-400 mt-1 italic">{item.collected ? item.lore : 'Scan lifelines to discover.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMinigame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-amber-500/50 rounded-2xl max-w-md w-full p-6 text-center space-y-6">
            <h2 className="text-2xl font-bold text-amber-400">Temporal Calibration 🕹️</h2>
            <p className="text-sm text-gray-300">
              Align the portal coordinates to stabilize your jump to the <span className="text-amber-400 font-bold capitalize">{targetEraForTravel}</span> era!
            </p>
            <div className="grid grid-cols-3 gap-3 my-4">
              <button
                onClick={() => {
                  setShowMinigame(false);
                  handleTimeTravel(targetEraForTravel);
                }}
                className="p-4 bg-red-600/30 border border-red-500 rounded-xl hover:bg-red-600/50 transition-all font-bold text-red-300"
              >
                🔴 Alpha Node
              </button>
              <button
                onClick={() => {
                  setShowMinigame(false);
                  handleTimeTravel(targetEraForTravel);
                }}
                className="p-4 bg-blue-600/30 border border-blue-500 rounded-xl hover:bg-blue-600/50 transition-all font-bold text-blue-300"
              >
                🔵 Beta Node
              </button>
              <button
                onClick={() => {
                  setShowMinigame(false);
                  handleTimeTravel(targetEraForTravel);
                }}
                className="p-4 bg-amber-600/30 border border-amber-500 rounded-xl hover:bg-amber-600/50 transition-all font-bold text-amber-300"
              >
                🟡 Gamma Node
              </button>
            </div>
            <button
              onClick={() => setShowMinigame(false)}
              className="text-xs text-gray-500 hover:text-gray-400"
            >
              Cancel Time Travel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
