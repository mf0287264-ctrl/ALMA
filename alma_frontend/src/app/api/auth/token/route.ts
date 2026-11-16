import { NextResponse } from "next/server";
import { getMyToken } from "@/utils/getMyToken";

export async function GET() {
  try {
    const token = await getMyToken();
    if (!token) {
      return NextResponse.json({ token: null }, { status: 401 });
    }
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ token: null, error: "Failed to get token" }, { status: 500 });
  }
}
