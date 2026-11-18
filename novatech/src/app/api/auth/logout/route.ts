
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.json({
    message: "Logout successful",
  });

  response.cookies.set("novatech_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
