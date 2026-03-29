export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export interface Player {
  id: string;
  username: string;
  avatar: string;
  rank: Rank;
  xp: number;
  level: number;
  winRate: number;
  matchesPlayed: number;
  streak: number;
  avgScore: number;
  score: number;
  rankMovement: 'up' | 'down' | 'stable';
}

export interface Match {
  id: string;
  userId: string;
  opponent: string;
  score: string;
  result: 'Win' | 'Loss';
  duration: string;
  date: string;
  mode: string;
  gameId: string;
  xpGained?: number;
  rankChange?: number;
  metrics?: {
    accuracy?: number;
    reactionTime?: number;
    moves?: number;
  };
}

export interface User {
  uid: string;
  username: string;
  email: string;
  avatar: string;
  rank: Rank;
  level: number;
  xp: number;
  stats: {
    matchesPlayed: number;
    winRate: number;
    avgScore: number;
  };
  gameStats?: {
    [gameId: string]: {
      wins: number;
      losses: number;
      bestScore: number;
      totalPlayed: number;
    };
  };
  themeColor: string;
  badges?: string[];
  favoriteGame?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Mission {
  id: string;
  title: string;
  progress: number;
  total: number;
  reward: string;
}
