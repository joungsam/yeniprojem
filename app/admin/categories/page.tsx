'use client';

import { useState, useEffect } from 'react';
import { Category } from '@prisma/client';
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { PlusIcon, CheckIcon, XMarkIcon, TrashIcon, FolderIcon, FolderPlusIcon } from '@heroicons/react/24/outline';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { useCategoryStore } from '@/app/store/categoryStore';
import { useThemeStore } from '@/app/store/themeStore';
import { useUndoStore } from '@/app/store/undoStore';
import { CategoryForm } from '@/app/components/admin/CategoryForm';
import { SortableCategory } from '@/app/components/admin/SortableCategory';
import { useRouter } from 'next/navigation';

// Kategori ve ürün sayısı tipini tanımla
interface CategoryWithProductCount extends Category {
  productCount: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [categories, setCategories] = useState<CategoryWithProductCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProductCount | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithProductCount | null>(null);
  const [deletingCategories, setDeletingCategories] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Geri alma işlemleri için undoStore kullan
  const { 
    lastDeletedCategories, 
    showCategoryUndoButton, 
    categoryUndoCountdown, 
    isCategoryRestoring,
    setLastDeletedCategories,
    setShowCategoryUndoButton,
    setCategoryUndoCountdown,
    setIsCategoryRestoring,
    startCategoryTimer
  } = useUndoStore();

  // DnD için sensörler
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Geri alma işlemi için useEffect
  useEffect(() => {
    if (lastDeletedCategories.length > 0) {
      startCategoryTimer();
    }
  }, [lastDeletedCategories, startCategoryTimer]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Kategorileri çek
      const response = await fetch('/api/categories', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Kategoriler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // Ürünleri çek - tüm ürünleri almak için limit parametresini yüksek bir değere ayarla
      const productsResponse = await fetch('/api/products?limit=1000');
      
      if (!productsResponse.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      
      const productsData = await productsResponse.json();
      
      // API'den gelen veri yapısını kontrol et
      // Eğer products özelliği varsa onu kullan, yoksa doğrudan veriyi kullan
      const productsArray = productsData.products || (Array.isArray(productsData) ? productsData : []);
      
      // Kategori verilerini ürün sayılarıyla birlikte al
      const categoriesWithProductCount = data.map((category: Category) => {
        // Her kategori için ürün sayısını hesapla
        const productCount = productsArray.filter((product: any) => product.categoryId === category.id).length;
        
        return {
          ...category,
          productCount: productCount,
        };
      });
      
      // Kategorileri sıralama numarasına göre sırala
      const sortedCategories = categoriesWithProductCount.sort((a: CategoryWithProductCount, b: CategoryWithProductCount) => a.order - b.order);
      
      setCategories(sortedCategories);
      setError(null);
    } catch (err) {
      console.error('Kategoriler yüklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (data: { name: string; icon?: string | null }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          icon: data.icon || null,
          order: categories.length, // Yeni kategori en sona eklenir
        }),
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: result.error || 'Kategori eklenirken bir hata oluştu'
        });
        throw new Error(result.error || 'Kategori eklenirken bir hata oluştu');
      }
      
      await fetchCategories();
      setIsFormOpen(false);
      
      toast({
        variant: "success",
        title: "Başarılı!",
        description: "Kategori başarıyla eklendi"
      });
    } catch (err) {
      console.error('Kategori ekleme hatası:', err);
      throw new Error(err instanceof Error ? err.message : 'Kategori eklenirken bir hata oluştu');
    }
  };

  // Kategori store'undan updateTimestamp fonksiyonunu al
  const updateCategoryTimestamp = useCategoryStore(state => state.updateTimestamp);

  const handleUpdate = async (data: { name: string; icon?: string | null }) => {
    if (!selectedCategory) return;

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          icon: data.icon || null,
          order: selectedCategory.order,
        }),
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Kategori güncellenirken bir hata oluştu');
      
      await fetchCategories();
      setIsFormOpen(false);
      setSelectedCategory(null);
      
      // Kategori güncellendiğinde timestamp'i güncelle
      updateCategoryTimestamp();
      
      toast({
        variant: "success",
        title: "Başarılı!",
        description: "Kategori başarıyla güncellendi"
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: err instanceof Error ? err.message : 'Bir hata oluştu'
      });
      throw new Error(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleDelete = async (category: CategoryWithProductCount) => {
    // Eğer kategori ürün içeriyorsa, silme işlemini engelle
    if (category.productCount > 0) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: `"${category.name}" kategorisi ${category.productCount} ürün içerdiği için silinemez. Önce bu kategorideki ürünleri silmelisiniz.`
      });
      return;
    }
    
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingCategories(new Set([categoryToDelete.id]));
      
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: data.error || 'Kategori silinirken bir hata oluştu',
        });
        setDeletingCategories(new Set());
        return;
      }

      // Kategoriyi listeden kaldır
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
      
      // Modalı kapat ve state'i temizle
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setDeletingCategories(new Set());
      
      // Global state'i güncelle ve timer'ı başlat
      setLastDeletedCategories([categoryToDelete]);
      startCategoryTimer();
      
      // Sayfayı yenilemeye gerek yok, zaten kategoriyi UI'dan kaldırdık
      // router.refresh();

      toast({
        variant: "success",
        title: "Başarılı!",
        description: "Kategori başarıyla silindi",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: err instanceof Error ? err.message : 'Kategori silinirken bir hata oluştu',
      });
      setDeletingCategories(new Set());
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id.toString() === active.id);
    const newIndex = categories.findIndex((cat) => cat.id.toString() === over.id);
    
    const newCategories = arrayMove(categories, oldIndex, newIndex);
    
    // Sıralama numaralarını güncelle
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index,
    }));

    setCategories(updatedCategories);

    // Yeni sıralamayı sunucuya kaydet
    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updatedCategories }),
      });

      if (!response.ok) {
        throw new Error('Sıralama güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      // Hata durumunda orijinal sıralamaya geri dön
      await fetchCategories();
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (categoryId: string) => {
    if (!isSelectionMode) return;
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parseInt(categoryId, 10))) {
        newSet.delete(parseInt(categoryId, 10));
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(parseInt(categoryId, 10));
      }
      return newSet;
    });
  };

  const handleSelectAllCategories = () => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedCategories(new Set(filteredCategories.map(c => c.id)));
    } else {
      if (selectedCategories.size === filteredCategories.length) {
        setSelectedCategories(new Set());
        setIsSelectionMode(false);
      } else {
        setSelectedCategories(new Set(filteredCategories.map(c => c.id)));
      }
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedCategories(new Set());
  };

  const handleBulkDelete = async () => {
    try {
      // Önce seçili kategorilerin ürün içerip içermediğini kontrol et
      const categoriesWithProducts = filteredCategories
        .filter(c => selectedCategories.has(c.id) && c.productCount > 0);
      
      // Eğer ürün içeren kategoriler varsa, hata göster
      if (categoriesWithProducts.length > 0) {
        const categoryNames = categoriesWithProducts.map(c => c.name).join(', ');
        toast({
          variant: "destructive",
          title: "Hata!",
          description: `Bazı kategoriler ürün içerdiği için silinemez: ${categoryNames}`
        });
        setIsBulkDeleteModalOpen(false);
        return;
      }
      
      setDeletingCategories(new Set(selectedCategories));
      const categoriesToDelete = categories.filter(c => selectedCategories.has(c.id));
      
      const response = await fetch('/api/categories/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryIds: Array.from(selectedCategories).map(id => id)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: data.error || 'Kategoriler silinirken bir hata oluştu'
        });
        setDeletingCategories(new Set());
        setIsBulkDeleteModalOpen(false);
        return;
      }

      // Kategorileri listeden kaldır
      setCategories(prev => prev.filter(c => !selectedCategories.has(c.id)));
      
      // Global state'i güncelle ve timer'ı başlat
      setLastDeletedCategories(categoriesToDelete);
      startCategoryTimer();
      setSelectedCategories(new Set());
      setDeletingCategories(new Set());
      setIsBulkDeleteModalOpen(false);
      setIsSelectionMode(false);
      setSearchQuery('');
      
      // Sayfayı yenile
      router.refresh();

      toast({
        variant: "success",
        title: "Başarılı!",
        description: `${selectedCategories.size} kategori başarıyla silindi`
      });
    } catch (error) {
      console.error('Kategoriler silinirken hata oluştu:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Kategoriler silinirken bir hata oluştu'
      });
      setDeletingCategories(new Set());
    }
  };

  const handleUndoRestore = async () => {
    if (isCategoryRestoring) return;
    
    setIsCategoryRestoring(true);
    
    try {
      // Kategorileri orijinal sıra numaralarıyla geri yükle
      // API tarafında tüm kategoriler 0'dan yeniden sıralanacak
      const response = await fetch('/api/categories/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: lastDeletedCategories }),
      });

      if (!response.ok) {
        throw new Error('Kategoriler geri yüklenirken bir hata oluştu');
      }

      // Kategorileri listeye eklemek yerine, verileri yeniden çek
      await fetchCategories();
      
      setLastDeletedCategories([]);
      setShowCategoryUndoButton(false);
      setCategoryUndoCountdown(10);
      
      toast({
        title: "Kategoriler başarıyla geri yüklendi",
        variant: "success",
      });
    } catch (error) {
      console.error('Kategoriler geri yüklenirken hata:', error);
      toast({
        title: "Kategoriler geri yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsCategoryRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
        <div className={`mx-auto max-w-7xl rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 shadow-sm sm:p-6 lg:p-8`}>
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-48 mb-2`}></div>
                <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-64`}></div>
              </div>
              <div className="flex gap-2">
                <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-32`}></div>
                <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-32`}></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-24 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Boş durum kontrolü
  const isEmpty = filteredCategories.length === 0;

  // Kategori form modalı
  const renderCategoryForm = () => {
    return (
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={selectedCategory ? handleUpdate : handleCreate}
        initialData={selectedCategory || undefined}
        title={selectedCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
      />
    );
  };

  // Silme onay modalı
  const renderDeleteConfirmModal = () => {
    if (!isDeleteModalOpen || !categoryToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full shadow-xl`}>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Kategori Silme Onayı
          </h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            <span className="font-semibold">{categoryToDelete.name}</span> kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınabilir.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingCategories.has(categoryToDelete.id)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingCategories.has(categoryToDelete.id)}
            >
              {deletingCategories.has(categoryToDelete.id) ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Siliniyor...
                </div>
              ) : (
                'Sil'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Toplu silme onay modalı
  const renderBulkDeleteConfirmModal = () => {
    if (!isBulkDeleteModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full shadow-xl`}>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Toplu Kategori Silme Onayı
          </h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Seçili {selectedCategories.size} kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınabilir.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              {deletingCategories.size > 0 ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Siliniyor...
                </div>
              ) : (
                'Sil'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-2 sm:p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Kategoriler</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Menünüzdeki kategorileri buradan yönetebilirsiniz.
            </p>
          </div>
          <div className="flex gap-2">
            {isSelectionMode ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  disabled={selectedCategories.size === 0}
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Seçilenleri Sil ({selectedCategories.size})
                </Button>
                <Button variant="outline" onClick={exitSelectionMode}>
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  İptal
                </Button>
              </>
            ) : (
              <>
                {showCategoryUndoButton && (
                  <Button
                    variant="outline"
                    onClick={handleUndoRestore}
                    disabled={isCategoryRestoring}
                    className={`border-yellow-500 text-yellow-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-yellow-50 hover:text-yellow-700'}`}
                  >
                    {isCategoryRestoring ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Geri Yükleniyor...
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        Geri Al ({lastDeletedCategories.length}) ({categoryUndoCountdown}s)
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsSelectionMode(true)}
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Çoklu Seçim
                </Button>
                <Button onClick={() => {
                  setSelectedCategory(null);
                  setIsFormOpen(true);
                }}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Yeni Kategori
                </Button>
              </>
            )}
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:scale-105 duration-300`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-md p-3`}>
                  <FolderIcon className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Toplam Kategori</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{categories.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {categories.length > 0 ? 'Kategoriler sürükle-bırak ile sıralanabilir' : 'Henüz kategori yok'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:scale-105 duration-300`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isDark ? 'bg-green-900/30' : 'bg-green-50'} rounded-md p-3`}>
                  <FolderPlusIcon className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Ürün İçeren Kategoriler</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {categories.filter(c => c.productCount > 0).length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {categories.filter(c => c.productCount > 0).length > 0 
                    ? 'Ürün içeren kategoriler silinemez' 
                    : 'Henüz ürün içeren kategori yok'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:scale-105 duration-300`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} rounded-md p-3`}>
                  <CheckIcon className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Seçili Kategoriler</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedCategories.size}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isSelectionMode 
                    ? selectedCategories.size > 0 
                      ? 'Seçili kategorileri toplu işlemler için kullanabilirsiniz' 
                      : 'Henüz kategori seçilmedi'
                    : 'Toplu işlem için "Çoklu Seçim" butonuna tıklayın'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:scale-105 duration-300`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isDark ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-md p-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Kategori Performansı</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {categories.length > 0 ? '%100' : '0%'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Kategorileriniz aktif ve görünür durumda
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Arama ve Filtreleme */}
        <div className="mt-8">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden rounded-xl border shadow-sm`}>
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-grow">
                  <label htmlFor="search" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Kategori Ara
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="search"
                      placeholder="Kategori adı ile ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`block w-full rounded-md border-0 py-2 pl-10 ${
                        isDark 
                          ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                          : 'bg-white text-gray-900 placeholder-gray-500 border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Hızlı Filtreler
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className={`inline-flex items-center px-3 py-2 border ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      Tümü
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('menu')}
                      className={`inline-flex items-center px-3 py-2 border ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      Menü
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('içecek')}
                      className={`inline-flex items-center px-3 py-2 border ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      İçecekler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/50' : 'bg-red-100'} text-red-600`}>
            {error}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(category => category.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 mt-4">
                {filteredCategories.length === 0 ? (
                  <div className={`p-8 text-center rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium mb-1">Kategori Bulunamadı</h3>
                    <p className="text-sm">Arama kriterlerinize uygun kategori bulunamadı. Lütfen farklı bir arama terimi deneyin veya yeni bir kategori ekleyin.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                        setIsFormOpen(true);
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Yeni Kategori Ekle
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`flex justify-between items-center mb-2 px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'
                    }`}>
                      <div className="text-sm font-medium">
                        {filteredCategories.length} kategori bulundu
                      </div>
                      {isSelectionMode && (
                        <button
                          onClick={handleSelectAllCategories}
                          className={`text-sm font-medium ${
                            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {selectedCategories.size === filteredCategories.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                        </button>
                      )}
                    </div>
                    {filteredCategories.map((category) => (
                      <SortableCategory
                        key={category.id}
                        category={category}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedCategories.has(category.id)}
                        isDeleting={deletingCategories.has(category.id)}
                        onEdit={() => {
                          setSelectedCategory(category);
                          setIsFormOpen(true);
                        }}
                        onDelete={() => handleDelete(category)}
                        onClick={() => handleSelectCategory(category.id.toString())}
                      />
                    ))}
                  </>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Kategori form modalı */}
        {renderCategoryForm()}

        {/* Silme onay modalı */}
        {renderDeleteConfirmModal()}

        {/* Toplu silme onay modalı */}
        {renderBulkDeleteConfirmModal()}
      </div>
    </div>
  );
}
