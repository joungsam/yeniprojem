import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const interactionType = searchParams.get('interactionType');
  const sortBy = searchParams.get('sortBy') || 'createdAt'; // Default sort by date
  const sortOrder = searchParams.get('sortOrder') || 'desc'; // Default descending
  const groupBy = searchParams.get('groupBy'); // New parameter for grouping

  // Build WHERE clause for filtering
  const where: Prisma.ProductInteractionWhereInput = {}; // Correct Prisma type usage
  if (productId) {
    // Ensure productId is parsed correctly and handle potential NaN
    const parsedProductId = parseInt(productId, 10);
    if (!isNaN(parsedProductId)) {
       where.productId = parsedProductId;
    }
  }
  if (interactionType === 'LIKE' || interactionType === 'DISLIKE') {
    where.interactionType = interactionType;
  }

  // Build ORDER BY clause for sorting
  const orderBy: Prisma.ProductInteractionOrderByWithRelationInput = {}; // Correct Prisma type usage
  const prismaSortOrder = sortOrder === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc; // Use Prisma.SortOrder enum

  if (sortBy === 'productName') {
    orderBy.product = { name: prismaSortOrder };
  } else { // Default to createdAt
    orderBy.createdAt = prismaSortOrder;
  }


  try {
    // --- Handle Grouping Request ---
    if (groupBy === 'product') {
      const groupedInteractions = await prisma.productInteraction.groupBy({
        by: ['productId', 'interactionType'],
        _count: {
          id: true, // Count interactions
        },
        orderBy: {
          _count: {
            id: 'desc', // Order by interaction count descending
          },
        },
      });

      // Fetch product details for the grouped results
      // Explicitly type 'g' based on Prisma groupBy result structure
      const productIds = groupedInteractions.map((g: { productId: number; interactionType: string; _count: { id: number } }) => g.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, image: true },
      });
      // Explicitly type 'p' and the Map value
      const productMap = new Map<number, { id: number; name: string; image: string | null }>(
         products.map((p: { id: number; name: string; image: string | null }) => [p.id, p])
      );

      // Define the structure for the accumulator and aggregated data
      type AggregatedResult = {
        productId: number;
        productName: string;
        productImage: string | null | undefined;
        likeCount: number;
        dislikeCount: number;
        totalInteractions: number;
      };

      // Combine grouped data with product details
      const aggregatedData = groupedInteractions.reduce((acc: Record<number, AggregatedResult>, group: { productId: number; interactionType: string; _count: { id: number } }) => {
        const productId = group.productId;
        if (!acc[productId]) {
          const product = productMap.get(productId); // Product can be undefined if not found
          acc[productId] = {
            productId: productId,
            productName: product?.name ?? 'Bilinmeyen Ürün', // Use nullish coalescing
            productImage: product?.image, // Access image safely
            likeCount: 0,
            dislikeCount: 0,
            totalInteractions: 0,
          };
        }
        if (group.interactionType === 'LIKE') {
          acc[productId].likeCount = group._count.id;
        } else if (group.interactionType === 'DISLIKE') {
          acc[productId].dislikeCount = group._count.id;
        }
        acc[productId].totalInteractions += group._count.id;
        return acc;
      }, {} as Record<number, { productId: number; productName: string; productImage: string | null | undefined; likeCount: number; dislikeCount: number; totalInteractions: number }>);

      // Convert aggregated data object to an array and sort by total interactions
      const sortedAggregatedData = Object.values(aggregatedData).sort(
        (a: AggregatedResult, b: AggregatedResult) => b.totalInteractions - a.totalInteractions
      );


      return NextResponse.json({ type: 'aggregated', data: sortedAggregatedData });

    } else {
      // --- Handle Standard FindMany Request (Existing Logic) ---
      const interactions = await prisma.productInteraction.findMany({
        where, // Apply filters
        include: {
        product: {
          select: { // Select only necessary product fields
            id: true,
            name: true,
            image: true, // Include image for potential display
          }
        }
      },
      orderBy, // Apply sorting
      // Consider adding pagination for large datasets in the future
      // take: 50,
      // skip: 0,
      });

      return NextResponse.json({ type: 'individual', data: interactions });
    }
  } catch (error) {
    console.error('Error fetching product interactions:', error);
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
  }
}