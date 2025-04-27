'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { useSettingsStore } from "@/app/store/settingsStore";
import { useThemeStore } from "@/app/store/themeStore";
import { 
  Cog6ToothIcon, 
  BuildingStorefrontIcon, 
  PhoneIcon, 
  PaintBrushIcon, 
  BellIcon, 
  GlobeAltIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

// Ayar bileşenleri
import GeneralSettings from '@/app/components/admin/settings/GeneralSettings';
import ContactSettings from '@/app/components/admin/settings/ContactSettings';
import SocialSettings from '@/app/components/admin/settings/SocialSettings';
import AppearanceSettings from '@/app/components/admin/settings/AppearanceSettings';
import MenuSettings from '@/app/components/admin/settings/MenuSettings';
import NotificationsSettings from '@/app/components/admin/settings/NotificationsSettings';
import ProductDesignSettings from '@/app/components/admin/settings/ProductDesignSettings';

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [mounted, setMounted] = useState(false);
  const { theme } = useThemeStore();
  const isDark = mounted ? theme === 'dark' : false;
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { 
    hasChanges, 
    isLoading, 
    saveSettings, 
    resetSettings, 
    exportSettings,
    importSettings
  } = useSettingsStore();
  
  // Sekme değiştiğinde aktif sekmeyi güncelle
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Ayarları içe aktarma
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      if (!e.target || !e.target.result) return;
      
      try {
        importSettings(e.target.result as string);
        
        toast({
          title: "Ayarlar içe aktarıldı",
          description: "Ayarlar başarıyla içe aktarıldı.",
        });
      } catch (error) {
        console.error('Ayarlar içe aktarılırken hata oluştu:', error);
        
        toast({
          variant: "destructive",
          title: "Hata!",
          description: "Ayarlar içe aktarılırken bir hata oluştu. Geçerli bir JSON dosyası seçtiğinizden emin olun.",
        });
      }
    };
  };
  
  // Ayarları kaydetme
  const handleSaveSettings = async () => {
    try {
      await saveSettings();
      
      toast({
        title: "Ayarlar kaydedildi",
        description: "Tüm değişiklikler başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata oluştu:', error);
      
      toast({
        variant: "destructive",
        title: "Uyarı",
        description: "Ayarlar veritabanına kaydedilemedi, ancak tema ayarı tarayıcınıza kaydedildi.",
      });
    }
  };
  
  // Ayarları sıfırlama
  const handleResetSettings = () => {
    if (confirm('Tüm ayarları sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      resetSettings();
      
      toast({
        title: "Ayarlar sıfırlandı",
        description: "Tüm ayarlar varsayılan değerlere döndürüldü.",
      });
    }
  };
  
  // Aktif sekmeye göre içerik gösterme
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'contact':
        return <ContactSettings />;
      case 'social':
        return <SocialSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'menu':
        return <MenuSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'product-design':
        return <ProductDesignSettings />;
      default:
        return <GeneralSettings />;
    }
  };
  
  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Ayarlar</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Menü sisteminizin tüm ayarlarını buradan yönetebilirsiniz.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <input
                type="file"
                id="import-settings"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImportSettings}
                accept=".json"
              />
              <Button variant="outline" className={`flex items-center ${isDark ? 'bg-transparent border-gray-600 hover:bg-gray-800 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`}>
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                İçe Aktar
              </Button>
            </div>
            
            <Button variant="outline" className={`flex items-center ${isDark ? 'bg-transparent border-gray-600 hover:bg-gray-800 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`} onClick={exportSettings}>
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Dışa Aktar
            </Button>
            
            <Button variant="outline" className={`flex items-center ${isDark ? 'bg-transparent border-gray-600 hover:bg-gray-800 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'}`} onClick={handleResetSettings}>
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Sıfırla
            </Button>
            
            <Button 
              onClick={handleSaveSettings} 
              disabled={!hasChanges || isLoading}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Menü Butonları */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'general' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('general')}
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            <span>Genel</span>
          </Button>
          
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'contact' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('contact')}
          >
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            <span>İletişim</span>
          </Button>
          
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'social' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('social')}
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            <span>Sosyal Medya</span>
          </Button>
          
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'appearance' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('appearance')}
          >
            <PaintBrushIcon className="h-5 w-5 mr-2" />
            <span>Görünüm</span>
          </Button>
          
          {/* Ürün Tasarım butonu zaten yukarıda eklenmiş */}
          
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'menu' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('menu')}
          >
            <PhoneIcon className="h-5 w-5 mr-2" />
            <span>Menü</span>
          </Button>
          
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'notifications' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('notifications')}
          >
            <BellIcon className="h-5 w-5 mr-2" />
            <span>Bildirimler</span>
          </Button>
          
          <Button 
            variant="default" 
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === 'product-design' 
                ? 'bg-orange-600' 
                : isDark 
                  ? 'bg-gray-800' 
                  : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('product-design')}
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            <span>Ürün Tasarım</span>
          </Button>
        </div>
        
        {/* Sekme İçeriği */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
