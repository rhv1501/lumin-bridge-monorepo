import { sql } from "@luminbridge/db";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products, factory_id } = body;

    if (!Array.isArray(products) || !factory_id) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const results = [];
    for (const product of products) {
      const { name, description, specifications, factory_price_cny, category, status } = product;
      const [newProduct] = await sql`
        INSERT INTO products (name, description, specifications, factory_price_cny, factory_id, category, status)
        VALUES (${name}, ${description}, ${specifications}, ${factory_price_cny}, ${factory_id}, ${category}, ${status || 'draft'})
        RETURNING id
      `;
      results.push(newProduct);
    }

    return NextResponse.json({ count: results.length, success: true });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });
  }
}
