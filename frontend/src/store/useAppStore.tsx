import { create } from "zustand";
import { AppStateSlice, CreateAppStateSlice } from "./slice/appStateSlice";

export type StoreSlices = AppStateSlice;

export const useAppStore = create<StoreSlices>((...args) => ({
  ...CreateAppStateSlice(...args),
}));
