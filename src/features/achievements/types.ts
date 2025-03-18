export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: "streak" | "completion" | "consistency";
  threshold: number;
  icon: string;
  unlockedAt?: string;
}
