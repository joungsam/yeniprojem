'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useThemeStore } from '../store/themeStore';
import { ThemeToggle } from '../components/admin/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Giriş yapılıyor:', { email, password });
    
    try {
      // Basit bir kimlik doğrulama
      if (email === 'admin@example.com' && password === 'password') {
        console.log('Giriş başarılı, yönlendiriliyor...');
        router.push('/admin');
      } else {
        setError('Geçersiz e-posta veya şifre');
      }
    } catch (error) {
      console.error('Giriş işlemi sırasında hata:', error);
      setError('Bir hata oluştu');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    } py-12 px-4 sm:px-6 lg:px-8`}>
      <ThemeToggle />
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image
              className="h-12 w-auto"
              src="/logo.png"
              alt="Logo"
              width={150}
              height={48}
            />
          </div>
          <h2 className={`text-3xl font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Yönetici Girişi
          </h2>
          <p className={`mt-2 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            QR Menü yönetim paneline erişmek için giriş yapın
          </p>
        </div>
        
        <div className={`${
          isDark ? 'bg-gray-800 shadow-md' : 'bg-white shadow-sm'
        } p-8 rounded-xl`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}>
                E-posta
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none block w-full px-3 py-2.5 border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } rounded-lg shadow-sm focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00] sm:text-sm transition-colors duration-200`}
                placeholder="E-posta adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              } mb-1`}>
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none block w-full px-3 py-2.5 border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } rounded-lg shadow-sm focus:outline-none focus:ring-[#FF4D00] focus:border-[#FF4D00] sm:text-sm transition-colors duration-200`}
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className={`${
                isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-500'
              } text-sm p-3 rounded-lg`}>
                <div className="flex">
                  <svg className={`h-5 w-5 ${
                    isDark ? 'text-red-400' : 'text-red-400'
                  } mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#FF4D00] hover:bg-[#E04400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF4D00] transition-colors duration-200"
              >
                Giriş Yap
              </button>
            </div>
          </form>
        </div>
        
        <div className={`mt-6 text-center text-xs ${
          isDark ? 'text-gray-500' : 'text-gray-500'
        }`}>
          © {new Date().getFullYear()} QR Menü. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
