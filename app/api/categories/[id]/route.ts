import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Geçersiz kategori ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: {
            deletedAt: null // Sadece silinmemiş ürünleri dahil et
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Kategori detay hatası:', error);
    return NextResponse.json(
      { error: 'Kategori bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kategori güncelle
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);
    const data = await request.json();

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Geçersiz kategori ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        icon: data.icon,
        order: data.order
      }
    });

    // Cache'i temizle
    revalidatePath('/admin/categories');
    revalidatePath('/api/categories');
    revalidatePath('/');

    return NextResponse.json(category, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Kategori sil (soft delete)
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Geçersiz kategori ID' },
        { status: 400 }
      );
    }

    // Önce kategoriye ait ürünleri kontrol et
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { 
        products: {
          where: {
            deletedAt: null // Sadece silinmemiş ürünleri dahil et
          }
        }
      }
    });

    if (!categoryWithProducts) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer kategoride ürün varsa silme işlemini engelle
    if (categoryWithProducts.products.length > 0) {
      return NextResponse.json(
        { error: 'Bu kategori ürün içerdiği için silinemez. Önce kategorideki ürünleri silmelisiniz.' },
        { status: 400 }
      );
    }

    // Silinecek kategorinin sıra numarasını al
    const categoryToDelete = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!categoryToDelete) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    // Kategoriyi güncelle (soft delete)
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });

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

    return NextResponse.json(
      { message: 'Kategori başarıyla silindi' },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
