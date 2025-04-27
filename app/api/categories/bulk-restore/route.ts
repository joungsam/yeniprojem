import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { categories } = await request.json();

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Geçersiz kategori listesi' },
        { status: 400 }
      );
    }

    const restoredCategories = await Promise.all(
      categories.map(category =>
        prisma.category.create({
          data: {
            name: category.name,
            icon: category.icon,
            order: category.order
          }
        })
      )
    );

    return NextResponse.json({ success: true, categories: restoredCategories });
  } catch (error) {
    console.error('Kategoriler geri yüklenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Kategoriler geri yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 