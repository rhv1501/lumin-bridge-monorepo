import { getReviews, sql } from "@luminbridge/db";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const factoryId = searchParams.get('factory_id');
  const productId = searchParams.get('product_id');

  try {
    const reviews = await getReviews({
      factory_id: factoryId ? parseInt(factoryId) : undefined,
      product_id: productId ? parseInt(productId) : undefined,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, product_id, factory_id, buyer_id, rating, comment } = body;

    const [newReview] = await sql`
      INSERT INTO reviews (order_id, product_id, factory_id, buyer_id, rating, comment)
      VALUES (${order_id}, ${product_id}, ${factory_id}, ${buyer_id}, ${rating}, ${comment})
      RETURNING *
    `;

    return NextResponse.json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
