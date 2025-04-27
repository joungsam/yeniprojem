import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const productIds = data.productIds || data.ids;

    if (!Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Geçersiz istek formatı' },
        { status: 400 }
      );
    }

    // Ürünleri kalıcı olarak sil
    await prisma.product.deleteMany({
      where: {
        id: {
          in: productIds.map((id: string | number) => Number(id))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ürünler kalıcı olarak silinirken hata:', error);
    return NextResponse.json(
      { error: 'Ürünler kalıcı olarak silinemedi' },
      { status: 500 }
    );
  }
} 