import { create } from 'zustand';
import { Category, Product } from '@prisma/client';

interface UndoState {
  // Kategoriler için state
  lastDeletedCategories: Category[];
  showCategoryUndoButton: boolean;
  categoryUndoCountdown: number;
  isCategoryRestoring: boolean;
  categoryTimerStartTime: number | null;
  
  // Ürünler için state
  lastDeletedProducts: Product[];
  showProductUndoButton: boolean;
  productUndoCountdown: number;
  isProductRestoring: boolean;
  productTimerStartTime: number | null;
  
  // Actions
  setLastDeletedCategories: (categories: Category[]) => void;
  setShowCategoryUndoButton: (show: boolean) => void;
  setCategoryUndoCountdown: (countdown: number) => void;
  setIsCategoryRestoring: (isRestoring: boolean) => void;
  
  setLastDeletedProducts: (products: Product[]) => void;
  setShowProductUndoButton: (show: boolean) => void;
  setProductUndoCountdown: (countdown: number) => void;
  setIsProductRestoring: (isRestoring: boolean) => void;

  // Timer actions
  startCategoryTimer: () => void;
  startProductTimer: () => void;
  updateTimers: () => void;
  clearTimers: () => void;
}

let updateInterval: NodeJS.Timeout | null = null;

export const useUndoStore = create<UndoState>((set, get) => ({
  // Initial state - Kategoriler
  lastDeletedCategories: [],
  showCategoryUndoButton: false,
  categoryUndoCountdown: 10,
  isCategoryRestoring: false,
  categoryTimerStartTime: null,
  
  // Initial state - Ürünler
  lastDeletedProducts: [],
  showProductUndoButton: false,
  productUndoCountdown: 10,
  isProductRestoring: false,
  productTimerStartTime: null,
  
  // Actions - Kategoriler
  setLastDeletedCategories: (categories) => set({ lastDeletedCategories: categories }),
  setShowCategoryUndoButton: (show) => set({ showCategoryUndoButton: show }),
  setCategoryUndoCountdown: (countdown) => set({ categoryUndoCountdown: countdown }),
  setIsCategoryRestoring: (isRestoring) => set({ isCategoryRestoring: isRestoring }),
  
  // Actions - Ürünler
  setLastDeletedProducts: (products) => set({ lastDeletedProducts: products }),
  setShowProductUndoButton: (show) => set({ showProductUndoButton: show }),
  setProductUndoCountdown: (countdown) => set({ productUndoCountdown: countdown }),
  setIsProductRestoring: (isRestoring) => set({ isProductRestoring: isRestoring }),

  // Timer actions
  startCategoryTimer: () => {
    set({
      categoryTimerStartTime: Date.now(),
      categoryUndoCountdown: 10,
      showCategoryUndoButton: true
    });

    // Timer güncellemesini başlat
    const store = get();
    if (!updateInterval) {
      store.updateTimers();
    }
  },

  startProductTimer: () => {
    set({
      productTimerStartTime: Date.now(),
      productUndoCountdown: 10,
      showProductUndoButton: true
    });

    // Timer güncellemesini başlat
    const store = get();
    if (!updateInterval) {
      store.updateTimers();
    }
  },

  updateTimers: () => {
    if (updateInterval) clearInterval(updateInterval);

    updateInterval = setInterval(async () => {
      const state = get();
      const now = Date.now();

      // Kategori timer'ını güncelle
      if (state.categoryTimerStartTime && state.showCategoryUndoButton) {
        const elapsed = Math.floor((now - state.categoryTimerStartTime) / 1000);
        const remaining = Math.max(10 - elapsed, 0);

        if (remaining === 0) {
          // Süre bitti, kalıcı silme işlemini yap
          try {
            await fetch('/api/categories/permanent-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ categories: state.lastDeletedCategories }),
            });
          } catch (error) {
            console.error('Error permanently deleting categories:', error);
          }

          set({
            showCategoryUndoButton: false,
            lastDeletedCategories: [],
            categoryTimerStartTime: null,
            categoryUndoCountdown: 10
          });
        } else {
          set({ categoryUndoCountdown: remaining });
        }
      }

      // Ürün timer'ını güncelle
      if (state.productTimerStartTime && state.showProductUndoButton) {
        const elapsed = Math.floor((now - state.productTimerStartTime) / 1000);
        const remaining = Math.max(10 - elapsed, 0);

        if (remaining === 0) {
          // Süre bitti, kalıcı silme işlemini yap
          try {
            await fetch('/api/products/permanent-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ products: state.lastDeletedProducts }),
            });
          } catch (error) {
            console.error('Error permanently deleting products:', error);
          }

          set({
            showProductUndoButton: false,
            lastDeletedProducts: [],
            productTimerStartTime: null,
            productUndoCountdown: 10
          });
        } else {
          set({ productUndoCountdown: remaining });
        }
      }

      // Eğer hiçbir timer aktif değilse interval'ı temizle
      if (!state.categoryTimerStartTime && !state.productTimerStartTime) {
        if (updateInterval) {
          clearInterval(updateInterval);
          updateInterval = null;
        }
      }
    }, 100); // Daha sık güncelleme için 100ms
  },

  clearTimers: () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
})); 