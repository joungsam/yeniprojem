'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useThemeStore } from '@/app/store/themeStore';
import { useSettingsStore } from '@/app/store/settingsStore';
import {
  HomeIcon,
  QueueListIcon,
  TagIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  QrCodeIcon,
  ChatBubbleLeftRightIcon, // Import new icon
} from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Kategoriler', href: '/admin/categories', icon: TagIcon },
  { name: 'Ürünler', href: '/admin/products', icon: QueueListIcon },
  { name: 'QR Kodlar', href: '/admin/qrcodes', icon: QrCodeIcon },
  { name: 'Etkileşimler', href: '/admin/interactions', icon: ChatBubbleLeftRightIcon }, // Add new navigation item
  { name: 'Ayarlar', href: '/admin/settings', icon: Cog6ToothIcon },
];

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { theme } = useThemeStore();
  const { appearance } = useSettingsStore();
  const isDark = mounted ? theme === 'dark' : false;
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 ${
        isDark ? 'bg-gray-800 shadow-md' : 'bg-gray-50 shadow-sm'
      } z-40`}>
        <div className="flex items-center justify-between px-2 sm:px-4 py-3">
          <div className="flex items-center">
            <img
              className="h-8 w-auto object-contain"
              src={mounted && appearance?.logoUrl ? appearance.logoUrl : "/logo.png"}
              alt="Your Company"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
            <span className={`ml-2 text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Admin Panel</span>
          </div>
          <button
            type="button"
            className={`rounded-full p-2 ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            } transition-all duration-150`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <motion.div
              initial={false}
              animate={{ rotate: sidebarOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden fixed inset-0 z-30"
          >
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed inset-y-0 left-0 w-72 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              } shadow-xl overflow-hidden`}
            >
              <div className="flex flex-col h-full">
                <div className={`flex items-center justify-between px-6 py-4 ${
                  isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'
                }`}>
                  <div className="flex items-center">
                    <img
                      className="h-8 w-auto object-contain"
                      src={mounted && appearance?.logoUrl ? appearance.logoUrl : "/logo.png"}
                      alt="Your Company"
                      onError={(e) => {
                        e.currentTarget.src = '/logo.png';
                      }}
                    />
                    <span className={`ml-2 text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>Admin Panel</span>
                  </div>
                  <button
                    type="button"
                    className={`rounded-full p-1.5 ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } transition-colors duration-150`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  <nav className="px-4 space-y-1.5">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <div
                          key={item.name}
                          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                            isActive
                              ? isDark 
                                ? 'bg-gray-700 text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-900 shadow-sm'
                              : isDark
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => {
                            setSidebarOpen(false);
                            router.push(item.href);
                          }}
                        >
                          <item.icon
                            className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150 ${
                              isActive
                                ? isDark ? 'text-white' : 'text-gray-900'
                                : isDark 
                                  ? 'text-gray-400 group-hover:text-white' 
                                  : 'text-gray-500 group-hover:text-gray-900'
                            }`}
                            aria-hidden="true"
                          />
                          <span className="font-medium">{item.name}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicatorMobile"
                              className={`absolute right-3 w-1.5 h-1.5 rounded-full ${
                                isDark ? 'bg-blue-400' : 'bg-gray-600'
                              }`}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          </div>
                      );
                    })}
                  </nav>
                </div>
                <div className={`px-4 py-3 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-9 w-9 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                      } flex items-center justify-center font-semibold`}>
                        A
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin</p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>admin@example.com</p>
                      </div>
                    </div>
                    <button className={`p-1.5 rounded-lg ${
                      isDark 
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                    } transition-colors duration-150`}>
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-col h-full ${
          isDark 
            ? 'bg-gray-800 shadow-md border-r border-gray-700' 
            : 'bg-gray-50 shadow-sm border-r border-gray-200'
        }`}>
          <div className={`flex items-center h-16 px-6 ${
            isDark 
              ? 'bg-gray-800 border-b border-gray-700' 
              : 'bg-gray-50 border-b border-gray-200'
          }`}>
            <img
              className="h-8 w-auto object-contain"
              src={mounted && appearance?.logoUrl ? appearance.logoUrl : "/logo.png"}
              alt="Your Company"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
            <span className={`ml-2 text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Admin Panel</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <div
                    key={item.name}
                    className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                      isActive
                        ? isDark 
                          ? 'bg-gray-700 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-900 shadow-sm'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150 ${
                        isActive
                          ? isDark ? 'text-white' : 'text-gray-900'
                          : isDark 
                            ? 'text-gray-400 group-hover:text-white' 
                            : 'text-gray-500 group-hover:text-gray-900'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`absolute right-3 w-1.5 h-1.5 rounded-full ${
                          isDark ? 'bg-blue-400' : 'bg-gray-600'
                        }`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                );
              })}
            </nav>
            <div className={`px-4 py-4 ${
              isDark 
                ? 'bg-gray-900 border-t border-gray-700' 
                : 'bg-gray-100 border-t border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-9 w-9 rounded-full ${
                    isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                  } flex items-center justify-center font-semibold`}>
                    A
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>admin@example.com</p>
                  </div>
                </div>
                <button className={`p-1.5 rounded-lg ${
                  isDark 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                } transition-colors duration-150`}>
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
