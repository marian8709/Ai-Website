import { checkProviderStatus } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const status = await checkProviderStatus();
        return NextResponse.json(status);
    } catch (error) {
        console.error('Provider status check error:', error);
        return NextResponse.json({
            gemini: false,
            deepseek: false,
            activeProvider: null,
            error: error.message
        });
    }
}