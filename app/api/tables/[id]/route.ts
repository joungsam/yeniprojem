import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Belirli bir masayı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz masa ID' },
        { status: 400 }
      );
    }

    const table = await prisma.$queryRaw`
      SELECT * FROM "Table"
      WHERE "id" = ${id} AND "deletedAt" IS NULL
    `;

    if (!Array.isArray(table) || table.length === 0) {
      return NextResponse.json(
        { error: 'Masa bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(table[0]);
  } catch (error) {
    console.error('Masa getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Masa getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Masayı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz masa ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Güncellenecek alanları kontrol et
    if (!data.name) {
      return NextResponse.json(
        { error: 'Masa adı gereklidir' },
        { status: 400 }
      );
    }

    // Masanın var olup olmadığını kontrol et
    const existingTable = await prisma.$queryRaw`
      SELECT * FROM "Table"
      WHERE "id" = ${id} AND "deletedAt" IS NULL
    `;

    if (!Array.isArray(existingTable) || existingTable.length === 0) {
      return NextResponse.json(
        { error: 'Masa bulunamadı' },
        { status: 404 }
      );
    }

    // Masayı güncelle
    const updatedTable = await prisma.$queryRaw`
      UPDATE "Table"
      SET 
        "name" = ${data.name},
        "order" = ${data.order !== undefined ? data.order : (existingTable[0] as any).order},
        "isActive" = ${data.isActive !== undefined ? data.isActive : (existingTable[0] as any).isActive},
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *
    `;

    return NextResponse.json(Array.isArray(updatedTable) ? updatedTable[0] : updatedTable);
  } catch (error) {
    console.error('Masa güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Masa güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Masayı sil (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Geçersiz masa ID' },
        { status: 400 }
      );
    }

    // Masanın var olup olmadığını kontrol et
    const existingTable = await prisma.$queryRaw`
      SELECT * FROM "Table"
      WHERE "id" = ${id} AND "deletedAt" IS NULL
    `;

    if (!Array.isArray(existingTable) || existingTable.length === 0) {
      return NextResponse.json(
        { error: 'Masa bulunamadı' },
        { status: 404 }
      );
    }

    // Masayı soft delete yap
    await prisma.$queryRaw`
      UPDATE "Table"
      SET 
        "deletedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE "id" = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Masa silinirken hata:', error);
    return NextResponse.json(
      { error: 'Masa silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
