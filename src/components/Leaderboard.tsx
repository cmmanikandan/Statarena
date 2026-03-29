import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus, Search, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export default function Leaderboard() {
  const [gameFilter, setGameFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users_public'), orderBy('xp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        const currentXp = data.xp || 0;
        const previousXp = data.previousXp || 0;
        let rankMovement: 'up' | 'down' | 'stable' = 'stable';
        if (currentXp > previousXp) rankMovement = 'up';
        else if (currentXp < previousXp) rankMovement = 'down';
        
        return { 
          id: doc.id, 
          ...data,
          score: currentXp,
          rankMovement
        };
      });
      setPlayers(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users_public');
    });
    return () => unsubscribe();
  }, []);

  const filteredData = useMemo(() => {
    let data = [...players];
    
    if (gameFilter !== 'All') {
      const gameKeyMap: { [key: string]: string } = {
        'XO': 'tictactoe',
        'Quiz': 'quiz',
        'Tap': 'reaction',
        'Whack': 'whack',
        'RPS': 'rps',
        'Memory': 'memory'
      };
      const key = gameKeyMap[gameFilter];
      if (key) {
        data = data.map(p => ({ 
          ...p, 
          score: p.gameStats?.[key]?.wins || 0 
        }));
      }
    }

    if (searchQuery) {
      data = data.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return data.sort((a, b) => b.score - a.score);
  }, [gameFilter, searchQuery, players]);

  const top3 = filteredData.slice(0, 3);
  const others = filteredData.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      {/* Sticky Header */}
      <div className="p-6 pb-2 space-y-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
          <div className="relative flex-1 max-w-[140px]">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'XO', 'Quiz', 'Tap', 'Whack', 'RPS', 'Memory'].map((g) => (
              <button
                key={g}
                onClick={() => setGameFilter(g)}
                className={cn(
                  "px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                  gameFilter === g ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 pt-2 space-y-8">
        {/* Podium - Only show if we have at least 3 players */}
        {top3.length >= 3 ? (
          <div className="flex items-end justify-center gap-4 pt-10 pb-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 p-0.5">
                  <img src={top3[1].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold">2</div>
              </div>
              <div className="text-xs font-bold text-center truncate w-20">{top3[1].username}</div>
              <div className="h-24 w-16 glass rounded-t-xl flex flex-col items-center justify-end pb-4">
                <div className="text-[10px] font-mono text-white/40">{top3[1].score}</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 border border-dashed border-primary/40 rounded-full"
                />
                <div className="w-20 h-20 rounded-full border-2 border-primary p-0.5 neon-glow-blue">
                  <img src={top3[0].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -top-3 -right-1 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center text-background text-xs font-bold shadow-[0_0_10px_#00E5FF]">1</div>
              </div>
              <div className="text-sm font-bold text-center truncate w-24 text-primary neon-text-blue">{top3[0].username}</div>
              <div className="h-32 w-20 bg-gradient-to-b from-primary/20 to-transparent border-x border-t border-primary/30 rounded-t-2xl flex flex-col items-center justify-end pb-6">
                <div className="text-xs font-mono font-bold text-primary">{top3[0].score}</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-secondary/20 p-0.5">
                  <img src={top3[2].avatar} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center text-[10px] font-bold">3</div>
              </div>
              <div className="text-xs font-bold text-center truncate w-20">{top3[2].username}</div>
              <div className="h-20 w-16 glass rounded-t-xl flex flex-col items-center justify-end pb-4">
                <div className="text-[10px] font-mono text-white/40">{top3[2].score}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-10 pb-4 text-center text-white/40 text-sm italic">
            Top 3 podium requires more players...
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filteredData.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "glass rounded-xl p-3 flex items-center gap-4 transition-all duration-300",
                player.id === auth.currentUser?.uid ? "border-primary/40 bg-primary/5" : ""
              )}
            >
              <div className="w-6 text-center text-xs font-mono font-bold text-white/40">
                {index + 1}
              </div>
              <div className="relative">
                <img src={player.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                {player.rankMovement === 'up' && <TrendingUp className="absolute -top-1 -right-1 w-3 h-3 text-accent" />}
                {player.rankMovement === 'down' && <TrendingDown className="absolute -top-1 -right-1 w-3 h-3 text-danger" />}
                {player.rankMovement === 'stable' && <Minus className="absolute -top-1 -right-1 w-3 h-3 text-white/30" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold flex items-center gap-2">
                  {player.username}
                  {player.id === auth.currentUser?.uid && <span className="text-[8px] bg-primary/20 text-primary px-1 rounded uppercase">You</span>}
                </div>
                <div className="text-[10px] text-white/40 font-mono">{player.rank}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold">{player.score}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-tighter">{gameFilter === 'All' ? 'XP' : 'Wins'}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
