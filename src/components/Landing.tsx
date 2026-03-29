import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, Target, ChevronRight } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function Landing({ onGetStarted, onLogin }: LandingProps) {
  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto relative overflow-hidden px-8">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/20 blur-[120px] rounded-full"
      />

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative"
        >
          <div className="w-32 h-32 glass rounded-3xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:opacity-100 transition-opacity" />
            <Trophy className="w-16 h-16 text-primary neon-text-blue relative z-10" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-3xl scale-110"
            />
          </div>
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-primary blur-md rounded-full"
          />
        </motion.div>

        {/* Text Content */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-display font-bold tracking-tighter"
          >
            STAT<span className="text-primary">ARENA</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 font-heading font-medium tracking-widest uppercase text-xs"
          >
            Track. Compete. Dominate.
          </motion.p>
        </div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-6"
        >
          {[
            { icon: Zap, label: 'Fast' },
            { icon: Target, label: 'Precise' },
            { icon: Trophy, label: 'Elite' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <f.icon className="w-5 h-5 text-white/40" />
              </div>
              <span className="text-[10px] uppercase font-mono text-white/30">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Buttons Section */}
      <div className="pb-16 space-y-4 z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onGetStarted}
          className="w-full py-4 rounded-2xl bg-primary text-background font-bold text-lg shadow-[0_0_30px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 group hover:scale-[1.02] transition-transform"
        >
          Get Started
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          onClick={onLogin}
          className="w-full py-4 rounded-2xl glass text-white font-bold text-lg hover:bg-white/10 transition-colors"
        >
          Login
        </motion.button>
      </div>

      {/* Swipe Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20"
      >
        <div className="w-1 h-4 rounded-full bg-white" />
        <span className="text-[8px] uppercase font-mono">Scroll for more</span>
      </motion.div>
    </div>
  );
}
