
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/prisma/db";

type SaleInput = {
  productId: number;
  quantity: number;
};

class SaleError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}

async function getAuthenticatedUserId(request: NextRequest) {
  const token = request.cookies.get("novatech_session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret || secret.length < 32) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Sesión no autorizada." },
        { status: 401 }
      );
    }

    const sales = await db.orm.public.Sale
      .include("items")
      .orderBy((sale) => sale.id.desc())
      .all();

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error consulting sales:", error);

    return NextResponse.json(
      { error: "No se pudieron consultar las ventas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Sesión no autorizada." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("items" in body) ||
      !Array.isArray(body.items)
    ) {
      throw new SaleError("Debes seleccionar productos.");
    }

    const items: SaleInput[] = [];

    for (const item of body.items) {
      if (
        !item ||
        typeof item !== "object" ||
        !Number.isSafeInteger(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.productId <= 0 ||
        item.quantity <= 0
      ) {
        throw new SaleError(
          "Los productos y cantidades deben ser válidos."
        );
      }

      items.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    if (items.length === 0) {
      throw new SaleError(
        "La venta debe contener al menos un producto."
      );
    }

    if (items.length > 100) {
      throw new SaleError(
        "La venta supera el máximo de productos permitidos."
      );
    }

    const ids = items.map((item) => item.productId);

    if (new Set(ids).size !== ids.length) {
      throw new SaleError(
        "No puedes repetir un producto en la misma venta."
      );
    }

    // Mantener un orden fijo evita bloqueos cruzados
    // cuando se registran ventas simultáneas.
    items.sort((a, b) => a.productId - b.productId);

    const result = await db.transaction(async (tx) => {
      const user = await tx.orm.public.User
        .where({ id: userId })
        .first();

      if (!user) {
        throw new SaleError(
          "El usuario de la sesión no existe.",
          401
        );
      }

      if (user.role !== "ADMIN") {
        throw new SaleError(
          "No tienes permisos para registrar ventas.",
          403
        );
      }

      const selectedProducts: Array<{
        productId: number;
        quantity: number;
        price: number;
      }> = [];

      let total = 0;

      for (const item of items) {
        const product = await tx.orm.public.Product
          .where({ id: item.productId })
          .forUpdate()
          .first();

        if (!product) {
          throw new SaleError(
            `El producto ${item.productId} no existe.`,
            404
          );
        }

        if (product.stock < item.quantity) {
          throw new SaleError(
            `Stock insuficiente para ${product.name}. Disponibles: ${product.stock}.`,
            409
          );
        }

        if (
          !Number.isFinite(product.price) ||
          product.price < 0
        ) {
          throw new SaleError(
            `El precio de ${product.name} no es válido.`
          );
        }

        selectedProducts.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        total += product.price * item.quantity;
      }

      if (!Number.isFinite(total)) {
        throw new SaleError(
          "El total de la venta no es válido."
        );
      }

      const sale = await tx.orm.public.Sale.create({
        userId,
        total,
      });

      for (const item of selectedProducts) {
        await tx.orm.public.SaleItem.create({
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });

        await tx.orm.public.InventoryMovement.create({
          productId: item.productId,
          type: "SALE",
          quantity: -item.quantity,
        });

        const product = await tx.orm.public.Product
          .where({ id: item.productId })
          .first();

        if (!product) {
          throw new SaleError(
            "El producto ya no está disponible.",
            409
          );
        }

        await tx.orm.public.Product
          .where({ id: item.productId })
          .update({
            stock: product.stock - item.quantity,
          });
      }

      return {
        id: sale.id,
        total: sale.total,
        userId,
        items: selectedProducts,
      };
    });

    return NextResponse.json(
      {
        message: "Venta registrada correctamente.",
        sale: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SaleError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "El formato de la solicitud no es válido." },
        { status: 400 }
      );
    }

    console.error("Error registering sale:", error);

    return NextResponse.json(
      { error: "No se pudo registrar la venta." },
      { status: 500 }
    );
  }
}
