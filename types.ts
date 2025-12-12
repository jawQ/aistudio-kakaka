export enum WorkStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface WorkSession {
  id: string;
  workName: string; // e.g., "Main Stream", "Guest Apperance"
  location: string;
  hourlyRate: number;
  startTime: string; // ISO String
  endTime: string; // ISO String
  status: WorkStatus;
  notes: string;
}

export interface User {
  id: string;
  phone: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  nickname?: string;
}

export interface WorkStats {
  totalHours: number;
  totalEarnings: number;
}

export type Period = 'day' | 'month' | 'year';

export interface StatSummary {
  day: WorkStats;
  month: WorkStats;
  year: WorkStats;
}