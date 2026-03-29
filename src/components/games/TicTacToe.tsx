import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Circle, RotateCcw, Trophy, User, Bot } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TicTacToeProps {
  onComplete: (result: 'Win' | 'Loss', score: number, metrics: any) => void;
  onBack: () => void;
}

type Player = 'X' | 'O' | null;

export default function TicTacToe({ onComplete, onBack }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameMode, setGameMode] = useState<'AI' | 'PVP'>('AI');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [startTime] = useState(Date.now());
  const [moves, setMoves] = useState(0);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    if (!squares.includes(null)) return { winner: 'Draw', line: null };
    return null;
  };

  const getBestMove = (squares: Player[], player: 'X' | 'O'): number => {
    const emptySquares = squares.map((s, i) => s === null ? i : null).filter(s => s !== null) as number[];
    
    // Try to win
    for (let i of emptySquares) {
      const copy = [...squares];
      copy[i] = player;
      if (calculateWinner(copy)?.winner === player) return i;
    }
    
    // Block opponent
    const opponent = player === 'X' ? 'O' : 'X';
    for (let i of emptySquares) {
      const copy = [...squares];
      copy[i] = opponent;
      if (calculateWinner(copy)?.winner === opponent) return i;
    }
    
    // Random
    return emptySquares[Math.floor(Math.random() * emptySquares.length)];
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = calculateWinner(squares);
    if (result?.winner === 'O') return 10 - depth;
    if (result?.winner === 'X') return depth - 10;
    if (result?.winner === 'Draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getHardMove = (squares: Player[]): number => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setMoves(moves + 1);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner as Player | 'Draw');
      setWinningLine(result.line);
      handleGameEnd(result.winner as Player | 'Draw');
    }
  };

  const handleGameEnd = (winnerResult: Player | 'Draw') => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const result = winnerResult === 'X' ? 'Win' : 'Loss';
    const score = winnerResult === 'X' ? 100 : winnerResult === 'Draw' ? 50 : 0;
    
    setTimeout(() => {
      onComplete(result, score, { moves, duration, difficulty });
    }, 1500);
  };

  // AI Move
  useEffect(() => {
    if (gameMode === 'AI' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const emptySquares = board.map((s, i) => s === null ? i : null).filter(s => s !== null) as number[];
        if (emptySquares.length > 0) {
          let move: number;
          if (difficulty === 'Easy') {
            move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
          } else if (difficulty === 'Medium') {
            move = getBestMove(board, 'O');
          } else {
            move = getHardMove(board);
          }
          handleClick(move);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, gameMode, board, difficulty]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setMoves(0);
  };

  return (
    <div className="flex flex-col h-full bg-background p-6 space-y-8">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="text-white/40 hover:text-white">Back</button>
        <h2 className="text-xl font-display font-bold">Tic Tac Toe</h2>
        <button onClick={resetGame} className="p-2 rounded-xl glass">
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setGameMode('AI')}
            className={cn("px-4 py-2 rounded-xl glass flex items-center gap-2 text-xs transition-all", gameMode === 'AI' ? "border-primary text-primary" : "text-white/40")}
          >
            <Bot className="w-4 h-4" /> VS AI
          </button>
          <button 
            onClick={() => setGameMode('PVP')}
            className={cn("px-4 py-2 rounded-xl glass flex items-center gap-2 text-xs transition-all", gameMode === 'PVP' ? "border-primary text-primary" : "text-white/40")}
          >
            <User className="w-4 h-4" /> VS PLAYER
          </button>
        </div>
        {gameMode === 'AI' && (
          <div className="flex justify-center gap-2">
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn("px-3 py-1 rounded-lg glass text-[10px] transition-all", difficulty === d ? "bg-primary/20 border-primary text-primary" : "text-white/40")}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[300px] aspect-square">
          {board.map((square, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(i)}
              className={cn(
                "glass rounded-2xl flex items-center justify-center text-4xl transition-all",
                winningLine?.includes(i) ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,229,255,0.3)]" : "",
                !square && !winner ? "hover:border-primary/40" : ""
              )}
            >
              <AnimatePresence mode="wait">
                {square === 'X' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-primary"
                  >
                    <X className="w-12 h-12" />
                  </motion.div>
                )}
                {square === 'O' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-accent"
                  >
                    <Circle className="w-10 h-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <AnimatePresence mode="wait">
            {winner ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Trophy className="text-primary" />
                  {winner === 'Draw' ? "It's a Draw!" : `${winner} Wins!`}
                </div>
                <p className="text-xs text-white/40">Match data is being saved...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold text-white/60"
              >
                {isXNext ? "Your Turn (X)" : "Opponent Turn (O)"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/40 uppercase font-mono">Moves</div>
          <div className="text-lg font-bold font-mono">{moves}</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/40 uppercase font-mono">Time</div>
          <div className="text-lg font-bold font-mono">{Math.floor((Date.now() - startTime) / 1000)}s</div>
        </div>
      </div>
    </div>
  );
}
