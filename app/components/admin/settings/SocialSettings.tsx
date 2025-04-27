'use client';

import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { useSettingsStore } from "@/app/store/settingsStore";
import { useThemeStore } from "@/app/store/themeStore";

export default function SocialSettings() {
  const { social, updateSettings } = useSettingsStore();
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
      }`}>Sosyal Medya</h2>
      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Sosyal medya hesaplarınızı buradan yönetebilirsiniz.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="facebook" className={isDark ? "text-gray-300" : "text-gray-700"}>Facebook</Label>
          <Input
            id="facebook"
            value={social.facebook}
            onChange={(e) => updateSettings('social', 'facebook', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            placeholder="facebook.com/sayfaniz"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instagram" className={isDark ? "text-gray-300" : "text-gray-700"}>Instagram</Label>
          <Input
            id="instagram"
            value={social.instagram}
            onChange={(e) => updateSettings('social', 'instagram', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            placeholder="instagram.com/kullaniciadi"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="twitter" className={isDark ? "text-gray-300" : "text-gray-700"}>Twitter</Label>
          <Input
            id="twitter"
            value={social.twitter}
            onChange={(e) => updateSettings('social', 'twitter', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            placeholder="twitter.com/kullaniciadi"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="youtube" className={isDark ? "text-gray-300" : "text-gray-700"}>YouTube</Label>
          <Input
            id="youtube"
            value={social.youtube}
            onChange={(e) => updateSettings('social', 'youtube', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            placeholder="youtube.com/channel/kanaliniz"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tiktok" className={isDark ? "text-gray-300" : "text-gray-700"}>TikTok</Label>
          <Input
            id="tiktok"
            value={social.tiktok}
            onChange={(e) => updateSettings('social', 'tiktok', e.target.value)}
            className={isDark 
              ? "bg-gray-700 border-gray-600 text-white" 
              : "bg-white border-gray-300 text-gray-900"
            }
            placeholder="tiktok.com/@kullaniciadi"
          />
        </div>
      </div>
    </div>
  );
}
