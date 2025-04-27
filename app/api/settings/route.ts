import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Varsayılan ayarlar
const defaultSettings = {
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
    theme: 'dark',
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
};

// Ayarları getir
export async function GET() {
  try {
    // Veritabanından ayarları çek
    const settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Eğer ayarlar yoksa, varsayılan ayarları döndür
      return NextResponse.json(defaultSettings);
    }
    
    // Veritabanından gelen ayarları birleştir
    const mergedSettings = {
      general: (settings as any).general || defaultSettings.general,
      contact: (settings as any).contact || defaultSettings.contact,
      social: (settings as any).social || defaultSettings.social,
      appearance: (settings as any).appearance || defaultSettings.appearance,
      menu: (settings as any).menu || defaultSettings.menu,
      qrCode: (settings as any).qrCode || defaultSettings.qrCode,
      notifications: (settings as any).notifications || defaultSettings.notifications,
    };
    
    return NextResponse.json(mergedSettings);
  } catch (error) {
    console.error('Ayarlar getirilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Ayarlar getirilirken bir hata oluştu' }, { status: 500 });
  }
}

// Ayarları kaydet
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Veritabanında ayarlar var mı kontrol et
    const existingSettings = await prisma.settings.findFirst();
    
    let settings;
    
    if (existingSettings) {
      // Eğer ayarlar varsa, güncelle
      settings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          general: data.general || (existingSettings as any).general,
          contact: data.contact || (existingSettings as any).contact,
          social: data.social || (existingSettings as any).social,
          appearance: data.appearance || (existingSettings as any).appearance,
          menu: data.menu || (existingSettings as any).menu,
          qrCode: data.qrCode || (existingSettings as any).qrCode,
          notifications: data.notifications || (existingSettings as any).notifications,
        } as any
      });
    } else {
      // Eğer ayarlar yoksa, oluştur
      settings = await prisma.settings.create({
        data: {
          general: data.general || defaultSettings.general,
          contact: data.contact || defaultSettings.contact,
          social: data.social || defaultSettings.social,
          appearance: data.appearance || defaultSettings.appearance,
          menu: data.menu || defaultSettings.menu,
          qrCode: data.qrCode || defaultSettings.qrCode,
          notifications: data.notifications || defaultSettings.notifications,
        } as any
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Ayarlar kaydedilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Ayarlar kaydedilirken bir hata oluştu' }, { status: 500 });
  }
}
