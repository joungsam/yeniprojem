import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const productIds = data.productIds || data.ids;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Geçersiz istek formatı' },
        { status: 400 }
      );
    }

    // Silinecek ürünlerin kategori bilgilerini al
    const productsToDelete = await prisma.product.findMany({
      where: {
        id: {
          in: productIds.map((id: string | number) => Number(id))
        }
      },
      select: {
        id: true,
        categoryId: true
      }
    });

    // Etkilenen kategorilerin listesini oluştur
    const affectedCategoryIds = Array.from(new Set(productsToDelete.map(p => p.categoryId)));

    // Ürünleri tamamen silmek yerine soft delete yap (deletedAt alanını güncelle)
    await prisma.product.updateMany({
      where: {
        id: {
          in: productIds.map((id: string | number) => Number(id))
        }
      },
      data: {
        deletedAt: new Date()
      }
    });

    // Her etkilenen kategori için ürünleri yeniden sırala
    for (const categoryId of affectedCategoryIds) {
      // Kategoriye ait aktif ürünleri al
      const categoryProducts = await prisma.product.findMany({
        where: {
          categoryId: categoryId,
          isActive: true,
          deletedAt: null
        },
        orderBy: {
          order: 'asc'
        }
      });

      // Ürünleri 0'dan başlayarak yeniden sırala
      const updates = categoryProducts.map((product, index) => {
        return prisma.product.update({
          where: {
            id: product.id
          },
          data: {
            order: index // Sıra numarası 0'dan başlar
          }
        });
      });

      // Güncellemeleri uygula
      if (updates.length > 0) {
        await prisma.$transaction(updates);
      }
    }

    // Cache'i temizle
    revalidatePath('/admin/products');
    revalidatePath('/api/products');
    revalidatePath('/');

    return NextResponse.json({ 
      success: true,
      message: 'Ürünler silindi ve sıralama güncellendi',
      count: productIds.length
    });
  } catch (error) {
    console.error('Ürünler silinirken hata:', error);
    return NextResponse.json(
      { error: 'Ürünler silinemedi' },
      { status: 500 }
    );
  }
}
