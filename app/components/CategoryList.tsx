'use client';

import { useEffect, useState } from 'react';
import { Category } from "@prisma/client";
import { useSettingsStore } from '@/app/store/settingsStore';

interface CategoryListProps {
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryList({ onCategorySelect }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { appearance } = useSettingsStore();
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    // Kaydırma işlemini kaldırdık
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId);
  };

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

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded-lg shadow-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }


  return (
    <div className="space-y-3">
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id.toString())}
          className={`
            w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg whitespace-normal shadow-md
            ${selectedCategory === category.id.toString()
              ? 'bg-primary text-white'
              : 'bg-black text-primary hover:bg-gray-900 border border-gray-800'
            }
          `}
        >
          <span className="mr-3 text-xl flex-shrink-0">{category.icon || '🍽️'}</span>
          <span className="font-medium uppercase text-left">{category.name}</span>
        </button>
      ))}
    </div>
  );
}
