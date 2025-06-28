import { NextResponse } from "next/server";
import { GenAiCode } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req){
    const { prompt, environment = 'react' } = await req.json();
    
    try {
        // Select the appropriate code generation prompt based on environment
        let codeGenPrompt;
        switch (environment.toLowerCase()) {
            case 'react':
                codeGenPrompt = Prompt.REACT_CODE_GEN_PROMPT;
                break;
            case 'wordpress':
                codeGenPrompt = Prompt.WORDPRESS_CODE_GEN_PROMPT;
                break;
            case 'html':
                codeGenPrompt = Prompt.HTML_CODE_GEN_PROMPT;
                break;
            default:
                codeGenPrompt = Prompt.CODE_GEN_PROMPT; // fallback to React
        }
        
        const fullPrompt = `${prompt}\n\n${codeGenPrompt}`;
        const result = await GenAiCode.sendMessage(fullPrompt);
        let resp = result.response.text();
        
        // Strip markdown code block delimiters if present
        if (resp.startsWith('```json') && resp.endsWith('```')) {
            resp = resp.slice(7, -3).trim();
        } else if (resp.startsWith('```') && resp.endsWith('```')) {
            // Handle cases where it might just be ``` without json
            resp = resp.slice(3, -3).trim();
        }
        
        return NextResponse.json(JSON.parse(resp));
    } catch (e) {
        console.error('Code generation error:', e);
        return NextResponse.json({ error: e.message });
    }
}