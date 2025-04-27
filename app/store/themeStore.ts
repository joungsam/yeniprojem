'use client';

import { create } from 'zustand';
import { useEffect } from 'react';

export type Theme = 'light' | 'dark';

// Veritabanından ve localStorage'dan tema ayarını alalım
const getInitialTheme = async (): Promise<Theme> => {
  try {
    // Veritabanından ayarları çek
    console.log('Veritabanından tema ayarı çekiliyor...');
    const response = await fetch('/api/settings');
    console.log('API yanıtı:', response.status, response.statusText);
    
    if (response.ok) {
      const settings = await response.json();
      console.log('Veritabanından çekilen ayarlar:', settings);
      
      if (settings.appearance && settings.appearance.theme) {
        console.log('Veritabanından çekilen tema:', settings.appearance.theme);
        return settings.appearance.theme;
      } else {
        console.log('Veritabanında tema ayarı bulunamadı');
      }
    } else {
      console.log('API yanıtı başarısız:', await response.text());
    }
  } catch (error) {
    console.error('Tema ayarı getirilirken hata oluştu:', error);
  }
  
  // Veritabanından tema ayarı getirilemezse, localStorage'dan kontrol et
  if (typeof window !== 'undefined') {
    console.log('localStorage\'dan tema ayarı kontrol ediliyor...');
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      console.log('localStorage\'dan çekilen tema:', savedTheme);
      return savedTheme;
    } else {
      console.log('localStorage\'da tema ayarı bulunamadı');
    }
  }
  
  // Hiçbir yerden tema ayarı getirilemezse, varsayılan olarak 'dark' kullan
  console.log('Varsayılan tema kullanılıyor: dark');
  return 'dark';
};

// Global değişken olarak tema ayarını saklayalım
let globalTheme: Theme = 'light'; // Başlangıçta 'light' olarak ayarla

// Sayfa yüklendiğinde veritabanından tema ayarını çek
if (typeof window !== 'undefined') {
  getInitialTheme().then((theme) => {
    globalTheme = theme;
    // useThemeStore'u güncelle
    if (useThemeStore.getState) {
      useThemeStore.getState().setTheme(theme);
    }
  });
}

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: globalTheme,
  toggleTheme: () => {
    const newTheme = globalTheme === 'light' ? 'dark' : 'light';
    globalTheme = newTheme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    set({ theme: globalTheme });
  },
  setTheme: (theme: Theme) => {
    globalTheme = theme;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    set({ theme });
  },
}));
