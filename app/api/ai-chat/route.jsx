import { chatSession, checkProviderStatus } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt, provider = 'auto'} = await req.json();

    try {
        // Check provider status
        const providerStatus = await checkProviderStatus();
        console.log('Chat provider status:', providerStatus);
        
        const result = await chatSession.sendMessage(prompt);
        const AIResp = result.response.text();
        const usedProvider = result.provider || 'unknown';

        return NextResponse.json({
            result: AIResp,
            provider: usedProvider
        });
    } catch(e) {
        console.error('Chat error:', e);
        
        // Get the provider from the error if it's an AIProviderError
        const errorProvider = e.provider || 'unknown';
        
        // Handle quota exceeded errors
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
            return NextResponse.json({
                error: 'QUOTA_EXCEEDED',
                message: `API quota exceeded for ${errorProvider}. Trying alternative provider...`,
                provider: errorProvider
            });
        }
        
        // Handle DeepSeek errors
        if (errorProvider === 'deepseek' || (e.message && e.message.includes('DeepSeek'))) {
            return NextResponse.json({
                error: 'DEEPSEEK_ERROR',
                message: 'DeepSeek API error occurred.',
                provider: 'deepseek'
            });
        }
        
        // Handle Gemini errors
        if (errorProvider === 'gemini' || (e.message && e.message.includes('GoogleGenerativeAI'))) {
            return NextResponse.json({
                error: 'GEMINI_ERROR',
                message: 'Gemini API error occurred.',
                provider: 'gemini'
            });
        }
        
        return NextResponse.json({
            error: e.message || 'Unknown error occurred',
            provider: errorProvider
        });
    }
}