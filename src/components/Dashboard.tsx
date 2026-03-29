import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, Zap, Target, ChevronRight, Award, Gamepad2, Play, Trophy } from 'lucide-react';
import { performanceData } from '../constants';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

interface DashboardProps {
  onPlayGame?: (gameId: string) => void;
}

export default function Dashboard({ onPlayGame }: DashboardProps) {
  const [user, setUser] = useState<any>({
    username: 'Loading...',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=loading',
    rank: 'Bronze',
    xp: 0,
    level: 1,
    stats: { matchesPlayed: 0, winRate: 0 }
  });
  const [loading, setLoading] = useState(true);

  const [activities, setActivities] = useState<any[]>([]);

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

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'matches'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out removed games
      docsData = docsData.filter((m: any) => {
        const gameId = (m.gameId || m.game || '').toLowerCase();
        return !gameId.includes('ludo') && !gameId.includes('snake');
      });

      const docs = docsData.map((data: any) => ({ 
        ...data,
        title: data.result === 'Win' ? 'Match Won' : 'Match Lost',
        desc: `Vs ${data.opponent || 'AI'} (${data.score})`,
        time: data.timestamp?.toDate 
          ? data.timestamp.toDate().toLocaleDateString() 
          : data.timestamp 
            ? new Date(data.timestamp).toLocaleDateString() 
            : 'Just now',
        icon: Target,
        color: data.result === 'Win' ? 'text-primary' : 'text-danger'
      }));
      setActivities(docs);
    });
    return () => unsubscribe();
  }, []);

  const quickGames = [
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: 'XO', color: 'from-primary/20 to-primary/5' },
    { id: 'quiz', name: 'Brain Quiz', icon: '?', color: 'from-secondary/20 to-secondary/5' },
  ];

  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'matches'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'asc'),
      limit(7)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out removed games
      docsData = docsData.filter((m: any) => {
        const gameId = (m.gameId || m.game || '').toLowerCase();
        return !gameId.includes('ludo') && !gameId.includes('snake');
      });

      const docs = docsData.map((data: any) => ({
        day: data.date || 'Match',
        score: data.xpGained || parseInt(data.score?.toString().split('-')[0]) || 0
      }));
      setMatchHistory(docs);
    });
    return () => unsubscribe();
  }, []);

  const xpToNextLevel = 500;
  const currentXP = user.xp || 0;
  const xpProgress = (currentXP % xpToNextLevel) / xpToNextLevel * 100;
  const currentLevel = Math.floor(currentXP / xpToNextLevel) + 1;

  const chartData = matchHistory.length > 0 ? matchHistory : [{ day: 'Today', score: 0 }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6 pb-24"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono text-primary uppercase tracking-widest">Welcome Back</h2>
          <h1 className="text-2xl font-display font-bold">{user.username || 'Player'}</h1>
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5 neon-glow-blue">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid || 'loading'}`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-accent text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-background">
            LVL {currentLevel}
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Current Rank</span>
            <div className="flex items-center gap-2 mt-1">
              <Award className="text-primary w-5 h-5" />
              <span className="text-xl font-heading font-bold text-primary neon-text-blue">{user.rank || 'Bronze'}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Total XP</span>
            <div className="text-xl font-heading font-bold mt-1">{currentXP}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Level Progress</span>
            <span className="text-primary">{Math.round(xpProgress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </div>
      </div>

      {/* Quick Play */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-heading font-bold text-sm">Quick Play</h3>
          <button className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1">
            All Games <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {quickGames.map((game) => (
            <motion.button
              key={game.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPlayGame?.(game.id)}
              className={cn(
                "min-w-[120px] aspect-square rounded-3xl p-4 flex flex-col items-center justify-center gap-2 border border-white/5 bg-gradient-to-br transition-all",
                game.color
              )}
            >
              <div className="text-2xl font-display font-black text-white/20">{game.icon}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest">{game.name}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Win Rate', value: user.stats?.matchesPlayed > 0 ? `${user.stats.winRate || 0}%` : '0%', icon: Target, color: 'text-accent' },
          { label: 'Matches', value: user.stats?.matchesPlayed || 0, icon: Users, color: 'text-secondary' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase font-mono">{stat.label}</div>
              <div className="text-sm font-bold font-mono">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Graph */}
      <div className="glass rounded-2xl p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-bold">Performance</h3>
          <div className="flex items-center gap-1 text-accent text-[10px] font-mono">
            <TrendingUp className="w-3 h-3" />
            +12.5%
          </div>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#00E5FF' }}
              />
              <Area type="monotone" dataKey="score" stroke="#00E5FF" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Missions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold">Daily Missions</h3>
          <span className="text-[10px] text-primary font-mono">Resets in 12h</span>
        </div>
        <div className="space-y-3">
          {[
            { title: 'Win 3 Matches', progress: 1, total: 3, reward: '100 XP', icon: Trophy },
            { title: 'Play 5 Games', progress: 4, total: 5, reward: '50 XP', icon: Gamepad2 },
            { title: 'Reach Level 5', progress: 2, total: 5, reward: '200 XP', icon: Award },
          ].map((m, i) => (
            <div key={i} className="glass rounded-2xl p-4 border-l-4 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <m.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{m.title}</div>
                    <div className="text-[10px] text-white/40">Reward: {m.reward}</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-primary">{m.progress}/{m.total}</div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(m.progress / m.total) * 100}%` }}
                  className="h-full bg-primary shadow-[0_0_8px_#00E5FF]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold">Recent Activity</h3>
          <button className="text-xs text-primary font-medium flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {activities.length > 0 ? activities.map((item, i) => (
            <div key={i} className="glass rounded-xl p-3 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full bg-white/5 flex items-center justify-center", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{item.title}</div>
                <div className="text-xs text-white/50">{item.desc}</div>
              </div>
              <div className="text-[10px] text-white/30 font-mono">{item.time}</div>
            </div>
          )) : (
            <div className="text-center py-4 text-white/20 text-sm">No recent activity</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
