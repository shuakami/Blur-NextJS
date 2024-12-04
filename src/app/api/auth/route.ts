// pages/api/auth.ts
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const auth = getAuth(request);
    const { userId } = auth;

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const token = await auth.getToken();

    return NextResponse.json({ token });
}