import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import path from 'path';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Ürün güncelle
export async function PUT(request: Request) {
  try {
    const id = parseInt(request.url.split('/').pop() || '');
    const data = await request.json();

    // Önce ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Kategori değiştiyse, yeni kategorinin sıra numarasını al
    let categoryOrder = existingProduct.order;
    
    if (data.categoryId && data.categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: Number(data.categoryId) },
        select: { order: true }
      });
      
      if (category) {
        categoryOrder = category.order;
      }
    }

    // Veri doğrulama ve temizleme
    const updateData = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      categoryId: Number(data.categoryId),
      image: data.image,
      isActive: data.isActive ?? true,
      order: categoryOrder // Kategori sıra numarasını kullan
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Ürün güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenemedi' },
      { status: 500 }
    );
  }
}

// Ürün silme fonksiyonu
async function deleteImageFile(base64String: string) {
  try {
    // Base64 stringi data:image formatında ise
    if (base64String.startsWith('data:image')) {
      // Dosyayı kaydettiğimiz timestamp'i bul
      const timestamp = Date.now();
      const filePath = path.join(process.cwd(), 'public', 'images', 'upload', `${timestamp}`);
      
      // Tüm olası uzantıları kontrol et
      const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
      for (const ext of extensions) {
        const fullPath = `${filePath}${ext}`;
        if (existsSync(fullPath)) {
          await unlink(fullPath);
          console.log('Resim silindi:', fullPath);
          break;
        }
      }
    }
    // URL formatında ise (/images/upload/timestamp.ext)
    else if (base64String.includes('/images/upload/')) {
      const fileName = base64String.split('/').pop(); // örn: "1234567890.jpg"
      if (!fileName) return;

      const filePath = path.join(process.cwd(), 'public', 'images', 'upload', fileName);
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log('Resim silindi:', filePath);
      }
    }
  } catch (error) {
    console.error('Resim dosyası silinirken hata:', error);
  }
}

// Ürün sil
export async function DELETE(request: Request) {
  try {
    const id = parseInt(request.url.split('/').pop() || '');

    // Önce ürünün var olup olmadığını kontrol et
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Eğer ürünün resmi varsa, dosyayı sil
    if (existingProduct.image) {
      await deleteImageFile(existingProduct.image);
    }

    // Ürünü soft delete yap (tamamen silmek yerine deletedAt alanını güncelle)
    const product = await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    // Silinen ürünün kategorisindeki tüm ürünleri yeniden sırala
    const categoryProducts = await prisma.product.findMany({
      where: {
        categoryId: existingProduct.categoryId,
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

    return NextResponse.json(product);
  } catch (error) {
    console.error('Ürün silinirken hata:', error);
    return NextResponse.json(
      { error: 'Ürün silinemedi' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const id = parseInt(request.url.split('/').pop() || '');
    const product = await prisma.product.findUnique({
      where: { 
        id,
        deletedAt: null
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
