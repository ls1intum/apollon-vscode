import { create } from "zustand";

interface Store {
  diagrams: string[];
  setDiagrams: (diagrams: string[]) => void;
}

export const useStore = create<Store>((set) => ({
  diagrams: [],
  setDiagrams: (diagrams: string[]) => {
    set({ diagrams: diagrams });
  },
}));

export default useStore;
