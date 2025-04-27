import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ReorderItem {
  id: number;
  order: number;
  categoryId: number | null;
}

export async function PUT(request: Request) {
  try {
    const { products } = await request.json();

    // Önce kategorileri al
    const categoryIds = Array.from(new Set(products.map((p: any) => p.categoryId).filter(Boolean)));
    
    // Kategorilerin sıra numaralarını al
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds as number[] } },
      select: { id: true, order: true }
    });
    
    // Kategori ID'den sıra numarasına eşleştirme yap
    const categoryOrderMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.order;
      return acc;
    }, {} as Record<number, number>);
    
    // Ürünleri kategori sıra numarasına göre güncelle
    const updates = products.map((product: any) => {
      const categoryId = product.categoryId;
      const categoryOrder = categoryId ? (categoryOrderMap[categoryId] || 0) : 0;
      
      return prisma.product.update({
        where: { id: product.id },
        data: { order: categoryOrder }, // Kategori sıra numarasını kullan
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ürünler sıralanırken hata:', error);
    return NextResponse.json(
      { error: 'Ürünler sıralanamadı' },
      { status: 500 }
    );
  }
}
