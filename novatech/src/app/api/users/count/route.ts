
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function GET() {
  try {
    const users = await db.orm.public.User.all();

    return NextResponse.json({
      totalUsers: users.length,
      hasAdmin: users.some((user) => user.role === "ADMIN"),
    });
  } catch (error) {
    console.error("Error checking users:", error);

    return NextResponse.json(
      { error: "Could not check users" },
      { status: 500 }
    );
  }
}
