import { StateCreator } from "zustand";
import { StoreSlices } from "../useAppStore";

export type AppStateSlice = {
  isDrawerOpen: boolean;
  toggleOpenDrawer: () => void;
};

export const CreateAppStateSlice: StateCreator<StoreSlices, [], [], AppStateSlice> = (set, get) => ({
  isDrawerOpen: false,
  toggleOpenDrawer: () => set((state) => ({ ...state, isDrawerOpen: !state.isDrawerOpen })),
});
