
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/prisma/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get("novatech_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret || secret.length < 32) {
    return false;
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    return true;
  } catch {
    return false;
  }
}

function getCategoryId(value: string) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

// PATCH: editar una categoría
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Sesión no autorizada." },
      { status: 401 }
    );
  }

  const { id: rawId } = await context.params;
  const id = getCategoryId(rawId);

  if (id === null) {
    return NextResponse.json(
      { error: "Identificador inválido." },
      { status: 400 }
    );
  }

  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      typeof body.name !== "string"
    ) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 }
      );
    }

    const name = body.name.trim();

    if (!name || name.length > 100) {
      return NextResponse.json(
        {
          error: "El nombre debe tener entre 1 y 100 caracteres.",
        },
        { status: 400 }
      );
    }

    const category = await db.orm.public.Category
      .where({ id })
      .first();

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    const duplicate = await db.orm.public.Category
      .where({ name })
      .first();

    if (duplicate && duplicate.id !== id) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre." },
        { status: 409 }
      );
    }

    const updated = await db.orm.public.Category
      .where({ id })
      .update({ name });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar la categoría." },
      { status: 500 }
    );
  }
}

// DELETE: eliminar una categoría
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Sesión no autorizada." },
      { status: 401 }
    );
  }

  const { id: rawId } = await context.params;
  const id = getCategoryId(rawId);

  if (id === null) {
    return NextResponse.json(
      { error: "Identificador inválido." },
      { status: 400 }
    );
  }

  try {
    const category = await db.orm.public.Category
      .where({ id })
      .first();

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada." },
        { status: 404 }
      );
    }

    const products = await db.orm.public.Product
      .where({ categoryId: id })
      .all();

    if (products.length > 0) {
      return NextResponse.json(
        {
          error:
            "No puedes eliminar una categoría que tiene productos asociados.",
        },
        { status: 409 }
      );
    }

    await db.orm.public.Category
      .where({ id })
      .delete();

    return NextResponse.json({
      message: "Categoría eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    return NextResponse.json(
      { error: "No se pudo eliminar la categoría." },
      { status: 500 }
    );
  }
}
