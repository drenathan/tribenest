import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    rootDomain: process.env.ROOT_DOMAIN || process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3001",
    apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  };

  return NextResponse.json(config);
}
