/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Mock Firestore Timestamp
export class MockTimestamp {
  private date: Date;
  constructor(dateInput?: any) {
    if (dateInput) {
      this.date = new Date(dateInput);
    } else {
      this.date = new Date();
    }
  }
  toDate() {
    return this.date;
  }
}

// Global listener registry for Firestore onSnapshot triggers
const dbListeners: Array<() => void> = [];

function notifyDbChange() {
  dbListeners.forEach(listener => listener());
}

// Mock database functions
export const db = {};

export function doc(database: any, collectionName: string, id: string) {
  return { collectionName, id };
}

export async function getDoc(docRef: { collectionName: string; id: string }) {
  const dataStr = localStorage.getItem(`archclock_${docRef.collectionName}_${docRef.id}`);
  return {
    exists: () => dataStr !== null,
    data: () => (dataStr ? JSON.parse(dataStr) : null),
  };
}

export async function setDoc(docRef: { collectionName: string; id: string }, data: any) {
  localStorage.setItem(`archclock_${docRef.collectionName}_${docRef.id}`, JSON.stringify(data));
  notifyDbChange();
}

export function collection(database: any, collectionName: string) {
  return { collectionName };
}

export async function addDoc(collectionRef: { collectionName: string }, data: any) {
  const listStr = localStorage.getItem(`archclock_${collectionRef.collectionName}`) || '[]';
  const list = JSON.parse(listStr);
  
  // Format the data, replacing serverTimestamp placeholder with real ISO string
  const formattedData = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  
  const newDoc = {
    id: Math.random().toString(36).substring(2, 9),
    ...formattedData
  };
  
  list.push(newDoc);
  localStorage.setItem(`archclock_${collectionRef.collectionName}`, JSON.stringify(list));
  
  notifyDbChange();
  return { id: newDoc.id };
}

export function query(collectionRef: { collectionName: string }, ...constraints: any[]) {
  return { collectionName: collectionRef.collectionName, constraints };
}

export function where(field: string, operator: string, value: any) {
  return { type: 'where', field, operator, value };
}

export function orderBy(field: string, direction: string = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(value: number) {
  return { type: 'limit', value };
}

export function onSnapshot(queryRef: { collectionName: string; constraints: any[] }, callback: (snapshot: any) => void) {
  const runQuery = () => {
    const listStr = localStorage.getItem(`archclock_${queryRef.collectionName}`) || '[]';
    let list = JSON.parse(listStr);
    
    // Apply constraints (filtering by userId, ordering, limit)
    queryRef.constraints.forEach(constraint => {
      if (constraint.type === 'where' && constraint.field === 'userId' && constraint.operator === '==') {
        list = list.filter((item: any) => item.userId === constraint.value);
      }
    });

    // Order by timestamp desc
    list.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    const limitConstraint = queryRef.constraints.find(c => c.type === 'limit');
    if (limitConstraint) {
      list = list.slice(0, limitConstraint.value);
    }

    // Map docs to simulate Firestore snapshot docs
    const docs = list.map((item: any) => ({
      id: item.id,
      data: () => ({
        ...item,
        timestamp: new MockTimestamp(item.timestamp)
      })
    }));

    callback({ docs });
  };

  // Run once initially
  runQuery();

  // Register listener for database changes
  dbListeners.push(runQuery);

  // Return unsubscribe function
  return () => {
    const index = dbListeners.indexOf(runQuery);
    if (index > -1) {
      dbListeners.splice(index, 1);
    }
  };
}

export function serverTimestamp() {
  return 'SERVER_TIMESTAMP_PLACEHOLDER';
}

// Mock Auth system
class MockAuth {
  private listeners: Array<(user: any) => void> = [];
  currentUser: any = null;

  constructor() {
    const stored = localStorage.getItem('archclock_user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    // Notify immediately with current state asynchronously
    setTimeout(() => {
      callback(this.currentUser);
    }, 10);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  triggerChange() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  signIn(displayName: string, role: string, office: string) {
    const user = {
      uid: 'local-user-id',
      displayName,
      email: 'local@office.lan',
      role,
      office,
    };
    this.currentUser = user;
    localStorage.setItem('archclock_user', JSON.stringify(user));
    
    // Save to user profile collection too
    localStorage.setItem('archclock_users_local-user-id', JSON.stringify({
      uid: 'local-user-id',
      displayName,
      email: 'local@office.lan',
      role,
      office,
    }));

    this.triggerChange();
    return user;
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('archclock_user');
    this.triggerChange();
  }
}

export const auth = new MockAuth();
export const googleProvider = {};

export async function signInWithPopup(authInstance: any, provider: any) {
  // Not used directly as we will implement custom form login
  throw new Error('Please sign in using the local registration form.');
}

export async function signOut(authInstance: any) {
  auth.signOut();
}

