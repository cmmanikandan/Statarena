import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Trophy, Timer, RefreshCw, Swords } from 'lucide-react';

const CHOICES = [
  { id: 'rock', icon: '✊', name: 'Rock' },
  { id: 'paper', icon: '✋', name: 'Paper' },
  { id: 'scissors', icon: '✌️', name: 'Scissors' },
];

interface RockPaperScissorsProps {
  onComplete: (result: 'Win' | 'Loss', score: number, metrics: any) => void;
  onBack: () => void;
}

export default function RockPaperScissors({ onComplete, onBack }: RockPaperScissorsProps) {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [aiChoice, setAiChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [round, setRound] = useState(1);
  const [userWins, setUserWins] = useState(0);
  const [aiWins, setAiWins] = useState(0);

  const handleChoice = (choiceId: string) => {
    if (gameEnded) return;
    
    const ai = CHOICES[Math.floor(Math.random() * 3)].id;
    setUserChoice(choiceId);
    setAiChoice(ai);
    
    let newRoundResult = '';
    let newUserWins = userWins;
    let newAiWins = aiWins;

    if (choiceId === ai) newRoundResult = 'Draw';
    else if (
      (choiceId === 'rock' && ai === 'scissors') ||
      (choiceId === 'paper' && ai === 'rock') ||
      (choiceId === 'scissors' && ai === 'paper')
    ) {
      newRoundResult = 'Win';
      newUserWins += 1;
      setUserWins(newUserWins);
    } else {
      newRoundResult = 'Loss';
      newAiWins += 1;
      setAiWins(newAiWins);
    }
    
    setResult(newRoundResult);
    
    if (round === 3) {
      setTimeout(() => {
        setGameEnded(true);
        const finalResult = newUserWins > newAiWins ? 'Win' : 'Loss';
        onComplete(finalResult, newUserWins, {
          Rounds: 3,
          Wins: newUserWins,
          Losses: newAiWins,
          Draws: 3 - newUserWins - newAiWins
        });
      }, 1500);
    } else {
      setTimeout(() => {
        setRound(r => r + 1);
        setUserChoice(null);
        setAiChoice(null);
        setResult(null);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4">
      <div className="flex justify-between w-full glass p-4 rounded-2xl">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
          <Swords className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono font-bold">Round {round}/3</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono font-bold">{userWins} - {aiWins}</span>
        </div>
      </div>

      <div className="flex justify-between w-full max-w-xs items-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] text-white/40 uppercase font-mono">You</div>
          <motion.div 
            key={userChoice}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 glass rounded-2xl flex items-center justify-center text-4xl"
          >
            {userChoice ? CHOICES.find(c => c.id === userChoice)?.icon : '?'}
          </motion.div>
        </div>

        <div className="text-xl font-display font-bold text-primary italic">VS</div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] text-white/40 uppercase font-mono">AI</div>
          <motion.div 
            key={aiChoice}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 glass rounded-2xl flex items-center justify-center text-4xl"
          >
            {aiChoice ? CHOICES.find(c => c.id === aiChoice)?.icon : '?'}
          </motion.div>
        </div>
      </div>

      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "text-lg font-bold uppercase tracking-widest",
                result === 'Win' ? 'text-accent' : result === 'Loss' ? 'text-danger' : 'text-white/40'
              )}
            >
              {result}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!userChoice && !gameEnded && (
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {CHOICES.map((choice) => (
            <motion.button
              key={choice.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(choice.id)}
              className="glass aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-all"
            >
              <div className="text-3xl">{choice.icon}</div>
              <div className="text-[10px] font-bold uppercase text-white/40">{choice.name}</div>
            </motion.button>
          ))}
        </div>
      )}

      {gameEnded && (
        <div className="text-center space-y-2">
          <div className="text-2xl font-display font-bold text-primary">Game Over!</div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 glass rounded-xl text-sm font-bold text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset Game
          </button>
        </div>
      )}
    </div>
  );
}
