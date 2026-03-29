import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { skillData, winLossData, performanceData } from '../constants';
import { cn } from '../lib/utils';
import { Calendar, Clock, Target, Zap, Brain, TrendingUp, Gamepad2, Trophy, Award } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export default function Stats() {
  const [timeRange, setTimeRange] = useState('Week');
  const [activeGame, setActiveGame] = useState('all');
  const [userStats, setUserStats] = useState<any>(null);

  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUserStats(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    let q = query(
      collection(db, 'matches'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'asc'),
      limit(20)
    );

    if (activeGame !== 'all') {
      q = query(
        collection(db, 'matches'),
        where('userId', '==', auth.currentUser.uid),
        where('gameId', '==', activeGame),
        orderBy('timestamp', 'asc'),
        limit(20)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        day: (doc.data() as any).date || 'Match',
        score: (doc.data() as any).xpGained || parseInt((doc.data() as any).score?.toString().split('-')[0]) || 0
      }));
      setMatchHistory(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });
    return () => unsubscribe();
  }, [activeGame]);

  const chartData = useMemo(() => {
    if (matchHistory.length > 0) return matchHistory;
    return [{ day: 'Today', score: 0 }];
  }, [timeRange, matchHistory]);

  const dynamicSkillData = useMemo(() => {
    if (!userStats) return skillData;
    
    // Simple mapping: 
    // Speed -> Reaction Tap wins
    // Accuracy -> Brain Quiz wins
    // Strategy -> Tic Tac Toe wins
    // Consistency -> Total Matches
    // Agility -> Whack-a-Mole wins
    // Focus -> Memory Match wins
    
    const stats = userStats.gameStats || {};
    return [
      { subject: 'Speed', A: Math.min(100, (stats.reaction?.wins || 0) * 10 + 40), fullMark: 100 },
      { subject: 'Accuracy', A: Math.min(100, (stats.quiz?.wins || 0) * 10 + 50), fullMark: 100 },
      { subject: 'Strategy', A: Math.min(100, (stats.tictactoe?.wins || 0) * 10 + 30), fullMark: 100 },
      { subject: 'Consistency', A: Math.min(100, (userStats.stats?.matchesPlayed || 0) * 2 + 40), fullMark: 100 },
      { subject: 'Agility', A: Math.min(100, (stats.whack?.wins || 0) * 10 + 20), fullMark: 100 },
      { subject: 'Focus', A: Math.min(100, (stats.memory?.wins || 0) * 10 + 20), fullMark: 100 },
    ];
  }, [userStats]);

  const gamePerformanceData = useMemo(() => {
    if (!userStats?.gameStats) return [];

    const stats = userStats.gameStats;
    return [
      { name: 'XO', winRate: stats.tictactoe?.total ? Math.round((stats.tictactoe.wins / stats.tictactoe.total) * 100) : 0, color: '#00E5FF' },
      { name: 'Quiz', winRate: stats.quiz?.total ? Math.round((stats.quiz.wins / stats.quiz.total) * 100) : 0, color: '#7B61FF' },
      { name: 'Tap', winRate: stats.reaction?.total ? Math.round((stats.reaction.wins / stats.reaction.total) * 100) : 0, color: '#00FF9C' },
      { name: 'Whack', winRate: stats.whack?.total ? Math.round((stats.whack.wins / stats.whack.total) * 100) : 0, color: '#FB923C' },
      { name: 'RPS', winRate: stats.rps?.total ? Math.round((stats.rps.wins / stats.rps.total) * 100) : 0, color: '#4ADE80' },
      { name: 'Memory', winRate: stats.memory?.total ? Math.round((stats.memory.wins / stats.memory.total) * 100) : 0, color: '#F472B6' },
    ];
  }, [userStats]);

  const insights = useMemo(() => {
    if (!userStats || !userStats.stats?.matchesPlayed) return [
      { text: "Play some games to get insights!", icon: Brain, color: "text-secondary" }
    ];

    const stats = userStats.gameStats || {};
    const list = [];

    if ((stats.quiz?.wins || 0) > (stats.tictactoe?.wins || 0)) {
      list.push({ text: "You perform best in Brain Quiz", icon: Brain, color: "text-secondary" });
    } else {
      list.push({ text: "Strategy is your strongest suit", icon: Target, color: "text-primary" });
    }

    if ((userStats.stats?.winRate || 0) > 70) {
      list.push({ text: "Elite win rate maintained!", icon: Trophy, color: "text-accent" });
    }

    if ((userStats.level || 1) > 5) {
      list.push({ text: "Veteran status achieved", icon: Award, color: "text-primary" });
    } else {
      list.push({ text: "Keep playing to reach Level 5", icon: TrendingUp, color: "text-white/40" });
    }

    return list;
  }, [userStats]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-8"
    >
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Analytics</h1>
          <div className="flex gap-1 p-1 glass rounded-lg">
            {['Week', 'Month', 'All'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                  timeRange === r ? "bg-primary text-background" : "text-white/40"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['all', 'tictactoe', 'quiz', 'reaction', 'whack', 'rps', 'memory'].map((g) => (
            <button
              key={g}
              onClick={() => setActiveGame(g)}
              className={cn(
                "px-4 py-2 rounded-xl glass text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                activeGame === g ? "border-primary text-primary" : "text-white/40"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </header>

      {/* Game Comparison */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm">Game Comparison</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gamePerformanceData}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#00E5FF' }}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {gamePerformanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Radar */}
      <div className="glass rounded-2xl p-5 aspect-square relative overflow-hidden">
        <div className="absolute top-4 left-5">
          <h3 className="font-heading font-bold text-sm">Skill Radar</h3>
          <p className="text-[10px] text-white/40 font-mono">Speed, Accuracy, Consistency</p>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="55%" outerRadius="70%" data={dynamicSkillData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
            <Radar
              name="Skills"
              dataKey="A"
              stroke="#00E5FF"
              fill="#00E5FF"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Insights */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-1">Smart Insights</h3>
        <div className="grid grid-cols-1 gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-4 flex items-center gap-4 border-l-4 border-l-primary/40"
            >
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", insight.color)}>
                <insight.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-white/80">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Score Trend */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-sm">Score Trend</h3>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[0, 'dataMax + 50']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#00E5FF' }}
              />
              <Line 
                type="step" 
                dataKey="score" 
                stroke="#7B61FF" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
