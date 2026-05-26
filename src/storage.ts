import { 
  UserAuth, 
  BudgetyProfile, 
  Expense, 
  CustomCategory, 
  SavingsGoal, 
  ScratchpadNote, 
  ScratchpadArchive, 
  IOTrackerEntry, 
  PastMonthSummary, 
  SpecialMonthTag, 
  FixedCommitment,
  MonthlyBill
} from './types';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  collection, 
  writeBatch 
} from 'firebase/firestore';

// Default categories as defined by specifications
export const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'cat-food', name: 'Groceries & Food', type: 'Need', monthlyBudgetLimit: 8000 },
  { id: 'cat-transport', name: 'Transport & Fuel', type: 'Need', monthlyBudgetLimit: 3000 },
  { id: 'cat-bills', name: 'Electricity & Bills', type: 'Need', monthlyBudgetLimit: 4000 },
  { id: 'cat-health', name: 'Medical & Health', type: 'Need', monthlyBudgetLimit: 3000 },
  { id: 'cat-education', name: 'School & Education', type: 'Need', monthlyBudgetLimit: 5000 },
  { id: 'cat-shopping', name: 'Clothes & Shopping', type: 'Want', monthlyBudgetLimit: 4000 },
  { id: 'cat-entertainment', name: 'Movies & Entertainment', type: 'Want', monthlyBudgetLimit: 2000 },
  { id: 'cat-snacks', name: 'Tea & Snacks', type: 'Want', monthlyBudgetLimit: 1500 },
  { id: 'cat-eating-out', name: 'Restaurant & Eating Out', type: 'Want', monthlyBudgetLimit: 3000 }
];

const KEYS = {
  USER: 'budgety_user',
  PROFILE: 'budgety_profile',
  EXPENSES: 'budgety_expenses',
  CATEGORIES: 'budgety_categories',
  GOALS: 'budgety_goals',
  NOTES: 'budgety_notes',
  NOTES_ARCHIVE: 'budgety_notes_archive',
  IO_TRACKER: 'budgety_iotracker',
  MONTH_HISTORY: 'budgety_monthhistory',
  SPECIAL_MONTHS: 'budgety_specialmonths',
  BILLS: 'budgety_bills'
};

const getKey = (baseKey: string): string => {
  if (baseKey === 'budgety_user') return 'budgety_user';
  const userStr = localStorage.getItem('budgety_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u && u.email) {
        const safeEmail = u.email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return `${baseKey}_${safeEmail}`;
      }
    } catch {}
  }
  return baseKey;
};

// HELPER: Convert Email string to a safe LocalStorage segment
const getSafeEmailKeySegment = (email: string): string => {
  return email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

// FIRESTORE SYNC: Reconcile list arrays safely to prevent update gaps or orphans
export const syncArrayToFirestore = async <T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  
  const path = `users/${user.uid}/${collectionName}`;
  try {
    const colRef = collection(db, `users/${user.uid}/${collectionName}`);
    // 1. Fetch current remote elements
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(doc => doc.id);
    const incomingIds = new Set(items.map(item => item.id));
    
    const batch = writeBatch(db);
    let actionCount = 0;
    
    // 2. Identify elements deleted locally to remove remotely
    for (const docId of existingIds) {
      if (!incomingIds.has(docId)) {
        const docRef = doc(db, path, docId);
        batch.delete(docRef);
        actionCount++;
      }
    }
    
    // 3. Sync additions & edits
    for (const item of items) {
      const docRef = doc(db, path, item.id);
      batch.set(docRef, item);
      actionCount++;
    }
    
    if (actionCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// FIRESTORE SYNC: Past month summaries (reconciled by monthKey)
export const syncMonthHistoryToFirestore = async (history: PastMonthSummary[]): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/monthhistory`;
  try {
    const colRef = collection(db, `users/${user.uid}/monthhistory`);
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(doc => doc.id);
    const incomingIds = new Set(history.map(item => item.monthKey));

    const batch = writeBatch(db);
    let actionCount = 0;

    for (const docId of existingIds) {
      if (!incomingIds.has(docId)) {
        const docRef = doc(db, path, docId);
        batch.delete(docRef);
        actionCount++;
      }
    }

    for (const item of history) {
      const docRef = doc(db, path, item.monthKey);
      batch.set(docRef, item);
      actionCount++;
    }

    if (actionCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// FIRESTORE SYNC: Special Month Designation tags (reconciled by monthKey)
export const syncSpecialMonthsToFirestore = async (special: SpecialMonthTag[]): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/specialmonths`;
  try {
    const colRef = collection(db, `users/${user.uid}/specialmonths`);
    const snapshot = await getDocs(colRef);
    const existingIds = snapshot.docs.map(doc => doc.id);
    const incomingIds = new Set(special.map(item => item.monthKey));

    const batch = writeBatch(db);
    let actionCount = 0;

    for (const docId of existingIds) {
      if (!incomingIds.has(docId)) {
        const docRef = doc(db, path, docId);
        batch.delete(docRef);
        actionCount++;
      }
    }

    for (const item of special) {
      const docRef = doc(db, path, item.monthKey);
      batch.set(docRef, item);
      actionCount++;
    }

    if (actionCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// FIRESTORE ACTION: Restore all synced collections to LocalStorage scope on login
export const downloadAllAndSyncLocal = async (uid: string, email: string): Promise<boolean> => {
  const safeEmail = getSafeEmailKeySegment(email);
  try {
    const profileDocRef = doc(db, 'users', uid);
    const profileSnap = await getDoc(profileDocRef);
    if (!profileSnap.exists()) {
      return false; // Profile doesn't exist, need onboarding
    }
    
    const profileData = profileSnap.data();
    localStorage.setItem(`${KEYS.PROFILE}_${safeEmail}`, JSON.stringify(profileData));
    
    const [
      expensesSnap,
      categoriesSnap,
      goalsSnap,
      notesArchiveSnap,
      iotrackerSnap,
      billsSnap,
      historySnap,
      specialSnap,
      scratchNoteSnap
    ] = await Promise.all([
      getDocs(collection(db, `users/${uid}/expenses`)),
      getDocs(collection(db, `users/${uid}/categories`)),
      getDocs(collection(db, `users/${uid}/goals`)),
      getDocs(collection(db, `users/${uid}/notes_archive`)),
      getDocs(collection(db, `users/${uid}/iotracker`)),
      getDocs(collection(db, `users/${uid}/bills`)),
      getDocs(collection(db, `users/${uid}/monthhistory`)),
      getDocs(collection(db, `users/${uid}/specialmonths`)),
      getDoc(doc(db, `users/${uid}/notes/scratchpad`))
    ]);

    const expenses = expensesSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.EXPENSES}_${safeEmail}`, JSON.stringify(expenses));

    const categories = categoriesSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.CATEGORIES}_${safeEmail}`, JSON.stringify(categories));

    const goals = goalsSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.GOALS}_${safeEmail}`, JSON.stringify(goals));

    const archive = notesArchiveSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.NOTES_ARCHIVE}_${safeEmail}`, JSON.stringify(archive));

    const iotrack = iotrackerSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.IO_TRACKER}_${safeEmail}`, JSON.stringify(iotrack));

    const bills = billsSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.BILLS}_${safeEmail}`, JSON.stringify(bills));

    const history = historySnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.MONTH_HISTORY}_${safeEmail}`, JSON.stringify(history));

    const special = specialSnap.docs.map(doc => doc.data());
    localStorage.setItem(`${KEYS.SPECIAL_MONTHS}_${safeEmail}`, JSON.stringify(special));

    if (scratchNoteSnap.exists()) {
      localStorage.setItem(`${KEYS.NOTES}_${safeEmail}`, JSON.stringify(scratchNoteSnap.data()));
    } else {
      localStorage.removeItem(`${KEYS.NOTES}_${safeEmail}`);
    }

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
};

export const getUserAuth = (): UserAuth | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setUserAuth = (auth: UserAuth | null): void => {
  if (auth) {
    localStorage.setItem(KEYS.USER, JSON.stringify(auth));
  } else {
    localStorage.removeItem(KEYS.USER);
  }
};

export const getProfile = (): BudgetyProfile | null => {
  const data = localStorage.getItem(getKey(KEYS.PROFILE));
  return data ? JSON.parse(data) : null;
};

export const setProfile = (profile: BudgetyProfile | null): void => {
  if (profile) {
    localStorage.setItem(getKey(KEYS.PROFILE), JSON.stringify(profile));
    const user = auth.currentUser;
    if (user) {
      setDoc(doc(db, 'users', user.uid), profile).catch(err => 
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`)
      );
    }
  } else {
    localStorage.removeItem(getKey(KEYS.PROFILE));
    const user = auth.currentUser;
    if (user) {
      deleteDoc(doc(db, 'users', user.uid)).catch(err =>
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}`)
      );
    }
  }
};

export const getExpenses = (): Expense[] => {
  const data = localStorage.getItem(getKey(KEYS.EXPENSES));
  return data ? JSON.parse(data) : [];
};

export const setExpenses = (expenses: Expense[]): void => {
  const payloadStr = JSON.stringify(expenses);
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('ais-dev-')
  );
  if (isDev && payloadStr.length > 2 * 1024 * 1024) {
    console.warn("Warning: localStorage approaching limit. Consider migrating to IndexedDB.");
  }
  localStorage.setItem(getKey(KEYS.EXPENSES), payloadStr);
  syncArrayToFirestore('expenses', expenses);
};

export const getCategories = (): CustomCategory[] => {
  const data = localStorage.getItem(getKey(KEYS.CATEGORIES));
  if (data) {
    return JSON.parse(data);
  }
  // Initialize with defaults if none exists
  setCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
};

export const setCategories = (categories: CustomCategory[]): void => {
  localStorage.setItem(getKey(KEYS.CATEGORIES), JSON.stringify(categories));
  syncArrayToFirestore('categories', categories);
};

export const getGoals = (): SavingsGoal[] => {
  const data = localStorage.getItem(getKey(KEYS.GOALS));
  return data ? JSON.parse(data) : [];
};

export const setGoals = (goals: SavingsGoal[]): void => {
  localStorage.setItem(getKey(KEYS.GOALS), JSON.stringify(goals));
  syncArrayToFirestore('goals', goals);
};

export const getScratchpadNote = (): ScratchpadNote => {
  const data = localStorage.getItem(getKey(KEYS.NOTES));
  if (data) {
    return JSON.parse(data);
  }
  const defaultNote = { content: '', timestamp: '' };
  setScratchpadNote(defaultNote);
  return defaultNote;
};

export const setScratchpadNote = (note: ScratchpadNote): void => {
  localStorage.setItem(getKey(KEYS.NOTES), JSON.stringify(note));
  const user = auth.currentUser;
  if (user) {
    setDoc(doc(db, `users/${user.uid}/notes/scratchpad`), note).catch(err =>
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/notes/scratchpad`)
    );
  }
};

export const getScratchpadArchive = (): ScratchpadArchive[] => {
  const data = localStorage.getItem(getKey(KEYS.NOTES_ARCHIVE));
  return data ? JSON.parse(data) : [];
};

export const setScratchpadArchive = (archive: ScratchpadArchive[]): void => {
  localStorage.setItem(getKey(KEYS.NOTES_ARCHIVE), JSON.stringify(archive));
  syncArrayToFirestore('notes_archive', archive);
};

export const getIOTracker = (): IOTrackerEntry[] => {
  const data = localStorage.getItem(getKey(KEYS.IO_TRACKER));
  return data ? JSON.parse(data) : [];
};

export const setIOTracker = (entries: IOTrackerEntry[]): void => {
  localStorage.setItem(getKey(KEYS.IO_TRACKER), JSON.stringify(entries));
  syncArrayToFirestore('iotracker', entries);
};

export const getMonthlyBills = (): MonthlyBill[] => {
  const data = localStorage.getItem(getKey(KEYS.BILLS));
  return data ? JSON.parse(data) : [];
};

export const setMonthlyBills = (bills: MonthlyBill[]): void => {
  localStorage.setItem(getKey(KEYS.BILLS), JSON.stringify(bills));
  syncArrayToFirestore('bills', bills);
};

export const getMonthHistory = (): PastMonthSummary[] => {
  const data = localStorage.getItem(getKey(KEYS.MONTH_HISTORY));
  return data ? JSON.parse(data) : [];
};

export const setMonthHistory = (history: PastMonthSummary[]): void => {
  localStorage.setItem(getKey(KEYS.MONTH_HISTORY), JSON.stringify(history));
  syncMonthHistoryToFirestore(history);
};

export const getSpecialMonths = (): SpecialMonthTag[] => {
  const data = localStorage.getItem(getKey(KEYS.SPECIAL_MONTHS));
  return data ? JSON.parse(data) : [];
};

export const setSpecialMonths = (special: SpecialMonthTag[]): void => {
  localStorage.setItem(getKey(KEYS.SPECIAL_MONTHS), JSON.stringify(special));
  syncSpecialMonthsToFirestore(special);
};

// Check if scratchpad note requires archiving due to three-day-rule
export const checkAndArchiveScratchpad = () => {
  const currentNote = getScratchpadNote();
  if (!currentNote.content.trim() || !currentNote.timestamp) return;

  const noteDate = new Date(currentNote.timestamp);
  const now = new Date();
  
  // Difference in days
  const diffTime = Math.abs(now.getTime() - noteDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 3) {
    // Archive
    const archive = getScratchpadArchive();
    const dateStr = currentNote.timestamp.split('T')[0];
    const newArchive: ScratchpadArchive = {
      id: 'arch-' + Date.now(),
      content: currentNote.content,
      date: dateStr
    };
    setScratchpadArchive([newArchive, ...archive]);
    // Clear current
    setScratchpadNote({ content: '', timestamp: '' });
  }
};

// Reset all user data completely
export const clearAllDataFlag = () => {
  const keys = Object.values(KEYS);
  keys.forEach(key => localStorage.removeItem(key));
};

// Seeding standard data for realistic metrics (Indian middle-class setting)
export const seedSampleData = () => {
  const baseDate = new Date(); // e.g. May 22, 2026
  const getPastDateStr = (daysAgo: number): string => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const sampleExpenses: Expense[] = [
    {
      id: 'seed-exp-1',
      title: 'Monthly Groceries from Rice Merchant & Local Mandi',
      amount: 4200,
      category: 'Groceries & Food',
      type: 'Need',
      note: 'Bought 25kg Basmati and seasonal vegetables',
      date: getPastDateStr(6)
    },
    {
      id: 'seed-exp-2',
      title: 'Samosa & Chai with Chitti Friends',
      amount: 180,
      category: 'Tea & Snacks',
      type: 'Want',
      note: 'Shared snack plate',
      date: getPastDateStr(5)
    },
    {
      id: 'seed-exp-3',
      title: 'Electricity Bill (KSEB / BESCOM Summer peak)',
      amount: 2200,
      category: 'Electricity & Bills',
      type: 'Need',
      note: 'Online payment',
      date: getPastDateStr(4)
    },
    {
      id: 'seed-exp-4',
      title: 'Monthly Auto-rickshaw Pass / Metro card top-up',
      amount: 600,
      category: 'Transport & Fuel',
      type: 'Need',
      note: 'Regular commute budget',
      date: getPastDateStr(3)
    },
    {
      id: 'seed-exp-5',
      title: 'Medicine refill for father',
      amount: 1250,
      category: 'Medical & Health',
      type: 'Need',
      note: 'Insulin and blood pressure pills',
      date: getPastDateStr(3)
    },
    {
      id: 'seed-exp-6',
      title: 'Weekend Family Movie Trip',
      amount: 850,
      category: 'Movies & Entertainment',
      type: 'Want',
      note: 'Went to regional block-buster movie + local juice',
      date: getPastDateStr(2)
    },
    {
      id: 'seed-exp-7',
      title: 'School Stationary & Drawing Book for daughter',
      amount: 450,
      category: 'School & Education',
      type: 'Need',
      note: 'Notebooks, pens, geometry box',
      date: getPastDateStr(1)
    },
    {
      id: 'seed-exp-8',
      title: 'Saved towards School Admission Reopening Goal',
      amount: 2500,
      category: 'School & Education',
      type: 'Saving',
      note: 'Monthly allocation for high expense next month',
      date: getPastDateStr(1)
    }
  ];

  const sampleIOTracker: IOTrackerEntry[] = [
    {
      id: 'seed-io-1',
      type: 'give',
      personName: 'Ramesh (Neighbor)',
      amount: 1200,
      date: getPastDateStr(4),
      status: 'Pending'
    },
    {
      id: 'seed-io-2',
      type: 'give',
      personName: 'Sunitha (Sister in-law)',
      amount: 3000,
      date: getPastDateStr(10),
      status: 'Completed'
    }
  ];

  // Also seed past month history to make month 1 comparison work immediately
  const lastMonthKey = (() => {
    const d = new Date(baseDate);
    d.setMonth(baseDate.getMonth() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mo}`;
  })();

  const sampleHistory: PastMonthSummary[] = [
    {
      monthKey: lastMonthKey,
      totalIncome: 35000,
      totalSpent: 26400,
      totalSaved: 5000,
      categoryBreakdown: {
        'Groceries & Food': 8200,
        'Transport & Fuel': 3200,
        'Electricity & Bills': 4100,
        'Medical & Health': 1500,
        'School & Education': 4400,
        'Clothes & Shopping': 2500,
        'Movies & Entertainment': 1500,
        'Tea & Snacks': 1000,
        'Restaurant & Eating Out': 0
      }
    }
  ];

  setExpenses(sampleExpenses);
  setIOTracker(sampleIOTracker);
  setMonthHistory(sampleHistory);

  // Set flag that sample data is loaded
  localStorage.setItem('budgety_sample_data_v2', 'true');
};

export const hasSampleDataEnabled = (): boolean => {
  return localStorage.getItem('budgety_sample_data_v2') === 'true';
};

export const clearSampleData = () => {
  // Clear only seed items
  const expenses = getExpenses().filter(e => !e.id.startsWith('seed-'));
  setExpenses(expenses);

  const io = getIOTracker().filter(i => !i.id.startsWith('seed-'));
  setIOTracker(io);

  setMonthHistory([]);
  localStorage.removeItem('budgety_sample_data_v2');
};
