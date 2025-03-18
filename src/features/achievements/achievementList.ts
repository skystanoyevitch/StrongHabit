import { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
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
];
