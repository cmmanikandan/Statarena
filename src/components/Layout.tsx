import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Trophy, BarChart3, History, User, Plus, Bell, X, Gamepad2, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddMatch: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, onAddMatch }: LayoutProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(docs);
      setHasUnread(docs.some((n: any) => !n.read));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, []);

  const markAllRead = async () => {
    if (!auth.currentUser) return;
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, 'notifications', id));
  };

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'games', icon: Gamepad2, label: 'Games' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'matches', icon: History, label: 'Matches' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      {/* Top Bar (Optional, for notifications) */}
      <div className="absolute top-6 right-6 z-40">
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="p-2 rounded-full glass relative"
        >
          <Bell className={cn("w-5 h-5 transition-colors", hasUnread ? "text-primary" : "text-white/60")} />
          {hasUnread && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-background shadow-[0_0_5px_#00E5FF]" />
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute top-20 right-6 w-72 glass rounded-2xl p-4 z-50 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-sm">Notifications</h3>
              {hasUnread && (
                <button 
                  onClick={markAllRead}
                  className="text-[10px] text-primary font-bold uppercase hover:underline"
                >
                  Mark All Read
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/20 text-xs italic">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-3 rounded-xl border transition-colors relative group", 
                      !n.read ? "bg-primary/5 border-primary/20" : "bg-white/5 border-white/5"
                    )}
                  >
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white/20 hover:text-white/60" />
                    </button>
                    <div className="text-xs font-bold">{n.title}</div>
                    <div className="text-[10px] text-white/50">{n.message}</div>
                    <div className="text-[8px] text-white/30 mt-1 font-mono">
                      {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onAddMatch}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.5)] z-20"
      >
        <Plus className="text-background w-8 h-8" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="h-20 glass border-t border-white/10 flex items-center justify-around px-4 z-30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center relative group"
          >
            <tab.icon
              className={cn(
                "w-6 h-6 transition-colors duration-300",
                activeTab === tab.id ? "text-primary" : "text-white/40 group-hover:text-white/60"
              )}
            />
            <span
              className={cn(
                "text-[10px] mt-1 font-medium transition-colors duration-300",
                activeTab === tab.id ? "text-primary" : "text-white/40 group-hover:text-white/60"
              )}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_#00E5FF]"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
