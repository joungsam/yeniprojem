'use client';

import { useState, useEffect } from 'react';
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";
import { useThemeStore } from "@/app/store/themeStore";

export default function ProductDesignSettings() {
  const [mounted, setMounted] = useState(false);
  const { appearance, updateSettings } = useSettingsStore();
  const { theme } = useThemeStore();
  const isDark = mounted ? theme === 'dark' : false;
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className={`rounded-lg p-6 ${
      isDark 
        ? 'bg-gray-800 bg-opacity-20 border border-gray-700' 
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>Ürün Tasarım Ayarları</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Ürün kartları ve bilgi notlarının görünümünü buradan özelleştirebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Ürün Altı Bilgi Notu
          </h3>
          
          <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Bu not, ürün kartlarının altında görüntülenir. Örneğin: "CAM SU ÜCRETLİDİR..."
          </p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="footerNote" className={isDark ? "text-gray-300" : "text-gray-700"}>Bilgi Notu</Label>
              <Input
                id="footerNote"
                value={appearance.footerNote}
                onChange={(e) => updateSettings('appearance', 'footerNote', e.target.value)}
                placeholder="Örn: CAM SU ÜCRETLİDİR..."
                className={isDark 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Bu not, tüm ürün kartlarının altında küçük yazı olarak görüntülenir.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className={isDark ? "text-gray-300" : "text-gray-700"}>Bilgi Notu Rengi</Label>
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
                    className={isDark 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bu renk, ürün kartlarının altındaki bilgi notlarında kullanılır.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <input
                id="showFooterNote"
                type="checkbox"
                checked={appearance.showFooterNote}
                onChange={(e) => updateSettings('appearance', 'showFooterNote', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="showFooterNote" className={isDark ? "text-gray-300" : "text-gray-700"}>
                Bilgi Notunu Göster
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
