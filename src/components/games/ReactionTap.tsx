import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, RotateCcw, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ReactionTapProps {
  onComplete: (result: 'Win' | 'Loss', score: number, metrics: any) => void;
  onBack: () => void;
}

export default function ReactionTap({ onComplete, onBack }: ReactionTapProps) {
  const [gameState, setGameState] = useState<'IDLE' | 'WAITING' | 'READY' | 'FINISHED' | 'TOO_EARLY'>('IDLE');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const startTest = () => {
    setGameState('WAITING');
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    timerRef.current = setTimeout(() => {
      setGameState('READY');
      setStartTime(Date.now());
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'WAITING') {
      clearTimeout(timerRef.current);
      setGameState('TOO_EARLY');
    } else if (gameState === 'READY') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setGameState('FINISHED');
      handleGameEnd(time);
    }
  };

  const handleGameEnd = (time: number) => {
    const result = time < 300 ? 'Win' : 'Loss';
    const score = Math.max(0, 500 - time);
    setTimeout(() => {
      onComplete(result, score, { reactionTime: time });
    }, 2000);
  };

  const resetGame = () => {
    clearTimeout(timerRef.current);
    setGameState('IDLE');
    setReactionTime(null);
  };

  return (
    <div className="flex flex-col h-full bg-background p-6 space-y-8">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="text-white/40 hover:text-white">Back</button>
        <h2 className="text-xl font-display font-bold">Reaction Tap</h2>
        <button onClick={resetGame} className="p-2 rounded-xl glass">
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={gameState === 'IDLE' || gameState === 'FINISHED' || gameState === 'TOO_EARLY' ? startTest : handleTap}
          className={cn(
            "w-full max-w-[320px] aspect-square rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-300 relative overflow-hidden",
            gameState === 'IDLE' && "glass border-white/10",
            gameState === 'WAITING' && "bg-danger/20 border-danger/40",
            gameState === 'READY' && "bg-accent border-accent shadow-[0_0_50px_rgba(0,255,156,0.5)]",
            gameState === 'FINISHED' && "bg-primary/20 border-primary/40",
            gameState === 'TOO_EARLY' && "bg-danger/40 border-danger/60"
          )}
        >
          <AnimatePresence mode="wait">
            {gameState === 'IDLE' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <div className="text-xl font-bold">Tap to Start</div>
                <p className="text-xs text-white/40">Wait for the screen to turn GREEN, then tap as fast as you can!</p>
              </motion.div>
            )}

            {gameState === 'WAITING' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-2"
              >
                <div className="text-3xl font-bold text-danger">WAIT...</div>
                <p className="text-xs text-danger/60 font-mono">Wait for the green light</p>
              </motion.div>
            )}

            {gameState === 'READY' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2"
              >
                <div className="text-5xl font-black text-background">TAP!</div>
              </motion.div>
            )}

            {gameState === 'FINISHED' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div className="text-4xl font-black font-mono text-primary">{reactionTime}ms</div>
                <div className="text-xl font-bold flex items-center justify-center gap-2">
                  <Trophy className="text-primary" />
                  {reactionTime && reactionTime < 300 ? "Elite Reflexes!" : "Nice Try!"}
                </div>
                <p className="text-xs text-white/40">Saving match data...</p>
              </motion.div>
            )}

            {gameState === 'TOO_EARLY' && (
              <motion.div
                key="early"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="text-3xl font-bold text-danger">TOO EARLY!</div>
                <p className="text-xs text-white/40">Tap to try again</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/40 uppercase font-mono">Best Time</div>
          <div className="text-lg font-bold font-mono">214ms</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/40 uppercase font-mono">Avg Time</div>
          <div className="text-lg font-bold font-mono">285ms</div>
        </div>
      </div>
    </div>
  );
}
