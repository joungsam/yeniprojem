'use client';

import { useEffect } from 'react';
// No longer need shallow import
import { Toast } from './components/ui/toast';
import Providers from "./components/Providers";
import DynamicHead from './components/DynamicHead';
import { useSettingsStore } from './store/settingsStore'; // SettingsState import might not be needed now

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Select each value individually to avoid object reference issues
  const fontFamily = useSettingsStore((state) => state.appearance.fontFamily);
  const primaryColor = useSettingsStore((state) => state.appearance.primaryColor);
  const secondaryColor = useSettingsStore((state) => state.appearance.secondaryColor);

  useEffect(() => {
    // Ensure this runs only on the client and documentElement exists
    if (typeof window !== 'undefined' && document.documentElement) {
      const rootStyle = document.documentElement.style;

      // Update font family
      if (fontFamily) {
        rootStyle.setProperty('--font-family', `${fontFamily}, sans-serif`);
        // console.log(`Updated --font-family CSS variable: ${fontFamily}`); // Debug log
      } else {
        rootStyle.removeProperty('--font-family');
        // console.log('Font family missing, removed --font-family CSS variable.'); // Debug log
      }

      // Update primary color
      if (primaryColor) {
        rootStyle.setProperty('--primary-color', primaryColor);
        // console.log(`Updated --primary-color CSS variable: ${primaryColor}`); // Debug log
      } else {
        rootStyle.removeProperty('--primary-color');
        // console.log('Primary color missing, removed --primary-color CSS variable.'); // Debug log
      }
      
      // Update secondary color
      if (secondaryColor) {
        rootStyle.setProperty('--secondary-color', secondaryColor);
        // console.log(`Updated --secondary-color CSS variable: ${secondaryColor}`); // Debug log
      } else {
        rootStyle.removeProperty('--secondary-color');
        // console.log('Secondary color missing, removed --secondary-color CSS variable.'); // Debug log
      }
    }
  }, [fontFamily, primaryColor, secondaryColor]); // Re-run effect when any of these change

  return (
    <>
      <DynamicHead />
      <Providers>{children}</Providers>
      <Toast />
    </>
  );
}
