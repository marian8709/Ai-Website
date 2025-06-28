import { chatSession } from "@/configs/AiModel";
import Prompt from "@/data/Prompt";
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { prompt, environment = 'react' } = await request.json();
        
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
        
        const result = await chatSession.sendMessage([
            enhanceRules,
            `Environment: ${environment.toUpperCase()}`,
            `Original prompt: ${prompt}`
        ]);
        
        const text = result.response.text();
        
        return NextResponse.json({
            enhancedPrompt: text.trim()
        });
    } catch (error) {
        return NextResponse.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
}