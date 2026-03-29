import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Trophy, Timer, RefreshCw, Brain } from 'lucide-react';

interface MemoryMatchProps {
  onComplete: (result: 'Win' | 'Loss', score: number, metrics: any) => void;
  onBack: () => void;
}

export default function MemoryMatch({ onComplete, onBack }: MemoryMatchProps) {
  const [cards, setCards] = useState(() => {
    const icons = ['🔥', '⚡', '💎', '🍀', '🌟', '🍎', '🍕', '🚀'];
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon, flipped: false, matched: false }));
    return deck;
  });
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    let interval: any;
    if (startTime && !gameEnded) {
      interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameEnded]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].icon === cards[second].icon) {
        setCards(prev => prev.map((card, i) => 
          (i === first || i === second) ? { ...card, matched: true } : card
        ));
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            (i === first || i === second) ? { ...card, flipped: false } : card
          ));
          setFlipped([]);
        }, 1000);
      }
      setMoves(m => m + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  useEffect(() => {
    if (cards.every(card => card.matched) && !gameEnded && startTime) {
      setGameEnded(true);
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.max(0, 1000 - moves * 20 - duration * 5);
      
      onComplete('Win', score, {
        Moves: moves,
        Time: `${duration}s`,
        duration: duration,
        Accuracy: `${Math.round((8 / moves) * 100)}%`
      });
    }
  }, [cards, gameEnded, moves, startTime, onComplete]);

  const handleFlip = (index: number) => {
    if (flipped.length < 2 && !cards[index].flipped && !cards[index].matched) {
      if (!startTime) setStartTime(Date.now());
      setCards(prev => prev.map((card, i) => i === index ? { ...card, flipped: true } : card));
      setFlipped(prev => [...prev, index]);
    }
  };

  const resetGame = () => {
    const icons = ['🔥', '⚡', '💎', '🍀', '🌟', '🍎', '🍕', '🚀'];
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon, flipped: false, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setGameEnded(false);
    setStartTime(null);
    setCurrentTime(Date.now());
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full glass p-4 rounded-2xl">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
          <Brain className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold">Moves: {moves}</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono font-bold">Time: {startTime ? Math.floor((currentTime - startTime) / 1000) : 0}s</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full max-w-xs">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(index)}
            className={cn(
              "aspect-square rounded-xl cursor-pointer flex items-center justify-center text-2xl transition-all duration-500 preserve-3d relative perspective-[1000px]",
              card.flipped || card.matched ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,229,255,0.3)]" : "bg-white/5 border border-white/10"
            )}
          >
            <motion.div 
              className="w-full h-full flex items-center justify-center preserve-3d relative"
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front (Hidden) */}
              <div className="absolute inset-0 backface-hidden glass rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
                <span className="text-3xl opacity-50">?</span>
              </div>
              {/* Back (Revealed) */}
              <div className="absolute inset-0 backface-hidden glass rounded-xl flex items-center justify-center bg-white/10 border border-primary/30 rotate-y-180">
                <span className="text-4xl">{card.icon}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={resetGame}
        className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-sm font-bold text-white/60 hover:text-white transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Reset Game
      </button>
    </div>
  );
}
