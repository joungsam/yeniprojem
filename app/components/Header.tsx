'use client';

import Image from 'next/image';
import { Fragment, useState, useEffect } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import MobileCategories from './MobileCategories';
import { useSettingsStore } from '@/app/store/settingsStore';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { appearance, general } = useSettingsStore();
  
  // İstemci tarafında bileşen monte edildikten sonra mounted değerini true yap
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Ayarlar değiştiğinde yeniden render et
  const [key, setKey] = useState(0);
  useEffect(() => {
    // Ayarlar değiştiğinde key'i değiştirerek Image bileşeninin yeniden render edilmesini sağla
    setKey(prev => prev + 1);
  }, [appearance, general]);
  
  // Doğrudan store'dan gelen değerleri kullan
  const logoUrl = appearance.logoUrl || '/logo.png';
  const logoWidth = appearance.logoWidth || 100;
  const logoHeight = appearance.logoHeight || 100;
  const showLogo = appearance.showLogo;
  const restaurantName = general.restaurantName || 'Cafe Barcelona';
  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showLogo ? (
              <div 
                className="flex items-center justify-center md:max-h-[100px] max-h-[60px] md:max-w-[200px] max-w-[150px]"
                style={{
                  height: mounted ? Math.min(logoHeight, 100) + 'px' : '60px',
                  width: mounted ? Math.min(logoWidth, 200) + 'px' : '150px'
                }}
              >
                <Image
                  key={key}
                  src={logoUrl}
                  alt={restaurantName}
                  width={logoWidth}
                  height={logoHeight}
                  style={{ 
                    width: 'auto', 
                    height: 'auto', 
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                  priority
                  unoptimized
                />
              </div>
            ) : (
              <span className="text-lg font-bold">{restaurantName}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className={`md:hidden fixed top-1.5 right-20 z-[60] ${isMobileMenuOpen ? 'hidden' : ''}`}>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    TR
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            TR
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            EN
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {/* Mobil Menü Butonu - Sadece mobil görünümde */}
            <div className={`md:hidden fixed top-1.5 right-4 z-[60] ${isMobileMenuOpen ? 'hidden' : ''}`}>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                aria-label="İletişim Bilgileri"
              >
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            <div className="hidden md:block">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    TR
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            TR
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm'
                            )}
                          >
                            EN
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobil Menü */}
      <MobileCategories
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
