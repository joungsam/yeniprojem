import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { categoryIds } = await request.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'Geçersiz kategori listesi' },
        { status: 400 }
      );
    }

    // Önce kategorileri ve içerdikleri ürünleri kontrol et
    const categoriesWithProducts = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds
        }
      },
      include: {
        products: {
          where: {
            deletedAt: null // Sadece silinmemiş ürünleri dahil et
          }
        }
      }
    });

    // Ürün içeren kategorileri bul
    const categoriesWithProductsIds = categoriesWithProducts
      .filter(category => category.products.length > 0)
      .map(category => category.id);

    // Eğer ürün içeren kategoriler varsa, silme işlemini engelle
    if (categoriesWithProductsIds.length > 0) {
      const categoriesWithProductsNames = categoriesWithProducts
        .filter(category => category.products.length > 0)
        .map(category => category.name);

      return NextResponse.json(
        { 
          error: `Bazı kategoriler ürün içerdiği için silinemez: ${categoriesWithProductsNames.join(', ')}. Önce bu kategorilerdeki ürünleri silmelisiniz.`,
          categoriesWithProducts: categoriesWithProductsNames
        },
        { status: 400 }
      );
    }

    // Ürün içermeyen kategorileri soft delete yap
    await prisma.$transaction(
      categoryIds.map(id => 
        prisma.category.update({
          where: { id: Number(id) },
          data: {
            deletedAt: new Date(),
            isActive: false
          }
        })
      )
    );

    // Kalan kategorileri yeniden sırala (0'dan başlayarak)
    const remainingCategories = await prisma.category.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Kategorileri 0'dan başlayarak yeniden sırala
    await prisma.$transaction(
      remainingCategories.map((cat, index) => 
        prisma.category.update({
          where: { id: cat.id },
          data: { order: index }
        })
      )
    );

    // Cache'i temizle
    revalidatePath('/admin/categories');
    revalidatePath('/api/categories');
    revalidatePath('/');

    return NextResponse.json({ 
      success: true,
      message: 'Kategoriler başarıyla silindi'
    });
  } catch (error) {
    console.error('Kategoriler silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kategoriler silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
