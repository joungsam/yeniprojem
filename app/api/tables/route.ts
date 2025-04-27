import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tüm masaları getir
export async function GET() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT * FROM "Table"
      WHERE "deletedAt" IS NULL
      ORDER BY "order" ASC
    `;

    return NextResponse.json(tables);
  } catch (error) {
    console.error('Masalar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Masalar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni masa ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Gerekli alanları kontrol et
    if (!data.name) {
      return NextResponse.json(
        { error: 'Masa adı gereklidir' },
        { status: 400 }
      );
    }

    // Mevcut en yüksek sıra numarasını bul
    const highestOrderResult = await prisma.$queryRaw`
      SELECT "order" FROM "Table"
      ORDER BY "order" DESC
      LIMIT 1
    `;
    
    const highestOrder = Array.isArray(highestOrderResult) && highestOrderResult.length > 0 
      ? (highestOrderResult[0] as any).order 
      : 0;
    const newOrder = data.order !== undefined ? data.order : highestOrder + 1;
    const isActive = data.isActive !== undefined ? data.isActive : true;

    // Yeni masa oluştur
    const newTable = await prisma.$queryRaw`
      INSERT INTO "Table" ("name", "order", "isActive", "createdAt", "updatedAt")
      VALUES (${data.name}, ${newOrder}, ${isActive}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json(Array.isArray(newTable) ? newTable[0] : newTable, { status: 201 });
  } catch (error) {
    console.error('Masa eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Masa eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
