'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";
import { useThemeStore } from "@/app/store/themeStore";

export default function NotificationsSettings() {
  const { notifications, updateSettings } = useSettingsStore();
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
      }`}>Bildirim Ayarları</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Sistem bildirimlerini ve e-posta ayarlarını buradan yönetebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <input
            id="enableEmailNotifications"
            type="checkbox"
            checked={notifications.enableEmailNotifications}
            onChange={(e) => updateSettings('notifications', 'enableEmailNotifications', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor="enableEmailNotifications" className={isDark ? "text-gray-300" : "text-gray-700"}>E-posta Bildirimlerini Etkinleştir</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emailForOrders" className={isDark ? "text-gray-300" : "text-gray-700"}>Sipariş Bildirimleri için E-posta</Label>
          <Input
            id="emailForOrders"
            type="email"
            value={notifications.emailForOrders}
            onChange={(e) => updateSettings('notifications', 'emailForOrders', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            disabled={!notifications.enableEmailNotifications}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id="notifyOnLowStock"
            type="checkbox"
            checked={notifications.notifyOnLowStock}
            onChange={(e) => updateSettings('notifications', 'notifyOnLowStock', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Label htmlFor="notifyOnLowStock" className={isDark ? "text-gray-300" : "text-gray-700"}>Düşük Stok Bildirimleri</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold" className={isDark ? "text-gray-300" : "text-gray-700"}>Düşük Stok Eşiği</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min="1"
            max="100"
            value={notifications.lowStockThreshold}
            onChange={(e) => updateSettings('notifications', 'lowStockThreshold', parseInt(e.target.value))}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            disabled={!notifications.notifyOnLowStock}
          />
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Stok miktarı bu değerin altına düştüğünde bildirim alacaksınız.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-2">
            <input
              id="sendDailySummary"
              type="checkbox"
              checked={notifications.sendDailySummary}
              onChange={(e) => updateSettings('notifications', 'sendDailySummary', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="sendDailySummary" className={isDark ? "text-gray-300" : "text-gray-700"}>Günlük Özet Gönder</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="sendWeeklySummary"
              type="checkbox"
              checked={notifications.sendWeeklySummary}
              onChange={(e) => updateSettings('notifications', 'sendWeeklySummary', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="sendWeeklySummary" className={isDark ? "text-gray-300" : "text-gray-700"}>Haftalık Özet Gönder</Label>
          </div>
        </div>
        
        <div className={`mt-6 p-4 rounded-md ${
          isDark 
            ? 'bg-gray-700 bg-opacity-50' 
            : 'bg-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Bildirim Türleri</h3>
          <ul className={`list-disc list-inside space-y-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <li>Yeni sipariş bildirimleri</li>
            <li>Düşük stok uyarıları</li>
            <li>Günlük satış özeti</li>
            <li>Haftalık performans raporu</li>
            <li>Sistem güncellemeleri</li>
          </ul>
          <p className={`mt-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Not: Bildirim türlerini özelleştirme özelliği yakında eklenecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
