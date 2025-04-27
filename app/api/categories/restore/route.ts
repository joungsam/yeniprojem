import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CategoryToRestore {
  id?: number;
  name: string;
  icon: string | null;
  order: number;
}

export async function POST(request: Request) {
  try {
    const { categories } = await request.json() as { categories: CategoryToRestore[] };

    // Kategorileri tek tek ekle
    const restoredCategories = [];
    
    // Kategorileri orijinal sıra numaralarıyla geri yükle
    for (const category of categories) {
      // Kategoriyi ekle
      const restoredCategory = await prisma.category.create({
        data: {
          name: category.name,
          icon: category.icon,
          order: category.order, // Orijinal sıra numarasını kullan
          isActive: true,
        }
      });
      
      restoredCategories.push(restoredCategory);
    }

    // Tüm kategorileri yeniden sırala (0'dan başlayarak)
    const allCategories = await prisma.category.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Kategorileri 0'dan başlayarak yeniden sırala
    await prisma.$transaction(
      allCategories.map((cat, index) => 
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
      message: 'Kategoriler başarıyla geri yüklendi',
      restoredCategories
    });
  } catch (error) {
    console.error('Kategoriler geri yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Kategoriler geri yüklenemedi' },
      { status: 500 }
    );
  }
}
