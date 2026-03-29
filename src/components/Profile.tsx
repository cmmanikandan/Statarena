import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { achievements, missions } from '../constants';
import { cn } from '../lib/utils';
import { Settings, Share2, Edit2, Trophy, Flame, Zap, Target, ShieldCheck, Check, LogOut, Award, Star, TrendingUp, Gamepad2 } from 'lucide-react';
import { db, auth, storage } from '../firebase';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const iconMap: any = {
  Trophy: Trophy,
  Flame: Flame,
  Zap: Zap,
  Target: Target,
  Award: Award,
};

interface ProfileProps {
  onThemeChange: (color: string) => void;
  currentTheme: string;
  onLogout: () => void;
}

export default function Profile({ onThemeChange, currentTheme, onLogout }: ProfileProps) {
  const [user, setUser] = useState<any>({
    username: 'Loading...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=loading',
    rank: 'Bronze',
    xp: 0,
    level: 1,
    stats: { matchesPlayed: 0, winRate: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !auth.currentUser) return;
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { avatar: url });
    setUploading(false);
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUser(doc.data());
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });
    return () => unsubscribe();
  }, []);

  const themeColors = [
    { name: 'Neon Blue', color: '#00E5FF' },
    { name: 'Purple', color: '#7B61FF' },
    { name: 'Green', color: '#00FF9C' },
    { name: 'Red', color: '#FF4D4D' },
  ];

  const xpToNextLevel = 500;
  const currentXP = user.xp || 0;
  const levelProgress = (currentXP % xpToNextLevel) / xpToNextLevel * 100;
  const currentLevel = Math.floor(currentXP / xpToNextLevel) + 1;

  const gameStats = user.gameStats || {
    tictactoe: { wins: 0, total: 0 },
    quiz: { wins: 0, total: 0 },
    reaction: { wins: 0, total: 0 },
    whack: { wins: 0, total: 0 },
    rps: { wins: 0, total: 0 },
    memory: { wins: 0, total: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-10"
    >
      {/* Profile Header */}
      <div className="relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background z-0" />
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          <button className="p-2 rounded-full glass"><Share2 className="w-5 h-5" /></button>
          <button className="p-2 rounded-full glass"><Settings className="w-5 h-5" /></button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-background p-1 bg-background neon-glow-blue">
              <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid || 'loading'}`} alt="" className="w-full h-full rounded-full object-cover" />
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-2 border-background cursor-pointer">
              <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
              {uploading ? <div className="w-3 h-3 border-2 border-background border-t-transparent animate-spin rounded-full" /> : <Edit2 className="w-3 h-3 text-background" />}
            </label>
          </div>
          
          <div>
            <h1 className="text-2xl font-display font-bold">{user.username || 'Player'}</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-white/60 uppercase tracking-widest">Verified Pro Player</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Rank & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
            <div className="text-[10px] text-white/40 uppercase font-mono">Current Rank</div>
            <div className="text-xl font-heading font-bold text-primary neon-text-blue">{user.rank || 'Bronze'}</div>
            <div className="text-[10px] text-white/30">Top 5% Worldwide</div>
          </div>
          <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2 relative overflow-hidden">
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl" />
            <div className="text-[10px] text-white/40 uppercase font-mono">Player Level</div>
            <div className="text-xl font-heading font-bold text-secondary">LVL {currentLevel}</div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-1">
              <div className="h-full bg-secondary rounded-full transition-all duration-500 shadow-[0_0_10px_#7B61FF]" style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="text-[8px] text-white/30 uppercase font-mono">{currentXP % xpToNextLevel} / {xpToNextLevel} XP</div>
          </div>
          <div className="col-span-2 glass rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase font-mono">Total Matches Played</div>
                <div className="text-lg font-bold text-white">
                  {user.stats?.matchesPlayed || 0}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/40 uppercase font-mono">Total XP</div>
              <div className="text-lg font-bold text-accent">{currentXP}</div>
            </div>
          </div>
        </div>

        {/* Game Stats Summary */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-white/60">
            <Award className="w-4 h-4 text-primary" /> Game Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Tic Tac Toe', stats: gameStats.tictactoe, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Brain Quiz', stats: gameStats.quiz, color: 'text-secondary', bg: 'bg-secondary/10' },
              { label: 'Reaction Tap', stats: gameStats.reaction, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Whack-a-Mole', stats: gameStats.whack, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'RPS', stats: gameStats.rps, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Memory Match', stats: gameStats.memory, color: 'text-pink-400', bg: 'bg-pink-400/10' },
            ].map((game, i) => {
              const wins = game.stats?.wins || 0;
              const total = game.stats?.total || 0;
              const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
              
              return (
                <div key={i} className="glass rounded-xl p-3 space-y-2 relative overflow-hidden">
                  <div className={cn("absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20", game.bg)} />
                  <div className="text-[10px] text-white/60 uppercase font-mono font-bold">{game.label}</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className={cn("text-xl font-bold font-mono", game.color)}>{wins}</div>
                      <div className="text-[8px] text-white/40 uppercase font-mono">Wins</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">{winRate}%</div>
                      <div className="text-[8px] text-white/40 uppercase font-mono">Win Rate</div>
                    </div>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                    <div className={cn("h-full rounded-full", game.bg.replace('/10', ''))} style={{ width: `${winRate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Customization */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-heading font-bold text-sm">Theme Customization</h3>
          <div className="flex gap-3">
            {themeColors.map((t) => (
              <button 
                key={t.color}
                onClick={() => onThemeChange(t.color)}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                  currentTheme === t.color ? "border-white scale-110 shadow-lg" : "border-white/10"
                )}
                style={{ backgroundColor: t.color }}
              >
                {currentTheme === t.color && <Check className="w-5 h-5 text-background" />}
              </button>
            ))}
            <div className="flex-1" />
            <button className="text-[10px] font-bold text-white/40 uppercase">Unlock More</button>
          </div>
        </div>

        {/* Missions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold flex items-center gap-2">
              Daily Missions <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">Active</span>
            </h3>
            <span className="text-[10px] text-primary font-mono">Resets in 12h</span>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Win 3 Matches', progress: 1, total: 3, reward: '100 XP', icon: Trophy },
              { title: 'Play 5 Games', progress: 4, total: 5, reward: '50 XP', icon: Gamepad2 },
              { title: 'Reach Level 5', progress: 2, total: 5, reward: '200 XP', icon: Award },
            ].map((mission, i) => (
              <div key={i} className="glass rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <mission.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{mission.title}</div>
                      <div className="text-[10px] text-accent font-mono">Reward: {mission.reward}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-white/40">{mission.progress}/{mission.total}</div>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_8px_#00E5FF]" 
                    style={{ width: `${(mission.progress / mission.total) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const Icon = iconMap[ach.icon] || Trophy;
              return (
                <div 
                  key={ach.id} 
                  className={cn(
                    "glass rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all duration-300",
                    ach.unlocked ? "opacity-100" : "opacity-40 grayscale"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-1",
                    ach.unlocked ? "bg-primary/10 text-primary" : "bg-white/5 text-white/20"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold">{ach.title}</div>
                  <div className="text-[8px] text-white/40 leading-tight">{ach.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout}
          className="w-full py-4 rounded-2xl glass border border-danger/20 text-danger font-bold flex items-center justify-center gap-2 hover:bg-danger/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout Session
        </button>
      </div>
    </motion.div>
  );
}
