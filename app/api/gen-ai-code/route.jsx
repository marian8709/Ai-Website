import { NextResponse } from "next/server";
import { GenAiCode, checkProviderStatus } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req){
    const { prompt, environment = 'react', provider = 'auto' } = await req.json();
    
    try {
        // Check provider status
        const providerStatus = await checkProviderStatus();
        console.log('Provider status:', providerStatus);
        
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
        
        const fullPrompt = `${prompt}\n\n${codeGenPrompt}\n\nPreferred Provider: ${provider}`;
        const result = await GenAiCode.sendMessage(fullPrompt);
        let resp = result.response.text();
        const usedProvider = result.provider || 'unknown';
        
        // Function to extract JSON from markdown code blocks
        function extractFromMarkdown(text) {
            // Remove markdown code block delimiters
            if (text.startsWith('```json') && text.endsWith('```')) {
                return text.slice(7, -3).trim();
            } else if (text.startsWith('```') && text.endsWith('```')) {
                return text.slice(3, -3).trim();
            }
            return text;
        }
        
        // Function to extract the main JSON object/array from text
        function extractJsonContent(text) {
            // Find the first opening brace or bracket
            const firstBrace = text.indexOf('{');
            const firstBracket = text.indexOf('[');
            
            let startPos = -1;
            let startChar = '';
            let endChar = '';
            
            // Determine which comes first and set the corresponding end character
            if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                startPos = firstBrace;
                startChar = '{';
                endChar = '}';
            } else if (firstBracket !== -1) {
                startPos = firstBracket;
                startChar = '[';
                endChar = ']';
            }
            
            if (startPos === -1) {
                return null; // No JSON structure found
            }
            
            // Find the matching closing brace/bracket
            let depth = 0;
            let endPos = -1;
            let inString = false;
            let escapeNext = false;
            
            for (let i = startPos; i < text.length; i++) {
                const char = text[i];
                
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                
                if (char === '"' && !escapeNext) {
                    inString = !inString;
                    continue;
                }
                
                if (!inString) {
                    if (char === startChar) {
                        depth++;
                    } else if (char === endChar) {
                        depth--;
                        if (depth === 0) {
                            endPos = i;
                            break;
                        }
                    }
                }
            }
            
            if (endPos !== -1) {
                return text.substring(startPos, endPos + 1);
            }
            
            return null;
        }
        
        // Function to fix basic JSON structural issues
        function fixJsonStructure(jsonStr) {
            let fixed = jsonStr.trim();
            
            // Count opening and closing braces/brackets
            const openBraces = (fixed.match(/{/g) || []).length;
            const closeBraces = (fixed.match(/}/g) || []).length;
            const openBrackets = (fixed.match(/\[/g) || []).length;
            const closeBrackets = (fixed.match(/\]/g) || []).length;
            
            // Add missing closing braces
            for (let i = 0; i < openBraces - closeBraces; i++) {
                fixed += '}';
            }
            
            // Add missing closing brackets
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
                fixed += ']';
            }
            
            return fixed;
        }
        
        // Simplified function to clean problematic characters
        function escapeProblematicJsonChars(jsonStr) {
            // Remove or replace control characters (ASCII 0x00-0x1F) except valid JSON whitespace
            // Valid JSON whitespace: space (0x20), tab (0x09), newline (0x0A), carriage return (0x0D)
            let result = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            
            // Fix backslashes that are not part of valid JSON escape sequences
            // This regex matches backslashes that are NOT followed by valid JSON escape characters
            result = result.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
            
            return result;
        }
        
        // Step 1: Extract content from markdown if present
        let cleanedResp = extractFromMarkdown(resp);
        
        // Step 2: Extract the main JSON content
        let jsonContent = extractJsonContent(cleanedResp);
        
        if (!jsonContent) {
            console.error('No JSON structure found in AI response:', cleanedResp.substring(0, 200) + '...');
            return NextResponse.json({
                files: {},
                error: 'No valid JSON structure found in AI response',
                rawResponse: resp.substring(0, 500) + '...',
                provider: usedProvider
            });
        }
        
        // Step 3: Clean problematic characters before parsing
        let cleanedJsonContent = escapeProblematicJsonChars(jsonContent);
        
        // Step 4: Attempt to parse the cleaned JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedJsonContent);
        } catch (parseError) {
            console.log('Initial JSON parse failed, attempting to fix structure...');
            
            // Step 5: Try to fix basic structural issues and re-clean
            const fixedJson = fixJsonStructure(jsonContent);
            const cleanedFixedJson = escapeProblematicJsonChars(fixedJson);
            
            try {
                parsedResponse = JSON.parse(cleanedFixedJson);
                console.log('Successfully parsed JSON after structural fixes and cleaning');
            } catch (secondParseError) {
                console.error('Failed to parse JSON even after fixes and cleaning');
                console.error('Original error:', parseError.message);
                console.error('Second error:', secondParseError.message);
                console.error('Extracted JSON (first 200 chars):', jsonContent.substring(0, 200));
                console.error('Cleaned JSON (first 200 chars):', cleanedJsonContent.substring(0, 200));
                console.error('Fixed and cleaned JSON (first 200 chars):', cleanedFixedJson.substring(0, 200));
                
                return NextResponse.json({
                    files: {},
                    error: 'Failed to parse AI response as valid JSON',
                    rawResponse: resp.substring(0, 500) + '...',
                    extractedJson: jsonContent.substring(0, 200) + '...',
                    parseError: parseError.message,
                    secondParseError: secondParseError.message,
                    provider: usedProvider
                });
            }
        }
        
        // Add provider info to response
        parsedResponse.provider = usedProvider;
        
        return NextResponse.json(parsedResponse);
    } catch (e) {
        console.error('Code generation error:', e);
        
        // Get the provider from the error if it's an AIProviderError
        const errorProvider = e.provider || 'unknown';
        
        // Handle specific Google AI API errors
        if (e.message && e.message.includes('429')) {
            return NextResponse.json({ 
                error: 'QUOTA_EXCEEDED',
                message: `Daily API quota exceeded for ${errorProvider}. Please try again tomorrow or upgrade your plan.`,
                details: errorProvider === 'gemini' 
                    ? 'You have reached the daily limit of 50 requests for the Gemini API free tier.'
                    : 'API quota exceeded for the current provider.',
                files: {},
                quotaExceeded: true,
                provider: errorProvider
            });
        }
        
        if (e.message && e.message.includes('quota')) {
            return NextResponse.json({ 
                error: 'QUOTA_EXCEEDED',
                message: `API quota exceeded for ${errorProvider}. Please check your billing details or try again later.`,
                details: e.message,
                files: {},
                quotaExceeded: true,
                provider: errorProvider
            });
        }
        
        // Handle DeepSeek specific errors
        if (errorProvider === 'deepseek' || (e.message && e.message.includes('DeepSeek'))) {
            return NextResponse.json({ 
                error: 'DEEPSEEK_ERROR',
                message: 'DeepSeek API error occurred.',
                details: e.message,
                files: {},
                provider: 'deepseek'
            });
        }
        
        // Handle Gemini specific errors
        if (errorProvider === 'gemini' || (e.message && e.message.includes('GoogleGenerativeAI'))) {
            return NextResponse.json({ 
                error: 'GEMINI_ERROR',
                message: 'Gemini API error occurred.',
                details: e.message,
                files: {},
                provider: 'gemini'
            });
        }
        
        return NextResponse.json({ 
            error: e.message,
            files: {},
            provider: errorProvider
        });
    }
}