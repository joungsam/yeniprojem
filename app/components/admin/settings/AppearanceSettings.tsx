'use client';

import { useState, useEffect } from 'react';
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useSettingsStore } from "@/app/store/settingsStore";
import { useThemeStore } from "@/app/store/themeStore";
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AppearanceSettings() {
  const [mounted, setMounted] = useState(false);
  const { appearance, updateSettings, saveSettings } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();
  const isDark = mounted ? theme === 'dark' : false;
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Tema değiştiğinde hem settings store'u hem de theme store'u güncelle ve kaydet
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    updateSettings('appearance', 'theme', newTheme);
    setTheme(newTheme);
    
    // Değişiklikleri kaydet
    try {
      await saveSettings();
    } catch (error) {
      console.error('Tema değişikliği kaydedilirken hata oluştu:', error);
      // Hata oluşsa bile tema değişikliği localStorage'a kaydedilmiş olacak
    }
  };
  
  return (
    <div className={`rounded-lg p-6 ${
      isDark 
        ? 'bg-gray-800 bg-opacity-20 border border-gray-700' 
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>Görünüm Ayarları</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Menü sisteminizin görünümünü buradan özelleştirebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className={isDark ? "text-gray-300" : "text-gray-700"}>Tema</Label>
          <div className="grid grid-cols-2 gap-6">
            <div
              className={`p-4 rounded-md border cursor-pointer ${
                appearance.theme === 'light'
                  ? 'border-orange-500 bg-orange-900 bg-opacity-20'
                  : isDark 
                    ? 'border-gray-700 bg-gray-700 bg-opacity-50' 
                    : 'border-gray-300 bg-gray-100'
              }`}
              onClick={() => handleThemeChange('light')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={isDark ? "text-white" : "text-gray-800"}>Açık Tema</span>
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
                  : isDark 
                    ? 'border-gray-700 bg-gray-700 bg-opacity-50' 
                    : 'border-gray-300 bg-gray-100'
              }`}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={isDark ? "text-white" : "text-gray-800"}>Koyu Tema</span>
                {appearance.theme === 'dark' && (
                  <CheckCircleIcon className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <div className="h-20 bg-gray-900 border border-gray-700 rounded-md"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="primaryColor" className={isDark ? "text-gray-300" : "text-gray-700"}>Ana Renk</Label>
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
              className={isDark 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
              }
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="fontFamily" className={isDark ? "text-gray-300" : "text-gray-700"}>Yazı Tipi</Label>
          
          {/* Yazı tipi önizlemeleri */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <div 
              className={`p-2 rounded-md border cursor-pointer ${
                isDark 
                  ? 'border-gray-700 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={async () => {
                updateSettings('appearance', 'fontFamily', 'Poppins');
                // Değişikliği kaydet
                // TODO: Add error handling/toast notification for save
                await saveSettings();
              }}
            >
              <div className="h-12 flex items-center justify-center rounded-md" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <p className="text-center text-sm">Poppins</p>
              </div>
            </div>
            
            <div 
              className={`p-2 rounded-md border cursor-pointer ${
                isDark 
                  ? 'border-gray-700 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={async () => {
                updateSettings('appearance', 'fontFamily', 'Roboto');
                // Değişikliği kaydet
                // TODO: Add error handling/toast notification for save
                await saveSettings();
              }}
            >
              <div className="h-12 flex items-center justify-center rounded-md" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <p className="text-center text-sm">Roboto</p>
              </div>
            </div>
            
            <div 
              className={`p-2 rounded-md border cursor-pointer ${
                isDark 
                  ? 'border-gray-700 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={async () => {
                updateSettings('appearance', 'fontFamily', 'Open Sans');
                // Değişikliği kaydet
                // TODO: Add error handling/toast notification for save
                await saveSettings();
              }}
            >
              <div className="h-12 flex items-center justify-center rounded-md" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <p className="text-center text-sm">Open Sans</p>
              </div>
            </div>
            
            <div 
              className={`p-2 rounded-md border cursor-pointer ${
                isDark 
                  ? 'border-gray-700 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={async () => {
                updateSettings('appearance', 'fontFamily', 'Montserrat');
                // Değişikliği kaydet
                // TODO: Add error handling/toast notification for save
                await saveSettings();
              }}
            >
              <div className="h-12 flex items-center justify-center rounded-md" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <p className="text-center text-sm">Montserrat</p>
              </div>
            </div>
            
            <div 
              className={`p-2 rounded-md border cursor-pointer ${
                isDark 
                  ? 'border-gray-700 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={async () => {
                updateSettings('appearance', 'fontFamily', 'Lato');
                // Değişikliği kaydet
                // TODO: Add error handling/toast notification for save
                await saveSettings();
              }}
            >
              <div className="h-12 flex items-center justify-center rounded-md" style={{ fontFamily: 'Lato, sans-serif' }}>
                <p className="text-center text-sm">Lato</p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Mevcut yazı tipi:</strong> <span className="font-medium">{appearance.fontFamily}</span>
            </p>
          </div>
          
          {/* Yazı tipi seçimi için gizli select input */}
          <select
            id="fontFamily"
            value={appearance.fontFamily}
            onChange={async (e) => {
              updateSettings('appearance', 'fontFamily', e.target.value);
              // Değişikliği kaydet
              // TODO: Add error handling/toast notification for save
              await saveSettings();
            }}
            className="hidden"
          >
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Lato">Lato</option>
          </select>
          
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className={isDark ? "text-gray-300" : "text-gray-700"}>Logo</Label>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="border rounded-md p-4 flex flex-col items-center gap-4">
                  <div 
                    className="w-full h-40 flex items-center justify-center border-2 border-dashed rounded-md overflow-hidden"
                    style={{
                      width: appearance.logoWidth + 'px',
                      height: appearance.logoHeight + 'px',
                      maxWidth: '100%',
                      margin: '0 auto'
                    }}
                  >
                    {appearance.logoUrl ? (
                      <img 
                        src={appearance.logoUrl} 
                        alt="Logo" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/logo.png';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <p>Logo Önizleme</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="file"
                        id="logo-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            
                            // Dosya boyutu kontrolü (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
                              return;
                            }
                            
                            // Dosya tipi kontrolü
                            if (!file.type.startsWith('image/')) {
                              alert('Lütfen bir resim dosyası seçin.');
                              return;
                            }
                            
                            // FormData oluştur
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'logo');
                            
                            try {
                              // Dosyayı yükle
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                updateSettings('appearance', 'logoUrl', data.url);
                                // Logo yüklendikten sonra ayarları kaydet
                                try {
                                  await saveSettings();
                                } catch (error) {
                                  console.error('Logo değişikliği kaydedilirken hata oluştu:', error);
                                }
                              } else {
                                alert('Dosya yüklenirken bir hata oluştu.');
                              }
                            } catch (error) {
                              console.error('Dosya yükleme hatası:', error);
                              alert('Dosya yüklenirken bir hata oluştu.');
                            }
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        className={`w-full ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Logo Yükle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 space-y-4">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="logoWidth" className={isDark ? "text-gray-300" : "text-gray-700"}>Logo Genişliği</Label>
                        <span className="text-sm font-medium text-gray-500">{appearance.logoWidth}px</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 w-8 text-right">16px</span>
                        <div className="relative w-full">
                          <input
                            id="logoWidth"
                            type="range"
                            min="16"
                            max="500"
                            step="1"
                            value={appearance.logoWidth}
                            onChange={(e) => updateSettings('appearance', 'logoWidth', parseInt(e.target.value))}
                            className="w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            style={{
                              WebkitAppearance: 'none',
                              appearance: 'none'
                            }}
                            // Dokunmatik ekranlarda sayfa kaydırmayı engelle
                            onTouchMove={(e) => {
                              e.stopPropagation();
                            }}
                          />
                          <div 
                            className="absolute pointer-events-none"
                            style={{
                              left: `calc(${(appearance.logoWidth - 16) / (500 - 16) * 100}% - 16px)`,
                              top: '-8px'
                            }}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                            } border-2 shadow-md`}>
                              <div className={`w-4 h-4 rounded-full ${
                                isDark ? 'bg-blue-400' : 'bg-blue-500'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">500px</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoWidth', 50);
                            // Logo genişliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo genişliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Küçük
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoWidth', 100);
                            // Logo genişliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo genişliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Orta
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoWidth', 200);
                            // Logo genişliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo genişliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Büyük
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoWidth', 300);
                            // Logo genişliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo genişliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Çok Büyük
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="logoHeight" className={isDark ? "text-gray-300" : "text-gray-700"}>Logo Yüksekliği</Label>
                        <span className="text-sm font-medium text-gray-500">{appearance.logoHeight}px</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 w-8 text-right">16px</span>
                        <div className="relative w-full">
                          <input
                            id="logoHeight"
                            type="range"
                            min="16"
                            max="500"
                            step="1"
                            value={appearance.logoHeight}
                            onChange={(e) => updateSettings('appearance', 'logoHeight', parseInt(e.target.value))}
                            className="w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            style={{
                              WebkitAppearance: 'none',
                              appearance: 'none'
                            }}
                            // Dokunmatik ekranlarda sayfa kaydırmayı engelle
                            onTouchMove={(e) => {
                              e.stopPropagation();
                            }}
                          />
                          <div 
                            className="absolute pointer-events-none"
                            style={{
                              left: `calc(${(appearance.logoHeight - 16) / (500 - 16) * 100}% - 16px)`,
                              top: '-8px'
                            }}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                            } border-2 shadow-md`}>
                              <div className={`w-4 h-4 rounded-full ${
                                isDark ? 'bg-blue-400' : 'bg-blue-500'
                              }`}></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 w-8">500px</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoHeight', 50);
                            // Logo yüksekliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo yüksekliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Küçük
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoHeight', 100);
                            // Logo yüksekliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo yüksekliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Orta
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoHeight', 200);
                            // Logo yüksekliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo yüksekliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Büyük
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={async () => {
                            updateSettings('appearance', 'logoHeight', 300);
                            // Logo yüksekliği değişikliğini kaydet
                            try {
                              await saveSettings();
                            } catch (error) {
                              console.error('Logo yüksekliği değişikliği kaydedilirken hata oluştu:', error);
                            }
                          }}
                        >
                          Çok Büyük
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>İpucu:</strong> Logo boyutunu ayarlamak için kaydırıcıları kullanabilirsiniz. 
                      Önizleme alanında logonun nasıl göründüğünü görebilirsiniz.
                    </p>
                  </div>
                </div>
                
                {/* Manuel URL giriş alanı kaldırıldı */}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className={isDark ? "text-gray-300" : "text-gray-700"}>Favicon</Label>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="border rounded-md p-4 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded-md overflow-hidden">
                    {appearance.faviconUrl ? (
                      <img 
                        src={appearance.faviconUrl} 
                        alt="Favicon" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/favicon.ico';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <p>Favicon</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="file"
                        id="favicon-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            
                            // Dosya boyutu kontrolü (1MB)
                            if (file.size > 1 * 1024 * 1024) {
                              alert('Dosya boyutu 1MB\'dan küçük olmalıdır.');
                              return;
                            }
                            
                            // Dosya tipi kontrolü
                            if (!file.type.startsWith('image/')) {
                              alert('Lütfen bir resim dosyası seçin.');
                              return;
                            }
                            
                            // FormData oluştur
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'favicon');
                            
                            try {
                              // Dosyayı yükle
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                updateSettings('appearance', 'faviconUrl', data.url);
                                // Favicon yüklendikten sonra ayarları kaydet
                                try {
                                  await saveSettings();
                                } catch (error) {
                                  console.error('Favicon değişikliği kaydedilirken hata oluştu:', error);
                                }
                              } else {
                                alert('Dosya yüklenirken bir hata oluştu.');
                              }
                            } catch (error) {
                              console.error('Dosya yükleme hatası:', error);
                              alert('Dosya yüklenirken bir hata oluştu.');
                            }
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        className={`w-full ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                            : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Favicon Yükle
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-2/3 space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>İpucu:</strong> Favicon, tarayıcı sekmelerinde ve yer imlerinde görünen küçük simgedir. 
                    En iyi sonuç için 32x32 veya 64x64 piksel boyutunda bir .ico, .png veya .svg dosyası kullanın.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
            <Label htmlFor="showLogo" className={isDark ? "text-gray-300" : "text-gray-700"}>Logo Göster</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="showSocialIcons"
              type="checkbox"
              checked={appearance.showSocialIcons}
              onChange={(e) => updateSettings('appearance', 'showSocialIcons', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="showSocialIcons" className={isDark ? "text-gray-300" : "text-gray-700"}>Sosyal Medya İkonlarını Göster</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="menuLayout" className={isDark ? "text-gray-300" : "text-gray-700"}>Menü Düzeni</Label>
          <select
            id="menuLayout"
            value={appearance.menuLayout}
            onChange={(e) => updateSettings('appearance', 'menuLayout', e.target.value)}
            className={`w-full rounded-md ${
              isDark 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="grid">Izgara (Grid)</option>
            <option value="list">Liste (List)</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="productCardStyle" className={isDark ? "text-gray-300" : "text-gray-700"}>Ürün Kartı Stili</Label>
          <select
            id="productCardStyle"
            value={appearance.productCardStyle}
            onChange={(e) => updateSettings('appearance', 'productCardStyle', e.target.value)}
            className={`w-full rounded-md ${
              isDark 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="modern">Modern</option>
            <option value="classic">Klasik</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        {/* Ürün Altı Bilgi Notu bölümü Ürün Tasarım sayfasına taşındı */}
      </div>
    </div>
  );
}
