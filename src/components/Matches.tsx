import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ChevronRight, Filter, Calendar, Clock, ChevronDown, MapPin, Swords, Award, Share2, User } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

export default function Matches() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRatio: 0 });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'matches'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter out removed games
      docs = docs.filter((m: any) => {
        const gameId = (m.gameId || m.game || '').toLowerCase();
        return !gameId.includes('ludo') && !gameId.includes('snake');
      });

      setMatches(docs);
      
      const wins = docs.filter((m: any) => m.result === 'Win').length;
      const losses = docs.filter((m: any) => m.result === 'Loss').length;
      const ratio = losses === 0 ? wins : (wins / losses).toFixed(1);
      
      setStats({ wins, losses, winRatio: Number(ratio) });
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'matches');
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6 pb-24"
    >
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Match History</h1>
        <button className="p-2 rounded-xl glass">
          <Filter className="w-5 h-5 text-white/60" />
        </button>
      </header>

      {/* Summary Stats */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {[
          { label: 'Total Wins', value: stats.wins, color: 'text-accent' },
          { label: 'Total Loss', value: stats.losses, color: 'text-danger' },
          { label: 'Win Ratio', value: stats.winRatio, color: 'text-primary' },
        ].map((s, i) => (
          <div key={i} className="glass min-w-[120px] rounded-xl p-3 border-l-4 border-l-white/10">
            <div className="text-[10px] text-white/40 uppercase font-mono">{s.label}</div>
            <div className={cn("text-lg font-bold font-mono", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Match List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-white/20">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-white/20">No matches found</div>
        ) : matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                  match.result === 'Win' ? "bg-accent/10 text-accent" : "bg-danger/10 text-danger"
                )}>
                  {match.result === 'Win' ? 'W' : 'L'}
                </div>
                <div>
                  <div className="text-sm font-bold group-hover:text-primary transition-colors">{match.opponent || 'AI Opponent'}</div>
                  <div className="text-[10px] text-white/40 font-mono">{match.game || match.gameId || 'Unknown Game'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-mono font-bold">{match.score}</div>
                  <div className="text-[10px] text-white/30 font-mono">{match.duration || '15:00'}</div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform duration-300", expandedId === match.id ? "rotate-180" : "")} />
              </div>
            </div>
            
            <AnimatePresence>
              {expandedId === match.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4 overflow-hidden"
                >
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-white/40 uppercase font-mono">Opponent</div>
                      <div className="text-sm font-bold">{match.opponent || 'AI Opponent'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/40 uppercase font-mono">Result</div>
                      <div className={cn("text-sm font-bold", match.result === 'Win' ? "text-accent" : "text-danger")}>
                        {match.result}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[8px] text-white/30 uppercase font-mono">Mode</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Swords className="w-3 h-3 text-primary" /> {match.mode || 'Ranked'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] text-white/30 uppercase font-mono">XP Gained</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Award className="w-3 h-3 text-accent" /> +{match.xpGained || 0} XP
                      </div>
                    </div>
                  </div>
                  
                  {match.metrics && (
                    <div className="space-y-2">
                      <div className="text-[8px] text-white/30 uppercase font-mono">Performance Metrics</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(match.metrics).map(([key, val]: [string, any]) => (
                          <div key={key} className="bg-white/5 p-2 rounded-lg flex justify-between items-center">
                            <div className="text-[10px] text-white/40 uppercase">{key}</div>
                            <div className="text-xs font-bold text-primary">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold flex items-center justify-center gap-2">
                      <Share2 className="w-3 h-3" /> Share Match
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-4 py-2 bg-white/5 flex items-center justify-between border-t border-white/5">
              <div className="flex gap-3">
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <Calendar className="w-3 h-3" /> 
                  {match.timestamp?.toDate 
                    ? match.timestamp.toDate().toLocaleDateString() 
                    : match.timestamp 
                      ? new Date(match.timestamp).toLocaleDateString() 
                      : match.date || 'Today'}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <Clock className="w-3 h-3" /> 
                  {match.timestamp?.toDate 
                    ? match.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : match.timestamp 
                      ? new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '14:30'}
                </div>
              </div>
              <button className="text-[10px] font-bold text-primary flex items-center gap-1">
                Full Report <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
