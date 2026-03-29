import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';
import Matches from './components/Matches';
import Profile from './components/Profile';
import Landing from './components/Landing';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Games from './components/Games';
import TicTacToe from './components/games/TicTacToe';
import ReactionTap from './components/games/ReactionTap';
import Quiz from './components/games/Quiz';
import GameResult from './components/GameResult';
import WhackAMole from './components/games/WhackAMole';
import RockPaperScissors from './components/games/RockPaperScissors';
import MemoryMatch from './components/games/MemoryMatch';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, updateDoc, increment } from 'firebase/firestore';
import { User, Match, Rank } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

type AuthState = 'landing' | 'login' | 'signup' | 'authenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [themeColor, setThemeColor] = useState('#00E5FF'); // Default Neon Blue
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [newMatch, setNewMatch] = useState({ opponent: '', myScore: '', opponentScore: '', gameId: 'tictactoe' });
  const [savingMatch, setSavingMatch] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<any | null>(null);

  const handleSaveMatch = async (customMatchData?: any) => {
    if (!user) return;
    if (!customMatchData && (!newMatch.opponent || !newMatch.myScore || !newMatch.opponentScore)) return;

    setSavingMatch(true);
    try {
      const matchData = (customMatchData && !customMatchData.nativeEvent) ? customMatchData : {
        userId: user.uid,
        game: newMatch.gameId === 'tictactoe' ? 'Tic Tac Toe' : 
              newMatch.gameId === 'quiz' ? 'Brain Quiz' : 
              newMatch.gameId === 'reaction' ? 'Reaction Tap' : 
              newMatch.gameId === 'whack' ? 'Whack-a-Mole' :
              newMatch.gameId === 'rps' ? 'Rock Paper Scissors' :
              'Memory Match',
        gameId: newMatch.gameId,
        mode: 'Competitive',
        result: parseInt(newMatch.myScore) > parseInt(newMatch.opponentScore) ? 'Win' : 'Loss',
        score: `${newMatch.myScore}-${newMatch.opponentScore}`,
        opponent: newMatch.opponent,
        timestamp: serverTimestamp(),
        date: new Date().toLocaleDateString(),
        duration: '15:00',
        xpGained: parseInt(newMatch.myScore) > parseInt(newMatch.opponentScore) ? 100 : 25,
        rankChange: parseInt(newMatch.myScore) > parseInt(newMatch.opponentScore) ? 15 : -5
      };

      const matchRef = doc(collection(db, 'matches'));
      try {
        await setDoc(matchRef, { ...matchData, id: matchRef.id });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `matches/${matchRef.id}`);
      }
      
      // Update user stats
      const userRef = doc(db, 'users', user.uid);
      const isWin = matchData.result === 'Win';
      
      try {
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const currentXp = userData?.xp || 0;
        const newXp = currentXp + (matchData.xpGained || 0);
        const currentLevel = userData?.level || 1;
        const newLevel = Math.floor(newXp / 500) + 1;
        
        const getRank = (level: number): Rank => {
          if (level >= 50) return 'Master';
          if (level >= 40) return 'Diamond';
          if (level >= 30) return 'Platinum';
          if (level >= 20) return 'Gold';
          if (level >= 10) return 'Silver';
          return 'Bronze';
        };
        const newRank = getRank(newLevel);
        const hasLeveledUp = newLevel > currentLevel;

        setGameResult((prev: any) => prev ? { ...prev, hasLeveledUp, newRank, newLevel } : null);
        
        const totalMatches = (userData?.stats?.matchesPlayed || 0) + 1;
        const totalWins = (userData?.gameStats?.all?.wins || 0) + (isWin ? 1 : 0);
        const newWinRate = Math.round((totalWins / totalMatches) * 100);

        await updateDoc(userRef, {
          'stats.matchesPlayed': totalMatches,
          'stats.winRate': newWinRate,
          'stats.avgScore': increment(typeof matchData.score === 'number' ? matchData.score : parseInt(matchData.score.split('-')[0]) || 0),
          [`gameStats.${matchData.gameId || 'valorant'}.total`]: increment(1),
          [`gameStats.${matchData.gameId || 'valorant'}.wins`]: increment(isWin ? 1 : 0),
          [`gameStats.${matchData.gameId || 'valorant'}.losses`]: increment(isWin ? 0 : 1),
          'gameStats.all.wins': increment(isWin ? 1 : 0),
          previousXp: currentXp,
          xp: newXp,
          level: newLevel,
          rank: newRank
        });
        await updateDoc(doc(db, 'users_public', user.uid), {
          rank: newRank,
          level: newLevel,
          xp: newXp
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }

      // Add notification
      const notificationRef = doc(collection(db, 'notifications'));
      try {
        await setDoc(notificationRef, {
          userId: user.uid,
          title: 'Match Recorded',
          message: `Match in ${matchData.gameId || 'Valorant'} has been saved.`,
          type: 'match',
          read: false,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `notifications/${notificationRef.id}`);
      }

      setIsAddMatchOpen(false);
      setNewMatch({ opponent: '', myScore: '', opponentScore: '', gameId: 'tictactoe' });
    } catch (err) {
      console.error("Error saving match:", err);
    } finally {
      setSavingMatch(false);
    }
  };

  const handleGameComplete = async (result: 'Win' | 'Loss', score: number, metrics: any) => {
    if (!user || !currentGame) return;
    
    const xpGained = result === 'Win' ? 100 : 25;
    const rankChange = result === 'Win' ? 15 : -5;

    const matchData = {
      userId: user.uid,
      gameId: currentGame,
      opponent: currentGame === 'tictactoe' ? 'AI' : 'System',
      score: score.toString(),
      result,
      duration: metrics.duration ? `${metrics.duration}s` : '0s',
      date: new Date().toLocaleDateString(),
      mode: 'Ranked',
      xpGained,
      rankChange,
      metrics,
      timestamp: serverTimestamp()
    };

    setGameResult({ ...matchData, xpGained, rankChange });
    await handleSaveMatch(matchData);
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as FirebaseUser);
        setAuthState('authenticated');
        
        // Fetch user preferences (like theme color) from Firestore
        try {
          console.log("Fetching user doc for:", firebaseUser.uid);
          if (!firebaseUser.uid) {
            console.error("firebaseUser.uid is undefined!");
            return;
          }
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            console.log("User doc exists");
            const data = userDoc.data();
            if (data.themeColor) setThemeColor(data.themeColor);
            
            // Ensure users_public exists
            const publicDoc = await getDoc(doc(db, 'users_public', firebaseUser.uid));
            if (!publicDoc.exists()) {
              console.log("Creating public doc for:", firebaseUser.uid);
              await setDoc(doc(db, 'users_public', firebaseUser.uid), {
                username: data.username,
                avatar: data.avatar,
                rank: data.rank,
                level: data.level,
                xp: data.xp
              });
            }
          } else {
            console.log("User doc does not exist, creating new user");
            // Create user document for new users (including anonymous)
            const userData = {
              uid: firebaseUser.uid,
              username: firebaseUser.isAnonymous ? 'Guest Player' : (firebaseUser.displayName || 'Warrior'),
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              rank: 'Bronze',
              level: 1,
              xp: 0,
              stats: {
                matchesPlayed: 0,
                winRate: 0,
                kdRatio: 0,
                avgScore: 0
              },
              themeColor: '#00E5FF',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            await setDoc(doc(db, 'users_public', firebaseUser.uid), {
              username: userData.username,
              avatar: userData.avatar,
              rank: userData.rank,
              level: userData.level,
              xp: userData.xp
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        if (authState === 'authenticated') setAuthState('landing');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply theme color to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', themeColor);
  }, [themeColor]);

  const handleAuthSuccess = () => {
    setAuthState('authenticated');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setAuthState('landing');
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const renderAuthScreen = () => {
    switch (authState) {
      case 'landing':
        return (
          <Landing 
            onGetStarted={() => setAuthState('signup')} 
            onLogin={() => setAuthState('login')} 
          />
        );
      case 'login':
        return (
          <Login 
            onBack={() => setAuthState('landing')} 
            onLogin={handleAuthSuccess} 
            onSignUp={() => setAuthState('signup')}
            onGuest={handleAuthSuccess}
          />
        );
      case 'signup':
        return (
          <SignUp 
            onBack={() => setAuthState('landing')} 
            onSignUp={handleAuthSuccess} 
            onLogin={() => setAuthState('login')}
          />
        );
      default:
        return null;
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onPlayGame={setCurrentGame} />;
      case 'games':
        return <Games onPlay={setCurrentGame} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'stats':
        return <Stats />;
      case 'matches':
        return <Matches />;
      case 'profile':
        return <Profile onThemeChange={setThemeColor} currentTheme={themeColor} onLogout={handleLogout} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 blur-md animate-pulse" />
          </div>
        </div>
        <p className="text-primary font-display font-bold tracking-widest animate-pulse">STAT ARENA</p>
      </div>
    );
  }

  if (authState !== 'authenticated') {
    return (
      <AnimatePresence mode="wait">
        {renderAuthScreen()}
      </AnimatePresence>
    );
  }

  return (
    <div style={{ '--color-primary': themeColor } as React.CSSProperties}>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddMatch={() => setIsAddMatchOpen(true)}
      >
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>

        {/* Game Overlay */}
        <AnimatePresence>
          {currentGame && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 z-50 bg-background"
            >
              {currentGame === 'tictactoe' && <TicTacToe onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />}
              {currentGame === 'reaction' && <ReactionTap onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />}
              {currentGame === 'quiz' && <Quiz onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />}
              {currentGame === 'whack' && <WhackAMole onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />}
              {currentGame === 'rps' && <RockPaperScissors onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />}
              {currentGame === 'memory' && <MemoryMatch onComplete={handleGameComplete} onBack={() => setCurrentGame(null)} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Result Overlay */}
        <AnimatePresence>
          {gameResult && (
            <GameResult 
              result={gameResult.result}
              score={parseInt(gameResult.score)}
              xpGained={gameResult.xpGained}
              rankChange={gameResult.rankChange}
              hasLeveledUp={gameResult.hasLeveledUp}
              newRank={gameResult.newRank}
              newLevel={gameResult.newLevel}
              onPlayAgain={() => {
                const gameId = gameResult.gameId;
                console.log("Play Again clicked for:", gameId);
                setGameResult(null);
                setCurrentGame(null);
                setTimeout(() => {
                  console.log("Setting currentGame to:", gameId);
                  setCurrentGame(gameId);
                }, 100);
              }}
              onViewStats={() => {
                console.log("View Stats clicked");
                setGameResult(null);
                setCurrentGame(null);
                setActiveTab('stats');
              }}
              onGoHome={() => {
                setGameResult(null);
                setCurrentGame(null);
                setActiveTab('dashboard');
              }}
            />
          )}
        </AnimatePresence>

        {/* Add Match Modal */}
      <AnimatePresence>
        {isAddMatchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass w-full max-w-sm rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-xl font-display font-bold">Add New Match</h2>
              <p className="text-[10px] text-white/40 font-mono">Manually record a match played outside the app or for testing progression.</p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-mono">Select Game</label>
                  <select 
                    value={newMatch.gameId}
                    onChange={(e) => setNewMatch({...newMatch, gameId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white appearance-none"
                  >
                    <option value="tictactoe" className="bg-background">Tic Tac Toe</option>
                    <option value="quiz" className="bg-background">Brain Quiz</option>
                    <option value="reaction" className="bg-background">Reaction Tap</option>
                    <option value="whack" className="bg-background">Whack-a-Mole</option>
                    <option value="rps" className="bg-background">Rock Paper Scissors</option>
                    <option value="memory" className="bg-background">Memory Match</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase font-mono">Opponent Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ALPHA_TEAM" 
                    value={newMatch.opponent}
                    onChange={(e) => setNewMatch({...newMatch, opponent: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Your Score</label>
                    <input 
                      type="number" 
                      placeholder="15" 
                      value={newMatch.myScore}
                      onChange={(e) => setNewMatch({...newMatch, myScore: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase font-mono">Opponent Score</label>
                    <input 
                      type="number" 
                      placeholder="12" 
                      value={newMatch.opponentScore}
                      onChange={(e) => setNewMatch({...newMatch, opponentScore: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAddMatchOpen(false)}
                  disabled={savingMatch}
                  className="flex-1 py-3 rounded-xl glass text-sm font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveMatch()}
                  disabled={savingMatch || !newMatch.opponent || !newMatch.myScore || !newMatch.opponentScore}
                  className="flex-1 py-3 rounded-xl bg-primary text-background text-sm font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingMatch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Match'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
    </div>
  );
}
