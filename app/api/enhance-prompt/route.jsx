import { enhancePromptSession, checkProviderStatus } from "@/configs/AiModel";
import Prompt from "@/data/Prompt";
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { prompt, environment = 'react' } = await request.json();
        
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
            `Original prompt: ${prompt}`
        ]);
        
        const text = result.response.text();
        
        return NextResponse.json({
            enhancedPrompt: text.trim(),
            provider: providerStatus.activeProvider
        });
    } catch (error) {
        console.error('Enhance prompt error:', error);
        
        // Handle quota exceeded errors
        if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
            return NextResponse.json({ 
                error: 'QUOTA_EXCEEDED',
                message: 'API quota exceeded. Please try again later.',
                success: false,
                provider: 'gemini'
            }, { status: 429 });
        }
        
        // Handle DeepSeek errors
        if (error.message && error.message.includes('DeepSeek')) {
            return NextResponse.json({ 
                error: 'DEEPSEEK_ERROR',
                message: 'DeepSeek API error occurred.',
                success: false,
                provider: 'deepseek'
            }, { status: 500 });
        }
        
        return NextResponse.json({ 
            error: error.message,
            success: false,
            provider: 'unknown'
        }, { status: 500 });
    }
}