'use client';
  
import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, Category } from '@prisma/client';
import { Button } from "@/app/components/ui/button";
import { PlusIcon, CheckIcon, XMarkIcon, TrashIcon, ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';
import { useToast } from "@/app/components/ui/use-toast";
import { ProductFormModal } from "@/app/components/ProductFormModal";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { Base64Image } from '@/app/components/ui/base64-image';
import { useThemeStore } from '@/app/store/themeStore';
import { useRouter } from 'next/navigation';
import { useUndoStore } from '@/app/store/undoStore';

export default function ProductsPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingProducts, setDeletingProducts] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Sayfalama için state'ler
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [displayLimit, setDisplayLimit] = useState(1000); // Tüm ürünleri göstermek için yüksek bir değer
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Geri alma işlemleri için undoStore kullan
  const { 
    lastDeletedProducts, 
    showProductUndoButton, 
    productUndoCountdown, 
    isProductRestoring,
    setLastDeletedProducts,
    setShowProductUndoButton,
    setProductUndoCountdown,
    setIsProductRestoring,
    startProductTimer
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
    if (lastDeletedProducts.length > 0) {
      startProductTimer();
    }
  }, [lastDeletedProducts, startProductTimer]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Ürünleri çek - tüm ürünleri almak için limit parametresini yüksek bir değere ayarla
      const productsResponse = await fetch('/api/products?limit=1000');
      
      if (!productsResponse.ok) {
        throw new Error('Ürünler yüklenirken bir hata oluştu');
      }
      
      const productsData = await productsResponse.json();
      
      // Kategorileri çek
      const categoriesResponse = await fetch('/api/categories');
      
      if (!categoriesResponse.ok) {
        throw new Error('Kategoriler yüklenirken bir hata oluştu');
      }
      
      const categoriesData = await categoriesResponse.json();
      
      // API'den gelen veri yapısını kontrol et
      // Eğer products özelliği varsa onu kullan, yoksa doğrudan veriyi kullan
      const productsArray = productsData.products || (Array.isArray(productsData) ? productsData : []);
      const sortedProducts = [...productsArray].sort((a: Product, b: Product) => a.order - b.order);
      
      setProducts(sortedProducts);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error('Veriler yüklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          order: products.length, // Yeni ürün en sona eklenir
        }),
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: result.error || 'Ürün eklenirken bir hata oluştu'
        });
        throw new Error(result.error || 'Ürün eklenirken bir hata oluştu');
      }
      
      await fetchData();
      setIsFormOpen(false);
      
      toast({
        variant: "success",
        title: "Başarılı!",
        description: "Ürün başarıyla eklendi"
      });
    } catch (err) {
      console.error('Ürün ekleme hatası:', err);
      throw new Error(err instanceof Error ? err.message : 'Ürün eklenirken bir hata oluştu');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          order: selectedProduct.order,
        }),
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Ürün güncellenirken bir hata oluştu');
      
      // API'den güncellenmiş ürünü al
      const updatedProduct = await response.json();
      
      // Ürünler listesini güncelle
      const updatedProducts = products.map(product => 
        product.id === selectedProduct.id ? updatedProduct : product
      );
      
      // Tüm state'leri güncelle
      setProducts(updatedProducts);
      
      // Filtrelenmiş ürünleri yeniden hesapla
      const newFilteredProducts = updatedProducts.filter(product => {
        // Kategori filtresi
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'uncategorized') {
            if (product.categoryId) return false;
          } else {
            if (product.categoryId !== parseInt(selectedCategory)) return false;
          }
        }
        
        // Arama filtresi
        if (searchQuery) {
          const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
          const descMatch = product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase());
          if (!nameMatch && !descMatch) return false;
        }
        
        return true;
      });
      
      // Sıralanmış ve filtrelenmiş ürünleri hesapla
      let sortedFilteredProducts = [...newFilteredProducts];
      
      // Sıralama
      sortedFilteredProducts.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'price') {
          comparison = (a.price || 0) - (b.price || 0);
        } else if (sortBy === 'category') {
          const catA = getCategoryName(a.categoryId);
          const catB = getCategoryName(b.categoryId);
          comparison = catA.localeCompare(catB);
        } else { // order
          comparison = a.order - b.order;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      // Görünür ürünleri güncelle
      const newVisibleProducts = sortedFilteredProducts.slice(0, displayLimit);
      setVisibleProducts(newVisibleProducts);
      setHasMore(sortedFilteredProducts.length > displayLimit);
      
      // Modalı kapat ve seçili ürünü temizle
      setIsFormOpen(false);
      setSelectedProduct(null);
      
      // Başarı mesajı göster
      toast({
        variant: "success",
        title: "Başarılı!",
        description: "Ürün başarıyla güncellendi"
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

  const handleDelete = async (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeletingProducts(new Set([productToDelete.id]));
      
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: data.error || 'Ürün silinirken bir hata oluştu',
        });
        setDeletingProducts(new Set());
        return;
      }
      
      // Modalı kapat ve state'i temizle
      setIsDeleteModalOpen(false);
      
      // Global state'i güncelle ve timer'ı başlat
      const deletedProduct = {...productToDelete};
      setLastDeletedProducts([deletedProduct]);
      startProductTimer();
      
      // Verileri yeniden çek
      await fetchData();
      
      setProductToDelete(null);
      setDeletingProducts(new Set());

      toast({
        variant: "success",
        title: "Başarılı!",
        description: "Ürün başarıyla silindi",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: err instanceof Error ? err.message : 'Ürün silinirken bir hata oluştu',
      });
      setDeletingProducts(new Set());
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((product) => product.id.toString() === active.id);
    const newIndex = products.findIndex((product) => product.id.toString() === over.id);
    
    const newProducts = arrayMove(products, oldIndex, newIndex);
    
    // Sıralama numaralarını güncelle
    const updatedProducts = newProducts.map((product, index) => ({
      ...product,
      order: index,
    }));

    setProducts(updatedProducts);

    // Yeni sıralamayı sunucuya kaydet
    try {
      const response = await fetch('/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedProducts }),
      });

      if (!response.ok) {
        throw new Error('Sıralama güncellenirken bir hata oluştu');
      }
      
      // Verileri yeniden çek
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      // Hata durumunda orijinal sıralamaya geri dön
      await fetchData();
    }
  };

  // Kategori ID'sine göre kategori adını bul
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'Kategorisiz';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Kategorisiz';
  };

  // Filtreleme ve sıralama
  const getFilteredAndSortedProducts = () => {
    // Önce kategoriye göre filtrele
    let filtered = products;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'uncategorized') {
        filtered = products.filter(product => !product.categoryId);
      } else {
        filtered = products.filter(product => product.categoryId === parseInt(selectedCategory));
      }
    }
    
    // Sonra arama sorgusuna göre filtrele
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Önce kategoriye göre grupla, sonra sırala
    const groupedByCategory: Record<string, Product[]> = {};
    filtered.forEach(product => {
      const categoryId = (product.categoryId || 0).toString();
      if (!groupedByCategory[categoryId]) {
        groupedByCategory[categoryId] = [];
      }
      groupedByCategory[categoryId].push(product);
    });
    
    // Her kategori içinde ürünleri sırala
    Object.keys(groupedByCategory).forEach(categoryId => {
      groupedByCategory[categoryId].sort((a: Product, b: Product) => {
        let comparison = 0;
        
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'price') {
          comparison = (a.price || 0) - (b.price || 0);
        } else if (sortBy === 'category') {
          const catA = getCategoryName(a.categoryId);
          const catB = getCategoryName(b.categoryId);
          comparison = catA.localeCompare(catB);
        } else { // order
          comparison = a.order - b.order;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    });
    
    // Kategorileri sırala (önce kategorisiz, sonra diğerleri)
    const sortedCategoryIds = Object.keys(groupedByCategory).sort((a, b) => {
      if (a === '0') return -1;
      if (b === '0') return 1;
      return parseInt(a) - parseInt(b);
    });
    
    // Sıralanmış kategorilere göre ürünleri düzleştir
    return sortedCategoryIds.flatMap(categoryId => groupedByCategory[categoryId]);
  };

  const filteredProducts = getFilteredAndSortedProducts();
  
  // Sonsuz kaydırma için useEffect - memoize ile optimize edilmiş
  useEffect(() => {
    // Filtrelenmiş ürünleri güncelle - doğrudan state'e atama
    const newVisibleProducts = [...filteredProducts].slice(0, displayLimit);
    
    // Referans karşılaştırması için JSON.stringify kullan
    const currentJSON = JSON.stringify(visibleProducts.map(p => p.id));
    const newJSON = JSON.stringify(newVisibleProducts.map(p => p.id));
    
    // Sadece değişiklik varsa state'i güncelle
    if (currentJSON !== newJSON) {
      setVisibleProducts(newVisibleProducts);
      setHasMore(filteredProducts.length > displayLimit);
    }
  }, [filteredProducts, displayLimit]);
  
  // Intersection Observer ile sonsuz kaydırma
  useEffect(() => {
    // Önceki observer'ı temizle
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Yeni observer oluştur
    observerRef.current = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        // Daha fazla ürün yükle
        setIsLoadingMore(true);
        
        // Sayfa yükleme işlemini hemen yap
        setDisplayLimit(prev => {
          const newLimit = prev + 16;
          console.log(`Yeni limit: ${newLimit}, Toplam ürün: ${filteredProducts.length}`);
          return newLimit;
        });
        
        // Yükleme durumunu kapat
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 300);
      }
    }, { threshold: 0.5, rootMargin: '100px' });
    
    // Observer'ı loadMoreRef'e bağla
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, filteredProducts.length]);
  
  // Sayfa yüklendiğinde router'ı hazır tut
  useEffect(() => {
    // Boş bir sayfa geçişi yaparak router'ı hazır tut
    const prepareRouter = async () => {
      try {
        await router.prefetch('/admin');
        await router.prefetch('/admin/categories');
        await router.prefetch('/admin/settings');
      } catch (error) {
        console.error('Router prefetch error:', error);
      }
    };
    
    prepareRouter();
  }, [router]);

  const handleSelectProduct = (productId: string) => {
    if (!isSelectionMode) return;
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parseInt(productId, 10))) {
        newSet.delete(parseInt(productId, 10));
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(parseInt(productId, 10));
      }
      return newSet;
    });
  };

  const handleSelectAllProducts = () => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    } else {
      if (selectedProducts.size === filteredProducts.length) {
        setSelectedProducts(new Set());
        setIsSelectionMode(false);
      } else {
        setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
      }
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedProducts(new Set());
  };

  const handleBulkDelete = async () => {
    try {
      setDeletingProducts(new Set(selectedProducts));
      const productsToDelete = products.filter(p => selectedProducts.has(p.id));
      
      const response = await fetch('/api/products/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts).map(id => id)
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ürünler silinirken bir hata oluştu');
      }

      // Ürünleri listeden kaldır
      setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
      
      // Global state'i güncelle ve timer'ı başlat
      setLastDeletedProducts(productsToDelete);
      startProductTimer();
      setSelectedProducts(new Set());
      setDeletingProducts(new Set());
      setIsBulkDeleteModalOpen(false);
      setIsSelectionMode(false);
      setSearchQuery('');
      
      // Sayfayı yenile
      router.refresh();

      toast({
        variant: "success",
        title: "Başarılı!",
        description: `${selectedProducts.size} ürün başarıyla silindi`
      });
    } catch (error) {
      console.error('Ürünler silinirken hata oluştu:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Ürünler silinirken bir hata oluştu'
      });
      setDeletingProducts(new Set());
    }
  };

  const handleUndoRestore = async () => {
    if (isProductRestoring) return;
    
    setIsProductRestoring(true);
    
    try {
      // Ürünleri orijinal sıra numaralarıyla geri yükle
      const response = await fetch('/api/products/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: lastDeletedProducts }),
      });

      if (!response.ok) {
        throw new Error('Ürünler geri yüklenirken bir hata oluştu');
      }

      // Ürünleri listeye eklemek yerine, verileri yeniden çek
      await fetchData();
      
      setLastDeletedProducts([]);
      setShowProductUndoButton(false);
      setProductUndoCountdown(10);
      
      toast({
        title: "Ürünler başarıyla geri yüklendi",
        variant: "success",
      });
    } catch (error) {
      console.error('Ürünler geri yüklenirken hata:', error);
      toast({
        title: "Ürünler geri yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsProductRestoring(false);
    }
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Aynı alan seçildiğinde sıralama yönünü değiştir
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Farklı alan seçildiğinde, o alanı seç ve sıralamayı artan yap
      setSortBy(field);
      setSortOrder('asc');
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
  const isEmpty = filteredProducts.length === 0;

  // Ürün form modalı
  const renderProductForm = () => {
    return (
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={selectedProduct ? handleUpdate : handleCreate}
        product={selectedProduct || undefined}
        title={selectedProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
      />
    );
  };

  // Silme onay modalı
  const renderDeleteConfirmModal = () => {
    if (!isDeleteModalOpen || !productToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full shadow-xl`}>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Ürün Silme Onayı
          </h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            <span className="font-semibold">{productToDelete.name}</span> ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınabilir.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingProducts.has(productToDelete.id)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingProducts.has(productToDelete.id)}
            >
              {deletingProducts.has(productToDelete.id) ? (
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
            Toplu Ürün Silme Onayı
          </h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            Seçili {selectedProducts.size} ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınabilir.
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
              {deletingProducts.size > 0 ? (
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
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Ürünler</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
              Menünüzdeki ürünleri buradan yönetebilirsiniz.
            </p>
          </div>
          <div className="flex gap-2">
            {isSelectionMode ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  disabled={selectedProducts.size === 0}
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Seçilenleri Sil ({selectedProducts.size})
                </Button>
                <Button variant="outline" onClick={exitSelectionMode}>
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  İptal
                </Button>
              </>
            ) : (
              <>
                {showProductUndoButton && (
                  <Button
                    variant="outline"
                    onClick={handleUndoRestore}
                    disabled={isProductRestoring}
                    className={`border-yellow-500 text-yellow-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-yellow-50 hover:text-yellow-700'}`}
                  >
                    {isProductRestoring ? (
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
                        Geri Al ({lastDeletedProducts.length}) ({productUndoCountdown}s)
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
                  setSelectedProduct(null);
                  setIsFormOpen(true);
                }}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Yeni Ürün
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
                  <ShoppingBagIcon className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Toplam Ürün</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{products.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {products.length > 0 ? 'Ürünler kategorilere göre filtrelenebilir' : 'Henüz ürün yok'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:scale-105 duration-300`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isDark ? 'bg-green-900/30' : 'bg-green-50'} rounded-md p-3`}>
                  <TagIcon className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Kategoriler</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {categories.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {categories.length > 0 
                    ? 'Ürünler kategorilere göre düzenlenebilir' 
                    : 'Henüz kategori yok'}
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
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Seçili Ürünler</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedProducts.size}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isSelectionMode 
                    ? selectedProducts.size > 0 
                      ? 'Seçili ürünleri toplu işlemler için kullanabilirsiniz' 
                      : 'Henüz ürün seçilmedi'
                    : 'Toplu işlem için "Çoklu Seçim" butonuna tıklayın'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200 transform hover:scale-105 duration-300`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${isDark ? 'bg-red-900/30' : 'bg-red-50'} rounded-md p-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate`}>Toplam Değer</dt>
                    <dd>
                      <div className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        ₺{products.reduce((total, product) => total + (product.price || 0), 0).toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Menünüzdeki tüm ürünlerin toplam değeri
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Arama ve Filtreleme */}
        <div className="mt-8">
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden rounded-xl border shadow-sm`}>
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-grow">
                  <label htmlFor="search" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Ürün Ara
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
                      placeholder="Ürün adı veya açıklama ile ara..."
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
                <div className="w-full sm:w-64">
                  <label htmlFor="category" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Kategori Filtrele
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`block w-full rounded-md ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="all">Tüm Kategoriler</option>
                    <option value="uncategorized">Kategorisiz</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-48">
                  <label htmlFor="sort" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Sıralama
                  </label>
                  <select
                    id="sort"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className={`block w-full rounded-md ${
                      isDark 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-900 border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="order-asc">Sıra (Artan)</option>
                    <option value="order-desc">Sıra (Azalan)</option>
                    <option value="name-asc">İsim (A-Z)</option>
                    <option value="name-desc">İsim (Z-A)</option>
                    <option value="price-asc">Fiyat (Artan)</option>
                    <option value="price-desc">Fiyat (Azalan)</option>
                    <option value="category-asc">Kategori (A-Z)</option>
                    <option value="category-desc">Kategori (Z-A)</option>
                  </select>
                </div>
              </div>
              
              {/* Hızlı Filtreler */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSortBy('order');
                    setSortOrder('asc');
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } rounded-md shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  Tüm Filtreler Temizle
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('price');
                    setSortOrder('asc');
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    sortBy === 'price' && sortOrder === 'asc'
                      ? isDark 
                        ? 'border-blue-500 bg-blue-600 text-white' 
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } rounded-md shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  En Düşük Fiyat
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('price');
                    setSortOrder('desc');
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    sortBy === 'price' && sortOrder === 'desc'
                      ? isDark 
                        ? 'border-blue-500 bg-blue-600 text-white' 
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } rounded-md shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  En Yüksek Fiyat
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder('asc');
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    sortBy === 'name' && sortOrder === 'asc'
                      ? isDark 
                        ? 'border-blue-500 bg-blue-600 text-white' 
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600' 
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } rounded-md shadow-sm text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  İsim (A-Z)
                </button>
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
              items={products.map(product => product.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="mt-4">
                {filteredProducts.length === 0 ? (
                  <div className={`p-8 text-center rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium mb-1">Ürün Bulunamadı</h3>
                    <p className="text-sm">Arama kriterlerinize uygun ürün bulunamadı. Lütfen farklı bir arama terimi deneyin veya yeni bir ürün ekleyin.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedProduct(null);
                        setIsFormOpen(true);
                      }}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Yeni Ürün Ekle
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`flex justify-between items-center mb-4 px-4 py-2 rounded-lg ${
                      isDark ? 'bg-gray-800/80 text-gray-300' : 'bg-gray-50 text-gray-700'
                    }`}>
                      <div className="text-sm font-medium">
                        {filteredProducts.length} ürün bulundu
                      </div>
                      {isSelectionMode && (
                        <button
                          onClick={handleSelectAllProducts}
                          className={`text-sm font-medium ${
                            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {selectedProducts.size === filteredProducts.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                      {visibleProducts.map((product) => (
                        <div
                          key={product.id}
                          className={`group relative ${
                            isDark 
                              ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600' 
                              : 'bg-white border border-gray-200'
                          } rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                            isSelectionMode ? 'cursor-pointer' : ''
                          } ${
                            isSelectionMode && selectedProducts.has(product.id) ? 'ring-2 ring-[#D84727]' : ''
                          } transform hover:translate-y-[-4px]`}
                          onClick={() => isSelectionMode ? handleSelectProduct(product.id.toString()) : null}
                        >
                          {/* Ürün Resmi */}
                          <div className="relative aspect-square w-full overflow-hidden">
                            {product.image ? (
                              <div className="h-full w-full">
                                <Base64Image
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
                            
                            {/* Fiyat Etiketi - Modern ve gelişmiş - Daha küçük */}
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
                          
                          {/* Kategori etiketi - Resmin üst kısmında */}
                          <div className="absolute top-2 left-2">
                            <span className={`inline-block max-w-[90%] truncate px-2 py-0.5 rounded-md text-[10px] font-medium shadow-sm ${
                              isDark 
                                ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white backdrop-blur-sm border border-purple-400/20' 
                                : 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white backdrop-blur-sm border border-purple-400/20'
                            }`} title={getCategoryName(product.categoryId)}>
                              {getCategoryName(product.categoryId)}
                            </span>
                          </div>
                          
                          {/* Ürün Adı ve Butonlar - Resmin altında */}
                          <div className="p-2">
                            <h3 className={`font-bold text-sm truncate mb-1 ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {product.name}
                            </h3>
                            
                            {/* Butonlar ve Sıra Numarası */}
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
                                    setSelectedProduct(product);
                                    setIsFormOpen(true);
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
                                    handleDelete(product);
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
                      ))}
                    </div>
                    
                    {/* Daha fazla yükleme göstergesi */}
                    {hasMore && (
                      <div 
                        ref={loadMoreRef} 
                        className="flex justify-center items-center p-4 mt-4"
                      >
                        {isLoadingMore ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        ) : (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Daha fazla ürün yükleniyor...
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Ürün form modalı */}
        {renderProductForm()}

        {/* Silme onay modalı */}
        {renderDeleteConfirmModal()}

        {/* Toplu silme onay modalı */}
        {renderBulkDeleteConfirmModal()}
      </div>
    </div>
  );
}
