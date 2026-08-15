/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, LogIn, LogOut, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, auth, addDoc, collection, serverTimestamp } from '../lib/firebase';
import { UserProfile, AttendanceLocation } from '../types';

interface ClockPanelProps {
  user: UserProfile;
}

export default function ClockPanel({ user }: ClockPanelProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isField, setIsField] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [note, setNote] = useState('');
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  };

  const handleClockAction = async (type: 'clock_in' | 'clock_out') => {
    setLoading(true);
    setStatus(null);

    try {
      let location: AttendanceLocation | undefined;
      
      try {
        const pos = await getPosition();
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          siteName: isField ? siteName : 'Office',
        };
      } catch (err) {
        console.error('Location error:', err);
        if (isField) {
          throw new Error('外點打卡需要定位權限。 Please enable location services.');
        }
      }

      await addDoc(collection(db, 'attendance'), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        type,
        isField,
        location,
        note: note.trim() || null,
      });

      setStatus({
        type: 'success',
        message: `${type === 'clock_in' ? '上班' : '下班'}打卡成功！`,
      });
      setSiteName('');
      setNote('');
      setIsField(false);
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || '打卡失敗，請重試。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-neutral-200 p-8 shadow-sm rounded-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-neutral-900 uppercase">
              Attendance System
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Architectural Firm Portal</p>
          </div>
          <div className="h-10 w-10 bg-neutral-900 flex items-center justify-center rounded-full">
            <Clock className="text-white h-5 w-5" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-2 p-3 bg-neutral-50 border border-neutral-100 rounded-sm">
            <div className="flex-1">
              <span className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Authenticated Architect</span>
              <span className="text-sm font-medium text-neutral-800">{user.displayName}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Office</span>
              <span className="text-sm text-neutral-600">{user.office || 'Main Branch'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isField}
                  onChange={(e) => setIsField(e.target.checked)}
                />
                <div className="w-10 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-neutral-900 transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                外點打卡 (Field Site)
              </span>
            </label>

            <AnimatePresence>
              {isField && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  <input
                    type="text"
                    placeholder="輸入工地或建案名稱 (Site Name)"
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              placeholder="備註 (Optional Note)"
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors resize-none h-20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => handleClockAction('clock_in')}
              disabled={loading}
              className="flex flex-col items-center justify-center space-y-1 py-4 bg-neutral-900 text-white text-sm font-medium uppercase tracking-widest hover:bg-neutral-800 disabled:bg-neutral-400 transition-all rounded-sm"
            >
              <div className="flex items-center space-x-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                <span>Clock In</span>
              </div>
              <span className="text-[10px] opacity-70 tracking-normal">上班打卡</span>
            </button>
            <button
              onClick={() => handleClockAction('clock_out')}
              disabled={loading}
              className="flex flex-col items-center justify-center space-y-1 py-4 border border-neutral-900 text-neutral-900 text-sm font-medium uppercase tracking-widest hover:bg-neutral-50 disabled:border-neutral-300 disabled:text-neutral-300 transition-all rounded-sm"
            >
              <div className="flex items-center space-x-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Clock Out</span>
              </div>
              <span className="text-[10px] opacity-70 tracking-normal">下班打卡</span>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center p-4 rounded-sm border ${
              status.type === 'success' 
                ? 'bg-green-50 border-green-100 text-green-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
