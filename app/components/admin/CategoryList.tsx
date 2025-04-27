'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export function CategoryList() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesRes = await fetch('/api/categories', {
        cache: 'no-store'
      });

      if (!categoriesRes.ok) {
        throw new Error('Veriler yüklenirken bir hata oluştu');
      }

      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.sort((a: Category, b: Category) => a.order - b.order));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchCategories();
    }
  }, [mounted, fetchCategories]);

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Kategori silinirken bir hata oluştu');
        }

        setCategories(prev => prev.filter(c => c.id !== categoryId));
        toast.success('Kategori başarıyla silindi');
        router.refresh();
      } catch (error) {
        console.error('Silme hatası:', error);
        toast.error(error instanceof Error ? error.message : 'Kategori silinirken bir hata oluştu');
      }
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setCategories(updatedItems);

    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItems),
      });

      if (!response.ok) {
        throw new Error('Sıralama güncellenirken bir hata oluştu');
      }

      router.refresh();
    } catch (error) {
      console.error('Sıralama güncelleme hatası:', error);
      toast.error('Sıralama güncellenirken bir hata oluştu');
    }
  };

  if (!mounted || loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Kategoriler</h1>
          <button
            onClick={() => router.push('/admin/categories/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Yeni Kategori
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Menünüzdeki kategorileri buradan yönetebilirsiniz. Sıralamayı değiştirmek için kategorileri sürükleyebilirsiniz.
        </p>
        <div className="overflow-hidden">
          <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-50 rounded-t-lg">
            <div className="col-span-1 text-sm font-medium text-gray-500">İkon</div>
            <div className="col-span-6 text-sm font-medium text-gray-500">Ad</div>
            <div className="col-span-3 text-sm font-medium text-gray-500">Sıra</div>
            <div className="col-span-2 text-sm font-medium text-gray-500 text-right">İşlemler</div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {categories.map((category, index) => (
                    <Draggable 
                      key={category.id} 
                      draggableId={category.id} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="grid grid-cols-12 gap-4 items-center py-3 px-4 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="col-span-1 text-xl">{category.icon || '🍽️'}</div>
                          <div className="col-span-6">{category.name}</div>
                          <div className="col-span-3">{category.order}</div>
                          <div className="col-span-2 flex justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/categories/edit/${category.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
} 