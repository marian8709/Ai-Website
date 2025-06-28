import { chatSession, checkProviderStatus } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt} = await req.json();

    try {
        // Check provider status
        const providerStatus = await checkProviderStatus();
        console.log('Chat provider status:', providerStatus);
        
        const result = await chatSession.sendMessage(prompt);
        const AIResp = result.response.text();

        return NextResponse.json({
            result: AIResp,
            provider: providerStatus.activeProvider
        });
    } catch(e) {
        console.error('Chat error:', e);
        
        // Handle quota exceeded errors
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            return NextResponse.json({
                error: 'QUOTA_EXCEEDED',
                message: 'API quota exceeded. Trying alternative provider...',
                provider: 'gemini'
            });
        }
        
        // Handle DeepSeek errors
        if (e.message && e.message.includes('DeepSeek')) {
            return NextResponse.json({
                error: 'DEEPSEEK_ERROR',
                message: 'DeepSeek API error occurred.',
                provider: 'deepseek'
            });
        }
        
        return NextResponse.json({
            error: e.message || 'Unknown error occurred',
            provider: 'unknown'
        });
    }
}