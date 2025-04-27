import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ProductToRestore {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: number;
  order: number;
}

export async function POST(request: Request) {
  try {
    const { products } = await request.json() as { products: ProductToRestore[] };

    // Ürün ID'lerini al
    const productIds = products.map(p => p.id);
    
    // Önce ürünleri geri yükle
    await Promise.all(
      products.map(async (product) => {
        return prisma.product.update({
          where: {
            id: product.id
          },
          data: {
            deletedAt: null
          }
        });
      })
    );

    // Tüm kategorileri al
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    // Her kategori için ürünleri yeniden sırala
    for (const category of categories) {
      // Kategoriye ait aktif ürünleri al
      const categoryProducts = await prisma.product.findMany({
        where: {
          categoryId: category.id,
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
      await prisma.$transaction(updates);
    }

    // Cache'i temizle
    revalidatePath('/admin/products');
    revalidatePath('/api/products');
    revalidatePath('/');

    return NextResponse.json({ 
      message: 'Products restored and reordered successfully',
      count: productIds.length
    });
  } catch (error) {
    console.error('Error restoring products:', error);
    return NextResponse.json(
      { error: 'Failed to restore products' },
      { status: 500 }
    );
  }
}
