import { enhancePromptSession, checkProviderStatus } from "@/configs/AiModel";
import Prompt from "@/data/Prompt";
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { prompt, environment = 'react', provider = 'auto' } = await request.json();
        
        // Check provider status
        const providerStatus = await checkProviderStatus();
        console.log('Enhance prompt provider status:', providerStatus);
        
        // Select the appropriate enhancement rules based on environment
        let enhanceRules;
        switch (environment.toLowerCase()) {
            case 'react':
                enhanceRules = Prompt.REACT_ENHANCE_PROMPT_RULES;
                break;
            case 'wordpress':
                enhanceRules = Prompt.WORDPRESS_ENHANCE_PROMPT_RULES;
                break;
            case 'html':
                enhanceRules = Prompt.HTML_ENHANCE_PROMPT_RULES;
                break;
            default:
                enhanceRules = Prompt.ENHANCE_PROMPT_RULES;
        }
        
        const result = await enhancePromptSession.sendMessage([
            enhanceRules,
            `Environment: ${environment.toUpperCase()}`,
            `Preferred Provider: ${provider}`,
            `Original prompt: ${prompt}`
        ]);
        
        const text = result.response.text();
        const usedProvider = result.provider || 'unknown';
        
        return NextResponse.json({
            enhancedPrompt: text.trim(),
            provider: usedProvider
        });
    } catch (error) {
        console.error('Enhance prompt error:', error);
        
        // Get the provider from the error if it's an AIProviderError
        const errorProvider = error.provider || 'unknown';
        
        // Handle quota exceeded errors
        if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
            return NextResponse.json({ 
                error: 'QUOTA_EXCEEDED',
                message: `API quota exceeded for ${errorProvider}. Please try again later.`,
                success: false,
                provider: errorProvider
            }, { status: 429 });
        }
        
        // Handle DeepSeek errors
        if (errorProvider === 'deepseek' || (error.message && error.message.includes('DeepSeek'))) {
            return NextResponse.json({ 
                error: 'DEEPSEEK_ERROR',
                message: 'DeepSeek API error occurred.',
                success: false,
                provider: 'deepseek'
            }, { status: 500 });
        }
        
        // Handle Gemini errors
        if (errorProvider === 'gemini' || (error.message && error.message.includes('GoogleGenerativeAI'))) {
            return NextResponse.json({ 
                error: 'GEMINI_ERROR',
                message: 'Gemini API error occurred.',
                success: false,
                provider: 'gemini'
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            error: error.message,
            success: false,
            provider: errorProvider
        }, { status: 500 });
    }
}