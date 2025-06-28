import { NextResponse } from "next/server";
import { GenAiCode, checkProviderStatus } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req){
    const { prompt, environment = 'react' } = await req.json();
    
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
        
        const fullPrompt = `${prompt}\n\n${codeGenPrompt}`;
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
            
            // Fix malformed content immediately after opening braces/brackets
            // Remove leading commas, colons, or other invalid characters after { or [
            fixed = fixed.replace(/(\{)\s*[,:;]+\s*/g, '$1');
            fixed = fixed.replace(/(\[)\s*[,:;]+\s*/g, '$1');
            
            // Fix malformed content immediately before closing braces/brackets
            // Remove trailing commas, colons, or other invalid characters before } or ]
            fixed = fixed.replace(/\s*[,:;]+\s*(\})/g, '$1');
            fixed = fixed.replace(/\s*[,:;]+\s*(\])/g, '$1');
            
            // Remove any duplicate commas
            fixed = fixed.replace(/,\s*,+/g, ',');
            
            // Fix missing commas between properties (basic case)
            fixed = fixed.replace(/"\s*"([^:])/g, '", "$1');
            
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
        
        // Function to escape problematic JSON characters using regex
        function escapeProblematicJsonChars(jsonStr) {
            // First, handle control characters (ASCII 0x00-0x1F) by converting them to Unicode escapes
            let result = jsonStr.replace(/[\x00-\x1F]/g, function(match) {
                const code = match.charCodeAt(0);
                return '\\u' + code.toString(16).padStart(4, '0');
            });
            
            // Then handle backslashes that are not part of valid JSON escape sequences
            // This regex matches backslashes that are NOT followed by valid JSON escape characters
            result = result.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
            
            // Handle unescaped quotes within string values using a more robust approach
            // This regex finds and escapes quotes that are not already escaped
            // It uses negative lookbehind to avoid double-escaping
            result = result.replace(/(?<!\\)"/g, function(match, offset, string) {
                // Check if we're at the start/end of the string or if this is a structural quote
                if (offset === 0 || offset === string.length - 1) {
                    return match; // Keep structural quotes
                }
                
                // Look for patterns that indicate this is a structural quote (property names, etc.)
                const beforeChar = string[offset - 1];
                const afterChar = string[offset + 1];
                
                // If preceded by { or , or : and followed by : or } or ,, it's likely structural
                if ((beforeChar === '{' || beforeChar === ',' || beforeChar === ':' || beforeChar === '[') ||
                    (afterChar === ':' || afterChar === '}' || afterChar === ',' || afterChar === ']')) {
                    return match; // Keep structural quotes
                }
                
                // Otherwise, escape it
                return '\\"';
            });
            
            return result;
        }
        
        // Function to quote unquoted property names in JSON
        function quoteUnquotedKeys(jsonStr) {
            let result = jsonStr;
            
            // Pattern to match unquoted keys followed by a colon
            // This regex looks for word characters (letters, numbers, underscore) that are not already quoted
            // and are followed by optional whitespace and a colon
            const unquotedKeyPattern = /(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
            
            result = result.replace(unquotedKeyPattern, function(match, prefix, key) {
                return `${prefix}"${key}":`;
            });
            
            // Also handle cases where there might be spaces around the key
            const unquotedKeyWithSpacesPattern = /(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$\s]*[a-zA-Z0-9_$])\s*:/g;
            
            result = result.replace(unquotedKeyWithSpacesPattern, function(match, prefix, key) {
                // Only quote if the key doesn't already have quotes
                if (!key.includes('"')) {
                    return `${prefix}"${key.trim()}":`;
                }
                return match;
            });
            
            // Handle edge case where the first property doesn't have a comma before it
            const firstUnquotedKeyPattern = /^\s*\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/;
            result = result.replace(firstUnquotedKeyPattern, function(match, key) {
                return `{"${key}":`;
            });
            
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
        
        // Step 3: Fix basic structural issues first
        let fixedJsonContent = fixJsonStructure(jsonContent);
        
        // Step 4: Escape problematic characters after fixing structure
        let escapedJsonContent = escapeProblematicJsonChars(fixedJsonContent);
        
        // Step 5: Quote unquoted keys
        let quotedJsonContent = quoteUnquotedKeys(escapedJsonContent);
        
        // Step 6: Attempt to parse the fixed and escaped JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(quotedJsonContent);
        } catch (parseError) {
            console.log('Initial JSON parse failed, attempting additional fixes...');
            
            // Step 7: Try more aggressive fixes if the first attempt fails
            let aggressivelyFixed = fixedJsonContent;
            
            // Remove any non-printable characters that might be causing issues
            aggressivelyFixed = aggressivelyFixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
            
            // Try to fix common JSON syntax errors
            aggressivelyFixed = aggressivelyFixed.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
            aggressivelyFixed = aggressivelyFixed.replace(/([}\]])(\s*)(["\w])/g, '$1,$2$3'); // Add missing commas between objects
            
            const reEscapedJson = escapeProblematicJsonChars(aggressivelyFixed);
            const reQuotedJson = quoteUnquotedKeys(reEscapedJson);
            
            try {
                parsedResponse = JSON.parse(reQuotedJson);
                console.log('Successfully parsed JSON after aggressive fixes and escaping');
            } catch (secondParseError) {
                console.error('Failed to parse JSON even after aggressive fixes and escaping');
                console.error('Original error:', parseError.message);
                console.error('Second error:', secondParseError.message);
                console.error('Original JSON (first 200 chars):', jsonContent.substring(0, 200));
                console.error('Fixed JSON (first 200 chars):', fixedJsonContent.substring(0, 200));
                console.error('Escaped JSON (first 200 chars):', escapedJsonContent.substring(0, 200));
                console.error('Quoted JSON (first 200 chars):', quotedJsonContent.substring(0, 200));
                
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