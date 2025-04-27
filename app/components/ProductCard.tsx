import React from 'react';
import { Product } from '@prisma/client';
import { ShoppingBagIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  isDark: boolean;
  isSelectionMode: boolean;
  selectedProducts: Set<number>;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSelect: (productId: string) => void;
  getCategoryName: (categoryId: number | null) => string;
  deletingProducts: Set<number>;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isDark,
  isSelectionMode,
  selectedProducts,
  onEdit,
  onDelete,
  onSelect,
  getCategoryName,
  deletingProducts
}) => {
  return (
    <div
      className={`group relative ${
        isDark
          ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
          : 'bg-white border border-gray-200'
      } rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
        isSelectionMode ? 'cursor-pointer' : ''
      } ${
        isSelectionMode && selectedProducts.has(product.id) ? 'ring-2 ring-[#D84727]' : ''
      } transform hover:translate-y-[-4px]`}
      onClick={() => isSelectionMode ? onSelect(product.id.toString()) : null}
    >
      {/* Ürün Resmi */}
      <div className="relative aspect-square w-full overflow-hidden">
        {product.image ? (
          <div className="h-full w-full">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDark ? 'bg-gradient-to-t from-gray-900 to-transparent' : 'bg-gradient-to-t from-black/40 to-transparent'
            }`}></div>
          </div>
        ) : (
          <div className={`h-full w-full flex items-center justify-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <ShoppingBagIcon className={`h-20 w-20 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        )}
        {/* Fiyat Etiketi */}
        <div className="absolute bottom-2 right-2">
          <div className={`px-2 py-0.5 rounded-md text-xs font-medium shadow-sm backdrop-blur-sm ${
            isDark
              ? 'bg-gradient-to-r from-indigo-500/60 to-purple-500/60 text-white border border-indigo-400/30'
              : 'bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white border border-indigo-400/30'
          }`}>
            <span className="mr-0.5 text-[10px] opacity-80">₺</span>
            {product.price.toFixed(2)}
          </div>
        </div>
      </div>
      {/* Kategori etiketi */}
      <div className="absolute top-2 left-2">
        <span className={`inline-block max-w-[90%] truncate px-2 py-0.5 rounded-md text-[10px] font-medium shadow-sm ${
          isDark
            ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white backdrop-blur-sm border border-purple-400/20'
            : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white backdrop-blur-sm border border-purple-400/20'
        }`} title={getCategoryName(product.categoryId)}>
          {getCategoryName(product.categoryId)}
        </span>
      </div>
      {/* Ürün Adı ve Butonlar */}
      <div className="p-2">
        <h3 className={`font-bold text-sm truncate mb-1 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            <span className="text-gray-500">Sıra:</span>
            <span className={`${isDark ? 'text-green-400' : 'text-green-600'}`}>{product.order + 1}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="p-1 rounded-md bg-gray-800/70 hover:bg-gray-700/80 text-white backdrop-blur-sm transition-all duration-200 border border-white/10 shadow-sm"
              title="Düzenle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              disabled={deletingProducts.has(product.id)}
              className={`p-1 rounded-md bg-red-500/70 hover:bg-red-500/90 text-white backdrop-blur-sm transition-all duration-200 border border-red-400/20 shadow-sm ${
                deletingProducts.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Sil"
            >
              {deletingProducts.has(product.id) ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <TrashIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 