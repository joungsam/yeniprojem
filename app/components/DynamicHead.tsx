'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/app/store/settingsStore';

export default function DynamicHead() {
  const [mounted, setMounted] = useState(false);
  const { appearance, general } = useSettingsStore();
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Favicon'u ve sayfa başlığını dinamik olarak güncelle
  useEffect(() => {
    if (!mounted) return;
    
    // Mevcut favicon elementini bul
    const existingFavicon = document.querySelector('link[rel="icon"]');
    
    if (existingFavicon) {
      // Varsa güncelle
      existingFavicon.setAttribute('href', appearance.faviconUrl || '/favicon.ico');
    } else {
      // Yoksa oluştur
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = appearance.faviconUrl || '/favicon.ico';
      document.head.appendChild(favicon);
    }
    
    // Sayfa başlığını güncelle
    document.title = general.restaurantName || 'QR Menu';
    
    // Yazı tipini güncelle
    document.documentElement.style.setProperty('--font-family', appearance.fontFamily || 'Poppins');
    
    // Yazı tipini doğrudan body'ye uygula
    const fontFamily = appearance.fontFamily || 'Poppins';
    document.body.style.fontFamily = `${fontFamily}, sans-serif`;
    
    // Ana rengi güncelle
    document.documentElement.style.setProperty('--primary-color', appearance.primaryColor || '#9D2235');
    
    // İkincil rengi güncelle
    document.documentElement.style.setProperty('--secondary-color', appearance.secondaryColor || '#D4AF37');
    
  }, [mounted, appearance.faviconUrl, appearance.fontFamily, appearance.primaryColor, appearance.secondaryColor, general.restaurantName]);
  
  // Yazı tipi değişikliğini hemen uygula
  useEffect(() => {
    if (!mounted) return;
    
    // Yazı tipini güncelle
    document.documentElement.style.setProperty('--font-family', appearance.fontFamily || 'Poppins');
    
    // Yazı tipini doğrudan body'ye ve tüm elemanlara uygula
    const fontFamily = appearance.fontFamily || 'Poppins';
    document.body.style.fontFamily = `${fontFamily}, sans-serif`;
    
    // Tüm elemanlara yazı tipini uygula
    document.querySelectorAll('*').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.fontFamily = `${fontFamily}, sans-serif`;
      }
    });
    
  }, [mounted, appearance.fontFamily]);
  
  return null;
}
