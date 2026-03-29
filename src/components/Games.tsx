import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Hash, Timer, HelpCircle, Dice5, Mountain, CircleDot, Brain, Zap, Swords } from 'lucide-react';
import { cn } from '../lib/utils';

const GAMES = [
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe',
    icon: Hash,
    color: 'text-primary',
    bg: 'bg-primary/10',
    desc: 'Classic XO strategy game',
    players: '1-2 Players'
  },
  {
    id: 'reaction',
    name: 'Reaction Tap',
    icon: Timer,
    color: 'text-accent',
    bg: 'bg-accent/10',
    desc: 'Test your reaction speed',
    players: 'Single Player'
  },
  {
    id: 'quiz',
    name: 'Brain Quiz',
    icon: HelpCircle,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    desc: 'Test your knowledge',
    players: 'Single Player'
  },
  {
    id: 'whack',
    name: 'Whack-a-Mole',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    desc: 'Tap the moles fast!',
    players: 'Single Player'
  },
  {
    id: 'rps',
    name: 'Rock Paper Scissors',
    icon: Swords,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    desc: 'Classic hand game',
    players: 'Vs AI'
  },
  {
    id: 'memory',
    name: 'Memory Match',
    icon: Brain,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    desc: 'Test your memory skills',
    players: 'Single Player'
  }
];

interface GamesProps {
  onPlay: (gameId: string) => void;
}

export default function Games({ onPlay }: GamesProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6"
    >
      <header>
        <h1 className="text-2xl font-display font-bold">Arena Games</h1>
        <p className="text-xs text-white/40 mt-1">Select a game to compete and earn XP</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:border-primary/40 transition-all"
            onClick={() => onPlay(game.id)}
          >
            <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", game.bg)}>
              <game.icon className={cn("w-8 h-8", game.color)} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{game.name}</h3>
                <span className="text-[10px] font-mono text-white/30 uppercase">{game.players}</span>
              </div>
              <p className="text-xs text-white/50 mt-1">{game.desc}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn("h-full w-full opacity-20", game.bg.replace('/10', ''))} />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase">Play Now</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
