export interface HabitLog {
  date: string;
  completed: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly";
  timeOfDay?: string; // HH:mm format
  createdAt: string; // ISO string format
  archivedAt?: string; // ISO string format
  streak: number;
  completionLogs: HabitLog[];
  reminder?: boolean;
  color?: string;
  icon?: string;
}