'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";

export default function NotificationsSettingsPage() {
  const { notifications, updateSettings } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 bg-opacity-20 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Bildirim Ayarları</h2>
      <p className="text-gray-400 mb-6">
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
          <Label htmlFor="enableEmailNotifications" className="text-gray-300">E-posta Bildirimlerini Etkinleştir</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emailForOrders" className="text-gray-300">Sipariş Bildirimleri için E-posta</Label>
          <Input
            id="emailForOrders"
            type="email"
            value={notifications.emailForOrders}
            onChange={(e) => updateSettings('notifications', 'emailForOrders', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
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
          <Label htmlFor="notifyOnLowStock" className="text-gray-300">Düşük Stok Bildirimleri</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold" className="text-gray-300">Düşük Stok Eşiği</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min="1"
            max="100"
            value={notifications.lowStockThreshold}
            onChange={(e) => updateSettings('notifications', 'lowStockThreshold', parseInt(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white"
            disabled={!notifications.notifyOnLowStock}
          />
          <p className="text-sm text-gray-400">
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
            <Label htmlFor="sendDailySummary" className="text-gray-300">Günlük Özet Gönder</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="sendWeeklySummary"
              type="checkbox"
              checked={notifications.sendWeeklySummary}
              onChange={(e) => updateSettings('notifications', 'sendWeeklySummary', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="sendWeeklySummary" className="text-gray-300">Haftalık Özet Gönder</Label>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-700 bg-opacity-50 rounded-md">
          <h3 className="text-lg font-semibold text-white mb-2">Bildirim Türleri</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Yeni sipariş bildirimleri</li>
            <li>Düşük stok uyarıları</li>
            <li>Günlük satış özeti</li>
            <li>Haftalık performans raporu</li>
            <li>Sistem güncellemeleri</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            Not: Bildirim türlerini özelleştirme özelliği yakında eklenecektir.
          </p>
        </div>
      </div>
    </div>
  );
}
