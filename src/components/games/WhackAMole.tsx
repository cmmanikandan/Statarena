import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Trophy, Timer, RefreshCw, Zap } from 'lucide-react';

interface WhackAMoleProps {
  onComplete: (result: 'Win' | 'Loss', score: number, metrics: any) => void;
  onBack: () => void;
}

export default function WhackAMole({ onComplete, onBack }: WhackAMoleProps) {
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const timerRef = useRef<any>(null);
  const moleTimerRef = useRef<any>(null);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(30);
    setGameStarted(true);
    setGameEnded(false);
    setHasCompleted(false);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearTimeout(moleTimerRef.current);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnMole();
  };

  const spawnMole = () => {
    const randomMole = Math.floor(Math.random() * 9);
    setActiveMole(randomMole);
    
    moleTimerRef.current = setTimeout(() => {
      spawnMole();
    }, Math.max(400, 1000 - scoreRef.current * 20)); // Mole spawns faster as score increases
  };

  const whack = (index: number) => {
    if (index === activeMole) {
      setScore(s => {
        const newScore = s + 1;
        scoreRef.current = newScore;
        return newScore;
      });
      setActiveMole(null);
    }
  };

  useEffect(() => {
    if (gameEnded && !hasCompleted) {
      setHasCompleted(true);
      onComplete(score >= 15 ? 'Win' : 'Loss', score, {
        Whacks: score,
        Time: '30s',
        Speed: `${(score / 30).toFixed(1)} w/s`
      });
    }
  }, [gameEnded, score, onComplete, hasCompleted]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full glass p-4 rounded-2xl">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
          <Zap className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold">Score: {score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono font-bold">Time: {timeLeft}s</span>
        </div>
      </div>

      {!gameStarted ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-display font-bold">Ready to Whack?</h3>
            <p className="text-xs text-white/40">Tap the moles as fast as you can!</p>
          </div>
          <button 
            onClick={startGame}
            className="px-8 py-3 bg-primary text-background rounded-xl font-bold shadow-[0_0_20px_#00E5FF]"
          >
            Start Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              onClick={() => whack(i)}
              className="aspect-square bg-white/5 border border-white/10 rounded-full relative overflow-hidden cursor-pointer"
            >
              <AnimatePresence>
                {activeMole === i && (
                  <motion.div
                    initial={{ y: 50, scale: 0.5 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 50, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl shadow-[0_0_15px_#00E5FF]">
                      🐹
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {gameStarted && (
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-sm font-bold text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reset Game
        </button>
      )}
    </div>
  );
}
