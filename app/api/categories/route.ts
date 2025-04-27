import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Tüm kategorileri getir
export async function GET() {
  try {
    // Temporarily simplify the query to fetch only basic category data
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc',
      },
      // Remove include and mapping for testing
      // include: {
      //   products: {
      //     where: {
      //       deletedAt: null
      //     },
      //     select: {
      //       id: true
      //     }
      //   }
      // }
    });

    // // Ürün sayısını ekleyerek kategorileri dönüştür
    // const categoriesWithProductCount = categories.map(category => ({
    //   id: category.id,
    //   name: category.name,
    //   icon: category.icon,
    //   order: category.order,
    //   isActive: category.isActive,
    //   productCount: category.products.length // This would cause an error now
    // }));

    // Return the simplified categories directly
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kategoriler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni kategori oluştur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, icon, order } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Kategori adı gerekli' },
        { status: 400 }
      );
    }

    // Son sıradaki kategoriyi bul ve yeni kategoriyi oluştur - tek transaction'da
    const category = await prisma.$transaction(async (tx) => {
      // Eğer order değeri verilmişse, o değeri kullan
      if (typeof order === 'number') {
        // Mevcut sıralamayı güncelle
        await tx.category.updateMany({
          where: {
            order: {
              gte: order
            },
            deletedAt: null
          },
          data: {
            order: {
              increment: 1
            }
          }
        });

        return tx.category.create({
          data: {
            name,
            icon: icon || null,
            order,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            icon: true,
            order: true,
            isActive: true,
          },
        });
      } else {
        // Order değeri verilmemişse, son sıradaki kategoriyi bul
        const lastCategory = await tx.category.findFirst({
          where: {
            deletedAt: null
          },
          orderBy: {
            order: 'desc',
          },
          select: {
            order: true,
          },
        });

        const newOrder = lastCategory ? lastCategory.order + 1 : 0;

        return tx.category.create({
          data: {
            name,
            icon: icon || null,
            order: newOrder,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            icon: true,
            order: true,
            isActive: true,
          },
        });
      }
    });

    // Cache'i temizle
    revalidatePath('/admin/categories');
    revalidatePath('/');

    return NextResponse.json(category);
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kategori oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
