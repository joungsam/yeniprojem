'use client';

import { create } from 'zustand';
import { useThemeStore } from './themeStore';
import type { Theme } from './themeStore';

interface WorkingHour {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface SettingsState { // Add export keyword
  general: {
    restaurantName: string;
    description: string;
    slogan: string;
    foundedYear: string;
    currency: string;
    language: string;
    timezone: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    website: string;
    workingHours: WorkingHour[];
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  appearance: {
    theme: Theme;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl: string;
    logoWidth: number;
    logoHeight: number;
    faviconUrl: string;
    showLogo: boolean;
    showSocialIcons: boolean;
    menuLayout: string;
    productCardStyle: string;
    footerNote: string;
    showFooterNote: boolean;
  };
  menu: {
    defaultCurrency: string;
    showPrices: boolean;
    showOutOfStock: boolean;
    markFeaturedItems: boolean;
    showCategories: boolean;
    showProductImages: boolean;
    enableSearch: boolean;
    showProductDescription: boolean;
    productsPerPage: number;
  };
  qrCode: {
    defaultSize: number;
    defaultFgColor: string;
    defaultBgColor: string;
    includeLogo: boolean;
    defaultLogoSize: number;
    defaultFrameSize: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    emailForOrders: string;
    notifyOnLowStock: boolean;
    lowStockThreshold: number;
    sendDailySummary: boolean;
    sendWeeklySummary: boolean;
  };
  hasChanges: boolean;
  isLoading: boolean;
  updateSettings: (category: string, field: string, value: any) => void;
  updateWorkingHour: (index: number, field: string, value: any) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (jsonString: string) => void;
  setHasChanges: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  // Veritabanından ayarları çek
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        
        // Ayarları güncelle
        set((state) => ({
          ...state,
          general: settings.general || state.general,
          contact: settings.contact || state.contact,
          social: settings.social || state.social,
          appearance: settings.appearance || state.appearance,
          menu: settings.menu || state.menu,
          qrCode: settings.qrCode || state.qrCode,
          notifications: settings.notifications || state.notifications,
        }));
        
        // Tema ayarını güncelle
        if (settings.appearance && settings.appearance.theme) {
          const { setTheme } = useThemeStore.getState();
          setTheme(settings.appearance.theme);
        }
      }
    } catch (error) {
      console.error('Ayarlar getirilirken hata oluştu:', error);
    }
  };
  
  // Sayfa yüklendiğinde ayarları çek
  if (typeof window !== 'undefined') {
    // Bu kodu sadece tarayıcıda çalıştır
    // setTimeout kaldırıldı, ayarları hemen çek
    fetchSettings();
  }
  
  // localStorage'dan tema ayarını alalım (yedek olarak)
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    }
    return 'dark'; // Varsayılan olarak 'dark' kullan
  };
  
  const theme: Theme = getInitialTheme();
  
  return {
    general: {
      restaurantName: 'Cafe Barcelona',
      description: 'Modern İspanyol mutfağı ve tapas bar',
      slogan: 'Akdeniz lezzetleri, İspanyol tutkusu',
      foundedYear: '2018',
      currency: 'TRY',
      language: 'tr',
      timezone: 'Europe/Istanbul',
    },
    contact: {
      address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
      phone: '+90 212 345 67 89',
      email: 'info@cafebarcelona.com',
      website: 'www.cafebarcelona.com',
      workingHours: [
        { day: 'Pazartesi', open: '09:00', close: '22:00', isOpen: true },
        { day: 'Salı', open: '09:00', close: '22:00', isOpen: true },
        { day: 'Çarşamba', open: '09:00', close: '22:00', isOpen: true },
        { day: 'Perşembe', open: '09:00', close: '22:00', isOpen: true },
        { day: 'Cuma', open: '09:00', close: '23:00', isOpen: true },
        { day: 'Cumartesi', open: '10:00', close: '23:00', isOpen: true },
        { day: 'Pazar', open: '10:00', close: '22:00', isOpen: true },
      ],
    },
    social: {
      facebook: 'facebook.com/cafebarcelona',
      instagram: 'instagram.com/cafebarcelona',
      twitter: 'twitter.com/cafebarcelona',
      youtube: '',
      tiktok: '',
    },
    appearance: {
      theme: theme,
      primaryColor: '#9D2235',
      secondaryColor: '#D4AF37',
      fontFamily: 'Poppins',
      logoUrl: '/logo.png',
      logoWidth: 100,
      logoHeight: 100,
      faviconUrl: '/favicon.ico',
      showLogo: true,
      showSocialIcons: true,
      menuLayout: 'grid',
      productCardStyle: 'modern',
      footerNote: 'CAM SU ÜCRETLİDİR...',
      showFooterNote: true,
    },
    menu: {
      defaultCurrency: 'TRY',
      showPrices: true,
      showOutOfStock: true,
      markFeaturedItems: true,
      showCategories: true,
      showProductImages: true,
      enableSearch: true,
      showProductDescription: true,
      productsPerPage: 12,
    },
    qrCode: {
      defaultSize: 256,
      defaultFgColor: '#9D2235',
      defaultBgColor: '#FFFFFF',
      includeLogo: true,
      defaultLogoSize: 64,
      defaultFrameSize: 16,
    },
    notifications: {
      enableEmailNotifications: true,
      emailForOrders: 'orders@cafebarcelona.com',
      notifyOnLowStock: true,
      lowStockThreshold: 5,
      sendDailySummary: true,
      sendWeeklySummary: true,
    },
    hasChanges: false,
    isLoading: false,
    
    updateSettings: (category, field, value) => {
      set((state) => {
        const newState = { ...state };
        (newState[category as keyof typeof newState] as any)[field] = value;
        return { ...newState, hasChanges: true };
      });
    },
    
    updateWorkingHour: (index, field, value) => {
      set((state) => {
        const updatedHours = [...state.contact.workingHours];
        updatedHours[index] = {
          ...updatedHours[index],
          [field]: value
        };
        
        return {
          ...state,
          contact: {
            ...state.contact,
            workingHours: updatedHours
          },
          hasChanges: true
        };
      });
    },
    
    saveSettings: async () => {
      set({ isLoading: true });
      
      try {
        // Ayarları API'ye kaydet
        const { general, contact, social, appearance, menu, qrCode, notifications } = get();
        const settings = { general, contact, social, appearance, menu, qrCode, notifications };
        
        // Tema ayarını güncelle ve localStorage'a kaydet
        const { setTheme } = useThemeStore.getState();
        setTheme(get().appearance.theme);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', get().appearance.theme);
        }
        
        // API'ye kaydetmeyi dene
        try {
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
          });
          
          if (!response.ok) {
            console.warn('API\'ye kaydetme başarısız oldu, ancak tema ayarı localStorage\'a kaydedildi.');
          }
        } catch (apiError) {
          console.warn('API\'ye kaydetme başarısız oldu, ancak tema ayarı localStorage\'a kaydedildi:', apiError);
        }
        
        set({ hasChanges: false });
        return Promise.resolve();
      } catch (error) {
        console.error('Ayarlar kaydedilirken hata oluştu:', error);
        return Promise.reject(error);
      } finally {
        set({ isLoading: false });
      }
    },
    
    resetSettings: () => {
      // Tema ayarını güncelle
      const { setTheme } = useThemeStore.getState();
      setTheme('light');
      
      // Varsayılan ayarları yükle
      set((state) => ({
        ...state,
        general: {
          restaurantName: 'Cafe Barcelona',
          description: 'Modern İspanyol mutfağı ve tapas bar',
          slogan: 'Akdeniz lezzetleri, İspanyol tutkusu',
          foundedYear: '2018',
          currency: 'TRY',
          language: 'tr',
          timezone: 'Europe/Istanbul',
        },
        contact: {
          address: 'Bağdat Caddesi No:123, Kadıköy, İstanbul',
          phone: '+90 212 345 67 89',
          email: 'info@cafebarcelona.com',
          website: 'www.cafebarcelona.com',
          workingHours: [
            { day: 'Pazartesi', open: '09:00', close: '22:00', isOpen: true },
            { day: 'Salı', open: '09:00', close: '22:00', isOpen: true },
            { day: 'Çarşamba', open: '09:00', close: '22:00', isOpen: true },
            { day: 'Perşembe', open: '09:00', close: '22:00', isOpen: true },
            { day: 'Cuma', open: '09:00', close: '23:00', isOpen: true },
            { day: 'Cumartesi', open: '10:00', close: '23:00', isOpen: true },
            { day: 'Pazar', open: '10:00', close: '22:00', isOpen: true },
          ],
        },
        social: {
          facebook: 'facebook.com/cafebarcelona',
          instagram: 'instagram.com/cafebarcelona',
          twitter: 'twitter.com/cafebarcelona',
          youtube: '',
          tiktok: '',
        },
        appearance: {
          theme: 'light',
          primaryColor: '#9D2235',
          secondaryColor: '#D4AF37',
          fontFamily: 'Poppins',
          logoUrl: '/logo.png',
          logoWidth: 100,
          logoHeight: 100,
          faviconUrl: '/favicon.ico',
          showLogo: true,
          showSocialIcons: true,
          menuLayout: 'grid',
          productCardStyle: 'modern',
          footerNote: 'CAM SU ÜCRETLİDİR...',
          showFooterNote: true,
        },
        menu: {
          defaultCurrency: 'TRY',
          showPrices: true,
          showOutOfStock: true,
          markFeaturedItems: true,
          showCategories: true,
          showProductImages: true,
          enableSearch: true,
          showProductDescription: true,
          productsPerPage: 12,
        },
        qrCode: {
          defaultSize: 256,
          defaultFgColor: '#9D2235',
          defaultBgColor: '#FFFFFF',
          includeLogo: true,
          defaultLogoSize: 64,
          defaultFrameSize: 16,
        },
        notifications: {
          enableEmailNotifications: true,
          emailForOrders: 'orders@cafebarcelona.com',
          notifyOnLowStock: true,
          lowStockThreshold: 5,
          sendDailySummary: true,
          sendWeeklySummary: true,
        },
        hasChanges: true,
      }));
    },
    
    exportSettings: () => {
      const { general, contact, social, appearance, menu, qrCode, notifications } = get();
      const settings = { general, contact, social, appearance, menu, qrCode, notifications };
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'settings.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    },
    
    importSettings: (jsonString) => {
      try {
        const parsedSettings = JSON.parse(jsonString);
        
        // Tema ayarını güncelle
        if (parsedSettings.appearance && parsedSettings.appearance.theme) {
          const { setTheme } = useThemeStore.getState();
          setTheme(parsedSettings.appearance.theme);
        }
        
        set((state) => ({
          ...state,
          ...parsedSettings,
          hasChanges: true
        }));
      } catch (error) {
        console.error('Ayarlar içe aktarılırken hata oluştu:', error);
        throw error;
      }
    },
    
    setHasChanges: (value) => set({ hasChanges: value }),
    setIsLoading: (value) => set({ isLoading: value }),
  };
});
