'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";

export default function SocialSettingsPage() {
  const { social, updateSettings } = useSettingsStore();
  
  return (
    <div className="bg-gray-800 bg-opacity-20 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Sosyal Medya</h2>
      <p className="text-gray-400 mb-6">
        Sosyal medya hesaplarınızı buradan yönetebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="facebook" className="text-gray-300">Facebook</Label>
          <Input
            id="facebook"
            value={social.facebook}
            onChange={(e) => updateSettings('social', 'facebook', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="facebook.com/sayfaniz"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instagram" className="text-gray-300">Instagram</Label>
          <Input
            id="instagram"
            value={social.instagram}
            onChange={(e) => updateSettings('social', 'instagram', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="instagram.com/kullaniciadi"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-gray-300">Twitter</Label>
          <Input
            id="twitter"
            value={social.twitter}
            onChange={(e) => updateSettings('social', 'twitter', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="twitter.com/kullaniciadi"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="youtube" className="text-gray-300">YouTube</Label>
          <Input
            id="youtube"
            value={social.youtube}
            onChange={(e) => updateSettings('social', 'youtube', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="youtube.com/channel/kanaliniz"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tiktok" className="text-gray-300">TikTok</Label>
          <Input
            id="tiktok"
            value={social.tiktok}
            onChange={(e) => updateSettings('social', 'tiktok', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="tiktok.com/@kullaniciadi"
          />
        </div>
      </div>
    </div>
  );
}
