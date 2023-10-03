import { StateCreator } from "zustand";
import { StoreSlices } from "../useAppStore";
import { NavName } from "@/lib/navName";

export type AppStateSlice = {
  isDrawerOpen: boolean;
  toggleOpenDrawer: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
};

export const CreateAppStateSlice: StateCreator<StoreSlices, [], [], AppStateSlice> = (set, get) => ({
  isDrawerOpen: false,
  toggleOpenDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  activeNav: NavName.users,
  setActiveNav: (nav) => set((state) => ({ activeNav: nav })),
});
