'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export function MenuCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Kategoriler yüklenirken bir hata oluştu');
        const data = await response.json();
        setCategories(data.sort((a: Category, b: Category) => a.order - b.order));
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
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
      <div className="overflow-x-auto py-4">
        <div className="flex space-x-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-12 w-32 bg-gray-200 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="overflow-x-auto py-4 scrollbar-hide">
            <motion.div 
              className="flex space-x-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.06
                  }
                }
              }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex-shrink-0 inline-flex items-center px-4 py-2 rounded-lg
                    text-sm font-medium transition-colors duration-200
                    ${selectedCategory === category.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" 
                  }}
                  whileTap={{ scale: 0.95 }}
                  layout
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                >
                  <motion.span 
                    className="mr-2"
                    animate={{ scale: selectedCategory === category.id ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {category.icon || '🍽️'}
                  </motion.span>
                  {category.name}
                </motion.button>
              ))}
            </motion.div>
          </div>
          
          {/* Soldaki gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
          
          {/* Sağdaki gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </nav>
  );
}
