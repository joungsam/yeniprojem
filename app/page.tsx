  'use client';

import { useEffect, useState } from 'react';
import Header from "./components/Header";
import { CategoryList } from "./components/CategoryList";
import { ProductList } from "./components/ProductList";
import MobileCategories from "./components/MobileCategories";
import { MobileCategoryTabs } from "./components/MobileCategoryTabs";
import ClientLayout from "./client-layout";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          const sortedCategories = data.sort((a: any, b: any) => a.order - b.order);
          setCategories(sortedCategories);
          
          // İlk kategoriyi otomatik olarak seç
          if (sortedCategories.length > 0 && selectedCategory === null) {
            setSelectedCategory(sortedCategories[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
      }
    };

    fetchCategories();
  }, [selectedCategory]);

  // Prevent scroll restoration on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Kategori seçildiğinde sayfayı kaydırmayı devre dışı bırak
    // Böylece kategori sekmeleri ve içerik sabit kalır
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-white mt-12">
        <div className="flex flex-col">
          <Header />
          
          {/* Mobil Menü Butonu - Header'da dil seçeneğinin yanında */}
          
          {/* Mobil Kategori Sekmeleri - Sadece mobil görünümde */}
          <div className="md:hidden block mt-12">
            <MobileCategoryTabs 
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* Mobil görünümde yatay kategori sekmelerini göster */}
        <div className="md:hidden">
          <style jsx global>{`
            /* Mobil görünümde yatay kategori sekmelerini göster */
            @media (max-width: 768px) {
              .product-list-container {
                margin-top: 0 !important;
              }
            }
          `}</style>
        </div>

        <div className="container mx-auto px-4 pt-0 pb-15 bg-white md:mt-0 -mt-15">
          <div className="flex flex-col md:flex-row"> 
            {/* Masaüstü Kategoriler - Sadece masaüstünde görünür */}
            <aside className="hidden md:block" style={{ width: '256px', minWidth: '256px' }}>
              <div className="sticky" style={{ width: '256px', top: '120px' }}>
                <div className="pr-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <CategoryList onCategorySelect={handleCategorySelect} />
                </div>
              </div>
            </aside>

            {/* Ana İçerik */}
            <div className="flex-1 md:pl-8">
              <div className="max-h-[calc(100vh-120px)] overflow-y-auto mt-20">
                <ProductList selectedCategory={selectedCategory} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </ClientLayout>
  );
}
