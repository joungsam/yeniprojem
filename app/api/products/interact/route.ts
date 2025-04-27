import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, interactionType } = body;

    if (!productId || !interactionType) {
      return NextResponse.json({ error: 'productId and interactionType are required' }, { status: 400 });
    }

    if (interactionType !== 'LIKE' && interactionType !== 'DISLIKE') {
      return NextResponse.json({ error: 'Invalid interactionType. Must be LIKE or DISLIKE' }, { status: 400 });
    }

    // Check if product exists (optional but good practice)
    const productExists = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const interaction = await prisma.productInteraction.create({
      data: {
        productId: Number(productId),
        interactionType: interactionType,
      },
    });

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error('Error creating product interaction:', error);
    // Basic error handling, consider more specific checks
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }
}