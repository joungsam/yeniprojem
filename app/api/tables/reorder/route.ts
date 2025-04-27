import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Masaları yeniden sırala
export async function POST() {
  try {
    // Tüm aktif masaları sıralı şekilde al
    const tables = await prisma.$queryRaw`
      SELECT * FROM "Table"
      WHERE "deletedAt" IS NULL
      ORDER BY "order" ASC, "id" ASC
    `;

    if (!Array.isArray(tables)) {
      return NextResponse.json(
        { error: 'Masalar alınırken bir hata oluştu' },
        { status: 500 }
      );
    }

    // Her masayı sırayla güncelle (1'den başlayarak)
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i] as any;
      const newOrder = i + 1; // 1'den başlayan sıra

      await prisma.$queryRaw`
        UPDATE "Table"
        SET 
          "order" = ${newOrder},
          "updatedAt" = NOW()
        WHERE "id" = ${table.id}
      `;
    }

    // Güncellenmiş masaları getir
    const updatedTables = await prisma.$queryRaw`
      SELECT * FROM "Table"
      WHERE "deletedAt" IS NULL
      ORDER BY "order" ASC
    `;

    return NextResponse.json(updatedTables);
  } catch (error) {
    console.error('Masalar yeniden sıralanırken hata:', error);
    return NextResponse.json(
      { error: 'Masalar yeniden sıralanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
