'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  categoryId: number;
};

export default function CategoryPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<{ name: string; icon?: string | null } | null>(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        // Kategori bilgilerini al
        const categoryResponse = await fetch(`/api/categories/${params.id}`);
        if (!categoryResponse.ok) {
          throw new Error('Kategori bilgileri yüklenirken bir hata oluştu');
        }
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        // Kategoriye ait ürünleri al
        const productsResponse = await fetch(`/api/products?categoryId=${params.id}`);
        if (!productsResponse.ok) {
          throw new Error('Ürünler yüklenirken bir hata oluştu');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCategoryAndProducts();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        {category?.icon && <span className="mr-2">{category.icon}</span>}
        {category?.name || 'Kategori'}
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Bu kategoride henüz ürün bulunmuyor
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg shadow-sm overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Resim yok</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{product.price.toFixed(2)} ₺</span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 