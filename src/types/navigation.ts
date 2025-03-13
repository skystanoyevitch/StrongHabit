import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Habit } from "../types/habit";

export type RootTabParamList = {
  Home: undefined;
  AddHabits: undefined;
  Stats: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

export type RootStackParamList = {
  Home: undefined;
  HabitDetail: { habit: Habit };
  AddHabit: undefined;
  Stats: undefined;
};
