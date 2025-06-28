import { chatSession, checkProviderStatus } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    const {prompt} = await req.json();

    try {
        // Check provider status
        const providerStatus = await checkProviderStatus();
        console.log('Chat provider status:', providerStatus);
        
        // If no providers are available, return error immediately
        if (!providerStatus.activeProvider) {
            return NextResponse.json({
                error: 'NO_PROVIDERS_AVAILABLE',
                message: 'No AI providers are currently available. Please check your API keys.',
                provider: 'none'
            });
        }
        
        const result = await chatSession.sendMessage(prompt);
        const AIResp = result.response.text();
        const usedProvider = result.provider || 'unknown';

        console.log(`Chat response generated using ${usedProvider} provider`);

        return NextResponse.json({
            result: AIResp,
            provider: usedProvider
        });
    } catch(e) {
        console.error('Chat error:', e);
        
        // Get the provider from the error if it's an AIProviderError
        const errorProvider = e.provider || 'unknown';
        
        // Handle quota exceeded errors
        if (e.message && (e.message.includes('429') || e.message.includes('quota') || e.message.includes('exceeded'))) {
            return NextResponse.json({
                error: 'QUOTA_EXCEEDED',
                message: `API quota exceeded for ${errorProvider}. ${errorProvider === 'gemini' ? 'Switching to alternative provider...' : 'Please try again later.'}`,
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
                message: 'Gemini API error occurred. Switching to alternative provider...',
                provider: 'gemini'
            });
        }
        
        return NextResponse.json({
            error: e.message || 'Unknown error occurred',
            provider: errorProvider
        });
    }
}