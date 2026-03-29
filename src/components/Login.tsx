import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Chrome, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';

interface LoginProps {
  onBack: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onGuest: () => void;
}

export default function Login({ onBack, onLogin, onSignUp, onGuest }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      onGuest();
    } catch (err: any) {
      console.error(err);
      setError('Guest login failed. Please try again.');
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

      <div className="flex-1 flex flex-col justify-center space-y-10 z-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold">Welcome <span className="text-primary">Back</span></h2>
          <p className="text-white/50 text-sm">Sign in to continue your progress</p>
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

        {/* Form Fields */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase font-mono ml-1">Email Address</label>
            <div className={cn(
              "relative group transition-all duration-300",
              focusedField === 'email' ? "scale-[1.02]" : ""
            )}>
              <div className={cn(
                "absolute inset-0 bg-primary/20 blur-md rounded-2xl transition-opacity duration-300",
                focusedField === 'email' ? "opacity-100" : "opacity-0"
              )} />
              <div className={cn(
                "relative flex items-center glass rounded-2xl border transition-colors duration-300",
                focusedField === 'email' ? "border-primary" : "border-white/10"
              )}>
                <Mail className={cn("ml-4 w-5 h-5 transition-colors", focusedField === 'email' ? "text-primary" : "text-white/20")} />
                <input 
                  type="email" 
                  placeholder="name@example.com"
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
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] text-white/40 uppercase font-mono">Password</label>
              <button type="button" className="text-[10px] text-primary font-bold uppercase hover:underline">Forgot Password?</button>
            </div>
            <div className={cn(
              "relative group transition-all duration-300",
              focusedField === 'password' ? "scale-[1.02]" : ""
            )}>
              <div className={cn(
                "absolute inset-0 bg-primary/20 blur-md rounded-2xl transition-opacity duration-300",
                focusedField === 'password' ? "opacity-100" : "opacity-0"
              )} />
              <div className={cn(
                "relative flex items-center glass rounded-2xl border transition-colors duration-300",
                focusedField === 'password' ? "border-primary" : "border-white/10"
              )}>
                <Lock className={cn("ml-4 w-5 h-5 transition-colors", focusedField === 'password' ? "text-primary" : "text-white/20")} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={loading}
                  className="w-full bg-transparent px-4 py-4 outline-none text-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mr-4 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-background font-bold text-lg shadow-[0_0_20px_rgba(0,229,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
          </motion.button>
        </form>

        {/* Social Login */}
        <div className="space-y-4">
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative bg-background px-4 text-[10px] text-white/20 uppercase font-mono">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl glass hover:bg-white/10 transition-colors text-sm font-bold disabled:opacity-50"
            >
              <Chrome className="w-4 h-4" /> Google
            </button>
            <button 
              onClick={handleGuestLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl glass hover:bg-white/10 transition-colors text-sm font-bold disabled:opacity-50"
            >
              Guest
            </button>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pb-12 text-center z-10">
        <p className="text-white/40 text-sm">
          Don't have an account?{' '}
          <button 
            onClick={onSignUp}
            disabled={loading}
            className="text-primary font-bold hover:underline disabled:opacity-50"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
