'use client';

import { useEffect, useState } from 'react';
import { Base64Image } from './ui/base64-image';
import { useSettingsStore } from '@/app/store/settingsStore';
import { ProductPreviewModal } from './ProductPreviewModal'; // Import the modal component

// Manuel olarak tipleri tanımlayalım
interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  categoryId: number;
  order: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  icon?: string | null;
  order: number;
  isActive: boolean;
}

interface ProductListProps {
  selectedCategory: string | null;
}

export function ProductList({ selectedCategory }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { appearance } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null); // State for selected product

  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?limit=1000'),
          fetch('/api/categories')
        ]);

        if (!productsRes.ok || !categoriesRes.ok) {
          throw new Error('Veriler yüklenirken bir hata oluştu');
        }

        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json()
        ]);

        // API'den gelen veri yapısını kontrol et
        // Eğer products özelliği varsa onu kullan, yoksa doğrudan veriyi kullan
        const productsArray = productsData.products || (Array.isArray(productsData) ? productsData : []);
        setProducts(productsArray);
        setCategories(categoriesData.sort((a: Category, b: Category) => a.order - b.order));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to open the modal
  const openModal = (product: Product) => {
    setSelectedProductForModal(product);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProductForModal(null);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 bg-gray-800 rounded-lg w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-40 lg:h-52 w-full"></div>
                  <div className="p-3">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

  // Eğer selectedCategory varsa, sadece o kategoriyi göster
  const filteredCategories = selectedCategory
    ? categories.filter(category => category.id.toString() === selectedCategory)
    : categories;

  return (
    <> {/* Wrap with Fragment to include modal */}
      <div className="space-y-4 pb-16 product-list-container">
        {filteredCategories.map((category) => {
          const categoryProducts = products.filter(product => product.categoryId === category.id);
        
        if (categoryProducts.length === 0) return null;

        return (
          <section 
            key={category.id} 
            id={`category-${category.id}`}
          >
            <div className="bg-black rounded-lg p-3 mb-2">
              <h2 className="text-primary text-xl font-bold text-center uppercase">
                {category.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-black rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" // Add cursor and hover effect
                  onClick={() => openModal(product)} // Open modal on click
                >
                  {product.image ? (
                    <div className="relative h-40 lg:h-52 w-full p-1">
                      <div className="h-full w-full border border-white rounded-sm overflow-hidden">
                        <Base64Image
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-primary text-white font-bold px-2 py-1 rounded-sm shadow-md text-sm">
                          ₺{product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-40 lg:h-52 w-full p-1">
                      <div className="h-full w-full border border-white rounded-sm overflow-hidden bg-gray-800">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl">🍽️</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-primary text-white font-bold px-2 py-1 rounded-sm shadow-md text-sm">
                          ₺{product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-3 text-center">
                    <h3 className="text-primary text-lg font-bold uppercase">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1 text-gray-300 text-sm">{product.description}</p>
                    )}
                    {appearance.showFooterNote && appearance.footerNote && (
                      <p className="mt-1 text-secondary text-xs">{appearance.footerNote}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      </div>

      {/* Render the modal */}
      <ProductPreviewModal
        product={selectedProductForModal}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}
