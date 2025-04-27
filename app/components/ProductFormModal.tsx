'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Product, Category } from '@prisma/client';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select } from '@/app/components/ui/select';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useToast } from '@/app/components/ui/use-toast';
import { Base64Image } from '@/app/components/ui/base64-image';
import { useThemeStore } from '@/app/store/themeStore';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  product?: Product;
  title: string;
}

const defaultFormData: Partial<Product> = {
  name: '',
  description: '',
  price: undefined,
  image: '',
  categoryId: undefined,
  isActive: true,
  order: 0
};

 export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  title
}: ProductFormModalProps) {
  const { toast } = useToast();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState<Partial<Product>>(
    product ? { ...product } : defaultFormData
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({ ...product });
        setImagePreview(product.image || '');
      } else {
        setFormData(defaultFormData);
        setImagePreview('');
      }
    }
  }, [product, isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata oluştu:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: 'Kategoriler yüklenirken bir hata oluştu'
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name === 'price') {
      // Sadece sayılar ve virgül karakterine izin ver
      const cleanValue = value.replace(/[^0-9,]/g, '');
      
      // Virgülü noktaya çevir
      const dotValue = cleanValue.replace(',', '.');
      
      // En fazla iki ondalık basamağa izin ver
      const parts = dotValue.split('.');
      if (parts[1]?.length > 2) {
        parts[1] = parts[1].slice(0, 2);
      }
      
      const finalValue = parts.join('.');
      setFormData(prev => ({
        ...prev,
        [name]: finalValue === '' ? undefined : Number(finalValue)
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: 'Lütfen bir kategori seçin'
      });
      return;
    }

    try {
      setIsSaving(true);
      const dataToSubmit = {
        ...formData,
        categoryId: Number(formData.categoryId)
      };
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error('Ürün kaydedilirken hata oluştu:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Ürün kaydedilemedi'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Dosya boyutunu kontrol et (örn: 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Hata!",
            description: 'Dosya boyutu çok büyük (maksimum 5MB)'
          });
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setFormData(prev => ({ ...prev, image: base64String }));
          setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Resim yükleme hatası:', error);
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error instanceof Error ? error.message : 'Resim yüklenemedi'
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isDark ? 'bg-gray-800 text-white border-gray-700' : ''}>
        <DialogHeader>
          <DialogTitle className={isDark ? 'text-white' : ''}>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className={isDark ? 'text-gray-300' : ''}>Ürün Adı</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className={isDark ? 'bg-gray-700 text-white border-gray-600' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={isDark ? 'text-gray-300' : ''}>Açıklama</Label>
            <div className="relative">
              <Input
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                maxLength={100}
                placeholder="Ürün açıklamasını girin (max. 100 karakter)"
                className={isDark ? 'bg-gray-700 text-white border-gray-600' : ''}
              />
              <span className={`absolute right-2 bottom-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {(formData.description || '').length}/100
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="price" className={isDark ? 'text-gray-300' : ''}>Fiyat (₺)</Label>
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[,]?[0-9]*"
              value={typeof formData.price === 'number' ? formData.price.toString().replace('.', ',') : ''}
              onChange={handleChange}
              required
              placeholder="0,00"
              className={isDark ? 'bg-gray-700 text-white border-gray-600' : ''}
            />
          </div>

          <div>
            <Label htmlFor="categoryId" className={isDark ? 'text-gray-300' : ''}>Kategori</Label>
            <Select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId?.toString() || ''}
              onChange={handleChange}
              required
              className={isDark ? 'bg-gray-700 text-white border-gray-600' : ''}
            >
              <option value="">Kategori Seçin</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="image" className={isDark ? 'text-gray-300' : ''}>Ürün Görseli</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={isDark ? 'bg-gray-700 text-white border-gray-600 file:bg-gray-600 file:text-white file:border-gray-500' : ''}
            />
            {imagePreview && (
              <div className="mt-2 relative h-40 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Ürün önizleme"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className={isDark ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-gray-100' : ''}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Kaydediliyor...
                  </div>
                ) : (
                  'Kaydet'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
