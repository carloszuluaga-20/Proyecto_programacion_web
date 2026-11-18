
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function GET() {
  try {
    const categories = await db.orm.public.Category.all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);

    return NextResponse.json(
      { error: "Could not fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "Category name cannot exceed 100 characters",
        },
        { status: 400 }
      );
    }

    const categories = await db.orm.public.Category.all();

    const exists = categories.some(
      (category) =>
        category.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { error: "This category already exists" },
        { status: 409 }
      );
    }

    const category = await db.orm.public.Category.create({
      name,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    return NextResponse.json(
      { error: "Could not create category" },
      { status: 500 }
    );
  }
}
