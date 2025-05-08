export interface HabitLog {
  date: string;
  completed: boolean;
}

export type HabitFrequency = "daily" | "weekly" | "monthly";

export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: HabitFrequency;
  selectedDays?: DayOfWeek[];
  monthlyDays?: number[];
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

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
