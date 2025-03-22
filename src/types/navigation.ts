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
  HomeScreen: undefined;
  HabitDetail: { habit: Habit };
  EditHabit: { habit: Habit };
  AddHabit: undefined;
  Stats: undefined;
};
