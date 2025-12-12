import { WorkSession, WorkStatus, User } from '../types';

/**
 * This service mimics a backend environment (e.g., Node/Express + Mongo).
 * In a real migration, these functions would be API calls.
 */

const STORAGE_KEY_SESSIONS = 'k_app_sessions';
const STORAGE_KEY_USER = 'k_app_user';

// Initial Mock Data
const generateMockData = (): WorkSession[] => {
  const sessions: WorkSession[] = [];
  const now = new Date();
  const workNames = ['晚间主播', '品牌代播', '新品发布会'];
  const locations = ['杭州滨江基地', '上海中心大厦', '家中直播间'];

  // Generate some past and future data
  for (let i = -5; i < 10; i++) {
    const start = new Date(now);
    start.setDate(start.getDate() + i);
    start.setHours(19, 0, 0, 0); // 7 PM
    
    const end = new Date(start);
    end.setHours(23, 0, 0, 0); // 11 PM (4 hours)

    sessions.push({
      id: crypto.randomUUID(),
      workName: workNames[Math.abs(i) % 3],
      location: locations[Math.abs(i) % 3],
      hourlyRate: 500 + (Math.abs(i) * 50),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: i < 0 ? WorkStatus.COMPLETED : WorkStatus.UPCOMING,
      notes: i === 0 ? '记得带补光灯备用电池' : '',
    });
  }
  return sessions;
};

// --- DATA ACCESS LAYER ---

export const getSessions = (): WorkSession[] => {
  const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
  if (!stored) {
    const initial = generateMockData();
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const saveSession = (session: WorkSession): void => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
};

export const getSessionById = (id: string): WorkSession | undefined => {
  const sessions = getSessions();
  return sessions.find(s => s.id === id);
};

// --- USER AUTH LAYER ---

export const getUser = (): User => {
  const stored = localStorage.getItem(STORAGE_KEY_USER);
  if (stored) return JSON.parse(stored);
  
  return {
    id: 'guest',
    phone: '',
    isLoggedIn: false
  };
};

export const loginUser = (phone: string): User => {
  const user: User = {
    id: 'u_' + phone,
    phone,
    isLoggedIn: true,
    nickname: `主播_${phone.slice(-4)}`,
    avatarUrl: `https://picsum.photos/seed/${phone}/200`
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEY_USER);
};
