export interface HabitLog {
  date: string;
  completed: boolean;
}

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string | null;
  reminderTime?: string | null;
  reminderEnabled: boolean;
  notificationId?: string;
  reminder?: boolean;
  color?: string;
  streak: number;
  completionLogs: Array<{
    date: string;
    completed: boolean;
  }>;
}
