'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import DynamicHead from '../components/DynamicHead';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sunucu tarafında render edildiğinde, varsayılan olarak 'light' tema kullanılır
  // İstemci tarafında JavaScript çalıştığında, useThemeStore'dan tema değeri alınır
  const { theme } = useThemeStore();
  const isDark = mounted ? theme === 'dark' : false;

  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
    // Yükleme animasyonu için kısa bir gecikme
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 ${
            isDark 
              ? 'border-t-blue-400 border-r-gray-700 border-b-blue-400 border-l-gray-700' 
              : 'border-t-blue-500 border-r-gray-200 border-b-blue-500 border-l-gray-200'
          } border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Yükleniyor...</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Lütfen bekleyin, admin paneli hazırlanıyor</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-100 text-gray-900'
    }`}>
      <DynamicHead />
      <AdminSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="py-6 mt-16 lg:mt-0">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
