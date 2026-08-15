/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'architect' | 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  office?: string;
}

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  siteName?: string;
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  timestamp: any; // Firestore Timestamp
  type: 'clock_in' | 'clock_out';
  isField: boolean;
  location?: AttendanceLocation;
  note?: string;
}
