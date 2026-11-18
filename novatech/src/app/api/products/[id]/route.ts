
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const categoryName =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

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

    const existingProduct = await db.orm.public.Product
      .where({ id: productId })
      .first();

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct = await db.transaction(async (tx) => {
      let category = await tx.orm.public.Category
        .where({ name: categoryName })
        .first();

      if (!category) {
        category = await tx.orm.public.Category.create({
          name: categoryName,
        });
      }

      await tx.orm.public.Product
        .where({ id: productId })
        .update({
          name,
          price,
          stock,
          categoryId: category.id,
        });

      return tx.orm.public.Product
        .where({ id: productId })
        .first();
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);

    return NextResponse.json(
      { error: "Could not update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const existingProduct = await db.orm.public.Product
      .where({ id: productId })
      .first();

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Product
      .where({ id: productId })
      .delete();

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    return NextResponse.json(
      { error: "Could not delete product" },
      { status: 500 }
    );
  }
}
