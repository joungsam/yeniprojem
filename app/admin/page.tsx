'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from "@/app/components/ui/card";
import { Category, Product } from "@prisma/client";
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

// Animasyon varyantları
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

const quickLinkVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export default function AdminDashboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    todayVisits: 0,
    totalVisits: 0,
    activeUsers: 0,
    lastUpdated: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Kategorileri çek
        const categoriesResponse = await fetch('/api/categories');
        const categories: Category[] = await categoriesResponse.json();

        // Ürünleri çek - tüm ürünleri almak için limit parametresini yüksek bir değere ayarla
        const productsResponse = await fetch('/api/products?limit=1000');
        const productsData = await productsResponse.json();
        
        // API'den gelen veri yapısını kontrol et
        const products = productsData.products || (Array.isArray(productsData) ? productsData : []);

        // Ziyaret istatistiklerini sabit değerlerle ayarla
        const now = new Date();
        
        setStats({
          totalCategories: categories.length,
          totalProducts: products.length,
          todayVisits: 75, // Sabit değer
          totalVisits: 750, // Sabit değer
          activeUsers: 5, // Sabit değer
          lastUpdated: now.toLocaleTimeString('tr-TR')
        });
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
      }
    };

    fetchStats();
    // Her 5 dakikada bir güncelle
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Kontrol Paneli
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Menü istatistiklerinizi ve performansınızı buradan takip edebilirsiniz.
            </p>
          </div>
          <div className={`flex items-center text-sm ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 text-gray-300' 
              : 'bg-white border border-gray-200 text-gray-700'
          } px-4 py-2 rounded-lg shadow-sm`}>
            <svg className={`w-4 h-4 mr-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Son güncelleme: {stats.lastUpdated}
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 text-white' 
              : 'bg-gray-50 border border-gray-200 text-gray-800'
          } rounded-lg shadow-sm hover:shadow transition-shadow duration-200`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Toplam Kategori
                </h3>
                <span className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline">
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalCategories}
                </p>
                <span className={`ml-2 text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Aktif
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          } rounded-lg shadow-sm hover:shadow transition-shadow duration-200`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Toplam Ürün
                </h3>
                <span className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline">
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalProducts}
                </p>
                <span className={`ml-2 text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Aktif
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          } rounded-lg shadow-sm hover:shadow transition-shadow duration-200`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Bugünkü Ziyaretçi
                </h3>
                <span className={`p-2 rounded-lg ${isDark ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline">
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.todayVisits}
                </p>
                <span className={`ml-2 text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  +12%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          } rounded-lg shadow-sm hover:shadow transition-shadow duration-200`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Toplam Ziyaretçi
                </h3>
                <span className={`p-2 rounded-lg ${isDark ? 'bg-cyan-900/30' : 'bg-cyan-50'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline">
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalVisits}
                </p>
                <span className={`ml-2 text-sm font-medium ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  +5%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-gray-800 border border-gray-700 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          } rounded-lg shadow-sm hover:shadow transition-shadow duration-200`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Aktif Kullanıcı
                </h3>
                <span className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <svg className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <div className="flex items-baseline">
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.activeUsers}
                </p>
                <span className={`ml-2 text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Çevrimiçi
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className={`mt-8 ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-gray-50 border border-gray-200'
        } rounded-lg shadow-sm p-6`}
      >
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6 flex items-center`}>
          <svg className={`w-6 h-6 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Hızlı Erişim
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div whileHover="hover" variants={quickLinkVariants}>
            <Link href="/admin/categories" className={`flex items-center p-4 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-gray-50 border border-gray-200'
            } rounded-lg transition-all duration-200 h-full`}>
              <span className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} mr-3`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </span>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'} text-lg`}>Kategoriler</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Kategorileri yönet</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={quickLinkVariants}>
            <Link href="/admin/products" className={`flex items-center p-4 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-gray-50 border border-gray-200'
            } rounded-lg transition-all duration-200 h-full`}>
              <span className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'} mr-3`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </span>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'} text-lg`}>Ürünler</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ürünleri yönet</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div whileHover="hover" variants={quickLinkVariants}>
            <Link href="/admin/settings" className={`flex items-center p-4 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-gray-50 border border-gray-200'
            } rounded-lg transition-all duration-200 h-full`}>
              <span className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mr-3`}>
                <svg className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'} text-lg`}>Ayarlar</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sistem ayarları</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className={`mt-8 p-6 ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-gray-50 border border-gray-200'
        } rounded-lg shadow-sm`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>QR Menü Sistemi</h2>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Müşterilerinize daha iyi bir deneyim sunun</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Menüyü Görüntüle
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
