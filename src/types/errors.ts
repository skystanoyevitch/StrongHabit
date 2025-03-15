export class HabitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HabitError";
  }
}
