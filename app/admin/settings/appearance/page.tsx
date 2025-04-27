'use client';

import { useState, useEffect } from 'react';
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AppearanceSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { appearance, updateSettings } = useSettingsStore();
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Sunucu tarafında render edildiğinde, bileşeni gösterme
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="bg-gray-800 bg-opacity-20 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Görünüm Ayarları</h2>
      <p className="text-gray-400 mb-6">
        Menü sisteminizin görünümünü buradan özelleştirebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-gray-300">Tema</Label>
          <div className="grid grid-cols-2 gap-6">
            <div
              className={`p-4 rounded-md border cursor-pointer ${
                appearance.theme === 'light'
                  ? 'border-orange-500 bg-orange-900 bg-opacity-20'
                  : 'border-gray-700 bg-gray-700 bg-opacity-50'
              }`}
              onClick={() => updateSettings('appearance', 'theme', 'light')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Açık Tema</span>
                {appearance.theme === 'light' && (
                  <CheckCircleIcon className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <div className="h-20 bg-white border border-gray-200 rounded-md"></div>
            </div>
            
            <div
              className={`p-4 rounded-md border cursor-pointer ${
                appearance.theme === 'dark'
                  ? 'border-orange-500 bg-orange-900 bg-opacity-20'
                  : 'border-gray-700 bg-gray-700 bg-opacity-50'
              }`}
              onClick={() => updateSettings('appearance', 'theme', 'dark')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Koyu Tema</span>
                {appearance.theme === 'dark' && (
                  <CheckCircleIcon className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <div className="h-20 bg-gray-900 border border-gray-700 rounded-md"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primaryColor" className="text-gray-300">Ana Renk</Label>
            <div className="flex items-center gap-2">
              <input
                id="primaryColor"
                type="color"
                value={appearance.primaryColor}
                onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                className="w-10 h-10 rounded border"
              />
              <Input
                value={appearance.primaryColor}
                onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondaryColor" className="text-gray-300">İkincil Renk</Label>
            <div className="flex items-center gap-2">
              <input
                id="secondaryColor"
                type="color"
                value={appearance.secondaryColor}
                onChange={(e) => updateSettings('appearance', 'secondaryColor', e.target.value)}
                className="w-10 h-10 rounded border"
              />
              <Input
                value={appearance.secondaryColor}
                onChange={(e) => updateSettings('appearance', 'secondaryColor', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fontFamily" className="text-gray-300">Yazı Tipi</Label>
          <select
            id="fontFamily"
            value={appearance.fontFamily}
            onChange={(e) => updateSettings('appearance', 'fontFamily', e.target.value)}
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Lato">Lato</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logoUrl" className="text-gray-300">Logo URL</Label>
          <Input
            id="logoUrl"
            value={appearance.logoUrl}
            onChange={(e) => updateSettings('appearance', 'logoUrl', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="faviconUrl" className="text-gray-300">Favicon URL</Label>
          <Input
            id="faviconUrl"
            value={appearance.faviconUrl}
            onChange={(e) => updateSettings('appearance', 'faviconUrl', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-2">
            <input
              id="showLogo"
              type="checkbox"
              checked={appearance.showLogo}
              onChange={(e) => updateSettings('appearance', 'showLogo', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showLogo" className="text-gray-300">Logo Göster</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="showSocialIcons"
              type="checkbox"
              checked={appearance.showSocialIcons}
              onChange={(e) => updateSettings('appearance', 'showSocialIcons', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showSocialIcons" className="text-gray-300">Sosyal Medya İkonlarını Göster</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="menuLayout" className="text-gray-300">Menü Düzeni</Label>
          <select
            id="menuLayout"
            value={appearance.menuLayout}
            onChange={(e) => updateSettings('appearance', 'menuLayout', e.target.value)}
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="grid">Izgara (Grid)</option>
            <option value="list">Liste (List)</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="productCardStyle" className="text-gray-300">Ürün Kartı Stili</Label>
          <select
            id="productCardStyle"
            value={appearance.productCardStyle}
            onChange={(e) => updateSettings('appearance', 'productCardStyle', e.target.value)}
            className="w-full rounded-md bg-gray-700 border-gray-600 text-white"
          >
            <option value="modern">Modern</option>
            <option value="classic">Klasik</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
