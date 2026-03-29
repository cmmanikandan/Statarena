import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowLeft, Camera, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface SignUpProps {
  onBack: () => void;
  onSignUp: () => void;
  onLogin: () => void;
}

export default function SignUp({ onBack, onSignUp, onLogin }: SignUpProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 33;
    if (password.length < 10) return 66;
    return 100;
  };

  const strengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 33) return 'bg-danger';
    if (strength <= 66) return 'bg-secondary';
    return 'bg-accent';
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !username || !email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName: username });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        email,
        avatar: 'default',
        rank: 'Bronze',
        level: 1,
        xp: 0,
        stats: {
          matchesPlayed: 0,
          winRate: 0,
          kdRatio: 0,
          avgScore: 0
        },
        themeColor: '#00E5FF'
      });

      onSignUp();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto relative overflow-hidden px-8 pt-12">
      {/* Back Button */}
      <button 
        onClick={onBack}
        disabled={loading}
        className="absolute top-8 left-8 p-2 rounded-full glass hover:bg-white/10 transition-colors z-20 disabled:opacity-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 flex flex-col justify-center space-y-8 z-10 py-10 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold">Create <span className="text-primary">Account</span></h2>
          <p className="text-white/50 text-sm">Join the elite arena today</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Avatar Selection */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full glass border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
              <User className="w-10 h-10 text-white/10" />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border-2 border-background shadow-lg">
              <Camera className="w-4 h-4 text-background" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase font-mono ml-1">Username</label>
            <div className={cn("relative flex items-center glass rounded-2xl border transition-all duration-300", focusedField === 'user' ? "border-primary scale-[1.02]" : "border-white/10")}>
              <User className={cn("ml-4 w-5 h-5 transition-colors", focusedField === 'user' ? "text-primary" : "text-white/20")} />
              <input 
                type="text" 
                placeholder="CyberWarrior"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('user')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                className="w-full bg-transparent px-4 py-4 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase font-mono ml-1">Email Address</label>
            <div className={cn("relative flex items-center glass rounded-2xl border transition-all duration-300", focusedField === 'email' ? "border-primary scale-[1.02]" : "border-white/10")}>
              <Mail className={cn("ml-4 w-5 h-5 transition-colors", focusedField === 'email' ? "text-primary" : "text-white/20")} />
              <input 
                type="email" 
                placeholder="warrior@arena.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                className="w-full bg-transparent px-4 py-4 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase font-mono ml-1">Password</label>
            <div className={cn("relative flex items-center glass rounded-2xl border transition-all duration-300", focusedField === 'password' ? "border-primary scale-[1.02]" : "border-white/10")}>
              <Lock className={cn("ml-4 w-5 h-5 transition-colors", focusedField === 'password' ? "text-primary" : "text-white/20")} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={loading}
                className="w-full bg-transparent px-4 py-4 outline-none text-sm"
                required
              />
            </div>
            {password.length > 0 && (
              <div className="px-1 space-y-1">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getPasswordStrength()}%` }}
                    className={cn("h-full transition-colors duration-500", strengthColor())}
                  />
                </div>
                <div className="text-[8px] text-white/30 uppercase font-mono text-right">
                  {getPasswordStrength() <= 33 ? 'Weak' : getPasswordStrength() <= 66 ? 'Medium' : 'Strong'}
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          <button 
            type="button"
            onClick={() => setAgreed(!agreed)}
            disabled={loading}
            className="flex items-start gap-3 text-left group disabled:opacity-50"
          >
            <div className={cn(
              "mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-300",
              agreed ? "bg-primary border-primary" : "border-white/20 group-hover:border-white/40"
            )}>
              {agreed && <Check className="w-3 h-3 text-background" />}
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              I agree to the <span className="text-white/60 font-bold">Terms of Service</span> and <span className="text-white/60 font-bold">Privacy Policy</span>
            </p>
          </button>

          {/* Action Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!agreed || loading}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2",
              agreed && !loading
                ? "bg-primary text-background shadow-[0_0_20px_rgba(0,229,255,0.2)]" 
                : "bg-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </motion.button>
        </form>
      </div>

      {/* Footer Link */}
      <div className="pb-12 text-center z-10">
        <p className="text-white/40 text-sm">
          Already have an account?{' '}
          <button 
            onClick={onLogin}
            disabled={loading}
            className="text-primary font-bold hover:underline disabled:opacity-50"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
