/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { format, isSameWeek, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Clock, Calendar, BarChart2 } from 'lucide-react';
import { db, query, collection, where, orderBy, onSnapshot } from '../lib/firebase';
import { AttendanceRecord } from '../types';

interface WorkHoursCalculatorProps {
  userId: string;
}

interface DailySummary {
  dateStr: string;
  hours: number;
  clockInTime: string;
  clockOutTime: string;
  isCurrentlyClockedIn: boolean;
}

export default function WorkHoursCalculator({ userId }: WorkHoursCalculatorProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeNow, setTimeNow] = useState(new Date());

  // Keep a ticking clock for active clock-in duration calculations
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'attendance'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      setRecords(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Process attendance records to calculate daily summaries
  const getDailySummaries = (): DailySummary[] => {
    const groupedByDay: { [dateStr: string]: AttendanceRecord[] } = {};
    
    records.forEach(rec => {
      if (!rec.timestamp) return;
      const date = rec.timestamp.toDate();
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!groupedByDay[dateStr]) {
        groupedByDay[dateStr] = [];
      }
      groupedByDay[dateStr].push(rec);
    });

    return Object.keys(groupedByDay).map(dateStr => {
      // Sort day's records chronologically
      const dayRecords = [...groupedByDay[dateStr]].sort(
        (a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
      );

      let totalMs = 0;
      let activeClockIn: Date | null = null;
      let clockInTime = '--:--';
      let clockOutTime = '--:--';
      let isCurrentlyClockedIn = false;

      dayRecords.forEach(rec => {
        const recTimeStr = format(rec.timestamp.toDate(), 'HH:mm');
        if (rec.type === 'clock_in') {
          activeClockIn = rec.timestamp.toDate();
          if (clockInTime === '--:--') {
            clockInTime = recTimeStr;
          }
          isCurrentlyClockedIn = true;
        } else if (rec.type === 'clock_out') {
          clockOutTime = recTimeStr;
          isCurrentlyClockedIn = false;
          if (activeClockIn) {
            totalMs += rec.timestamp.toDate().getTime() - activeClockIn.getTime();
            activeClockIn = null;
          }
        }
      });

      // If user is currently clocked in, add time from that clock-in to "now"
      if (activeClockIn) {
        // Only add active time if the clock-in is on the same day as dateStr
        const todayStr = format(timeNow, 'yyyy-MM-dd');
        if (dateStr === todayStr) {
          totalMs += timeNow.getTime() - activeClockIn.getTime();
        }
      }

      const hours = totalMs / (1000 * 60 * 60);

      return {
        dateStr,
        hours: parseFloat(hours.toFixed(2)),
        clockInTime,
        clockOutTime,
        isCurrentlyClockedIn
      };
    }).sort((a, b) => b.dateStr.localeCompare(a.dateStr)); // Newest first
  };

  const dailySummaries = getDailySummaries();

  // Calculate statistics
  const todayStr = format(timeNow, 'yyyy-MM-dd');
  const todaySummary = dailySummaries.find(s => s.dateStr === todayStr);
  const todayHours = todaySummary ? todaySummary.hours : 0;

  const thisWeekSummaries = dailySummaries.filter(s => {
    try {
      const date = parseISO(s.dateStr);
      return isSameWeek(date, timeNow, { weekStartsOn: 1 }); // Monday start
    } catch {
      return false;
    }
  });
  
  const weeklyHours = parseFloat(
    thisWeekSummaries.reduce((sum, s) => sum + s.hours, 0).toFixed(2)
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200 p-5 shadow-sm rounded-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">今日工時</span>
            <Clock className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-light tracking-tight text-neutral-900">{todayHours}</span>
            <span className="text-xs text-neutral-400">小時</span>
          </div>
          {todaySummary?.isCurrentlyClockedIn && (
            <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 bg-green-50 border border-green-100 text-green-700 font-medium rounded-sm animate-pulse">
              計算中 (已登入)
            </span>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-neutral-200 p-5 shadow-sm rounded-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">本週總工時</span>
            <BarChart2 className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-light tracking-tight text-neutral-900">{weeklyHours}</span>
            <span className="text-xs text-neutral-400">小時</span>
          </div>
          <span className="block mt-2 text-[10px] text-neutral-400">
            週一至週日累計
          </span>
        </motion.div>
      </div>

      {/* Daily Breakdown List */}
      <div className="bg-white border border-neutral-200 shadow-sm rounded-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Daily Working Hours</h3>
        </div>

        <div className="space-y-4">
          {dailySummaries.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-sm italic">
              目前無打卡資料可進行計算。
            </div>
          ) : (
            dailySummaries.map((summary) => (
              <div 
                key={summary.dateStr} 
                className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0"
              >
                <div>
                  <h4 className="text-sm font-medium text-neutral-900">
                    {format(parseISO(summary.dateStr), 'yyyy年MM月dd日 (E)', { locale: zhTW })}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 flex items-center space-x-2">
                    <span>上班: {summary.clockInTime}</span>
                    <span>•</span>
                    <span>下班: {summary.clockOutTime}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-light text-neutral-950">{summary.hours}</span>
                  <span className="text-[10px] text-neutral-400 ml-1">hr</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
