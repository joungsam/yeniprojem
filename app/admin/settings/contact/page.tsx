'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { useSettingsStore } from "@/app/store/settingsStore";

export default function ContactSettingsPage() {
  const { contact, updateSettings, updateWorkingHour } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 bg-opacity-20 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">İletişim Bilgileri</h2>
      <p className="text-gray-400 mb-6">
        Müşterilerinizin size ulaşabileceği iletişim bilgilerini buradan düzenleyebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-300">Adres</Label>
          <Textarea
            id="address"
            value={contact.address}
            onChange={(e) => updateSettings('contact', 'address', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-300">Telefon</Label>
            <Input
              id="phone"
              value={contact.phone}
              onChange={(e) => updateSettings('contact', 'phone', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={contact.email}
              onChange={(e) => updateSettings('contact', 'email', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website" className="text-gray-300">Web Sitesi</Label>
          <Input
            id="website"
            value={contact.website}
            onChange={(e) => updateSettings('contact', 'website', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-gray-300">Çalışma Saatleri</Label>
          <div className="rounded-md border border-gray-700">
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-700 bg-gray-700">
              <div className="font-medium">Gün</div>
              <div className="font-medium">Açılış</div>
              <div className="font-medium">Kapanış</div>
              <div className="font-medium text-center">Açık mı?</div>
            </div>
            
            {contact.workingHours.map((day, index) => (
              <div key={day.day} className={`grid grid-cols-4 gap-4 p-4 ${index < contact.workingHours.length - 1 ? 'border-b border-gray-700' : ''}`}>
                <div className="text-white">{day.day}</div>
                <div>
                  <Input
                    type="time"
                    value={day.open}
                    onChange={(e) => updateWorkingHour(index, 'open', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    disabled={!day.isOpen}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={day.close}
                    onChange={(e) => updateWorkingHour(index, 'close', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    disabled={!day.isOpen}
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) => updateWorkingHour(index, 'isOpen', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
