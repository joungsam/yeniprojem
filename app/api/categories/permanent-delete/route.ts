import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { categories } = await request.json();

    // Kategorileri kalıcı olarak sil
    await prisma.category.deleteMany({
      where: {
        id: {
          in: categories.map((category: any) => category.id)
        }
      }
    });

    // Cache'i temizle
    revalidatePath('/admin/categories');
    revalidatePath('/api/categories');
    revalidatePath('/');

    return NextResponse.json({ message: "Categories permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting categories:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete categories" },
      { status: 500 }
    );
  }
} 