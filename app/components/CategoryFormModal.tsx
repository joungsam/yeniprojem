import { useState, useEffect } from 'react';
import { Dialog } from './ui/dialog';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Category } from '@prisma/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  category?: Category;
  title: string;
}

const defaultFormData: Partial<Category> = {
  name: '',
  icon: '',
  order: 0
};

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  title
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>(
    category ? { ...category } : defaultFormData
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({ ...category });
    } else {
      setFormData(defaultFormData);
    }
  }, [category, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Kategori kaydedilirken hata oluştu:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Kategori Adı</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="icon">İkon</Label>
            <Input
              id="icon"
              name="icon"
              value={formData.icon || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="order">Sıra</Label>
            <Input
              id="order"
              name="order"
              type="number"
              value={formData.order || 0}
              onChange={handleChange}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 