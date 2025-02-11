import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type RootTabParamList = {
  Home: undefined;
  AddHabits: undefined;
  Stats: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;
