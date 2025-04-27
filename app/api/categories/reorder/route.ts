import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const { categories } = await request.json();

    // Tüm kategorileri tek bir transaction içinde güncelle
    await prisma.$transaction(
      categories.map((category: any) =>
        prisma.category.update({
          where: { id: category.id },
          data: { order: category.order }
        })
      )
    );

    return NextResponse.json({ message: 'Kategoriler başarıyla güncellendi' });
  } catch (error) {
    console.error('Kategori sıralaması güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Kategoriler güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 