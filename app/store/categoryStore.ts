import { create } from 'zustand';

interface CategoryStoreState {
  lastUpdatedAt: number | null;
  updateTimestamp: () => void;
}

export const useCategoryStore = create<CategoryStoreState>((set) => ({
  lastUpdatedAt: null,
  updateTimestamp: () => set({ lastUpdatedAt: Date.now() }),
}));
