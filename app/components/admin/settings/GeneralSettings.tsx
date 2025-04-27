'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useSettingsStore } from "@/app/store/settingsStore";
import { useThemeStore } from "@/app/store/themeStore";

export default function GeneralSettings() {
  const { general, updateSettings } = useSettingsStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  
  return (
    <div className={`rounded-lg p-6 ${
      isDark 
        ? 'bg-gray-800 bg-opacity-20 border border-gray-700' 
        : 'bg-white border border-gray-200 shadow-sm'
    }`}>
      <h2 className={`text-xl font-semibold mb-4 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>Genel Ayarlar</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Restoran ve menü sisteminizle ilgili temel bilgileri buradan düzenleyebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="restaurantName" className={isDark ? "text-gray-300" : "text-gray-700"}>Restoran Adı</Label>
            <Input
              id="restaurantName"
              value={general.restaurantName}
              onChange={(e) => updateSettings('general', 'restaurantName', e.target.value)}
              className={isDark 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
              }
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="foundedYear" className={isDark ? "text-gray-300" : "text-gray-700"}>Kuruluş Yılı</Label>
            <Input
              id="foundedYear"
              value={general.foundedYear}
              onChange={(e) => updateSettings('general', 'foundedYear', e.target.value)}
              className={isDark 
                ? "bg-gray-700 border-gray-600 text-white" 
                : "bg-white border-gray-300 text-gray-900"
              }
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className={isDark ? "text-gray-300" : "text-gray-700"}>Açıklama</Label>
          <Textarea
            id="description"
            value={general.description}
            onChange={(e) => updateSettings('general', 'description', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slogan" className={isDark ? "text-gray-300" : "text-gray-700"}>Slogan</Label>
          <Input
            id="slogan"
            value={general.slogan}
            onChange={(e) => updateSettings('general', 'slogan', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency" className={isDark ? "text-gray-300" : "text-gray-700"}>Para Birimi</Label>
            <select
              id="currency"
              value={general.currency}
              onChange={(e) => updateSettings('general', 'currency', e.target.value)}
              className={`w-full rounded-md ${
                isDark 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="TRY">Türk Lirası (₺)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language" className={isDark ? "text-gray-300" : "text-gray-700"}>Dil</Label>
            <select
              id="language"
              value={general.language}
              onChange={(e) => updateSettings('general', 'language', e.target.value)}
              className={`w-full rounded-md ${
                isDark 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone" className={isDark ? "text-gray-300" : "text-gray-700"}>Zaman Dilimi</Label>
            <select
              id="timezone"
              value={general.timezone}
              onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
              className={`w-full rounded-md ${
                isDark 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
              <option value="Europe/London">Londra (GMT+0/+1)</option>
              <option value="America/New_York">New York (GMT-5/-4)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              <option value="Australia/Sydney">Sydney (GMT+10/+11)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
