
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function GET() {
  try {
    const products = await db.orm.public.Product.all();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Could not fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const categoryName =
      typeof body.category === "string" ? body.category.trim() : "";
    const price = body.price;
    const stock = body.stock;

    if (
      !name ||
      !categoryName ||
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isSafeInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        { error: "Invalid product data" },
        { status: 400 }
      );
    }

    const product = await db.transaction(async (tx) => {
      let category = await tx.orm.public.Category
        .where({ name: categoryName })
        .first();

      if (!category) {
        category = await tx.orm.public.Category.create({
          name: categoryName,
        });
      }

      return tx.orm.public.Product.create({
        name,
        price,
        stock,
        categoryId: category.id,
      });
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Could not create product" },
      { status: 500 }
    );
  }
}
