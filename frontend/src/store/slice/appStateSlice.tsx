import { StateCreator } from "zustand";
import { StoreSlices } from "../useAppStore";
import { NavName } from "@/lib/navName";

export type AppStateSlice = {
  isDrawerOpen: boolean;
  toggleOpenDrawer: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  currentUser?: APIResponse.Auths["cmsUser"];
  setCurrentUser: (user?: APIResponse.Auths["cmsUser"]) => void;
};

export const CreateAppStateSlice: StateCreator<StoreSlices, [], [], AppStateSlice> = (set) => ({
  isDrawerOpen: false,
  toggleOpenDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  activeNav: NavName.users,
  setActiveNav: (nav) => set(() => ({ activeNav: nav })),
  currentUser: undefined,
  setCurrentUser: (user) => set(() => ({ currentUser: user })),
});
