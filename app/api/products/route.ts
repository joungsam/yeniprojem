import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Ürünleri sayfalı şekilde getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    
    // Sayfa ve limit değerlerini kontrol et
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 1000 ? limit : 20; // Limit üst sınırını 1000'e çıkardık
    const skip = (validPage - 1) * validLimit;
    
    // Filtreleme koşulları - sadece silinmemiş ürünleri getir
    const where: any = {
      deletedAt: null
    };
    
    // Kategori filtresi
    if (categoryId === 'uncategorized') {
      where.categoryId = null;
    } else if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId);
    }
    
    // Arama filtresi
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Toplam ürün sayısını al
    const totalItems = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalItems / validLimit);
    
    // Ürünleri getir
    const products = await prisma.product.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: {
        order: 'asc',
      },
      // Use include instead of select to get related category data
      include: {
        category: {
          select: { // Select only the category name
            name: true,
          }
        }
      },
    });
    
    return NextResponse.json({
      products,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalItems,
        totalPages,
      }
    });
  } catch (error) {
    console.error('Ürünler veritabanından alınırken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ürünler veritabanından alınamadı. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}

// Yeni ürün ekle
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Kategori ID'sini al
    const categoryId = data.categoryId ? parseInt(data.categoryId) : null;
    
    // Kategoriye ait en son ürünün sıra numarasını bul
    let whereCondition: any = {
      isActive: true,
      deletedAt: null
    };
    
    if (categoryId !== null) {
      whereCondition.categoryId = categoryId;
    } else {
      whereCondition.categoryId = { equals: null };
    }
    
    const lastProduct = await prisma.product.findFirst({
      where: whereCondition,
      orderBy: {
        order: 'desc'
      }
    });
    
    // Yeni ürünün sıra numarasını belirle (1'den başlayarak)
    const newOrder = lastProduct ? lastProduct.order + 1 : 0;
    
    // Ürünü oluştur
    const product = await prisma.product.create({
      data: {
        ...data,
        order: newOrder
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Ürün veritabanına eklenirken bir hata oluştu:', error);
    return NextResponse.json(
      { error: 'Ürün veritabanına eklenemedi. Lütfen girdiğiniz bilgileri kontrol edin ve tekrar deneyin.' },
      { status: 500 }
    );  
  }
}
