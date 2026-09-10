/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Compass, Shield, User, LogOut, Loader2 } from 'lucide-react';
import { auth, db, signInWithPopup, signOut, doc, getDoc, setDoc } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProfile } from './types';
import { seedDemoData } from './lib/seed';
import ClockPanel from './components/ClockPanel';
import AttendanceList from './components/AttendanceList';
import WorkHoursCalculator from './components/WorkHoursCalculator';
import KanbanBoard from './components/KanbanBoard';
import RFIBoard from './components/RFIBoard';
import { backendUp, apiLogin, apiChangePassword, getSession, setSession, Session, DemoData } from './lib/api';
import AdminSetup from './components/AdminSetup';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [forcePw, setForcePw] = useState<Session | null>(null);
  const [newPw, setNewPw] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState<'clock' | 'hours' | 'kanban' | 'rfi' | 'admin'>('clock');

  useEffect(() => {
    const s = getSession();
    if (s && !s.mustChange) {
      setUser({ uid: s.uid } as any);
      setProfile({ uid: s.uid, displayName: s.displayName, email: '', role: s.role as any, office: s.tenantName });
      setLoading(false);
      return;
    }
    if (s?.mustChange) {
      setForcePw(s);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth as any, async (firebaseUser: any) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
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

  const applySession = (s: Session) => {
    setSession(s);
    setUser({ uid: s.uid } as any);
    setProfile({ uid: s.uid, displayName: s.displayName, email: '', role: s.role as any, office: s.tenantName });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (await backendUp()) {
      if (!account.trim() || !password) return;
      try {
        const s = await apiLogin(account.trim(), password);
        if (s.demoData) {
          seedDemoDataFromBackend(s.demoData);
        }
        if (s.mustChange) {
          setSession(s);
          setForcePw(s);
        } else {
          applySession(s);
        }
      } catch (err: any) {
        setLoginError(err.message);
      }
      return;
    }
    // 後端沒開時退回舊單機模式
    if (!account.trim()) return;
    try {
      (auth as any).signIn(account.trim(), 'staff', '');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const seedDemoDataFromBackend = (data: DemoData) => {
    localStorage.setItem('archclock_projects', JSON.stringify(data.projects));
    localStorage.setItem('archclock_kanban_tasks', JSON.stringify(data.kanban));
    localStorage.setItem('archclock_rfi', JSON.stringify(data.rfis));
  };

  const handleLogout = async () => {
    setSession(null);
    setForcePw(null);
    try { await signOut(auth); } catch {}
  };

  const handleForcePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!forcePw) return;
    if (!newAccount.trim()) { setPwError('請輸入新帳號'); return; }
    if (newPw.length < 4) { setPwError('新密碼至少 4 碼'); return; }
    try {
      const r = await apiChangePassword(forcePw.uid, (document.getElementById('oldPw') as HTMLInputElement)?.value || '', newPw, newAccount.trim());
      const s = { ...forcePw, uid: r.uid || newAccount.trim(), mustChange: false };
      setForcePw(null);
      setNewPw('');
      setNewAccount('');
      applySession(s);
    } catch (err: any) {
      setPwError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neutral-900 animate-spin" />
      </div>
    );
  }

  if (forcePw) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-6">
        <form onSubmit={handleForcePw} className="w-full max-w-sm bg-white p-8 border border-neutral-200 shadow-sm rounded-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium uppercase tracking-wider">首次登入設定</h2>
            <p className="text-xs text-neutral-500">帳號 {forcePw.uid} 使用初始密碼，請先設定自己的帳號與密碼</p>
          </div>
          <input id="oldPw" type="password" required placeholder="舊密碼（admin）"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm" />
          <input type="text" required placeholder="新帳號（例如 yourname）" value={newAccount} onChange={(e) => setNewAccount(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm" />
          <input type="password" required placeholder="新密碼（至少 4 碼）" value={newPw} onChange={(e) => setNewPw(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 rounded-sm" />
          {pwError && <p className="text-xs text-red-600 text-center">{pwError}</p>}
          <button className="w-full py-4 bg-neutral-900 text-white text-sm font-medium uppercase tracking-[0.2em] rounded-sm">確認並進入系統</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
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
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors" title="Sign Out">
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
                <h2 className="text-lg font-medium text-neutral-900 mb-6 uppercase tracking-wider text-center">登入</h2>
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">帳號</label>
                    <input type="text" required placeholder="admin 或 demo" value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">密碼</label>
                    <input type="password" required placeholder="admin 或 demo" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors rounded-sm" />
                  </div>
                  {loginError && <p className="text-xs text-red-600 text-center">{loginError}</p>}
                  <button type="submit"
                    className="w-full flex items-center justify-center space-x-3 py-4 bg-neutral-900 text-white text-sm font-medium uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all rounded-sm shadow-xl shadow-neutral-200">
                    <LogIn className="h-4 w-4" />
                    <span>進入系統</span>
                  </button>
                </form>
              </div>
              <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-400">
                <Shield className="h-3 w-3" />
                <span>Secure Enterprise Access</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mx-auto space-y-8 transition-all duration-300 ${activeTab === 'clock' || activeTab === 'hours' ? 'max-w-4xl' : 'max-w-7xl'}`}
            >
              <div className="flex justify-center space-x-8 border-b border-neutral-200 pb-px">
                {(['clock', 'hours', 'kanban', 'rfi'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}>
                    {{ clock: '打卡與記錄', hours: '工時統計', kanban: '專案管理', rfi: 'RFI追蹤' }[tab]}
                    {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
                  </button>
                ))}
                {profile?.role === 'admin' && (
                  <button onClick={() => setActiveTab('admin')}
                    className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'admin' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}`}>
                    設定
                    {activeTab === 'admin' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
                  </button>
                )}
              </div>
              <div className="pt-4">
                {activeTab === 'clock' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="order-1"><ClockPanel user={profile!} /></div>
                    <div className="order-2"><AttendanceList userId={user.uid} /></div>
                  </div>
                ) : activeTab === 'hours' ? (
                  <WorkHoursCalculator userId={user.uid} />
                ) : activeTab === 'kanban' ? (
                  <KanbanBoard />
                ) : activeTab === 'rfi' ? (
                  <RFIBoard />
                ) : (
                  <AdminSetup />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer className="fixed bottom-6 left-6 text-[10px] uppercase tracking-[0.4em] text-neutral-300 font-bold vertical-text hidden sm:block">
        Architecture Attendance & Engineering Log v1.0
      </footer>
    </div>
  );
}
