import { Player, Match, Achievement, Mission } from './types';

export const currentUser: Player = {
  id: '1',
  username: 'CYBER_PUNK',
  avatar: 'https://picsum.photos/seed/cyber/200/200',
  rank: 'Diamond',
  xp: 75,
  level: 42,
  winRate: 68.5,
  matchesPlayed: 1240,
  streak: 5,
  avgScore: 2450,
  score: 15420,
  rankMovement: 'up',
};

export const leaderboardData: Player[] = [
  {
    id: '2',
    username: 'NEON_GHOST',
    avatar: 'https://picsum.photos/seed/ghost/200/200',
    rank: 'Master',
    xp: 90,
    level: 55,
    winRate: 72.1,
    matchesPlayed: 2100,
    streak: 12,
    avgScore: 2800,
    score: 18200,
    rankMovement: 'up',
  },
  {
    id: '3',
    username: 'VOID_WALKER',
    avatar: 'https://picsum.photos/seed/void/200/200',
    rank: 'Master',
    xp: 85,
    level: 52,
    winRate: 70.5,
    matchesPlayed: 1850,
    streak: 8,
    avgScore: 2750,
    score: 17500,
    rankMovement: 'down',
  },
  {
    id: '4',
    username: 'STORM_EYE',
    avatar: 'https://picsum.photos/seed/storm/200/200',
    rank: 'Diamond',
    xp: 95,
    level: 48,
    winRate: 65.2,
    matchesPlayed: 1500,
    streak: 3,
    avgScore: 2300,
    score: 16100,
    rankMovement: 'stable',
  },
  { ...currentUser, rankMovement: 'up' },
  {
    id: '5',
    username: 'BLADE_RUNNER',
    avatar: 'https://picsum.photos/seed/blade/200/200',
    rank: 'Diamond',
    xp: 40,
    level: 40,
    winRate: 62.8,
    matchesPlayed: 1100,
    streak: 2,
    avgScore: 2200,
    score: 14800,
    rankMovement: 'down',
  },
  {
    id: '6',
    username: 'ZENITH',
    avatar: 'https://picsum.photos/seed/zenith/200/200',
    rank: 'Platinum',
    xp: 80,
    level: 38,
    winRate: 58.4,
    matchesPlayed: 950,
    streak: 1,
    avgScore: 2100,
    score: 13500,
    rankMovement: 'up',
  },
];

export const matchHistory: Match[] = [
  {
    id: 'm1',
    userId: '1',
    gameId: 'valorant',
    opponent: 'ALPHA_TEAM',
    score: '15 - 12',
    result: 'Win',
    duration: '24:15',
    date: '2024-03-28',
    mode: 'Ranked 5v5',
  },
  {
    id: 'm2',
    userId: '1',
    gameId: 'valorant',
    opponent: 'OMEGA_SQUAD',
    score: '10 - 15',
    result: 'Loss',
    duration: '18:40',
    date: '2024-03-27',
    mode: 'Ranked 5v5',
  },
  {
    id: 'm3',
    userId: '1',
    gameId: 'valorant',
    opponent: 'TEAM_X',
    score: '15 - 8',
    result: 'Win',
    duration: '21:10',
    date: '2024-03-26',
    mode: 'Ranked 5v5',
  },
  {
    id: 'm4',
    userId: '1',
    gameId: 'valorant',
    opponent: 'GHOST_OPS',
    score: '15 - 14',
    result: 'Win',
    duration: '28:50',
    date: '2024-03-25',
    mode: 'Ranked 5v5',
  },
];

export const performanceData = [
  { day: 'Mon', score: 2100 },
  { day: 'Tue', score: 2350 },
  { day: 'Wed', score: 2200 },
  { day: 'Thu', score: 2600 },
  { day: 'Fri', score: 2450 },
  { day: 'Sat', score: 2800 },
  { day: 'Sun', score: 2450 },
];

export const skillData = [
  { subject: 'Aim', A: 120, fullMark: 150 },
  { subject: 'Tactics', A: 98, fullMark: 150 },
  { subject: 'Teamwork', A: 86, fullMark: 150 },
  { subject: 'Speed', A: 99, fullMark: 150 },
  { subject: 'Utility', A: 85, fullMark: 150 },
  { subject: 'Clutch', A: 65, fullMark: 150 },
];

export const winLossData = [
  { name: 'Wins', value: 68.5, color: '#00FF9C' },
  { name: 'Losses', value: 31.5, color: '#FF4D4D' },
];

export const achievements: Achievement[] = [
  { id: 'a1', title: 'Top Player', description: 'Reach top 100 global', icon: 'Trophy', unlocked: true },
  { id: 'a2', title: 'Streak Master', description: 'Win 10 matches in a row', icon: 'Flame', unlocked: true },
  { id: 'a3', title: 'Fast Climber', description: 'Rank up twice in a week', icon: 'Zap', unlocked: false },
  { id: 'a4', title: 'Headshot King', description: '70% headshot ratio', icon: 'Target', unlocked: true },
];

export const missions: Mission[] = [
  { id: 'mi1', title: 'Win 3 matches today', progress: 2, total: 3, reward: '500 XP' },
  { id: 'mi2', title: 'Reach top 10', progress: 12, total: 10, reward: '1000 XP' },
];
