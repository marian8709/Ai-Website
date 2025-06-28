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
            
            // Fix escaped characters - replace invalid escape sequences
            // This handles backslashes that aren't part of valid JSON escape sequences
            fixed = fixed.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
            
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
        
        // Step 1: Extract content from markdown if present
        let cleanedResp = extractFromMarkdown(resp);
        
        // Step 2: Extract the main JSON content
        let jsonContent = extractJsonContent(cleanedResp);
        
        if (!jsonContent) {
            console.error('No JSON structure found in AI response:', cleanedResp.substring(0, 200) + '...');
            return NextResponse.json({
                files: {},
                error: 'No valid JSON structure found in AI response',
                rawResponse: resp.substring(0, 500) + '...' // Truncate for debugging
            });
        }
        
        // Step 3: Attempt to parse the extracted JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(jsonContent);
        } catch (parseError) {
            console.log('Initial JSON parse failed, attempting to fix structure...');
            
            // Step 4: Try to fix basic structural issues
            const fixedJson = fixJsonStructure(jsonContent);
            
            try {
                parsedResponse = JSON.parse(fixedJson);
                console.log('Successfully parsed JSON after structural fixes');
            } catch (secondParseError) {
                console.error('Failed to parse JSON even after fixes');
                console.error('Original error:', parseError.message);
                console.error('Second error:', secondParseError.message);
                console.error('Extracted JSON (first 200 chars):', jsonContent.substring(0, 200));
                console.error('Fixed JSON (first 200 chars):', fixedJson.substring(0, 200));
                
                return NextResponse.json({
                    files: {},
                    error: 'Failed to parse AI response as valid JSON',
                    rawResponse: resp.substring(0, 500) + '...',
                    extractedJson: jsonContent.substring(0, 200) + '...',
                    parseError: parseError.message
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