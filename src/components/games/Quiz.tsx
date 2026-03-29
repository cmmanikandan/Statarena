import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Trophy, RotateCcw, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuizProps {
  onComplete: (result: 'Win' | 'Loss', score: number, metrics: any) => void;
  onBack: () => void;
}

const QUESTIONS = [
  {
    question: "Which of these is a popular esports genre?",
    options: ["MOBA", "Cooking", "Gardening", "Fishing"],
    answer: 0
  },
  {
    question: "What does 'FPS' stand for in gaming?",
    options: ["Fast Pace Shooter", "First Person Shooter", "Final Point Score", "Frames Per Second"],
    answer: 1
  },
  {
    question: "In gaming, what is 'GG' short for?",
    options: ["Good Game", "Go Go", "Great Goal", "Good Grief"],
    answer: 0
  },
  {
    question: "Which company developed the game 'Fortnite'?",
    options: ["Valve", "Blizzard", "Epic Games", "Riot Games"],
    answer: 2
  },
  {
    question: "What is the highest rank in StatArena?",
    options: ["Gold", "Diamond", "Platinum", "Master"],
    answer: 3
  }
];

export default function Quiz({ onComplete, onBack }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (showResult || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !showResult) {
      handleNextQuestion();
    }
  }, [timeLeft]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === QUESTIONS[currentQuestion].answer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);

    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(15);
    } else {
      setShowResult(true);
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const finalScore = (score / QUESTIONS.length) * 100;
    const result = finalScore >= 60 ? 'Win' : 'Loss';
    
    setTimeout(() => {
      onComplete(result, finalScore, { accuracy: finalScore, duration });
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setTimeLeft(15);
  };

  return (
    <div className="flex flex-col h-full bg-background p-6 space-y-8">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="text-white/40 hover:text-white">Back</button>
        <h2 className="text-xl font-display font-bold">Brain Quiz</h2>
        <button onClick={resetGame} className="p-2 rounded-xl glass">
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {!showResult ? (
          <>
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-white/40 uppercase">
                <span>Question {currentQuestion + 1} / {QUESTIONS.length}</span>
                <span className={cn("flex items-center gap-1", timeLeft < 5 ? "text-danger animate-pulse" : "text-primary")}>
                  <Timer className="w-3 h-3" /> {timeLeft}s
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary" 
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-6"
            >
              <h3 className="text-xl font-bold text-center leading-tight">
                {QUESTIONS[currentQuestion].question}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {QUESTIONS[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(index)}
                    className={cn(
                      "glass p-4 rounded-2xl text-left flex items-center justify-between transition-all",
                      selectedOption === index && isCorrect === true && "bg-accent/20 border-accent",
                      selectedOption === index && isCorrect === false && "bg-danger/20 border-danger",
                      selectedOption !== null && index === QUESTIONS[currentQuestion].answer && "bg-accent/20 border-accent"
                    )}
                  >
                    <span className="text-sm font-medium">{option}</span>
                    {selectedOption === index && (
                      isCorrect ? <CheckCircle2 className="w-5 h-5 text-accent" /> : <XCircle className="w-5 h-5 text-danger" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black font-mono text-primary">{score} / {QUESTIONS.length}</div>
              <div className="text-xl font-bold">Quiz Complete!</div>
              <p className="text-xs text-white/40">Saving match data...</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/40 uppercase font-mono">Accuracy</div>
          <div className="text-lg font-bold font-mono">{Math.round((score / QUESTIONS.length) * 100)}%</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/40 uppercase font-mono">Current Score</div>
          <div className="text-lg font-bold font-mono">{score}</div>
        </div>
      </div>
    </div>
  );
}
