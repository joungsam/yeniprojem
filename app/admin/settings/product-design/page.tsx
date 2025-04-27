'use client';

import ProductDesignSettings from "@/app/components/admin/settings/ProductDesignSettings";

export default function ProductDesignSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Ürün Tasarım Ayarları</h1>
      <ProductDesignSettings />
    </div>
  );
}
