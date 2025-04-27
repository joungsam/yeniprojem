'use client';

import { useEffect, useState, useRef } from 'react';
import { Category } from '@prisma/client';
import { useSettingsStore } from '@/app/store/settingsStore';

interface MobileCategoryTabsProps {
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string | null;
}

export function MobileCategoryTabs({ onCategorySelect, selectedCategory }: MobileCategoryTabsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const { appearance } = useSettingsStore();
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Kategoriler yüklenirken bir hata oluştu');
        const data = await response.json();
        setCategories(data.sort((a: Category, b: Category) => a.order - b.order));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Seçilen sekmeyi görünür alana kaydırma
  useEffect(() => {
    if (selectedCategory && tabsRef.current) {
      const selectedTab = tabsRef.current.querySelector(`[data-category="${selectedCategory}"]`) as HTMLElement;
      if (selectedTab) {
        // scrollIntoView yöntemi ile seçilen sekmeyi ortaya getir
        selectedTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 p-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-8 w-28 bg-gray-800 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800 p-2">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  // Tema rengini al
  const primaryColor = appearance.primaryColor || '#9D2235';

  return (
    <div className="sticky top-0 z-20 bg-black border-b border-gray-800 w-full">
      <div className="relative overflow-x-auto scrollbar-hide w-full" ref={tabsRef}>
        <div className="flex space-x-2 p-2 w-full justify-start overflow-x-auto">
          {/* Kategori sekmeleri */}
          {categories.map((category) => (
            <button
              key={category.id}
              data-category={category.id.toString()}
              onClick={() => onCategorySelect(category.id.toString())}
              style={{ 
                backgroundColor: selectedCategory === category.id.toString() 
                  ? primaryColor 
                  : undefined
              }}
              className={`flex items-center px-3 py-2 rounded-lg whitespace-nowrap min-w-max text-sm ${
                selectedCategory === category.id.toString() 
                  ? 'text-white font-medium shadow-md' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <span className="mr-1.5 text-base">{category.icon || '🍽️'}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Soldaki gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
      
      {/* Sağdaki gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
    </div>
  );
}
