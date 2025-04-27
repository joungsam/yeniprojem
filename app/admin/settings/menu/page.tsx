'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";

export default function MenuSettingsPage() {
  const { menu, updateSettings } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 bg-opacity-20 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Menü Ayarları</h2>
      <p className="text-gray-400 mb-6">
        Menü görünümü ve davranışı ile ilgili ayarları buradan düzenleyebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="defaultCurrency" className="text-gray-300">Varsayılan Para Birimi</Label>
          <select
            id="defaultCurrency"
            value={menu.defaultCurrency}
            onChange={(e) => updateSettings('menu', 'defaultCurrency', e.target.value)}
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="TRY">Türk Lirası (₺)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="productsPerPage" className="text-gray-300">Sayfa Başına Ürün Sayısı</Label>
          <Input
            id="productsPerPage"
            type="number"
            min="4"
            max="48"
            value={menu.productsPerPage}
            onChange={(e) => updateSettings('menu', 'productsPerPage', parseInt(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-2">
            <input
              id="showPrices"
              type="checkbox"
              checked={menu.showPrices}
              onChange={(e) => updateSettings('menu', 'showPrices', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showPrices" className="text-gray-300">Fiyatları Göster</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="showOutOfStock"
              type="checkbox"
              checked={menu.showOutOfStock}
              onChange={(e) => updateSettings('menu', 'showOutOfStock', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showOutOfStock" className="text-gray-300">Stokta Olmayan Ürünleri Göster</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="markFeaturedItems"
              type="checkbox"
              checked={menu.markFeaturedItems}
              onChange={(e) => updateSettings('menu', 'markFeaturedItems', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="markFeaturedItems" className="text-gray-300">Öne Çıkan Ürünleri İşaretle</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="showCategories"
              type="checkbox"
              checked={menu.showCategories}
              onChange={(e) => updateSettings('menu', 'showCategories', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showCategories" className="text-gray-300">Kategorileri Göster</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="showProductImages"
              type="checkbox"
              checked={menu.showProductImages}
              onChange={(e) => updateSettings('menu', 'showProductImages', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showProductImages" className="text-gray-300">Ürün Görsellerini Göster</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="enableSearch"
              type="checkbox"
              checked={menu.enableSearch}
              onChange={(e) => updateSettings('menu', 'enableSearch', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="enableSearch" className="text-gray-300">Arama Özelliğini Etkinleştir</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="showProductDescription"
              type="checkbox"
              checked={menu.showProductDescription}
              onChange={(e) => updateSettings('menu', 'showProductDescription', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showProductDescription" className="text-gray-300">Ürün Açıklamalarını Göster</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
