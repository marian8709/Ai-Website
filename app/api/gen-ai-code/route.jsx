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
        
        // Attempt to parse JSON with better error handling
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(resp);
        } catch (parseError) {
            console.error('JSON parsing failed. Raw AI response:', resp);
            console.error('Parse error:', parseError.message);
            
            // Try to fix common JSON issues
            let fixedResp = resp;
            
            // Fix unterminated strings by finding and closing them
            const stringMatches = fixedResp.match(/"[^"]*$/gm);
            if (stringMatches) {
                fixedResp = fixedResp + '"';
            }
            
            // Try to fix missing closing braces/brackets
            const openBraces = (fixedResp.match(/{/g) || []).length;
            const closeBraces = (fixedResp.match(/}/g) || []).length;
            const openBrackets = (fixedResp.match(/\[/g) || []).length;
            const closeBrackets = (fixedResp.match(/\]/g) || []).length;
            
            // Add missing closing braces
            for (let i = 0; i < openBraces - closeBraces; i++) {
                fixedResp += '}';
            }
            
            // Add missing closing brackets
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
                fixedResp += ']';
            }
            
            try {
                parsedResponse = JSON.parse(fixedResp);
                console.log('Successfully fixed and parsed JSON');
            } catch (secondParseError) {
                console.error('Failed to fix JSON. Returning fallback response.');
                // Return a fallback response structure
                return NextResponse.json({
                    files: {},
                    error: 'Failed to parse AI response as valid JSON',
                    rawResponse: resp.substring(0, 500) + '...' // Truncate for logging
                });
            }
        }
        
        return NextResponse.json(parsedResponse);
    } catch (e) {
        console.error('Code generation error:', e);
        return NextResponse.json({ 
            error: e.message,
            files: {} // Ensure files property exists even on error
        });
    }
}