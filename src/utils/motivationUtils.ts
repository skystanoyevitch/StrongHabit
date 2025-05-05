export interface MotivationMessage {
  message: string;
  icon?: string;
}

// Function to get a random element from an array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Define different message categories
const newHabitMessages: MotivationMessage[] = [
  { message: "This is the start of your journey!" },
  {
    message: "Every great achievement begins with the decision to try",
  },
  {
    message: "The first step is always the most important",
  },
];

const streakMessages: MotivationMessage[] = [
  { message: "Keep it going, never give up!" },
  { message: "You're on fire!" },
  { message: "Incredible dedication!" },
  { message: "You're building something special" },
];

const consistentMessages: MotivationMessage[] = [
  { message: "Consistency is the key to success" },
  { message: "Making progress every day!" },
  { message: "You're developing a strong habit" },
];

const missedDayMessages: MotivationMessage[] = [
  { message: "Today is a new opportunity" },
  { message: "Every day is a fresh start" },
  { message: "Get back on track today!" },
];

export const getMotivationMessage = (
  streak: number,
  totalCompletions: number,
  lastCompletionDate?: string
) => {
  // New user messages
  if (totalCompletions === 0) {
    return {
      message:
        "Start your journey today. Every great achievement begins with a single step.",
    };
  }

  // Streak-based messages
  if (streak >= 30) {
    return {
      message:
        "A month of dedication! You've made this habit a part of who you are.",
    };
  }
  if (streak >= 21) {
    return {
      message:
        "Three weeks strong. You're proving your commitment to positive change.",
    };
  }
  if (streak >= 14) {
    return {
      message: "Two weeks of consistency. Your dedication is truly admirable.",
    };
  }
  if (streak >= 7) {
    return {
      message: "A week of success! You're building something meaningful.",
    };
  }
  if (streak >= 3) {
    return {
      message: "Three days and counting. Keep this momentum going.",
    };
  }

  // Missed day but has history
  if (streak === 0 && lastCompletionDate) {
    return {
      message:
        "Yesterday is history, tomorrow is a mystery, but today is a gift.",
    };
  }

  // Default encouragement
  return {
    message: "Each day is a new opportunity to build your better self.",
  };
};
