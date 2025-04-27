import { create } from 'zustand';

type ToastVariant = 'default' | 'destructive' | 'success';

interface Toast {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastStore {
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  hideToast: () => void;
}

const playSound = (variant?: ToastVariant) => {
  try {
    const audio = new Audio();
    
    switch (variant) {
      case 'destructive':
        audio.src = '/sounds/error.mp3';
        break;
      case 'success':
        audio.src = '/sounds/success.mp3';
        break;
      default:
        audio.src = '/sounds/notification.mp3';
        break;
    }
    
    audio.volume = 0.3;
    audio.play().catch((error) => {
      console.log('Ses dosyası yüklenemedi:', error);
    });
  } catch (error) {
    console.log('Ses çalma hatası:', error);
  }
};

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  showToast: (toast) => {
    playSound(toast.variant);
    set({ toast });
  },
  hideToast: () => set({ toast: null }),
}));

export const useToast = () => {
  const { showToast } = useToastStore();
  
  return {
    toast: (props: Toast) => {
      showToast(props);
      setTimeout(() => {
        useToastStore.getState().hideToast();
      }, 3000);
    },
  };
}; 