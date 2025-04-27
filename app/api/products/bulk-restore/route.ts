import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Products must be an array' }, { status: 400 });
    }

    // Bulk create all products in a single database operation
    await prisma.product.createMany({
      data: products.map(({ id, createdAt, updatedAt, ...product }) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        categoryId: product.categoryId,
        isActive: product.isActive ?? true,
        order: product.order ?? 0
      }))
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk restore error:', error);
    return NextResponse.json({ error: 'Failed to restore products' }, { status: 500 });
  }
} 