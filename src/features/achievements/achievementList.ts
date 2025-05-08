import { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: "streak-3",
    title: "3 Day Streak",
    description: "Maintain a habit for 3 days in a row",
    type: "streak",
    threshold: 3,
    icon: "star-outline",
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a habit for 7 days in a row",
    type: "streak",
    threshold: 7,
    icon: "star-half",
  },
  {
    id: "streak-30",
    title: "Monthly Master",
    description: "Maintain a habit for 30 days in a row",
    type: "streak",
    threshold: 30,
    icon: "star",
  },
  {
    id: "streak-60",
    title: "Habit Hero",
    description: "Maintain a habit for 60 days in a row",
    type: "streak",
    threshold: 60,
    icon: "medal",
  },
  {
    id: "streak-90",
    title: "Quarterly Champion",
    description: "Maintain a habit for 90 days in a row",
    type: "streak",
    threshold: 90,
    icon: "trophy",
  },
  {
    id: "streak-365",
    title: "Yearly Legend",
    description: "Maintain a habit for a full year",
    type: "streak",
    threshold: 365,
    icon: "crown",
  },

  // Completion Achievements
  {
    id: "completion-10",
    title: "Getting Started",
    description: "Complete a habit 10 times",
    type: "completion",
    threshold: 10,
    icon: "check-circle-outline",
  },
  {
    id: "completion-25",
    title: "Building Momentum",
    description: "Complete a habit 25 times",
    type: "completion",
    threshold: 25,
    icon: "check-circle",
  },
  {
    id: "completion-50",
    title: "Half Century",
    description: "Complete a habit 50 times",
    type: "completion",
    threshold: 50,
    icon: "check-decagram-outline",
  },
  {
    id: "completion-100",
    title: "Century Club",
    description: "Complete a habit 100 times",
    type: "completion",
    threshold: 100,
    icon: "check-decagram",
  },

  // Consistency Achievements
  {
    id: "consistency-5",
    title: "Consistency Starter",
    description: "Complete a habit at the same time for 5 days",
    type: "consistency",
    threshold: 5,
    icon: "clock-outline",
  },
  {
    id: "consistency-14",
    title: "Routine Builder",
    description: "Complete a habit at the same time for 2 weeks",
    type: "consistency",
    threshold: 14,
    icon: "clock-check-outline",
  },
  {
    id: "consistency-30",
    title: "Time Master",
    description: "Complete a habit at the same time for 30 days",
    type: "consistency",
    threshold: 30,
    icon: "clock-check",
  },
];
