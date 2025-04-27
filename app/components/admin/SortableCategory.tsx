'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from '@prisma/client';
import { PencilIcon, TrashIcon, CheckIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { useThemeStore } from '@/app/store/themeStore';

// Extend Category to include productCount
interface CategoryWithProductCount extends Category {
  productCount: number;
}

interface Props {
  category: CategoryWithProductCount;
  isSelectionMode: boolean;
  isSelected: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

export function SortableCategory({
  category,
  isSelectionMode,
  isSelected,
  isDeleting,
  onEdit,
  onDelete,
  onClick,
}: Props) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg border ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      } rounded-lg p-4 cursor-move ${
        isDragging ? `shadow-2xl ${isDark ? 'bg-gray-700' : 'bg-white'} scale-105` : ''
      } ${isSelectionMode ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-2 ring-[#D84727]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
            {category.icon ? (
              <span className="text-2xl">{category.icon}</span>
            ) : (
              <span className="text-2xl">📁</span>
            )}
          </div>
          <div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{category.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isDark 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                Sıra: {category.order}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                category.productCount > 0 
                  ? isDark 
                    ? 'bg-green-900/30 text-green-400' 
                    : 'bg-green-100 text-green-800' 
                  : isDark 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                Ürün: {category.productCount}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 sm:mt-0 w-full sm:w-auto flex justify-end">
          {isSelectionMode ? (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isSelected
                  ? 'bg-[#D84727]'
                  : isDark 
                    ? 'bg-gray-700 border-2 border-gray-600' 
                    : 'bg-white border-2 border-gray-300'
              }`}
            >
              {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className={`${
                  isDark 
                    ? 'border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500 hover:text-white' 
                    : 'border-gray-300 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <PencilIcon className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Düzenle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={isDeleting || category.productCount > 0}
                className={`${
                  isDark 
                    ? 'border-red-500/50 bg-red-800/20 text-red-300 hover:bg-red-700/30 hover:text-red-200 hover:border-red-500/70' 
                    : 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                } ${
                  category.productCount > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={category.productCount > 0 ? 'Bu kategori ürün içerdiği için silinemez' : ''}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin sm:mr-1" />
                    <span className="hidden sm:inline">Siliniyor</span>
                  </div>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Sil</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
