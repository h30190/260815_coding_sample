/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { motion } from 'motion/react';
import { MapPin, History, ChevronRight } from 'lucide-react';
import { db, query, collection, where, orderBy, limit, onSnapshot } from '../lib/firebase';
import { AttendanceRecord } from '../types';

interface AttendanceListProps {
  userId: string;
}

export default function AttendanceList({ userId }: AttendanceListProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'attendance'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(20)
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

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="flex items-center space-x-2 mb-6 px-1">
        <History className="h-4 w-4 text-neutral-400" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Recent Activity</h3>
      </div>

      <div className="space-y-px bg-neutral-200 border border-neutral-200">
        {records.length === 0 ? (
          <div className="bg-white p-8 text-center text-neutral-400 text-sm italic">
            No records found.
          </div>
        ) : (
          records.map((record) => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={record.id}
              className="bg-white p-4 flex items-center space-x-4 group hover:bg-neutral-50 transition-colors"
            >
              <div className={`w-1 h-10 rounded-full ${record.type === 'clock_in' ? 'bg-green-500' : 'bg-neutral-300'}`} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${record.type === 'clock_in' ? 'text-green-600' : 'text-neutral-500'}`}>
                    {record.type === 'clock_in' ? 'Clock In' : 'Clock Out'}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {record.timestamp ? format(record.timestamp.toDate(), 'HH:mm:ss') : '...'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-neutral-900">
                  <span className="font-medium truncate">
                    {record.timestamp ? format(record.timestamp.toDate(), 'MMM d, yyyy', { locale: zhTW }) : 'Loading...'}
                  </span>
                </div>

                {record.isField && (
                  <div className="flex items-center mt-1 text-[11px] text-neutral-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{record.location?.siteName || 'Unknown Site'}</span>
                  </div>
                )}
              </div>

              <ChevronRight className="h-4 w-4 text-neutral-200 group-hover:text-neutral-400 transition-colors" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
