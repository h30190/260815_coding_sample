/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Compass, Shield, User, LogOut, Loader2 } from 'lucide-react';
import { auth, db, googleProvider, signInWithPopup, signOut, doc, getDoc, setDoc } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from './types';
import ClockPanel from './components/ClockPanel';
import AttendanceList from './components/AttendanceList';
import WorkHoursCalculator from './components/WorkHoursCalculator';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Custom local profile inputs
  const [name, setName] = useState('');
  const [roleInput, setRoleInput] = useState<'architect' | 'admin' | 'staff'>('architect');
  const [officeInput, setOfficeInput] = useState('Taipei Headquarters');
  const [activeTab, setActiveTab] = useState<'clock' | 'hours'>('clock');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          // Create default profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Architect',
            email: firebaseUser.email || '',
            role: firebaseUser.role || 'architect',
            office: firebaseUser.office || 'Taipei Headquarters'
          };
          await setDoc(profileRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      (auth as any).signIn(name.trim(), roleInput, officeInput);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neutral-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-100 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-neutral-900 flex items-center justify-center rounded-sm">
            <Compass className="text-white h-5 w-5" />
          </div>
          <span className="font-bold tracking-[0.3em] uppercase text-sm">ArchClock</span>
        </div>

        {profile && (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 pr-4 border-r border-neutral-100">
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 leading-none mb-1">{profile.role}</p>
                <p className="text-sm font-medium text-neutral-900 leading-none">{profile.displayName}</p>
              </div>
              <div className="h-8 w-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500">
                <User className="h-4 w-4" />
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </header>

      <main className="pt-24 pb-12 px-6">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto mt-10 text-center space-y-10"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-extralight tracking-tight text-neutral-900 sm:text-5xl uppercase">
                  Design <br /> Discipline
                </h1>
                <p className="text-neutral-500 max-w-xs mx-auto text-sm leading-relaxed">
                  Professional attendance management for architecture and engineering firms.
                </p>
              </div>

              <div className="space-y-4 pt-4 text-left max-w-sm mx-auto bg-white p-8 border border-neutral-200 shadow-sm rounded-sm">
                <h2 className="text-lg font-medium text-neutral-900 mb-6 uppercase tracking-wider text-center">設定個人檔案</h2>
                
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">員工姓名 (Name)</label>
                    <input
                      type="text"
                      required
                      placeholder="例如: James Peng"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">職級 (Role)</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value as any)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm text-neutral-800"
                    >
                      <option value="architect">Architect (建築師)</option>
                      <option value="staff">Staff (員工)</option>
                      <option value="admin">Admin (管理員)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">辦公室 (Office)</label>
                    <input
                      type="text"
                      placeholder="例如: 台北總部"
                      value={officeInput}
                      onChange={(e) => setOfficeInput(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-3 py-4 bg-neutral-900 text-white text-sm font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all rounded-sm shadow-xl shadow-neutral-200"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>進入系統</span>
                  </button>
                </form>
              </div>
                
                <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400">
                  <Shield className="h-3 w-3" />
                  <span>Secure Enterprise Access</span>
                </div>

              <div className="pt-24 grid grid-cols-3 gap-8 opacity-20 grayscale">
                <div className="h-px bg-neutral-900 w-full" />
                <div className="h-px bg-neutral-900 w-full" />
                <div className="h-px bg-neutral-900 w-full" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Tab Selector */}
              <div className="flex justify-center space-x-8 border-b border-neutral-200 pb-px">
                <button
                  onClick={() => setActiveTab('clock')}
                  className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === 'clock' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  打卡與記錄
                  {activeTab === 'clock' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('hours')}
                  className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                    activeTab === 'hours' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  工時統計
                  {activeTab === 'hours' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="pt-4">
                {activeTab === 'clock' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="order-1">
                      <ClockPanel user={profile!} />
                    </div>
                    <div className="order-2">
                      <AttendanceList userId={user.uid} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <WorkHoursCalculator userId={user.uid} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-6 left-6 text-[10px] uppercase tracking-[0.4em] text-neutral-300 font-bold vertical-text hidden sm:block">
        Architecture Attendance & Engineering Log v1.0
      </footer>
    </div>
  );
}
