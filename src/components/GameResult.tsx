import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, XCircle, Zap, TrendingUp, TrendingDown, Play, BarChart3, Home, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface GameResultProps {
  result: 'Win' | 'Loss';
  score: number;
  xpGained: number;
  rankChange: number;
  hasLeveledUp?: boolean;
  newRank?: string;
  newLevel?: number;
  onPlayAgain: () => void;
  onViewStats: () => void;
  onGoHome: () => void;
}

export default function GameResult({ result, score, xpGained, rankChange, hasLeveledUp, newRank, newLevel, onPlayAgain, onViewStats, onGoHome }: GameResultProps) {
  const isWin = result === 'Win';
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (hasLeveledUp) {
      setShowLevelUp(true);
    }
  }, [hasLeveledUp]);

  useEffect(() => {
    if (isWin || showLevelUp) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isWin, showLevelUp]);

  if (showLevelUp && newRank) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-background/95 backdrop-blur-xl"
      >
        <div className="w-full max-w-md glass rounded-[40px] p-8 space-y-8 relative overflow-hidden border-accent/40 shadow-[0_0_50px_rgba(0,255,156,0.2)]">
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-30 bg-accent" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-30 bg-primary" />

          <div className="text-center space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0, rotate: -180 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto border-2 border-accent/50 shadow-[0_0_30px_rgba(0,255,156,0.5)]"
            >
              <Star className="w-16 h-16 text-accent drop-shadow-[0_0_15px_rgba(0,255,156,0.8)] fill-accent" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                Level Up!
              </h2>
              <p className="text-sm text-white/60 mt-2 font-mono uppercase tracking-widest">You've reached</p>
              <div className="text-5xl font-display font-bold text-white mt-2">LVL {newLevel}</div>
              {newRank && <div className="text-lg font-bold text-primary mt-1">{newRank} Rank</div>}
            </motion.div>
          </div>

          <div className="space-y-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLevelUp(false)}
              className="w-full py-4 rounded-2xl bg-accent text-background font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,156,0.3)]"
            >
              <Play className="w-5 h-5 fill-background" /> Awesome!
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl"
    >
      <div className="w-full max-w-md glass rounded-[40px] p-8 space-y-8 relative overflow-hidden border-primary/20">
        {/* Background Glow */}
        <div className={cn("absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[100px] opacity-20", isWin ? "bg-accent" : "bg-danger")} />
        <div className={cn("absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20", isWin ? "bg-primary" : "bg-secondary")} />

        <div className="text-center space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10"
          >
            {isWin ? (
              <Trophy className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
            ) : (
              <XCircle className="w-12 h-12 text-danger drop-shadow-[0_0_15px_rgba(255,77,77,0.5)]" />
            )}
          </motion.div>
          
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <h2 className={cn("text-5xl font-black uppercase tracking-tighter drop-shadow-2xl", isWin ? "text-primary" : "text-danger")}>
              {isWin ? 'Victory!' : 'Defeat'}
            </h2>
            <p className="text-xs text-white/40 mt-2 font-mono uppercase tracking-widest">Match Result</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="glass rounded-3xl p-4 text-center space-y-1"
          >
            <div className="text-[10px] text-white/40 uppercase font-mono">Score</div>
            <div className="text-2xl font-black font-mono text-white">{score}</div>
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="glass rounded-3xl p-4 text-center space-y-1"
          >
            <div className="text-[10px] text-white/40 uppercase font-mono">XP Gained</div>
            <div className="text-2xl font-black font-mono text-accent flex items-center justify-center gap-1">
              <Zap className="w-4 h-4 fill-accent" /> +{xpGained}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-3xl p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase font-mono">Rank Progress</div>
              <div className="text-sm font-bold">Diamond II</div>
            </div>
          </div>
          <div className={cn("flex items-center gap-1 font-mono font-bold", rankChange >= 0 ? "text-accent" : "text-danger")}>
            {rankChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {rankChange >= 0 ? `+${rankChange}` : rankChange}
          </div>
        </motion.div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              console.log("Play Again clicked in GameResult");
              onPlayAgain();
            }}
            className="w-full py-4 rounded-2xl bg-primary text-background font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
          >
            <Play className="w-5 h-5 fill-background" /> Play Again
          </motion.button>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                console.log("Stats clicked in GameResult");
                onViewStats();
              }}
              className="py-4 rounded-2xl glass text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> Stats
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="py-4 rounded-2xl glass text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Home
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
